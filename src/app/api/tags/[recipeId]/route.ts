import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { recipeId: string } }
) {
  const { recipeId } = await context.params;

  if (!recipeId) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // fetch tags from the database
  const { data: tagIds, error: tagIdsError } = await supabase
    .from("recipe_tag")
    .select("tag_id")
    .eq("recipe_id", recipeId);
  console.log(tagIds);
  if (tagIdsError) {
    console.error(`Error fetching tags: ${tagIdsError.message}`);
    return NextResponse.json({ error: tagIdsError.message }, { status: 500 });
  }

  if (!tagIds || tagIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const { data: tags, error: tagsError } = await supabase
    .from("tag")
    .select("id, name")
    .eq(
      "id",
      tagIds.map((t) => t.tag_id)
    );
  console.log(tags);

  if (tagsError) {
    console.error(`Error fetching tags: ${tagsError.message}`);
    return NextResponse.json({ error: tagsError.message }, { status: 500 });
  }

  return NextResponse.json(tags, { status: 200 });
}
