import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { recipeId: string } }
) {
  try {
    const { recipeId } = await context.params;

    if (!recipeId) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    // fetch tags from the database
    const { data: tagIds, error: tagIdsError } = await supabase
      .from("recipe_tag")
      .select("tag_id")
      .eq("recipe_id", recipeId);

    if (tagIdsError) {
      throw tagIdsError;
    }

    if (!tagIds || tagIds.length === 0) {
      return createSuccessResponse([]);
    }

    const tagIdValues = tagIds
      .map((t) => t.tag_id)
      .filter((id) => id !== null && id !== undefined);

    const { data: tags, error: tagsError } = await supabase
      .from("tag")
      .select("id, name")
      .in("id", tagIdValues);

    if (tagsError) {
      throw tagsError;
    }

    return createSuccessResponse(tags);
  } catch (error) {
    return handleApiError(error, "fetching recipe tags");
  }
}
