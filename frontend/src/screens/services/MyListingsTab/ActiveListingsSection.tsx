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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import ListingCard from './ListingCard';

// Create animated FlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);
// Uncomment when API is available
// import { useQuery } from '@tanstack/react-query';
// import { fetchServices } from '../../../api/services';
import { useSelector } from 'react-redux';
import { theme } from '../../../theme';

// Mock data for development
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Dog Walking Service',
    description: 'Professional dog walking in your neighborhood.',
    status: 'active',
    type: 'Pet Care',
    price: 25,
    rating: 4.8,
    bookings: 14,
    icon: 'dog',
    color: '#7FBCFF',
  },
  {
    id: '2',
    title: 'Pet Sitting',
    description: 'Caring for your pets in your home while you\'re away.',
    status: 'active',
    type: 'Pet Care',
    price: 45,
    rating: 4.9,
    bookings: 28,
    icon: 'home-heart',
    color: '#FFB6B9',
  },
  {
    id: '3',
    title: 'Basic Grooming',
    description: 'Bathing, brushing, and basic grooming for cats and dogs.',
    status: 'active',
    type: 'Grooming',
    price: 35,
    rating: 4.7,
    bookings: 20,
    icon: 'scissors-cutting',
    color: '#B5FFFC',
  },
];

interface ActiveListingsSectionProps {
  onScroll?: (event: any) => void;
}

export default function ActiveListingsSection({ onScroll }: ActiveListingsSectionProps) {
  // State for managing filters
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Assume userId is available from Redux auth slice
  const userId = useSelector((state: any) => state.auth?.user?.id);
  
  // For development, using mock data instead of actual API call
  // When API is ready, uncomment this
  /*
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['myListings', userId],
    queryFn: () => fetchServices({ provider_id: userId }).then(res => res.data),
    enabled: !!userId,
  });
  */
  
  // Simulating API data
  const data = MOCK_LISTINGS;
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
  
  const renderFilterChips = () => {
    const filters = [
      { id: 'all', name: 'All Listings', icon: 'clipboard-list' },
      { id: 'active', name: 'Active', icon: 'check-circle' },
      { id: 'pending', name: 'Pending', icon: 'clock' },
      { id: 'paused', name: 'Paused', icon: 'pause-circle' },
    ];
    
    return (
      <View style={styles.filtersContainer}>
        {/* Using regular FlatList is fine here since it's not connected to animation */}
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.id && styles.filterChipSelected
              ]}
              onPress={() => setSelectedFilter(item.id)}
            >
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={16}
                color={selectedFilter === item.id ? '#FFFFFF' : theme.colors.primary}
                style={styles.filterIcon}
              />
              <Text 
                style={[
                  styles.filterChipText,
                  selectedFilter === item.id && styles.filterChipTextSelected
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filtersContent}
          // Just to be safe, add a high threshold to prevent too many events
          scrollEventThrottle={32}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your listings...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <BlurView intensity={40} tint="light" style={styles.errorCard}>
          <MaterialCommunityIcons name="alert-circle" size={32} color="#d32f2f" />
          <Text style={styles.errorText}>Failed to load your listings.</Text>
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
        <Text style={styles.emptyText}>You have no active service listings.</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create New Listing</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Initialize scroll animation value for native driver
  const nativeScrollY = useRef(new Animated.Value(0)).current;
  
  // Handle scroll events but ensure we don't mix JS and native animations
  const handleScrollEvent = (event: any) => {
    // We don't do anything with the event in this handler
    // Just forward it to the parent which has its own logic
    if (onScroll) {
      onScroll(event);
    }
  };

  return (
    <View style={styles.container}>
      {renderFilterChips()}
      
      <AnimatedFlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ListingCard listing={item} index={index} />
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
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    ...theme.elevation.small,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filtersContainer: {
    paddingVertical: 8,
    zIndex: 1,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
    ...theme.elevation.small,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: 'transparent',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterChipText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
});
