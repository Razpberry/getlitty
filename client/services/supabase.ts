import { createClient } from '@supabase/supabase-js';

// Placeholders for environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check if env vars are set properly for the demo
export const isSupabaseConfigured = () => {
  return process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY;
};