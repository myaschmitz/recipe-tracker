export type RecipeSchema = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  instructions: string;
};

export type RecipeIngredientSchema = {
  id: number;
  recipe_id: number;
  name: string;
  amount: number;
  unit_id: number;
  note?: string;
};

export type UnitSchema = {
  id: number;
  name: string;
  symbol?: string;
};

export type RecipeTagSchema = {
  recipe_id: number;
  tag_id: number;
};

export type TagSchema = {
  id: number;
  name: string;
};

export type ProfileSchema = {
  id: number;
  updated_at: string;
  username: string;
  name: string;
  avatar_url?: string;
};

export type CollectionSchema = {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type CollectionRecipeSchema = {
  collection_id: number;
  recipe_id: number;
};
