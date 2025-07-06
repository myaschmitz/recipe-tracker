import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth, checkUserRole } from "@/lib/api";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    // Require authentication for viewing collections
    const profile = await requireAuth();

    const supabase = await createClient();

    // Fetch collection with access control (user's own or public)
    const { data, error } = await supabase
      .from("collection")
      .select("*")
      .eq("id", id)
      .or(`user_id.eq.${profile.id},is_public.eq.true`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Collection not found or access denied" }, { status: 404 });
      }
      throw error;
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return handleApiError(error, "fetching collection");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
        { status: 400 }
      );
    }

    // Require authentication
    const profile = await requireAuth();

    const supabase = await createClient();

    // Check if user owns the collection or is admin/moderator
    const { data: collection } = await supabase
      .from("collection")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Allow deletion if user owns the collection or is admin/moderator
    const { authorized } = await checkUserRole('moderator');
    if (collection.user_id !== profile.id && !authorized) {
      return NextResponse.json({ error: "Insufficient permissions to delete this collection" }, { status: 403 });
    }

    const { error } = await supabase.from("collection").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ success: true });
  } catch (error: any) {
    if (error.message.includes('Authentication required') || error.message.includes('permissions')) {
      return NextResponse.json({ error: error.message }, { status: error.message.includes('Authentication') ? 401 : 403 });
    }
    return handleApiError(error, "deleting collection");
  }
}
