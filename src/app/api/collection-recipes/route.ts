import { supabase } from "@/lib/supabaseClient";
import {
  handleApiError,
  createSuccessResponse,
  validateRequired,
} from "@/lib/api";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("collection_recipe")
      .select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching collection recipes");
  }
}

export async function POST(request: Request) {
  try {
    const { collection_id, recipe_id } = await request.json();

    validateRequired({ collection_id, recipe_id });

    const { data, error } = await supabase
      .from("collection_recipe")
      .insert([{ collection_id, recipe_id }])
      .select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error, "adding recipe to collection");
  }
}
