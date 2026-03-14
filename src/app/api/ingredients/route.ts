import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("recipe_ingredient")
      .select(`
        id, recipe_id, name, amount, unit_id, ingredient_id, note, position,
        unit (
          id, name, symbol
        )
      `)
      .order("position", { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipe ingredients");
  }
}
