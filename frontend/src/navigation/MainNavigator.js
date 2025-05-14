import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import PetOwnerScreen from '../screens/PetOwnerScreen';
import ProviderScreen from '../screens/ProviderScreen';
import MessagesNavigator from './MessagesNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard';
              break;
            case 'PetOwner':
              iconName = 'dog';
              break;
            case 'Provider':
              iconName = 'handshake';
              break;
            case 'Messages':
              iconName = 'chat';
              break;
            case 'Profile':
              iconName = 'account';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
              <MaterialCommunityIcons name={iconName} color={color} size={size} />
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabel: ({ focused, color }) => {
          // This ensures tab labels are properly wrapped in Text components
          let label;
          switch (route.name) {
            case 'PetOwner':
              label = 'Pet Owner';
              break;
            default:
              label = route.name;
          }
          
          return (
            <Text style={[styles.tabBarLabel, { color }]}>
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
      <Tab.Screen
        name="PetOwner"
        component={PetOwnerScreen}
      />
      <Tab.Screen
        name="Provider"
        component={ProviderScreen}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    paddingTop: 10,
    // Removed fixed height and paddingBottom to allow safe area handling
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  focusedIconContainer: {
    backgroundColor: `${theme.colors.primaryLight}`,
  },
});