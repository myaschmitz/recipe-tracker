"use client";

import { Collection } from "@/types/view/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CollectionPage = () => {
  const params = useParams();
  const id = params.id?.toString();
  const [collection, setCollection] = useState<Collection>();

  useEffect(() => {
    const fetchCollection = async () => {
      if (id) {
        const response = await fetch(`/api/collections/${id}`);
        const data = await response.json();
        setCollection(data);
        if (!response.ok) {
          console.error("Error fetching collection.");
        }
      }
    };

    fetchCollection();
  }, [id]);

  const formatName = (text?: string) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{formatName(collection?.name)}</h1>
    </div>
  );
};

export default CollectionPage;
