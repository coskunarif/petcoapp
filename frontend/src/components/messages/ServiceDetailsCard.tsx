import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

interface ServiceDetail {
  id: string;
  title: string;
  serviceType: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  price?: number;
  scheduledDate?: string;
  location?: string;
  petName?: string;
  icon?: string;
  color?: string;
  description?: string;
}

interface ServiceDetailsCardProps {
  service: ServiceDetail;
  onViewDetails?: (serviceId: string) => void;
  onMessageProvider?: (serviceId: string, providerId: string) => void;
  onAccept?: (serviceId: string) => void;
  onCancel?: (serviceId: string) => void;
  providerId?: string;
}

const ServiceDetailsCard: React.FC<ServiceDetailsCardProps> = ({
  service,
  onViewDetails,
  onMessageProvider,
  onAccept,
  onCancel,
  providerId
}) => {
  const [expanded, setExpanded] = useState(false);
  const [cardHeight] = useState(new Animated.Value(expanded ? 240 : 120));

  // Toggle expanded state
  const toggleExpanded = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    
    Animated.spring(cardHeight, {
      toValue: newExpandedState ? 240 : 120,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(service.id);
    }
  };
  
  const handleMessageProvider = () => {
    if (onMessageProvider && providerId) {
      onMessageProvider(service.id, providerId);
    }
  };
  
  const handleAccept = () => {
    if (onAccept) {
      onAccept(service.id);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel(service.id);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.colors.primary;
      case 'accepted':
        return '#4CAF50';  // Green
      case 'completed':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return theme.colors.primary;
    }
  };
  
  const getServiceIcon = (serviceType: string): string => {
    // Map service type to icon
    const iconMap: Record<string, string> = {
      'pet_sitting': 'dog-side',
      'grooming': 'scissors-cutting',
      'walking': 'walk',
      'training': 'school-outline',
      'veterinary': 'medical-bag'
    };
    
    return iconMap[serviceType] || service.icon || 'handshake';
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  const statusColor = getStatusColor(service.status);
  const serviceIcon = getServiceIcon(service.serviceType);
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurView}>
        <Animated.View style={[styles.cardContent, { height: cardHeight }]}>
          {/* Header with icon and status */}
          <View style={styles.header}>
            <View style={styles.serviceInfo}>
              <LinearGradient
                colors={[`${statusColor}40`, `${statusColor}15`]}
                style={styles.iconContainer}
              >
                <MaterialCommunityIcons
                  name={serviceIcon}
                  size={20}
                  color={statusColor}
                />
              </LinearGradient>
              
              <View style={styles.titleContainer}>
                <Text style={styles.serviceType}>{service.serviceType}</Text>
                <Text style={styles.serviceTitle} numberOfLines={1}>{service.title}</Text>
              </View>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}25` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </Text>
            </View>
          </View>
          
          {/* Service details */}
          <View style={styles.detailsContainer}>
            {service.scheduledDate && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>
                  {formatDate(service.scheduledDate)}
                </Text>
              </View>
            )}
            
            {service.price !== undefined && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>
                  {formatCurrency(service.price)}
                </Text>
              </View>
            )}
            
            {service.petName && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="paw"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>
                  {service.petName}
                </Text>
              </View>
            )}
            
            {service.location && expanded && (
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color={theme.colors.textSecondary}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {service.location}
                </Text>
              </View>
            )}
            
            {service.description && expanded && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {service.description}
                </Text>
              </View>
            )}
          </View>
          
          {/* Action buttons */}
          {expanded && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleViewDetails}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={16}
                  color="white"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionText}>View Details</Text>
              </TouchableOpacity>
              
              {service.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleAccept}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="white"
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>
              )}
              
              {(service.status === 'pending' || service.status === 'accepted') && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                  onPress={handleCancel}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={16}
                    color="white"
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              {providerId && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                  onPress={handleMessageProvider}
                >
                  <MaterialCommunityIcons
                    name="chat-outline"
                    size={16}
                    color="white"
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionText}>Message</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Expand/collapse toggle */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleExpanded}
          >
            <MaterialCommunityIcons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </Animated.View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  blurView: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  serviceType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 12,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  descriptionContainer: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default ServiceDetailsCard;
