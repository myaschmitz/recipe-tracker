import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tag")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching tags");
  }
}
