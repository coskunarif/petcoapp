import { configureStore } from '@reduxjs/toolkit';
import petsReducer from './petsSlice';
import authReducer from '../redux/slices/authSlice';

const store = configureStore({
  reducer: {
    pets: petsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
