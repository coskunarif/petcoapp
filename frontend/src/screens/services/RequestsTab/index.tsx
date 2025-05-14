import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text,
  Platform,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RequestsFilterToggle from './RequestsFilterToggle';
import RequestsList from './RequestsList';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAllServiceRequests,
  setRequestsTabAsProvider,
  selectRequestsTabAsProvider
} from '../../../redux/slices/serviceSlice';
import { AppDispatch } from '../../../redux/store';

interface RequestsTabProps {
  onScroll?: (event: any) => void;
}

export default function RequestsTab({ onScroll }: RequestsTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  // Safe selector that handles undefined state
  const asProvider = useSelector((state: any) => state.services?.requestsTabAsProvider ?? true);
  const user = useSelector((state: any) => state.auth?.user);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Load requests on mount and when filter changes
  useEffect(() => {
    loadRequests();
  }, [asProvider, user?.id]);
  
  // Function to load requests
  const loadRequests = async () => {
    try {
      if (!user?.id) {
        console.warn('Cannot fetch requests - user not authenticated');
        return;
      }
      
      // Dispatch to fetch requests with the current filter
      await dispatch(fetchAllServiceRequests({
        userId: user.id,
        asProvider,
      }));
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };
  
  // Function to toggle between as provider/requester
  const handleToggleRole = (asProvider: boolean) => {
    dispatch(setRequestsTabAsProvider(asProvider));
  };
  
  const handleScroll = (event: any) => {
    // Make sure we have a valid event
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
      console.warn('[RequestsTab] Invalid scroll event:', event);
      return;
    }
  
    // Update our local animation value
    const scrollPosition = event.nativeEvent.contentOffset.y;
    // Just set the value directly
    scrollY.setValue(scrollPosition);
    
    // Simply pass the event through to parent if needed
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Calculate header animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        { opacity: headerOpacity }
      ]}
    >
      <BlurView intensity={10} tint="light" style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Service Requests</Text>
          <Text style={styles.headerSubtitle}>
            {asProvider 
              ? 'Manage requests from others for your services' 
              : 'Track your service requests to other providers'
            }
          </Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
  
  // Get the navigation prop
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      {renderHeader()}
      
      {/* Filter Toggle */}
      <RequestsFilterToggle
        asProvider={asProvider}
        onToggle={handleToggleRole}
      />
      
      {/* View All Requests Button */}
      <View style={styles.viewAllContainer}>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('RequestManagement')}
        >
          <Text style={styles.viewAllText}>
            View All Requests
          </Text>
          <MaterialCommunityIcons 
            name="arrow-right" 
            size={18} 
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      
      {/* Request List */}
      <RequestsList 
        onScroll={handleScroll}
        onRefresh={loadRequests}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerContainer: {
    height: 120,
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
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
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
  viewAllContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
});