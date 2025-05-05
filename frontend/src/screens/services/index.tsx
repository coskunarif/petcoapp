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
  console.log('[ServicesScreen] Rendering ServicesScreen');
  
  useEffect(() => {
    console.log('[ServicesScreen] ServicesScreen mounted');
    logEvent('screen_view', { screen: 'ServicesScreen' });
  }, []);

  return (
    <ErrorBoundary>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          initialRouteName="BrowseServices"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              console.log('[ServicesScreen] Rendering tab icon for route:', route.name);
              
              // Default icon name as fallback
              let iconName = 'circle';
              
              try {
                if (route.name === 'BrowseServices') {
                  iconName = 'magnify'; // Replaced 'paw-search' with a valid icon
                } else if (route.name === 'MyListings') {
                  iconName = 'format-list-bulleted';
                } else if (route.name === 'Requests') {
                  iconName = 'swap-horizontal';
                }
                
                // Defensive check to ensure iconName is always a valid string
                if (!iconName || typeof iconName !== 'string') {
                  console.warn('[ServicesScreen] Invalid icon name for route:', route.name);
                  iconName = 'circle'; // Fallback icon
                }
                
                console.log('[ServicesScreen] Using icon:', iconName);
                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
              } catch (error) {
                console.error('[ServicesScreen] Error rendering tab icon:', error);
                // Return null as a fallback if there's an error
                return null;
              }
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
