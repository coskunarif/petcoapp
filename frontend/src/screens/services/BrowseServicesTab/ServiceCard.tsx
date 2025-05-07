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
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;
  
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
    Animated.parallel([
      Animated.spring(scale, { 
        toValue: 0.97, 
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(shadowAnim, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: false 
      }),
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { 
        toValue: 1, 
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(shadowAnim, { 
        toValue: 0, 
        duration: 200, 
        useNativeDriver: false 
      }),
    ]).start();
  };
  
  const handlePress = () => {
    setModalVisible(true);
    if (onPress) onPress();
  };
  
  // Calculate animated shadow properties
  const shadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.25],
  });
  
  const shadowRadius = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 24],
  });
  
  const shadowOffset = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 8],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity,
            transform: [
              { translateY },
              { scale }
            ],
            shadowOpacity,
            shadowRadius,
            shadowOffset: { width: 0, height: shadowOffset },
          }
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.cardTouchable}
        >
          <BlurView intensity={85} tint="light" style={styles.cardBlur}>
            <View style={styles.cardContent}>
              {/* Header with service type and status */}
              <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                  <LinearGradient
                    colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.08)']}
                    style={styles.iconContainer}
                  >
                    <MaterialCommunityIcons 
                      name={service.service_types?.icon || "paw"} 
                      size={16} 
                      color={theme.colors.primary} 
                    />
                  </LinearGradient>
                  <Text style={styles.serviceType}>
                    {service.service_types?.name || 'Service'}
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
                      {service.users?.full_name?.charAt(0) || 'P'}
                    </Text>
                  </View>
                  <Text style={styles.providerName}>
                    {service.users?.full_name || 'Provider'}
                  </Text>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>
                    {service.service_types?.credit_value || 30}
                  </Text>
                  <Text style={styles.priceLabel}>credits</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
      
      <ServiceDetailModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        service={service} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
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
  cardContent: {
    padding: 18,
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
