import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  loading: false,
  error: null,
  requestsTabAsProvider: true, // default to 'As Provider'
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
    setRequestsTabAsProvider(state, action) {
      state.requestsTabAsProvider = action.payload;
    },
  },
});

export const { setServices, addService, removeService, setRequestsTabAsProvider } = serviceSlice.actions;
export default serviceSlice.reducer;
