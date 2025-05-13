import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Linking, Text } from 'react-native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useSelector, useDispatch } from 'react-redux';
import PetDetailModal from '../screens/PetsScreen/PetDetailModal.native';
import { supabase } from '../supabaseClient';

const Stack = createStackNavigator();

// Fallback Main screen that redirects to Tabs
function MainFallbackScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    console.warn("Redirected from legacy 'Main' screen. Please update navigation logic.");
    navigation.replace('Tabs');
  }, [navigation]);
  // Using null is fine since we're not rendering any UI
  return null;
}

export default function RootNavigator() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  // Set up deep linking
  useEffect(() => {
    // Set up URL event listener for auth deep links
    const handleDeepLink = async (event) => {
      const url = event.url;
      
      // Handle auth callback URLs
      if (url.includes('auth-callback') || url.includes('reset-password')) {
        try {
          // Let Supabase SDK handle the URL
          const { data, error } = await supabase.auth.getSessionFromUrl({ url });
          if (error) {
            console.error('Error with auth deep link:', error.message);
          }
        } catch (error) {
          console.error('Error processing deep link:', error);
        }
      }
    };

    // Add event listener for when the app is opened via a URL
    Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Clean up listener
    return () => {
      // Remove event listener (using the new API pattern)
      const subscription = Linking.addEventListener('url', handleDeepLink);
      subscription.remove();
    };
  }, []);

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Tabs" component={MainNavigator} />
          <Stack.Screen name="PetDetail" component={PetDetailModal} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
