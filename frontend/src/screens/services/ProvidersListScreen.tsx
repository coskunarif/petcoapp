import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import ProviderCard from '../../components/services/ProviderCard';

// Mock data for providers
const mockProviders = [
  {
    id: 'provider1',
    full_name: 'Sarah Johnson',
    profile_image_url: null,
    rating: 4.8,
    services_count: 3,
    description: 'Professional pet caretaker with 5+ years of experience. Specialized in dog walking, overnight sitting, and administering medication.',
    distance: 2.4,
    specialties: [
      { id: 'type1', name: 'Dog Walking', icon: 'dog' },
      { id: 'type2', name: 'Pet Sitting', icon: 'home' },
      { id: 'type3', name: 'Medication', icon: 'medical-bag' },
    ],
    is_available: true,
    total_reviews: 48,
  },
  {
    id: 'provider2',
    full_name: 'Michael Rodriguez',
    profile_image_url: null,
    rating: 4.9,
    services_count: 5,
    description: 'Certified pet groomer and trainer. I love working with all kinds of pets and have extensive experience with dogs, cats, and small animals.',
    distance: 3.1,
    specialties: [
      { id: 'type3', name: 'Grooming', icon: 'scissors-cutting' },
      { id: 'type4', name: 'Training', icon: 'school' },
    ],
    is_available: true,
    total_reviews: 32,
  },
  {
    id: 'provider3',
    full_name: 'Emma Davis',
    profile_image_url: null,
    rating: 4.7,
    services_count: 2,
    description: 'Veterinary assistant offering pet sitting and medication administration. Experienced with special needs pets and senior care.',
    distance: 1.2,
    specialties: [
      { id: 'type2', name: 'Pet Sitting', icon: 'home' },
      { id: 'type3', name: 'Medication', icon: 'medical-bag' },
      { id: 'type5', name: 'Senior Care', icon: 'paw' },
    ],
    is_available: false,
    total_reviews: 24,
  },
  {
    id: 'provider4',
    full_name: 'James Wilson',
    profile_image_url: null,
    rating: 4.6,
    services_count: 4,
    description: 'Professional dog trainer and walker. I focus on positive reinforcement techniques and can help with behavioral issues.',
    distance: 4.5,
    specialties: [
      { id: 'type1', name: 'Dog Walking', icon: 'dog' },
      { id: 'type4', name: 'Training', icon: 'school' },
      { id: 'type6', name: 'Behavior', icon: 'emoticon' },
    ],
    is_available: true,
    total_reviews: 37,
  },
];

// Define the route params interface
type ProvidersListParams = {
  serviceType?: {
    id: string;
    name: string;
    icon: string;
  };
  title?: string;
  filterBy?: {
    distance?: boolean;
    availability?: boolean;
    rating?: boolean;
  };
};

type ProvidersListRouteProp = RouteProp<{ ProvidersListScreen: ProvidersListParams }, 'ProvidersListScreen'>;

const ProvidersListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ProvidersListRouteProp>();
  
  // Get params from route or use defaults
  const { 
    serviceType, 
    title = 'All Providers',
    filterBy = { distance: true, availability: true, rating: true }
  } = route.params || {};
  
  // State
  const [providers, setProviders] = useState(mockProviders);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'distance'>('rating');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 60;
  
  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // Load providers based on service type
  useEffect(() => {
    fetchProviders();
  }, [serviceType]);
  
  // Sort and filter providers when criteria change
  useEffect(() => {
    applyFiltersAndSort();
  }, [sortBy, showAvailableOnly]);
  
  // Fetches providers from the API (mock for now)
  const fetchProviders = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, we'd filter by service type here
      setProviders(mockProviders);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };
  
  // Apply sorting and filtering to providers
  const applyFiltersAndSort = () => {
    let filteredProviders = [...mockProviders];
    
    // Apply availability filter if needed
    if (showAvailableOnly) {
      filteredProviders = filteredProviders.filter(provider => provider.is_available);
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      filteredProviders.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'distance') {
      filteredProviders.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    
    setProviders(filteredProviders);
  };
  
  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProviders();
  }, []);
  
  // Handle pressing a provider card
  const handleProviderPress = (provider: any) => {
    // Navigate to provider detail screen
    navigation.navigate('ProviderDetail', { provider });
  };
  
  // Render the filter header
  const renderFilterHeader = () => (
    <View style={styles.filterHeader}>
      <Text style={styles.resultsText}>{providers.length} providers</Text>
      
      <View style={styles.filterOptions}>
        {filterBy.rating && (
          <TouchableOpacity
            style={[
              styles.filterOption,
              sortBy === 'rating' && styles.filterOptionSelected,
            ]}
            onPress={() => setSortBy('rating')}
          >
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={sortBy === 'rating' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterOptionText,
                sortBy === 'rating' && styles.filterOptionTextSelected,
              ]}
            >
              Rating
            </Text>
          </TouchableOpacity>
        )}
        
        {filterBy.distance && (
          <TouchableOpacity
            style={[
              styles.filterOption,
              sortBy === 'distance' && styles.filterOptionSelected,
            ]}
            onPress={() => setSortBy('distance')}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={sortBy === 'distance' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterOptionText,
                sortBy === 'distance' && styles.filterOptionTextSelected,
              ]}
            >
              Distance
            </Text>
          </TouchableOpacity>
        )}
        
        {filterBy.availability && (
          <TouchableOpacity
            style={[
              styles.filterOption,
              showAvailableOnly && styles.filterOptionSelected,
            ]}
            onPress={() => setShowAvailableOnly(!showAvailableOnly)}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={showAvailableOnly ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterOptionText,
                showAvailableOnly && styles.filterOptionTextSelected,
              ]}
            >
              Available Now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  // Render provider item
  const renderProviderItem = ({ item }: { item: any }) => (
    <ProviderCard
      provider={item}
      onPress={() => handleProviderPress(item)}
      style={styles.providerCard}
    />
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="account-search"
        size={60}
        color={theme.colors.textTertiary}
      />
      <Text style={styles.emptyTitle}>No Providers Found</Text>
      <Text style={styles.emptyText}>
        {showAvailableOnly
          ? 'Try removing the "Available Now" filter to see more providers.'
          : 'We couldn\'t find any providers matching your criteria.'}
      </Text>
      
      {showAvailableOnly && (
        <TouchableOpacity
          style={styles.resetFilterButton}
          onPress={() => setShowAvailableOnly(false)}
        >
          <Text style={styles.resetFilterText}>Show All Providers</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
          },
        ]}
      >
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {serviceType ? serviceType.name : title}
          </Text>
        </View>
      </Animated.View>
      
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading providers...</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          renderItem={renderProviderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.1)', 'rgba(108, 99, 255, 0.05)']}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroContent}>
                    <View style={styles.heroIconContainer}>
                      <MaterialCommunityIcons
                        name={serviceType?.icon || 'account-group'}
                        size={32}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Text style={styles.heroTitle}>
                      {serviceType ? serviceType.name : title}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                      {serviceType
                        ? `Find the best providers for ${serviceType.name}`
                        : 'Browse all service providers in your area'}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
              
              {/* Filter Header */}
              {renderFilterHeader()}
            </>
          }
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    zIndex: 2000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  listContent: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 80 : 56, // Adjust for header
    paddingBottom: 32,
  },
  heroSection: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.elevation.small,
  },
  heroTitle: {
    ...theme.typography.h1,
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  resultsText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterOptionSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  filterOptionText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  filterOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  providerCard: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...theme.typography.h2,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetFilterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  resetFilterText: {
    ...theme.typography.button,
    color: 'white',
  },
});

export default ProvidersListScreen;