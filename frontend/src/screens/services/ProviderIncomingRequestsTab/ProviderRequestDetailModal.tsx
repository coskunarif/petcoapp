import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
  TextInput
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import { servicesService } from '../../../services/servicesService';
import { ServiceRequest } from '../../../types/services';

interface ProviderRequestDetailModalProps {
  visible: boolean;
  onDismiss: () => void;
  requestId: string;
  onStatusChange?: () => void;
}

export default function ProviderRequestDetailModal({ 
  visible, 
  onDismiss, 
  requestId,
  onStatusChange
}: ProviderRequestDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingCancellation, setIsSubmittingCancellation] = useState(false);
  
  // Load request details when modal becomes visible
  useEffect(() => {
    if (visible && requestId) {
      loadRequestDetails();
    }
  }, [visible, requestId]);
  
  // Function to load request details
  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await servicesService.fetchRequestById(requestId);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRequest(data);
      } else {
        throw new Error('Request not found');
      }
    } catch (error) {
      console.error('Error loading request details:', error);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle accepting a request
  const handleAccept = async () => {
    if (!request) return;
    
    try {
      setIsUpdating(true);
      
      const result = await servicesService.updateRequest(
        request.id, 
        'accepted'
      );
      
      if (result.error) {
        throw result.error;
      }
      
      // Update local state
      if (result.data) {
        setRequest(result.data);
      }
      
      // Call the onStatusChange callback if provided
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setError(`Failed to accept request: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle declining a request
  const handleDecline = async () => {
    if (!request) return;
    
    try {
      setIsUpdating(true);
      
      const result = await servicesService.updateRequest(
        request.id, 
        'rejected'
      );
      
      if (result.error) {
        throw result.error;
      }
      
      // Update local state
      if (result.data) {
        setRequest(result.data);
      }
      
      // Call the onStatusChange callback if provided
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error declining request:', error);
      setError(`Failed to decline request: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Show the completion modal
  const handleComplete = () => {
    if (!request) return;
    setCompletionModalVisible(true);
  };
  
  // Handle submitting the completion
  const handleSubmitCompletion = async () => {
    if (!request) return;
    
    try {
      setIsSubmittingCompletion(true);
      
      // First, update the request status to completed
      const result = await servicesService.updateRequest(
        request.id, 
        'completed'
      );
      
      if (result.error) {
        throw result.error;
      }
      
      // In a real app, we would also save the completion note
      // to a feedback or reviews table, but for now we'll just log it
      console.log('Completion note:', completionNote);
      
      // Update local state
      if (result.data) {
        setRequest(result.data);
      }
      
      // Call the onStatusChange callback if provided
      if (onStatusChange) {
        onStatusChange();
      }
      
      // Close the completion modal
      setCompletionModalVisible(false);
      
      // Reset the completion note
      setCompletionNote('');
      
      // Show success alert
      Alert.alert(
        'Service Completed',
        'The service has been marked as completed successfully. The pet owner will be notified.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error completing request:', error);
      setError(`Failed to mark as completed: ${error}`);
      
      // Close the completion modal
      setCompletionModalVisible(false);
    } finally {
      setIsSubmittingCompletion(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Format time
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
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
  
  // Get status badge config
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
  
  // Determine which actions to show based on status
  // Start a conversation with the requester
  const handleStartConversation = () => {
    if (!request || !request.requester) return;
    
    // Use the navigation prop to navigate to the chat screen
    // We'll need to modify this component to receive navigation from parent
    // For now, let's just log that we want to message the user
    console.log(`Starting conversation with requester: ${request.requester.id}`);
    
    // In a real implementation we would do:
    // navigation.navigate('Chat', {
    //   screen: 'ChatDetail',
    //   params: {
    //     conversationId: [userId, request.requester.id].sort().join('_'),
    //     otherUserId: request.requester.id,
    //     otherUserName: request.requester.full_name || 'Requester'
    //   }
    // });
    
    // Close the modal
    onDismiss();
  };
  
  // Show the cancellation modal
  const handleCancel = () => {
    if (!request) return;
    setCancellationModalVisible(true);
  };
  
  // Handle submitting the cancellation
  const handleSubmitCancellation = async () => {
    if (!request) return;
    
    try {
      setIsSubmittingCancellation(true);
      
      // Update the request status to cancelled
      const result = await servicesService.updateRequest(
        request.id, 
        'cancelled'
      );
      
      if (result.error) {
        throw result.error;
      }
      
      // In a real app, we would also save the cancellation reason
      console.log('Cancellation reason:', cancellationReason);
      
      // Update local state
      if (result.data) {
        setRequest(result.data);
      }
      
      // Call the onStatusChange callback if provided
      if (onStatusChange) {
        onStatusChange();
      }
      
      // Close the cancellation modal
      setCancellationModalVisible(false);
      
      // Reset the cancellation reason
      setCancellationReason('');
      
      // Show success alert
      Alert.alert(
        'Service Cancelled',
        'The service request has been cancelled. The pet owner will be notified.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError(`Failed to cancel request: ${error}`);
      
      // Close the cancellation modal
      setCancellationModalVisible(false);
    } finally {
      setIsSubmittingCancellation(false);
    }
  };

  const renderActionButtons = () => {
    if (!request) return null;
    
    const { status } = request;
    
    switch (status) {
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={handleDecline}
              disabled={isUpdating}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={handleAccept}
              disabled={isUpdating}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.acceptButtonGradient}
              >
                <Text style={styles.acceptButtonText}>Accept Request</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
        return (
          <View style={styles.actionButtonsColumn}>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleComplete}
                disabled={isUpdating}
              >
                <LinearGradient
                  colors={[theme.colors.success, theme.colors.success + 'CC']}
                  style={styles.completeButtonGradient}
                >
                  <Text style={styles.completeButtonText}>Mark as Completed</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleStartConversation}
              disabled={isUpdating}
            >
              <View style={styles.messageButtonContent}>
                <MaterialCommunityIcons 
                  name="message-text" 
                  size={18} 
                  color={theme.colors.primary}
                  style={styles.messageIcon}
                />
                <Text style={styles.messageButtonText}>Message Requester</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onDismiss}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={handleStartConversation}
            >
              <View style={styles.messageButtonContent}>
                <MaterialCommunityIcons 
                  name="message-text" 
                  size={18} 
                  color={theme.colors.primary}
                  style={styles.messageIcon}
                />
                <Text style={styles.messageButtonText}>Message Requester</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
    }
  };

  // Render modal content
  const renderContent = () => {
    if (loading) {
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
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={48} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadRequestDetails}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (!request) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={48} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorText}>Request not found</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onDismiss}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Get status config
    const { color: statusColor, icon: statusIcon, label: statusLabel } = getStatusConfig(request.status);
    
    // Get service info
    const serviceType = request.service_type?.name || 'Service';
    const serviceIcon = request.service_type?.icon || 'paw';
    const requestTitle = request.title || `${serviceType} Request`;
    
    // Get requester info
    const requesterName = request.requester?.full_name || 'Unknown Requester';
    const requesterImage = request.requester?.profile_image_url;
    
    // Get credits value
    const credits = request.service_type?.credit_value || 0;
    
    return (
      <ScrollView style={styles.scrollView}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <MaterialCommunityIcons 
            name={statusIcon as keyof typeof MaterialCommunityIcons.glyphMap} 
            size={18} 
            color={statusColor} 
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
        
        {/* Service Type */}
        <View style={styles.serviceTypeContainer}>
          <LinearGradient
            colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']}
            style={styles.serviceIconContainer}
          >
            <MaterialCommunityIcons 
              name={serviceIcon as keyof typeof MaterialCommunityIcons.glyphMap} 
              size={24} 
              color={theme.colors.primary} 
            />
          </LinearGradient>
          <Text style={styles.serviceTypeText}>{serviceType}</Text>
        </View>
        
        {/* Request Title */}
        <Text style={styles.requestTitle}>{requestTitle}</Text>
        
        {/* Credits and Date */}
        <View style={styles.metadataRow}>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsValue}>{credits}</Text>
            <Text style={styles.creditsLabel}>Credits</Text>
          </View>
          
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons 
              name="calendar-clock" 
              size={16} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.dateText}>
              {formatDate(request.created_at)}
            </Text>
          </View>
        </View>
        
        {/* Requester Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Requester</Text>
          <View style={styles.requesterCard}>
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
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => console.log('Contact requester')}
              >
                <MaterialCommunityIcons 
                  name="message-text" 
                  size={14} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Schedule Section */}
        {request.scheduled_date && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.scheduleText}>
                  {formatDate(request.scheduled_date)}
                </Text>
              </View>
              <View style={styles.scheduleRow}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.scheduleText}>
                  {formatTime(request.scheduled_date)}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Notes Section */}
        {request.notes && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{request.notes}</Text>
            </View>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {renderActionButtons()}
        </View>
      </ScrollView>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onDismiss}
      >
        <View style={styles.container}>
          <BlurView intensity={90} tint="light" style={styles.blurView}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onDismiss}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Request Details</Text>
              <View style={styles.headerRight} />
            </View>
            
            <View style={styles.content}>
              {renderContent()}
            </View>
            
            {/* Loading Overlay */}
            {isUpdating && (
              <View style={styles.loadingOverlay}>
                <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.updatingText}>Updating request...</Text>
              </View>
            )}
          </BlurView>
        </View>
      </Modal>
      
      {/* Completion Modal */}
      <Modal
        visible={completionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <View style={styles.completionContainer}>
          <BlurView intensity={90} tint="light" style={styles.completionBlurView}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Complete Service</Text>
              <TouchableOpacity
                style={styles.completionCloseButton}
                onPress={() => setCompletionModalVisible(false)}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={20} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.completionContent}>
              <View style={styles.completionIconContainer}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={60} 
                  color={theme.colors.success} 
                />
              </View>
              
              <Text style={styles.completionSubtitle}>
                You're about to mark this service as completed
              </Text>
              
              <Text style={styles.completionDescription}>
                Please add any notes about the service completion. The pet owner will be notified that the service has been completed.
              </Text>
              
              <View style={styles.completionNoteContainer}>
                <Text style={styles.completionNoteLabel}>Completion Notes (Optional)</Text>
                <TextInput
                  style={styles.completionNoteInput}
                  placeholder="Add any notes about the completed service..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline={true}
                  numberOfLines={4}
                  value={completionNote}
                  onChangeText={setCompletionNote}
                />
              </View>
              
              <View style={styles.completionButtonContainer}>
                <TouchableOpacity
                  style={styles.completionCancelButton}
                  onPress={() => setCompletionModalVisible(false)}
                  disabled={isSubmittingCompletion}
                >
                  <Text style={styles.completionCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.completionSubmitButton}
                  onPress={handleSubmitCompletion}
                  disabled={isSubmittingCompletion}
                >
                  {isSubmittingCompletion ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.completionSubmitButtonText}>Complete Service</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
      
      {/* Cancellation Modal */}
      <Modal
        visible={cancellationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCancellationModalVisible(false)}
      >
        <View style={styles.completionContainer}>
          <BlurView intensity={90} tint="light" style={styles.completionBlurView}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Cancel Service</Text>
              <TouchableOpacity
                style={styles.completionCloseButton}
                onPress={() => setCancellationModalVisible(false)}
              >
                <MaterialCommunityIcons 
                  name="close" 
                  size={20} 
                  color={theme.colors.text} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.completionContent}>
              <View style={styles.completionIconContainer}>
                <MaterialCommunityIcons 
                  name="close-circle" 
                  size={60} 
                  color={theme.colors.error} 
                />
              </View>
              
              <Text style={styles.completionSubtitle}>
                You're about to cancel this service
              </Text>
              
              <Text style={styles.completionDescription}>
                Please provide a reason for cancellation. The pet owner will be notified that the service has been cancelled.
              </Text>
              
              <View style={styles.completionNoteContainer}>
                <Text style={styles.completionNoteLabel}>Cancellation Reason</Text>
                <TextInput
                  style={styles.completionNoteInput}
                  placeholder="Please explain why you're cancelling this service..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline={true}
                  numberOfLines={4}
                  value={cancellationReason}
                  onChangeText={setCancellationReason}
                />
              </View>
              
              <View style={styles.completionButtonContainer}>
                <TouchableOpacity
                  style={styles.completionCancelButton}
                  onPress={() => setCancellationModalVisible(false)}
                  disabled={isSubmittingCancellation}
                >
                  <Text style={styles.completionCancelButtonText}>Back</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.completionSubmitButton, { backgroundColor: theme.colors.error }]}
                  onPress={handleSubmitCancellation}
                  disabled={isSubmittingCancellation}
                >
                  {isSubmittingCancellation ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.completionSubmitButtonText}>Cancel Service</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceTypeText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  requestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 16,
  },
  creditsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginRight: 4,
  },
  creditsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  requesterCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  requesterAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  requesterInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  requesterName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  scheduleCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  notesCard: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    marginRight: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  acceptButton: {
    flex: 2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  actionButtonsColumn: {
    width: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  messageButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  messageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageIcon: {
    marginRight: 6,
  },
  messageButtonText: {
    fontSize: 16,
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
    zIndex: 10,
  },
  updatingText: {
    fontSize: 16,
    color: theme.colors.text,
    marginTop: 16,
    fontWeight: '600',
  },
  
  // Completion Modal Styles
  completionContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  completionBlurView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  completionCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContent: {
    padding: 20,
  },
  completionIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  completionSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  completionDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  completionNoteContainer: {
    marginBottom: 24,
  },
  completionNoteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  completionNoteInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    textAlignVertical: 'top',
  },
  completionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 12,
    alignItems: 'center',
  },
  completionCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  completionSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
  },
  completionSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});