import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export function requireSupabase() {
  if (!supabase) throw new Error('Supabase configuration is missing. Set environment variables and restart the app.');
  return supabase;
}
export function isAdmin(session) { return session?.user?.app_metadata?.portfolio_admin === true; }
