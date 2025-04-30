import { supabase } from '../supabaseClient';

export const fetchConversations = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_conversations', { p_user_id: userId });
  if (error) throw error;
  return data;
};

export const fetchMessages = async (conversationId: string, cursor: string | null = null, limit = 20) => {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const sendMessage = async (payload: any) => {
  const { data, error } = await supabase.from('messages').insert([payload]);
  if (error) throw error;
  return data;
};

export const setupMessageSubscription = (conversationId: string, onMessageReceived: (msg: any) => void, currentUserId: string) => {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      onMessageReceived(payload.new);
      if (payload.new.sender_id !== currentUserId) {
        markMessageAsDelivered(payload.new.id);
      }
    })
    .subscribe();
};

export const markMessageAsDelivered = async (messageId: string) => {
  await supabase.from('messages').update({ delivered_at: new Date().toISOString() }).eq('id', messageId);
};
