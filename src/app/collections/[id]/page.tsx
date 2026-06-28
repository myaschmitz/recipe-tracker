"use client";

import RecipeCard from "@/components/RecipeCard";
import { Collection, Recipe } from "@/types/view/models";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CollectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id?.toString();
  const [collection, setCollection] = useState<Collection>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteCollection = async () => {
    if (!id) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error deleting collection: ${response.statusText}`);
      }

      // Close the dialog and redirect to the collections page after deletion
      setIsDeleteDialogOpen(false);
      router.push("/collections");
    } catch (error) {
      console.error(error);
      alert("Failed to delete collection. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        {/* Back button skeleton */}
        <div className="mb-4">
          <Skeleton className="h-6 w-36" />
        </div>
        
        {/* Title and action buttons skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-4" />
        </div>
        
        {/* Description skeleton */}
        <div className="mb-4">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Recipes section skeleton */}
        <div className="mt-4">
          <Skeleton className="h-6 w-16 mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2 mb-3">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">{formatName(collection?.name)}</h1>
        <a
          href={`/collections/${id}/edit`}
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
              <Trash2 className="" size={16} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Collection</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{collection?.name}&quot;? This action cannot be undone.
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
                onClick={handleDeleteCollection}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Collection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-gray-600">{collection?.description}</p>
      <div>
        <h2 className="text-xl font-semibold mt-4">Recipes</h2>
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
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
