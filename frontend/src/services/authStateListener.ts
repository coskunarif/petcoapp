import { supabase } from '../supabaseClient';
import { loginSuccess, logout } from '../redux/slices/authSlice';
import { getUserProfile } from './authService';
import { Store } from '@reduxjs/toolkit';

/**
 * Sets up a listener for authentication state changes
 * @param store Redux store
 */
export function setupAuthStateListener(store: Store) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log(`[Auth] State changed: ${event}`);
      
      // Handle auth events
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if email is verified
        if (session.user.email_confirmed_at || session.user.confirmed_at) {
          try {
            // Get user profile from database
            const userProfile = await getUserProfile(session.user.id);
            // Merge auth user with profile data
            const user = {
              ...session.user,
              ...userProfile
            };
            // Update Redux store with user info
            store.dispatch(loginSuccess(user));
          } catch (error) {
            console.error('[Auth] Error loading user profile:', error);
            // Still dispatch login with just the auth user
            store.dispatch(loginSuccess(session.user));
          }
        } else {
          console.log('[Auth] User email not verified');
          // Don't log in if email isn't verified
        }
      } else if (event === 'SIGNED_OUT') {
        store.dispatch(logout());
      } else if (event === 'USER_UPDATED') {
        // Handle email verification
        if (session?.user?.email_confirmed_at || session?.user?.confirmed_at) {
          try {
            // Get user profile from database
            const userProfile = await getUserProfile(session.user.id);
            // Merge auth user with profile data
            const user = {
              ...session.user,
              ...userProfile
            };
            // Update Redux store with user info
            store.dispatch(loginSuccess(user));
          } catch (error) {
            console.error('[Auth] Error loading user profile:', error);
            // Still dispatch login with just the auth user
            store.dispatch(loginSuccess(session.user));
          }
        }
      }
    }
  );
  
  return subscription;
}

/**
 * Initialize auth from session
 * @param store Redux store
 */
export async function initializeAuth(store: Store) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    // Check if email is verified
    if (session.user.email_confirmed_at || session.user.confirmed_at) {
      try {
        // Get user profile from database
        const userProfile = await getUserProfile(session.user.id);
        // Merge auth user with profile data
        const user = {
          ...session.user,
          ...userProfile
        };
        // Update Redux store with user info
        store.dispatch(loginSuccess(user));
      } catch (error) {
        console.error('[Auth] Error loading initial user profile:', error);
        // Still dispatch login with just the auth user
        store.dispatch(loginSuccess(session.user));
      }
    } else {
      console.log('[Auth] User email not verified on initialization');
      // Don't log in if email isn't verified
    }
  }
}