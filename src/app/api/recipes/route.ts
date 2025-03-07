import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { RecipeSchema } from "@/types/database/models";
import { PostgrestError } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  const { data, error } = await supabase
    .from("recipe")
    .select("id, name, description")
    .order("created_at", { ascending: false })
    .limit(limit ? parseInt(limit) : 100000000);

  if (error) {
    console.error(`Error fetching recipes: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body: {
      name: string;
      description: string;
      instructions: string;
      ingredients: {
        name: string;
        amount: number;
        unitId: number;
        note?: string;
      }[];
      tags: number[]; // Array of tag IDs
    } = await request.json();

    // insert recipe into db
    const {
      data: recipe,
      error: recipeError,
    }: { data: RecipeSchema | null; error: PostgrestError | null } =
      await supabase
        .from("recipe")
        .insert({
          name: body.name,
          description: body.description,
          instructions: body.instructions,
        })
        .select()
        .single();

    if (recipeError) {
      console.error(`Error creating recipe: ${recipeError}`);
      return NextResponse.json({ error: recipeError.message }, { status: 500 });
    }

    if (!recipe) {
      return NextResponse.json(
        { error: "Failed to create recipe" },
        { status: 500 }
      );
    }

    if (body.ingredients?.length > 0) {
      console.log("Adding ingredients");
      console.log(body.ingredients);
      const { error: ingredientError } = await supabase
        .from("recipe_ingredient")
        .insert(
          body.ingredients.map((ingredient) => ({
            recipe_id: recipe.id,
            name: ingredient.name,
            amount: parseFloat(ingredient.amount.toString()),
            unit_id: ingredient.unitId,
            note: ingredient.note,
          }))
        );

      if (ingredientError) {
        console.error(`Error adding ingredients: ${ingredientError}`);
        return NextResponse.json(
          { error: ingredientError.message },
          { status: 500 }
        );
      }
    }

    if (body.tags?.length > 0) {
      console.log("Adding tags");
      console.log(body.tags);
      const { error: tagError } = await supabase.from("recipe_tag").insert(
        body.tags.map((tag) => ({
          recipe_id: recipe.id,
          tag_id: tag,
        }))
      );

      if (tagError) {
        console.error(`Error adding tags: ${tagError}`);
        return NextResponse.json({ error: tagError.message }, { status: 500 });
      }
    }

    return NextResponse.json(recipe, { status: 201 });
  } catch (error: unknown) {
    console.error(`Error creating recipe: ${error}`);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
