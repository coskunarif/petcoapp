import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices(state, action) {
      state.services = action.payload;
    },
    addService(state, action) {
      state.services.push(action.payload);
    },
    removeService(state, action) {
      state.services = state.services.filter(s => s.id !== action.payload);
    },
  },
});

export const { setServices, addService, removeService } = serviceSlice.actions;
export default serviceSlice.reducer;
