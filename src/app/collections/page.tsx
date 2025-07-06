"use client";

import CollectionCard from "@/components/CollectionCard";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/config/constants";
import { CollectionSchema } from "@/types/database/models";
import { Collection } from "@/types/view/models";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CollectionsPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollections = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.COLLECTIONS);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch collections");
        }
        
        const data = await response.json();
        
        // Ensure data is an array before processing
        if (Array.isArray(data)) {
          setCollections(
            data.map((collection: CollectionSchema) => ({
              id: collection.id,
              name: collection.name,
              description: collection.description,
              isPublic: collection.is_public,
              userId: collection.user_id,
              createdAt: collection.created_at,
              updatedAt: collection.updated_at,
              recipes: []
            }))
          );
        } else {
          console.warn("Collections API returned non-array data:", data);
          setCollections([]);
        }
      } catch (error: any) {
        console.error("Error fetching collections:", error);
        setCollections([]); // Set empty array on error
        toast({
          title: "Error",
          description: error.message || "Failed to load collections",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [user, toast]);

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-4">
            Please sign in to view and manage your collections.
          </p>
          <Button onClick={() => window.location.href = "/auth?mode=login"}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-lg font-bold">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="font-bold text-2xl mb-4">Collections</h1>
      <Button variant="default" className="mb-4" onClick={() => window.location.href = "/collections/create"}>
        + Create Collection
      </Button>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
          ></CollectionCard>
        ))}
      </div>
    </div>
  );
};

export default CollectionsPage;
