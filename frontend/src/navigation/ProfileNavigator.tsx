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
import LocationSettingsScreen from '../screens/profile/settings/LocationSettingsScreen';

// Stripe screens
import AddPaymentMethodScreen from '../screens/profile/payments/AddPaymentMethodScreen';
import PaymentConfirmationScreen from '../screens/profile/payments/PaymentConfirmationScreen';
import PaymentSuccessScreen from '../screens/profile/payments/PaymentSuccessScreen';
import StripeConnectSetupScreen from '../screens/profile/payments/StripeConnectSetupScreen';
import BankAccountScreen from '../screens/profile/payments/BankAccountScreen';

// Earnings screens
import EarningsDashboardScreen from '../screens/profile/EarningsDashboardScreen';
import PayoutSettingsScreen from '../screens/profile/PayoutSettingsScreen';
import TransactionHistoryScreen from '../screens/profile/TransactionHistoryScreen';
import TransactionDetailScreen from '../screens/profile/TransactionDetailScreen';
import ReceiptViewScreen from '../screens/profile/ReceiptViewScreen';
import RefundsManagementScreen from '../screens/profile/RefundsManagementScreen';

// Create placeholder components for screens we haven't implemented yet
const PlaceholderScreen = ({ route }: any) => {
  // Safely extract screen name to avoid direct string rendering
  const screenNameFromParams = route.params?.name || '';
  const screenNameFromRoute = route.name || '';
  const fallbackName = 'Screen';

  const screenName = screenNameFromParams || screenNameFromRoute || fallbackName;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RNText style={{ fontSize: 18, marginBottom: 10 }}>
        {screenName}
      </RNText>
      <RNText style={{ fontSize: 16, color: '#555' }}>
        Coming soon!
      </RNText>
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
        cardStyle: { backgroundColor: '#f9f9f9' },
        // Remove string based title options to ensure all text is wrapped
        headerTitle: () => null
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
        options={{ headerShown: false }}
      />
      
      {/* Payment/Stripe Screens */}
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} />
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="StripeConnectSetup" component={StripeConnectSetupScreen} />
      <Stack.Screen name="BankAccount" component={BankAccountScreen} options={{ headerShown: true, headerTitle: 'Bank Accounts' }} />

      {/* Preferences Screens */}
      <Stack.Screen
        name="LocationSettings"
        component={LocationSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LanguageSettings"
        component={PlaceholderScreen}
        initialParams={{ name: 'Language' }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppearanceSettings"
        component={PlaceholderScreen}
        initialParams={{ name: 'Appearance' }}
        options={{ headerShown: false }}
      />

      {/* Support Screens */}
      <Stack.Screen
        name="HelpCenter"
        component={PlaceholderScreen}
        initialParams={{ name: 'Help Center' }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="About"
        component={PlaceholderScreen}
        initialParams={{ name: 'About PetCoApp' }}
        options={{ headerShown: false }}
      />
      
      {/* Earnings Screens */}
      <Stack.Screen name="EarningsDashboard" component={EarningsDashboardScreen} />
      <Stack.Screen name="PayoutSettings" component={PayoutSettingsScreen} />
      <Stack.Screen name="TransactionsList" component={TransactionHistoryScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="ReceiptView" component={ReceiptViewScreen} />
      <Stack.Screen name="RefundsManagement" component={RefundsManagementScreen} />
      <Stack.Screen
        name="TaxInformation"
        component={PlaceholderScreen}
        initialParams={{ name: 'Tax Information' }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentSchedule"
        component={PlaceholderScreen}
        initialParams={{ name: 'Payment Schedule' }}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}