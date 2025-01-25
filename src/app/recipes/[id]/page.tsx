"use client";

import { Recipe } from "@/types/view/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const RecipePage = () => {
  const params = useParams();
  const id = params.id;
  const [recipe, setRecipe] = useState<Recipe>();
  console.log(id);

  useEffect(() => {
    if (id) {
      fetch(`/api/recipes/${id}`)
        .then((response) => response.json())
        .then((data) => setRecipe(data))
        .catch((error) => console.error("Error fetching recipe:", error));
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
      <p>{recipe.description}</p>
      {/* <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul> */}
      <h2>Instructions</h2>
      <p>{recipe.instructions}</p>
    </div>
  );
};

export default RecipePage;
