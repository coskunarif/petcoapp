import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text,
  Platform,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProviderRequestsList from './ProviderRequestsList';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAllServiceRequests,
  selectServiceRequests,
  selectServiceRequestsLoading,
} from '../../../redux/slices/serviceSlice';
import { AppDispatch } from '../../../redux/store';
import { ServiceRequest } from '../../../types/services';

interface ProviderIncomingRequestsTabProps {
  onScroll?: (event: any) => void;
}

export default function ProviderIncomingRequestsTab({ onScroll }: ProviderIncomingRequestsTabProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.auth?.user);
  const requests = useSelector(selectServiceRequests);
  const loading = useSelector(selectServiceRequestsLoading);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string | null>('pending');
  
  // Load requests on mount and when filter changes
  useEffect(() => {
    loadRequests();
  }, [statusFilter, user?.id]);
  
  // Function to load requests
  const loadRequests = async () => {
    try {
      if (!user?.id) {
        console.warn('Cannot fetch requests - user not authenticated');
        return;
      }
      
      // Always fetch as provider for this tab - this is specifically for providers
      await dispatch(fetchAllServiceRequests({
        userId: user.id,
        asProvider: true,
        status: statusFilter || undefined
      }));
    } catch (error) {
      console.error('Error loading provider requests:', error);
    }
  };
  
  const handleScroll = (event: any) => {
    // Make sure we have a valid event
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset?.y !== 'number') {
      console.warn('[ProviderIncomingRequestsTab] Invalid scroll event:', event);
      return;
    }
  
    // Update our local animation value
    const scrollPosition = event.nativeEvent.contentOffset.y;
    // Just set the value directly
    scrollY.setValue(scrollPosition);
    
    // Simply pass the event through to parent if needed
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Calculate header animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  // Get pending requests count for badge
  const pendingCount = requests.filter(
    req => req.status === 'pending'
  ).length;
  
  // Function to determine priority of a request
  const getRequestPriority = (request: ServiceRequest): number => {
    // Prioritize based on status and date
    switch (request.status) {
      case 'pending':
        // Highest priority - newest pending first
        return 1000 - new Date(request.created_at).getTime();
      case 'accepted':
        // Next priority - accepted requests
        return 500 - new Date(request.created_at).getTime();
      default:
        // Lower priority for other statuses
        return 0;
    }
  };
  
  // Sort requests by priority (pending first, then accepted, then others)
  const sortedRequests = [...requests].sort((a, b) => {
    return getRequestPriority(b) - getRequestPriority(a);
  });
  
  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.headerContainer,
        { opacity: headerOpacity }
      ]}
    >
      <BlurView intensity={10} tint="light" style={styles.headerBlur}>
        <LinearGradient
          colors={['rgba(108, 99, 255, 0.12)', 'rgba(108, 99, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Incoming Requests</Text>
            {pendingCount > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingCount}>{pendingCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>
            Manage and respond to requests from pet owners
          </Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
  
  // Status tabs for filtering
  const renderStatusTabs = () => {
    const statuses = [
      { id: null, label: 'All Requests', icon: 'inbox-multiple' },
      { id: 'pending', label: 'Pending', icon: 'clock-outline' },
      { id: 'accepted', label: 'Accepted', icon: 'handshake' },
      { id: 'completed', label: 'Completed', icon: 'check-circle' },
    ];
    
    return (
      <View style={styles.tabsContainer}>
        {statuses.map(tab => (
          <TouchableOpacity
            key={tab.id || 'all'}
            style={[
              styles.tabButton,
              statusFilter === tab.id && styles.activeTabButton
            ]}
            onPress={() => setStatusFilter(tab.id)}
          >
            <MaterialCommunityIcons 
              name={tab.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
              size={18} 
              color={statusFilter === tab.id ? '#FFFFFF' : theme.colors.textSecondary} 
              style={styles.tabIcon}
            />
            <Text 
              style={[
                styles.tabText,
                statusFilter === tab.id && styles.activeTabText
              ]}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Animated Header */}
      {renderHeader()}
      
      {/* Status Tabs */}
      {renderStatusTabs()}
      
      {/* Request List */}
      <ProviderRequestsList 
        requests={sortedRequests}
        loading={loading}
        onScroll={handleScroll}
        onRefresh={loadRequests}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerContainer: {
    height: 120,
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
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 4,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 12,
  },
  pendingCount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});