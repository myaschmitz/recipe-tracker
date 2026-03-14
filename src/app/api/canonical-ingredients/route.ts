import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, validateRequired } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("ingredient")
      .select("id, name, category")
      .order("name", { ascending: true });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching ingredients");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { name, category } = body;
    validateRequired({ name });

    // Check for existing ingredient with same name (case-insensitive)
    const { data: existingIngredient } = await supabase
      .from("ingredient")
      .select("id, name, category")
      .ilike("name", name.trim())
      .single();

    if (existingIngredient) {
      return NextResponse.json(
        { error: "An ingredient with this name already exists", ingredient: existingIngredient },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("ingredient")
      .insert([{ name: name.trim(), category: category?.trim() || null }])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error, "creating ingredient");
  }
}
