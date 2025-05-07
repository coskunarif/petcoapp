/**
 * Types for authentication
 */

export type LoginProvider = 'google' | 'apple' | 'facebook';

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_image_url?: string;
  location?: any; // Geography type from PostGIS
  bio?: string;
  credit_balance: number;
  rating?: number;
  created_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}