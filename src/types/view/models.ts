// View models with camelCase naming and enhanced functionality

export type Recipe = {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prepTime?: number; // in minutes (mapped from prep_time)
  cookTime?: number; // in minutes (mapped from cook_time)
  totalTime?: number; // in minutes (mapped from total_time)
  link?: string;
  createdAt: string; // mapped from created_at
  updatedAt: string; // mapped from updated_at
  userId?: string; // mapped from user_id
  ingredients: Ingredient[];
  tags: Tag[];
  collections?: Collection[];
};

export type Ingredient = {
  id: number;
  recipeId: number; // mapped from recipe_id
  name: string;
  amount: number;
  unit: Unit;
  note?: string;
};

export type Unit = {
  id: number;
  name: string;
  symbol?: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type RecipeTag = {
  id: number;
  recipeId: number; // mapped from recipe_id
  tagId?: number; // mapped from tag_id
};

export type Collection = {
  id: number;
  name: string;
  description?: string;
  userId?: string; // mapped from user_id
  isPublic: boolean; // mapped from is_public
  createdAt: string; // mapped from created_at
  updatedAt: string; // mapped from updated_at
  recipes: Recipe[];
};

export type CollectionRecipe = {
  id: number;
  recipeId: number; // mapped from recipe_id
  collectionId: number; // mapped from collection_id
};

export type Profile = {
  id: string;
  username: string;
  avatarUrl?: string; // mapped from avatar_url
  firstName?: string; // mapped from first_name
  lastName?: string; // mapped from last_name
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string; // mapped from date_of_birth
  timezone?: string;
  language: string;
  themePreference: string; // mapped from theme_preference
  dietaryRestrictions?: string[]; // mapped from dietary_restrictions
  isPrivate: boolean; // mapped from is_private
  emailNotifications: boolean; // mapped from email_notifications
  createdAt: string; // mapped from created_at
  updatedAt?: string; // mapped from updated_at
};

// Form types for creating/editing
export type RecipeForm = Omit<Recipe, "id" | "createdAt" | "updatedAt" | "userId" | "ingredients" | "tags" | "collections"> & {
  ingredients: IngredientForm[];
  tags: number[];
  collections: number[];
};

export type IngredientForm = {
  name: string;
  amount: number;
  unit_id: number;
  note?: string;
};

export type CollectionForm = Omit<Collection, "id" | "createdAt" | "updatedAt" | "userId" | "recipes">;
export type TagForm = Omit<Tag, "id">;

// Card types for displaying recipe summaries
export type RecipeCard = Omit<Recipe, "instructions" | "ingredients">;

// Legacy types for backward compatibility
export type RecipeIngredient = Ingredient;
export type RecipeIngredientForm = IngredientForm;
