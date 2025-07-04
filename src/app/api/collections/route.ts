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
      console.error('Supabase error fetching collections:', error);
      // Return empty array on database error to prevent frontend crashes
      return createSuccessResponse([]);
    }
    
    // Ensure we always return an array
    return createSuccessResponse(data || []);
  } catch (error: any) {
    console.error('Collections API error:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    // For any other error, return empty array to prevent frontend crashes
    // The frontend can handle empty collections gracefully
    return createSuccessResponse([]);
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
