import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse, requireAuth, checkUserRole } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    // Get recipe with ingredients, tags, and collections
    const { data: recipe, error: recipeError } = await supabase
      .from("recipe")
      .select(`
        id, name, description, instructions, prep_time, cook_time, total_time, link, created_at, updated_at, user_id,
        recipe_ingredient (
          id, name, amount, unit_id, note,
          unit (
            id, name, symbol
          )
        ),
        recipe_tag (
          tag (
            id, name
          )
        ),
        collection_recipe (
          collection (
            id, name, description, is_public, created_at, updated_at, user_id
          )
        )
      `)
      .eq("id", id)
      .single();

    if (recipeError) {
      throw recipeError;
    }

    // Transform the data to match the expected format
    const transformedRecipe = {
      ...recipe,
      ingredients: recipe.recipe_ingredient?.map((ri: any) => ({
        ...ri,
        unit: ri.unit
      })) || [],
      tags: recipe.recipe_tag?.map((rt: any) => rt.tag) || [],
      collections: recipe.collection_recipe?.map((cr: any) => cr.collection) || [],
    };

    // Remove the join table data from the response
    const { recipe_ingredient, recipe_tag, collection_recipe, ...cleanRecipe } = transformedRecipe;

    return createSuccessResponse(cleanRecipe);
  } catch (error) {
    return handleApiError(error, "fetching recipe");
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

    // Require authentication
    const profile = await requireAuth();

    // Check if user owns the recipe or is admin
    const { data: recipe } = await supabase
      .from("recipe")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Allow editing if user owns the recipe or is admin/moderator
    const { authorized } = await checkUserRole('moderator');
    if (recipe.user_id !== profile.id && !authorized) {
      return NextResponse.json({ error: "Insufficient permissions to edit this recipe" }, { status: 403 });
    }

    const {
      name,
      description,
      instructions,
      ingredients,
      tags,
      collections,
      prep_time,
      cook_time,
      total_time,
      link,
    } = await req.json();

    // Update the recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipe")
      .update({
        name,
        description,
        instructions,
        prep_time,
        cook_time,
        total_time,
        link,
        updated_at: new Date().toISOString(),
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
        unit_id: ingredient.unit_id,
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
  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('permissions')) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Authentication') ? 401 : 403 });
    }
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

    // Require authentication
    const profile = await requireAuth();

    // Check if user owns the recipe or is admin
    const { data: recipe } = await supabase
      .from("recipe")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Allow deletion if user owns the recipe or is admin/moderator
    const { authorized } = await checkUserRole('moderator');
    if (recipe.user_id !== profile.id && !authorized) {
      return NextResponse.json({ error: "Insufficient permissions to delete this recipe" }, { status: 403 });
    }

    // Supabase will handle cascading deletes for related records
    const { error } = await supabase.from("recipe").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ success: true });
  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('permissions')) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Authentication') ? 401 : 403 });
    }
    return handleApiError(error, "deleting recipe");
  }
}
