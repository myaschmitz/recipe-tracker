import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";

export async function DELETE(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    
    // Require authentication
    const profile = await requireAuth();

    const supabase = await createClient();
    const { recipeId } = params;

    if (!recipeId) {
      return NextResponse.json(
        { error: "recipeId parameter is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_recipe_favorite")
      .delete()
      .eq("user_id", profile.id)
      .eq("recipe_id", parseInt(recipeId))
      .select("*");

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Recipe favorite not found" },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    console.error('DELETE /api/user/recipe-favorites/[recipeId] - Error:', error);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return handleApiError(error, "removing recipe favorite");
  }
}
