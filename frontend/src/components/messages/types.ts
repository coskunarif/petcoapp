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
  archived?: boolean;
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

export interface MessageInputProps {
  onSend: (content: string, type?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  conversationId?: string;
}

export interface ChatDetailScreenProps {
  route: {
    params: {
      conversationId: string;
      otherUserId: string;
      otherUserName: string;
    };
  };
  navigation: any;
}