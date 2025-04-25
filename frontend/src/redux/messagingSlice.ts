import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserBasicInfo {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface Conversation {
  id: string;
  otherUser: UserBasicInfo;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  serviceRequestId?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'service';
  imageUrl?: string;
  serviceInfo?: string;
  createdAt: string;
  readAt?: string;
}

interface MessagingState {
  conversations: {
    byId: Record<string, Conversation>;
    allIds: string[];
    loading: boolean;
    error: string | null;
  };
  activeConversation: {
    id: string | null;
    messages: Message[];
    loading: boolean;
    sending: boolean;
    error: string | null;
    pageInfo: {
      hasMore: boolean;
      cursor: string | null;
    };
  };
  filters: {
    searchTerm: string;
    showArchived: boolean;
    serviceRequestFilter: string | null;
  };
}

const initialState: MessagingState = {
  conversations: {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  },
  activeConversation: {
    id: null,
    messages: [],
    loading: false,
    sending: false,
    error: null,
    pageInfo: {
      hasMore: true,
      cursor: null,
    },
  },
  filters: {
    searchTerm: '',
    showArchived: false,
    serviceRequestFilter: null,
  },
};

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations.byId = {};
      state.conversations.allIds = [];
      action.payload.forEach(conv => {
        state.conversations.byId[conv.id] = conv;
        state.conversations.allIds.push(conv.id);
      });
    },
    setConversationsLoading(state, action: PayloadAction<boolean>) {
      state.conversations.loading = action.payload;
    },
    setConversationsError(state, action: PayloadAction<string | null>) {
      state.conversations.error = action.payload;
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversation.id = action.payload;
      state.activeConversation.messages = [];
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.activeConversation.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.activeConversation.messages.push(action.payload);
    },
    setActiveConversationLoading(state, action: PayloadAction<boolean>) {
      state.activeConversation.loading = action.payload;
    },
    setActiveConversationError(state, action: PayloadAction<string | null>) {
      state.activeConversation.error = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<MessagingState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setConversations,
  setConversationsLoading,
  setConversationsError,
  setActiveConversation,
  setMessages,
  addMessage,
  setActiveConversationLoading,
  setActiveConversationError,
  setFilters,
} = messagingSlice.actions;

export default messagingSlice.reducer;
