import { supabase } from '../supabaseClient';
import { LocationCoords, calculateDistance } from './locationService';
import { HomeDashboardData, ServiceRequest, Provider } from '../screens/HomeScreen/types';

/**
 * Fetch user's credit balance
 * @param userId User ID
 * @returns Credit balance or 0 if error
 */
export async function fetchUserCredits(userId: string): Promise<number> {
  try {
    if (!userId) {
      console.warn('[homeService] No user ID provided for credit balance check');
      return 0;
    }

    console.log('[homeService] Fetching credit balance for user:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[homeService] Error fetching user credits:', error);
      throw error;
    }

    console.log('[homeService] Credit balance data:', data);
    return data?.credit_balance || 0;
  } catch (error) {
    console.error('[homeService] Failed to fetch user credits:', error);
    return 0;
  }
}

/**
 * Fetch service types
 * @returns Array of service types
 */
export async function fetchServiceTypes() {
  try {
    console.log('[homeService] Fetching service types');
    const { data, error } = await supabase
      .from('service_types')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[homeService] Error fetching service types:', error);
      throw error;
    }

    console.log('[homeService] Service types retrieved:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[homeService] Failed to fetch service types:', error);
    return [];
  }
}

/**
 * Fetch upcoming services for a user
 * @param userId User ID
 * @returns Object with services as provider and requester
 */
export async function fetchUpcomingServices(userId: string): Promise<{
  asProvider: ServiceRequest[];
  asRequester: ServiceRequest[];
}> {
  try {
    if (!userId) {
      console.warn('[homeService] No user ID provided for upcoming services');
      return { asProvider: [], asRequester: [] };
    }

    console.log('[homeService] Fetching upcoming services for user:', userId);

    // Get services as provider
    const { data: providerServices, error: providerError } = await supabase
      .from('service_requests')
      .select(`
        id, 
        start_time, 
        end_time, 
        status, 
        users!requester_id(full_name, profile_image_url), 
        pets(name, image_url), 
        service_types(name, icon)
      `)
      .eq('provider_id', userId)
      .in('status', ['accepted', 'pending'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    if (providerError) {
      console.error('[homeService] Error fetching provider services:', providerError);
      throw providerError;
    }

    // Get services as requester
    const { data: requesterServices, error: requesterError } = await supabase
      .from('service_requests')
      .select(`
        id, 
        start_time, 
        end_time, 
        status, 
        users!provider_id(full_name, profile_image_url), 
        pets(name, image_url), 
        service_types(name, icon)
      `)
      .eq('requester_id', userId)
      .in('status', ['accepted', 'pending'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);

    if (requesterError) {
      console.error('[homeService] Error fetching requester services:', requesterError);
      throw requesterError;
    }

    // Normalize nested objects that might be arrays
    const normalizeService = (service: any): ServiceRequest => ({
      ...service,
      users: service.users ? (Array.isArray(service.users) ? service.users[0] : service.users) : undefined,
      pets: service.pets ? (Array.isArray(service.pets) ? service.pets[0] : service.pets) : undefined,
      service_types: service.service_types
        ? Array.isArray(service.service_types)
          ? service.service_types
          : [service.service_types]
        : [],
    });

    return {
      asProvider: (providerServices || []).map(normalizeService),
      asRequester: (requesterServices || []).map(normalizeService),
    };
  } catch (error) {
    console.error('[homeService] Failed to fetch upcoming services:', error);
    return { asProvider: [], asRequester: [] };
  }
}

/**
 * Find nearby service providers
 * @param location User location
 * @param radiusKm Search radius in kilometers
 * @param serviceTypeId Optional service type filter
 * @returns Array of providers
 */
export async function findNearbyProviders(
  location: LocationCoords,
  radiusKm: number = 10,
  serviceTypeId?: string
): Promise<Provider[]> {
  try {
    if (!location) {
      console.warn('[homeService] No location provided for nearby providers');
      return [];
    }

    console.log(
      `[homeService] Finding providers within ${radiusKm}km of ${location.latitude}, ${location.longitude}`
    );

    // Use the stored procedure for geo search
    const { data, error } = await supabase.rpc('find_nearby_providers', {
      user_location: `POINT(${location.longitude} ${location.latitude})`,
      distance_km: radiusKm,
      min_rating: 0, // No minimum rating filter
      service_type: serviceTypeId || null, // Optional service type filter
    });

    if (error) {
      console.error('[homeService] Error finding nearby providers:', error);
      throw error;
    }

    console.log('[homeService] Found nearby providers:', data?.length || 0);

    // Transform the data to match our Provider interface
    return (data || []).map((item: any) => ({
      userId: item.id,
      name: item.full_name,
      profile_image_url: item.profile_image_url,
      distance: parseFloat(item.distance_km.toFixed(1)),
      rating: item.rating || 0,
      serviceTypes: item.service_types || [],
      availability: item.availability || [],
    }));
  } catch (error) {
    console.error('[homeService] Failed to find nearby providers:', error);
    return [];
  }
}

/**
 * Create a service listing (offer a service)
 * @param userId Provider user ID
 * @param serviceData Service listing data
 * @returns The created service listing or null if error
 */
export async function createServiceListing(
  userId: string,
  serviceData: {
    service_type_id: string;
    title: string;
    description: string;
    location: LocationCoords;
    availability_schedule: any;
  }
) {
  try {
    if (!userId) {
      console.warn('[homeService] No user ID provided for service listing');
      return null;
    }

    const { service_type_id, title, description, location, availability_schedule } = serviceData;

    console.log('[homeService] Creating service listing for user:', userId);

    const serviceListingData = {
      provider_id: userId,
      service_type_id,
      title,
      description,
      location: `POINT(${location.longitude} ${location.latitude})`,
      availability_schedule,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('service_listings')
      .insert([serviceListingData])
      .select()
      .single();

    if (error) {
      console.error('[homeService] Error creating service listing:', error);
      throw error;
    }

    console.log('[homeService] Service listing created:', data);
    return data;
  } catch (error) {
    console.error('[homeService] Failed to create service listing:', error);
    return null;
  }
}

/**
 * Create a service request
 * @param userId Requester user ID
 * @param requestData Service request data
 * @returns The created service request or null if error
 */
export async function createServiceRequest(
  userId: string,
  requestData: {
    service_type_id: string;
    provider_id?: string;
    pet_id?: string;
    start_time: string;
    end_time?: string;
    location?: LocationCoords;
    notes?: string;
    credit_amount?: number;
  }
) {
  try {
    if (!userId) {
      console.warn('[homeService] No user ID provided for service request');
      return null;
    }

    const {
      service_type_id,
      provider_id,
      pet_id,
      start_time,
      end_time,
      location,
      notes,
      credit_amount,
    } = requestData;

    console.log('[homeService] Creating service request for user:', userId);

    // Calculate end time if not provided (default to 1 hour after start)
    const calculatedEndTime = end_time || (() => {
      const date = new Date(start_time);
      date.setHours(date.getHours() + 1);
      return date.toISOString();
    })();

    // Helper function to ensure a valid uuid or null
    const validateUuid = (id: string | undefined) => {
      if (!id || id.trim() === '') return null;
      return id;
    };

    // Safely build the service request data with valid UUIDs
    const serviceRequestData = {
      requester_id: userId, // This should be valid since we checked above
      provider_id: validateUuid(provider_id), // Make sure it's null if empty
      pet_id: validateUuid(pet_id), // Make sure it's null if empty
      service_type_id, // This is required and validated by the form
      start_time,
      end_time: calculatedEndTime,
      status: 'pending',
      location: location ? `POINT(${location.longitude} ${location.latitude})` : null,
      notes: notes || '',
      credit_amount: credit_amount || 0,
      created_at: new Date().toISOString(),
    };
    
    console.log('[homeService] Service request data prepared:', 
                { ...serviceRequestData, requester_id: 'hidden for privacy' });

    const { data, error } = await supabase
      .from('service_requests')
      .insert([serviceRequestData])
      .select()
      .single();

    if (error) {
      console.error('[homeService] Error creating service request:', error);
      throw error;
    }

    console.log('[homeService] Service request created:', data);
    return data;
  } catch (error) {
    console.error('[homeService] Failed to create service request:', error);
    return null;
  }
}

/**
 * Fetch complete dashboard data for home screen
 * @param userId User ID
 * @param location User location
 * @param radiusKm Search radius in kilometers
 * @returns Dashboard data or error
 */
export async function fetchHomeDashboardData(
  userId: string,
  location: LocationCoords,
  radiusKm: number = 10
): Promise<HomeDashboardData & { error?: string }> {
  try {
    console.log('[homeService] Fetching complete dashboard data for user:', userId);

    if (!userId) {
      return {
        userCredits: 0,
        upcomingServices: { asProvider: [], asRequester: [] },
        nearbyProviders: [],
        error: 'No user ID provided',
      };
    }

    // Run all fetches in parallel
    const [userCredits, upcomingServices, nearbyProviders] = await Promise.all([
      fetchUserCredits(userId),
      fetchUpcomingServices(userId),
      findNearbyProviders(location, radiusKm),
    ]);

    return {
      userCredits,
      upcomingServices,
      nearbyProviders,
    };
  } catch (error: any) {
    console.error('[homeService] Error fetching dashboard data:', error);
    return {
      userCredits: 0,
      upcomingServices: { asProvider: [], asRequester: [] },
      nearbyProviders: [],
      error: error?.message || String(error),
    };
  }
}