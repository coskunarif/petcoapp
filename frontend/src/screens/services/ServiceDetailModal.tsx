import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Image,
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
import { AppButton, StatusBadge } from '../../components/ui';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedService } from '../../redux/slices/serviceSlice';
import type { ServiceListing } from '../../types/services';
import { servicesService } from '../../services/servicesService';
import { RootState } from '../../redux/store';
import { format } from 'date-fns';

const { height } = Dimensions.get('window');

interface ServiceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  serviceId?: string;
}

const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ 
  visible, 
  onClose, 
  serviceId 
}) => {
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const dispatch = useDispatch();
  
  // Get data from Redux with safe selectors
  const service = useSelector((state: RootState) => {
    const id = state.services?.selectedServiceId;
    return id ? state.services?.listings?.find(listing => listing.id === id) : null;
  });
  const user = useSelector((state: RootState) => state.auth?.user);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Set the service ID when it changes
  useEffect(() => {
    if (serviceId) {
      dispatch(setSelectedService(serviceId));
    }
  }, [serviceId, dispatch]);
  
  useEffect(() => {
    if (visible) {
      // Reset animation values when modal becomes visible
      slideAnim.setValue(height);
      opacityAnim.setValue(0);
      
      // Reset state
      setRequestError(null);
      
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
      onClose();
      // Clear selected service after modal is closed
      setTimeout(() => dispatch(setSelectedService(null)), 300);
    });
  };
  
  const handleRequestService = async () => {
    if (!service || !user?.id) return;
    
    setRequesting(true);
    setRequestError(null);
    
    try {
      const { data, error } = await servicesService.createRequest({
        requester_id: user.id,
        provider_id: service.provider_id,
        service_type_id: service.service_type_id,
        service_listing_id: service.id,
        title: `Request for ${service.title}`,
        notes: `Service requested: ${service.title}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      if (error) {
        setRequestError(typeof error === 'string' ? error : 'Failed to create service request');
        console.error('[ServiceDetailModal] Error creating service request:', error);
      } else {
        // Success - show confirmation and close modal
        Alert.alert(
          'Request Sent',
          'Your service request has been sent to the provider.',
          [{ text: 'OK', onPress: handleClose }]
        );
      }
    } catch (err) {
      console.error('[ServiceDetailModal] Exception creating service request:', err);
      setRequestError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setRequesting(false);
    }
  };
  
  const handleMessageProvider = () => {
    // Implement navigation to chat with provider
    handleClose();
    // Here you would navigate to the chat screen
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
            
            {!service ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading service details...</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Service Header */}
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceTypeContainer}>
                    <LinearGradient
                      colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                      style={styles.iconBackground}
                    >
                      <MaterialCommunityIcons 
                        name={service.service_type?.icon || "paw"} 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                    </LinearGradient>
                    <Text style={styles.serviceType}>{service.service_type?.name}</Text>
                    <StatusBadge 
                      status={service.is_active ? "active" : "inactive"} 
                      size="small" 
                      style={styles.statusBadge} 
                    />
                  </View>
                  
                  <Text style={styles.serviceTitle}>{service.title || 'Untitled Service'}</Text>
                </View>
                
                {/* Provider Info */}
                <BlurView intensity={15} tint="light" style={styles.providerCard}>
                  <View style={styles.providerImageContainer}>
                    {service.provider?.profile_image_url ? (
                      <Image 
                        source={{ uri: service.provider.profile_image_url }} 
                        style={styles.providerImage} 
                      />
                    ) : (
                      <LinearGradient
                        colors={['rgba(108, 99, 255, 0.3)', 'rgba(108, 99, 255, 0.1)']}
                        style={styles.providerImagePlaceholder}
                      >
                        <Text style={styles.providerInitial}>
                          {service.provider?.full_name?.charAt(0) || 'P'}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>
                      {service.provider?.full_name || 'Provider'}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>4.8</Text>
                      <Text style={styles.reviewCount}>(24 reviews)</Text>
                      <TouchableOpacity style={styles.viewProfileButton}>
                        <Text style={styles.viewProfileText}>View Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
                
                {/* Description */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About this service</Text>
                  <Text style={styles.descriptionText}>
                    {service.description || 'No description provided.'}
                  </Text>
                </View>
                
                {/* Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  
                  <BlurView intensity={15} tint="light" style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                      <LinearGradient
                        colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.1)']}
                        style={styles.detailIconContainer}
                      >
                        <MaterialCommunityIcons 
                          name="calendar-range" 
                          size={18} 
                          color={theme.colors.primary} 
                        />
                      </LinearGradient>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Availability</Text>
                        <Text style={styles.detailText}>
                          {service.availability_schedule?.notes || 
                           (service.availability_schedule?.days ? 
                             `${service.availability_schedule.days.join(', ')} - ${service.availability_schedule.hours || 'Flexible hours'}` : 
                             'Flexible schedule')}
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
                          name="map-marker" 
                          size={18} 
                          color={theme.colors.primary} 
                        />
                      </LinearGradient>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailText}>
                          {service.location?.address || 'Near you'}
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
                          name="currency-usd" 
                          size={18} 
                          color={theme.colors.primary} 
                        />
                      </LinearGradient>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Price</Text>
                        <Text style={styles.detailText}>
                          {service.price ? 
                            `${service.price} credits per session` : 
                            `${service.service_type?.credit_value || 30} credits per session`}
                        </Text>
                      </View>
                    </View>
                  </BlurView>
                </View>
                
                {/* Error message */}
                {requestError && (
                  <View style={styles.errorContainer}>
                    <MaterialCommunityIcons 
                      name="alert-circle" 
                      size={16} 
                      color="#d32f2f" 
                    />
                    <Text style={styles.errorText}>{requestError}</Text>
                  </View>
                )}
                
                {/* Actions */}
                <View style={styles.actionButtons}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.requestGradient,
                      requesting && { opacity: 0.7 }
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.requestButton}
                      onPress={handleRequestService}
                      disabled={requesting || service.provider_id === user?.id}
                    >
                      {requesting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : service.provider_id === user?.id ? (
                        <Text style={styles.buttonText}>Your Service</Text>
                      ) : (
                        <>
                          <MaterialCommunityIcons 
                            name="check-circle-outline" 
                            size={18} 
                            color="#FFFFFF" 
                            style={styles.buttonIcon}
                          />
                          <Text style={styles.buttonText}>Request Service</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </LinearGradient>
                  
                  {service.provider_id !== user?.id && (
                    <TouchableOpacity
                      style={styles.messageButton}
                      onPress={handleMessageProvider}
                      disabled={requesting}
                    >
                      <MaterialCommunityIcons 
                        name="chat-outline" 
                        size={18} 
                        color={theme.colors.primary} 
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.messageButtonText}>Message Provider</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20, // Extra padding for iOS devices with home indicator
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
  serviceHeader: {
    marginBottom: 24,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  serviceType: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
    marginRight: 10,
  },
  statusBadge: {
    marginLeft: 4,
  },
  serviceTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  providerImageContainer: {
    marginRight: 16,
  },
  providerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  providerImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  providerInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingText: {
    fontWeight: '700',
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  viewProfileButton: {
    marginTop: 6,
  },
  viewProfileText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  detailsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
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
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  requestGradient: {
    borderRadius: 16,
    marginBottom: 12,
    ...theme.elevation.medium,
  },
  requestButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  messageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryLight,
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
  messageButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ServiceDetailModal;
