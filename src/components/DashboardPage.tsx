"use client";

import RecipeCard from "@/components/RecipeCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_ENDPOINTS, LIMITS } from "@/config/constants";
import { CollectionRecipeSchema } from "@/types/database/models";
import { Recipe, RecipeCard as RecipeCardType, Collection } from "@/types/view/models";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.RECIPES}?limit=${LIMITS.DASHBOARD_RECENT_RECIPES}`);
        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching /api/recipes?limit=3");
          return;
        }

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error("Recipes data is not an array");
          setRecipes([]);
          return;
        }

        // Fetch collection data for these recipes
        const collectionRecipeResponse = await fetch(API_ENDPOINTS.COLLECTION_RECIPES);
        const collectionRecipeData = await collectionRecipeResponse.json();
        const collectionResponse = await fetch(API_ENDPOINTS.COLLECTIONS);
        const collectionData = await collectionResponse.json();

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

        const collectionRecipesMap = Array.isArray(collectionRecipeData) ? collectionRecipeData.map((d: CollectionRecipeSchema) => {
          return { collection_id: d.collection_id, recipe_id: d.recipe_id };
        }) : [];

        // Fetch tags for each recipe
        const recipesWithTagsAndCollections = await Promise.all(
          data.map(async (recipe: RecipeCardType) => {
            // Fetch tags for this recipe
            const tagsResponse = await fetch(`/api/tags/${recipe.id}`);
            const tagsData = tagsResponse.ok ? await tagsResponse.json() : [];

            // Find collections for this recipe
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
              tags: Array.isArray(tagsData) ? tagsData : [],
              ingredients: [], // Empty for basic card
              collections: recipeCollections,
              // Required fields for Recipe type
              createdAt: recipe.createdAt || '',
              updatedAt: recipe.updatedAt || '',
              instructions: '',
            };
          })
        );

        setRecipes(recipesWithTagsAndCollections);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setRecipes([]);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s cooking in your kitchen</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recently added recipes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Create Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Add a new recipe to your collection</p>
              <Link href="/recipes/create" className="inline-flex items-center text-sm text-primary hover:underline">
                Get started →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Browse Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Explore all your recipes</p>
              <Link href="/recipes" className="inline-flex items-center text-sm text-primary hover:underline">
                View all →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Organize recipes by theme</p>
              <Link href="/collections" className="inline-flex items-center text-sm text-primary hover:underline">
                Manage →
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Customize your experience</p>
              <Link href="/settings" className="inline-flex items-center text-sm text-primary hover:underline">
                Configure →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
