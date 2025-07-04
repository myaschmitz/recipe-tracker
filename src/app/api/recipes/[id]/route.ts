import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("recipe")
      .select("id, name, description, instructions, prep_time, cook_time, total_time, link")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipe(s)");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const {
      name,
      description,
      instructions,
      ingredients,
      tags,
      collections,
      prepTime,
      cookTime,
      totalTime,
    } = await req.json();

    // Update the recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipe")
      .update({
        name,
        description,
        instructions,
        prep_time: prepTime,
        cook_time: cookTime,
        total_time: totalTime,
      })
      .eq("id", id)
      .select()
      .single();

    if (recipeError) {
      throw recipeError;
    }

    // Delete existing ingredients
    await supabase.from("recipe_ingredient").delete().eq("recipe_id", id);

    // Insert new ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientInserts = ingredients.map((ingredient: any) => ({
        recipe_id: parseInt(id),
        name: ingredient.name,
        amount: ingredient.amount,
        unit_id: ingredient.unitId,
        note: ingredient.note,
      }));

      const { error: ingredientError } = await supabase
        .from("recipe_ingredient")
        .insert(ingredientInserts);

      if (ingredientError) {
        throw ingredientError;
      }
    }

    // Delete existing recipe tags
    await supabase.from("recipe_tag").delete().eq("recipe_id", id);

    // Insert new recipe tags
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: number) => ({
        recipe_id: parseInt(id),
        tag_id: tagId,
      }));

      const { error: tagError } = await supabase
        .from("recipe_tag")
        .insert(tagInserts);

      if (tagError) {
        throw tagError;
      }
    }

    // Delete existing collection recipes
    await supabase.from("collection_recipe").delete().eq("recipe_id", id);

    // Insert new collection recipes
    if (collections && collections.length > 0) {
      const collectionInserts = collections.map((collectionId: number) => ({
        recipe_id: parseInt(id),
        collection_id: collectionId,
      }));

      const { error: collectionError } = await supabase
        .from("collection_recipe")
        .insert(collectionInserts);

      if (collectionError) {
        throw collectionError;
      }
    }

    return createSuccessResponse(recipeData);
  } catch (error) {
    return handleApiError(error, "updating recipe");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const { error } = await supabase.from("recipe").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "deleting recipe");
  }
}
