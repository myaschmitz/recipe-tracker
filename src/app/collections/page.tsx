"use client";

import CollectionCard from "@/components/CollectionCard";
import { CollectionSchema } from "@/types/database/models";
import { Collection } from "@/types/view/models";
import { useState, useEffect } from "react";

const CollectionsPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        console.log("here");
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch collections");
        }
        const data = await response.json();
        setCollections(
          data.map((collection: CollectionSchema) => ({
            id: collection.id,
            name: collection.name,
            description: collection.description,
          }))
        );
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  if (!collections) {
    return (
      <div className="container mx-auto p-4 text-lg font-bold">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="font-bold text-2xl">Collections</h1>
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
