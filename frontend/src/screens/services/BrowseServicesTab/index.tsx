import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  RefreshControl,
  Animated,
  Platform,
  ActivityIndicator
} from 'react-native';
import ServiceFilterBar from './ServiceFilterBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme, globalStyles } from '../../../theme';
import { 
  AppCard, 
  SectionHeader, 
  EmptyState, 
  StatusBadge 
} from '../../../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { 
  fetchServiceListings, 
  fetchAllServiceTypes,
  selectServiceListings,
  selectServiceListingsLoading,
  selectServiceListingsError,
  selectServiceTypes,
  setListingFilters,
  selectListingFilters,
  loadMockServiceListings  // Import the mock data action
} from '../../../redux/slices/serviceSlice';
import { servicesService } from '../../../services/servicesService';
import { AppDispatch, RootState } from '../../../store';

// Create a ServiceDetailModal standalone component
import ServiceDetailModal from '../ServiceDetailModal';
import ServiceCard from './ServiceCard';
import FilterModal from '../../components/services/FilterModal';

// Create animated FlatList component to support native events with useNativeDriver
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);

interface BrowseServicesTabProps {
  onScroll?: (event: any) => void;
}

// Create memoized selectors outside of the component
const selectServicesListings = createSelector(
  [(state: RootState) => state.services?.listings || []],
  (listings) => listings
);

const selectServicesLoading = createSelector(
  [(state: RootState) => state.services?.listingsLoading || false],
  (loading) => loading
);

const selectServicesError = createSelector(
  [(state: RootState) => state.services?.listingsError || null],
  (error) => error
);

const selectServiceTypesList = createSelector(
  [(state: RootState) => state.services?.serviceTypes || []],
  (types) => types
);

const selectListingFiltersList = createSelector(
  [(state: RootState) => state.services?.listingFilters || {}],
  (filters) => filters
);

const BrowseServicesTab: React.FC<BrowseServicesTabProps> = ({ onScroll }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Use proper memoized selectors
  const services = useSelector((state: RootState) => {
    console.log('[BrowseServicesTab] Selecting services from Redux state:', {
      hasServicesState: !!state.services,
      listingsLength: state.services?.listings?.length || 0,
      listings: state.services?.listings || []
    });
    return selectServicesListings(state);
  });
  
  const loading = useSelector(selectServicesLoading);
  const error = useSelector(selectServicesError);
  const serviceTypes = useSelector(selectServiceTypesList);
  const filters = useSelector(selectListingFiltersList);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(filters.typeId || null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter modal state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    serviceType?: string;
    priceRange?: [number, number];
    rating?: number;
    distance?: number;
  }>({});
  
  // Animation values - ensure consistent use of native driver for all animations
  // Use separate Animated.Value for scroll events to avoid conflicts
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 140; // Adjust this value based on your header height
  
  // These transforms will use native driver since they're simple transforms
  const translateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });
  
  // Opacity is also compatible with native driver
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    // Load service types if not loaded
    if (serviceTypes.length === 0) {
      dispatch(fetchAllServiceTypes());
    }
    
    // Initial services fetch
    fetchServices();
  }, []);

  // Refetch whenever the selected filter changes
  useEffect(() => {
    if (selectedFilter !== (filters.typeId || null)) {
      // Provide feedback via console to help debugging
      console.log('[BrowseServicesTab] Filter changed:', { 
        previous: filters.typeId || 'All', 
        new: selectedFilter || 'All' 
      });
      
      // Update Redux filter state when local filter changes
      dispatch(setListingFilters({ 
        typeId: selectedFilter || undefined 
      }));
      
      // Show loading state immediately
      if (!refreshing) {
        setRefreshing(true);
      }
      
      // Add a small delay to show loading transition
      setTimeout(() => {
        fetchServices();
      }, 300);
    }
  }, [selectedFilter]);
  
  // Track which filter produced current results
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Update active filter when services are loaded
  useEffect(() => {
    if (!loading && !refreshing) {
      setActiveFilter(selectedFilter);
    }
  }, [loading, refreshing]);

  // Helper function to create mock data for testing
  const createMockServices = () => {
    console.log('[BrowseServicesTab] Creating mock service listings for testing');
    
    const mockServiceTypes = [
      { id: 'type1', name: 'Dog Walking', icon: 'dog', credit_value: 30 },
      { id: 'type2', name: 'Pet Sitting', icon: 'home', credit_value: 50 },
      { id: 'type3', name: 'Grooming', icon: 'scissors-cutting', credit_value: 40 }
    ];
    
    const mockServices = [
      {
        id: 'service1',
        title: 'Professional Dog Walking',
        description: 'Experienced dog walker available in your area. Daily walks and exercise for your pets.',
        provider_id: 'user1',
        service_type_id: 'type1',
        is_active: true,
        created_at: new Date().toISOString(),
        provider: { id: 'user1', full_name: 'Jane Smith', profile_image_url: null },
        service_type: mockServiceTypes[0]
      },
      {
        id: 'service2',
        title: 'In-home Pet Sitting',
        description: 'I will take care of your pets in your home while you are away. Food, water, medication, and plenty of love.',
        provider_id: 'user2',
        service_type_id: 'type2',
        is_active: true,
        created_at: new Date().toISOString(),
        provider: { id: 'user2', full_name: 'John Doe', profile_image_url: null },
        service_type: mockServiceTypes[1]
      },
      {
        id: 'service3',
        title: 'Pet Grooming Services',
        description: 'Full grooming service including bath, haircut, nail trimming, and ear cleaning.',
        provider_id: 'user3',
        service_type_id: 'type3',
        is_active: true,
        created_at: new Date().toISOString(),
        provider: { id: 'user3', full_name: 'Maria Johnson', profile_image_url: null },
        service_type: mockServiceTypes[2]
      }
    ];
    
    return mockServices;
  };

  const fetchServices = async () => {
    try {
      setRefreshing(true);
      
      const filterParams: any = { is_active: true };
      
      // Apply type filter if selected
      if (selectedFilter) {
        filterParams.type_id = selectedFilter;
      }
      
      console.log('[BrowseServicesTab] Dispatching fetchServiceListings with params:', filterParams);
      
      // Check if dispatch is available
      if (!dispatch) {
        console.error('[BrowseServicesTab] Dispatch function not available');
        setRefreshing(false);
        return;
      }
      
      // First try to fetch from API
      try {
        const result = await dispatch(fetchServiceListings(filterParams));
        
        // The fulfilled action.payload will have our listings directly
        const retrievedListings = fetchServiceListings.fulfilled.match(result) 
          ? result.payload 
          : [];
        
        const hasListings = retrievedListings && retrievedListings.length > 0;
        
        console.log('[BrowseServicesTab] After API fetch, hasListings:', hasListings, 
          'count:', retrievedListings?.length || 0);
        
        // Log current Redux state for debugging
        // Use process.env instead of import.meta which is not supported in Hermes
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const currentStore = isDevelopment
          ? Object.keys(services) 
          : 'Production mode';
        
        console.log('[BrowseServicesTab] Current services data:', {
          servicesLength: services?.length || 0,
          servicesData: Array.isArray(services) ? services.slice(0, 3) : 'Not an array',
          currentStore,
          isDevelopment
        });
        
        // If no data after API call, we'll use mock data for debugging
        // IMPORTANT: This is only for debugging and will be removed in production
        if (!hasListings) {
          console.log('[BrowseServicesTab] No listings from API, loading mock data');
          
          // Dispatch action to load mock data into Redux
          await dispatch(loadMockServiceListings());
          
          // Log that we're using mock data
          console.log('[BrowseServicesTab] Mock data loaded for UI testing');
          
          // Force an alert message to indicate we're using mock data
          setTimeout(() => {
            alert('No data found in the Supabase database. Using mock service listings for UI testing purposes. Make sure your Redux store and Supabase configurations are correct.');
          }, 500);
        }
      } catch (dispatchError) {
        console.error('[BrowseServicesTab] Error dispatching action:', dispatchError);
      }
    } catch (error) {
      console.error('[BrowseServicesTab] Error fetching services:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const handleServicePress = (service: any) => {
    setSelectedService(service);
    setModalVisible(true);
  };
  
  // Handle search submission
  const handleSearchSubmit = () => {
    // In a real app, you would call the API with the search query
    console.log('Searching for:', searchQuery);
    if (searchQuery.trim()) {
      // For now, we'll just show an alert since search is not fully implemented
      alert(`Search for "${searchQuery}" would be sent to the API in a real app.`);
    }
  };
  
  // Handle filter application
  const handleApplyFilters = (filters: {
    serviceType?: string;
    priceRange?: [number, number];
    rating?: number;
    distance?: number;
  }) => {
    console.log('Applying filters:', filters);
    setActiveFilters(filters);
    
    // Update Redux filter if service type is selected
    if (filters.serviceType !== activeFilters.serviceType) {
      setSelectedFilter(filters.serviceType || null);
    }
    
    // In a real app, you would call the API with all the filters
    // For now, we're just handling the service type filter through Redux
  };

  const renderServiceCard = ({ item, index }: { item: any, index: number }) => {
    return (
      <ServiceCard 
        service={item}
        index={index}
        onPress={() => handleServicePress(item)}
      />
    );
  };

  const renderFilterChips = () => {
    // Create "All Services" option plus service types from backend
    const filterOptions = [
      { id: null, name: 'All Services', icon: 'apps' },
      ...serviceTypes.map(type => ({
        id: type.id,
        name: type.name,
        icon: type.icon
      }))
    ];
    
    return (
      <View style={styles.filtersContainer}>
        {/* Filter section header to establish context */}
        <View style={styles.filterHeaderContainer}>
          <Text style={styles.filterHeaderText}>Filter Services</Text>
          <View style={styles.filterHeaderActions}>
            {selectedFilter && (
              <TouchableOpacity 
                style={styles.clearFilterButton}
                onPress={() => setSelectedFilter(null)}
              >
                <Text style={styles.clearFilterText}>Clear</Text>
                <MaterialCommunityIcons name="close" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            
            {/* Add "View Providers" button */}
            <TouchableOpacity 
              style={styles.viewProvidersButton}
              onPress={() => {
                const selectedType = selectedFilter
                  ? serviceTypes.find(type => type.id === selectedFilter)
                  : undefined;
                
                navigation.navigate('ProvidersList', {
                  serviceType: selectedType,
                  title: selectedType ? `${selectedType.name} Providers` : 'All Providers',
                  filterBy: { distance: true, availability: true, rating: true }
                });
              }}
            >
              <MaterialCommunityIcons name="account-group" size={16} color={theme.colors.primary} />
              <Text style={styles.viewProvidersText}>View Providers</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.id && styles.filterChipSelected
              ]}
              onPress={() => setSelectedFilter(item.id)}
              accessible={true}
              accessibilityLabel={`Filter by ${item.name}`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedFilter === item.id }}
            >
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={18}
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
              
              {/* Show clear indicator for selected filter */}
              {selectedFilter === item.id && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color="#FFFFFF"
                  style={styles.selectedFilterIcon}
                />
              )}
            </TouchableOpacity>
          )}
          keyExtractor={item => String(item.id || 'all')}
          contentContainerStyle={styles.filtersContent}
        />
        
        {/* Divider to visually connect filters to content */}
        <View style={styles.filterDivider} />
      </View>
    );
  };

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
          colors={['rgba(108, 99, 255, 0.1)', 'rgba(108, 99, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Browse Pet Services</Text>
          <Text style={styles.headerSubtitle}>Find the perfect service for your pet</Text>
          
          <View style={styles.searchButtonContainer}>
            <TouchableOpacity style={styles.searchButton}>
              <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.searchButtonText}>Search services...</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  // Error state
  if (error && !refreshing && !loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderFilterChips()}
        <EmptyState
          icon="alert-circle"
          title="Something went wrong"
          description={`We couldn't load the services. ${error}`}
          buttonTitle="Try Again"
          onButtonPress={onRefresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {/* Service Filter Bar */}
      <ServiceFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onFilterPress={() => setFilterModalVisible(true)}
        activeFilters={activeFilters}
      />
      
      {renderFilterChips()}
      
      {/* Main Content Container - wraps everything for consistent layout */}
      <View style={styles.mainContentContainer}>
        {(() => {
          // Add extra debug information to troubleshoot rendering issues
          console.log('[BrowseServicesTab] Rendering content section:', {
            loading,
            refreshing,
            servicesExist: !!services,
            servicesIsArray: Array.isArray(services),
            servicesLength: services?.length || 0,
            servicesData: services
          });
          
          // Loading state
          if (loading && !refreshing) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading services...</Text>
              </View>
            );
          }
          
          // No services state (empty state)
          // Check explicitly that services exists, is an array, and has length of 0
          if (!services || !Array.isArray(services) || services.length === 0) {
            return (
              <View style={styles.emptyStateContainer}>
                {/* Contextual information about current filter */}
                {activeFilter && (
                  <View style={styles.contextBanner}>
                    <Text style={styles.contextText}>
                      <MaterialCommunityIcons 
                        name="filter-variant" 
                        size={16} 
                        color={theme.colors.primary} 
                        style={{marginRight: 6}} 
                      />
                      Filtered by: {serviceTypes.find(type => type.id === activeFilter)?.name || 'Custom Filter'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.clearFilterPill}
                      onPress={() => setSelectedFilter(null)}
                      accessible={true}
                      accessibilityLabel="Clear filter"
                      accessibilityRole="button"
                    >
                      <Text style={styles.clearFilterPillText}>Clear</Text>
                      <MaterialCommunityIcons name="close" size={12} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                
                <EmptyState
                  icon={activeFilter ? "filter-remove" : "magnify"}
                  title={activeFilter 
                    ? "No matching services" 
                    : "No services available"}
                  description={activeFilter 
                    ? `We couldn't find any services matching your selected filter` 
                    : "There are no available services in your area at this time"}
                  buttonTitle={activeFilter ? "View All Services" : "Refresh"}
                  onButtonPress={activeFilter ? () => setSelectedFilter(null) : onRefresh}
                  style={styles.emptyStateStyle}
                />
                
                {/* Additional guidance for the user */}
                <View style={styles.emptyStateFooter}>
                  <MaterialCommunityIcons
                    name={activeFilter ? "information" : "clock-time-four-outline"}
                    size={18}
                    color={theme.colors.textSecondary}
                    style={{marginRight: 8}}
                  />
                  <Text style={styles.emptyStateFooterText}>
                    {activeFilter 
                      ? `Try selecting a different service type or remove the filter to see all available services` 
                      : "Check back later for new service listings from providers in your area"}
                  </Text>
                </View>
              </View>
            );
          }
          
          // Has services state
          console.log('[BrowseServicesTab] Rendering services list with count:', services.length);
          
          // For debugging, log the first service
          if (services.length > 0) {
            console.log('[BrowseServicesTab] First service:', {
              id: services[0].id,
              title: services[0].title,
              provider: services[0].provider?.full_name,
              type: services[0].service_type?.name
            });
          }
          
          return (
            <AnimatedFlatList
              data={services}
              renderItem={renderServiceCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true, listener: onScroll }
              )}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                  progressBackgroundColor="rgba(255, 255, 255, 0.8)"
                />
              }
            />
          );
        })()}
      </View>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedService(null);
        }}
        serviceId={selectedService?.id}
      />
      
      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        serviceTypes={serviceTypes}
        initialFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  mainContentContainer: {
    flex: 1, 
    position: 'relative',
    zIndex: 1, // Ensure content is below filters but still accessible
  },
  headerContainer: {
    height: 140,
    marginBottom: 10,
    overflow: 'hidden',
    zIndex: 10,
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
  searchButtonContainer: {
    marginTop: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchButtonText: {
    color: theme.colors.textSecondary,
    marginLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  filtersContainer: {
    marginBottom: 8,
    zIndex: 5,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108,99,255,0.1)',
    paddingBottom: 8,
    ...theme.elevation.small,
  },
  filterHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  filterHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filterHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.pill,
    marginRight: 8,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  viewProvidersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  viewProvidersText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  selectedFilterIcon: {
    marginLeft: 6,
  },
  filterChipText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  filterDivider: {
    height: 2,
    backgroundColor: 'rgba(108,99,255,0.05)',
    marginHorizontal: 16,
    marginTop: 4,
  },
  // New improved empty state styles
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 80,
    justifyContent: 'center',
  },
  emptyStateStyle: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.15)',
    ...theme.elevation.medium,
  },
  contextBanner: {
    backgroundColor: 'rgba(108,99,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.1)',
  },
  contextText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  clearFilterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 4,
  },
  emptyStateFooter: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyStateFooterText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

export default BrowseServicesTab;