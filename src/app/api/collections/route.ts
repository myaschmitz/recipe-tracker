import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";
import { collectionSchema } from "@/lib/schemas";
import { ZodError } from "zod";

export async function GET(request: Request) {
  try {
    // Require authentication
    const profile = await requireAuth();
    const supabase = await createClient();

    // Parse URL parameters
    const { searchParams } = new URL(request.url);
    const userOnly = searchParams.get('user_only') === 'true';

    let query = supabase
      .from("collection")
      .select("*")
      .order("created_at", { ascending: false });

    if (userOnly) {
      // Only fetch collections owned by the current user
      query = query.eq('user_id', profile.id);
    } else {
      // Fetch collections for the authenticated user and public collections
      query = query.or(`user_id.eq.${profile.id},is_public.eq.true`);
    }

    const { data, error } = await query;

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
    console.log('POST /api/collections - Starting...');
    
    // Require authentication
    const profile = await requireAuth();
    console.log('Authentication successful, profile:', { id: profile.id, role: profile.role });

    const supabase = await createClient();
    console.log('Supabase client created');

    const body = await request.json();
    console.log('Request body:', body);

    // Validate with Zod schema
    const validatedData = collectionSchema.parse(body);
    console.log('Data validated:', validatedData);

    console.log('Creating collection with data:', {
      name: validatedData.name,
      description: validatedData.description,
      user_id: profile.id,
      is_public: validatedData.is_public || false
    });

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
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Collection created successfully:', data);
    return createSuccessResponse(data, 201);
  } catch (error: any) {
    console.error('POST /api/collections - Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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
