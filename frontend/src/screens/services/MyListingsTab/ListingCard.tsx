import React, { useRef, useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  View, 
  Text,
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';
import { ServiceListing } from '../../../types/services';
import { servicesService } from '../../../services/servicesService';

interface ListingCardProps {
  listing: ServiceListing;
  index?: number;
  onRefresh?: () => void;
  onEdit?: () => void;
}

export default function ListingCard({ listing, index = 0, onRefresh, onEdit }: ListingCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Animation values - only use native driver compatible values
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

  // Simplified press animations that only use native driver
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
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  // Get status display
  const getStatusInfo = (isActive: boolean) => {
    if (isActive) {
      return {
        label: 'Active',
        color: theme.colors.success
      };
    } else {
      return {
        label: 'Paused',
        color: theme.colors.textTertiary
      };
    }
  };

  const statusInfo = getStatusInfo(listing.is_active);
  
  // Handle edit button press
  const handleEditPress = () => {
    // Close the menu
    setMenuVisible(false);
    
    // Log the action
    console.log('Edit pressed for listing:', listing.id);
    
    // If an edit handler was provided, call it
    if (onEdit) {
      onEdit();
    } else {
      // Fallback for demo purposes
      Alert.alert(
        'Edit Listing',
        `Would edit listing "${listing.title}"`,
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle pause/unpause button press
  const handlePauseToggle = async () => {
    try {
      setIsUpdating(true);
      setMenuVisible(false);
      
      // Toggle the is_active status
      const newStatus = !listing.is_active;
      
      // Call the service to update the listing
      const result = await servicesService.updateListing(listing.id, {
        is_active: newStatus
      });
      
      if (result.error) {
        throw new Error(String(result.error));
      }
      
      // Refresh the listings
      if (onRefresh) {
        onRefresh();
      }
      
      // Show success message
      Alert.alert(
        'Success',
        `Listing ${newStatus ? 'activated' : 'paused'} successfully`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error toggling listing status:', error);
      Alert.alert(
        'Error',
        `Failed to update listing: ${error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle delete button press
  const handleDelete = async () => {
    try {
      setMenuVisible(false);
      
      // Show confirmation dialog
      Alert.alert(
        'Delete Listing',
        'Are you sure you want to delete this listing? This action cannot be undone.',
        [
          { 
            text: 'Cancel', 
            style: 'cancel' 
          },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              setIsUpdating(true);
              
              // Delete the listing (soft delete by default)
              const result = await servicesService.removeListing(listing.id);
              
              if (result.error) {
                throw new Error(String(result.error));
              }
              
              // Refresh the listings
              if (onRefresh) {
                onRefresh();
              }
              
              // Show success message
              Alert.alert(
                'Success',
                'Listing deleted successfully',
                [{ text: 'OK' }]
              );
              
              setIsUpdating(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting listing:', error);
      Alert.alert(
        'Error',
        `Failed to delete listing: ${error}`,
        [{ text: 'OK' }]
      );
      setIsUpdating(false);
    }
  };

  // Static shadow styling only for better performance
  const platformShadow = Platform.OS === 'android' ? {
    elevation: 4,
  } : {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  };

  // Get service type name and icon
  const serviceTypeName = listing.service_type?.name || 'Service';
  const serviceTypeIcon = listing.service_type?.icon || 'paw';
  
  // Get metrics data
  const price = listing.price || listing.service_type?.credit_value || 30;
  
  // Extract rating and bookings from service stats (would normally come from API)
  const rating = 4.8; // In a real app, calculate from reviews
  const bookings = 14; // In a real app, get from completed requests

  return (
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
          }
        ]}
      >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.cardTouchable}
        disabled={isUpdating}
      >
        <BlurView intensity={85} tint="light" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            {/* Header with type, status and menu */}
            <View style={styles.cardHeader}>
              <View style={styles.typeContainer}>
                <LinearGradient
                  colors={['rgba(108, 99, 255, 0.25)', 'rgba(108, 99, 255, 0.10)']}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons 
                    name={serviceTypeIcon as keyof typeof MaterialCommunityIcons.glyphMap} 
                    size={16} 
                    color={theme.colors.primary} 
                  />
                </LinearGradient>
                <Text style={styles.serviceType}>{serviceTypeName}</Text>
              </View>
              
              <View style={styles.headerRight}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusInfo.color}20` }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: statusInfo.color }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: statusInfo.color }
                  ]}>
                    {statusInfo.label}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.menuButton} 
                  onPress={toggleMenu}
                  disabled={isUpdating}
                >
                  <MaterialCommunityIcons 
                    name="dots-vertical" 
                    size={20} 
                    color={theme.colors.textTertiary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Service Title */}
            <Text style={styles.serviceTitle}>
              {listing.title}
            </Text>
            
            {/* Description */}
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {listing.description}
            </Text>
            
            {/* Footer with metrics */}
            <View style={styles.cardFooter}>
              <View style={styles.metricItem}>
                <MaterialCommunityIcons 
                  name="currency-usd" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.metricValue}>{price}</Text>
                <Text style={styles.metricLabel}>credits</Text>
              </View>
              
              <View style={styles.metricItem}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.metricValue}>{rating}</Text>
                <Text style={styles.metricLabel}>rating</Text>
              </View>
              
              <View style={styles.metricItem}>
                <MaterialCommunityIcons 
                  name="calendar-check" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.metricValue}>{bookings}</Text>
                <Text style={styles.metricLabel}>bookings</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditPress}
                disabled={isUpdating}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
      
      {/* Menu dropdown - conditionally rendered */}
      {menuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleEditPress}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons 
              name="pencil" 
              size={16} 
              color={theme.colors.text} 
              style={styles.menuIcon} 
            />
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handlePauseToggle}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons 
              name={listing.is_active ? 'pause-circle' : 'play-circle'} 
              size={16} 
              color={listing.is_active ? theme.colors.warning : theme.colors.success} 
              style={styles.menuIcon} 
            />
            <Text style={styles.menuText}>
              {listing.is_active ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleDelete}
            disabled={isUpdating}
          >
            <MaterialCommunityIcons 
              name="trash-can" 
              size={16} 
              color={theme.colors.error} 
              style={styles.menuIcon} 
            />
            <Text style={[styles.menuText, { color: theme.colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Loading indicator */}
      {isUpdating && (
        <View style={styles.loadingOverlay}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
          <MaterialCommunityIcons 
            name="sync" 
            size={24} 
            color={theme.colors.primary}
            style={{ opacity: 0.8 }}
          />
        </View>
      )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 20,
    borderRadius: 24,
  },
  cardContainer: {
    borderRadius: 24,
    position: 'relative',
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  serviceType: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  menuButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
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
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    ...theme.elevation.medium,
    zIndex: 10,
    overflow: 'hidden',
    width: 140,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuIcon: {
    marginRight: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 20,
  },
});