import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("recipe")
    .select("id, name, description, instructions")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching recipe: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = await context.params;
  console.log(id);

  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { error } = await supabase.from("recipe").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting recipe: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
