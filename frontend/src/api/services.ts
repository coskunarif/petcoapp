import supabase from '../supabaseClient';

export async function fetchServices({ type, location, distance, availability, provider_id }: {
  type?: string;
  location?: { lat: number; lng: number };
  distance?: number;
  availability?: string;
  provider_id?: string;
} = {}) {
  let query = supabase.from('service_listings').select('*');
  if (type) query = query.eq('type', type);
  if (provider_id) query = query.eq('provider_id', provider_id);
  // Add geospatial filtering if location/distance provided
  // Add availability filtering if provided
  return query;
}
