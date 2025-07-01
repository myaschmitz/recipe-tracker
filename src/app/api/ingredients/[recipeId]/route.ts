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

    // fetch ingredients from the database
    const { data, error } = await supabase
      .from("recipe_ingredient")
      .select("name, amount, unit_id, note")
      .eq("recipe_id", recipeId);

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipe ingredients");
  }
}
