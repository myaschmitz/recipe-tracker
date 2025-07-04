"use client";

import React, { useState, useEffect } from "react";
import { Tag } from "@/types/view/models";
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

interface TagMultiSelectProps {
  selectedTags: Tag[];
  onTagChange: (tags: Tag[]) => void;
}

const TagMultiSelect = ({
  selectedTags,
  onTagChange,
}: TagMultiSelectProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const data = await response.json();

        if (response.ok) {
          setTags(data);
        } else {
          console.error(`Error fetching tags: ${data.error}`);
          toast({
            title: "Error fetching tags",
            description: data.error || "Unknown error",
          });
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast({
          title: "Error fetching tags",
          description: "Failed to load tags",
        });
      }
    };

    fetchTags();
  }, [toast]);

  const handleTagSelect = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    
    if (isSelected) {
      // Remove tag
      const updatedTags = selectedTags.filter(
        (t) => t.id !== tag.id
      );
      onTagChange(updatedTags);
    } else {
      // Add tag
      const updatedTags = [...selectedTags, tag];
      onTagChange(updatedTags);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    const updatedTags = selectedTags.filter(
      (t) => t.id !== tagId
    );
    onTagChange(updatedTags);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Tag name required",
        description: "Please enter a name for the tag",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTagName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newTag = data[0]; // API returns array
        setTags([...tags, newTag]);
        
        // Automatically select the new tag
        const updatedTags = [...selectedTags, newTag];
        onTagChange(updatedTags);
        
        // Reset form
        setNewTagName("");
        setIsCreating(false);
        
        toast({
          title: "Tag created successfully",
          description: `"${newTag.name}" has been created and added to your recipe`,
        });
      } else {
        console.error(`Error creating tag: ${data.error}`);
        toast({
          title: "Error creating tag",
          description: data.error || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast({
        title: "Error creating tag",
        description: "Failed to create tag",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewTagName("");
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
            className="justify-between w-fit max-w-xs"
          >
            {selectedTags.length === 0
              ? "Select tags..."
              : `${selectedTags.length} tag(s) selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              {isCreating ? (
                <CommandGroup>
                  <div className="px-2 py-1 text-sm font-bold text-foreground">
                    Create New Tag
                  </div>
                  <div className="flex flex-col space-y-3 p-2 pt-1">
                    <div>
                      <Label htmlFor="new-tag-name" className="text-sm">
                        Tag Name<span className="text-red-700">*</span>
                      </Label>
                      <Input
                        id="new-tag-name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter tag name"
                        className="mt-1"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleCreateTag}
                        disabled={isSubmitting || !newTagName.trim()}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsCreating(false);
                          setNewTagName("");
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
                      <span>Create New Tag</span>
                    </div>
                  </CommandItem>
                  
                  {tags.map((tag) => {
                    const isSelected = selectedTags.some(
                      (t) => t.id === tag.id
                    );
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleTagSelect(tag)}
                      >
                        <div className="flex items-start space-x-3 w-full py-1">
                          <div
                            className={`h-4 w-4 min-w-[16px] border-2 rounded-sm flex items-center justify-center mt-0.5 ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-muted-foreground hover:border-primary transition-colors"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium">{tag.name}</span>
                          </div>
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

      {/* Display selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center space-x-1">
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
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

export default TagMultiSelect;
