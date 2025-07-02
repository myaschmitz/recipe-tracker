"use client";

import { Recipe } from "@/types/view/models";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RecipeIngredient, Tag, Collection } from "@/types/view/models";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, Pencil, X, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import parse from "html-react-parser";
import { CollectionRecipeSchema } from "@/types/database/models";

const RecipePage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id?.toString();
  const [recipe, setRecipe] = useState<Recipe>();
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

      const fetchCollectionRecipes = async (recipeId: string) => {
        try {
          // First get all collection-recipe relationships
          const collectionRecipeResponse = await fetch(`/api/collection-recipes`);
          
          if (!collectionRecipeResponse.ok) {
            throw new Error(
              `Error fetching collection recipes: ${collectionRecipeResponse.statusText}`
            );
          }

          const allCollectionRecipes = await collectionRecipeResponse.json();
          
          // Filter for this specific recipe
          const recipeCollectionIds = allCollectionRecipes
            .filter((cr: CollectionRecipeSchema) => cr.recipe_id === parseInt(recipeId))
            .map((cr: CollectionRecipeSchema) => cr.collection_id);

          if (recipeCollectionIds.length === 0) {
            setCollections([]);
            return;
          }

          // Get all collections
          const collectionsResponse = await fetch(`/api/collections`);
          
          if (!collectionsResponse.ok) {
            throw new Error(
              `Error fetching collections: ${collectionsResponse.statusText}`
            );
          }

          const allCollections = await collectionsResponse.json();
          
          // Filter to only collections this recipe belongs to
          const recipeCollections = allCollections.filter((collection: Collection) => 
            recipeCollectionIds.includes(collection.id)
          );

          setCollections(recipeCollections);
        } catch (error) {
          console.error("Error fetching recipe collections:", error);
          setCollections([]);
        }
      };

      fetchRecipe();
      fetchIngredients(id);
      fetchTags(id);
      fetchCollectionRecipes(id);
    }
  }, [id]);

  const handleDeleteRecipe = async () => {
    if (!id) {
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

      // Close the dialog and redirect to the recipes page after deletion
      setIsDeleteDialogOpen(false);
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
      <div className="mb-4">
        <button
          onClick={() => router.push("/recipes")}
          className="flex items-center gap-2 hover:text-primary transition-all"
        >
          <ArrowLeft />
          Back to recipes
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">{recipe.name}</h1>
        <a
          href={`/recipes/${id}/edit`}
          className="hover:text-primary transition-all"
        >
          <Pencil className="p-1" size={24} />
        </a>
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="hover:text-red-700 transition-all"
              disabled={isDeleting}
            >
              <X className="" size={24} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Recipe</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteRecipe}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Recipe"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="my-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id}>{tag.name}</Badge>
        ))}
      </div>
      
      {collections.length > 0 && (
        <div className="my-4">
          <h3 className="font-semibold text-sm text-gray-600 mb-2">Collections:</h3>
          <div className="flex flex-wrap gap-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => router.push(`/collections/${collection.id}`)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>
      )}
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
      <div className="my-4">
        {/* <div className="text-lg">{parse(recipe.notes)}</div> */}
      </div>
    </div>
  );
};

export default RecipePage;
