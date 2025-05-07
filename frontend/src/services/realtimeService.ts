import { supabase } from '../supabaseClient';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export enum SubscriptionTables {
  SERVICE_REQUESTS = 'service_requests',
  SERVICE_LISTINGS = 'service_listings',
  USERS = 'users',
  PETS = 'pets',
}

export type SubscriptionFilters = {
  [key: string]: any;
};

export type ChangeCallback = (payload: RealtimePostgresChangesPayload<any>) => void;

/**
 * Creates a subscription to a specific table with the provided filter
 * @param table The table to subscribe to
 * @param filter Optional filter to apply (e.g., { column: 'user_id', value: 'abc123' })
 * @param callback Callback function to execute when changes occur
 * @returns Subscription channel that should be closed when no longer needed
 */
export const subscribeToChanges = (
  table: SubscriptionTables,
  filter: SubscriptionFilters | null = null,
  callback: ChangeCallback
) => {
  console.log(`[realtimeService] Setting up subscription for ${table}`);
  
  let channel = supabase.channel(`${table}_changes_${Date.now()}`);
  
  const subscription = {
    event: '*', // All events (INSERT, UPDATE, DELETE)
    schema: 'public',
    table,
  };
  
  // Add filters if provided
  if (filter) {
    const filterEntry = Object.entries(filter)[0];
    if (filterEntry) {
      const [column, value] = filterEntry;
      
      // Create a filter string like "user_id=eq.abc123"
      // or for multiple values "user_id=in.(abc123,def456)"
      let filterStr = '';
      
      if (Array.isArray(value)) {
        // Multiple values filter
        filterStr = `${column}=in.(${value.join(',')})`;
      } else {
        // Single value filter
        filterStr = `${column}=eq.${value}`;
      }
      
      subscription['filter'] = filterStr;
    }
  }
  
  channel = channel.on('postgres_changes', subscription, callback);
  const subscribedChannel = channel.subscribe();
  
  return subscribedChannel;
};

/**
 * Subscribe to service requests related to a specific user
 * @param userId User ID to filter by (as provider or requester)
 * @param callback Callback function to execute when changes occur
 * @returns Subscription channel
 */
export const subscribeToServiceRequests = (userId: string, callback: ChangeCallback) => {
  console.log(`[realtimeService] Setting up service request subscription for user ${userId}`);
  
  // Create a combined filter for both provider and requester roles
  const filterStr = `provider_id=eq.${userId},requester_id=eq.${userId}`;
  
  const channel = supabase.channel(`service_requests_${userId}`);
  
  channel.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: SubscriptionTables.SERVICE_REQUESTS,
    filter: filterStr
  }, callback);
  
  return channel.subscribe();
};

/**
 * Subscribe to service listings from nearby providers
 * @param maxDistanceKm Maximum distance in kilometers
 * @param callback Callback function to execute when changes occur
 * @returns Subscription channel
 */
export const subscribeToNearbyServiceListings = (
  callback: ChangeCallback
) => {
  console.log('[realtimeService] Setting up nearby service listings subscription');
  
  const channel = supabase.channel('nearby_service_listings');
  
  channel.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: SubscriptionTables.SERVICE_LISTINGS,
    // We can't filter by distance in the subscription, so we'll receive all updates
    // and filter in the callback
  }, callback);
  
  return channel.subscribe();
};

/**
 * Remove a subscription channel
 * @param channel Channel to remove
 */
export const unsubscribe = (channel: any) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};