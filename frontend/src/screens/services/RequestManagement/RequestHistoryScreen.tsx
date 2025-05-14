import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllServiceRequests } from '../../../redux/slices/serviceSlice';
import { AppDispatch } from '../../../redux/store';
import { ServiceRequest } from '../../../types/services';
import { EmptyState } from '../../../components/ui';
import { format, isAfter, isBefore, subMonths } from 'date-fns';

/**
 * Request History Screen
 * 
 * Displays a list of completed and cancelled service requests with:
 * - Filtering by time period (last month, 3 months, 6 months, all time)
 * - Sorting by date
 */
export default function RequestHistoryScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | 'all'>('3m');
  const [filteredRequests, setFilteredRequests] = useState<ServiceRequest[]>([]);
  
  // Get completed and cancelled requests from Redux store
  const requests = useSelector((state: any) => {
    const allRequests = state.services?.requests || [];
    return allRequests.filter((r: ServiceRequest) => 
      r.status === 'completed' || r.status === 'cancelled' || r.status === 'rejected'
    );
  });
  
  const requestsLoading = useSelector((state: any) => state.services?.requestsLoading || false);
  
  // Animation value for FlatList fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Load requests on mount
  useEffect(() => {
    loadRequests();
  }, [user?.id]);
  
  // Update filtered requests when period changes
  useEffect(() => {
    filterRequestsByPeriod();
  }, [selectedPeriod, requests]);
  
  // Handle back button press
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true;
    };
    
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);
  
  // Function to load requests
  const loadRequests = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        console.warn('Cannot fetch requests - user not authenticated');
        return;
      }
      
      // Fetch all requests where user is the requester
      await dispatch(fetchAllServiceRequests({
        userId: user.id,
        asProvider: false,
      }));
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading request history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter requests by time period
  const filterRequestsByPeriod = () => {
    if (!requests) {
      setFilteredRequests([]);
      return;
    }
    
    let filteredData = [...requests];
    const now = new Date();
    
    // Apply date filter
    if (selectedPeriod !== 'all') {
      const monthsToSubtract = selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6;
      const cutoffDate = subMonths(now, monthsToSubtract);
      
      filteredData = filteredData.filter(request => {
        try {
          const requestDate = new Date(request.created_at);
          return isAfter(requestDate, cutoffDate) || request.status === 'completed';
        } catch (e) {
          return true; // Include if date parsing fails
        }
      });
    }
    
    // Sort by date (most recent first)
    filteredData.sort((a, b) => {
      try {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return isBefore(dateA, dateB) ? 1 : -1;
      } catch (e) {
        return 0;
      }
    });
    
    setFilteredRequests(filteredData);
  };
  
  // Render request item
  const renderRequestItem = ({ item, index }: { item: ServiceRequest, index: number }) => {
    // Get status color and icon
    const getStatusConfig = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return { 
            color: theme.colors.success, 
            icon: 'check-circle',
            label: 'Completed'
          };
        case 'cancelled':
          return { 
            color: theme.colors.error, 
            icon: 'close-circle',
            label: 'Cancelled'
          };
        case 'rejected':
          return { 
            color: theme.colors.error, 
            icon: 'close-circle',
            label: 'Rejected'
          };
        default:
          return { 
            color: theme.colors.textTertiary, 
            icon: 'help-circle',
            label: status
          };
      }
    };
    
    const { color: statusColor, icon: statusIcon, label: statusLabel } = getStatusConfig(item.status);
    
    // Format date
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return format(date, 'MMM d, yyyy');
      } catch (e) {
        return dateString;
      }
    };
    
    // Animation delay based on index
    const fadeInDelay = index * 100;
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { 
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }
          ],
        }}
      >
        <TouchableOpacity
          style={styles.requestItem}
          onPress={() => navigation.navigate('RequestDetail', {
            requestId: item.id,
            backScreen: 'RequestHistory'
          })}
          activeOpacity={0.8}
        >
          <BlurView intensity={15} tint="light" style={styles.requestItemBlur}>
            {/* Service Type Icon */}
            <LinearGradient
              colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
              style={styles.serviceTypeIcon}
            >
              <MaterialCommunityIcons 
                name={item.service_type?.icon || 'card-account-details-outline'} 
                size={18} 
                color={theme.colors.primary} 
              />
            </LinearGradient>
            
            {/* Request Details */}
            <View style={styles.requestDetails}>
              <Text style={styles.requestTitle} numberOfLines={1}>
                {item.title || `${item.service_type?.name || 'Service'} Request`}
              </Text>
              
              <View style={styles.requestMeta}>
                <Text style={styles.requestDate}>
                  {formatDate(item.created_at)}
                </Text>
                <View style={styles.requestMetaDot} />
                <Text style={styles.providerName} numberOfLines={1}>
                  {item.provider?.full_name || 'Unknown Provider'}
                </Text>
              </View>
            </View>
            
            {/* Status Badge */}
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` }
            ]}>
              <MaterialCommunityIcons 
                name={statusIcon as keyof typeof MaterialCommunityIcons.glyphMap} 
                size={14} 
                color={statusColor} 
                style={styles.statusIcon} 
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Empty state component
  const renderEmptyState = () => {
    if (isLoading || requestsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading request history...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="history"
          title="No Request History"
          description={`You don't have any completed or cancelled requests${
            selectedPeriod !== 'all' 
              ? ` in the last ${
                  selectedPeriod === '1m' ? 'month' : 
                  selectedPeriod === '3m' ? '3 months' : 
                  '6 months'
                }` 
              : ''
          }`}
          buttonTitle={selectedPeriod !== 'all' ? 'Show All History' : 'Browse Services'}
          onButtonPress={() => {
            if (selectedPeriod !== 'all') {
              setSelectedPeriod('all');
            } else {
              navigation.navigate('ServicesStack');
            }
          }}
        />
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={30} tint="light" style={styles.backButtonBlur}>
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={22} 
                color={theme.colors.text} 
              />
            </BlurView>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Request History</Text>
          
          <View style={styles.rightPlaceholder} />
        </View>
        
        {/* Time Period Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPeriod === '1m' && styles.activeFilterChip
            ]}
            onPress={() => setSelectedPeriod('1m')}
          >
            <Text style={[
              styles.filterText,
              selectedPeriod === '1m' && styles.activeFilterText
            ]}>
              Last Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPeriod === '3m' && styles.activeFilterChip
            ]}
            onPress={() => setSelectedPeriod('3m')}
          >
            <Text style={[
              styles.filterText,
              selectedPeriod === '3m' && styles.activeFilterText
            ]}>
              3 Months
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPeriod === '6m' && styles.activeFilterChip
            ]}
            onPress={() => setSelectedPeriod('6m')}
          >
            <Text style={[
              styles.filterText,
              selectedPeriod === '6m' && styles.activeFilterText
            ]}>
              6 Months
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPeriod === 'all' && styles.activeFilterChip
            ]}
            onPress={() => setSelectedPeriod('all')}
          >
            <Text style={[
              styles.filterText,
              selectedPeriod === 'all' && styles.activeFilterText
            ]}>
              All Time
            </Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Request List */}
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={isLoading || requestsLoading}
          onRefresh={loadRequests}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rightPlaceholder: {
    width: 40,
  },
  filtersContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 50,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  requestItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  requestItemBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
  },
  serviceTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
    marginRight: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestDate: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  requestMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textTertiary,
    marginHorizontal: 6,
  },
  providerName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});