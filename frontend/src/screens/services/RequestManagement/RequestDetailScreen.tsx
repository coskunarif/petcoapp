import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../../theme';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedRequest } from '../../../redux/slices/serviceSlice';
import { ServicesNavigationParamList } from '../../../types/navigation';
import { ServiceRequest } from '../../../types/services';
import { servicesService } from '../../../services/servicesService';
import { format } from 'date-fns';

type RequestDetailRouteProps = RouteProp<
  ServicesNavigationParamList, 
  'RequestDetail'
>;

/**
 * Request Detail Screen
 * 
 * Displays detailed information about a service request, including:
 * - Request status and information
 * - Provider/requester details
 * - Request history/timeline
 * - Action buttons based on request status and user role
 */
export default function RequestDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RequestDetailRouteProps>();
  const dispatch = useDispatch();
  const { requestId } = route.params || {};
  
  // Selected request from Redux store
  const request = useSelector((state: any) => {
    const requests = state.services?.requests || [];
    return requests.find((r: ServiceRequest) => r.id === requestId);
  });
  
  // Current user data
  const currentUserId = useSelector((state: any) => state.auth?.user?.id);
  
  // Local state
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Load request data when component mounts
  useEffect(() => {
    if (requestId) {
      loadRequestDetails();
    }
    
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    return () => {
      // Clear selected request when component unmounts
      dispatch(setSelectedRequest(null));
    };
  }, [requestId]);
  
  // Handle back button press
  useEffect(() => {
    const onBackPress = () => {
      navigation.goBack();
      return true;
    };
    
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);
  
  // Load request details
  const loadRequestDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!requestId) {
        setError('Request ID is missing');
        setIsLoading(false);
        return;
      }
      
      // Set selected request ID in Redux
      dispatch(setSelectedRequest(requestId));
      
      // Fetch request details if not in Redux store
      if (!request) {
        const response = await servicesService.fetchRequestById(requestId);
        if (response.error) {
          setError(typeof response.error === 'string' 
            ? response.error 
            : 'Failed to load request details');
        }
      }
    } catch (err) {
      setError('An error occurred while loading request details');
      console.error('[RequestDetailScreen] Error loading request:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine if user is requester or provider
  const isRequester = request?.requester_id === currentUserId;
  const isProvider = request?.provider_id === currentUserId;
  
  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { 
          color: theme.colors.success, 
          icon: 'check-circle',
          label: 'Completed'
        };
      case 'pending':
        return { 
          color: theme.colors.warning, 
          icon: 'clock-outline',
          label: 'Pending'
        };
      case 'accepted':
        return { 
          color: theme.colors.info, 
          icon: 'handshake',
          label: 'Accepted'
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
          label: status || 'Unknown'
        };
    }
  };
  
  // Handle updating request status
  const handleUpdateStatus = async (newStatus: ServiceRequest['status']) => {
    if (!request || !request.id) return;
    
    if (newStatus === request.status) {
      return; // No change
    }
    
    // Confirmation messages based on status
    const confirmationMessages = {
      cancelled: 'Are you sure you want to cancel this request?',
      completed: 'Mark this request as completed?',
      accepted: 'Accept this service request?',
      rejected: 'Reject this service request?',
    };
    
    // Show confirmation dialog
    Alert.alert(
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Request`,
      confirmationMessages[newStatus as keyof typeof confirmationMessages],
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: newStatus === 'cancelled' || newStatus === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            setIsUpdating(true);
            
            try {
              const result = await servicesService.updateRequest(request.id, newStatus);
              
              if (result.error) {
                Alert.alert(
                  'Error',
                  `Failed to update status: ${result.error}`,
                  [{ text: 'OK' }]
                );
              } else {
                // Success message
                Alert.alert(
                  'Status Updated',
                  `Request has been ${newStatus}`,
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                `An error occurred: ${error}`,
                [{ text: 'OK' }]
              );
            } finally {
              setIsUpdating(false);
            }
          }
        }
      ]
    );
  };
  
  // Handle request modification
  const handleModifyRequest = () => {
    if (!request) return;
    
    navigation.navigate('ModifyRequest', {
      requestId: request.id
    });
  };
  
  // Determine available status actions based on current status and user role
  const getAvailableActions = (): { status: ServiceRequest['status'], label: string }[] => {
    if (!request) return [];
    
    switch(request.status) {
      case 'pending':
        if (isProvider) return [
          { status: 'accepted', label: 'Accept Request' },
          { status: 'rejected', label: 'Decline Request' }
        ];
        if (isRequester) return [
          { status: 'cancelled', label: 'Cancel Request' }
        ];
        break;
      case 'accepted':
        if (isProvider) return [
          { status: 'completed', label: 'Mark Completed' },
          { status: 'cancelled', label: 'Cancel Service' }
        ];
        if (isRequester) return [
          { status: 'cancelled', label: 'Cancel Request' }
        ];
        break;
      case 'completed':
      case 'cancelled':
      case 'rejected':
        return []; // No actions for completed, cancelled or rejected requests
    }
    
    return [];
  };
  
  // Get status color and icon based on current status
  const { color: statusColor, icon: statusIcon, label: statusLabel } = 
    request ? getStatusConfig(request.status) : getStatusConfig('');
  
  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return dateString;
    }
  };
  
  // Format time function
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'p');
    } catch (e) {
      return '';
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRequestDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="file-search" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.errorTitle}>Request Not Found</Text>
        <Text style={styles.errorText}>The requested service request could not be found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim }
      ]}
    >
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
          
          <Text style={styles.headerTitle}>Request Details</Text>
          
          {isRequester && request.status === 'pending' && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleModifyRequest}
              disabled={isUpdating}
            >
              <BlurView intensity={30} tint="light" style={styles.backButtonBlur}>
                <MaterialCommunityIcons 
                  name="pencil" 
                  size={22} 
                  color={theme.colors.primary} 
                />
              </BlurView>
            </TouchableOpacity>
          )}
          
          {!(isRequester && request.status === 'pending') && (
            <View style={styles.rightPlaceholder} />
          )}
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Type Badge */}
          <View style={styles.serviceTypeBadge}>
            <LinearGradient
              colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
              style={styles.iconBackground}
            >
              <MaterialCommunityIcons 
                name={request.service_type?.icon || 'card-account-details-outline'} 
                size={20} 
                color={theme.colors.primary} 
              />
            </LinearGradient>
            <Text style={styles.serviceTypeText}>
              {request.service_type?.name || 'Service'} Request
            </Text>
          </View>
          
          {/* Request Title */}
          <Text style={styles.requestTitle}>
            {request.title || 'Service Request'}
          </Text>
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${statusColor}20` }
          ]}>
            <MaterialCommunityIcons 
              name={statusIcon as any} 
              size={18} 
              color={statusColor} 
              style={styles.statusIcon} 
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          
          {/* Request Details Card */}
          <BlurView intensity={15} tint="light" style={styles.detailsCard}>
            {/* Requester */}
            <View style={styles.detailRow}>
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                style={styles.detailIconContainer}
              >
                <MaterialCommunityIcons 
                  name="account" 
                  size={18} 
                  color={theme.colors.primary} 
                />
              </LinearGradient>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Requested By</Text>
                <Text style={styles.detailText}>
                  {request.requester?.full_name || 'Unknown Requester'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />
            
            {/* Provider */}
            <View style={styles.detailRow}>
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                style={styles.detailIconContainer}
              >
                <MaterialCommunityIcons 
                  name="account-tie" 
                  size={18} 
                  color={theme.colors.primary} 
                />
              </LinearGradient>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Service Provider</Text>
                <Text style={styles.detailText}>
                  {request.provider?.full_name || 'Unknown Provider'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailDivider} />
            
            {/* Date Requested */}
            <View style={styles.detailRow}>
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                style={styles.detailIconContainer}
              >
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={18} 
                  color={theme.colors.primary} 
                />
              </LinearGradient>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date Requested</Text>
                <Text style={styles.detailText}>
                  {formatDate(request.created_at)}
                </Text>
                <Text style={styles.detailSubtext}>
                  {formatTime(request.created_at)}
                </Text>
              </View>
            </View>
            
            {/* Scheduled Date (if available) */}
            {request.scheduled_date && (
              <>
                <View style={styles.detailDivider} />
                
                <View style={styles.detailRow}>
                  <LinearGradient
                    colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                    style={styles.detailIconContainer}
                  >
                    <MaterialCommunityIcons 
                      name="calendar-clock" 
                      size={18} 
                      color={theme.colors.primary} 
                    />
                  </LinearGradient>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Scheduled For</Text>
                    <Text style={styles.detailText}>
                      {formatDate(request.scheduled_date)}
                    </Text>
                    <Text style={styles.detailSubtext}>
                      {formatTime(request.scheduled_date)}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </BlurView>
          
          {/* Notes Section */}
          {request.notes && (
            <>
              <Text style={styles.sectionTitle}>Notes</Text>
              <BlurView intensity={15} tint="light" style={styles.notesCard}>
                <Text style={styles.notesText}>{request.notes}</Text>
              </BlurView>
            </>
          )}
          
          {/* Request Timeline Section */}
          <Text style={styles.sectionTitle}>Request Timeline</Text>
          <BlurView intensity={15} tint="light" style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                  style={styles.timelineIcon}
                >
                  <MaterialCommunityIcons 
                    name="file-plus-outline" 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                </LinearGradient>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Request Created</Text>
                <Text style={styles.timelineDate}>{formatDate(request.created_at)}</Text>
                <Text style={styles.timelineText}>
                  {request.requester?.full_name || 'Requester'} created a new service request
                </Text>
              </View>
            </View>
            
            {request.status !== 'pending' && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <LinearGradient
                    colors={[
                      `${getStatusConfig(request.status).color}30`,
                      `${getStatusConfig(request.status).color}15`
                    ]}
                    style={styles.timelineIcon}
                  >
                    <MaterialCommunityIcons 
                      name={getStatusConfig(request.status).icon} 
                      size={16} 
                      color={getStatusConfig(request.status).color} 
                    />
                  </LinearGradient>
                  {request.status === 'accepted' && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>
                    Request {getStatusConfig(request.status).label}
                  </Text>
                  <Text style={styles.timelineDate}>{formatDate(request.updated_at)}</Text>
                  <Text style={styles.timelineText}>
                    {request.status === 'accepted' && 
                      `${request.provider?.full_name || 'Provider'} accepted the request`}
                    {request.status === 'rejected' && 
                      `${request.provider?.full_name || 'Provider'} declined the request`}
                    {request.status === 'cancelled' && 
                      `${isRequester ? 'You' : request.requester?.full_name || 'Requester'} cancelled the request`}
                    {request.status === 'completed' && 
                      `${request.provider?.full_name || 'Provider'} marked the service as completed`}
                  </Text>
                </View>
              </View>
            )}
            
            {request.status === 'completed' && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <LinearGradient
                    colors={['rgba(46, 125, 50, 0.2)', 'rgba(46, 125, 50, 0.1)']}
                    style={styles.timelineIcon}
                  >
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={16} 
                      color={theme.colors.success} 
                    />
                  </LinearGradient>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Service Completed</Text>
                  <Text style={styles.timelineDate}>{formatDate(request.updated_at)}</Text>
                  <Text style={styles.timelineText}>
                    Service was successfully completed
                  </Text>
                </View>
              </View>
            )}
          </BlurView>
        </ScrollView>
        
        {/* Action Buttons */}
        {getAvailableActions().length > 0 && (
          <View style={styles.actionContainer}>
            {getAvailableActions().map((action, index) => {
              const isDestructive = action.status === 'cancelled' || action.status === 'rejected';
              const isMainAction = !isDestructive || getAvailableActions().length === 1;
              
              if (isMainAction) {
                return (
                  <LinearGradient
                    key={action.status}
                    colors={isDestructive 
                      ? ['#e53935', '#c62828'] 
                      : [theme.colors.primary, theme.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.actionButtonGradient,
                      isUpdating && { opacity: 0.7 }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleUpdateStatus(action.status)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <MaterialCommunityIcons 
                            name={isDestructive ? 'close-circle-outline' : 'check-circle-outline'} 
                            size={18} 
                            color="#FFFFFF" 
                            style={styles.actionButtonIcon}
                          />
                          <Text style={styles.actionButtonText}>{action.label}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={action.status}
                    style={[
                      styles.secondaryActionButton,
                      isUpdating && { opacity: 0.7 }
                    ]}
                    onPress={() => handleUpdateStatus(action.status)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.secondaryActionText}>{action.label}</Text>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        )}
      </SafeAreaView>
    </Animated.View>
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
  editButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  serviceTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBackground: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  serviceTypeText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  requestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  detailSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  notesCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
    padding: 16,
  },
  notesText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  timelineCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    width: 30,
    alignItems: 'center',
  },
  timelineIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 4,
    marginBottom: -16,
    alignSelf: 'center',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  timelineText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(250, 250, 250, 0.9)',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    marginRight: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
});