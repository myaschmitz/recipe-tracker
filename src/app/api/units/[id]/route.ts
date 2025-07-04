import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse, validateRequired } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("unit")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching unit");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const { name, symbol } = await req.json();
    validateRequired({ name });

    const { data, error } = await supabase
      .from("unit")
      .update({ name, symbol })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "updating unit");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Invalid unit ID" }, { status: 400 });
    }

    const { error } = await supabase.from("unit").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "deleting unit");
  }
}
