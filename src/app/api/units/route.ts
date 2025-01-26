import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("unit")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.log(`Error fetching tags: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
