import { supabase } from '../supabaseClient';
import { Service, ServiceRequest, ServiceListing, ServiceType } from '../types/services';
import { store } from '../redux/store';
import {
  fetchServiceListings,
  fetchAllServiceRequests,
  fetchAllServiceTypes,
  addServiceListing,
  editServiceListing,
  removeServiceListing,
  addServiceRequest,
  updateRequestStatus
} from '../redux/slices/serviceSlice';
import {
  createServiceListing,
  updateServiceListing,
  deleteServiceListing,
  fetchServices
} from '../api/services';

/**
 * Services Service
 * Contains utility functions for interacting with service-related data
 */
export const servicesService = {
  /**
   * Fetch a single service request by ID
   */
  async fetchRequestById(id: string) {
    try {
      console.log('[servicesService.fetchRequestById] Fetching request:', id);

      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          requester:requester_id(id, full_name, profile_image_url),
          provider:provider_id(id, full_name, profile_image_url),
          service_type:service_type_id(id, name, icon, credit_value)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('[servicesService.fetchRequestById] Error fetching request:', error);
        throw error;
      }

      if (!data) {
        console.warn('[servicesService.fetchRequestById] No request found with ID:', id);
        throw new Error('Request not found');
      }

      console.log('[servicesService.fetchRequestById] Found request:', data);

      // Update the Redux store with this request
      store.dispatch({
        type: 'services/fetchAllServiceRequests/fulfilled',
        payload: [data]
      });

      return { data, error: null };
    } catch (error) {
      console.error('[servicesService] Error fetching request by ID:', error);
      return { data: null, error };
    }
  },
  /**
   * Load all service types from the backend
   */
  async loadServiceTypes() {
    try {
      await store.dispatch(fetchAllServiceTypes());
      const state = store.getState();
      return { 
        data: state.services.serviceTypes,
        error: state.services.serviceTypesError
      };
    } catch (error) {
      console.error('[servicesService] Error loading service types:', error);
      return { data: null, error };
    }
  },

  /**
   * Load service listings with optional filters
   */
  async loadServiceListings(filters = {}) {
    try {
      await store.dispatch(fetchServiceListings(filters));
      const state = store.getState();
      return { 
        data: state.services.listings,
        error: state.services.listingsError
      };
    } catch (error) {
      console.error('[servicesService] Error loading service listings:', error);
      return { data: null, error };
    }
  },

  /**
   * Load service requests for the current user
   */
  async loadServiceRequests(asProvider = true, status?: string | string[]) {
    try {
      const state = store.getState();
      const userId = state.auth?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      await store.dispatch(fetchAllServiceRequests({ userId, asProvider, status }));
      
      const updatedState = store.getState();
      return { 
        data: updatedState.services.requests,
        error: updatedState.services.requestsError
      };
    } catch (error) {
      console.error('[servicesService] Error loading service requests:', error);
      return { data: null, error };
    }
  },

  /**
   * Create a new service listing
   */
  async createListing(listing: Omit<ServiceListing, 'id' | 'created_at'>) {
    try {
      const state = store.getState();
      const userId = state.auth?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('[servicesService.createListing] Creating new listing with data:', listing);

      // Ensure provider_id is set to current user
      const listingWithProvider = {
        ...listing,
        provider_id: userId
      };

      // Directly use the API to create the listing
      console.log('[servicesService.createListing] Calling API with data:', listingWithProvider);
      const { data, error } = await createServiceListing(listingWithProvider);

      if (error) {
        console.error('[servicesService.createListing] API error:', error);
        throw error;
      }

      console.log('[servicesService.createListing] API success, refreshing Redux state');

      // Update Redux state with new data
      if (data && data.length > 0) {
        // Dispatch action to update state with the new data
        store.dispatch({
          type: 'services/addServiceListing/fulfilled',
          payload: data[0]
        });
        return { data: data[0], error: null };
      } else {
        return { data: null, error: 'No data returned from API' };
      }
    } catch (error) {
      console.error('[servicesService] Error creating service listing:', error);
      return { data: null, error };
    }
  },

  /**
   * Update an existing service listing
   */
  async updateListing(id: string, updates: Partial<Omit<ServiceListing, 'id' | 'created_at'>>) {
    try {
      const state = store.getState();
      const userId = state.auth?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log('[servicesService.updateListing] Updating listing:', id);
      console.log('[servicesService.updateListing] With updates:', updates);
      console.log('[servicesService.updateListing] Current listings in Redux store:',
        state.services.listings.map(l => ({ id: l.id, title: l.title })));

      // Check if the listing belongs to the current user - skip check if not found
      const listing = state.services.listings.find(l => l.id === id);
      if (!listing) {
        console.warn('[servicesService.updateListing] Listing not found in Redux store, proceeding anyway');
        // Instead of failing, we'll proceed and let the API handle validation
      } else if (listing.provider_id !== userId) {
        throw new Error('You can only update your own listings');
      }

      // Directly use the API to update the listing
      console.log('[servicesService.updateListing] Calling API with id:', id);
      const { data, error } = await updateServiceListing(id, {
        ...updates,
        provider_id: userId // Ensure provider_id is set correctly
      });

      if (error) {
        console.error('[servicesService.updateListing] API error:', error);
        throw error;
      }

      console.log('[servicesService.updateListing] API success, refreshing Redux state');

      // Update Redux state with new data
      if (data && data.length > 0) {
        // Dispatch action to update state with the new data
        store.dispatch({
          type: 'services/editServiceListing/fulfilled',
          payload: data[0]
        });
        return { data: data[0], error: null };
      } else {
        return { data: null, error: 'No data returned from API' };
      }
    } catch (error) {
      console.error('[servicesService] Error updating service listing:', error);
      return { data: null, error };
    }
  },

  /**
   * Remove a service listing (soft delete by default)
   */
  async removeListing(id: string, hard_delete = false) {
    try {
      const state = store.getState();
      const userId = state.auth?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Check if the listing belongs to the current user
      const listing = state.services.listings.find(l => l.id === id);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.provider_id !== userId) {
        throw new Error('You can only delete your own listings');
      }
      
      const resultAction = await store.dispatch(removeServiceListing({ id, hard_delete }));
      
      if (removeServiceListing.fulfilled.match(resultAction)) {
        return { success: true, error: null };
      } else {
        return { success: false, error: resultAction.payload || 'Failed to delete listing' };
      }
    } catch (error) {
      console.error('[servicesService] Error removing service listing:', error);
      return { success: false, error };
    }
  },

  /**
   * Create a new service request
   */
  async createRequest(request: Omit<ServiceRequest, 'id' | 'created_at'>) {
    try {
      const state = store.getState();
      const userId = state.auth?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Ensure requester_id is set to current user
      const requestWithRequester = {
        ...request,
        requester_id: userId,
        status: 'pending' as const
      };
      
      const resultAction = await store.dispatch(addServiceRequest(requestWithRequester));
      
      if (addServiceRequest.fulfilled.match(resultAction)) {
        return { data: resultAction.payload, error: null };
      } else {
        return { data: null, error: resultAction.payload || 'Failed to create request' };
      }
    } catch (error) {
      console.error('[servicesService] Error creating service request:', error);
      return { data: null, error };
    }
  },

  /**
   * Update a request status
   */
  async updateRequest(id: string, status: ServiceRequest['status']) {
    try {
      console.log('[servicesService.updateRequest] Updating request:', id, 'to status:', status);

      const state = store.getState();
      const userId = state.auth?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Check if the request exists in current Redux state
      const request = state.services.requests.find(r => r.id === id);

      // If request not found in current state, proceed anyway
      // This fixes issues when switching between "As Provider" and "As Requester" modes
      if (!request) {
        console.warn('[servicesService.updateRequest] Request not found in Redux store, proceeding anyway as this might be due to filter state');

        // Skip validation and proceed directly to update
        console.log('[servicesService.updateRequest] Dispatching update without validation');

        const resultAction = await store.dispatch(updateRequestStatus({ id, status }));

        if (updateRequestStatus.fulfilled.match(resultAction)) {
          return { data: resultAction.payload, error: null };
        } else {
          console.error('[servicesService.updateRequest] Update failed:', resultAction.payload);
          return { data: null, error: resultAction.payload || 'Failed to update request status' };
        }
      }

      // For requests found in Redux store, continue with validation
      console.log('[servicesService.updateRequest] Request found in Redux store, validating...');

      // Ensure user is either the provider or requester
      if (request.provider_id !== userId && request.requester_id !== userId) {
        console.error('[servicesService.updateRequest] Authorization error - user is neither provider nor requester');
        throw new Error('You are not authorized to update this request');
      }

      // Additional validation rules based on current status and role
      this.validateStatusChange(request, status, userId);

      console.log('[servicesService.updateRequest] Validation passed, dispatching update');

      const resultAction = await store.dispatch(updateRequestStatus({ id, status }));

      if (updateRequestStatus.fulfilled.match(resultAction)) {
        return { data: resultAction.payload, error: null };
      } else {
        console.error('[servicesService.updateRequest] Update failed:', resultAction.payload);
        return { data: null, error: resultAction.payload || 'Failed to update request status' };
      }
    } catch (error) {
      console.error('[servicesService] Error updating service request:', error);
      return { data: null, error };
    }
  },

  /**
   * Validate if a status change is allowed
   */
  validateStatusChange(
    request: ServiceRequest,
    newStatus: ServiceRequest['status'],
    userId: string
  ) {
    const isProvider = request.provider_id === userId;
    const isRequester = request.requester_id === userId;
    const currentStatus = request.status;
    
    // Status transition rules
    if (currentStatus === 'pending') {
      // Provider can accept or reject pending requests
      if (isProvider && (newStatus === 'accepted' || newStatus === 'rejected')) {
        return true;
      }
      // Requester can cancel pending requests
      if (isRequester && newStatus === 'cancelled') {
        return true;
      }
    } else if (currentStatus === 'accepted') {
      // Provider can mark as completed
      if (isProvider && newStatus === 'completed') {
        return true;
      }
      // Both can cancel accepted requests
      if ((isProvider || isRequester) && newStatus === 'cancelled') {
        return true;
      }
    }
    
    // If we get here, the transition is not allowed
    throw new Error(`Cannot change status from ${currentStatus} to ${newStatus}`);
  },

  /**
   * Get nearby service providers
   */
  async getNearbyProviders(location: { lat: number; lng: number }, radius = 10) {
    try {
      // This would use geospatial queries in a real implementation
      // For now, we'll just return all service listings
      return this.loadServiceListings();
    } catch (error) {
      console.error('[servicesService] Error getting nearby providers:', error);
      return { data: null, error };
    }
  },

  /**
   * Get provider statistics
   */
  async getProviderStats(providerId: string) {
    try {
      // In a real implementation, this would aggregate data from the database
      return {
        data: {
          totalListings: 0,
          activeListings: 0,
          completedRequests: 0,
          pendingRequests: 0,
          averageRating: 0,
          totalReviews: 0,
        },
        error: null
      };
    } catch (error) {
      console.error('[servicesService] Error getting provider stats:', error);
      return { data: null, error };
    }
  }
};