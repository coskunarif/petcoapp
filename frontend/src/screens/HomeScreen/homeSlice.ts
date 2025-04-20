import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDashboardData } from './hooks';
import { HomeDashboardData } from './types';

interface HomeState {
  credits: number;
  upcomingServices: {
    asProvider: any[];
    asRequester: any[];
  };
  nearbyProviders: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  credits: 0,
  upcomingServices: { asProvider: [], asRequester: [] },
  nearbyProviders: [],
  isLoading: false,
  error: null,
};

export const fetchHomeDashboard = createAsyncThunk(
  'home/fetchDashboard',
  async (params: { userId: string; lat: number; lng: number }) => {
    const data: HomeDashboardData = await fetchDashboardData(params.userId, params.lat, params.lng);
    return data;
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHomeDashboard.fulfilled, (state, action) => {
        state.credits = action.payload.userCredits;
        state.upcomingServices = action.payload.upcomingServices;
        state.nearbyProviders = action.payload.nearbyProviders;
        state.isLoading = false;
      })
      .addCase(fetchHomeDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export default homeSlice.reducer;
