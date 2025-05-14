import React, { useCallback, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  RefreshControl, 
  ScrollView,
  Animated, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FAB } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '../../supabaseClient'; // Import supabase client

// Components
import CreditBalanceCard from './CreditBalanceCard';
import UpcomingServicesSection from './UpcomingServicesSection';
import NearbyProvidersSection from './NearbyProvidersSection';
import QuickActionsSection from './QuickActionsSection';
import OfferServiceModal from './OfferServiceModal';
import TestModal from './TestModal'; // Import the test modal
import { ServiceFormModal } from '../../components';

// Services & Redux
import { getCurrentLocation } from '../../services/locationService';
import { subscribeToServiceRequests, unsubscribe } from '../../services/realtimeService';
import { 
  fetchDashboardData, 
  fetchServiceTypes, 
  setLocation 
} from '../../redux/slices/homeSlice';
import { RootState } from '../../store'; // Make sure we're using the correct RootState
import { LocationCoords, DEFAULT_LOCATION } from '../../services/locationService';
import { theme, globalStyles } from '../../theme';

// Define a fallback location to use if Redux state is undefined
const FALLBACK_LOCATION: LocationCoords = DEFAULT_LOCATION;

// Define ServiceType interface
interface ServiceType {
  id: string;
  name: string;
}

type DashboardData = {
  userCredits: number;
  upcomingServices: {
    asProvider: any[];
    asRequester: any[];
  };
  nearbyProviders: any[];
  error?: string;
};

const HomeScreen: React.FC = () => {
  // Animation values
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.3, 1],
    extrapolate: 'clamp',
  });

  // Modal state
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  
  // State for fetched service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(true);
  const [serviceTypesError, setServiceTypesError] = useState<string | null>(null);

  // User pets (would come from a real API in production)
  const userPets = [];

  // Fetch service types on mount
  useEffect(() => {
    const fetchServiceTypes = async () => {
      console.log('[HomeScreen] Starting to fetch service types');
      setServiceTypesLoading(true);
      setServiceTypesError(null);
      try {
        console.log('[HomeScreen] Making request to service_types table');
        
        // First try with the main supabase client
        console.log('[HomeScreen] Trying with main supabase client');
        const response = await supabase
          .from('service_types')
          .select('id, name');
        
        let { data, error, status, statusText } = response;
        
        // If there's an error, just log it - no fallback client needed
        if (error) {
          console.error('[HomeScreen] Error with supabase client:', error);
          // We'll handle the error in the catch block
          throw error;
        }

        console.log('[HomeScreen] Service types response:', { data, error, status, statusText });
        
        if (!data || data.length === 0) {
          console.warn('[HomeScreen] No service types returned from database');
        } else {
          console.log('[HomeScreen] Service types fetched successfully:', data);
        }
        
        // Ensure data is treated as ServiceType[]
        setServiceTypes((data as ServiceType[]) || []);
      } catch (err: any) {
        console.error("[HomeScreen] Failed to fetch service types:", err);
        setServiceTypesError(err.message || 'Could not load service types.');
      } finally {
        setServiceTypesLoading(false);
      }
    };

    fetchServiceTypes();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handler for offering a service - Updated signature
  const handleOfferService = async (service: { service_type_id: string; description: string; cost: string; availability: string }) => {
    try {
      console.log('[HomeScreen] handleOfferService called with:', service);

      // Find the service type name based on the ID for the title
      const selectedServiceType = serviceTypes.find(st => st.id === service.service_type_id);
      const title = selectedServiceType ? selectedServiceType.name : 'Unknown Service'; // Fallback title

      // Make sure we have a valid location
      if (!location || (!location.lng && !location.latitude)) {
        console.error('[OfferService] Missing valid location data');
        throw new Error('Location data is required for offering a service');
      }
      
      // Use lng/lat or latitude/longitude based on what's available
      const lng = location.lng || location.longitude;
      const lat = location.lat || location.latitude;
      
      const serviceListingData = {
        provider_id: user?.id,
        service_type_id: service.service_type_id, // Use the ID directly from the argument
        title: title, // Use the looked-up name for the title
        description: service.description,
        location: `POINT(${lng} ${lat})`, // Format for PostGIS geography
        availability_schedule: { notes: service.availability }, // Simple JSON structure
        is_active: true, // Correct column name and type
      };

      console.log('[OfferService] Attempting to insert:', serviceListingData);

      // Insert into Supabase service_listings table
      const { data, error } = await supabase
        .from('service_listings')
        .insert([serviceListingData]);

      if (error) {
        console.error('[OfferService] Supabase insert error:', error);
        throw error;
      }

      console.log('[OfferService] Successfully inserted:', data);
      
      // Manually refresh data instead of using refetch (which doesn't exist)
      if (user?.id && location) {
        console.log('[OfferService] Refreshing dashboard data after successful submission');
        dispatch(fetchDashboardData({ 
          userId: user.id, 
          location: location as LocationCoords 
        }));
      }
    } catch (err: any) {
      console.error('[OfferService] Failed to offer service:', err);
      
      // Show error feedback via a local alert or toast notification
      alert(`Failed to offer service: ${err.message || 'Unknown error'}`);
      
      // You may also want to update Redux state to show an error banner
      // dispatch(setError('Failed to offer service'));
    }
  };

  // Handler for requesting a service
  const handleRequestService = async (formData: any) => {
    // Transform the form data to match the expected structure
    const request = {
      service_type_id: formData.service_type_id,
      description: formData.description,
      date: formData.date,
      pet_id: formData.pet_id // Get pet_id from form data
    };
    try {
      console.log('[HomeScreen] handleRequestService called with:', request);
      
      // Use Supabase API call with correct field names according to schema
      console.log('[RequestService] Preparing data with correct field names');
      
      // Helper function to ensure valid UUIDs only
      const validateUuid = (id: string | undefined) => {
        if (!id || id.trim() === '') return null;
        return id;
      };
      
      // Check if pet_id is provided
      if (!request.pet_id) {
        console.warn('[RequestService] No pet_id provided for service request');
      }
      
      // Create the request data with proper validation
      const insertData = {
        service_type_id: request.service_type_id,
        notes: request.description, // Use 'notes' instead of 'description'
        start_time: request.date, // Use 'start_time' instead of 'preferred_time'
        end_time: (() => {
          // Calculate end time as 1 hour after start time
          const endDate = new Date(request.date);
          endDate.setHours(endDate.getHours() + 1);
          return endDate.toISOString();
        })(),
        pet_id: validateUuid(request.pet_id), // Validate pet_id to prevent empty UUIDs
        requester_id: user?.id,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      console.log('[RequestService] Data to insert:', { ...insertData, requester_id: 'hidden for privacy' });
      
      const { data, error } = await supabase.from('service_requests').insert([insertData]);
      
      if (error) {
        console.error('[RequestService] Supabase insert error:', error);
        throw error;
      }
      
      console.log('[RequestService] Successfully submitted:', data);
      
      // Manually refresh data instead of using refetch (which doesn't exist)
      if (user?.id && location) {
        console.log('[RequestService] Refreshing dashboard data after successful submission');
        dispatch(fetchDashboardData({ 
          userId: user.id, 
          location: location as LocationCoords 
        }));
      }
    } catch (err: any) {
      console.error('[RequestService] Failed to request service:', err);
      
      // Show error feedback via a local alert or toast notification
      alert(`Failed to submit service request: ${err.message || 'Unknown error'}`);
      
      // You may also want to update Redux state to show an error banner
      // dispatch(setError('Failed to submit service request'));
    }
  };

  // Get user, location, and dashboard data from Redux
  const dispatch = useDispatch();
  console.log('[HomeScreen] Before selectors');
  
  // Add try-catch blocks around each selector to identify which one might be failing
  let user, location, userCredits, upcomingServices, nearbyProviders, isLoading, error;
  
  try {
    console.log('[HomeScreen] Getting auth.user');
    user = useSelector((state: RootState) => {
      console.log('[HomeScreen] auth state:', state.auth);
      return state.auth.user;
    });
    console.log('[HomeScreen] Got user:', user?.id);
  } catch (err) {
    console.error('[HomeScreen] Error getting user:', err);
  }
  
  try {
    console.log('[HomeScreen] Getting home.location');
    location = useSelector((state: RootState) => {
      console.log('[HomeScreen] state:', state);
      console.log('[HomeScreen] home state exists:', !!state.home);
      
      // If home slice exists in state, use its location or fallback
      if (state.home) {
        return state.home.location || FALLBACK_LOCATION;
      }
      
      // If home slice doesn't exist at all, use fallback location
      console.warn('[HomeScreen] home slice missing in Redux state, using fallback location');
      return FALLBACK_LOCATION;
    });
    console.log('[HomeScreen] Got location:', location ? JSON.stringify(location) : 'undefined');
  } catch (err) {
    console.error('[HomeScreen] Error getting location:', err);
    // Use fallback location if selector fails
    location = FALLBACK_LOCATION;
  }
  
  // Create fallback values for all Redux state properties
  const DEFAULT_UPCOMING_SERVICES = { asProvider: [], asRequester: [] };
  const DEFAULT_NEARBY_PROVIDERS = [];
  
  try {
    console.log('[HomeScreen] Getting home.userCredits');
    userCredits = useSelector((state: RootState) => {
      return state.home?.userCredits || 0;
    });
    console.log('[HomeScreen] Got userCredits:', userCredits);
  } catch (err) {
    console.error('[HomeScreen] Error getting userCredits:', err);
    userCredits = 0;
  }
  
  try {
    console.log('[HomeScreen] Getting home.upcomingServices');
    upcomingServices = useSelector((state: RootState) => {
      return state.home?.upcomingServices || DEFAULT_UPCOMING_SERVICES;
    });
    console.log('[HomeScreen] Got upcomingServices:', 
      `Provider: ${upcomingServices.asProvider?.length || 0}, ` +
      `Requester: ${upcomingServices.asRequester?.length || 0}`);
  } catch (err) {
    console.error('[HomeScreen] Error getting upcomingServices:', err);
    upcomingServices = DEFAULT_UPCOMING_SERVICES;
  }
  
  try {
    console.log('[HomeScreen] Getting home.nearbyProviders');
    nearbyProviders = useSelector((state: RootState) => {
      return state.home?.nearbyProviders || DEFAULT_NEARBY_PROVIDERS;
    });
    console.log('[HomeScreen] Got nearbyProviders:', nearbyProviders?.length || 0);
  } catch (err) {
    console.error('[HomeScreen] Error getting nearbyProviders:', err);
    nearbyProviders = DEFAULT_NEARBY_PROVIDERS;
  }
  
  try {
    console.log('[HomeScreen] Getting home.loading');
    isLoading = useSelector((state: RootState) => {
      return state.home?.loading || false;
    });
    console.log('[HomeScreen] Got isLoading:', isLoading);
  } catch (err) {
    console.error('[HomeScreen] Error getting isLoading:', err);
    isLoading = false;
  }
  
  try {
    console.log('[HomeScreen] Getting home.error');
    error = useSelector((state: RootState) => {
      return state.home?.error || null;
    });
    console.log('[HomeScreen] Got error:', error);
  } catch (err) {
    console.error('[HomeScreen] Error getting error state:', err);
    error = null;
  }
  
  // Integrate with location service for real coordinates
  useEffect(() => {
    const initLocation = async () => {
      try {
        console.log('[HomeScreen] Initializing location service');
        const coords = await getCurrentLocation();
        
        if (coords && (coords.latitude || coords.lat) && (coords.longitude || coords.lng)) {
          console.log('[HomeScreen] Successfully got location:', {
            lat: coords.latitude || coords.lat,
            lng: coords.longitude || coords.lng
          });
          dispatch(setLocation(coords));
        } else {
          console.warn('[HomeScreen] Location service returned invalid coordinates:', coords);
          // Fall back to a default location (optional)
          // dispatch(setLocation(DEFAULT_LOCATION));
        }
      } catch (err) {
        console.error('[HomeScreen] Error getting location:', err);
        // Optionally fall back to a default location on error
        // dispatch(setLocation(DEFAULT_LOCATION));
      }
    };
    
    initLocation();
    
    // Set up a timer to periodically refresh location if needed
    const locationRefreshInterval = setInterval(() => {
      if (user?.id) {
        initLocation();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => {
      clearInterval(locationRefreshInterval);
    };
  }, [dispatch, user?.id]);
  
  // Fetch dashboard data when component mounts or user/location changes
  useEffect(() => {
    if (user?.id && location) {
      // Log location data for debugging
      console.log('[HomeScreen] Fetching dashboard with location:', {
        lat: location.latitude || location.lat,
        lng: location.longitude || location.lng,
        hasLocation: !!location
      });
      
      // Only fetch if we have valid location coordinates
      if ((location.latitude || location.lat) && (location.longitude || location.lng)) {
        dispatch(fetchDashboardData({ 
          userId: user.id, 
          location: location as LocationCoords 
        }));
        
        // Also fetch service types for dropdowns
        dispatch(fetchServiceTypes());
      } else {
        console.warn('[HomeScreen] Invalid location data, not fetching dashboard');
      }
    }
  }, [dispatch, user?.id, location?.latitude, location?.longitude, location?.lat, location?.lng]);
  
  // Set up real-time subscription for service updates
  useEffect(() => {
    if (!user?.id) return;
    
    // Subscribe to service requests (as provider or requester)
    const channel = subscribeToServiceRequests(user.id, (payload) => {
      console.log('[HomeScreen] Service request update:', payload);
      
      // Refresh dashboard data on changes if location is defined
      if (location) {
        dispatch(fetchDashboardData({ 
          userId: user.id, 
          location: location as LocationCoords 
        }));
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe(channel);
    };
  }, [dispatch, user?.id, location]);

  // Define onRefresh callback *before* the early return
  const onRefresh = useCallback(() => {
    console.log('[HomeScreen] Pull-to-refresh triggered');
    if (user?.id && location) {
      dispatch(fetchDashboardData({ 
        userId: user.id, 
        location: location as LocationCoords 
      }));
    } else {
      console.log('[HomeScreen] Cannot refresh: missing user or location', { userId: user?.id, hasLocation: !!location });
    }
  }, [dispatch, user?.id, location]);

  // Guard: if no user, show prompt and skip dashboard
  if (!user?.id) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f8f9ff', '#eef1ff']}
          style={styles.container}
        >
          <BlurView intensity={30} style={styles.loginPromptContainer} tint="light">
            <MaterialCommunityIcons name="account-lock" size={60} color={theme.colors.primary} style={styles.loginIcon} />
            <Text style={styles.loginPromptTitle}>Welcome to PetCo</Text>
            <Text style={styles.loginPromptText}>Please log in to see your dashboard</Text>
          </BlurView>
        </LinearGradient>
      </View>
    );
  }

  // Enhanced debug logging - this will help troubleshoot location issues
  console.log('[HomeScreen] Debug state:', { 
    userId: user?.id, 
    hasLocation: !!location,
    locationData: location ? {
      lat: location.latitude || location.lat,
      lng: location.longitude || location.lng
    } : null
  });

  // Use actual data from Redux
  const effectiveDashboardData: DashboardData = {
    userCredits,
    upcomingServices,
    nearbyProviders,
    error: error ?? '',
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent
      />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#f8f9ff', '#eef1ff']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Fixed Header - appears on scroll */}
      <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={80} style={styles.blurHeader} tint="light">
          <Text style={styles.headerTitle}>Home</Text>
        </BlurView>
      </Animated.View>
      
      {/* Service Type Debug Views */}
      {serviceTypesError && (
        <View style={styles.debugError}>
          <Text style={styles.debugErrorText}>Service Types Error: {serviceTypesError}</Text>
        </View>
      )}
      
      {serviceTypesLoading && (
        <View style={styles.debugLoading}>
          <Text style={styles.debugLoadingText}>Loading service types...</Text>
        </View>
      )}

      {/* Modals */}
      {/* Service Modals */}
      <OfferServiceModal
        visible={offerModalVisible}
        onClose={() => setOfferModalVisible(false)}
        onSubmit={handleOfferService}
        serviceTypes={serviceTypes}
      />
      
      <ServiceFormModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSubmit={handleRequestService}
        serviceTypes={serviceTypes}
        mode="request"
        showTitle={true}
        showDate={true}
        showPetSelection={true}
      />
      
      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Dashboard Error Message */}
        {effectiveDashboardData.error && (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={styles.errorText}>
              Error loading dashboard: {effectiveDashboardData.error}
            </Text>
          </View>
        )}
        
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.greeting}>Hello, {user.full_name || 'Pet Lover'}! 👋</Text>
          <Text style={styles.tagline}>Your pet services dashboard</Text>
        </View>
        
        {/* Credit Balance Card */}
        <CreditBalanceCard 
          balance={effectiveDashboardData.userCredits && effectiveDashboardData.userCredits > 0 
            ? effectiveDashboardData.userCredits 
            : 10
          } 
          onPress={() => {}} 
        />
        
        {/* Upcoming Services Section */}
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <UpcomingServicesSection 
            services={effectiveDashboardData.upcomingServices}
            onServicePress={() => {}}
          />
        )}
        
        {/* Quick Actions Section */}
        <QuickActionsSection
          onCreateRequestPress={() => setRequestModalVisible(true)}
          onOfferServicePress={() => setOfferModalVisible(true)}
        />
        
        {/* Nearby Providers Section */}
        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading providers...</Text>
          </View>
        ) : (
          <NearbyProvidersSection
            providers={effectiveDashboardData.nearbyProviders}
            onProviderPress={() => {}}
          />
        )}
        
        {/* Bottom padding for FAB */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Create New FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={() => setRequestModalVisible(true)}
      />
    </View>
  );
};

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
  },
  blurHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(230,230,255,0.3)',
  },
  headerTitle: {
    ...theme.typography.h2,
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  greeting: {
    ...theme.typography.h1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  errorCard: {
    backgroundColor: 'rgba(253,236,234,0.9)',
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  loadingCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: theme.colors.primary,
    ...theme.elevation.large,
  },
  debugError: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(255,0,0,0.1)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugErrorText: {
    color: 'red',
    fontSize: 10,
  },
  debugLoading: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'rgba(0,0,255,0.1)',
    padding: 5,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugLoadingText: {
    color: 'blue',
    fontSize: 10,
  },
  loginPromptContainer: {
    margin: 40,
    flex: 1,
    borderRadius: theme.borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  loginIcon: {
    marginBottom: 20,
    opacity: 0.85,
  },
  loginPromptTitle: {
    ...theme.typography.h2,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;