import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse, validateRequired } from "@/lib/api";
import { unitSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  try {
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
    const body = await request.json();

    // Basic validation for required fields
    const { name, symbol } = body;
    validateRequired({ name });

    const { data, error } = await supabase
      .from("unit")
      .insert([{ name, symbol }])
      .select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error, "creating unit");
  }
}
