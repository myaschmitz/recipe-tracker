import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sprjogwievnnaruzjhqw.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

if (!supabaseKey) {
  throw new Error(
    "Supabase key is missing. Please set the SUPABASE_KEY environment variable."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
