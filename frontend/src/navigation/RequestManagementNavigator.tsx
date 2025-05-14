import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RequestListScreen from '../screens/services/RequestManagement/RequestListScreen';
import RequestDetailScreen from '../screens/services/RequestManagement/RequestDetailScreen';
import ModifyRequestScreen from '../screens/services/RequestManagement/ModifyRequestScreen';
import RequestHistoryScreen from '../screens/services/RequestManagement/RequestHistoryScreen';
import { ServicesNavigationParamList } from '../types/navigation';

const Stack = createStackNavigator<ServicesNavigationParamList>();

/**
 * Request Management Navigator
 * 
 * Stack navigation for request management screens:
 * - Request List
 * - Request Detail
 * - Modify Request
 * - Request History
 */
export default function RequestManagementNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="RequestList" component={RequestListScreen} />
      <Stack.Screen 
        name="RequestDetail" 
        component={RequestDetailScreen}
        options={{ 
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#FAFAFA' },
        }}
      />
      <Stack.Screen 
        name="ModifyRequest" 
        component={ModifyRequestScreen}
        options={{ 
          gestureEnabled: false,
          cardStyle: { backgroundColor: '#FAFAFA' },
        }}
      />
      <Stack.Screen 
        name="RequestHistory" 
        component={RequestHistoryScreen}
        options={{ 
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#FAFAFA' },
        }}
      />
    </Stack.Navigator>
  );
}