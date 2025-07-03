export type Recipe = {
  id: number;
  name: string;
  description?: string;
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  totalTime?: number; // in minutes
  link?: string;
  createdAt: string;
  updatedAt: string;
  instructions: string;
  ingredients: RecipeIngredient[];
  tags: Tag[];
  collections?: Collection[];
};

export type RecipeIngredient = {
  id: number;
  recipeId: number;
  name: string;
  amount?: number;
  unit: Unit;
  note?: string;
};

export type Unit = {
  id: number;
  name: string;
  symbol?: string;
};

export type RecipeTag = {
  recipeId: number;
  tagId: number;
};

export type Tag = {
  id: number;
  name: string;
};

export type Profile = {
  id: number;
  updatedAt: string;
  username: string;
  name: string;
  avatarUrl?: string;
};

export type Collection = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  recipes: Recipe[];
};

export type CollectionRecipe = {
  collectionId: number;
  recipeId: number;
};

// forms only collect user data
export type RecipeForm = Omit<Recipe, "id" | "created_at" | "updated_at">;
export type RecipeIngredientForm = Omit<RecipeIngredient, "id" | "recipeId">;
export type CollectionForm = Omit<Collection, "id" | "createdAt" | "recipes">;

export type RecipeBasicCard = Omit<Recipe, "instructions" | "ingredients">;

// export type CreateUnit = Omit<Unit, "id">;
// export type CreateRecipe = Omit<Recipe, "id">;
// export type CreateIngredient = Omit<Ingredient, "id">;
