"use client";

import { Recipe } from "@/types/view/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RecipeIngredient, Tag } from "@/types/view/models";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import parse from "html-react-parser";

const RecipePage = () => {
  const params = useParams();
  const id = params.id?.toString();
  const [recipe, setRecipe] = useState<Recipe>();
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        const response = await fetch(`/api/recipes/${id}`);
        const data = await response.json();

        setRecipe(data);

        if (!response.ok) {
          console.error("Error fetching /api/ingedients/[recipeId].");
        }
      };

      const fetchIngredients = async (recipeId: string) => {
        try {
          const response = await fetch(`/api/ingredients/${recipeId}`);
          if (!response.ok) {
            throw new Error(
              `Error fetching ingredients with recipeId ${recipeId}: ${response.statusText}`
            );
          }

          const ingredients = await response.json();
          setIngredients(ingredients);
          return ingredients;
        } catch (error) {
          console.error(error);
        }
      };

      const fetchTags = async (recipeId: string) => {
        const response = await fetch(`/api/tags/${recipeId}`);

        if (!response.ok) {
          throw new Error(`Error fetching tags: ${response.statusText}`);
        }

        const data = await response.json();
        const formattedTags = data.map((d: Tag) => {
          return { id: d.id, name: d.name };
        });

        setTags(formattedTags);
      };

      fetchRecipe();
      fetchIngredients(id);
      fetchTags(id);
    }
  }, [id]);

  if (!recipe) {
    return (
      <div className="container mx-auto p-4 text-lg font-bold">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{recipe.name}</h1>
      <div className="my-4">
        {tags.map((tag, index) => (
          <Badge key={tag.id}>{tag.name}</Badge>
        ))}
      </div>
      <Card>
        <CardHeader>{recipe.description}</CardHeader>
        {/* <CardContent></CardContent> */}
      </Card>
      <div className="my-4">
        <h2 className="font-bold text-lg">Ingredients</h2>
        <ul className="list-disc list-inside">
          {ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.amount} {ingredient.name}
            </li>
          ))}
        </ul>
      </div>
      <h2 className="font-bold text-lg">Instructions</h2>
      <div>{parse(recipe.instructions)}</div>
    </div>
  );
};

export default RecipePage;
