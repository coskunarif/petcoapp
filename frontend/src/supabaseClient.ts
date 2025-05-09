import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Different ways to access environment variables in Expo
const getEnvVars = () => {
  try {
    // For Expo SDK 49+
    if (Constants.expoConfig?.extra) {
      return {
        supabaseUrl: Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: Constants.expoConfig.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY
      };
    }
    
    // For older Expo SDK
    if (Constants.manifest?.extra) {
      return {
        supabaseUrl: Constants.manifest.extra.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: Constants.manifest.extra.EXPO_PUBLIC_SUPABASE_ANON_KEY
      };
    }

    // Direct process.env access (works in some cases)
    return {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    };
  } catch (error) {
    console.error('Error accessing environment variables:', error);
    return { supabaseUrl: null, supabaseAnonKey: null };
  }
};

// Get environment variables
const { supabaseUrl, supabaseAnonKey } = getEnvVars();

console.log('Supabase environment variables:');
console.log('- URL:', supabaseUrl || 'missing');
console.log('- Anon Key:', supabaseAnonKey ? 'present' : 'missing');

// Fall back to hardcoded values for development - IMPORTANT: Replace these with your actual values
const FALLBACK_SUPABASE_URL = 'https://xuzalrplthlhilzajrkl.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1emFscnBsdGhsaGlsemFqcmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NjUwNDQsImV4cCI6MTk5ODU0MTA0NH0.i_8QiJQnHF18_yxUHJMnlkQrUGXzL9YqYK3_9e6HaHs';

// Use environment variables or fall back to hardcoded values to avoid runtime errors
const finalSupabaseUrl = supabaseUrl || FALLBACK_SUPABASE_URL;
const finalSupabaseAnonKey = supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

if (!finalSupabaseUrl || !finalSupabaseAnonKey) {
  console.error('Critical error: Missing Supabase connection details even after fallbacks');
  throw new Error('Supabase connection details are required');
}

export const supabase = createClient(
  finalSupabaseUrl,
  finalSupabaseAnonKey
);
