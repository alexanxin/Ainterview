import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for use throughout the application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
}

if (!supabaseAnonKey) {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in environment variables');
}

// Export the supabase client, or a mock if environment variables are not set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: async () => {},
        signUp: async () => ({ data: { user: null, session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null })
      }
    };