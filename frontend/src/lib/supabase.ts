import { createClient } from '@supabase/supabase-js';

// Use process.env directly instead of Constants
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('[lib/supabase] URL:', supabaseUrl);
console.log('[lib/supabase] Anon Key:', supabaseAnonKey ? 'Key is present' : 'Key is missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[lib/supabase] Missing Supabase environment variables');
  throw new Error('Missing Supabase configuration in lib/supabase.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
