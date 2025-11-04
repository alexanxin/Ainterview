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

// Export the server-side supabase client, or a mock if environment variables are not set
export const supabaseServer =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
              order: () => ({ data: [], error: null }),
            }),
            gte: () => ({
              lt: async () => ({ data: [], error: null }),
            }),
          }),
          insert: (insertData: unknown) => ({
            select: () => ({
              single: async () => ({ data: insertData, error: null }),
            }),
            returning: () => ({
              select: () => ({
                single: async () => ({ data: insertData, error: null }),
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: async () => ({ data: [], error: null }),
            }),
          }),
        }),
      };
