"use client";

import React, { useState } from "react";
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
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { Hr } from "@/components/ui/separator";

const { data, error } = await supabase.from("tag").select("name");

if (error) {
  console.log(`Error fetching tags: ${error}`);
}

interface Ingredient {
  name: string;
  amount: number | null;
  unit: string;
  note: string;
}

const CreateRecipe = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      name: "",
      amount: null,
      unit: "",
      note: "",
    },
  ]);
  const [instructions, setInstructions] = useState("");

  // add tag if use selects it
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleAddIngredient = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIngredients([
      ...ingredients,
      {
        name: "",
        amount: null,
        unit: "",
        note: "",
      },
    ]);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    if (field === "amount") {
      const numValue = value === "" ? null : parseFloat(value as string);
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: numValue,
      };
    } else {
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: value,
      };
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate ingredients
    const isIngredientsValid = ingredients.every(
      (ingredient) =>
        ingredient.amount !== null &&
        !isNaN(ingredient.amount) &&
        ingredient.name.trim() !== "" &&
        ingredient.unit.trim() !== ""
    );

    if (!isIngredientsValid) {
      alert("Please fill in all required ingredient fields with valid values");
      return;
    }

    // Validate instructions
    if (!instructions.trim()) {
      alert("Please add instructions");
      return;
    }

    // post to supabase
    const { data, error } = await supabase
      .from("recipe")
      .insert([
        {
          name,
          description,
          ingredients: ingredients.map((ing) => ({
            ...ing,
            amount: Number(ing.amount), // Ensure amount is number
            name: ing.name.trim(),
            unit: ing.unit.trim(),
            note: ing.note.trim(),
          })),
          instructions,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      alert("Error creating recipe");
    } else {
      console.log("Recipe created successfully");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Recipe</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-4 flex flex-col max-w-sm">
            <Label htmlFor="recipe-name" className="text-lg font-bold">
              Name<span className="text-red-700">*</span>
            </Label>
            <Input
              type="text"
              id="recipe-name"
              placeholder="Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4 flex flex-col max-w-sm">
            <Label htmlFor="recipe-description" className="text-lg font-bold">
              Description
            </Label>
            <Input
              type="text"
              id="recipe-description"
              placeholder="Description"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div className="mb-4 flex flex-col">
            <Label htmlFor="ingredients" className="text-lg font-bold">
              Ingredients<span className="text-red-700">*</span>
            </Label>
            <Button className="max-w-fit" onClick={handleAddIngredient}>
              + Add ingredient
            </Button>
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex sm:items-center items-start sm:flex-row flex-col mt-4"
              >
                <div className="flex flex-col mr-2 mb-2 sm:mb-0">
                  <Label
                    htmlFor={`ingredient-amount-${index}`}
                    className="text-xs ml-1"
                  >
                    Amount
                  </Label>
                  <Input
                    id={`ingredient-amount-${index}`}
                    type="number"
                    value={ingredient.amount ?? ""}
                    onChange={(e) =>
                      handleIngredientChange(index, "amount", e.target.value)
                    }
                    min="0"
                    step="any"
                    className="w-20"
                    required
                  />
                </div>
                <div className="flex flex-col mr-2 mb-2 sm:mb-0">
                  <Label
                    htmlFor={`ingredient-unit-${index}`}
                    className="text-xs ml-1"
                  >
                    Unit
                  </Label>
                  <Input
                    id={`ingredient-unit-${index}`}
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(index, "unit", e.target.value)
                    }
                    className="w-24"
                    required
                  />
                </div>
                <div className="flex flex-col mr-2 mb-2 sm:mb-0">
                  <Label
                    htmlFor={`ingredient-name-${index}`}
                    className="text-xs ml-1"
                  >
                    Name
                  </Label>
                  <Input
                    id={`ingredient-name-${index}`}
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(index, "name", e.target.value)
                    }
                    className="w-24"
                    required
                  />
                </div>
                <div className="flex flex-col mr-2 w-full">
                  <Label
                    htmlFor={`ingredient-note-${index}`}
                    className="text-xs ml-1"
                  >
                    Note
                  </Label>
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
                      required
                    />
                    <Button
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-2"
                      variant="ghost"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4 flex flex-col">
            <Label htmlFor="instructions" className="text-lg font-bold">
              Instructions<span className="text-red-700">*</span>
            </Label>
            <RichTextEditor
              id={`instruction-desc`}
              onChange={handleInstructionChange}
              required
            />
          </div>
          <div className="mb-4 flex flex-col max-w-sm">
            <Label htmlFor="recipe-tag" className="text-lg font-bold max-w-sm">
              Tag
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="max-w-fit"
                >
                  {value
                    ? data?.find((tag) => tag.name === value)?.name
                    : "Select tags..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {data
                        ?.sort((a, b) => a.name.localeCompare(b.name))
                        .map((tag) => (
                          <CommandItem
                            key={tag.name}
                            value={tag.name}
                            onSelect={(currentValue: string) => {
                              setValue(
                                currentValue === value ? "" : currentValue
                              );
                              setOpen(false);
                              handleTagSelect(tag.name);
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
                <Badge key={tag} className="mr-2 mb-2">
                  {tag}
                  <Button
                    onClick={() => handleTagRemove(tag)}
                    className="outline-none bg-transparent hover:bg-transparent hover:outline-none hover:text-green-700"
                  >
                    <X className="m-1" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default CreateRecipe;
