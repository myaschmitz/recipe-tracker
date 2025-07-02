"use client";

import RecipeCard from "@/components/RecipeCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipeSchema, CollectionRecipeSchema } from "@/types/database/models";
import { Recipe, RecipeBasicCard, Collection } from "@/types/view/models";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { setTheme } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const response = await fetch("/api/recipes?limit=3");
      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching /api/recipes?limit=3");
        return;
      }

      // Fetch collection data for these recipes
      const collectionRecipeResponse = await fetch("/api/collection-recipes");
      const collectionRecipeData = await collectionRecipeResponse.json();
      const collectionResponse = await fetch("/api/collections");
      const collectionData = await collectionResponse.json();

      const formattedCollections = collectionData.map((d: Collection) => {
        return { id: d.id, name: d.name, description: d.description, createdAt: d.createdAt, updatedAt: d.updatedAt };
      });

      const collectionRecipesMap = collectionRecipeData.map((d: CollectionRecipeSchema) => {
        return { collection_id: d.collection_id, recipe_id: d.recipe_id };
      });

      // Fetch tags for each recipe
      const recipesWithTagsAndCollections = await Promise.all(
        data.map(async (recipe: RecipeBasicCard) => {
          // Fetch tags for this recipe
          const tagsResponse = await fetch(`/api/tags/${recipe.id}`);
          const tagsData = tagsResponse.ok ? await tagsResponse.json() : [];

          // Find collections for this recipe
          const recipeCollectionRelations = collectionRecipesMap.filter(
            (relation: CollectionRecipeSchema) => relation.recipe_id === recipe.id
          );

          const recipeCollections = recipeCollectionRelations
            .map((relation: CollectionRecipeSchema) => {
              return formattedCollections.find((collection: Collection) => collection.id === relation.collection_id);
            })
            .filter(Boolean);

          return {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            tags: tagsData || [],
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
    };

    fetchRecipes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">Recently added recipes</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
    </div>
  );
}
