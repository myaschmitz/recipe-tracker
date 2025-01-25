import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("recipe")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log(`Error fetching recipe: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
