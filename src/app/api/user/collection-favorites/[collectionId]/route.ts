import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse, requireAuth } from "@/lib/api";

export async function DELETE(
  request: Request,
  { params }: { params: { collectionId: string } }
) {
  try {
    
    // Require authentication
    const profile = await requireAuth();

    const supabase = await createClient();
    const { collectionId } = params;

    if (!collectionId) {
      return NextResponse.json(
        { error: "collectionId parameter is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_collection_favorite")
      .delete()
      .eq("user_id", profile.id)
      .eq("collection_id", parseInt(collectionId))
      .select("*");

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Collection favorite not found" },
        { status: 404 }
      );
    }

    return createSuccessResponse(data);
  } catch (error: any) {
    console.error('DELETE /api/user/collection-favorites/[collectionId] - Error:', error);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return handleApiError(error, "removing collection favorite");
  }
}
