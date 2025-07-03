"use client";

import RecipeCard from "@/components/RecipeCard";
import { Collection, Recipe } from "@/types/view/models";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CollectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id?.toString();
  const [collection, setCollection] = useState<Collection>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.error("No collection ID provided.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch collection and collection_recipes in parallel
        const [collectionResponse, recipesResponse] = await Promise.all([
          fetch(`/api/collections/${id}`),
          fetch(`/api/collection-recipes/${id}`)
        ]);

        if (!recipesResponse.ok) {
          console.error("Error fetching collection_recipes.");
        }
        if (!collectionResponse.ok) {
          console.error("Error fetching collection.");
        }

        const recipesData = await recipesResponse.json();
        const collectionData = await collectionResponse.json();

        setCollection(collectionData);
        setRecipes(recipesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatName = (text?: string) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-lg font-bold">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={() => router.push("/collections")}
          className="flex items-center gap-2 hover:text-primary transition-all"
        >
          <ArrowLeft />
          Back to collections
        </button>
      </div>
      <h1 className="text-2xl font-bold">{formatName(collection?.name)}</h1>
      <p className="text-gray-600">{collection?.description}</p>
      <div>
        <h2 className="text-xl font-semibold mt-4">Recipes</h2>
        {recipes.length > 0 ? (
          <div className="flex flex-wrap flex-col gap-4 mt-4">
            {recipes.map((recipe: Recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
              />
            ))}
          </div>
        ) : (
          <p>No recipes found in this collection.</p>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
