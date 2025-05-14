import React, { useState, useRef } from 'react';
import { 
  FlatList, 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  RefreshControl,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RequestCard from './RequestCard';
import { useSelector } from 'react-redux';
import { theme } from '../../../theme';
import { 
  selectServiceRequests,
  selectServiceRequestsLoading,
  selectServiceRequestsError,
  selectRequestsTabAsProvider
} from '../../../redux/slices/serviceSlice';
import { ServiceRequest } from '../../../types/services';
import { EmptyState } from '../../../components/ui';

// Create animated FlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);

interface RequestsListProps {
  onScroll?: (event: any) => void;
  onRefresh?: () => void;
  onSelectRequest?: (requestId: string) => void;
}

export default function RequestsList({ onScroll, onRefresh, onSelectRequest }: RequestsListProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  // Get data from Redux store with safe selectors and memoization
  const requests = useSelector(
    (state: any) => state.services?.requests || [],
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );
  const loading = useSelector((state: any) => state.services?.requestsLoading || false);
  const error = useSelector((state: any) => state.services?.requestsError || null);
  const asProvider = useSelector((state: any) => state.services?.requestsTabAsProvider ?? true);
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Filtered requests based on status filter
  const filteredRequests = statusFilter
    ? requests.filter(req => req.status === statusFilter)
    : requests;
  
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };
  
  // Initialize scroll animation value for native driver
  const nativeScrollY = useRef(new Animated.Value(0)).current;
  
  // Handle scroll events
  const handleScrollEvent = (event: any) => {
    // Forward the scroll event to the parent
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Function to render status filter chips
  const renderStatusFilter = () => {
    const statuses = [
      { id: null, label: 'All', icon: 'filter-variant' },
      { id: 'pending', label: 'Pending', icon: 'clock-outline' },
      { id: 'accepted', label: 'Accepted', icon: 'handshake' },
      { id: 'completed', label: 'Completed', icon: 'check-circle' },
      { id: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
    ];
    
    return (
      <View style={styles.filterContainer}>
        <FlatList
          data={statuses}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === item.id && styles.activeFilterChip
              ]}
              onPress={() => setStatusFilter(item.id)}
            >
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={14}
                color={statusFilter === item.id ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.filterIcon}
              />
              <Text style={[
                styles.filterText,
                statusFilter === item.id && styles.activeFilterText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id || 'all'}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
    );
  };
  
  // Handle loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }
  
  // Handle error state
  if (error && !refreshing) {
    return (
      <View style={styles.emptyStateWrapper}>
        <EmptyState
          icon="alert-circle"
          title="Something went wrong"
          description={`We couldn't load your requests: ${error}`}
          buttonTitle="Try Again"
          onButtonPress={handleRefresh}
        />
      </View>
    );
  }
  
  // Handle empty state
  if (!requests || requests.length === 0) {
    return (
      <View style={styles.container}>
        {renderStatusFilter()}
        
        <View style={styles.emptyStateWrapper}>
          <EmptyState
            icon={asProvider ? "inbox-arrow-down" : "send-circle"}
            title={asProvider ? "No Incoming Requests" : "No Outgoing Requests"}
            description={
              asProvider 
                ? "You don't have any incoming service requests yet" 
                : "You haven't made any service requests yet"
            }
            buttonTitle={asProvider ? "Create a New Listing" : "Browse Services"}
            onButtonPress={() => console.log('Navigate to services browse')}
          />
        </View>
      </View>
    );
  }
  
  // Handle filtered empty state
  if (filteredRequests.length === 0) {
    return (
      <View style={styles.container}>
        {renderStatusFilter()}
        
        <View style={styles.emptyStateWrapper}>
          <EmptyState
            icon="filter-variant-remove"
            title="No matching requests"
            description={`You don't have any ${statusFilter} requests`}
            buttonTitle="View All Requests"
            onButtonPress={() => setStatusFilter(null)}
          />
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {renderStatusFilter()}
      
      <AnimatedFlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <RequestCard
            request={item}
            index={index}
            onRefresh={handleRefresh}
            onSelect={onSelectRequest ? () => onSelectRequest(item.id) : undefined}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: nativeScrollY } } }],
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  emptyStateWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 50,
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
  emptyFilteredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyFilteredText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  viewAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    borderColor: 'transparent',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
});