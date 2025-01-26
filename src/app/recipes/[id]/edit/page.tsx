import { Recipe, RecipeIngredient, Tag } from "@/types/view/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const EditRecipePage = () => {
  const params = useParams();
  const id = params.id?.toString();
  const [recipe, setRecipe] = useState<Recipe>();
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

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

      const fetchTags = async () => {
        const response = await fetch("/api/tags");
        const data = await response.json();

        if (response.ok) {
          const formattedTags = data.map((d: Tag) => {
            return { id: d.id, name: d.name };
          });

          setTags(formattedTags);
        } else {
          console.error(`Error fetching tags: ${data.error}`);
        }
      };

      fetchRecipe();
      fetchIngredients(id);
      fetchTags();
    }
  }, [id]);

  return (
    <div>
      <h1 className="font-bold text-xl">Edit Recipe</h1>
    </div>
  );
};

export default EditRecipePage;
function setTags(formattedTags: any) {
  throw new Error("Function not implemented.");
}
