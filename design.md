# Messages Screen: Implementation Design

The Messages screen is critical for fostering trust and coordination between pet owners in your co-op community. This component enables direct communication about services, pets, and care instructions.

## 1. Screen Purpose & User Flow

The Messages screen will serve as a communication hub where users can:
- View all conversations with other users
- Send and receive messages related to services
- Share photos of pets during care
- Coordinate service details
- Receive system notifications

## 2. Component Structure

```
MessagesScreen/
├── ConversationsList/
│   ├── ConversationCard/
│   └── EmptyConversationsState/
├── SearchBar/
├── ConversationFilters/
└── ChatDetailScreen/
    ├── MessageHeader/
    ├── MessageList/
    │   ├── TextMessage/
    │   ├── ImageMessage/
    │   ├── ServiceRequestMessage/
    │   └── SystemMessage/
    ├── MessageInputBar/
    │   ├── TextInput/
    │   ├── ImageAttachmentButton/
    │   └── QuickActionButtons/
    └── ServiceDetailsCard/
```

## 3. Data Architecture

### Conversation Entity
- Participants (users)
- Last message preview
- Unread count
- Timestamp
- Associated service request (optional)
- Conversation status (active/archived)

### Message Entity
- Sender reference
- Content (text, image URL, structured data)
- Timestamp
- Read status
- Message type (text, image, system, service)
- Related entity references (service request, pet)

## 4. Screen Flows

### Main Inbox Flow
1. User navigates to Messages tab
2. System loads conversations sorted by recent activity
3. Unread conversations are visually highlighted
4. User can search or filter conversations
5. User taps on conversation to enter chat

### Chat Detail Flow
1. User views message history with another user
2. Messages load with pagination (recent first)
3. User types and sends messages
4. Real-time updates show new messages
5. User can share images or quick responses
6. Service context is visible when applicable

### New Conversation Flow
1. User initiates conversation from service/profile
2. System creates conversation if not existing
3. Service context is automatically attached
4. Suggested initial message is pre-populated
5. User completes and sends message

## 5. Supabase Integration

### Real-time Messaging
- Subscribe to message channels
- PostgreSQL triggers for unread counts
- Message delivery status tracking

### Queries
```sql
-- Example of conversation query with last message
CREATE OR REPLACE FUNCTION get_conversations(p_user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_image TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP,
  unread_count INTEGER,
  service_request_id UUID
) AS $$
BEGIN
  RETURN QUERY
  WITH conversation_users AS (
    SELECT 
      m.conversation_id,
      CASE 
        WHEN m.sender_id = p_user_id THEN m.recipient_id 
        ELSE m.sender_id 
      END AS other_user_id
    FROM messages m
    WHERE m.sender_id = p_user_id OR m.recipient_id = p_user_id
    GROUP BY 1, 2
  ),
  last_messages AS (
    SELECT 
      m.conversation_id,
      m.content as last_message,
      m.created_at as last_message_time,
      ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) as rn
    FROM messages m
  ),
  unread_counts AS (
    SELECT
      m.conversation_id,
      COUNT(*) as unread_count
    FROM messages m
    WHERE 
      m.recipient_id = p_user_id AND 
      m.read_at IS NULL
    GROUP BY m.conversation_id
  )
  SELECT 
    cu.conversation_id,
    cu.other_user_id,
    u.full_name as other_user_name,
    u.profile_image_url as other_user_image,
    lm.last_message,
    lm.last_message_time,
    COALESCE(uc.unread_count, 0) as unread_count,
    c.service_request_id
  FROM conversation_users cu
  JOIN users u ON cu.other_user_id = u.id
  JOIN last_messages lm ON cu.conversation_id = lm.conversation_id AND lm.rn = 1
  LEFT JOIN unread_counts uc ON cu.conversation_id = uc.conversation_id
  LEFT JOIN conversations c ON cu.conversation_id = c.id
  ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql;
```

## 6. State Management

### Redux Store Structure
```
messaging: {
  conversations: {
    byId: {
      [conversationId]: {
        id: string,
        otherUser: UserBasicInfo,
        lastMessage: string,
        lastMessageTime: timestamp,
        unreadCount: number,
        serviceRequestId?: string
      }
    },
    allIds: string[],
    loading: boolean,
    error: string | null
  },
  activeConversation: {
    id: string | null,
    messages: Message[],
    loading: boolean,
    sending: boolean,
    error: string | null,
    pageInfo: {
      hasMore: boolean,
      cursor: string | null
    }
  },
  filters: {
    searchTerm: string,
    showArchived: boolean,
    serviceRequestFilter: string | null
  }
}
```

## 7. UI Components Specification

### Conversation Card
- User avatar (with online indicator)
- User name
- Message preview (truncated)
- Timestamp (relative)
- Unread indicator/counter
- Service icon if conversation is linked to service
- Swipe actions (archive, delete, mark read/unread)

### Message Bubbles
- Sender-side alignment (left/right)
- Color-coding by type
- Timestamp display
- Read receipts
- Content-specific formatting
- Service details card for service messages
- Interactive elements for system messages

### Input Bar
- Expandable text input
- Camera/gallery access
- Send button (with loading state)
- Quick action buttons for common responses
- Context-aware suggestions

## 8. Real-time Functionality

### Message Delivery
- Optimistic UI updates
- Delivery status tracking (sent, delivered, read)
- Failure handling and retry options

### Presence Indicators
- User online status
- Typing indicators
- Read receipts

### Subscription Setup
```typescript
const setupMessageSubscription = (conversationId, onMessageReceived) => {
  return supabase
    .channel(`conversation:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload) => {
      // Handle new message
      onMessageReceived(payload.new);
      
      // Mark as delivered if recipient
      if (payload.new.sender_id !== currentUserId) {
        markMessageAsDelivered(payload.new.id);
      }
    })
    .subscribe();
};
```

## 9. Performance Considerations

- Message pagination (20-30 messages per batch)
- Image compression before upload
- Lazy loading of images
- Caching strategies for conversation list
- Background message fetching
- Indicator for new messages when scrolled up

## 10. Privacy & Moderation

- Content filtering for inappropriate messages
- Reporting functionality
- Conversation archiving
- User blocking capability
- Data retention policies

## 11. Notifications Integration

- Push notifications for new messages
- Customizable notification settings
- In-app badge counters
- Notification grouping by conversation
- Deep linking from notifications to conversations

## 12. Special Features

### Service Context Integration
- Display service details in conversation
- Quick actions related to service status
- Ability to share pet information cards
- Schedule reminders within conversation

### Empty State Design
- Friendly illustration
- "No messages yet" messaging
- Suggestion to browse services
- Quick action to start conversations



This comprehensive messaging implementation provides a robust foundation for real-time communication in your Pet Care Co-Op App. The design emphasizes performance, usability, and context-awareness to facilitate meaningful connections between pet owners in your community.