import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, validateRequired } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("unit")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching units");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Basic validation for required fields
    const { name, symbol } = body;
    validateRequired({ name });

    // Check for existing unit with same name (case-insensitive)
    const { data: existingUnit } = await supabase
      .from("unit")
      .select("id, name, symbol")
      .ilike("name", name.trim())
      .single();

    if (existingUnit) {
      return NextResponse.json(
        { error: "A unit with this name already exists", unit: existingUnit },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("unit")
      .insert([{ name: name.trim(), symbol: symbol?.trim() || null }])
      .select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error, "creating unit");
  }
}
