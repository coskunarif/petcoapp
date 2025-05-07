import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ActiveListingsSection from './ActiveListingsSection';
import EmptyListingsState from './EmptyListingsState';
import { theme } from '../../../theme';
import { useSelector } from 'react-redux';

interface MyListingsTabProps {
  onScroll?: (event: any) => void;
}

export default function MyListingsTab({ onScroll }: MyListingsTabProps) {
  // In a real app, we would fetch this from an API
  // Placeholder logic for whether user has listings
  const [hasListings, setHasListings] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: any) => state.auth?.user);
  
  // Split animation values by purpose to avoid conflicts:
  // jsScrollY is used for JS-based animations within this component only
  const jsScrollY = useRef(new Animated.Value(0)).current;
  
  // localScrollY is never directly connected to events - it's just for local use
  const localScrollY = useRef(new Animated.Value(0)).current;
  
  // Internal event handler for our component - doesn't use native driver
  const handleLocalScroll = (event: any) => {
    if (!event?.nativeEvent?.contentOffset?.y && event.nativeEvent?.contentOffset?.y !== 0) {
      return;
    }
    
    const scrollPosition = event.nativeEvent.contentOffset.y;
    // Update local animation value (not connected to native driver)
    jsScrollY.setValue(scrollPosition);
  };
  
  // Separate handler to forward events to parent component
  const handleParentScroll = (event: any) => {
    if (onScroll) {
      // Forward the original event without modification
      onScroll(event);
    }
  };
  
  // Calculate header animation values - use jsScrollY for pure JS animations
  const translateY = jsScrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = jsScrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  
  // Simulating user data fetch
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API delay
    const timeout = setTimeout(() => {
      setIsLoading(false);
      
      // For demo, we're setting hasListings to true
      setHasListings(true);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        {
          opacity: headerOpacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <BlurView intensity={10} tint="light" style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>My Listings</Text>
          <Text style={styles.headerSubtitle}>Manage your service offerings</Text>
          
          <View style={styles.actionRow}>
            <Text style={styles.statsText}>
              {isLoading ? 'Loading...' : `${hasListings ? '3 Active' : '0'} Listings`}
            </Text>
            
            <TouchableOpacity style={styles.addButton}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.addButtonGradient}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>New Listing</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header Section */}
      {renderHeader()}
      
      {/* Content Section */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons 
              name="loading" 
              size={28} 
              color={theme.colors.primary}
              style={{ opacity: 0.7 }}
            />
            <Text style={styles.loadingText}>Loading your listings...</Text>
          </View>
        ) : (
          hasListings ? 
            <ActiveListingsSection 
              onScroll={(e) => {
                // Split the event handling into separate functions
                handleLocalScroll(e);
                handleParentScroll(e);
              }} 
            /> : 
            <EmptyListingsState />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerContainer: {
    height: 160,
    overflow: 'hidden',
  },
  headerBlur: {
    flex: 1,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
