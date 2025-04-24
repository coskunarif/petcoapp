import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { HomeDashboardData } from './types';

export const fetchDashboardData = async (
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<HomeDashboardData & { error?: string }> => {
  console.log('[fetchDashboardData] userId:', userId, 'typeof userId:', typeof userId, 'lat:', latitude, 'lng:', longitude);
  try {
    // Log query details
    console.log('[fetchDashboardData] Querying public.users for credit_balance with id =', userId);
    // Get user credits
    const { data: userData, error: userError, status: userStatus, statusText: userStatusText } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', userId)
      .single();
    console.log('[fetchDashboardData] Supabase response:', { userData, userError, userStatus, userStatusText });
    if (userError) console.error('[fetchDashboardData] userError details:', userError);
    if (!userData) console.warn('[fetchDashboardData] No userData found for id:', userId);

  if (userError) throw userError;

  // Get upcoming services as provider
    console.log('[fetchDashboardData] Querying service_requests as provider for userId =', userId);
    const { data: providerServices, error: providerError, status: providerStatus, statusText: providerStatusText } = await supabase
      .from('service_requests')
      .select(`id, start_time, end_time, status, users!requester_id(full_name, profile_image_url), pets(name, image_url), service_types(name, icon)`)
      .eq('provider_id', userId)
      .in('status', ['accepted', 'pending'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);
    console.log('[fetchDashboardData] providerServices response:', { providerServices, providerError, providerStatus, providerStatusText });
    if (providerError) console.error('[fetchDashboardData] providerError details:', providerError);


  // Get upcoming services as requester
    console.log('[fetchDashboardData] Querying service_requests as requester for userId =', userId);
    const { data: requesterServices, error: requesterError, status: requesterStatus, statusText: requesterStatusText } = await supabase
      .from('service_requests')
      .select(`id, start_time, end_time, status, users!provider_id(full_name, profile_image_url), pets(name, image_url), service_types(name, icon)`)
      .eq('requester_id', userId)
      .in('status', ['accepted', 'pending'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(5);
    console.log('[fetchDashboardData] requesterServices response:', { requesterServices, requesterError, requesterStatus, requesterStatusText });
    if (requesterError) console.error('[fetchDashboardData] requesterError details:', requesterError);
    console.log('[fetchDashboardData] requesterServices:', requesterServices, 'requesterError:', requesterError);
    if (requesterError) throw requesterError;

  // Get nearby providers
  const { data: nearbyProviders, error: providersError } = await supabase.rpc('find_nearby_providers', {
    distance_km: radiusKm,
    min_rating: 0,
    service_type: null,
    user_location: `POINT(${longitude} ${latitude})`,
  });
  console.log('[fetchDashboardData] nearbyProviders:', nearbyProviders, 'providersError:', providersError);
  if (providersError) throw providersError;

  // Map nested arrays to objects for type compatibility
  const normalizeService = (service: any) => ({
    ...service,
    users: service.users ? (Array.isArray(service.users) ? service.users[0] : service.users) : undefined,
    pets: service.pets ? (Array.isArray(service.pets) ? service.pets[0] : service.pets) : undefined,
    service_types: service.service_types ? (Array.isArray(service.service_types) ? service.service_types[0] : service.service_types) : undefined,
  });

  // Enhanced logging for returned values
  let userCreditsFinal = undefined;
  if (userData && typeof userData.credit_balance !== 'undefined') {
    userCreditsFinal = userData.credit_balance;
    console.log('[fetchDashboardData] Returning userCredits from Supabase:', userCreditsFinal);
  } else {
    // Log when fallback/default is used
    userCreditsFinal = 10; // or whatever your fallback logic is
    console.warn('[fetchDashboardData] userData.credit_balance is undefined! Using fallback value:', userCreditsFinal);
  }
  console.log('[fetchDashboardData] Final return object:', {
    userCredits: userCreditsFinal,
    upcomingServices: {
      asProvider: (providerServices || []).map(normalizeService),
      asRequester: (requesterServices || []).map(normalizeService),
    },
    nearbyProviders: nearbyProviders || [],
  });
  return {
    userCredits: userCreditsFinal,
    upcomingServices: {
      asProvider: (providerServices || []).map(normalizeService),
      asRequester: (requesterServices || []).map(normalizeService),
    },
    nearbyProviders: nearbyProviders || [],
  };
  } catch (err: any) {
    console.error('[fetchDashboardData] ERROR:', err);
    return {
      userCredits: 0,
      upcomingServices: { asProvider: [], asRequester: [] },
      nearbyProviders: [],
      error: err?.message || String(err)
    };
  }
};

export const useHomeDashboardData = (userId: string, lat: number, lng: number) =>
  useQuery({
    queryKey: ['dashboard', userId, lat, lng],
    queryFn: () => fetchDashboardData(userId, lat, lng),
    enabled: !!userId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

// Real-time subscription for service requests
export const useServiceRequestsSubscription = (userId: string, onUpdate: () => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel('service_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'service_requests',
        filter: `provider_id=eq.${userId} OR requester_id=eq.${userId}`
      }, onUpdate)
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, onUpdate]);
};
