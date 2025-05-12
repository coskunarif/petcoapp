import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatDetailScreen from '../screens/messages/ChatDetailScreen';

const Stack = createStackNavigator();

const MessagesNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MessagesHome"
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        gestureEnabled: true,
        cardOverlayEnabled: true
      }}
    >
      <Stack.Screen name="MessagesHome" component={MessagesScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
};

export default MessagesNavigator;