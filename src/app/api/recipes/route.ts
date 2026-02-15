import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RecipeSchema } from "@/types/database/models";
import { PostgrestError } from "@supabase/supabase-js";
import {
  handleApiError,
  createSuccessResponse,
  DEFAULT_RECIPE_LIMIT,
  requireAuth,
} from "@/lib/api";
import { recipeFormSchema, RecipeFormData } from "@/lib/schemas";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const tags = searchParams.get("tags");
    const userId = searchParams.get("user_id");

    let query = supabase
      .from("recipe")
      .select("id, name, description, prep_time, cook_time, total_time, link, created_at, updated_at, user_id")
      .order("created_at", { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Handle tag filtering separately
    if (tags) {
      const tagIds = tags.split(',').map(id => parseInt(id));
      
      // Get recipe IDs that have the specified tags
      const { data: recipeIds, error: tagError } = await supabase
        .from("recipe_tag")
        .select("recipe_id")
        .in("tag_id", tagIds);

      if (tagError) {
        throw tagError;
      }

      if (recipeIds && recipeIds.length > 0) {
        const recipeIdList = recipeIds.map((r: any) => r.recipe_id);
        query = query.in("id", recipeIdList);
      } else {
        // No recipes found with those tags
        return createSuccessResponse([]);
      }
    }

    query = query.limit(limit ? parseInt(limit) : DEFAULT_RECIPE_LIMIT);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching recipes:', error);
      // Return empty array on database error to prevent frontend crashes
      return createSuccessResponse([]);
    }

    // Ensure we always return an array
    return createSuccessResponse(data || []);
  } catch (error) {
    console.error('Recipes API error:', error);
    // Return empty array instead of error response to prevent frontend crashes
    return createSuccessResponse([]);
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication
    const profile = await requireAuth();
    
    const supabase = await createClient();
    
    const body = await request.json();

    // Validate with Zod schema
    const validatedData = recipeFormSchema.parse(body);

    // Insert recipe into db
    const {
      data: recipe,
      error: recipeError,
    }: { data: RecipeSchema | null; error: PostgrestError | null } =
      await supabase
        .from("recipe")
        .insert({
          name: validatedData.name,
          description: validatedData.description,
          instructions: validatedData.instructions,
          prep_time: validatedData.prep_time,
          cook_time: validatedData.cook_time,
          total_time: validatedData.total_time,
          link: validatedData.link,
          user_id: profile.id,
        })
        .select()
        .single();

    if (recipeError) {
      console.error("Recipe creation error:", recipeError);
      return handleApiError(recipeError, "creating recipe");
    }

    if (!recipe) {
      return NextResponse.json(
        { error: "Failed to create recipe" },
        { status: 500 }
      );
    }

    // Insert ingredients
    if (validatedData.ingredients && validatedData.ingredients.length > 0) {
      const { error: ingredientError } = await supabase
        .from("recipe_ingredient")
        .insert(
          validatedData.ingredients.map((ingredient: any, index: number) => ({
            recipe_id: recipe.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit_id: ingredient.unit_id,
            note: ingredient.note,
            position: ingredient.position ?? index,
          }))
        );

      if (ingredientError) {
        return handleApiError(ingredientError, "adding ingredients");
      }
    }

    // Insert recipe-tag relationships
    if (validatedData.tags && validatedData.tags.length > 0) {
      const { error: tagError } = await supabase.from("recipe_tag").insert(
        validatedData.tags.map((tagId: number) => ({
          recipe_id: recipe.id,
          tag_id: tagId,
        }))
      );

      if (tagError) {
        console.error("Tag adding error:", tagError);
        return handleApiError(tagError, "adding tags");
      }
    }

    // Insert collection-recipe relationships
    if (validatedData.collections && validatedData.collections.length > 0) {
      const { error: collectionError } = await supabase.from("collection_recipe").insert(
        validatedData.collections.map((collectionId: number) => ({
          recipe_id: recipe.id,
          collection_id: collectionId,
        }))
      );

      if (collectionError) {
        console.error("Collection adding error:", collectionError);
        return handleApiError(collectionError, "adding collections");
      }
    }

    return createSuccessResponse(recipe, 201);
  } catch (error: unknown) {
    console.error("Full error:", error);
    // Handle Zod validation errors specifically
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: "errors" in error ? error.errors : [],
        },
        { status: 400 }
      );
    }
    return handleApiError(error, "creating recipe");
  }
}
