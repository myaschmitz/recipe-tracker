import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";
import { userWantToMakeFormSchema } from "@/lib/schemas";
import { ZodError } from "zod";

export async function PUT(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    
    // Require authentication
    const profile = await requireAuth();

    const supabase = await createClient();
    const { recipeId } = params;
    const body = await request.json();

    if (!recipeId) {
      return NextResponse.json(
        { error: "recipeId parameter is required" },
        { status: 400 }
      );
    }

    // Validate with Zod schema (only notes field is updatable)
    const validatedData = userWantToMakeFormSchema.pick({ notes: true }).parse(body);

    // Check if the record exists for this user
    const { data: existing } = await supabase
      .from("user_want_to_make")
      .select("id")
      .eq("user_id", profile.id)
      .eq("recipe_id", parseInt(recipeId))
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Want-to-make recipe not found" },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("user_want_to_make")
      .update({
        notes: validatedData.notes
      })
      .eq("user_id", profile.id)
      .eq("recipe_id", parseInt(recipeId))
      .select("*");

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    console.error('PUT /api/user/want-to-make/[recipeId] - Error:', error);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error, "updating want-to-make recipe");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  try {
    
    // Require authentication
    const profile = await requireAuth();

    const supabase = await createClient();
    const { recipeId } = params;

    if (!recipeId) {
      return NextResponse.json(
        { error: "recipeId parameter is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_want_to_make")
      .delete()
      .eq("user_id", profile.id)
      .eq("recipe_id", parseInt(recipeId))
      .select("*");

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Want-to-make recipe not found" },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    console.error('DELETE /api/user/want-to-make/[recipeId] - Error:', error);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return handleApiError(error, "removing want-to-make recipe");
  }
}
