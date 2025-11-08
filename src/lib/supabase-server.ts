import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL is not set in environment variables");
}

if (!supabaseServiceRoleKey) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
}

// Export the server-side supabase client
export const supabaseServer = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceRoleKey || "placeholder-key"
);
