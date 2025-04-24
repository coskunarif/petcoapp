import supabase from '../supabaseClient';

export async function fetchRequests({ asProvider, userId }: { asProvider: boolean; userId: string }) {
  let query = supabase.from('requests').select('*');
  if (asProvider) {
    query = query.eq('provider_id', userId);
  } else {
    query = query.eq('requester_id', userId);
  }
  return query;
}
