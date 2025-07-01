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
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("collection")
      .select("id, name, description")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching collection");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("collection").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "deleting collection");
  }
}
