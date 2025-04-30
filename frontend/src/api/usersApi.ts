import { supabase } from '../supabaseClient';

export async function fetchAllUsersExcept(currentUserId: string) {
  console.log("[DEBUG] Fetching users from API...");
  // Use public.users table, select id and full_name
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name')
    .neq('id', currentUserId);
  console.log("[DEBUG] Fetched users from API.");
  if (error) throw error;
  // Map to match expected { id, name }
  const result = (data || []).map((u: any) => ({ id: u.id, name: u.full_name }));
  console.log("[DEBUG] Returning users data.");
  return result;
}
