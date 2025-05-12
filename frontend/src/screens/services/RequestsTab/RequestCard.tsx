import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  View, 
  Text,
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import RequestDetailModal from '../RequestDetailModal';
import { ServiceRequest } from '../../../types/services';
import { servicesService } from '../../../services/servicesService';
import { useSelector } from 'react-redux';
import { selectRequestsTabAsProvider } from '../../../redux/slices/serviceSlice';

interface RequestCardProps {
  request: ServiceRequest;
  index?: number;
  onRefresh?: () => void;
}

export default function RequestCard({ request, index = 0, onRefresh }: RequestCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Get current view mode (as provider or requester)
  const asProvider = useSelector(selectRequestsTabAsProvider);
  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Entrance animation
  useEffect(() => {
    const delay = index * 150; // Stagger animation based on index
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, { 
      toValue: 0.98, 
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, { 
      toValue: 1, 
      useNativeDriver: true,
      friction: 8,
    }).start();
  };
  
  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
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
          label: status
        };
    }
  };
  
  const { color: statusColor, icon: statusIcon, label: statusLabel } = getStatusConfig(request.status);
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Handle accepting a request (providers only)
  const handleAcceptRequest = async () => {
    try {
      setIsUpdating(true);
      
      // Call service to update request status
      const result = await servicesService.updateRequest(
        request.id, 
        'accepted'
      );
      
      if (result.error) {
        throw new Error(String(result.error));
      }
      
      // Show success message
      Alert.alert(
        'Request Accepted',
        'You have accepted this service request.',
        [{ text: 'OK' }]
      );
      
      // Refresh the list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert(
        'Error',
        `Failed to accept request: ${error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle declining a request (providers only)
  const handleDeclineRequest = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Decline Request',
        'Are you sure you want to decline this request?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Decline', 
            style: 'destructive',
            onPress: async () => {
              setIsUpdating(true);
              
              // Call service to update request status
              const result = await servicesService.updateRequest(
                request.id, 
                'rejected'
              );
              
              if (result.error) {
                throw new Error(String(result.error));
              }
              
              // Show success message
              Alert.alert(
                'Request Declined',
                'You have declined this service request.',
                [{ text: 'OK' }]
              );
              
              // Refresh the list
              if (onRefresh) {
                onRefresh();
              }
              
              setIsUpdating(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert(
        'Error',
        `Failed to decline request: ${error}`,
        [{ text: 'OK' }]
      );
      setIsUpdating(false);
    }
  };
  
  // Handle cancelling a request (requesters only)
  const handleCancelRequest = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Cancel Request',
        'Are you sure you want to cancel this request?',
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Yes, Cancel', 
            style: 'destructive',
            onPress: async () => {
              setIsUpdating(true);
              
              // Call service to update request status
              const result = await servicesService.updateRequest(
                request.id, 
                'cancelled'
              );
              
              if (result.error) {
                throw new Error(String(result.error));
              }
              
              // Show success message
              Alert.alert(
                'Request Cancelled',
                'Your service request has been cancelled.',
                [{ text: 'OK' }]
              );
              
              // Refresh the list
              if (onRefresh) {
                onRefresh();
              }
              
              setIsUpdating(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert(
        'Error',
        `Failed to cancel request: ${error}`,
        [{ text: 'OK' }]
      );
      setIsUpdating(false);
    }
  };

  // Platform-specific shadow styling
  const platformShadow = Platform.OS === 'android' ? {
    elevation: 4,
  } : {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  };
  
  // Get service info
  const serviceType = request.service_type?.name || 'Service';
  const serviceIcon = request.service_type?.icon || 'paw';
  
  // Get user info based on role
  const otherPartyName = asProvider 
    ? (request.requester?.full_name || 'Requester')
    : (request.provider?.full_name || 'Provider');

  return (
    <>
      <View style={[styles.outerContainer, platformShadow]}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity,
              transform: [
                { translateY },
                { scale }
              ],
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            style={styles.cardTouchable}
            disabled={isUpdating}
          >
            <BlurView intensity={80} tint="light" style={styles.cardBlur}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: statusColor }
              ]} />
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` }
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
              
              <View style={styles.cardContent}>
                {/* Request Type with Icon */}
                <View style={styles.typeContainer}>
                  <LinearGradient
                    colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']}
                    style={styles.iconContainer}
                  >
                    <MaterialCommunityIcons 
                      name={serviceIcon as keyof typeof MaterialCommunityIcons.glyphMap} 
                      size={18} 
                      color={theme.colors.primary} 
                    />
                  </LinearGradient>
                  <Text style={styles.typeText}>{serviceType}</Text>
                </View>
                
                {/* Request Title */}
                <Text style={styles.requestTitle}>
                  {request.title || `${serviceType} Request`}
                </Text>
                
                {/* Request Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons 
                      name="account" 
                      size={14} 
                      color={theme.colors.textSecondary} 
                    />
                    <Text style={styles.detailText}>
                      {otherPartyName}
                    </Text>
                  </View>
                  
                  <View style={styles.detailDivider} />
                  
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons 
                      name="calendar" 
                      size={14} 
                      color={theme.colors.textSecondary} 
                    />
                    <Text style={styles.detailText}>
                      {formatDate(request.created_at)}
                    </Text>
                  </View>
                </View>
                
                {/* Description Preview */}
                {request.notes && (
                  <Text style={styles.description} numberOfLines={2}>
                    {request.notes}
                  </Text>
                )}
                
                {/* Actions */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      { backgroundColor: `${statusColor}10` }
                    ]}
                    onPress={() => setModalVisible(true)}
                    disabled={isUpdating}
                  >
                    <Text style={[styles.actionText, { color: statusColor }]}>
                      View Details
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Actions based on status and role */}
                  {request.status === 'pending' && asProvider && (
                    <View style={styles.actionButtons}>
                      {/* Decline Button */}
                      <TouchableOpacity 
                        style={styles.declineButton}
                        onPress={handleDeclineRequest}
                        disabled={isUpdating}
                      >
                        <MaterialCommunityIcons 
                          name="close" 
                          size={18} 
                          color={theme.colors.error} 
                        />
                      </TouchableOpacity>
                      
                      {/* Accept Button */}
                      <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={handleAcceptRequest}
                        disabled={isUpdating}
                      >
                        <LinearGradient
                          colors={[theme.colors.primary, theme.colors.primaryDark]}
                          style={styles.iconButtonGradient}
                        >
                          <MaterialCommunityIcons 
                            name="check" 
                            size={18} 
                            color="#FFFFFF" 
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Cancel button for requesters */}
                  {(request.status === 'pending' || request.status === 'accepted') && !asProvider && (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={handleCancelRequest}
                      disabled={isUpdating}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Loading state */}
        {isUpdating && (
          <View style={styles.loadingOverlay}>
            <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons 
              name="sync" 
              size={24} 
              color={theme.colors.primary}
              style={{ opacity: 0.8 }}
            />
          </View>
        )}
      </View>
      
      {/* Detail Modal */}
      {request && (
        <RequestDetailModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          requestId={request.id}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
    borderRadius: 24,
    position: 'relative',
  },
  cardContainer: {
    borderRadius: 24,
    position: 'relative',
  },
  cardTouchable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardContent: {
    padding: 20,
    paddingLeft: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 10,
    paddingRight: 60, // Space for status badge
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  detailDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textTertiary,
    marginHorizontal: 10,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  declineButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    marginRight: 8,
  },
  iconButton: {
    overflow: 'hidden',
    borderRadius: 16,
    ...theme.elevation.small,
  },
  iconButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.error,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 10,
  },
});