"use client";

import { API_ENDPOINTS } from "@/config/constants";
import { Recipe, RecipeTag, Tag, Collection } from "@/types/view/models";
import { RecipeSchema, RecipeTagSchema, CollectionRecipeSchema } from "@/types/database/models";
import React, { useState, useEffect } from "react";
import RecipeCard from "@/components/RecipeCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CollectionMultiSelect from "@/components/CollectionMultiSelect";
import { useRouter, useSearchParams } from "next/navigation";

const Recipes = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [recipeQuery, setRecipeQuery] = useState<string>('');
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update URL with current filter state
  const updateURL = (query: string, collections: Collection[]) => {
    const params = new URLSearchParams();
    
    if (query.trim()) {
      params.set('search', query);
    }
    
    if (collections.length > 0) {
      params.set('collections', collections.map(c => c.id.toString()).join(','));
    }
    
    const paramString = params.toString();
    const newUrl = paramString ? `/recipes?${paramString}` : '/recipes';
    
    // Update URL without triggering a page reload
    router.replace(newUrl);
  };

  // Initialize filters from URL parameters
  const initializeFiltersFromURL = (allCollections: Collection[]) => {
    if (filtersInitialized) return; // Prevent duplicate initialization
    
    const searchQuery = searchParams.get('search') || '';
    const collectionIds = searchParams.get('collections');
    
    setRecipeQuery(searchQuery);
    
    if (collectionIds && allCollections.length > 0) {
      const ids = collectionIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      const collections = allCollections.filter(c => ids.includes(c.id));
      setSelectedCollections(collections);
    }
    
    setFiltersInitialized(true);
  };

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setRecipeQuery(value);
    if (filtersInitialized) {
      updateURL(value, selectedCollections);
    }
  };

  // Handle collection selection changes
  const handleCollectionChange = (collections: Collection[]) => {
    setSelectedCollections(collections);
    if (filtersInitialized) {
      updateURL(recipeQuery, collections);
    }
  };

  useEffect(() => {
    // TODO: create structure that's based off of tags in database
    // so it doesn't need to make a request to the database every time

    const fetchData = async () => {
      try {
        const recipeResponse = await fetch(API_ENDPOINTS.RECIPES);
        const recipeData = await recipeResponse.json();
        const recipeTagResponse = await fetch(API_ENDPOINTS.RECIPE_TAGS);
        const recipeTagData = await recipeTagResponse.json();
        const tagResponse = await fetch(API_ENDPOINTS.TAGS);
        const tagData = await tagResponse.json();
        const collectionRecipeResponse = await fetch(API_ENDPOINTS.COLLECTION_RECIPES);
        const collectionRecipeData = await collectionRecipeResponse.json();
        const collectionResponse = await fetch(API_ENDPOINTS.COLLECTIONS);
        const collectionData = await collectionResponse.json();

        // Ensure all data is arrays before calling .map()
        const formattedTags = Array.isArray(tagData) ? tagData.map((d: Tag) => {
          return { id: d.id, name: d.name };
        }) : [];

        const formattedCollections = Array.isArray(collectionData) ? collectionData.map((d: Collection) => {
          return { 
            id: d.id, 
            name: d.name, 
            description: d.description, 
            createdAt: d.createdAt, 
            updatedAt: d.updatedAt,
            isPublic: d.isPublic || false,
            userId: d.userId || '',
            recipes: []
          };
        }) : [];
        
        // Store all collections for URL initialization
        setAllCollections(formattedCollections);

        if (!tagResponse.ok) {
          console.error(`Error fetching tags`);
        }

        if (!recipeResponse.ok) {
          console.error("Error fetching recipes.");
        }

        if (!recipeTagResponse.ok) {
          console.error(`Error fetching recipe tags`);
        }

        if (!collectionRecipeResponse.ok) {
          console.error(`Error fetching collection recipes`);
        }

        if (!collectionResponse.ok) {
          console.error(`Error fetching collections`);
        }

        // Ensure recipe data is an array
        if (!Array.isArray(recipeData)) {
          console.error("Recipe data is not an array");
          setRecipes([]);
          return;
        }

        const recipeTagsMap = Array.isArray(recipeTagData) ? recipeTagData.map((d: RecipeTagSchema) => {
          return { tag_id: d.tag_id, recipe_id: d.recipe_id };
        }) : [];

        const collectionRecipesMap = Array.isArray(collectionRecipeData) ? collectionRecipeData.map((d: CollectionRecipeSchema) => {
          return { collection_id: d.collection_id, recipe_id: d.recipe_id };
        }) : [];

        setRecipes(
          recipeData.map((recipe: RecipeSchema) => {
            const recipeTagRelations = recipeTagsMap.filter(
              (relation) => relation.recipe_id === recipe.id
            );

            const recipeTags = recipeTagRelations
              .map((relation) => {
                // Find the full tag object using the tag_id from the relation
                return formattedTags.find((tag: Tag) => tag.id === relation.tag_id);
              })
              .filter(Boolean) as Tag[];

            const recipeCollectionRelations = collectionRecipesMap.filter(
              (relation) => relation.recipe_id === recipe.id
            );

            const recipeCollections = recipeCollectionRelations
              .map((relation) => {
                return formattedCollections.find((collection) => collection.id === relation.collection_id);
              })
              .filter(Boolean) as Collection[];

            return {
              id: recipe.id,
              name: recipe.name,
              description: recipe.description,
              instructions: recipe.instructions || '',
              createdAt: recipe.created_at,
              updatedAt: recipe.updated_at,
              ingredients: [], // This would need to be fetched separately if needed
              tags: recipeTags,
              collections: recipeCollections,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize filters from URL when component mounts or collections change
  useEffect(() => {
    if (allCollections.length > 0 && !filtersInitialized) {
      initializeFiltersFromURL(allCollections);
    }
  }, [allCollections, filtersInitialized, searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Recipes</h1>
        <div className="mb-4">
          <Skeleton className="h-10 w-full max-w-md mb-2" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div>Filters: </div>
            <Skeleton className="h-9 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(recipeQuery.toLowerCase()) &&
    (selectedCollections.length === 0 || recipe.collections?.some(collection => 
      selectedCollections.some(selected => selected.id === collection.id)
    ))
  );

  // if (filteredRecipes.length === 0) {
  //   return (
  //     <div className="container mx-auto p-4 text-lg font-bold">No recipes found</div>
  //   );
  // }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1>
      <div className="mb-4">
        <Input
          className="w-full max-w-md mb-2"
          type="text"
          placeholder="Search recipes..."
          value={recipeQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <div>Filters: </div>
          <CollectionMultiSelect
          selectedCollections={selectedCollections}
          onCollectionChange={handleCollectionChange}
          allowCreate={false}
          userOnly={false}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!isLoading && filteredRecipes.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-lg font-bold">
            No recipes found matching your criteria.
          </div>
        ) : (filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        )))}
      </div>
    </div>
  );
};

export default Recipes;
