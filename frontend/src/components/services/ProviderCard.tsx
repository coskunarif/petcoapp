import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface ProviderCardProps {
  provider: {
    id: string;
    full_name: string;
    profile_image_url?: string | null;
    rating?: number;
    services_count?: number;
    description?: string;
    distance?: number; // miles
    specialties?: { id: string; name: string; icon: string }[];
    is_available?: boolean;
    total_reviews?: number;
  };
  onPress?: () => void;
  style?: any;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onPress, style }) => {
  // Animation states
  const [scale] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);
  
  // Handle press in animation
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsPressed(true);
  };
  
  // Handle press out animation
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsPressed(false);
  };
  
  // Generate initials if no profile image
  const initials = provider.full_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Render specialty badges
  const renderSpecialties = () => {
    // Limit to first 3 specialties with a +X more indicator if needed
    const displaySpecialties = provider.specialties?.slice(0, 3) || [];
    const remainingCount = (provider.specialties?.length || 0) - 3;
    
    return (
      <View style={styles.specialtiesContainer}>
        {displaySpecialties.map((specialty, index) => (
          <View key={specialty.id} style={styles.specialtyBadge}>
            <MaterialCommunityIcons
              name={specialty.icon as any}
              size={14}
              color={theme.colors.primary}
            />
            <Text style={styles.specialtyText}>{specialty.name}</Text>
          </View>
        ))}
        
        {remainingCount > 0 && (
          <View style={styles.specialtyBadge}>
            <Text style={styles.specialtyText}>+{remainingCount} more</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        isPressed ? styles.containerPressed : null,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <BlurView intensity={70} tint="light" style={styles.blurView}>
          <View style={styles.content}>
            {/* Provider Info Row */}
            <View style={styles.topRow}>
              {/* Avatar/Image */}
              <View style={styles.avatarContainer}>
                {provider.profile_image_url ? (
                  <Image
                    source={{ uri: provider.profile_image_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    style={styles.initialsContainer}
                  >
                    <Text style={styles.initials}>{initials}</Text>
                  </LinearGradient>
                )}
              </View>
              
              {/* Name and Rating */}
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{provider.full_name}</Text>
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons
                    name="star"
                    size={16}
                    color="#FFB400"
                  />
                  <Text style={styles.rating}>
                    {provider.rating?.toFixed(1) || '5.0'}
                  </Text>
                  <Text style={styles.reviewCount}>
                    ({provider.total_reviews || 0} reviews)
                  </Text>
                  
                  {provider.is_available && (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            {/* Description */}
            {provider.description && (
              <Text style={styles.description} numberOfLines={2}>
                {provider.description}
              </Text>
            )}
            
            {/* Specialties Row */}
            {provider.specialties && provider.specialties.length > 0 && renderSpecialties()}
            
            {/* Bottom Stats Row */}
            <View style={styles.statsRow}>
              {provider.services_count !== undefined && (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.statText}>
                    {provider.services_count} {provider.services_count === 1 ? 'service' : 'services'}
                  </Text>
                </View>
              )}
              
              {provider.distance !== undefined && (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.statText}>
                    {provider.distance < 1 
                      ? 'Less than 1 mile' 
                      : `${provider.distance.toFixed(1)} miles`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  containerPressed: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  blurView: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  content: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  initialsContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
    color: theme.colors.text,
  },
  reviewCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  availableBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  availableText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});

export default ProviderCard;