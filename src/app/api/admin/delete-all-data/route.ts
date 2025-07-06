import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api";

export async function DELETE() {
  try {
    const supabase = await createClient();
    // Require admin role
    await requireRole('admin');
    
    console.log("Starting database cleanup...");
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your .env.local file.");
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase anonymous key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
    }
    
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "Missing");
    console.log("Supabase Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing");

    // Delete all data in reverse dependency order
    const deletionSteps = [
      { table: "collection_recipe", description: "collection-recipe relationships" },
      { table: "recipe_tag", description: "recipe-tag relationships" },
      { table: "recipe_ingredient", description: "recipe ingredients" },
      { table: "recipe", description: "recipes" },
      { table: "collection", description: "collections" },
      { table: "tag", description: "tags" },
      { table: "unit", description: "units" }
    ];

    let deletedCounts: Record<string, number> = {};

    for (const step of deletionSteps) {
      console.log(`Deleting ${step.description}...`);
      
      // First count the records
      const { count: beforeCount } = await supabase
        .from(step.table)
        .select("*", { count: "exact", head: true });
      
      // Then delete them
      const { error } = await supabase
        .from(step.table)
        .delete()
        .neq("id", 0); // This condition ensures we delete all rows
      
      if (error) {
        console.error(`Error deleting ${step.description}:`, error);
        throw new Error(`Error deleting ${step.description}: ${error.message}`);
      }

      deletedCounts[step.table] = beforeCount || 0;
      console.log(`Deleted ${beforeCount || 0} ${step.description}`);
    }

    // Reset sequences to start from 1 for new records
    try {
      const { error } = await supabase.rpc('reset_sequences');
      if (error) {
        console.warn('Failed to reset sequences:', error);
      } else {
        console.log("Reset auto-increment sequences");
      }
    } catch (err) {
      console.warn('Could not execute sequence reset:', err);
    }

    console.log("Database cleanup completed successfully!");

    return NextResponse.json({
      success: true,
      message: "All data deleted successfully",
      deletedCounts: deletedCounts
    });

  } catch (error: any) {
    if (error.message.includes('permissions') || error.message.includes('role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    console.error("Error deleting data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete data",
        details: error.message
      },
      { status: 500 }
    );
  }
}
