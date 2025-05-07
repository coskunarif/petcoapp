import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import homeReducer from '../screens/HomeScreen/homeSlice';
import userReducer from './slices/userSlice';
import petReducer from './slices/petSlice';
import serviceReducer from './slices/serviceSlice';
import messagingReducer from './messagingSlice';
import { setupAuthStateListener, initializeAuth } from '../services/authStateListener';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    pets: petReducer,
    services: serviceReducer,
    home: homeReducer,
    messaging: messagingReducer,
  },
});

// Initialize auth on app startup
initializeAuth(store);

// Setup auth state listener
const authSubscription = setupAuthStateListener(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;