import { z } from "zod";

export const recipeIngredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .or(
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          throw new Error("Amount must be a positive number");
        }
        return num;
      })
    ),
  unitId: z.number().int().positive("Valid unit is required"),
  note: z.string().optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  prepTime: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(
      z
        .string()
        .transform((val) => (val ? parseInt(val) : undefined))
        .optional()
    ),
  cookTime: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(
      z
        .string()
        .transform((val) => (val ? parseInt(val) : undefined))
        .optional()
    ),
  totalTime: z
    .number()
    .int()
    .min(0)
    .optional()
    .or(
      z
        .string()
        .transform((val) => (val ? parseInt(val) : undefined))
        .optional()
    ),
  link: z.string().url().optional().or(z.literal("")),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, "At least one ingredient is required"),
  tags: z.array(z.number().int()).optional(),
  collections: z.array(z.number().int()).optional(),
});

export const tagSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
});

export const unitSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
});

export const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
});

// Type exports for use in components
export type RecipeFormData = z.infer<typeof recipeSchema>;
export type RecipeIngredientFormData = z.infer<typeof recipeIngredientSchema>;
export type TagData = z.infer<typeof tagSchema>;
export type UnitData = z.infer<typeof unitSchema>;
export type CollectionFormData = z.infer<typeof collectionSchema>;
