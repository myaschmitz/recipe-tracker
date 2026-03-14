"use client";

import RichTextEditor from "@/components/RichTextEditor";
import CollectionMultiSelect from "@/components/CollectionMultiSelect";
import TagMultiSelect from "@/components/TagMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Recipe,
  Tag,
  Unit,
  Collection,
} from "@/types/view/models";
import { X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import IngredientCombobox from "@/components/IngredientCombobox";

// Edit page works with unit objects (from API), not unit_id numbers
type EditIngredient = {
  id?: number;
  recipeId?: number;
  name: string;
  amount: number | null;
  unit: Unit;
  ingredientId?: number | null;
  note?: string;
};

const EditRecipePage = () => {
  const { user } = useAuth();
  const params = useParams();
  const id = params.id?.toString();
  const [recipe, setRecipe] = useState<Recipe>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [prepTime, setPrepTime] = useState<number | undefined>(undefined);
  const [cookTime, setCookTime] = useState<number | undefined>(undefined);
  const [totalTime, setTotalTime] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<EditIngredient[]>([]);
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        const response = await fetch(`/api/recipes/${id}`);
        const data = await response.json();

        const recipeData = {
          id: data.id,
          name: data.name,
          description: data.description,
          prepTime: data.prep_time,
          cookTime: data.cook_time,
          totalTime: data.total_time,
          ingredients: data.ingredients,
          instructions: data.instructions,
          tags: data.tags,
          collections: data.collections,
        } as Recipe;

        setRecipe(recipeData);

        // Populate form fields with recipe data
        setName(recipeData.name || "");
        setDescription(recipeData.description || "");
        setPrepTime(recipeData.prepTime);
        setCookTime(recipeData.cookTime);
        setTotalTime(recipeData.totalTime);
        setInstructions(recipeData.instructions || "");

        if (!response.ok) {
          console.error("Error fetching /api/ingredients/[recipeId].");
        }
      };

      const fetchIngredients = async (recipeId: string) => {
        try {
          const response = await fetch(`/api/ingredients/${recipeId}`);
          if (!response.ok) {
            throw new Error(
              `Error fetching ingredients with recipeId ${recipeId}: ${response.statusText}`
            );
          }
          const ingredients = await response.json();

          // The API returns properly formatted ingredients with unit objects
          setIngredients(ingredients.length > 0 ? ingredients.map((i: any) => ({
            id: i.id,
            recipeId: i.recipeId,
            name: i.name,
            amount: i.amount,
            unit: i.unit, // This already contains {id, name, symbol}
            ingredientId: i.ingredientId || null,
            note: i.note || "",
          })) : [
            {
              name: "",
              amount: null,
              unit: { id: 0, name: "" } as Unit,
              ingredientId: null,
              note: "",
            },
          ]);
          return ingredients;
        } catch (error) {
          console.error(error);
        }
      };

      const fetchTags = async () => {
        // Tags are now fetched by TagMultiSelect component
      };

      const fetchRecipeTags = async (recipeId: string) => {
        const response = await fetch(`/api/tags/${recipeId}`);

        if (!response.ok) {
          console.error(`Error fetching recipe tags: ${response.statusText}`);
          return;
        }

        const data = await response.json();
        const formattedTags = data.map((d: Tag) => {
          return { id: d.id, name: d.name };
        });

        setSelectedTags(formattedTags);
      };

      const fetchRecipeCollections = async (recipeId: string) => {
        try {
          // First get all collection-recipe relationships
          const collectionRecipeResponse = await fetch(`/api/collection-recipes`);
          
          if (!collectionRecipeResponse.ok) {
            throw new Error(
              `Error fetching collection recipes: ${collectionRecipeResponse.statusText}`
            );
          }

          const allCollectionRecipes = await collectionRecipeResponse.json();
          
          // Filter for this specific recipe
          const recipeCollectionIds = allCollectionRecipes
            .filter((cr: any) => cr.recipe_id === parseInt(recipeId))
            .map((cr: any) => cr.collection_id);

          if (recipeCollectionIds.length === 0) {
            setSelectedCollections([]);
            return;
          }

          // Get all collections
          const collectionsResponse = await fetch(`/api/collections`);
          
          if (!collectionsResponse.ok) {
            throw new Error(
              `Error fetching collections: ${collectionsResponse.statusText}`
            );
          }

          const allCollections = await collectionsResponse.json();
          
          // Filter to only collections this recipe belongs to
          const recipeCollections = allCollections.filter((collection: Collection) => 
            recipeCollectionIds.includes(collection.id)
          );

          setSelectedCollections(recipeCollections);
        } catch (error) {
          console.error("Error fetching recipe collections:", error);
          setSelectedCollections([]);
        }
      };

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

      fetchRecipe();
      fetchIngredients(id);
      fetchTags();
      fetchRecipeTags(id);
      fetchRecipeCollections(id);
      fetchUnits();
    }
  }, [id]);

  // add selected tags
  const handleTagChange = (tags: Tag[]) => {
    setSelectedTags(tags);
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
        amount: null,
        unit: { id: 0, name: "" } as Unit,
        ingredientId: null,
        note: "",
      },
    ]);
  };

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string | number | null
  ) => {
    const newIngredients = [...ingredients];
    if (field === "name") {
      newIngredients[index].name = value as string;
    } else if (field === "amount") {
      const str = value as string;
      newIngredients[index].amount = str === "" ? null : (parseFloat(str) || 0);
    } else if (field === "unit") {
      newIngredients[index].unit = units.find(
        (unit) => unit.name === value
      ) || { id: 0, name: "" };
    } else if (field === "ingredientId") {
      newIngredients[index].ingredientId = value as number | null;
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

    // validate ingredients (amount is optional for "salt to taste" style entries)
    const areIngredientsValid = ingredients.every(
      (ingredient) =>
        (ingredient.amount === null || ingredient.amount === undefined || (typeof ingredient.amount === "number" && !isNaN(ingredient.amount) && ingredient.amount > 0)) &&
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

    const response = await fetch(`/api/recipes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        instructions,
        ingredients: ingredients.map((ingredient, index) => ({
          name: ingredient.name,
          amount: ingredient.amount !== null && ingredient.amount !== undefined ? Number(ingredient.amount) : null,
          unitId: ingredient.unit.id,
          ingredientId: ingredient.ingredientId || null,
          note: ingredient.note,
          position: index,
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
      console.log("Recipe updated successfully");
      toast({
        title: "Recipe updated successfully",
      });
      router.push(`/recipes/${id}`);
    } else {
      console.log(`Error updating recipe: ${result.error}`);
      toast({ title: "Error updating recipe", description: result.error });
    }
  };

  console.log(recipe);

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">
            Please sign in to edit recipes.
          </p>
          <Button 
            onClick={() => router.push('/auth?mode=login')}
            className="bg-primary text-primary-foreground"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Recipe</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-6 flex flex-col max-w-sm">
            <Label htmlFor="recipe-name" className="text-md font-bold">
              Name<span className="text-red-700">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              id="recipe-name"
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md shadow-sm sm:text-sm"
              required
            />
          </div>
          <div className="mb-6 flex flex-row gap-6">
            <div className="flex flex-col max-w-sm">
              <Label htmlFor="prep-time" className="text-sm font-bold">
                Prep Time
              </Label>
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="number"
                  id="prep-time"
                  placeholder=""
                  value={prepTime ?? ""}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || undefined)}
                  min="0"
                  step="any"
                  className="mt-1 block rounded-md shadow-sm sm:text-sm w-16"
                />
                <span>min</span>
              </div>
            </div>
            <div className="flex flex-col max-w-sm">
              <Label htmlFor="cook-time" className="text-sm font-bold">
                Cook Time
              </Label>
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="number"
                  id="cook-time"
                  placeholder=""
                  value={cookTime ?? ""}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || undefined)}
                  min="0"
                  step="any"
                  className="mt-1 block rounded-md shadow-sm sm:text-sm w-16"
                />
                <span>min</span>
              </div>
            </div>
            <div className="flex flex-col max-w-sm">
              <Label htmlFor="total-time" className="text-sm font-bold">
                Total Time
              </Label>
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="number"
                  id="total-time"
                  placeholder=""
                  value={totalTime ?? ""}
                  onChange={(e) => setTotalTime(parseInt(e.target.value) || undefined)}
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
              id="recipe-description"
              placeholder="Description"
              value={description ?? ""}
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
                    className="w-20"
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
                    value={ingredient.unit?.name || ""}
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
                  <IngredientCombobox
                    id={`ingredient-name-${index}`}
                    value={ingredient.name}
                    ingredientId={ingredient.ingredientId}
                    onValueChange={(name, ingredientId) => {
                      handleIngredientChange(index, "name", name);
                      handleIngredientChange(index, "ingredientId", ingredientId);
                    }}
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
              defaultValue={instructions}
              placeholder="Add instructions here..."
              required
            />
          </div>
          <div className="mb-6 flex flex-col max-w-sm">
            <Label htmlFor="recipe-tag" className="text-md font-bold max-w-sm">
              Tags
            </Label>
            <TagMultiSelect
              selectedTags={selectedTags}
              onTagChange={handleTagChange}
            />
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
          {isSubmitting ? "Submitting..." : "Update Recipe"}
        </Button>
      </form>
    </div>
  );
};

export default EditRecipePage;
