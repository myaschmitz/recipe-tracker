import { z } from "zod";
import { VALIDATION } from "@/config/constants";

// User role enum based on database schema
export const userRoleSchema = z.enum(["user", "admin", "moderator"]);

// Unit schema based on database schema
export const unitSchema = z.object({
  id: z.number().int(),
  name: z.string().min(VALIDATION.MIN_UNIT_NAME_LENGTH, "Unit name is required"),
  symbol: z.string().optional(),
});

// Recipe ingredient schema based on database schema
export const recipeIngredientSchema = z.object({
  id: z.number().int().optional(),
  recipe_id: z.number().int().optional(),
  name: z.string().min(VALIDATION.MIN_INGREDIENT_NAME_LENGTH, "Ingredient name is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .or(
      z.string().transform((val) => {
        if (!val) throw new Error("Amount is required");
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          throw new Error("Amount must be a positive number");
        }
        return num;
      })
    ),
  unit_id: z.number().int().positive("Unit is required"),
  note: z.string().optional(),
});

// Recipe schema based on database schema
export const recipeSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(VALIDATION.MIN_RECIPE_NAME_LENGTH, "Recipe name is required"),
  description: z.string().optional(),
  instructions: z.string().min(VALIDATION.MIN_INSTRUCTIONS_LENGTH, "Instructions are required"),
  prep_time: z
    .number()
    .int()
    .min(VALIDATION.MIN_TIME)
    .optional()
    .or(
      z
        .string()
        .transform((val) => (val ? parseInt(val) : undefined))
        .optional()
    ),
  cook_time: z
    .number()
    .int()
    .min(VALIDATION.MIN_TIME)
    .optional()
    .or(
      z
        .string()
        .transform((val) => (val ? parseInt(val) : undefined))
        .optional()
    ),
  total_time: z
    .number()
    .int()
    .min(VALIDATION.MIN_TIME)
    .optional()
    .or(
      z
        .string()
        .transform((val) => (val ? parseInt(val) : undefined))
        .optional()
    ),
  link: z.string().url().optional().or(z.literal("")),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(VALIDATION.MIN_INGREDIENTS_REQUIRED, "At least one ingredient is required"),
  tags: z.array(z.number().int()).optional(),
  collections: z.array(z.number().int()).optional(),
});

// Tag schema based on database schema
export const tagSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(VALIDATION.MIN_TAG_NAME_LENGTH, "Tag name is required"),
});

// Recipe tag relationship schema
export const recipeTagSchema = z.object({
  id: z.number().int().optional(),
  recipe_id: z.number().int(),
  tag_id: z.number().int().optional(),
});

// Collection schema based on database schema
export const collectionSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(VALIDATION.MIN_COLLECTION_NAME_LENGTH, "Collection name is required"),
  description: z.string().optional(),
  user_id: z.string().uuid().optional(),
  is_public: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Collection recipe relationship schema
export const collectionRecipeSchema = z.object({
  id: z.number().int().optional(),
  recipe_id: z.number().int(),
  collection_id: z.number().int(),
});

// User recipe favorite schema
export const userRecipeFavoriteSchema = z.object({
  id: z.number().int().optional(),
  user_id: z.string().uuid(),
  recipe_id: z.number().int(),
  created_at: z.string().optional(),
});

// User collection favorite schema
export const userCollectionFavoriteSchema = z.object({
  id: z.number().int().optional(),
  user_id: z.string().uuid(),
  collection_id: z.number().int(),
  created_at: z.string().optional(),
});

// User want to make schema
export const userWantToMakeSchema = z.object({
  id: z.number().int().optional(),
  user_id: z.string().uuid(),
  recipe_id: z.number().int(),
  created_at: z.string().optional(),
  notes: z.string().optional(),
});

// Profile schema based on database schema
export const profileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(VALIDATION.MIN_USERNAME_LENGTH, "Username must be at least 3 characters"),
  avatar_url: z.string().url().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  date_of_birth: z.string().optional(), // ISO date string
  timezone: z.string().optional(),
  language: z.string().default('en'),
  theme_preference: z.string().default('system'),
  dietary_restrictions: z.array(z.string()).optional(),
  is_private: z.boolean().default(false),
  email_notifications: z.boolean().default(true),
  role: userRoleSchema.default('user'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Form schemas for UI components
export const recipeFormSchema = recipeSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const tagFormSchema = tagSchema.omit({ id: true });

export const collectionFormSchema = collectionSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

export const profileFormSchema = profileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const userRecipeFavoriteFormSchema = userRecipeFavoriteSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
});

export const userCollectionFavoriteFormSchema = userCollectionFavoriteSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
});

export const userWantToMakeFormSchema = userWantToMakeSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
});

// Type exports for use in components
export type RecipeFormData = z.infer<typeof recipeFormSchema>;
export type RecipeIngredientFormData = z.infer<typeof recipeIngredientSchema>;
export type TagFormData = z.infer<typeof tagFormSchema>;
export type CollectionFormData = z.infer<typeof collectionFormSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type UnitData = z.infer<typeof unitSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserRecipeFavoriteFormData = z.infer<typeof userRecipeFavoriteFormSchema>;
export type UserCollectionFavoriteFormData = z.infer<typeof userCollectionFavoriteFormSchema>;
export type UserWantToMakeFormData = z.infer<typeof userWantToMakeFormSchema>;

// Database type exports
export type RecipeSchema = z.infer<typeof recipeSchema>;
export type RecipeIngredientSchema = z.infer<typeof recipeIngredientSchema>;
export type TagSchema = z.infer<typeof tagSchema>;
export type RecipeTagSchema = z.infer<typeof recipeTagSchema>;
export type CollectionSchema = z.infer<typeof collectionSchema>;
export type CollectionRecipeSchema = z.infer<typeof collectionRecipeSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
export type UserRecipeFavoriteSchema = z.infer<typeof userRecipeFavoriteSchema>;
export type UserCollectionFavoriteSchema = z.infer<typeof userCollectionFavoriteSchema>;
export type UserWantToMakeSchema = z.infer<typeof userWantToMakeSchema>;

// Legacy exports for backward compatibility
export const ingredientSchema = recipeIngredientSchema;
export type IngredientFormData = RecipeIngredientFormData;
export type TagData = TagFormData;
