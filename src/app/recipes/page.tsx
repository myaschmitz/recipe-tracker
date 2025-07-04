"use client";

import { Recipe, RecipeTag, Tag, Collection } from "@/types/view/models";
import { RecipeSchema, RecipeTagSchema, CollectionRecipeSchema } from "@/types/database/models";
import React, { useState, useEffect } from "react";
import RecipeCard from "@/components/RecipeCard";

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    // TODO: create structure that's based off of tags in database
    // so it doesn't need to make a request to the database every time

    const fetchData = async () => {
      try {
        const recipeResponse = await fetch("/api/recipes");
        const recipeData = await recipeResponse.json();
        const recipeTagResponse = await fetch("/api/recipe-tags");
        const recipeTagData = await recipeTagResponse.json();
        const tagResponse = await fetch("/api/tags");
        const tagData = await tagResponse.json();
        const collectionRecipeResponse = await fetch("/api/collection-recipes");
        const collectionRecipeData = await collectionRecipeResponse.json();
        const collectionResponse = await fetch("/api/collections");
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
      }
    };

    fetchData();
  }, []);

  if (!recipes) {
    return (
      <div className="container mx-auto p-4 text-lg font-bold">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes</h1>
      <div className="mb-4">
        {/* <Accordion type="single" collapsible>
          <AccordionItem value="recipe-quick-access">
            <AccordionTrigger>Recipe quick access table</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Collections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell>
                        <a
                          href={`/recipes/${recipe.id}`}
                          key={recipe.id}
                          className="hover:underline"
                        >
                          {recipe.name}
                        </a>
                      </TableCell>
                      <TableCell>{recipe.description}</TableCell>
                      <TableCell>
                      {recipe.ingredients
                        .map(
                          (ingredient) =>
                            `${ingredient.name} (${ingredient.amount} ${
                              units.find(
                                (unit) => unit.id === ingredient.unit.id
                              )?.name || ""
                            })`
                        )
                        .join(", ")}
                    </TableCell>
                    <TableCell>{recipe.instructions}</TableCell>
                    <TableCell>
                      {recipe.tags
                        .map(
                          (tag) => `${tags.find((t) => t.id === tag.id)?.name}`
                        )
                        .join(", ")}
                    </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion> */}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Recipes;
