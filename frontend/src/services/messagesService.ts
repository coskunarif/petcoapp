import { supabase } from '../supabaseClient';
import { store } from '../redux/store';
import { 
  setConversations, 
  setConversationsLoading, 
  setConversationsError,
  setActiveConversation,
  setMessages,
  addMessage,
  setActiveConversationLoading,
  setActiveConversationError
} from '../redux/messagingSlice';
import { formatDistanceToNow } from 'date-fns';

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  serviceRequestId?: string;
  type?: string;
  icon?: string;
  color?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'service';
  imageUrl?: string;
  serviceInfo?: any;
  createdAt: string;
  readAt?: string;
  conversationId: string;
}

/**
 * Fetch all conversations for the current user
 */
export const fetchConversations = async () => {
  const userId = store.getState().auth.user?.id;
  if (!userId) throw new Error('User not authenticated');

  try {
    store.dispatch(setConversationsLoading(true));
    
    // Get messages where user is sender or recipient
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        read_at,
        service_request_id,
        sender:sender_id (id, full_name, profile_image_url),
        recipient:recipient_id (id, full_name, profile_image_url),
        service_request:service_request_id (id, service_type_id, status, created_at)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Group by conversation partner and get latest message
    const conversationMap = new Map<string, Conversation>();
    
    if (data) {
      data.forEach(message => {
        const isUserSender = message.sender_id === userId;
        const partnerId = isUserSender ? message.recipient_id : message.sender_id;
        const partner = isUserSender ? message.recipient : message.sender;
        const conversationId = [userId, partnerId].sort().join('_');
        
        // For message time display
        let lastMessageTime = '';
        try {
          lastMessageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
        } catch (error) {
          lastMessageTime = 'recently';
        }
        
        // Skip if we've already found a newer message for this conversation
        if (conversationMap.has(conversationId) && 
            new Date(message.created_at) <= new Date(conversationMap.get(conversationId)!.lastMessageTime)) {
          return;
        }
        
        // Count unread messages
        let unreadCount = 0;
        if (!isUserSender && !message.read_at) {
          unreadCount = 1;
        }
        
        // Set icon and color based on message content
        let icon = 'chat';
        let color = '#6C63FF'; // Default primary color
        let type = 'chat';

        if (message.service_request_id) {
          // This is a service related message
          type = 'service_request';
          icon = 'handshake';

          // Different colors for different service types if service request info is available
          if (message.service_request && message.service_request.service_type_id) {
            switch (message.service_request.service_type_id) {
              case 1:
                color = '#FFA726'; // Orange
                icon = 'dog-side';
                break;
              case 2:
                color = '#42A5F5'; // Blue
                icon = 'scissors-cutting';
                break;
              case 3:
                color = '#66BB6A'; // Green
                icon = 'walk';
                break;
              default:
                color = '#6C63FF'; // Default purple
            }
          }
        }
        
        conversationMap.set(conversationId, {
          id: conversationId,
          otherUser: {
            id: partnerId,
            name: partner?.full_name || 'User',
            avatarUrl: partner?.profile_image_url,
          },
          lastMessage: message.content,
          lastMessageTime: message.created_at,
          unreadCount,
          serviceRequestId: message.service_request_id,
          type,
          icon,
          color,
        });
      });
    }
    
    const conversations = Array.from(conversationMap.values());
    
    // Sort conversations by most recent first
    conversations.sort((a, b) => 
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
    
    // Format the timestamps for display
    conversations.forEach(convo => {
      convo.lastMessageTime = formatDistanceToNow(new Date(convo.lastMessageTime), { addSuffix: true });
    });
    
    // Update Redux store
    store.dispatch(setConversations(conversations));
    store.dispatch(setConversationsError(null));
    
    return conversations;
  } catch (error: any) {
    console.error('[messagesService] Error fetching conversations:', error);
    store.dispatch(setConversationsError(error.message));
    return [];
  } finally {
    store.dispatch(setConversationsLoading(false));
  }
};

/**
 * Fetch messages for a specific conversation
 */
export const fetchMessages = async (conversationId: string) => {
  const userId = store.getState().auth.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Parse conversation ID to get the other user's ID
  const participants = conversationId.split('_');
  const otherUserId = participants[0] === userId ? participants[1] : participants[0];

  try {
    store.dispatch(setActiveConversationLoading(true));

    // Use the userId and otherUserId to fetch all messages between these two users
    console.log(`[messagesService] Fetching messages between ${userId} and ${otherUserId}`);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        read_at,
        service_request_id,
        service_request:service_request_id (*)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Format messages for the UI
    const messages: Message[] = (data || []).map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      content: msg.content,
      type: msg.service_request_id ? 'service' : 'text', // Default to text or service based on presence of service_request_id
      imageUrl: null, // Image messages not implemented yet
      serviceInfo: msg.service_request,
      createdAt: msg.created_at,
      readAt: msg.read_at,
      conversationId,
    }));
    
    // Mark unread messages as read
    const unreadMessages = data?.filter(msg => 
      msg.sender_id !== userId && !msg.read_at
    );
    
    if (unreadMessages?.length > 0) {
      const ids = unreadMessages.map(msg => msg.id);
      markMessagesAsRead(ids);
    }
    
    // Update Redux store
    store.dispatch(setMessages(messages));
    store.dispatch(setActiveConversationError(null));
    
    return messages;
  } catch (error: any) {
    console.error('[messagesService] Error fetching messages:', error);
    store.dispatch(setActiveConversationError(error.message));
    return [];
  } finally {
    store.dispatch(setActiveConversationLoading(false));
  }
};

/**
 * Send a new message
 */
export const sendMessage = async (recipientId: string, content: string, type: 'text' | 'image' | 'service' = 'text', additionalData = {}) => {
  const userId = store.getState().auth.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const conversationId = [userId, recipientId].sort().join('_');

  try {
    // Include service_request_id for service messages, but don't include 'type' field
    // Create the message object with only the fields that exist in the database
    const newMessage = {
      sender_id: userId,
      recipient_id: recipientId,
      content,
      created_at: new Date().toISOString(),
      // Note: The database doesn't have a conversation_id column
      ...(type === 'service' && additionalData.service_request_id ?
        { service_request_id: additionalData.service_request_id } : {}),
      ...Object.entries(additionalData)
        .filter(([key]) => key !== 'service_request_id' && key !== 'type' && key !== 'conversation_id')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    };

    console.log('[messagesService] Sending message:', {
      userId,
      recipientId,
      conversationId,
      content,
      newMessage
    });
    
    // Attempt to insert the message
    console.log('[messagesService] Inserting message into supabase...');

    const { data, error } = await supabase
      .from('messages')
      .insert([newMessage])
      .select();

    if (error) {
      console.error('[messagesService] Supabase insert error:', error);
      throw error;
    }

    console.log('[messagesService] Insert successful, data:', data);
    
    if (data && data[0]) {
      // Format for UI
      const uiMessage: Message = {
        id: data[0].id,
        senderId: data[0].sender_id,
        content: data[0].content,
        type: data[0].service_request_id ? 'service' : type,
        imageUrl: type === 'image' ? additionalData.imageUrl : null,
        serviceInfo: data[0].service_request_id ? { id: data[0].service_request_id } : undefined,
        createdAt: data[0].created_at,
        readAt: data[0].read_at,
        conversationId,
      };
      
      // Update Redux store
      store.dispatch(addMessage(uiMessage));
      
      return uiMessage;
    }
    
    return null;
  } catch (error: any) {
    console.error('[messagesService] Error sending message:', error);
    return null;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds: string | string[]) => {
  try {
    const idsArray = Array.isArray(messageIds) ? messageIds : [messageIds];
    
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', idsArray);
  } catch (error) {
    console.error('[messagesService] Error marking messages as read:', error);
  }
};

/**
 * Set up a real-time subscription for new messages
 */
export const setupMessageSubscription = (otherUserId: string, onNewMessage: (message: Message) => void) => {
  const userId = store.getState().auth.user?.id;
  if (!userId) return null;
  
  const conversationId = [userId, otherUserId].sort().join('_');
  
  console.log(`[messagesService] Setting up subscription for conversation between ${userId} and ${otherUserId}`);

  // Supabase realtime doesn't support complex OR filters, so we'll simplify
  // Simply listen to all messages in the table and filter in the callback

  // Set up the subscription
  const channel = supabase
    .channel(`conversation_${conversationId}_${Date.now()}`) // Add timestamp to make unique
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
      // No filter - we'll filter messages in the callback
    }, payload => {
      // Check if this message belongs to our conversation
      const messageUserId = payload.new.sender_id;
      const messageOtherUserId = payload.new.recipient_id;

      const isRelevantMessage =
        (messageUserId === userId && messageOtherUserId === otherUserId) ||
        (messageUserId === otherUserId && messageOtherUserId === userId);

      if (!isRelevantMessage) {
        console.log('[messagesService] Ignoring message not relevant to this conversation');
        return;
      }

      console.log('[messagesService] Relevant message received:', payload.new);

      // Format for UI
      const message: Message = {
        id: payload.new.id,
        senderId: payload.new.sender_id,
        content: payload.new.content,
        type: payload.new.service_request_id ? 'service' : 'text',
        imageUrl: null,
        serviceInfo: payload.new.service_request_id ? { id: payload.new.service_request_id } : undefined,
        createdAt: payload.new.created_at,
        readAt: payload.new.read_at,
        conversationId,
      };

      // Mark as delivered/read if we're the recipient
      if (payload.new.recipient_id === userId) {
        markMessagesAsRead(payload.new.id);
      }

      // Notify via callback
      onNewMessage(message);
    });

  console.log('[messagesService] Subscribing to channel...');
  const subscription = channel.subscribe((status) => {
    console.log(`[messagesService] Subscription status: ${status}`);
  });

  return subscription;
};

/**
 * Start a new conversation with another user
 */
export const startConversation = async (otherUserId: string, initialMessage: string) => {
  const message = await sendMessage(otherUserId, initialMessage);
  if (message) {
    // Set this as the active conversation
    store.dispatch(setActiveConversation(message.conversationId));
    return message.conversationId;
  }
  return null;
};

/**
 * Set the active conversation in the Redux store
 */
export const setActiveConversationAction = (conversationId: string) => {
  store.dispatch(setActiveConversation(conversationId));
  return fetchMessages(conversationId);
};