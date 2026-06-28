import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Try to create a collection with a high ID to advance the sequence
    // This will fail, but should advance the internal sequence
    try {
      await supabase
        .from('collection')
        .insert([{ name: 'TEMP_FOR_SEQUENCE' }]);
    } catch {
    }

    // Now try to create a collection normally
    const { data: testCollection, error: testError } = await supabase
      .from('collection')
      .insert([{ name: 'Sequence Test Collection', description: 'Testing sequence fix' }])
      .select();

    if (testError) {
      return NextResponse.json({ 
        success: false, 
        error: testError.message 
      }, { status: 500 });
    }

    // If successful, delete the test collection
    if (testCollection && testCollection[0]) {
      await supabase
        .from('collection')
        .delete()
        .eq('id', testCollection[0].id);
      
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sequences fixed successfully",
      nextId: testCollection[0]?.id 
    });

  } catch (error: any) {
    console.error("Error fixing sequences:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
