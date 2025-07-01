import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { RecipeSchema } from "@/types/database/models";
import { PostgrestError } from "@supabase/supabase-js";
import {
  handleApiError,
  createSuccessResponse,
  DEFAULT_RECIPE_LIMIT,
} from "@/lib/api";
import { recipeSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");

    const { data, error } = await supabase
      .from("recipe")
      .select("id, name, description")
      .order("created_at", { ascending: false })
      .limit(limit ? parseInt(limit) : DEFAULT_RECIPE_LIMIT);

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipes");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod schema - add this right after getting the body
    const validatedData = recipeSchema.parse(body);

    // insert recipe into db
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

    if (validatedData.ingredients && validatedData.ingredients.length > 0) {
      const { error: ingredientError } = await supabase
        .from("recipe_ingredient")
        .insert(
          validatedData.ingredients.map((ingredient) => ({
            recipe_id: recipe.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit_id: ingredient.unitId,
            note: ingredient.note,
          }))
        );

      if (ingredientError) {
        return handleApiError(ingredientError, "adding ingredients");
      }
    }

    if (validatedData.tags && validatedData.tags.length > 0) {
      const { error: tagError } = await supabase.from("recipe_tag").insert(
        validatedData.tags.map((tag) => ({
          recipe_id: recipe.id,
          tag_id: tag,
        }))
      );

      if (tagError) {
        console.error("Tag adding error:", tagError);
        return handleApiError(tagError, "adding tags");
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
