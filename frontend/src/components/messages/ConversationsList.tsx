import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text } from 'react-native';
import ConversationCard from './ConversationCard';
import EmptyConversationsState from './EmptyConversationsState';
import { fetchConversations } from '../../api/messagesApi';
import { setConversations, setConversationsLoading, setConversationsError } from '../../redux/messagingSlice';
import { selectConversations, selectUserId } from '../../redux/selectors';

const ConversationsList = () => {
  const dispatch = useDispatch();
  // Use memoized selector for conversations
  const { allIds = [], byId = {}, loading = false, error = null } = useSelector(selectConversations);
  const userId = useSelector(selectUserId);

  useEffect(() => {
    const load = async () => {
      dispatch(setConversationsLoading(true));
      try {
        const data = await fetchConversations(userId);
        dispatch(setConversations(data));
        dispatch(setConversationsError(null));
      } catch (e: any) {
        dispatch(setConversationsError(e.message));
      } finally {
        dispatch(setConversationsLoading(false));
      }
    };
    if (userId) load();
  }, [userId, dispatch]);

  if (loading) return <View style={{ padding: 16 }}><Text>Loading...</Text></View>;
  if (error) return <View style={{ padding: 16 }}><Text>Error: {error}</Text></View>;
  if (!allIds.length) return <EmptyConversationsState />;

  return (
    <View style={{ padding: 8 }}>
      {allIds.map((id: string) => (
        <ConversationCard key={id} conversation={byId[id]} />
      ))}
    </View>
  );
};

export default ConversationsList;
