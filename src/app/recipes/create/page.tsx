"use client";

import React, { useState, useEffect } from "react";
import { RecipeIngredientForm, Tag, Unit, Collection } from "@/types/view/models";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import CollectionMultiSelect from "@/components/CollectionMultiSelect";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const CreateRecipe = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState<number | undefined>(undefined);
  const [cookTime, setCookTime] = useState<number | undefined>(undefined);
  const [totalTime, setTotalTime] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredientForm[]>([
    {
      name: "",
      amount: undefined,
      unit: { id: 0, name: "" } as Unit,
      note: "",
    },
  ]);
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      const response = await fetch("/api/units");
      const data = await response.json();

      if (response.ok) {
        const formattedUnits = data.map((d: Unit) => {
          return { id: d.id, name: d.name };
        });
        setUnits(formattedUnits);
      } else {
        console.error(`Error fetching units: ${data.error}`);
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

    fetchUnits();
    fetchTags();
  }, []);

  // add selected tags
  const handleTagSelect = (tag: Tag) => {
    setSelectedTags((curSelectedTags) => {
      if (!curSelectedTags.some((t) => t.id === tag.id)) {
        const updatedTags = [...curSelectedTags, tag];
        return updatedTags;
      }
      return curSelectedTags;
    });
    console.log(selectedTags);
  };

  const handleTagRemove = (tag: Tag) => {
    setSelectedTags((curSelectedTags) =>
      curSelectedTags.filter((t) => t.id !== tag.id)
    );
  };

  const handleCollectionChange = (collections: Collection[]) => {
    setSelectedCollections(collections);
  };

  const handleAddIngredient = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIngredients([
      ...ingredients,
      {
        name: "",
        amount: undefined,
        unit: { id: 0, name: "" } as Unit,
        note: "",
      },
    ]);
  };

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    if (field === "name") {
      newIngredients[index].name = value as string;
    } else if (field === "amount") {
      newIngredients[index].amount = parseFloat(value as string) || 0;
    } else if (field === "unit") {
      newIngredients[index].unit = units.find(
        (unit) => unit.name === value
      ) || { id: 0, name: "" };
    } else if (field === "note") {
      newIngredients[index].note = value as string;
    }
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleInstructionChange = (value: string) => {
    setInstructions(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // validate ingredients
    const areIngredientsValid = ingredients.every(
      (ingredient) =>
        ingredient.amount !== null &&
        ingredient.amount !== undefined &&
        !isNaN(ingredient.amount) &&
        ingredient.name.trim() !== "" &&
        ingredient.unit.name.trim() !== "" &&
        ingredient.unit.id !== null
    );

    if (!areIngredientsValid) {
      toast({
        title:
          "Please fill in all required ingredient fields with valid values",
        duration: 3000,
      });
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }

    // validate instructions
    if (!instructions.trim()) {
      toast({
        title: "Please add instructions to your recipe",
        duration: 3000,
      });
      e.preventDefault();
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        instructions,
        ingredients: ingredients.map((ingredient) => ({
          name: ingredient.name,
          amount: Number(ingredient.amount),
          unitId: ingredient.unit.id,
          note: ingredient.note,
        })),
        tags: selectedTags.map((tag) => tag.id),
        collections: selectedCollections.map((collection) => collection.id),
        prepTime: prepTime ? Number(prepTime) : undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        totalTime: totalTime ? Number(totalTime) : undefined,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      toast({
        title: "Recipe added successfully",
      });
      router.push(`/recipes/${result.id}`);
    } else {
      console.error(`Error creating recipe: ${result.error}`);
      toast({
        title: "Error creating recipe",
        description: result.error || "Unkown error",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Recipe</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-6 flex flex-col max-w-sm">
            <Label htmlFor="recipe-name" className="text-md font-bold">
              Name<span className="text-red-700">*</span>
            </Label>
            <Input
              type="text"
              id="recipe-name"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
              required
            />
          </div>
          <div className="mb-6 flex flex-row gap-6">
            <div className="flex flex-col max-w-sm">
              <Label htmlFor="recipe-name" className="text-sm font-bold">
                Prep Time
              </Label>
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="number"
                  id="prep-time"
                  placeholder=""
                  // value={ingredient.amount ?? ""}
                  //   onChange={(e) =>
                  //     handleIngredientChange(index, "amount", e.target.value)
                  //   }
                  //   onKeyDown={handleKeyDown}
                  min="0"
                  step="any"
                  className="mt-1 block rounded-md shadow-sm sm:text-sm w-16"
                />
                <span>min</span>
              </div>
            </div>
            <div className="flex flex-col max-w-sm">
              <Label htmlFor="recipe-name" className="text-sm font-bold">
                Cook Time
              </Label>
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="number"
                  id="prep-time"
                  placeholder=""
                  onChange={(e) => setName(e.target.value)}
                  min="0"
                  step="any"
                  className="mt-1 block rounded-md shadow-sm sm:text-sm w-16"
                />
                <span>min</span>
              </div>
            </div>
            <div className="flex flex-col max-w-sm">
              <Label htmlFor="recipe-name" className="text-sm font-bold">
                Total Time
              </Label>
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="number"
                  id="prep-time"
                  placeholder=""
                  onChange={(e) => setName(e.target.value)}
                  min="0"
                  step="any"
                  className="mt-1 block rounded-md shadow-sm sm:text-sm w-16"
                />
                <span>min</span>
              </div>
            </div>
          </div>
          <div className="mb-6 flex flex-col max-w-md">
            <Label htmlFor="recipe-description" className="text-md font-bold">
              Description
            </Label>
            <Textarea
              // type="text"
              id="recipe-description"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div className="mb-6 flex flex-col">
            <Label htmlFor="ingredients" className="text-md font-bold">
              Ingredients<span className="text-red-700">*</span>
            </Label>
            <Button
              size="sm"
              className="max-w-fit mt-1"
              onClick={handleAddIngredient}
            >
              + Add ingredient
            </Button>
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex sm:items-center items-start sm:flex-row flex-col mt-4"
              >
                <div className="flex flex-col mr-2 mb-2 sm:mb-0">
                  {index < 1 && (
                    <Label
                      htmlFor={`ingredient-amount-${index}`}
                      className="text-xs ml-1 mb-1"
                    >
                      Amount
                    </Label>
                  )}
                  <Input
                    id={`ingredient-amount-${index}`}
                    type="number"
                    value={ingredient.amount ?? ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "amount", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    min="0"
                    step="any"
                    className="w-20 bg-secondary"
                    required
                  />
                </div>
                <div className="flex flex-col mr-2 mb-2 sm:mb-0">
                  {index < 1 && (
                    <Label
                      htmlFor={`ingredient-unit-${index}`}
                      className="text-xs ml-1 mb-1"
                    >
                      Unit
                    </Label>
                  )}
                  <Select
                    onValueChange={(value) =>
                      handleIngredientChange(index, "unit", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.name}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {/* <Input
                    id={`ingredient-unit-${index}`}
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    className="w-24"
                    required
                  /> */}
                </div>
                <div className="flex flex-col mr-2 mb-2 sm:mb-0">
                  {index < 1 && (
                    <Label
                      htmlFor={`ingredient-name-${index}`}
                      className="text-xs ml-1 mb-1"
                    >
                      Name
                    </Label>
                  )}
                  <Input
                    id={`ingredient-name-${index}`}
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="w-48"
                    required
                  />
                </div>
                <div className="flex flex-col mr-2 w-full">
                  {index < 1 && (
                    <Label
                      htmlFor={`ingredient-note-${index}`}
                      className="text-xs ml-1 mb-1"
                    >
                      Note
                    </Label>
                  )}
                  <div className="flex flex-row items-center">
                    <Input
                      id={`ingredient-note-${index}`}
                      type="text"
                      value={ingredient.note}
                      onChange={(e) =>
                        handleIngredientChange(index, "note", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      className="w-full"
                    />
                    <Button
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-2 hover:text-red-700"
                      variant="ghost"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-6 flex flex-col w-full">
            <Label htmlFor="instructions" className="text-md font-bold">
              Instructions<span className="text-red-700">*</span>
            </Label>
            <RichTextEditor
              id={`instruction-desc`}
              onChange={handleInstructionChange}
              required
            />
          </div>
          <div className="mb-6 flex flex-col max-w-sm">
            <Label htmlFor="recipe-tag" className="text-md font-bold max-w-sm">
              Tags
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="max-w-fit my-1"
                >
                  Select tags...
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search tags" />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {tags
                        ?.filter((tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id))
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((tag) => (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={(currentValue: string) => {
                              setValue(
                                currentValue === value ? "" : currentValue
                              );
                              setOpen(false);
                              handleTagSelect(tag);
                            }}
                          >
                            {tag.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="mt-2 flex flex-row">
              {selectedTags.map((tag) => (
                <Badge key={tag.id} className="mr-2 mb-2">
                  {tag.name}
                  <Button
                    size="sm"
                    onClick={() => handleTagRemove(tag)}
                    className="outline-none shadow-none bg-transparent p-0 ml-2 mr-1 hover:bg-transparent hover:outline-none hover:text-red-700"
                  >
                    <X />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="mb-6 flex flex-col max-w-sm">
            <Label htmlFor="recipe-collections" className="text-md font-bold max-w-sm">
              Collections
            </Label>
            <CollectionMultiSelect
              selectedCollections={selectedCollections}
              onCollectionChange={handleCollectionChange}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Create Recipe"}
        </Button>
      </form>
    </div>
  );
};

export default CreateRecipe;
