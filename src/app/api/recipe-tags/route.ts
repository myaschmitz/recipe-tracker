import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("recipe_tag").select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipe tags");
  }
}
