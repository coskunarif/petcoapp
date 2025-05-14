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
import { theme } from '../../../theme';
import { ServiceRequest } from '../../../types/services';
import { EmptyState } from '../../../components/ui';
import ProviderRequestCard from './ProviderRequestCard';

// Create animated FlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);

interface ProviderRequestsListProps {
  requests: ServiceRequest[];
  loading: boolean;
  onScroll?: (event: any) => void;
  onRefresh?: () => void;
  onSelectRequest?: (requestId: string) => void;
}

export default function ProviderRequestsList({ 
  requests, 
  loading, 
  onScroll, 
  onRefresh, 
  onSelectRequest 
}: ProviderRequestsListProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  // Initialize scroll animation value for native driver
  const nativeScrollY = useRef(new Animated.Value(0)).current;
  
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };
  
  // Handle scroll events
  const handleScrollEvent = (event: any) => {
    // Forward the scroll event to the parent
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Group requests by date
  const groupedRequests = requests.reduce<{[key: string]: ServiceRequest[]}>((groups, request) => {
    const date = new Date(request.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(request);
    return groups;
  }, {});
  
  // Sort dates from newest to oldest
  const sortedDates = Object.keys(groupedRequests).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  // Handle loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }
  
  // Handle empty state
  if (!requests || requests.length === 0) {
    return (
      <View style={styles.emptyStateWrapper}>
        <EmptyState
          icon="inbox-arrow-down"
          title="No Incoming Requests"
          description="You don't have any incoming service requests yet. Create a service listing to start receiving requests."
          buttonTitle="Create a New Listing"
          onButtonPress={() => console.log('Navigate to create listing')}
        />
      </View>
    );
  }
  
  // Render the list with sections
  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={sortedDates}
        keyExtractor={date => date}
        renderItem={({ item: date, index: dateIndex }) => (
          <View style={styles.dateSection}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedRequests[date].map((request, index) => (
              <ProviderRequestCard
                key={request.id}
                request={request}
                index={dateIndex * 100 + index} // Ensure unique index calculation
                onRefresh={handleRefresh}
                onSelect={onSelectRequest ? () => onSelectRequest(request.id) : undefined}
              />
            ))}
          </View>
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
  emptyStateWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 50,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginVertical: 8,
    paddingHorizontal: 4,
  },
});