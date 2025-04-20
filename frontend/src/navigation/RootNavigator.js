import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

// Fallback Main screen that redirects to Tabs
function MainFallbackScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    console.warn("Redirected from legacy 'Main' screen. Please update navigation logic.");
    navigation.replace('Tabs');
  }, [navigation]);
  return null;
}

export default function RootNavigator() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Tabs" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen name="Main" component={MainFallbackScreen} />
    </Stack.Navigator>
  );
}
