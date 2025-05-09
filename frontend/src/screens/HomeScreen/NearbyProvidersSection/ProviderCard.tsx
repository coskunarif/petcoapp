import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { theme } from '../../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Import fallback avatar URL to avoid require() errors
import defaultAvatarUrl from '../../../../assets/default-avatar';

interface Props {
  provider: any;
  onPress: () => void;
}

const ProviderCard: React.FC<Props> = ({ provider, onPress }) => {
  try {
    // Create a fallback image source if the provider's profile image is not available
    const imageSource = provider.profile_image_url 
      ? { uri: provider.profile_image_url } 
      : { uri: defaultAvatarUrl };
      
    // Format services for display
    const servicesList = provider.serviceTypes?.slice(0, 3)?.join(' • ') || 'No services listed';
    
    return (
      <Animated.View style={styles.container}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={onPress}
          activeOpacity={0.96}
          accessibilityLabel={`View ${provider.name}'s profile`}
        >
          <View style={styles.avatarContainer}>
            <Image 
              source={imageSource} 
              style={styles.avatar} 
              resizeMode="cover" 
            />
            <View style={styles.statusIndicator} />
          </View>
          
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{provider.name}</Text>
              <MaterialCommunityIcons 
                name="check-decagram" 
                size={18} 
                color={theme.colors.secondary} 
                style={styles.verifiedIcon}
              />
            </View>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.primary} />
                <Text style={styles.distance}>{provider.distance.toFixed(1)} km</Text>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
              </View>
            </View>
            
            <Text style={styles.services} numberOfLines={1} ellipsizeMode="tail">
              {servicesList}
            </Text>

            <View style={styles.availabilityContainer}>
              {provider.availability && provider.availability.map((day: string, index: number) => (
                <View key={index} style={styles.availabilityBadge}>
                  <Text style={styles.availabilityText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.colors.textTertiary}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  } catch (err) {
    console.error('[ProviderCard] Error rendering provider card:', err);
    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>Error displaying provider</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 24,
    ...theme.elevation.medium,
  },
  card: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...theme.typography.h3,
    marginRight: 6,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  distance: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 3,
  },
  rating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    marginLeft: 3,
  },
  services: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginBottom: 8,
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  availabilityBadge: {
    backgroundColor: 'rgba(108,99,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 8,
  },
  errorCard: {
    backgroundColor: 'rgba(255,200,200,0.2)',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});

export default ProviderCard;