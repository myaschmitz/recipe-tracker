import { supabase } from "@/lib/supabaseClient";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tag")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "fetching tags");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return Response.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const { data: existingTag } = await supabase
      .from("tag")
      .select("*")
      .eq("name", name.trim())
      .single();

    if (existingTag) {
      return Response.json(
        { error: "A tag with this name already exists" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("tag")
      .insert([{ name: name.trim() }])
      .select();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, "creating tag");
  }
}
