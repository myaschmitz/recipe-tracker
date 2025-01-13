import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.from("recipe").select("*");

  if (error) {
    console.log(`Error fetching recipes: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("recipe")
      .insert([
        {
          name: body.name,
          description: body.description,
          ingredients: body.ingredients,
          instructions: body.instructions,
          tags: body.tags,
        },
      ])
      .select()
      .single();

    if (error) {
      console.log(`Error creating recipe: ${error}`);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.log(`Error creating recipe: ${error}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
