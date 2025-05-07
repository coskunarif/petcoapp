export interface Conversation {
  id: string;
  otherUser: { 
    id: string;
    name: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  type: string;
  icon: string;
  color: string;
}