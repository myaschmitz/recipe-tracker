import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse } from "@/lib/api";
import { collectionSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const { data, error } = await supabase.from("collection").select("*");

    if (error) {
      throw error;
    }
    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching collections");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const validatedData = collectionSchema.parse(body);

    const { data, error } = await supabase
      .from("collection")
      .insert([
        { name: validatedData.name, description: validatedData.description },
      ])
      .select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "creating collection");
  }
}
