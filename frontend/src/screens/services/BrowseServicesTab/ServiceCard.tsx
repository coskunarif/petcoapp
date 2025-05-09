import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Animated, 
  Pressable, 
  View, 
  Text,
  TouchableOpacity,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import { StatusBadge } from '../../../components/ui';
import ServiceDetailModal from '../ServiceDetailModal';

interface ServiceCardProps {
  service: any;
  index?: number;
  onPress?: () => void;
}

export default function ServiceCard({ service, index = 0, onPress }: ServiceCardProps) {
  // Log service data to debug potential issues
  useEffect(() => {
    console.log('[ServiceCard] Rendering card with service:', {
      id: service?.id,
      title: service?.title,
      hasProvider: !!service?.provider,
      hasServiceType: !!service?.service_type,
      index
    });
  }, [service]);
  
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation values - keep all animations either native OR JS driven, not mixed
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // Remove shadowAnim as we'll handle shadow differently
  
  // Track if card is pressed for static shadow changes
  const [isPressed, setIsPressed] = useState(false);
  
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
    // Only animate scale with native driver
    Animated.spring(scale, { 
      toValue: 0.97, 
      useNativeDriver: true,
      friction: 8,
    }).start();
    
    // Use state to track press for shadow styles
    setIsPressed(true);
  };
  
  const handlePressOut = () => {
    // Only animate scale with native driver
    Animated.spring(scale, { 
      toValue: 1, 
      useNativeDriver: true,
      friction: 8,
    }).start();
    
    // Use state to track press for shadow styles
    setIsPressed(false);
  };
  
  const handlePress = () => {
    setModalVisible(true);
    if (onPress) onPress();
  };

  return (
    <>
      <Animated.View
        style={[
          styles.cardContainer,
          isPressed ? styles.cardContainerPressed : null,
          {
            opacity,
            transform: [
              { translateY },
              { scale }
            ],
            // Remove animated shadow properties that cause errors
          }
        ]}
      >
        {/* Card Border - makes the card distinct and prevents blending with background */}
        <View style={styles.cardBorderWrapper}>
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.cardTouchable}
            accessible={true}
            accessibilityLabel={`Service: ${service.title || service.name || 'Untitled Service'}`}
            accessibilityRole="button"
            accessibilityHint="Opens service details"
          >
            <BlurView intensity={85} tint="light" style={styles.cardBlur}>
              <View style={styles.cardContent}>
                {/* Visual Indicator at top of card to help with visibility */}
                <View style={styles.cardIndicator} />
                
                {/* Header with service type and status */}
                <View style={styles.cardHeader}>
                  <View style={styles.typeContainer}>
                    <LinearGradient
                      colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.08)']}
                      style={styles.iconContainer}
                    >
                      <MaterialCommunityIcons 
                        name={service.service_type?.icon || "paw"} 
                        size={16} 
                        color={theme.colors.primary} 
                      />
                    </LinearGradient>
                    <Text style={styles.serviceType}>
                      {service.service_type?.name || 'Service'}
                    </Text>
                  </View>
                  <StatusBadge status="active" size="small" />
                </View>
                
                {/* Service Title */}
                <Text style={styles.serviceTitle}>
                  {service.title || service.name || 'Untitled Service'}
                </Text>
                
                {/* Description */}
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description || 'No description available.'}
                </Text>
                
                {/* Footer with provider and price */}
                <View style={styles.cardFooter}>
                  <View style={styles.providerContainer}>
                    <View style={styles.providerAvatar}>
                      <Text style={styles.providerInitial}>
                        {service.provider?.full_name?.charAt(0) || 'P'}
                      </Text>
                    </View>
                    <Text style={styles.providerName}>
                      {service.provider?.full_name || 'Provider'}
                    </Text>
                  </View>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceValue}>
                      {service.service_type?.credit_value || 30}
                    </Text>
                    <Text style={styles.priceLabel}>credits</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ServiceDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        serviceId={service.id} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 24,
    borderRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1, // Make sure cards are visible
  },
  cardContainerPressed: {
    // Use static shadow values when pressed instead of animated ones
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  cardBorderWrapper: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden', 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Adds solid background to prevent transparency issues
  },
  cardTouchable: {
    borderRadius: 22, // Account for the border width
    overflow: 'hidden',
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: 22, // Account for the border width
  },
  cardContent: {
    padding: 18,
    paddingTop: 14, // Reduced for indicator
  },
  cardIndicator: {
    height: 4,
    width: 40,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginBottom: 12,
    alignSelf: 'center',
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  serviceType: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  serviceDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  providerInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
});
