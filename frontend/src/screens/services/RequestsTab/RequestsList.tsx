import React, { useState, useRef } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  View,
  TouchableOpacity,
  RefreshControl,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RequestCard from './RequestCard';

// Create animated FlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);
// Uncomment when API is available
// import { useQuery } from '@tanstack/react-query';
// import { fetchRequests } from '../../../api/requests';
import { useSelector } from 'react-redux';
import { theme } from '../../../theme';

// Mock data for development
const MOCK_REQUESTS = [
  {
    id: '1',
    title: 'Dog Walking Request',
    description: 'Need someone to walk my dog Rex for 30 minutes, between 2-4pm.',
    status: 'pending',
    type: 'Dog Walking',
    date: '2025-05-07',
    requester: 'John Doe',
    provider: 'Service Provider',
    icon: 'dog',
    color: '#7FBCFF',
  },
  {
    id: '2',
    title: 'Pet Sitting',
    description: 'Looking for someone to watch my cat for the weekend of May 10-12.',
    status: 'accepted',
    type: 'Pet Sitting',
    date: '2025-05-09',
    requester: 'Jane Smith',
    provider: 'Service Provider',
    icon: 'cat',
    color: '#FFB6B9',
  },
  {
    id: '3',
    title: 'Basic Grooming',
    description: 'Need grooming for my poodle. Includes bath, haircut, and nail trimming.',
    status: 'completed',
    type: 'Grooming',
    date: '2025-05-02',
    requester: 'Alex Johnson',
    provider: 'Service Provider',
    icon: 'scissors-cutting',
    color: '#B5FFFC',
  },
];

interface RequestsListProps {
  onScroll?: (event: any) => void;
}

export default function RequestsList({ onScroll }: RequestsListProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  const userId = useSelector((state: any) => state.auth?.user?.id);
  const asProvider = useSelector((state: any) => state.services?.requestsTabAsProvider) ?? true;
  
  // For development, using mock data instead of actual API call
  // When API is ready, uncomment this
  /*
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['requests', userId, asProvider],
    queryFn: () => fetchRequests({ asProvider, userId }).then(res => res.data),
    enabled: !!userId,
  });
  */
  
  // Simulating API data
  const data = MOCK_REQUESTS;
  const isLoading = false;
  const error = null;
  
  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate API refetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
    
    // When using real API
    // refetch();
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <BlurView intensity={40} tint="light" style={styles.errorCard}>
          <MaterialCommunityIcons name="alert-circle" size={32} color="#d32f2f" />
          <Text style={styles.errorText}>Failed to load requests.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BlurView intensity={40} tint="light" style={styles.emptyCard}>
          <LinearGradient
            colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']}
            style={styles.emptyIconGradient}
          >
            <MaterialCommunityIcons 
              name={asProvider ? "inbox-arrow-down" : "send-circle"} 
              size={40} 
              color={theme.colors.primary}
              style={styles.emptyIcon}
            />
          </LinearGradient>
          
          <Text style={styles.emptyTitle}>
            {asProvider ? 'No Incoming Requests' : 'No Outgoing Requests'}
          </Text>
          <Text style={styles.emptyDescription}>
            {asProvider 
              ? 'You have no service requests at this moment' 
              : 'You haven\'t made any service requests yet'
            }
          </Text>
          
          {!asProvider && (
            <TouchableOpacity style={styles.createButton}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createButtonGradient}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.createButtonText}>Request a Service</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    );
  }
  
  // Initialize animated value for scroll events outside of render function
  const scrollY = useRef(new Animated.Value(0)).current;
      
  // Handle scroll events properly
  const handleScrollEvent = (event: any) => {
    // Make sure we have a valid event
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
      return;
    }
    
    // Pass to parent if needed
    if (onScroll) {
      onScroll(event);
    }
  };
  
  return (
    <AnimatedFlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <RequestCard request={item} index={index} />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true, listener: handleScrollEvent }
      )}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { 
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  retryText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCard: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    ...theme.elevation.medium,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.elevation.small,
  },
  emptyIcon: {
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  createButton: {
    overflow: 'hidden',
    borderRadius: 16,
    ...theme.elevation.small,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
