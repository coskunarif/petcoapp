import React, { useCallback, useState, useEffect } from 'react'; // Import useState, useEffect
import supabase from '../../supabaseClient';
import { SafeAreaView, ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import CreditBalanceCard from './CreditBalanceCard';
import UpcomingServicesSection from './UpcomingServicesSection';
import NearbyProvidersSection from './NearbyProvidersSection';
import QuickActionsSection from './QuickActionsSection';
import OfferServiceModal from './OfferServiceModal';
import RequestServiceModal from './RequestServiceModal';
import { FAB } from 'react-native-paper';
import { useHomeDashboardData, useServiceRequestsSubscription } from './hooks';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHomeDashboard } from './homeSlice';
import { Text } from 'react-native';
// Remove incorrect import
// import { ServiceType } from './OfferServiceModal';

// Define ServiceType interface locally
interface ServiceType {
  id: string;
  name: string;
}

// Use real user from Redux
const useUser = () => useSelector((state: any) => state.auth.user);
// You may want to use a real location hook here
const useLocation = () => ({ lat: 37.7749, lng: -122.4194 }); // Replace with real location if available

const mockMode = false; // Toggle this to false to use real data

type DashboardData = {
  userCredits: number;
  upcomingServices: {
    asProvider: any[];
    asRequester: any[];
  };
  nearbyProviders: any[];
  error?: string;
};

const mockDashboardData: DashboardData = {
  userCredits: 120.5,
  upcomingServices: {
    asProvider: [
      {
        id: '1',
        start_time: '2025-04-20T09:00:00',
        end_time: '2025-04-20T11:00:00',
        status: 'pending',
        users: { full_name: 'John Doe', profile_image_url: '' },
        pets: { name: 'Buddy', image_url: '' },
        service_types: { name: 'Dog Walking', icon: '' },
      },
    ],
    asRequester: [],
  },
  nearbyProviders: [
    {
      userId: 'p1',
      name: 'Alice Smith',
      profile_image_url: '',
      distance: 2.3,
      rating: 4.8,
      serviceTypes: ['Dog Walking', 'Pet Sitting'],
      availability: ['Mon', 'Wed', 'Fri'],
    },
  ],
};

function HomeScreen() {
  // Modal state
  const [offerModalVisible, setOfferModalVisible] = React.useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  // State for fetched service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(true);
  const [serviceTypesError, setServiceTypesError] = useState<string | null>(null);

  // TODO: Replace with real user pets if needed
  const userPets = [];

  // Remove the hardcoded serviceTypes array
  // const serviceTypes = [ ... ];

  // Fetch service types on mount
  useEffect(() => {
    const fetchServiceTypes = async () => {
      setServiceTypesLoading(true);
      setServiceTypesError(null);
      try {
        const { data, error } = await supabase
          .from('service_types')
          .select('id, name');

        if (error) {
          throw error;
        }
        // Ensure data is treated as ServiceType[]
        setServiceTypes((data as ServiceType[]) || []);
      } catch (err: any) {
        console.error("Failed to fetch service types:", err);
        setServiceTypesError(err.message || 'Could not load service types.');
      } finally {
        setServiceTypesLoading(false);
      }
    };

    fetchServiceTypes();
  }, []); // Empty dependency array ensures this runs only once on mount


  // Handler for offering a service - Updated signature
  const handleOfferService = async (service: { service_type_id: string; description: string; cost: string; availability: string }) => {
    // --- Start of changes ---

    // Find the service type name based on the ID for the title
    const selectedServiceType = serviceTypes.find(st => st.id === service.service_type_id);
    const title = selectedServiceType ? selectedServiceType.name : 'Unknown Service'; // Fallback title

    // Remove the lookup logic, ID is now provided directly
    // const foundType = serviceTypes.find(st => st.name.toLowerCase() === service.type.toLowerCase());
    // if (!foundType) { ... }

    const serviceListingData = {
      provider_id: user?.id,
      service_type_id: service.service_type_id, // Use the ID directly from the argument
      title: title, // Use the looked-up name for the title
      description: service.description,
      location: `POINT(${location.lng} ${location.lat})`, // Format for PostGIS geography
      availability_schedule: { notes: service.availability }, // Simple JSON structure
      is_active: true, // Correct column name and type
      // created_at is handled by default value in DB
      // cost is omitted as it's not in service_listings
    };

    console.log('[OfferService] Attempting to insert:', serviceListingData); // Log data before insert

    try {
      // Insert into Supabase service_listings table
      const { data, error } = await supabase
        .from('service_listings') // Correct table name
        .insert([serviceListingData]); // Use the structured data

      if (error) {
        console.error('Supabase insert error:', error); // Log the full error object
        throw error; // Re-throw to be caught below
      }

      console.log('[OfferService] Successfully inserted:', data);
      // Optionally: show success feedback or close modal
      refetch(); // Refetch dashboard data after successful insert
    } catch (err: any) {
      // Log the detailed error
      console.error('Failed to offer service:', err);
      // Optionally: show error feedback to the user in the modal
    }
    // --- End of changes ---
  };
    // Optionally refetch dashboard data here

  // Handler for requesting a service
  const handleRequestService = async (request: { type: string; description: string; date: string; pet: string }) => {
    // Replace with Supabase API call
    // await supabase.from('service_requests').insert([{ ...request, requester_id: user.id }]);
    console.log('[RequestService] Submitted:', request);
    // Optionally refetch dashboard data here
  };

  // Use real user from Redux
  const user = useUser();
  const location = useLocation();
  // Only use TanStack Query for dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useHomeDashboardData(user?.id, location.lat, location.lng);

  // Guard: if no user, show prompt and skip dashboard
  if (!user?.id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Empty state card for logged-out users */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#888', fontSize: 18, marginTop: 24 }}>Please log in to see your dashboard.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Debug logging
  console.log('[HomeScreen] user:', user, 'location:', location);

  // Remove all Redux fetchHomeDashboard dispatches and useEffect

  // Remove useServiceRequestsSubscription (unless you want real-time updates, then use refetch)
  // useServiceRequestsSubscription(user?.id, refetch);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Choose data source
  const effectiveDashboardData: DashboardData = mockMode
    ? { ...mockDashboardData, error: mockDashboardData.error ?? '' }
    : {
        userCredits: dashboardData && typeof dashboardData.userCredits === 'number' ? dashboardData.userCredits : 0,
        upcomingServices: dashboardData && dashboardData.upcomingServices ? dashboardData.upcomingServices : { asProvider: [], asRequester: [] },
        nearbyProviders: dashboardData && Array.isArray(dashboardData.nearbyProviders) ? dashboardData.nearbyProviders : [],
        error: dashboardData && typeof dashboardData.error === 'string'
          ? dashboardData.error
          : error
            ? typeof error === 'string'
              ? error
              : (error as any)?.message || ''
            : '',
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfferServiceModal
        visible={offerModalVisible}
        onClose={() => setOfferModalVisible(false)}
        onSubmit={handleOfferService}
        serviceTypes={serviceTypes} // Pass serviceTypes array to the modal
      />
      <RequestServiceModal
        visible={requestModalVisible}
        onClose={() => setRequestModalVisible(false)}
        onSubmit={handleRequestService}
        pets={userPets}
      />
      {effectiveDashboardData.error && (
        <View style={{ backgroundColor: '#ffcdd2', padding: 10, margin: 8, borderRadius: 8 }}>
          <Text style={{ color: '#b71c1c', textAlign: 'center' }}>
            Error loading dashboard: {effectiveDashboardData.error}
          </Text>
        </View>
      )}
      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}>
        <CreditBalanceCard balance={effectiveDashboardData.userCredits && effectiveDashboardData.userCredits > 0 ? effectiveDashboardData.userCredits : 10} onPress={() => {}} />

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Upcoming Services Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Upcoming Services</Text>
          {isLoading ? (
            <View style={styles.skeletonCard}><Text style={styles.skeletonText}>Loading upcoming services...</Text></View>
          ) : (effectiveDashboardData.upcomingServices?.asProvider?.length === 0 && effectiveDashboardData.upcomingServices?.asRequester?.length === 0) ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateText}>No upcoming services.</Text>
              <Text style={styles.emptyStateSubText}>Tap "Request Service" to find help with pet care.</Text>
              <Text style={styles.emptyStateTimestamp}>{new Date().toLocaleString()}</Text>
            </View>
          ) : (
            <UpcomingServicesSection services={effectiveDashboardData.upcomingServices} onServicePress={() => {}} />
          )}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Nearby Providers Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Nearby Providers</Text>
          {isLoading ? (
            <View style={styles.skeletonCard}><Text style={styles.skeletonText}>Loading providers...</Text></View>
          ) : effectiveDashboardData.nearbyProviders?.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🐾</Text>
              <Text style={styles.emptyStateText}>No nearby providers found.</Text>
              <Text style={styles.emptyStateSubText}>Try pulling to refresh or expand your search radius.</Text>
              <Text style={styles.emptyStateTimestamp}>{new Date().toLocaleString()}</Text>
            </View>
          ) : (
            <NearbyProvidersSection providers={effectiveDashboardData.nearbyProviders} onProviderPress={() => {}} />
          )}
        </View>

        {/* Divider */}
        <View style={styles.sectionDivider} />

        {/* Quick Actions Section */}
        <QuickActionsSection
          onCreateRequestPress={() => setRequestModalVisible(true)}
          onOfferServicePress={() => setOfferModalVisible(true)}
        />
      </ScrollView>
      <FAB style={styles.fab} icon="plus" onPress={() => {}} />
    </SafeAreaView>
  );
}
export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    // Glassmorphism gradient overlay
    // Use a gradient background in the parent or wrap with a LinearGradient if available
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    backgroundColor: '#6C63FF', // modern accent
    borderRadius: 32,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    // Add subtle scale animation on press (see FAB usage)
  },
  sectionDivider: {
    height: 24,
    backgroundColor: 'transparent',
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.8)', // glassy white
    borderRadius: 22,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    elevation: 6,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    // Add backdropFilter: blur(12px) if web, otherwise keep as is
  },
  sectionHeader: {
    fontWeight: '900',
    fontSize: 22,
    marginBottom: 12,
    color: '#23235B',
    letterSpacing: 0.2,
    fontFamily: 'System', // Use a clean sans-serif
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 10,
    color: '#6C63FF',
  },
  emptyStateText: {
    color: '#23235B',
    fontSize: 17,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyStateSubText: {
    color: '#6C63FF',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.85,
  },
  emptyStateTimestamp: {
    color: '#A0A0B2',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: 'rgba(220,220,255,0.16)',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginVertical: 10,
  },
  skeletonText: {
    color: '#A0A0B2',
    fontSize: 16,
    fontWeight: '500',
  },
});

