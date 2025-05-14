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
  metadata?: {
    role?: 'owner' | 'provider';
    serviceType?: string;
    status?: 'pending' | 'accepted' | 'completed' | 'cancelled';
  };
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'service' | 'status_update' | 'payment' | 'notification';
  imageUrl?: string;
  serviceInfo?: any;
  statusInfo?: {
    type: 'accepted' | 'declined' | 'completed' | 'cancelled' | 'scheduled' | 'payment';
    serviceId: string;
    serviceName: string;
    amount?: number;
    actionUser?: string;
  };
  paymentInfo?: {
    transactionId: string;
    amount: number;
    serviceName: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod?: {
      type: 'card' | 'credits' | 'bank';
      lastFour?: string;
      name?: string;
    };
  };
  notificationInfo?: {
    type: 'service_reminder' | 'new_service' | 'payment' | 'review' | 'system';
    title: string;
    message: string;
    referenceId?: string;
    actionRoute?: string;
  };
  createdAt: string;
  readAt?: string;
  deliveredAt?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  conversationId: string;
  isLocalOnly?: boolean;
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