import { supabase } from '../supabaseClient';
import { ServiceListing, ServiceRequest, ServiceType } from '../types/services';

/**
 * Fetch service listings with optional filters
 */
export async function fetchServices({ 
  type_id,
  location,
  distance,
  availability,
  provider_id,
  is_active = true 
}: {
  type_id?: string;
  location?: { lat: number; lng: number };
  distance?: number;
  availability?: string;
  provider_id?: string;
  is_active?: boolean;
} = {}) {
  console.log('[fetchServices] Starting fetch with filters:', {
    type_id,
    provider_id,
    is_active,
    hasLocation: !!location,
    hasDistance: !!distance,
    hasAvailability: !!availability
  });

  try {
    // Build query with proper type definitions
    let query = supabase
      .from('service_listings')
      .select(`
        *,
        provider:provider_id(id, full_name, profile_image_url),
        service_type:service_type_id(id, name, icon, credit_value)
      `)
      .eq('is_active', is_active);

    // Apply filters
    if (type_id) query = query.eq('service_type_id', type_id);
    if (provider_id) query = query.eq('provider_id', provider_id);
    
    // Apply location filtering if coordinates and distance are provided
    if (location && distance) {
      // This would use PostGIS functions in a real implementation
      // For now, we're just returning all results since this is a simplified version
      console.log('[fetchServices] Location filtering requested but not implemented');
    }

    // Apply availability filtering if provided
    if (availability) {
      // This would filter by availability in a real implementation
      console.log('[fetchServices] Availability filtering requested but not implemented');
    }

    console.log('[fetchServices] Executing Supabase query...');
    
    // Execute query and return results
    const { data, error } = await query.order('created_at', { ascending: false });
    
    console.log('[fetchServices] Query results:', { 
      success: !error, 
      dataCount: data?.length || 0,
      errorMessage: error?.message || null 
    });

    if (data && data.length > 0) {
      console.log('[fetchServices] First result:', JSON.stringify(data[0], null, 2));
    }
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[fetchServices] Error:', error);
    return { data: null, error };
  }
}

/**
 * Create a new service listing
 */
export async function createServiceListing(listing: Omit<ServiceListing, 'id' | 'created_at'>) {
  try {
    console.log('[createServiceListing] Creating listing with data:', listing);

    // Prepare listing data for database format
    // Handle known fields and ensure other fields are passed through
    const { start_time, end_time, scheduled_date, availability_schedule, ...otherFields } = listing;

    console.log('[createServiceListing] Handling deprecated start_time/end_time fields:', {
      start_time_exists: !!start_time,
      end_time_exists: !!end_time,
      scheduled_date_exists: !!scheduled_date
    });

    // Store date information in availability_schedule instead of a separate column
    let enhancedAvailabilitySchedule = availability_schedule || {
      days: [],
      hours: '',
      notes: ''
    };

    // Add date information to availability_schedule notes if available
    if (start_time || scheduled_date) {
      const dateStr = new Date(start_time || scheduled_date || '').toLocaleString();
      enhancedAvailabilitySchedule = {
        ...enhancedAvailabilitySchedule,
        scheduled_date: start_time || scheduled_date,
        notes: enhancedAvailabilitySchedule.notes
          ? `${enhancedAvailabilitySchedule.notes}\nScheduled: ${dateStr}`
          : `Scheduled: ${dateStr}`
      };
    }

    const dataToInsert = {
      ...otherFields,
      availability_schedule: enhancedAvailabilitySchedule,
      created_at: new Date().toISOString(),
      is_active: true
    };

    console.log('[createServiceListing] Prepared data for insert:', dataToInsert);

    const { data, error } = await supabase
      .from('service_listings')
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error('[createServiceListing] Supabase error:', error);
      throw error;
    }

    console.log('[createServiceListing] Successfully created with result:', data);
    return { data, error: null };
  } catch (error) {
    console.error('[createServiceListing] Error:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing service listing
 */
export async function updateServiceListing(
  id: string,
  updates: Partial<Omit<ServiceListing, 'id' | 'created_at'>>
) {
  try {
    console.log('[updateServiceListing] Updating listing with id:', id);
    console.log('[updateServiceListing] With updates:', updates);

    // Prepare updates data for database format
    // Handle known fields and ensure other fields are passed through
    const { start_time, end_time, scheduled_date, availability_schedule, ...otherFields } = updates;

    console.log('[updateServiceListing] Handling deprecated start_time/end_time fields:', {
      start_time_exists: !!start_time,
      end_time_exists: !!end_time,
      scheduled_date_exists: !!scheduled_date
    });

    let dataToUpdate: any = {
      ...otherFields
      // Don't add updated_at as it doesn't exist in the database schema
    };

    // If we have date information, store it in availability_schedule
    if (start_time || scheduled_date || availability_schedule) {
      // Get existing availability_schedule if we're updating it
      let enhancedAvailabilitySchedule = availability_schedule || {
        days: [],
        hours: '',
        notes: ''
      };

      // Add date information to availability_schedule if available
      if (start_time || scheduled_date) {
        const dateStr = new Date(start_time || scheduled_date || '').toLocaleString();
        enhancedAvailabilitySchedule = {
          ...enhancedAvailabilitySchedule,
          scheduled_date: start_time || scheduled_date,
          notes: enhancedAvailabilitySchedule.notes
            ? `${enhancedAvailabilitySchedule.notes}\nScheduled: ${dateStr}`
            : `Scheduled: ${dateStr}`
        };
      }

      dataToUpdate.availability_schedule = enhancedAvailabilitySchedule;
    }

    console.log('[updateServiceListing] Prepared data for update:', dataToUpdate);

    const { data, error } = await supabase
      .from('service_listings')
      .update(dataToUpdate)
      .eq('id', id)
      .select();

    if (error) {
      console.error('[updateServiceListing] Supabase error:', error);
      throw error;
    }

    console.log('[updateServiceListing] Successfully updated with result:', data);
    return { data, error: null };
  } catch (error) {
    console.error('[updateServiceListing] Error:', error);
    return { data: null, error };
  }
}

/**
 * Delete/deactivate a service listing
 */
export async function deleteServiceListing(id: string, hard_delete: boolean = false) {
  try {
    let result;
    
    if (hard_delete) {
      // Permanently delete the listing
      result = await supabase
        .from('service_listings')
        .delete()
        .eq('id', id);
    } else {
      // Soft delete by setting is_active to false
      result = await supabase
        .from('service_listings')
        .update({ is_active: false })
        .eq('id', id)
        .select();
    }

    const { data, error } = result;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[deleteServiceListing] Error:', error);
    return { data: null, error };
  }
}

/**
 * Fetch service requests with filters
 */
export async function fetchServiceRequests({
  requester_id,
  provider_id,
  status,
  service_type_id
}: {
  requester_id?: string;
  provider_id?: string;
  status?: string | string[];
  service_type_id?: string;
} = {}) {
  try {
    let query = supabase
      .from('service_requests')
      .select(`
        *,
        requester:requester_id(id, full_name, profile_image_url),
        provider:provider_id(id, full_name, profile_image_url),
        service_type:service_type_id(id, name, icon, credit_value)
      `);

    // Apply filters
    if (requester_id) query = query.eq('requester_id', requester_id);
    if (provider_id) query = query.eq('provider_id', provider_id);
    if (service_type_id) query = query.eq('service_type_id', service_type_id);
    
    // Handle status filter (could be a single status or array of statuses)
    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[fetchServiceRequests] Error:', error);
    return { data: null, error };
  }
}

/**
 * Create a new service request
 */
export async function createServiceRequest(request: Omit<ServiceRequest, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert([{
        ...request,
        status: request.status || 'pending',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[createServiceRequest] Error:', error);
    return { data: null, error };
  }
}

/**
 * Update a service request (e.g., change status)
 */
export async function updateServiceRequest(
  id: string, 
  updates: Partial<Omit<ServiceRequest, 'id' | 'created_at'>>
) {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[updateServiceRequest] Error:', error);
    return { data: null, error };
  }
}

/**
 * Fetch service types
 */
export async function fetchServiceTypes() {
  try {
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('[fetchServiceTypes] Error:', error);
    return { data: null, error };
  }
}