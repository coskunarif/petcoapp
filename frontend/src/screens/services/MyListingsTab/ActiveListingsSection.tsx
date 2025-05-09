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
import { theme } from '../../../theme';
import { ServiceListing } from '../../../types/services';
import { useDispatch } from 'react-redux';
import { setListingFilters } from '../../../redux/slices/serviceSlice';

// Create animated FlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);

interface ActiveListingsSectionProps {
  listings: ServiceListing[];
  refreshing: boolean;
  onRefresh: () => void;
  onEditListing?: (listing: ServiceListing) => void;
  onScroll?: (event: any) => void;
}

export default function ActiveListingsSection({ 
  listings,
  refreshing,
  onRefresh,
  onEditListing,
  onScroll 
}: ActiveListingsSectionProps) {
  const dispatch = useDispatch();
  
  // State for managing filters
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Filter listings based on selected filter
  const getFilteredListings = () => {
    if (selectedFilter === 'all') {
      return listings;
    }
    
    return listings.filter(listing => {
      if (selectedFilter === 'active') return listing.is_active === true;
      if (selectedFilter === 'paused') return listing.is_active === false;
      return true;
    });
  };
  
  const filteredListings = getFilteredListings();
  
  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    
    // Update global filter state if needed
    dispatch(setListingFilters({ 
      // Example filter update
      // Add additional filter parameters as needed
    }));
  };
  
  const renderFilterChips = () => {
    const filters = [
      { id: 'all', name: 'All Listings', icon: 'clipboard-list' },
      { id: 'active', name: 'Active', icon: 'check-circle' },
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
              onPress={() => handleFilterChange(item.id)}
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
          scrollEventThrottle={32}
        />
      </View>
    );
  };

  // Initialize scroll animation value for native driver
  const nativeScrollY = useRef(new Animated.Value(0)).current;
  
  // Handle scroll events but ensure we don't mix JS and native animations
  const handleScrollEvent = (event: any) => {
    // Just forward it to the parent which has its own logic
    if (onScroll) {
      onScroll(event);
    }
  };

  if (!listings || listings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>You have no active service listings.</Text>
        <TouchableOpacity style={styles.createButton} onPress={onRefresh}>
          <Text style={styles.createButtonText}>Create New Listing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFilterChips()}
      
      <AnimatedFlatList
        data={filteredListings}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <ListingCard 
            listing={item} 
            index={index} 
            onRefresh={onRefresh}
            onEdit={onEditListing ? () => onEditListing(item) : undefined}
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
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          selectedFilter !== 'all' ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No {selectedFilter === 'active' ? 'active' : 'paused'} listings found
              </Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => handleFilterChange('all')}
              >
                <Text style={styles.viewAllText}>View All Listings</Text>
              </TouchableOpacity>
            </View>
          ) : null
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
  noResultsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  viewAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});