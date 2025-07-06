import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();

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
          link,
          recipe_tag (
            tag:tag_id (
              id,
              name
            )
          )
        )
      `)
      .eq("collection_id", id);

    if (error) {
      throw error;
    }

    const recipes = data.map((item: any) => {
      if (!item.recipe) return null;
      
      const recipe = item.recipe as any;
      return {
        ...recipe,
        tags: recipe.recipe_tag?.map((rt: any) => rt.tag) || []
      };
    }).filter(Boolean);
    
    return createSuccessResponse(recipes);
  } catch (error) {
    return handleApiError(error, "fetching collection recipe");
  }
}