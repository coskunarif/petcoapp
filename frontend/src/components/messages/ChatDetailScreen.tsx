import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageHeader from './MessageHeader';
import MessageList from './MessageList';
import MessageInputBar from './MessageInputBar';
import ServiceDetailsCard from './ServiceDetailsCard';
import { fetchMessages, setupMessageSubscription } from '../../api/messagesApi';
import { setMessages, addMessage, setActiveConversationLoading, setActiveConversationError } from '../../redux/messagingSlice';

const ChatDetailScreen = () => {
  const dispatch = useDispatch();
  const conversationId = useSelector((state: any) => state.messaging.activeConversation.id);
  const messages = useSelector((state: any) => state.messaging.activeConversation.messages);
  const loading = useSelector((state: any) => state.messaging.activeConversation.loading);
  const error = useSelector((state: any) => state.messaging.activeConversation.error);
  const userId = useSelector((state: any) => state.auth?.user?.id); // adjust as needed

  useEffect(() => {
    const load = async () => {
      if (!conversationId) return;
      dispatch(setActiveConversationLoading(true));
      try {
        const data = await fetchMessages(conversationId);
        dispatch(setMessages(data));
        dispatch(setActiveConversationError(null));
      } catch (e: any) {
        dispatch(setActiveConversationError(e.message));
      } finally {
        dispatch(setActiveConversationLoading(false));
      }
    };
    load();
    // Real-time subscription
    let subscription: any;
    if (conversationId && userId) {
      subscription = setupMessageSubscription(conversationId, (msg) => {
        dispatch(addMessage(msg));
      }, userId);
    }
    return () => {
      if (subscription && subscription.unsubscribe) subscription.unsubscribe();
    };
  }, [conversationId, userId, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <MessageHeader />
      <MessageList messages={messages} />
      <ServiceDetailsCard />
      <MessageInputBar />
    </div>
  );
};

export default ChatDetailScreen;
