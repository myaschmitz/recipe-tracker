"use client";

import React, { useState, useEffect } from "react";
import { Collection } from "@/types/view/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Check, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface CollectionMultiSelectProps {
  selectedCollections: Collection[];
  onCollectionChange: (collections: Collection[]) => void;
}

const CollectionMultiSelect = ({
  selectedCollections,
  onCollectionChange,
}: CollectionMultiSelectProps) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        const data = await response.json();

        if (response.ok) {
          setCollections(data);
        } else {
          console.error(`Error fetching collections: ${data.error}`);
          toast({
            title: "Error fetching collections",
            description: data.error || "Unknown error",
          });
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast({
          title: "Error fetching collections",
          description: "Failed to load collections",
        });
      }
    };

    fetchCollections();
  }, [toast]);

  const handleCollectionSelect = (collection: Collection) => {
    const isSelected = selectedCollections.some((c) => c.id === collection.id);
    
    if (isSelected) {
      // Remove collection
      const updatedCollections = selectedCollections.filter(
        (c) => c.id !== collection.id
      );
      onCollectionChange(updatedCollections);
    } else {
      // Add collection
      const updatedCollections = [...selectedCollections, collection];
      onCollectionChange(updatedCollections);
    }
  };

  const handleRemoveCollection = (collectionId: number) => {
    const updatedCollections = selectedCollections.filter(
      (c) => c.id !== collectionId
    );
    onCollectionChange(updatedCollections);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Collection name required",
        description: "Please enter a name for the collection",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newCollection = data[0]; // API returns array
        setCollections([...collections, newCollection]);
        
        // Automatically select the new collection
        const updatedCollections = [...selectedCollections, newCollection];
        onCollectionChange(updatedCollections);
        
        // Reset form
        setNewCollectionName("");
        setIsCreating(false);
        
        toast({
          title: "Collection created successfully",
          description: `"${newCollection.name}" has been created and added to your recipe`,
        });
      } else {
        console.error(`Error creating collection: ${data.error}`);
        toast({
          title: "Error creating collection",
          description: data.error || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error creating collection",
        description: "Failed to create collection",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateCollection();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewCollectionName("");
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedCollections.length === 0
              ? "Select collections..."
              : `${selectedCollections.length} collection(s) selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Search collections..." />
            <CommandList>
              {isCreating ? (
                <CommandGroup>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Create New Collection
                  </div>
                  <div className="flex flex-col space-y-2 p-2">
                    <Label htmlFor="new-collection-name" className="text-sm">
                      Collection Name
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="new-collection-name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter collection name"
                        className="flex-1"
                        disabled={isSubmitting}
                      />
                      <Button
                        size="sm"
                        onClick={handleCreateCollection}
                        disabled={isSubmitting || !newCollectionName.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsCreating(false);
                          setNewCollectionName("");
                        }}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CommandGroup>
              ) : (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setIsCreating(true)}
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Create New Collection</span>
                    </div>
                  </CommandItem>
                  
                  {collections.map((collection) => {
                    const isSelected = selectedCollections.some(
                      (c) => c.id === collection.id
                    );
                    return (
                      <CommandItem
                        key={collection.id}
                        onSelect={() => handleCollectionSelect(collection)}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`h-4 w-4 border rounded-sm flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-input"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span>{collection.name}</span>
                          {collection.description && (
                            <span className="text-xs text-muted-foreground">
                              - {collection.description}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected collections */}
      {selectedCollections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCollections.map((collection) => (
            <Badge key={collection.id} variant="secondary" className="flex items-center space-x-1">
              <span>{collection.name}</span>
              <button
                onClick={() => handleRemoveCollection(collection.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionMultiSelect;
