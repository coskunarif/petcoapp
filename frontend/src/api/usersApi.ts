import { supabase } from './supabaseClient';

export async function fetchAllUsersExcept(currentUserId: string) {
  // Use public.users table, select id and full_name
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name')
    .neq('id', currentUserId);
  if (error) throw error;
  // Map to match expected { id, name }
  return (data || []).map((u: any) => ({ id: u.id, name: u.full_name }));
}
