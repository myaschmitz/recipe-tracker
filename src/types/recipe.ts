export type Unit = {
  id: number;
  name: string;
  symbol?: string;
};

export type Ingredient = {
  id: number;
  recipeId: number;
  name: string;
  amount?: number;
  unit: Unit;
  note?: string;
};

export type Recipe = {
  id: number;
  name: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: string;
  createdAt: string;
  updatedAt: string;
};

export type RecipeTag = {
  id: number;
  recipeId: number;
  tagId: number;
};

export type Tag = {
  id: number;
  name: string;
};

export type 

export type CreateUnit = Omit<Unit, "id">;
export type CreateRecipe = Omit<Recipe, "id">;
export type CreateIngredient = Omit<Ingredient, "id">;
