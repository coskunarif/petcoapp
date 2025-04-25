import React from 'react';

import { View, Text } from 'react-native';

const EmptyConversationsState = () => (
  <View style={{ padding: 32, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 16, color: '#888' }}>No messages yet. Start a conversation!</Text>
  </View>
);

export default EmptyConversationsState;
