import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";
import { userCollectionFavoriteFormSchema } from "@/lib/schemas";
import { ZodError } from "zod";

export async function GET() {
  try {
    // Require authentication
    const profile = await requireAuth();
    const supabase = await createClient();

    // Fetch user's collection favorites
    const { data, error } = await supabase
      .from("user_collection_favorite")
      .select(`
        *,
        collection:collection_id (
          id,
          name,
          description,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Supabase error fetching collection favorites:', error);
      return createSuccessResponse([]);
    }
    
    return createSuccessResponse(data || []);
  } catch (error: any) {
    console.error('Collection favorites API error:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return createSuccessResponse([]);
  }
}

export async function POST(request: Request) {
  try {
    
    // Require authentication
    const profile = await requireAuth();

    const supabase = await createClient();
    const body = await request.json();

    // Validate with Zod schema
    const validatedData = userCollectionFavoriteFormSchema.parse(body);

    // Check if already favorited
    const { data: existing } = await supabase
      .from("user_collection_favorite")
      .select("id")
      .eq("user_id", profile.id)
      .eq("collection_id", validatedData.collection_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Collection is already favorited" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("user_collection_favorite")
      .insert([
        { 
          user_id: profile.id,
          collection_id: validatedData.collection_id
        },
      ])
      .select("*");

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error: any) {
    console.error('POST /api/user/collection-favorites - Error:', error);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "creating collection favorite");
  }
}

