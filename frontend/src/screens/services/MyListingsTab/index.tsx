import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ActiveListingsSection from './ActiveListingsSection';
import EmptyListingsState from './EmptyListingsState';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchServiceListings, 
  fetchAllServiceTypes,
  selectServiceListings,
  selectServiceTypes,
  selectServiceListingsLoading,
  selectServiceListingsError,
  addServiceListing
} from '../../../redux/slices/serviceSlice';
import { servicesService } from '../../../services/servicesService';
import { AppDispatch, RootState } from '../../../store';
import { ServiceListing, ServiceType } from '../../../types/services';
import { EmptyState } from '../../../components/ui';
import { ServiceFormModal, ServiceListingForm } from '../../../components';

interface MyListingsTabProps {
  onScroll?: (event: any) => void;
}

export default function MyListingsTab({ onScroll }: MyListingsTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Use proper typed selectors
  const userListings = useSelector(selectServiceListings);
  const loading = useSelector(selectServiceListingsLoading);
  const error = useSelector(selectServiceListingsError);
  const serviceTypes = useSelector(selectServiceTypes);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceFormVisible, setServiceFormVisible] = useState(false);
  const [enhancedFormVisible, setEnhancedFormVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);

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
  
  // Load user listings and service types
  useEffect(() => {
    if (user?.id) {
      fetchUserListings();
      // Fetch service types if not already loaded
      if (!serviceTypes || serviceTypes.length === 0) {
        dispatch(fetchAllServiceTypes());
      }
    }
  }, [user?.id]);

  // Function to fetch listings for the current user
  const fetchUserListings = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.warn('Cannot fetch listings - user not authenticated');
        setIsLoading(false);
        return;
      }

      // Dispatch action to fetch listings for current user
      await dispatch(fetchServiceListings({ provider_id: user.id }));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setIsLoading(false);
    }
  };

  // Function to refresh listings
  const refreshListings = async () => {
    setRefreshing(true);
    try {
      console.log('[MyListingsTab] Refreshing listings');
      if (!user?.id) {
        console.warn('[MyListingsTab] Cannot refresh - no user ID');
        return;
      }

      // Force fresh fetch from API
      await dispatch(fetchServiceListings({ provider_id: user.id }));
      console.log('[MyListingsTab] Listings refreshed');
    } catch (error) {
      console.error('[MyListingsTab] Error refreshing listings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to open the service form modal for creating a new listing
  const handleCreateListing = () => {
    setSelectedListing(null); // No initial values for a new listing
    
    // Use the enhanced form for better UX
    setEnhancedFormVisible(true);
  };

  // Function to open the service form modal for editing an existing listing
  const handleEditListing = (listing: ServiceListing) => {
    console.log('[MyListingsTab] Edit listing requested for:', listing);
    console.log('[MyListingsTab] Listing ID:', listing.id);

    // Extract scheduled date from availability_schedule if available
    let scheduledDate = new Date().toISOString();
    if (listing.availability_schedule?.scheduled_date) {
      scheduledDate = listing.availability_schedule.scheduled_date;
    }

    // Store the listing in component state to avoid dependency on Redux store
    setSelectedListing({
      ...listing,
      // Ensure we have the fields needed for the form
      title: listing.title || '',
      description: listing.description || '',
      service_type_id: listing.service_type_id || serviceTypes[0]?.id || '',
      // Store scheduled date in both places for compatibility
      scheduled_date: scheduledDate
    });

    // Show the enhanced form for better UX
    setEnhancedFormVisible(true);

    // Refresh listings in the background to get latest data
    refreshListings().catch(error => {
      console.error('[MyListingsTab] Error refreshing listings during edit:', error);
    });
  };

  // Function to handle service form submission
  const handleServiceFormSubmit = async (formData: any) => {
    try {
      if (!user?.id) {
        console.warn('Cannot create/update listing - user not authenticated');
        return;
      }

      // Log the received form data
      console.log('[MyListingsTab] Service form submitted with data:', formData);

      // Set up availability data based on the date if provided
      let availabilitySchedule = {
        days: [],
        hours: '',
        notes: ''
      };

      // If date was provided, use it for availability information
      if (formData.date) {
        const date = new Date(formData.date);
        // Get day of week from date
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[date.getDay()];

        // Format date for availability notes
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        availabilitySchedule = {
          days: [dayOfWeek],
          hours: `${date.getHours()}:00 - ${date.getHours() + 2}:00`, // Default 2-hour window
          notes: `Available on ${formattedDate}`
        };
      }

      // Transform the form data to match ServiceListing structure
      const serviceData: Omit<ServiceListing, 'id' | 'created_at'> = {
        title: formData.title,
        service_type_id: formData.service_type_id,
        description: formData.description,
        provider_id: user.id,
        is_active: true,
        // Don't include start_time as it doesn't exist in the database
        // Use the enhanced availability schedule that contains the date info
        availability_schedule: formData.availability_schedule || availabilitySchedule
      };
      
      if (selectedListing) {
        // Update existing listing
        console.log('[MyListingsTab] Updating listing with ID:', selectedListing.id);

        // Add debugging to see what fields are coming from the form
        const { start_time, ...clearedServiceData } = serviceData as any;

        console.log('[MyListingsTab] Cleaned service data (removed start_time):', clearedServiceData);

        const result = await servicesService.updateListing(selectedListing.id, clearedServiceData);

        if (result.error) {
          console.error('Error updating listing:', result.error);
        } else {
          console.log('Listing updated successfully');
          // Refresh listings to show the updated one
          refreshListings();
        }
      } else {
        // Create new listing
        const result = await servicesService.createListing(serviceData);
        
        if (result.error) {
          console.error('Error creating listing:', result.error);
        } else {
          console.log('Listing created successfully');
          // Refresh listings to show the new one
          refreshListings();
        }
      }
    } catch (error) {
      console.error('Error handling listing:', error);
    }
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
          colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>My Listings</Text>
          <Text style={styles.headerSubtitle}>Manage your service offerings</Text>
          
          <View style={styles.actionRow}>
            <Text style={styles.statsText}>
              {isLoading ? 'Loading...' : `${userListings.length || 0} Active Listing${userListings.length !== 1 ? 's' : ''}`}
            </Text>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleCreateListing}
              disabled={isLoading || refreshing}
            >
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

  // Error state
  if (error && !refreshing && !isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <EmptyState
          icon="alert-circle"
          title="Something went wrong"
          description={`We couldn't load your listings. ${error}`}
          buttonTitle="Try Again"
          onButtonPress={refreshListings}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Header Section */}
      {renderHeader()}
      
      {/* Legacy Service Form Modal - Kept for backward compatibility */}
      <ServiceFormModal
        visible={serviceFormVisible}
        onClose={() => setServiceFormVisible(false)}
        onSubmit={handleServiceFormSubmit}
        serviceTypes={serviceTypes || []}
        initialValues={selectedListing ? {
          title: selectedListing.title,
          service_type_id: selectedListing.service_type_id,
          description: selectedListing.description,
          date: selectedListing.scheduled_date || (selectedListing.availability_schedule?.scheduled_date) || new Date().toISOString() // Include date for consistency
        } : {
          // Default values for new listing
          title: '',
          service_type_id: serviceTypes?.[0]?.id || '',
          description: '',
          date: new Date().toISOString()
        }}
        mode={selectedListing ? 'edit' : 'create'}
        showTitle={true}
        showDate={true} // Changed to true for consistency with HomeScreen
      />
      
      {/* Enhanced Service Listing Form */}
      <ServiceListingForm
        visible={enhancedFormVisible}
        onClose={() => setEnhancedFormVisible(false)}
        onSubmit={handleServiceFormSubmit}
        serviceTypes={serviceTypes || []}
        initialValues={selectedListing ? {
          title: selectedListing.title,
          service_type_id: selectedListing.service_type_id,
          description: selectedListing.description,
          availability_schedule: selectedListing.availability_schedule,
          price: selectedListing.price || selectedListing.service_type?.credit_value,
          photos: selectedListing.photos || [] // Add photo support in future implementation
        } : undefined}
        mode={selectedListing ? 'edit' : 'create'}
      />
      
      {/* Content Section */}
      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="large"
              color={theme.colors.primary}
            />
            <Text style={styles.loadingText}>Loading your listings...</Text>
          </View>
        ) : (
          userListings.length > 0 ? 
            <ActiveListingsSection 
              listings={userListings}
              refreshing={refreshing}
              onRefresh={refreshListings}
              onEditListing={handleEditListing}
              onScroll={(e) => {
                // Split the event handling into separate functions
                handleLocalScroll(e);
                handleParentScroll(e);
              }} 
            /> : 
            <View style={styles.emptyStateWrapper}>
              <EmptyListingsState onCreateListing={handleCreateListing} />
            </View>
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
  emptyStateWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});