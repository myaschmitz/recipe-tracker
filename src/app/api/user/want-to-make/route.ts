import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";
import { userWantToMakeFormSchema } from "@/lib/schemas";
import { ZodError } from "zod";

export async function GET() {
  try {
    // Require authentication
    const profile = await requireAuth();
    const supabase = await createClient();

    // Fetch user's want-to-make recipes
    const { data, error } = await supabase
      .from("user_want_to_make")
      .select(`
        *,
        recipe:recipe_id (
          id,
          name,
          description,
          prep_time,
          cook_time,
          total_time,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Supabase error fetching want-to-make recipes:', error);
      return createSuccessResponse([]);
    }
    
    return createSuccessResponse(data || []);
  } catch (error: any) {
    console.error('Want-to-make recipes API error:', error);
    
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return createSuccessResponse([]);
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/user/want-to-make - Starting...');
    
    // Require authentication
    const profile = await requireAuth();
    console.log('Authentication successful, profile:', { id: profile.id });

    const supabase = await createClient();
    const body = await request.json();
    console.log('Request body:', body);

    // Validate with Zod schema
    const validatedData = userWantToMakeFormSchema.parse(body);
    console.log('Data validated:', validatedData);

    // Check if already marked as want-to-make
    const { data: existing } = await supabase
      .from("user_want_to_make")
      .select("id")
      .eq("user_id", profile.id)
      .eq("recipe_id", validatedData.recipe_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Recipe is already marked as want-to-make" },
        { status: 409 }
      );
    }

    console.log('Creating want-to-make recipe with data:', {
      user_id: profile.id,
      recipe_id: validatedData.recipe_id,
      notes: validatedData.notes
    });

    const { data, error } = await supabase
      .from("user_want_to_make")
      .insert([
        { 
          user_id: profile.id,
          recipe_id: validatedData.recipe_id,
          notes: validatedData.notes
        },
      ])
      .select("*");

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Want-to-make recipe created successfully:', data);
    return createSuccessResponse(data, 201);
  } catch (error: any) {
    console.error('POST /api/user/want-to-make - Error:', error);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "creating want-to-make recipe");
  }
}
