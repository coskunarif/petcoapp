import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Debugging manifest structure
// Directly read environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL from process.env:', supabaseUrl);
console.log('Supabase Anon Key from process.env:', supabaseAnonKey ? 'Key is present' : 'Key is missing');


if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? supabaseUrl : 'missing',
    anonKey: supabaseAnonKey ? 'present' : 'missing'
  });
  
  if (!supabaseUrl) {
    throw new Error('supabaseUrl is required.');
  }
  
  if (!supabaseAnonKey) {
    throw new Error('supabaseAnonKey is required.');
  }
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
