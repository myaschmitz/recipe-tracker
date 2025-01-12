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

const { data, error } = await supabase.from("tag").select("name");

if (error) {
  console.log(`Error fetching tags: ${error}`);
}

const CreateRecipe = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);

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
    event?.preventDefault();
    setIngredients([...ingredients, ""]);
  };

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleAddInstruction = (event: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setInstructions([...instructions, ""]);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Recipe</h1>
      <form>
        <div className="mb-4">
          <div className="mb-4 flex flex-col max-w-sm">
            <Label htmlFor="recipe-name" className="text-lg font-bold">
              Name
            </Label>
            <Input
              type="text"
              id="recipe-name"
              placeholder="Name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
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
          <div className="mb-4 flex flex-col max-w-sm">
            <Label htmlFor="ingredients" className="text-lg font-bold">
              Ingredients
            </Label>
            <Button className="max-w-fit" onClick={handleAddIngredient}>
              + Add ingredient
            </Button>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center mt-2">
                <Input
                  type="text"
                  value={ingredient}
                  onChange={(e) =>
                    handleIngredientChange(index, e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ingredient name"
                  className="flex-1"
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
            ))}
          </div>
          <div className="mb-4 flex flex-col max-w-sm">
            <Label htmlFor="instructions" className="text-lg font-bold">
              Instructions
            </Label>
            <Button className="max-w-fit" onClick={handleAddInstruction}>
              + Add instruction
            </Button>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-center mt-2">
                <Input
                  type="text"
                  value={instruction}
                  onChange={(e) =>
                    handleInstructionChange(index, e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Instruction"
                  className="flex-1"
                  required
                />
                <Button
                  onClick={() => handleRemoveInstruction(index)}
                  className="ml-2"
                  variant="ghost"
                >
                  <X />
                </Button>
              </div>
            ))}
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
