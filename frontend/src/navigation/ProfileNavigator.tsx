import React from 'react';
import { View, Text as RNText } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Main profile screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Settings screens
import PersonalInfoScreen from '../screens/profile/settings/PersonalInfoScreen';
import PaymentMethodsScreen from '../screens/profile/settings/PaymentMethodsScreen';
import NotificationSettingsScreen from '../screens/profile/settings/NotificationSettingsScreen';

// Create placeholder components for screens we haven't implemented yet
const PlaceholderScreen = ({ route }: any) => {
  const name = route.params?.name || route.name || 'Screen';
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RNText style={{ fontSize: 18, marginBottom: 10 }}>{name} Screen</RNText>
      <RNText style={{ fontSize: 16, color: '#555' }}>Coming soon!</RNText>
    </View>
  );
};

const Stack = createStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f9f9f9' }
      }}
    >
      {/* Main Profile Screens */}
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      
      {/* Account Settings Screens */}
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen 
        name="PrivacySettings" 
        component={PlaceholderScreen} 
        initialParams={{ name: 'Privacy & Security' }} 
      />
      
      {/* Preferences Screens */}
      <Stack.Screen 
        name="LocationSettings" 
        component={PlaceholderScreen}
        initialParams={{ name: 'Location Settings' }}
      />
      <Stack.Screen 
        name="LanguageSettings" 
        component={PlaceholderScreen}
        initialParams={{ name: 'Language' }}
      />
      <Stack.Screen 
        name="AppearanceSettings" 
        component={PlaceholderScreen}
        initialParams={{ name: 'Appearance' }}
      />
      
      {/* Support Screens */}
      <Stack.Screen 
        name="HelpCenter" 
        component={PlaceholderScreen}
        initialParams={{ name: 'Help Center' }}
      />
      <Stack.Screen 
        name="About" 
        component={PlaceholderScreen}
        initialParams={{ name: 'About PetCoApp' }}
      />
    </Stack.Navigator>
  );
}