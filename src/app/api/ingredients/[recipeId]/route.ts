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

  // fetch ingredients from the database
  const { data, error } = await supabase
    .from("recipe_ingredient")
    .select("name, amount, unit_id, note")
    .eq("recipe_id", recipeId);

  if (error) {
    console.error(`Error fetching ingredients: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
