"use client";

import { Recipe } from "@/types/view/models";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RecipeIngredient, Tag } from "@/types/view/models";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import parse from "html-react-parser";

const RecipePage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id?.toString();
  const [recipe, setRecipe] = useState<Recipe>();
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteRecipe = async () => {
    if (
      !id ||
      !window.confirm("Are you sure you want to delete this recipe?")
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error deleting recipe: ${response.statusText}`);
      }

      // Redirect to the recipes page after deletion
      router.push("/recipes");
    } catch (error) {
      console.error(error);
      alert("Failed to delete recipe. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!recipe) {
    return (
      <div className="container mx-auto p-4 text-lg font-bold">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto px-12">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">{recipe.name}</h1>
        <a
          href={`/recipes/${id}/edit`}
          className="hover:text-primary transition-all"
        >
          <Pencil className="p-1" size={24} />
        </a>
        <button
          className="hover:text-red-700 transition-all"
          onClick={handleDeleteRecipe}
          disabled={isDeleting}
          // TODO: Add are you sure? modal and also a loading spinner
        >
          <X className="" size={24} />
        </button>
      </div>
      <div className="my-4">
        {tags.map((tag) => (
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
      <div className="text-lg">{parse(recipe.instructions)}</div>
    </div>
  );
};

export default RecipePage;
