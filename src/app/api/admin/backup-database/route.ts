import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { requireRole } from "@/lib/api";

export async function POST(request: Request) {
  try {
    // Require admin role
    await requireRole('admin');
    
    const { format } = await request.json();
    
    if (!format || !['json', 'sql'].includes(format)) {
      return NextResponse.json(
        { success: false, error: "Invalid format. Must be 'json' or 'sql'" },
        { status: 400 }
      );
    }

    console.log(`Starting database backup in ${format.toUpperCase()} format...`);
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Supabase URL is not configured.");
    }
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase anonymous key is not configured.");
    }

    // Define tables in dependency order (reverse of deletion order)
    const tables = [
      'unit',
      'tag', 
      'collection',
      'recipe',
      'recipe_ingredient',
      'recipe_tag',
      'collection_recipe'
    ];

    const backupData: Record<string, any[]> = {};
    let totalRecords = 0;

    // Fetch data from each table
    for (const table of tables) {
      console.log(`Backing up ${table}...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching ${table}: ${error.message}`);
      }

      backupData[table] = data || [];
      totalRecords += (data || []).length;
      console.log(`Backed up ${(data || []).length} records from ${table}`);
    }

    // Add metadata
    const metadata = {
      backup_date: new Date().toISOString(),
      format: format,
      total_records: totalRecords,
      tables: Object.keys(backupData).map(table => ({
        name: table,
        count: backupData[table].length
      })),
      version: "1.0",
      app: "recipe-tracker"
    };

    if (format === 'json') {
      // Return JSON format
      const jsonBackup = {
        metadata,
        data: backupData
      };

      const blob = JSON.stringify(jsonBackup, null, 2);
      const filename = `recipe-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': blob.length.toString()
        }
      });
      
    } else if (format === 'sql') {
      // Generate SQL format
      let sqlContent = '';
      
      // Add header comment
      sqlContent += `-- Recipe Tracker Database Backup\n`;
      sqlContent += `-- Generated on: ${metadata.backup_date}\n`;
      sqlContent += `-- Total records: ${totalRecords}\n`;
      sqlContent += `-- Format: SQL\n\n`;
      
      // Add table creation and data insertion for each table
      for (const table of tables) {
        const records = backupData[table];
        if (records.length === 0) continue;
        
        sqlContent += `-- Table: ${table} (${records.length} records)\n`;
        sqlContent += `DELETE FROM ${table};\n`;
        
        // Get column names from first record
        const columns = Object.keys(records[0]);
        
        for (const record of records) {
          const values = columns.map(col => {
            const value = record[col];
            if (value === null || value === undefined) {
              return 'NULL';
            } else if (typeof value === 'string') {
              // Escape single quotes in strings
              return `'${value.replace(/'/g, "''")}'`;
            } else if (typeof value === 'boolean') {
              return value ? 'TRUE' : 'FALSE';
            } else if (typeof value === 'object') {
              // Handle JSON objects/arrays
              return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
            } else {
              return value.toString();
            }
          });
          
          sqlContent += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        sqlContent += `\n`;
      }
      
      // Add footer
      sqlContent += `-- Backup completed successfully\n`;
      sqlContent += `-- Total records exported: ${totalRecords}\n`;
      
      const filename = `recipe-tracker-backup-${new Date().toISOString().split('T')[0]}.sql`;
      
      return new NextResponse(sqlContent, {
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': sqlContent.length.toString()
        }
      });
    }

  } catch (error: any) {
    if (error.message.includes('permissions') || error.message.includes('role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    console.error("Error creating backup:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create backup",
        details: error.message
      },
      { status: 500 }
    );
  }
}
