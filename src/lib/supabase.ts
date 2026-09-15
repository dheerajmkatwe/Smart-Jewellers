import { createClient } from '@supabase/supabase-js';

// Fallback configuration if Supabase environment variables are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-smart-jewellers.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.demo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
