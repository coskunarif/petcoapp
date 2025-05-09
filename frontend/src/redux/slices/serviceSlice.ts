import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { 
  fetchServices, 
  fetchServiceRequests, 
  fetchServiceTypes,
  createServiceListing,
  updateServiceListing,
  deleteServiceListing,
  createServiceRequest,
  updateServiceRequest
} from '../../api/services';
import { ServiceListing, ServiceRequest, ServiceType } from '../../types/services';

// Define the state type for services slice
interface ServicesState {
  // Service listings
  listings: ServiceListing[];
  listingsLoading: boolean;
  listingsError: string | null;
  
  // Service requests
  requests: ServiceRequest[];
  requestsLoading: boolean;
  requestsError: string | null;
  
  // Service types/categories
  serviceTypes: ServiceType[];
  serviceTypesLoading: boolean;
  serviceTypesError: string | null;
  
  // UI state
  selectedServiceId: string | null;
  requestsTabAsProvider: boolean;
  selectedRequestId: string | null;
  
  // Filter states
  listingFilters: {
    typeId?: string;
    location?: { lat: number; lng: number };
    distance?: number;
    providerIds?: string[];
  };
  requestFilters: {
    status?: string[];
    typeId?: string;
  };
}

// Initial state
const initialState: ServicesState = {
  listings: [],
  listingsLoading: false,
  listingsError: null,
  
  requests: [],
  requestsLoading: false,
  requestsError: null,
  
  serviceTypes: [],
  serviceTypesLoading: false,
  serviceTypesError: null,
  
  selectedServiceId: null,
  requestsTabAsProvider: true,
  selectedRequestId: null,
  
  listingFilters: {},
  requestFilters: {},
};

// Async thunks for API calls
export const fetchServiceListings = createAsyncThunk(
  'services/fetchListings',
  async (filters: Parameters<typeof fetchServices>[0] = {}, { rejectWithValue, dispatch }) => {
    try {
      console.log('[serviceSlice] fetchServiceListings called with filters:', filters);
      
      // Set loading state manually to ensure UI updates
      dispatch({ 
        type: 'services/setListingsLoading', 
        payload: true 
      });
      
      const { data, error } = await fetchServices(filters);
      
      if (error) {
        console.error('[serviceSlice] Error fetching listings:', error);
        return rejectWithValue(error.message || 'Failed to fetch service listings');
      }
      
      console.log('[serviceSlice] Successfully fetched listings:', {
        count: data?.length || 0,
        success: !!data
      });
      
      return data || [];
    } catch (error: any) {
      console.error('[serviceSlice] Exception in fetchServiceListings:', error);
      return rejectWithValue(error?.message || 'Failed to fetch service listings');
    }
  }
);

export const fetchAllServiceRequests = createAsyncThunk(
  'services/fetchRequests',
  async (
    { 
      userId, 
      asProvider = true, 
      status 
    }: { 
      userId: string; 
      asProvider?: boolean;
      status?: string | string[];
    }, 
    { rejectWithValue }
  ) => {
    try {
      const params = asProvider 
        ? { provider_id: userId, status }
        : { requester_id: userId, status };
      
      const { data, error } = await fetchServiceRequests(params);
      if (error) return rejectWithValue(error.message);
      return data || [];
    } catch (error) {
      return rejectWithValue('Failed to fetch service requests');
    }
  }
);

export const fetchAllServiceTypes = createAsyncThunk(
  'services/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await fetchServiceTypes();
      if (error) return rejectWithValue(error.message);
      return data || [];
    } catch (error) {
      return rejectWithValue('Failed to fetch service types');
    }
  }
);

export const addServiceListing = createAsyncThunk(
  'services/addListing',
  async (
    listing: Omit<ServiceListing, 'id' | 'created_at'>, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await createServiceListing(listing);
      if (error) return rejectWithValue(error.message);
      return data?.[0];
    } catch (error) {
      return rejectWithValue('Failed to create service listing');
    }
  }
);

export const editServiceListing = createAsyncThunk(
  'services/editListing',
  async (
    { id, updates }: { id: string; updates: Partial<Omit<ServiceListing, 'id' | 'created_at'>> }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await updateServiceListing(id, updates);
      if (error) return rejectWithValue(error.message);
      return data?.[0];
    } catch (error) {
      return rejectWithValue('Failed to update service listing');
    }
  }
);

export const removeServiceListing = createAsyncThunk(
  'services/removeListing',
  async (
    { id, hard_delete = false }: { id: string; hard_delete?: boolean }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await deleteServiceListing(id, hard_delete);
      if (error) return rejectWithValue(error.message);
      return { id, hard_delete };
    } catch (error) {
      return rejectWithValue('Failed to delete service listing');
    }
  }
);

export const addServiceRequest = createAsyncThunk(
  'services/addRequest',
  async (
    request: Omit<ServiceRequest, 'id' | 'created_at'>, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await createServiceRequest(request);
      if (error) return rejectWithValue(error.message);
      return data?.[0];
    } catch (error) {
      return rejectWithValue('Failed to create service request');
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'services/updateRequestStatus',
  async (
    { id, status }: { id: string; status: ServiceRequest['status'] }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await updateServiceRequest(id, { status });
      if (error) return rejectWithValue(error.message);
      return data?.[0];
    } catch (error) {
      return rejectWithValue('Failed to update request status');
    }
  }
);

// Create the slice
const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // UI state actions
    setSelectedService(state, action: PayloadAction<string | null>) {
      state.selectedServiceId = action.payload;
    },
    setRequestsTabAsProvider(state, action: PayloadAction<boolean>) {
      state.requestsTabAsProvider = action.payload;
    },
    setSelectedRequest(state, action: PayloadAction<string | null>) {
      state.selectedRequestId = action.payload;
    },
    
    // Manual loading state control
    setListingsLoading(state, action: PayloadAction<boolean>) {
      state.listingsLoading = action.payload;
    },
    
    // Filter actions
    setListingFilters(state, action: PayloadAction<Partial<ServicesState['listingFilters']>>) {
      state.listingFilters = { ...state.listingFilters, ...action.payload };
    },
    clearListingFilters(state) {
      state.listingFilters = {};
    },
    setRequestFilters(state, action: PayloadAction<Partial<ServicesState['requestFilters']>>) {
      state.requestFilters = { ...state.requestFilters, ...action.payload };
    },
    clearRequestFilters(state) {
      state.requestFilters = {};
    },
    
    // Clear state actions
    clearListings(state) {
      state.listings = [];
      state.listingsError = null;
    },
    clearRequests(state) {
      state.requests = [];
      state.requestsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch service listings
    builder.addCase(fetchServiceListings.pending, (state) => {
      state.listingsLoading = true;
      state.listingsError = null;
      // Don't clear listings here - keep the old ones until new ones arrive
    });
    builder.addCase(fetchServiceListings.fulfilled, (state, action) => {
      console.log('[serviceSlice] fetchServiceListings.fulfilled with payload:', {
        payloadExists: !!action.payload,
        payloadType: typeof action.payload,
        isArray: Array.isArray(action.payload),
        length: Array.isArray(action.payload) ? action.payload.length : 0
      });
      
      // Ensure we have a valid array even if payload is null/undefined
      if (action.payload && Array.isArray(action.payload)) {
        state.listings = action.payload as ServiceListing[];
      } else {
        // Default to empty array if payload isn't valid
        console.warn('[serviceSlice] Invalid payload for listings, defaulting to empty array');
        state.listings = [];
      }
      
      state.listingsLoading = false;
    });
    builder.addCase(fetchServiceListings.rejected, (state, action) => {
      state.listingsError = action.payload as string;
      state.listingsLoading = false;
      // Keep the old listings on error to avoid UI flashing
    });
    
    // Fetch service requests
    builder.addCase(fetchAllServiceRequests.pending, (state) => {
      state.requestsLoading = true;
      state.requestsError = null;
    });
    builder.addCase(fetchAllServiceRequests.fulfilled, (state, action) => {
      state.requests = action.payload as ServiceRequest[];
      state.requestsLoading = false;
    });
    builder.addCase(fetchAllServiceRequests.rejected, (state, action) => {
      state.requestsError = action.payload as string;
      state.requestsLoading = false;
    });
    
    // Fetch service types
    builder.addCase(fetchAllServiceTypes.pending, (state) => {
      state.serviceTypesLoading = true;
      state.serviceTypesError = null;
    });
    builder.addCase(fetchAllServiceTypes.fulfilled, (state, action) => {
      state.serviceTypes = action.payload as ServiceType[];
      state.serviceTypesLoading = false;
    });
    builder.addCase(fetchAllServiceTypes.rejected, (state, action) => {
      state.serviceTypesError = action.payload as string;
      state.serviceTypesLoading = false;
    });
    
    // Add service listing
    builder.addCase(addServiceListing.fulfilled, (state, action) => {
      if (action.payload) {
        state.listings.unshift(action.payload as ServiceListing);
      }
    });
    
    // Edit service listing
    builder.addCase(editServiceListing.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.listings.findIndex(listing => listing.id === action.payload?.id);
        if (index !== -1) {
          state.listings[index] = action.payload as ServiceListing;
        }
      }
    });
    
    // Remove service listing
    builder.addCase(removeServiceListing.fulfilled, (state, action) => {
      const { id, hard_delete } = action.payload as { id: string; hard_delete: boolean };
      
      if (hard_delete) {
        // Remove from state if hard deleted
        state.listings = state.listings.filter(listing => listing.id !== id);
      } else {
        // Set is_active to false for soft delete
        const index = state.listings.findIndex(listing => listing.id === id);
        if (index !== -1) {
          state.listings[index].is_active = false;
        }
      }
    });
    
    // Add service request
    builder.addCase(addServiceRequest.fulfilled, (state, action) => {
      if (action.payload) {
        state.requests.unshift(action.payload as ServiceRequest);
      }
    });
    
    // Update request status
    builder.addCase(updateRequestStatus.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.requests.findIndex(request => request.id === action.payload?.id);
        if (index !== -1) {
          state.requests[index] = action.payload as ServiceRequest;
        }
      }
    });
    
    // Handle mock data
    builder.addCase(loadMockServiceListings.fulfilled, (state, action) => {
      console.log('[serviceSlice] Setting mock listings data to Redux state');
      state.listings = action.payload as ServiceListing[];
      state.listingsLoading = false;
      state.listingsError = null;
    });
  },
});

// Export actions
export const {
  setSelectedService,
  setRequestsTabAsProvider,
  setSelectedRequest,
  setListingsLoading,
  setListingFilters,
  clearListingFilters,
  setRequestFilters,
  clearRequestFilters,
  clearListings,
  clearRequests,
} = serviceSlice.actions;

// Development utility function to load mock data for testing
export const loadMockServiceListings = createAsyncThunk(
  'services/loadMockListings',
  async (_, { dispatch }) => {
    console.log('[serviceSlice] Loading mock service listings for testing');
    
    // Create mock service types first
    const mockServiceTypes = [
      { 
        id: 'type1', 
        name: 'Dog Walking', 
        icon: 'dog', 
        credit_value: 30,
        description: 'Professional dog walking services',
        created_at: new Date().toISOString()
      },
      { 
        id: 'type2', 
        name: 'Pet Sitting', 
        icon: 'home', 
        credit_value: 50,
        description: 'In-home pet sitting services',
        created_at: new Date().toISOString()
      },
      { 
        id: 'type3', 
        name: 'Grooming', 
        icon: 'scissors-cutting', 
        credit_value: 40,
        description: 'Full pet grooming services',
        created_at: new Date().toISOString()
      }
    ];
    
    // Create mock service listings
    const mockServices = [
      {
        id: 'service1',
        title: 'Professional Dog Walking',
        description: 'Experienced dog walker available in your area. Daily walks and exercise for your pets.',
        provider_id: 'user1',
        service_type_id: 'type1',
        is_active: true,
        created_at: new Date().toISOString(),
        provider: { id: 'user1', full_name: 'Jane Smith', profile_image_url: null },
        service_type: mockServiceTypes[0]
      },
      {
        id: 'service2',
        title: 'In-home Pet Sitting',
        description: 'I will take care of your pets in your home while you are away. Food, water, medication, and plenty of love.',
        provider_id: 'user2',
        service_type_id: 'type2',
        is_active: true,
        created_at: new Date().toISOString(),
        provider: { id: 'user2', full_name: 'John Doe', profile_image_url: null },
        service_type: mockServiceTypes[1]
      },
      {
        id: 'service3',
        title: 'Pet Grooming Services',
        description: 'Full grooming service including bath, haircut, nail trimming, and ear cleaning.',
        provider_id: 'user3',
        service_type_id: 'type3',
        is_active: true,
        created_at: new Date().toISOString(),
        provider: { id: 'user3', full_name: 'Maria Johnson', profile_image_url: null },
        service_type: mockServiceTypes[2]
      }
    ];

    // First set the service types
    dispatch({
      type: 'services/fetchAllServiceTypes/fulfilled',
      payload: mockServiceTypes
    });

    // Then set the mock listings
    return mockServices;
  }
);

// Export selectors
export const selectServiceListings = (state: RootState) => state.services.listings;
export const selectServiceListingsLoading = (state: RootState) => state.services.listingsLoading;
export const selectServiceListingsError = (state: RootState) => state.services.listingsError;

export const selectServiceRequests = (state: RootState) => state.services.requests;
export const selectServiceRequestsLoading = (state: RootState) => state.services.requestsLoading;
export const selectServiceRequestsError = (state: RootState) => state.services.requestsError;

export const selectServiceTypes = (state: RootState) => state.services.serviceTypes;
export const selectServiceTypesLoading = (state: RootState) => state.services.serviceTypesLoading;
export const selectServiceTypesError = (state: RootState) => state.services.serviceTypesError;

export const selectSelectedService = (state: RootState) => {
  const id = state.services.selectedServiceId;
  return id ? state.services.listings.find(listing => listing.id === id) : null;
};

export const selectSelectedRequest = (state: RootState) => {
  const id = state.services.selectedRequestId;
  return id ? state.services.requests.find(request => request.id === id) : null;
};

export const selectRequestsTabAsProvider = (state: RootState) => state.services.requestsTabAsProvider;

export const selectListingFilters = (state: RootState) => state.services.listingFilters;
export const selectRequestFilters = (state: RootState) => state.services.requestFilters;

export default serviceSlice.reducer;