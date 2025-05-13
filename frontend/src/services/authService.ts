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
  console.log(`[authService] Updating profile for user ${userId} with:`, updates);

  try {
    // First check if the user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, phone, email, full_name')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error(`[authService] Error checking user existence:`, fetchError);
      throw fetchError;
    }

    if (!existingUser) {
      console.error(`[authService] User ${userId} not found in the database`);
      throw new Error(`User not found. Please log out and in again.`);
    }

    console.log(`[authService] Existing user found:`, existingUser);

    // Sanitize phone number if present
    if (updates.phone) {
      // Remove any extra whitespace
      updates.phone = updates.phone.trim();
      console.log(`[authService] Formatted phone number:`, updates.phone);
    }

    // Update the user profile
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error(`[authService] Error updating user profile:`, error);

      // Provide more specific error messages for common issues
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('This phone number is already in use by another account.');
      } else if (error.code === '23502') { // Not null violation
        throw new Error('Required information is missing.');
      } else if (error.code === '42703') { // Undefined column
        throw new Error('System error: Some fields could not be updated. Please try again later.');
      } else {
        throw error;
      }
    }

    console.log(`[authService] Profile updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`[authService] Unexpected error updating profile:`, error);
    throw error;
  }
}

/**
 * Upload user profile image
 */
export async function uploadProfileImage(userId: string, file: File | Blob): Promise<string> {
  // Determine the file extension, fallback to jpg
  let fileExt = 'jpg';
  if (file instanceof File && file.name) {
    fileExt = file.name.split('.').pop() || 'jpg';
  }

  const filePath = `${userId}/profile.${fileExt}`;
  console.log(`[authService] Uploading profile image to ${filePath}`);

  try {
    // Upload the file to Supabase storage
    const { error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        upsert: true,
        contentType: file instanceof File ? file.type : `image/${fileExt}`
      });

    if (error) throw error;

    // Get the public URL for the uploaded file
    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    console.log(`[authService] Profile image uploaded successfully: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error('[authService] Error uploading profile image:', error);
    throw error;
  }
}