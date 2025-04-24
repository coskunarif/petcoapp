import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import BrowseServicesTab from './BrowseServicesTab';
import MyListingsTab from './MyListingsTab';
import RequestsTab from './RequestsTab';
import { MaterialCommunityIcons } from 'react-native-vector-icons';

const Tab = createBottomTabNavigator();

export default function ServicesScreen() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        initialRouteName="BrowseServices"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'BrowseServices') {
              iconName = 'paw-search';
            } else if (route.name === 'MyListings') {
              iconName = 'format-list-bulleted';
            } else if (route.name === 'Requests') {
              iconName = 'swap-horizontal';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="BrowseServices" component={BrowseServicesTab} options={{ title: 'Browse' }} />
        <Tab.Screen name="MyListings" component={MyListingsTab} options={{ title: 'My Listings' }} />
        <Tab.Screen name="Requests" component={RequestsTab} options={{ title: 'Requests' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
