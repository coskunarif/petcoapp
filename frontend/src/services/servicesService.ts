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

/**
 * Services Service
 * Contains utility functions for interacting with service-related data
 */
export const servicesService = {
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
      
      // Ensure provider_id is set to current user
      const listingWithProvider = {
        ...listing,
        provider_id: userId
      };
      
      const resultAction = await store.dispatch(addServiceListing(listingWithProvider));
      
      if (addServiceListing.fulfilled.match(resultAction)) {
        return { data: resultAction.payload, error: null };
      } else {
        return { data: null, error: resultAction.payload || 'Failed to create listing' };
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
      
      // Check if the listing belongs to the current user
      const listing = state.services.listings.find(l => l.id === id);
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.provider_id !== userId) {
        throw new Error('You can only update your own listings');
      }
      
      const resultAction = await store.dispatch(editServiceListing({ id, updates }));
      
      if (editServiceListing.fulfilled.match(resultAction)) {
        return { data: resultAction.payload, error: null };
      } else {
        return { data: null, error: resultAction.payload || 'Failed to update listing' };
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
      const state = store.getState();
      const userId = state.auth?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Check if the user is authorized to update this request
      const request = state.services.requests.find(r => r.id === id);
      if (!request) {
        throw new Error('Request not found');
      }
      
      // Ensure user is either the provider or requester
      if (request.provider_id !== userId && request.requester_id !== userId) {
        throw new Error('You are not authorized to update this request');
      }
      
      // Additional validation rules based on current status and role
      this.validateStatusChange(request, status, userId);
      
      const resultAction = await store.dispatch(updateRequestStatus({ id, status }));
      
      if (updateRequestStatus.fulfilled.match(resultAction)) {
        return { data: resultAction.payload, error: null };
      } else {
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