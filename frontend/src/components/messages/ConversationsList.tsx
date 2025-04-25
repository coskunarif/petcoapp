import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text } from 'react-native';
import ConversationCard from './ConversationCard';
import EmptyConversationsState from './EmptyConversationsState';
import { fetchConversations } from '../../api/messagesApi';
import { setConversations, setConversationsLoading, setConversationsError } from '../../redux/messagingSlice';
import { selectUserId } from '../../redux/selectors';

const ConversationsList = () => {
  // Messaging/conversations feature is not enabled in this build.
  return (
    <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: '#888', textAlign: 'center' }}>
        Messaging is not available in this build.
      </Text>
    </View>
  );
};

export default ConversationsList;
