import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  View, 
  Text,
  Platform,
  Alert,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import ProviderRequestDetailModal from './ProviderRequestDetailModal';
import { ServiceRequest } from '../../../types/services';
import { servicesService } from '../../../services/servicesService';

interface ProviderRequestCardProps {
  request: ServiceRequest;
  index?: number;
  onRefresh?: () => void;
  onSelect?: () => void;
}

export default function ProviderRequestCard({ 
  request, 
  index = 0, 
  onRefresh, 
  onSelect 
}: ProviderRequestCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Entrance animation
  useEffect(() => {
    const delay = index * 100; // Stagger animation based on index
    
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
  
  // Format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '';
    }
  };
  
  // Calculate time elapsed
  const getTimeElapsed = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // Convert time difference to appropriate unit
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
      } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
      } else if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
      } else {
        return 'Just now';
      }
    } catch (e) {
      return '';
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
        'You have accepted this service request. The pet owner will be notified.',
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
        'Are you sure you want to decline this request? This action cannot be undone.',
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
                'You have declined this service request. The pet owner will be notified.',
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
  
  // Handle marking a request as completed
  const handleCompleteRequest = async () => {
    try {
      // Show confirmation dialog with more details
      Alert.alert(
        'Complete Service',
        'Are you sure this service has been completed? This will notify the pet owner and process payment.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete Service', 
            onPress: async () => {
              setIsUpdating(true);
              
              // In a real implementation, we would show a modal
              // to collect service completion notes and feedback
              // Similar to what we did in ProviderRequestDetailModal
              
              // Call service to update request status
              const result = await servicesService.updateRequest(
                request.id, 
                'completed'
              );
              
              if (result.error) {
                throw new Error(String(result.error));
              }
              
              // Show success message with more context
              Alert.alert(
                'Service Completed',
                'This service has been marked as completed. The pet owner has been notified and payment will be processed. Thank you for providing this service!',
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
      console.error('Error completing request:', error);
      Alert.alert(
        'Error',
        `Failed to mark as completed: ${error}`,
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
  const requestTitle = request.title || `${serviceType} Request`;
  
  // Format credits
  const credits = request.service_type?.credit_value || 0;
  
  // Is this a new (unread) request?
  // In a real app, you'd track this with a database field
  const isNew = request.status === 'pending';
  
  // Get requester info
  const requesterName = request.requester?.full_name || 'Unknown Requester';
  const requesterImage = request.requester?.profile_image_url;
  
  // Start a conversation with the requester
  const handleStartConversation = () => {
    if (!request || !request.requester) return;
    
    // Use the navigation prop to navigate to the chat screen
    // We'll need to modify this component to receive navigation from parent
    // For now, let's just log that we want to message the user
    console.log(`Starting conversation with requester: ${request.requester.id}`);
  };

  // Render the response actions based on status
  const renderActions = () => {
    if (request.status === 'pending') {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={handleDeclineRequest}
            disabled={isUpdating}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={handleAcceptRequest}
            disabled={isUpdating}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.acceptButtonGradient}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    } else if (request.status === 'accepted') {
      return (
        <View style={styles.actionsContainer}>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleStartConversation}
              disabled={isUpdating}
            >
              <MaterialCommunityIcons 
                name="message-text" 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleCompleteRequest}
              disabled={isUpdating}
            >
              <LinearGradient
                colors={[theme.colors.success, theme.colors.success + 'CC']}
                style={styles.completeButtonGradient}
              >
                <Text style={styles.completeButtonText}>Mark Completed</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={handleStartConversation}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons 
              name="message-text" 
              size={16} 
              color={theme.colors.primary} 
            />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => onSelect ? onSelect() : setModalVisible(true)}
            disabled={isUpdating}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

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
            onPress={() => onSelect ? onSelect() : setModalVisible(true)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            style={styles.cardTouchable}
            disabled={isUpdating}
          >
            <BlurView intensity={80} tint="light" style={styles.cardBlur}>
              {/* Status indicator */}
              <View style={[
                styles.statusIndicator,
                { backgroundColor: statusColor }
              ]} />
              
              {/* New request badge */}
              {isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
              
              {/* Status badge */}
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
                {/* Requester info */}
                <View style={styles.requesterContainer}>
                  <View style={styles.requesterAvatar}>
                    {requesterImage ? (
                      <Image source={{ uri: requesterImage }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.defaultAvatar}>
                        <Text style={styles.avatarInitial}>
                          {requesterName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.requesterInfo}>
                    <Text style={styles.requesterName}>{requesterName}</Text>
                    <Text style={styles.timeElapsed}>{getTimeElapsed(request.created_at)}</Text>
                  </View>
                  <View style={styles.creditsContainer}>
                    <Text style={styles.creditsValue}>{credits}</Text>
                    <Text style={styles.creditsLabel}>Credits</Text>
                  </View>
                </View>
                
                {/* Request Title */}
                <Text style={styles.requestTitle}>{requestTitle}</Text>
                
                {/* Request Details */}
                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons 
                      name={serviceIcon as keyof typeof MaterialCommunityIcons.glyphMap} 
                      size={14} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.detailText}>
                      {serviceType}
                    </Text>
                  </View>
                  
                  {request.scheduled_date && (
                    <>
                      <View style={styles.detailDivider} />
                      
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons 
                          name="calendar" 
                          size={14} 
                          color={theme.colors.textSecondary} 
                        />
                        <Text style={styles.detailText}>
                          {formatDate(request.scheduled_date)} • {formatTime(request.scheduled_date)}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                
                {/* Description Preview */}
                {request.notes && (
                  <Text style={styles.description} numberOfLines={2}>
                    {request.notes}
                  </Text>
                )}
                
                {/* Actions */}
                <View style={styles.actionsContainer}>
                  {renderActions()}
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
        <ProviderRequestDetailModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          requestId={request.id}
          onStatusChange={onRefresh}
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
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.notification,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
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
    zIndex: 10,
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
  requesterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requesterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  requesterInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  timeElapsed: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  creditsContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderRadius: 16,
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  creditsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  declineButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    marginRight: 8,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
  },
  acceptButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
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