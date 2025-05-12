import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { StatusBadge } from '../../components/ui';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedRequest } from '../../redux/slices/serviceSlice';
import type { ServiceRequest } from '../../types/services'; 
import { servicesService } from '../../services/servicesService';
import { RootState } from '../../redux/store';
import { format } from 'date-fns';

const { height } = Dimensions.get('window');

interface RequestDetailModalProps {
  visible: boolean;
  onDismiss: () => void;
  requestId?: string;
}

export default function RequestDetailModal({ visible, onDismiss, requestId }: RequestDetailModalProps) {
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  
  // Get the request from the Redux store with safe selectors
  const request = useSelector((state: RootState) => {
    const id = state.services?.selectedRequestId;
    return id ? state.services?.requests?.find(request => request.id === id) : null;
  });
  const currentUserId = useSelector((state: RootState) => state.auth?.user?.id);
  
  const [selectedStatus, setSelectedStatus] = useState<ServiceRequest['status']>('pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Set the request ID when it changes
  useEffect(() => {
    if (requestId) {
      console.log('[RequestDetailModal] Setting selected request ID:', requestId);
      dispatch(setSelectedRequest(requestId));
    }
  }, [requestId, dispatch]);

  // Effect to fetch the request if it's not in the Redux store
  useEffect(() => {
    if (visible && requestId && !request) {
      console.log('[RequestDetailModal] Request not found in Redux store for ID:', requestId);

      // Fetch the request from the API
      const fetchRequest = async () => {
        try {
          console.log('[RequestDetailModal] Fetching request from API:', requestId);
          const { data, error } = await servicesService.fetchRequestById(requestId);

          if (error) {
            console.error('[RequestDetailModal] Error fetching request:', error);
          } else {
            console.log('[RequestDetailModal] Successfully fetched request:', data?.id);
          }
        } catch (err) {
          console.error('[RequestDetailModal] Exception fetching request:', err);
        }
      };

      fetchRequest();
    }
  }, [visible, requestId, request]);
  
  // Update selected status when request changes
  useEffect(() => {
    if (request) {
      setSelectedStatus(request.status);
    }
  }, [request]);
  
  useEffect(() => {
    if (visible) {
      // Reset animation values when modal becomes visible
      slideAnim.setValue(height);
      opacityAnim.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  const handleClose = () => {
    // Reset error state
    setUpdateError(null);
    
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
      // Clear selected request after modal is closed
      setTimeout(() => dispatch(setSelectedRequest(null)), 300);
    });
  };
  
  const handleUpdateStatus = async () => {
    if (!request || !request.id) return;
    
    // Don't update if the status hasn't changed
    if (selectedStatus === request.status) {
      handleClose();
      return;
    }
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const { data, error } = await servicesService.updateRequest(request.id, selectedStatus);
      
      if (error) {
        setUpdateError(typeof error === 'string' ? error : 'Failed to update request status');
        console.error('[RequestDetailModal] Error updating request status:', error);
      } else {
        // Success! Close the modal
        handleClose();
      }
    } catch (err) {
      console.error('[RequestDetailModal] Exception updating request status:', err);
      setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#2e7d32'; // Success green
      case 'pending':
        return '#ed6c02'; // Warning orange
      case 'cancelled':
      case 'rejected':
        return '#d32f2f'; // Error red
      case 'accepted':
        return '#0288d1'; // Info blue
      default:
        return theme.colors.textTertiary;
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      case 'accepted': return 'Accepted';
      default: return 'Unknown';
    }
  };
  
  // Determine if user is requester or provider
  const isRequester = request?.requester_id === currentUserId;
  const isProvider = request?.provider_id === currentUserId;
  
  // Determine available status options based on current status and user role
  const getAvailableStatusOptions = (): ServiceRequest['status'][] => {
    if (!request) return [];
    
    switch(request.status) {
      case 'pending':
        if (isProvider) return ['accepted', 'rejected'];
        if (isRequester) return ['cancelled'];
        break;
      case 'accepted':
        if (isProvider) return ['completed', 'cancelled'];
        if (isRequester) return ['cancelled'];
        break;
      case 'completed':
      case 'cancelled':
      case 'rejected':
        return []; // No changes allowed for completed, cancelled or rejected requests
    }
    
    return [];
  };
  
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: opacityAnim }
        ]}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.97)']}
            style={styles.modalGradient}
          >
            {/* Drag handle */}
            <View style={styles.dragHandle} />
            
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <BlurView intensity={30} tint="light" style={styles.closeButtonBlur}>
                <MaterialCommunityIcons name="close" size={22} color={theme.colors.text} />
              </BlurView>
            </TouchableOpacity>
            
            {!request ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading request details...</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Header with request type and id */}
                <View style={styles.requestHeader}>
                  <View style={styles.requestTypeContainer}>
                    <LinearGradient
                      colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                      style={styles.iconBackground}
                    >
                      <MaterialCommunityIcons 
                        name={request.service_type?.icon || "swap-horizontal"} 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                    </LinearGradient>
                    <Text style={styles.requestType}>
                      {request.service_type?.name || 'Service'} Request
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(request.status)}20` }
                  ]}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(request.status) }
                    ]} />
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(request.status) }
                    ]}>
                      {getStatusLabel(request.status)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.requestTitle}>
                  {request.title || request.service_listing?.title || 'Service Request'}
                </Text>
                
                {/* Request details */}
                <BlurView intensity={15} tint="light" style={styles.detailsCard}>
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
                      <Text style={styles.detailLabel}>Requester</Text>
                      <Text style={styles.detailText}>
                        {request.requester?.full_name || 'Unknown Requester'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailDivider} />
                  
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
                      <Text style={styles.detailLabel}>Provider</Text>
                      <Text style={styles.detailText}>
                        {request.provider?.full_name || 'Unknown Provider'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailDivider} />
                  
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
                        {request.created_at 
                          ? format(new Date(request.created_at), 'PPP') 
                          : 'Not specified'
                        }
                      </Text>
                    </View>
                  </View>
                  
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
                          <Text style={styles.detailLabel}>Scheduled Date</Text>
                          <Text style={styles.detailText}>
                            {format(new Date(request.scheduled_date), 'PPP')}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                  
                  {request.notes && (
                    <>
                      <View style={styles.detailDivider} />
                      
                      <View style={styles.detailRow}>
                        <LinearGradient
                          colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                          style={styles.detailIconContainer}
                        >
                          <MaterialCommunityIcons 
                            name="text-box-outline" 
                            size={18} 
                            color={theme.colors.primary} 
                          />
                        </LinearGradient>
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Notes</Text>
                          <Text style={styles.detailText}>
                            {request.notes}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </BlurView>
                
                {/* Status selector - only show if user can update status */}
                {getAvailableStatusOptions().length > 0 && (
                  <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    
                    <View style={styles.statusOptions}>
                      {getAvailableStatusOptions().map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusOption,
                            selectedStatus === status && {
                              borderColor: getStatusColor(status),
                              backgroundColor: `${getStatusColor(status)}10`,
                            }
                          ]}
                          onPress={() => setSelectedStatus(status)}
                        >
                          <View 
                            style={[
                              styles.statusCheckCircle, 
                              selectedStatus === status && {
                                borderColor: getStatusColor(status),
                                backgroundColor: getStatusColor(status),
                              }
                            ]}
                          >
                            {selectedStatus === status && (
                              <MaterialCommunityIcons 
                                name="check" 
                                size={14} 
                                color="#FFFFFF" 
                              />
                            )}
                          </View>
                          <Text 
                            style={[
                              styles.statusOptionText,
                              selectedStatus === status && {
                                color: getStatusColor(status),
                                fontWeight: '700',
                              }
                            ]}
                          >
                            {getStatusLabel(status)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    {/* Error message */}
                    {updateError && (
                      <View style={styles.errorContainer}>
                        <MaterialCommunityIcons 
                          name="alert-circle" 
                          size={16} 
                          color="#d32f2f" 
                        />
                        <Text style={styles.errorText}>{updateError}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Actions */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.closeActionButton}
                    onPress={handleClose}
                    disabled={isUpdating}
                  >
                    <Text style={[
                      styles.closeActionText,
                      isUpdating && { opacity: 0.6 }
                    ]}>Close</Text>
                  </TouchableOpacity>
                  
                  {getAvailableStatusOptions().length > 0 && (
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.updateGradient,
                        isUpdating && { opacity: 0.7 }
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdateStatus}
                        disabled={isUpdating || selectedStatus === request.status}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <MaterialCommunityIcons 
                              name="check-circle-outline" 
                              size={18} 
                              color="#FFFFFF" 
                              style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>Update Status</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </LinearGradient>
                  )}
                </View>
              </ScrollView>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalGradient: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  closeButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 10,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBackground: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    ...theme.elevation.small,
  },
  requestType: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  requestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 20,
    letterSpacing: 0.2,
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
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginHorizontal: 16,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'column',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 8,
  },
  statusCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.textTertiary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 12,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  closeActionButton: {
    flex: 1,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
    marginRight: 8,
  },
  closeActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  updateGradient: {
    flex: 2,
    borderRadius: 16,
    ...theme.elevation.medium,
  },
  updateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
