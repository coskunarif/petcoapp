import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const BrowseServicesTab = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();

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
        
      if (selectedFilter !== 'all') {
        query = query.eq('service_type_id', selectedFilter);
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

  const renderServiceCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => handleServicePress(item)}
      activeOpacity={0.7}
    >
      <AppCard>
        <View style={styles.serviceCardHeader}>
          <View style={styles.serviceTypeContainer}>
            <MaterialCommunityIcons 
              name={item.service_types?.icon || "paw"} 
              size={16} 
              color={theme.colors.primary}
            />
            <Text style={styles.serviceType}>{item.service_types?.name}</Text>
          </View>
          <StatusBadge status="active" size="small" />
        </View>
        
        <Text style={styles.serviceTitle}>{item.title}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.serviceFooter}>
          <View style={styles.providerContainer}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInitial}>
                {item.users?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
            <Text style={styles.providerName}>{item.users?.full_name}</Text>
          </View>
          
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={theme.colors.textTertiary}
          />
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  const renderFilterChips = () => {
    const filters = [
      { id: 'all', name: 'All Services' },
      { id: '1', name: 'Dog Walking' },
      { id: '2', name: 'Pet Sitting' },
      { id: '3', name: 'Grooming' },
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

  return (
    <View style={[globalStyles.safeArea, { paddingTop: 30 }]}>
      <SectionHeader 
        title="Available Services" 
        actionText="Filter" 
        onActionPress={() => {}} 
      />
      
      {renderFilterChips()}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
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
        <FlatList
          data={services}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
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
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: theme.spacing.md,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  filterChip: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
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
  serviceType: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  serviceTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.typography.h3.color,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  providerInitial: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  providerName: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default BrowseServicesTab;
