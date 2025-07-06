import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  
  if (!idsParam) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }
  
  const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
  
  const { data, error } = await supabase
    .from("recipe")
    .select("*")
    .in("id", ids);
    
  return createSuccessResponse(data);
}