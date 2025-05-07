import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HomeDashboardData, ServiceRequest, Provider } from '../../screens/HomeScreen/types';
import { LocationCoords, DEFAULT_LOCATION } from '../../services/locationService';
import * as homeService from '../../services/homeService';

interface ServiceType {
  id: string;
  name: string;
  description?: string;
  credit_value?: number;
  icon?: string;
}

interface HomeState {
  // Service types and UI state
  serviceTypes: ServiceType[];
  requestServiceModalVisible: boolean;
  offerServiceModalVisible: boolean;
  loading: boolean;
  error: string | null;
  
  // User location
  location: LocationCoords;
  
  // Dashboard data
  userCredits: number;
  upcomingServices: {
    asProvider: ServiceRequest[];
    asRequester: ServiceRequest[];
  };
  nearbyProviders: Provider[];
  lastUpdated: number | null;
}

const initialState: HomeState = {
  serviceTypes: [],
  requestServiceModalVisible: false,
  offerServiceModalVisible: false,
  loading: false,
  error: null,
  
  location: DEFAULT_LOCATION,
  
  userCredits: 0,
  upcomingServices: {
    asProvider: [],
    asRequester: [],
  },
  nearbyProviders: [],
  lastUpdated: null,
};

// Fetch service types for dropdown selections
export const fetchServiceTypes = createAsyncThunk(
  'home/fetchServiceTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await homeService.fetchServiceTypes();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch service types');
    }
  }
);

// Fetch complete dashboard data
export const fetchDashboardData = createAsyncThunk(
  'home/fetchDashboardData',
  async ({ 
    userId, 
    location, 
    radiusKm = 10 
  }: { 
    userId: string; 
    location: LocationCoords; 
    radiusKm?: number 
  }, 
  { rejectWithValue }) => {
    try {
      return await homeService.fetchHomeDashboardData(userId, location, radiusKm);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard data');
    }
  }
);

// Create a service listing (offering a service)
export const createServiceListing = createAsyncThunk(
  'home/createServiceListing',
  async ({
    userId,
    serviceData,
  }: {
    userId: string;
    serviceData: {
      service_type_id: string;
      title: string;
      description: string;
      location: LocationCoords;
      availability_schedule: any;
    };
  },
  { rejectWithValue }) => {
    try {
      return await homeService.createServiceListing(userId, serviceData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create service listing');
    }
  }
);

// Create a service request
export const createServiceRequest = createAsyncThunk(
  'home/createServiceRequest',
  async ({
    userId,
    requestData,
  }: {
    userId: string;
    requestData: {
      service_type_id: string;
      provider_id?: string;
      pet_id?: string;
      start_time: string;
      end_time?: string;
      location?: LocationCoords;
      notes?: string;
      credit_amount?: number;
    };
  },
  { rejectWithValue }) => {
    try {
      return await homeService.createServiceRequest(userId, requestData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create service request');
    }
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    // Modal controls
    showRequestServiceModal: (state) => {
      state.requestServiceModalVisible = true;
    },
    hideRequestServiceModal: (state) => {
      state.requestServiceModalVisible = false;
    },
    showOfferServiceModal: (state) => {
      state.offerServiceModalVisible = true;
    },
    hideOfferServiceModal: (state) => {
      state.offerServiceModalVisible = false;
    },
    
    // Location management
    setLocation: (state, action: PayloadAction<LocationCoords>) => {
      state.location = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset dashboard data
    resetDashboardData: (state) => {
      state.userCredits = 0;
      state.upcomingServices = { asProvider: [], asRequester: [] };
      state.nearbyProviders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Service Types
    builder.addCase(fetchServiceTypes.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchServiceTypes.fulfilled, (state, action) => {
      state.serviceTypes = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchServiceTypes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch service types';
    });
    
    // Dashboard Data
    builder.addCase(fetchDashboardData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      const data = action.payload;
      state.userCredits = data.userCredits;
      state.upcomingServices = data.upcomingServices;
      state.nearbyProviders = data.nearbyProviders;
      state.lastUpdated = Date.now();
      state.loading = false;
      state.error = data.error || null;
    });
    builder.addCase(fetchDashboardData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch dashboard data';
    });
    
    // Service Listing
    builder.addCase(createServiceListing.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createServiceListing.fulfilled, (state) => {
      state.loading = false;
      state.offerServiceModalVisible = false;
    });
    builder.addCase(createServiceListing.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to create service listing';
    });
    
    // Service Request
    builder.addCase(createServiceRequest.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createServiceRequest.fulfilled, (state) => {
      state.loading = false;
      state.requestServiceModalVisible = false;
    });
    builder.addCase(createServiceRequest.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to create service request';
    });
  },
});

export const { 
  showRequestServiceModal, 
  hideRequestServiceModal,
  showOfferServiceModal,
  hideOfferServiceModal,
  setLocation,
  clearError,
  resetDashboardData
} = homeSlice.actions;

export default homeSlice.reducer;