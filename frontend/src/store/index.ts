import { configureStore } from '@reduxjs/toolkit';
import petsReducer from './petsSlice';
import authReducer from '../redux/slices/authSlice';
import homeReducer from '../redux/slices/homeSlice';
import serviceReducer from '../redux/slices/serviceSlice';
import messagingReducer from '../redux/messagingSlice';
import { setupAuthStateListener, initializeAuth } from '../services/authStateListener';

console.log('[STORE] Configuring Redux store with reducers:', {
  hasPetsReducer: !!petsReducer,
  hasAuthReducer: !!authReducer,
  hasHomeReducer: !!homeReducer,
  hasServiceReducer: !!serviceReducer,
  hasMessagingReducer: !!messagingReducer
});

const store = configureStore({
  reducer: {
    pets: petsReducer,
    auth: authReducer,
    home: homeReducer,
    services: serviceReducer, // Add the serviceReducer
    messaging: messagingReducer // Add the messagingReducer
  },
});

// Log initial state
console.log('[STORE] Initial state keys:', Object.keys(store.getState()));

// Initialize auth state from session
initializeAuth(store);

// Setup auth state listener
setupAuthStateListener(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
