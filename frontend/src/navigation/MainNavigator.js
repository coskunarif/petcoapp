import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PetsScreen from '../screens/PetsScreen';
import ServicesScreen from '../screens/services';
import MessagesNavigator from './MessagesNavigator';
import ProfileNavigator from './ProfileNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Pets':
              iconName = 'dog';
              break;
            case 'Services':
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
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Pets" 
        component={PetsScreen}
      />
      <Tab.Screen 
        name="Services" 
        component={ServicesScreen}
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