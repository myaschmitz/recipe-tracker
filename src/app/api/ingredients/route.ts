import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("recipe_ingredient")
      .select(`
        *,
        unit (
          id, name, symbol
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipe ingredients");
  }
}
