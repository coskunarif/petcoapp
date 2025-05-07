import React, { useState, useEffect, useRef } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../../supabaseClient';
import { useNavigation } from '@react-navigation/native';
import { theme, globalStyles } from '../../../theme';
import { 
  AppCard, 
  SectionHeader, 
  EmptyState, 
  StatusBadge 
} from '../../../components/ui';
import { ServicesNavigationProp } from '../../../types/navigation';

// Create a ServiceDetailModal standalone component
import ServiceDetailModal from '../ServiceDetailModal';

// Create animated FlatList component to support native events with useNativeDriver
const AnimatedFlatList = Animated.createAnimatedComponent<any>(FlatList);

interface BrowseServicesTabProps {
  onScroll?: (event: any) => void;
}

const BrowseServicesTab: React.FC<BrowseServicesTabProps> = ({ onScroll }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = 140; // Adjust this value based on your header height
  const translateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchServices();
  }, [selectedFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('service_listings')
        .select(`
          *,
          users:provider_id (full_name, profile_image_url),
          service_types (name, icon)
        `)
        .eq('is_active', true);
        
      // Fix the filter query to handle non-UUID values properly
      if (selectedFilter !== 'all') {
        // For demo/testing purposes, map numeric string IDs to proper UUIDs
        // In production, you would use actual UUIDs from your database
        const typeIdMap: {[key: string]: string} = {
          '1': '123e4567-e89b-12d3-a456-426614174000', // Dog Walking 
          '2': '123e4567-e89b-12d3-a456-426614174001', // Pet Sitting
          '3': '123e4567-e89b-12d3-a456-426614174002', // Grooming
          '4': '123e4567-e89b-12d3-a456-426614174003', // Training
        };
        
        const mappedId = typeIdMap[selectedFilter];
        if (mappedId) {
          query = query.eq('service_type_id', mappedId);
        } else {
          console.warn(`No UUID mapping found for filter: ${selectedFilter}`);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
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

  // No longer need the explicit handleScroll function since we're using Animated.event
  // The listener parameter in Animated.event will handle propagating to parent if needed

  const renderServiceCard = ({ item, index }: { item: any, index: number }) => {
    // Calculate delay for staggered animation
    const delay = index * 100;
    
    return (
      <Animated.View
        style={{
          opacity: 1,
          transform: [{ 
            translateY: scrollY.interpolate({
              inputRange: [-100, 0, 100 + (index * 50)],
              outputRange: [0, 0, 20],
              extrapolate: 'clamp',
            })
          }],
        }}
      >
        <TouchableOpacity 
          onPress={() => handleServicePress(item)}
          activeOpacity={0.7}
          style={styles.cardTouchable}
        >
          <BlurView intensity={80} tint="light" style={styles.cardBlur}>
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceTypeContainer}>
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']}
                  style={styles.iconBackground}
                >
                  <MaterialCommunityIcons 
                    name={item.service_types?.icon || "paw"} 
                    size={18} 
                    color={theme.colors.primary}
                  />
                </LinearGradient>
                <Text style={styles.serviceType}>{item.service_types?.name || 'Service'}</Text>
              </View>
              <StatusBadge status="active" size="small" />
            </View>
            
            <Text style={styles.serviceTitle}>{item.title || 'Untitled Service'}</Text>
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {item.description || 'No description available'}
            </Text>
            
            <View style={styles.serviceFooter}>
              <View style={styles.providerContainer}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerInitial}>
                    {item.users?.full_name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <Text style={styles.providerName}>{item.users?.full_name || 'Unknown Provider'}</Text>
              </View>
              
              <View style={styles.actionButtonContainer}>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={theme.colors.primary}
                />
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterChips = () => {
    const filters = [
      { id: 'all', name: 'All Services', icon: 'apps' },
      { id: '1', name: 'Dog Walking', icon: 'dog' },
      { id: '2', name: 'Pet Sitting', icon: 'home-heart' },
      { id: '3', name: 'Grooming', icon: 'scissors-cutting' },
      { id: '4', name: 'Training', icon: 'school' },
    ];
    
    return (
      <View style={styles.filtersContainer}>
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
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filtersContent}
        />
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

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {renderFilterChips()}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : services.length === 0 ? (
        <EmptyState
          icon="magnify"
          title="No services available"
          description={`We couldn't find any ${selectedFilter !== 'all' ? 'matching ' : ''}services at this time`}
          buttonTitle={selectedFilter !== 'all' ? "View All Services" : "Refresh"}
          onButtonPress={selectedFilter !== 'all' ? () => setSelectedFilter('all') : onRefresh}
        />
      ) : (
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
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          service={selectedService}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerContainer: {
    height: 140,
    marginBottom: 10,
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
    marginBottom: 16,
    zIndex: 1,
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
  filterChipText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  cardTouchable: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.elevation.medium,
  },
  cardBlur: {
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    ...theme.elevation.small,
  },
  serviceType: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  providerInitial: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  providerName: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  actionButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.small,
  },
});

export default BrowseServicesTab;
