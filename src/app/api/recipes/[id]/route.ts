import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("recipe")
      .select("id, name, description, instructions, prep_time, cook_time, total_time, link")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching recipe(s)");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    const { error } = await supabase.from("recipe").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "deleting recipe");
  }
}
