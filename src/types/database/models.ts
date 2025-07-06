// Database models matching the exact SQL schema

// User role enum
export type user_role = "user" | "admin" | "moderator";

export type RecipeSchema = {
  id: number;
  name: string;
  description?: string;
  instructions: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  link?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
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

export type TagSchema = {
  id: number;
  name: string;
};

export type RecipeTagSchema = {
  id: number;
  recipe_id: number;
  tag_id?: number;
};

export type CollectionSchema = {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
  user_id?: string;
  is_public: boolean;
};

export type CollectionRecipeSchema = {
  id: number;
  recipe_id: number;
  collection_id: number;
};

export type UserRecipeFavoriteSchema = {
  id: number;
  user_id: string;
  recipe_id: number;
  created_at: string;
};

export type UserCollectionFavoriteSchema = {
  id: number;
  user_id: string;
  collection_id: number;
  created_at: string;
};

export type UserWantToMakeSchema = {
  id: number;
  user_id: string;
  recipe_id: number;
  created_at: string;
  notes?: string;
};

export type ProfileSchema = {
  id: string;
  updated_at?: string;
  username: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  location?: string;
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  date_of_birth?: string;
  timezone?: string;
  language: string;
  theme_preference: string;
  dietary_restrictions?: string[];
  is_private: boolean;
  email_notifications: boolean;
  role: user_role;
};
