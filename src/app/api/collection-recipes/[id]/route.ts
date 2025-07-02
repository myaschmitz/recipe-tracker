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
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("collection_recipe")
      .select(`
        recipe_id,
        recipe:recipe_id (
          id,
          name,
          description,
          instructions,
          prep_time,
          cook_time,
          total_time,
          link
        )
      `)
      .eq("collection_id", id);

    if (error) {
      throw error;
    }

    const recipes = data.map(item => item.recipe).filter(Boolean);
    return createSuccessResponse(recipes);
  } catch (error) {
    return handleApiError(error, "fetching collection recipe");
  }
}