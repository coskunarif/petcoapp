import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { theme } from '../../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Import fallback pet image URL to avoid require() errors
import defaultPetUrl from '../../../../assets/default-pet';

interface Props {
  service: any;
  onPress: () => void;
}

const ServiceCard: React.FC<Props> = ({ service, onPress }) => {
  try {
    // Format the date for display
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (err) {
        console.warn(`[ServiceCard] Error formatting date ${dateString}:`, err);
        return dateString; // Return original if parsing fails
      }
    };

    // Get the formatted start time
    const formattedTime = service.start_time ? formatDate(service.start_time) : 'No time specified';
    
    // Create a fallback image source if the pet's image is not available
    const imageSource = service.pets?.image_url 
      ? { uri: service.pets.image_url } 
      : { uri: defaultPetUrl };
      
    // Get the appropriate status icon and color
    const getStatusInfo = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'pending':
          return { 
            icon: 'clock-outline', 
            color: '#FFB300',
            label: 'Pending'
          };
        case 'accepted':
          return { 
            icon: 'check-circle-outline', 
            color: '#4CAF50',
            label: 'Accepted'
          };
        case 'completed':
          return { 
            icon: 'check-all', 
            color: '#2196F3',
            label: 'Completed'
          };
        case 'cancelled':
          return { 
            icon: 'close-circle-outline', 
            color: '#F44336',
            label: 'Cancelled'
          };
        default:
          return { 
            icon: 'help-circle-outline', 
            color: '#757575',
            label: status || 'Unknown'
          };
      }
    };
    
    const statusInfo = getStatusInfo(service.status);
    
    return (
      <Animated.View style={styles.container}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={onPress}
          activeOpacity={0.95}
          accessibilityLabel={`Service for ${service.pets?.name || 'pet'}, ${statusInfo.label}`}
        >
          <View style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <Image 
                source={imageSource} 
                style={styles.petImage} 
                resizeMode="cover"
              />
              {service.service_types?.icon && (
                <View style={styles.serviceIconContainer}>
                  <MaterialCommunityIcons 
                    name={service.service_types.icon || "paw"} 
                    size={16} 
                    color="#fff" 
                  />
                </View>
              )}
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.petName} numberOfLines={1}>
                {service.pets?.name || 'Unnamed Pet'}
              </Text>
              
              <Text style={styles.serviceType} numberOfLines={1}>
                {service.service_types?.name || 'Pet Service'}
              </Text>
              
              <View style={styles.timeRow}>
                <MaterialCommunityIcons name="calendar-clock" size={14} color={theme.colors.secondary} />
                <Text style={styles.timeText}>{formattedTime}</Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
                <MaterialCommunityIcons name={statusInfo.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={14} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  } catch (err) {
    console.error('[ServiceCard] Error rendering service card:', err);
    return (
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>Error displaying service</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 24,
    ...theme.elevation.medium,
  },
  card: {
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardContent: {
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  petImage: {
    width: '100%',
    height: 130,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
  },
  serviceIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  petName: {
    ...theme.typography.h3,
    marginBottom: 2,
  },
  serviceType: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 5,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  errorCard: {
    backgroundColor: 'rgba(255,200,200,0.2)',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    width: 220,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});

export default ServiceCard;