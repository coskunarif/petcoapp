import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import { AuthState, LoginProvider } from '../../types/auth';

// Initial state with TypeScript interface
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// Async thunks for authentication actions
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.signInWithEmail(email, password);
      
      // Get the user profile after authentication
      if (data.user) {
        const profile = await authService.getUserProfile(data.user.id);
        return { ...data.user, ...profile };
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const loginWithSocial = createAsyncThunk(
  'auth/loginWithSocial',
  async (provider: LoginProvider, { rejectWithValue }) => {
    try {
      const data = await authService.signInWithOAuth(provider);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Social login failed');
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password, fullName }: { email: string; password: string; fullName: string }, { rejectWithValue }) => {
    try {
      const data = await authService.signUp(email, password, fullName);
      
      // Get the user profile after creating the account
      if (data.user) {
        const profile = await authService.getUserProfile(data.user.id);
        return { ...data.user, ...profile };
      }
      
      return data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const resetPasswordRequest = createAsyncThunk(
  'auth/resetPasswordRequest',
  async (email: string, { rejectWithValue }) => {
    try {
      await authService.resetPassword(email);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Password reset request failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.signOut();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ userId, updates }: { userId: string; updates: any }, { rejectWithValue }) => {
    try {
      const updatedProfile = await authService.updateUserProfile(userId, updates);
      return updatedProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

// Auth slice with reducers and extra reducers for thunks
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // For compatibility with existing code
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<any>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login with email
    builder.addCase(loginWithEmail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginWithEmail.fulfilled, (state, action) => {
      state.isAuthenticated = !!action.payload;
      state.user = action.payload;
      state.loading = false;
    });
    builder.addCase(loginWithEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Login with social
    builder.addCase(loginWithSocial.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginWithSocial.fulfilled, (state, action) => {
      // OAuth redirects, so we might not have a direct response
      // This will be handled by the auth state change listener
      state.loading = false;
    });
    builder.addCase(loginWithSocial.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Sign up
    builder.addCase(signUpUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.isAuthenticated = !!action.payload;
      state.user = action.payload;
      state.loading = false;
    });
    builder.addCase(signUpUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
    });
    
    // Update profile
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    });
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;