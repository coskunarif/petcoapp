import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import CreditBalanceCard from './CreditBalanceCard';
import UpcomingServicesSection from './UpcomingServicesSection';
import NearbyProvidersSection from './NearbyProvidersSection';
import QuickActionsSection from './QuickActionsSection';
import { FAB } from 'react-native-paper';
import { useHomeDashboardData, useServiceRequestsSubscription } from './hooks';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHomeDashboard } from './homeSlice';
import { Text } from 'react-native';
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

const HomeScreen: React.FC = () => {
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
        <QuickActionsSection onCreateRequestPress={() => {}} onOfferServicePress={() => {}} />
      </ScrollView>
      <FAB style={styles.fab} icon="plus" onPress={() => {}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    backgroundColor: '#4F8EF7',
  },
  sectionDivider: {
    height: 16,
    backgroundColor: 'transparent',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    elevation: 2,
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyStateIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubText: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateTimestamp: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginVertical: 8,
  },
  skeletonText: {
    color: '#bbb',
    fontSize: 15,
  },
});

export default HomeScreen;
