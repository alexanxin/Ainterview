import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for use throughout the application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }
    })
  : {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
        upsert: () => ({ data: [], error: null }),
        delete: () => ({ data: [], error: null }),
      }),
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signIn: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      }
    };