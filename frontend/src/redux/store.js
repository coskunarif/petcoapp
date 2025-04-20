import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import homeReducer from '../screens/HomeScreen/homeSlice';
import userReducer from './slices/userSlice';
import petReducer from './slices/petSlice';
import serviceReducer from './slices/serviceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    pets: petReducer,
    services: serviceReducer,
    home: homeReducer,
  },
});
