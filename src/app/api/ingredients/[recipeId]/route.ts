import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { recipeId: string } }
) {
  try {
    const supabase = await createClient();
    const { recipeId } = await context.params;

    if (!recipeId) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    // First, fetch ingredients
    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from("recipe_ingredient")
      .select("id, recipe_id, name, amount, unit_id, note, position")
      .eq("recipe_id", recipeId)
      .order("position", { ascending: true });

    if (ingredientsError) {
      throw ingredientsError;
    }

    if (!ingredientsData || ingredientsData.length === 0) {
      return createSuccessResponse([]);
    }

    // Get unique unit IDs
    const unitIds = [...new Set(ingredientsData.map(ing => ing.unit_id))];

    // Fetch unit information
    const { data: unitsData, error: unitsError } = await supabase
      .from("unit")
      .select("id, name, symbol")
      .in("id", unitIds);

    if (unitsError) {
      throw unitsError;
    }

    // Create a map of units for quick lookup
    const unitsMap = new Map(unitsData?.map(unit => [unit.id, unit]) || []);

    // Format the data to match the RecipeIngredient type
    const formattedIngredients = ingredientsData.map((ingredient) => ({
      id: ingredient.id,
      recipeId: ingredient.recipe_id,
      name: ingredient.name,
      amount: ingredient.amount,
      unit: unitsMap.get(ingredient.unit_id) || { id: ingredient.unit_id, name: "unknown", symbol: "" },
      note: ingredient.note,
    }));

    return createSuccessResponse(formattedIngredients);
  } catch (error) {
    return handleApiError(error, "fetching recipe ingredients");
  }
}
