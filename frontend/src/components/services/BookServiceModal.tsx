import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

const { height } = Dimensions.get('window');

interface BookServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onStartBooking: (serviceId: string, providerId: string) => void;
  service: {
    id: string;
    title: string;
    description: string;
    service_type: {
      id: string;
      name: string;
      icon: string;
      credit_value: number;
    };
    provider: {
      id: string;
      full_name: string;
      profile_image_url?: string | null;
      rating?: number;
    };
  };
}

const BookServiceModal: React.FC<BookServiceModalProps> = ({
  visible,
  onClose,
  onStartBooking,
  service,
}) => {
  // Animation value for modal slide up
  const [slideAnim] = useState(new Animated.Value(height));
  
  // Handle animation when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);
  
  // Calculate modal content height (75% of screen height)
  const modalHeight = height * 0.75;
  
  // Handle begin booking process
  const handleStartBooking = () => {
    onStartBooking(service.id, service.provider.id);
    onClose();
  };
  
  // Format credits with proper currency symbol
  const formatCredits = (amount: number) => {
    return `${amount} credits`;
  };
  
  // Render star rating
  const renderRating = (rating?: number) => {
    const stars = [];
    const displayRating = rating || 5; // Default to 5 if no rating
    
    for (let i = 1; i <= 5; i++) {
      let starName: string;
      if (i <= displayRating) {
        starName = 'star';
      } else if (i - 0.5 <= displayRating) {
        starName = 'star-half-full';
      } else {
        starName = 'star-outline';
      }
      
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={starName}
          size={16}
          color="#FFB400"
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
      </View>
    );
  };
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 60} style={StyleSheet.absoluteFill} tint="dark" />
          
          {/* Content container with animation */}
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.contentContainer,
                { 
                  height: modalHeight,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              {/* Header Gradient */}
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.1)', 'rgba(108, 99, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
                style={styles.headerGradient}
              >
                <View style={styles.handle} />
                
                <Text style={styles.title}>Book Service</Text>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                >
                  <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </LinearGradient>
              
              {/* Content Scroll */}
              <ScrollView 
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
              >
                {/* Service Info */}
                <View style={styles.serviceInfoSection}>
                  <View style={styles.serviceBadge}>
                    <MaterialCommunityIcons
                      name={service.service_type.icon}
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.serviceBadgeText}>
                      {service.service_type.name}
                    </Text>
                  </View>
                  
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                
                {/* Pricing Card */}
                <View style={styles.pricingCard}>
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Service Fee</Text>
                    <Text style={styles.pricingValue}>
                      {formatCredits(service.service_type.credit_value)}
                    </Text>
                  </View>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabelBold}>Total</Text>
                    <Text style={styles.pricingValueBold}>
                      {formatCredits(service.service_type.credit_value)}
                    </Text>
                  </View>
                </View>
                
                {/* Provider Info */}
                <View style={styles.providerSection}>
                  <Text style={styles.sectionTitle}>Service Provider</Text>
                  
                  <View style={styles.providerCard}>
                    <View style={styles.providerAvatarContainer}>
                      {service.provider.profile_image_url ? (
                        <View style={styles.providerAvatar}>
                          {/* If you have an Image component, you can use it here */}
                          <Text style={styles.providerInitial}>
                            {service.provider.full_name.charAt(0)}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.providerAvatar}>
                          <Text style={styles.providerInitial}>
                            {service.provider.full_name.charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.providerInfo}>
                      <Text style={styles.providerName}>{service.provider.full_name}</Text>
                      
                      <View style={styles.providerRating}>
                        {renderRating(service.provider.rating)}
                      </View>
                    </View>
                  </View>
                </View>
                
                {/* What to Expect */}
                <View style={styles.expectationSection}>
                  <Text style={styles.sectionTitle}>What to Expect</Text>
                  
                  <View style={styles.expectationItem}>
                    <MaterialCommunityIcons name="calendar-check" size={24} color={theme.colors.primary} />
                    <View style={styles.expectationText}>
                      <Text style={styles.expectationTitle}>Choose Date & Time</Text>
                      <Text style={styles.expectationDescription}>
                        Select when you'd like the service to be performed
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.expectationItem}>
                    <MaterialCommunityIcons name="paw" size={24} color={theme.colors.primary} />
                    <View style={styles.expectationText}>
                      <Text style={styles.expectationTitle}>Select Your Pet</Text>
                      <Text style={styles.expectationDescription}>
                        Choose which of your pets needs this service
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.expectationItem}>
                    <MaterialCommunityIcons name="credit-card-outline" size={24} color={theme.colors.primary} />
                    <View style={styles.expectationText}>
                      <Text style={styles.expectationTitle}>Confirm & Pay</Text>
                      <Text style={styles.expectationDescription}>
                        Review your booking details and complete payment
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
              
              {/* Action Button */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleStartBooking}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonText}>Continue</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 8,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  serviceInfoSection: {
    marginBottom: 24,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  serviceBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceTitle: {
    ...theme.typography.h2,
    marginBottom: 8,
  },
  serviceDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  pricingCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.1)',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  pricingValue: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  pricingLabelBold: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pricingValueBold: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 8,
  },
  providerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: 12,
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  providerAvatarContainer: {
    marginRight: 16,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInitial: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  providerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expectationSection: {
    marginBottom: 24,
  },
  expectationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  expectationText: {
    flex: 1,
    marginLeft: 16,
  },
  expectationTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  expectationDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionButtonText: {
    ...theme.typography.button,
    color: 'white',
    marginRight: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});

export default BookServiceModal;