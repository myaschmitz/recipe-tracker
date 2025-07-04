import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";
import { collectionSchema } from "@/lib/schemas";
import { ZodError } from "zod";

export async function GET() {
  try {
    // Require authentication
    const profile = await requireAuth();

    // Fetch collections for the authenticated user and public collections
    const { data, error } = await supabase
      .from("collection")
      .select("*")
      .or(`user_id.eq.${profile.id},is_public.eq.true`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    return createSuccessResponse(data);
  } catch (error: any) {
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return handleApiError(error, "fetching collections");
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication
    const profile = await requireAuth();

    const body = await request.json();

    // Validate with Zod schema
    const validatedData = collectionSchema.parse(body);

    const { data, error } = await supabase
      .from("collection")
      .insert([
        { 
          name: validatedData.name, 
          description: validatedData.description,
          user_id: profile.id,
          is_public: validatedData.is_public || false
        },
      ])
      .select("*");

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error: any) {
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "creating collection");
  }
}
