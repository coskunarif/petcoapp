import { supabase } from '../supabaseClient';

export async function fetchServices({ type, location, distance, availability, provider_id }: {
  type?: string;
  location?: { lat: number; lng: number };
  distance?: number;
  availability?: string;
  provider_id?: string;
} = {}) {
  // Debug: Log input params
  console.log('[fetchServices] called with:', { type, location, distance, availability, provider_id });
  let query = supabase.from('service_listings').select('*, users(full_name), service_types(credit_value)');
  // Debug: Log query object before filters
  console.log('[fetchServices] initial query:', query);
  if (type) query = query.eq('type', type);
  // Debug: Log query after type filter
  if (type) console.log('[fetchServices] after type filter:', query);
  if (provider_id) query = query.eq('provider_id', provider_id);
  // Debug: Log query after provider_id filter
  if (provider_id) console.log('[fetchServices] after provider_id filter:', query);
  // Add geospatial filtering if location/distance provided
  // Add availability filtering if provided
  // Debug: Log final query before return
  console.log('[fetchServices] final query:', query);
  try {
    const response = await query;
    console.log('[fetchServices] query executed:', response);
    return response;
  } catch (error) {
    console.error('[fetchServices] query error:', error);
    throw error;
  }
}
