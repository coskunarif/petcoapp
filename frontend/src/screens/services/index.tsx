import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import BrowseServicesTab from './BrowseServicesTab';
import MyListingsTab from './MyListingsTab';
import RequestsTab from './RequestsTab';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { logEvent } from '../../lib/analytics';

const Tab = createBottomTabNavigator();

import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function ServicesScreen() {
  useEffect(() => {
    logEvent('screen_view', { screen: 'ServicesScreen' });
  }, []);

  return (
    <ErrorBoundary>
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
          screenListeners={({ route }) => ({
            focus: () => logEvent('tab_view', { tab: route.name }),
          })}
        >
          <Tab.Screen name="BrowseServices" component={BrowseServicesTab}
            listeners={{ focus: () => logEvent('tab_view', { tab: 'BrowseServices' }) }}
            options={{ title: 'Browse', tabBarAccessibilityLabel: 'Browse Services Tab', tabBarTestID: 'tab-browse' }}
          />
          <Tab.Screen name="MyListings" component={MyListingsTab}
            listeners={{ focus: () => logEvent('tab_view', { tab: 'MyListings' }) }}
            options={{ title: 'My Listings', tabBarAccessibilityLabel: 'My Listings Tab', tabBarTestID: 'tab-mylistings' }}
          />
          <Tab.Screen name="Requests" component={RequestsTab}
            listeners={{ focus: () => logEvent('tab_view', { tab: 'Requests' }) }}
            options={{ title: 'Requests', tabBarAccessibilityLabel: 'Requests Tab', tabBarTestID: 'tab-requests' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
