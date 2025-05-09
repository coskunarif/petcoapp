import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Text,
  Platform,
  SafeAreaView
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import BrowseServicesTab from './BrowseServicesTab';
import MyListingsTab from './MyListingsTab';
import RequestsTab from './RequestsTab';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { logEvent } from '../../lib/analytics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, globalStyles } from '../../theme';

const Tab = createBottomTabNavigator();

import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function ServicesScreen() {
  console.log('[ServicesScreen] Rendering ServicesScreen');
  
  // Animation values for header
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // Handle tab bar badge
  const [requestsCount, setRequestsCount] = useState(3);
  
  useEffect(() => {
    console.log('[ServicesScreen] ServicesScreen mounted');
    logEvent('screen_view', { screen: 'ServicesScreen' });
  }, []);

  const handleScroll = (event: any) => {
    try {
      // Simpler validation to avoid logging huge objects
      if (!event?.nativeEvent?.contentOffset?.y && event?.nativeEvent?.contentOffset?.y !== 0) {
        // Minimize the logging to prevent flooding the console
        console.warn('[ServicesScreen] Invalid scroll event received');
        return;
      }
      
      const scrollPosition = event.nativeEvent.contentOffset.y;
      
      // Only update if the value changed to reduce animation updates
      // Always set the value regardless of current value
      // We can't access the current value of scrollY directly since _value and __getValue are not recommended
      scrollY.setValue(scrollPosition);
    } catch (error) {
      console.error('[ServicesScreen] Error in handleScroll:', error);
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={['rgba(108,99,255,0.08)', 'rgba(255,255,255,0.05)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Fixed Header that appears on scroll */}
        {/* Fixed header implementation that avoids native animation issues with shadow properties */}
        <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
          {/* Use regular View with shadow styles instead of directly on Animated.View */}
          <View style={styles.fixedHeaderInner}>
            <BlurView intensity={80} style={styles.blurHeader} tint="light">
              <SafeAreaView style={styles.headerContent}>
                <Text style={styles.headerTitle}>Services</Text>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => console.log('Filter pressed')}
                >
                  <MaterialCommunityIcons name="tune-variant" size={22} color={theme.colors.text} />
                </TouchableOpacity>
              </SafeAreaView>
            </BlurView>
          </View>
        </Animated.View>

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
                  
                  // Ensure iconName is always a valid MaterialCommunityIcons name
                  // Type assertion to tell TypeScript this is a valid icon name
                  const validIconName = iconName as keyof typeof MaterialCommunityIcons.glyphMap;
                  
                  return <MaterialCommunityIcons name={validIconName} size={size} color={color} />;
                } catch (error) {
                  console.error('[ServicesScreen] Error rendering tab icon:', error);
                  // Return null as a fallback if there's an error
                  return null;
                }
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: theme.colors.textTertiary,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabBarLabel,
              headerShown: false, // Hide the default header
            })}
            screenListeners={({ route }) => ({
              focus: () => logEvent('tab_view', { tab: route.name }),
            })}
          >
            <Tab.Screen 
              name="BrowseServices" 
              children={(props) => <BrowseServicesTab {...props} onScroll={handleScroll} />}
              options={{ 
                title: 'Browse', 
                tabBarAccessibilityLabel: 'Browse Services Tab', 
                tabBarTestID: 'tab-browse' 
              }}
            />
            <Tab.Screen 
              name="MyListings" 
              children={(props) => <MyListingsTab {...props} onScroll={handleScroll} />}
              options={{ 
                title: 'My Listings', 
                tabBarAccessibilityLabel: 'My Listings Tab', 
                tabBarTestID: 'tab-mylistings' 
              }}
            />
            <Tab.Screen 
              name="Requests" 
              children={(props) => <RequestsTab {...props} onScroll={handleScroll} />}
              options={{ 
                title: 'Requests', 
                tabBarAccessibilityLabel: 'Requests Tab', 
                tabBarTestID: 'tab-requests',
                tabBarBadge: requestsCount > 0 ? requestsCount : undefined,
                tabBarBadgeStyle: {
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                  fontSize: 12,
                },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // Remove all shadow properties from animated component
  },
  fixedHeaderInner: {
    // Put shadow properties on a non-animated View
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  blurHeader: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    height: Platform.OS === 'ios' ? 44 : 54,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 0,
    elevation: 12,
    // Use only elevation for Android and avoid shadow properties that don't work with native animations
    ...(Platform.OS === 'ios' ? {
      // iOS-specific shadow
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    } : {}),
    paddingTop: 10,
    height: 60,
    paddingBottom: 6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
