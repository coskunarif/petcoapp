import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PetListScreen from '../screens/pets/PetListScreen';
import ServicesScreen from '../screens/services';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="home" color={color} size={size} />) }}
      />
      <Tab.Screen 
        name="Pets" 
        component={PetListScreen}
        options={{ tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="dog" color={color} size={size} />) }}
      />
      <Tab.Screen 
        name="Services" 
        component={ServicesScreen}
        options={{ tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="handshake" color={color} size={size} />) }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="chat" color={color} size={size} />) }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="account" color={color} size={size} />) }}
      />
    </Tab.Navigator>
  );
}
