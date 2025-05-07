import { supabase } from '../supabaseClient';
import { LoginProvider, User } from '../types/auth';

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign in with OAuth provider (Google, Apple, Facebook)
 */
export async function signInWithOAuth(provider: LoginProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'petcoapp://auth-callback',
    },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Sign up a new user with email, password and profile information
 */
export async function signUp(email: string, password: string, fullName: string) {
  // 1. Create auth user with email confirmation
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'petcoapp://auth-callback',
      data: {
        full_name: fullName,
      }
    }
  });
  
  if (error) throw error;
  
  // 2. Insert user profile
  const user = data.user;
  
  if (user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: email,
          full_name: fullName,
          credit_balance: 10, // Default starting credit
        },
      ]);
      
    if (profileError) throw profileError;
  } else {
    throw new Error('Signup failed: No user returned');
  }
  
  return data;
}

/**
 * Request password reset for a user
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'petcoapp://reset-password',
  });
  
  if (error) throw error;
  return data;
}

/**
 * Update user password
 */
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  
  if (error) throw error;
  return data;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

/**
 * Get user profile information
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Upload user profile image
 */
export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/profile.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, { upsert: true });
    
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}