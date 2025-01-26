"use client";

import RecipeCard from "@/components/RecipeCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipeSchema } from "@/types/database/models";
import { Recipe, RecipeBasicCard } from "@/types/view/models";
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
      }

      setRecipes(
        data.map((recipe: RecipeBasicCard) => ({
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          tags: [],
          ingredients: {},
        }))
      );
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
