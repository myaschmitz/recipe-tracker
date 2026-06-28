import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api";
import testData from "../../../../../test-data.json";

export async function POST() {
  try {
    const supabase = await createClient();
    // Require admin role
    await requireRole('admin');

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file.");
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase anonymous key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
    }

    // Clear existing data in reverse dependency order
    await supabase.from("collection_recipe").delete().neq("collection_id", 0);
    await supabase.from("recipe_tag").delete().neq("recipe_id", 0);
    await supabase.from("recipe_ingredient").delete().neq("id", 0);
    await supabase.from("recipe").delete().neq("id", 0);
    await supabase.from("collection").delete().neq("id", 0);
    await supabase.from("tag").delete().neq("id", 0);
    await supabase.from("unit").delete().neq("id", 0);
    // Note: Skipping profiles as they're linked to Supabase auth users

    // Insert units
    const { error: unitsError } = await supabase
      .from("unit")
      .insert(testData.units);
    
    if (unitsError) {
      throw new Error(`Error inserting units: ${unitsError.message}`);
    }

    // Insert tags
    const { error: tagsError } = await supabase
      .from("tag")
      .insert(testData.tags);
    
    if (tagsError) {
      throw new Error(`Error inserting tags: ${tagsError.message}`);
    }

    // Note: Skipping profiles insertion as they're managed by Supabase auth

    // Insert collections
    const { error: collectionsError } = await supabase
      .from("collection")
      .insert(testData.collections);
    
    if (collectionsError) {
      throw new Error(`Error inserting collections: ${collectionsError.message}`);
    }

    // Insert recipes
    const { error: recipesError } = await supabase
      .from("recipe")
      .insert(testData.recipes);
    
    if (recipesError) {
      throw new Error(`Error inserting recipes: ${recipesError.message}`);
    }

    // Insert recipe ingredients
    const { error: ingredientsError } = await supabase
      .from("recipe_ingredient")
      .insert(testData.recipe_ingredients);
    
    if (ingredientsError) {
      throw new Error(`Error inserting recipe ingredients: ${ingredientsError.message}`);
    }

    // Insert recipe tags
    const { error: recipeTagsError } = await supabase
      .from("recipe_tag")
      .insert(testData.recipe_tags);
    
    if (recipeTagsError) {
      throw new Error(`Error inserting recipe tags: ${recipeTagsError.message}`);
    }

    // Insert collection recipes
    const { error: collectionRecipesError } = await supabase
      .from("collection_recipe")
      .insert(testData.collection_recipes);
    
    if (collectionRecipesError) {
      throw new Error(`Error inserting collection recipes: ${collectionRecipesError.message}`);
    }

    // Reset sequences to avoid primary key conflicts when creating new records
    try {
      const { error } = await supabase.rpc('reset_sequences');
      if (error) {
        console.warn('Failed to reset sequences:', error);
      } else {
      }
    } catch (err) {
      console.warn('Could not execute sequence reset:', err);
    }

    return NextResponse.json({
      success: true,
      message: "Test data generated successfully",
      data: {
        units: testData.units.length,
        tags: testData.tags.length,
        recipes: testData.recipes.length,
        collections: testData.collections.length,
        ingredients: testData.recipe_ingredients.length,
        recipe_tags: testData.recipe_tags.length,
        collection_recipes: testData.collection_recipes.length,
      }
    });

  } catch (error: any) {
    if (error.message.includes('permissions') || error.message.includes('role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    console.error("Error generating test data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate test data",
        details: error.message
      },
      { status: 500 }
    );
  }
}
