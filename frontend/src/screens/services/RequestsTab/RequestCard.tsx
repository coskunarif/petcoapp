import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  View, 
  Text,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import RequestDetailModal from '../RequestDetailModal';

interface RequestCardProps {
  request: any;
  index?: number;
}

export default function RequestCard({ request, index = 0 }: RequestCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Entrance animation
  useEffect(() => {
    const delay = index * 150; // Stagger animation based on index
    
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

  // Platform-specific shadow styling
  const platformShadow = Platform.OS === 'android' ? {
    elevation: 4,
  } : {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
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
              // No shadow properties on animated component
            }
          ]}
      >
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.cardTouchable}
        >
          <BlurView intensity={80} tint="light" style={styles.cardBlur}>
            <View style={styles.statusIndicator} />
            
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
              {/* Request Type with Icon */}
              <View style={styles.typeContainer}>
                <LinearGradient
                  colors={[`${request.color || '#7FBCFF'}30`, `${request.color || '#7FBCFF'}10`]}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons 
                    name={request.icon || "calendar-check"} 
                    size={18} 
                    color={request.color || theme.colors.primary} 
                  />
                </LinearGradient>
                <Text style={styles.typeText}>{request.type}</Text>
              </View>
              
              {/* Request Title */}
              <Text style={styles.requestTitle}>{request.title}</Text>
              
              {/* Request Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons 
                    name="account" 
                    size={14} 
                    color={theme.colors.textSecondary} 
                  />
                  <Text style={styles.detailText}>
                    {request.requester}
                  </Text>
                </View>
                
                <View style={styles.detailDivider} />
                
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={14} 
                    color={theme.colors.textSecondary} 
                  />
                  <Text style={styles.detailText}>
                    {formatDate(request.date)}
                  </Text>
                </View>
              </View>
              
              {/* Description Preview */}
              {request.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {request.description}
                </Text>
              )}
              
              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    { backgroundColor: `${statusColor}10` }
                  ]}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={[styles.actionText, { color: statusColor }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
                
                {request.status === 'pending' && (
                  <TouchableOpacity style={styles.iconButton}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.primaryDark]}
                      style={styles.iconButtonGradient}
                    >
                      <MaterialCommunityIcons 
                        name="check" 
                        size={18} 
                        color="#FFFFFF" 
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
        </Animated.View>
      </View>
      
      <RequestDetailModal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)} 
        request={request} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
    borderRadius: 24,
    // Shadow styling is applied programmatically via platformShadow
  },
  cardContainer: {
    borderRadius: 24,
    position: 'relative',
    // Shadow properties removed from animated component
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
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 10,
    paddingRight: 60, // Space for status badge
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 12,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconButton: {
    overflow: 'hidden',
    borderRadius: 16,
    ...theme.elevation.small,
  },
  iconButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
