import React, { useRef, useEffect, useState } from 'react';
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

interface ListingCardProps {
  listing: any;
  index?: number;
}

export default function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Animation values - only use native driver compatible values
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // Remove shadowAnim since we're not using it anymore
  
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
    // Only animate scale, which can use native driver
    Animated.spring(scale, { 
      toValue: 0.98, 
      useNativeDriver: true,
      friction: 8,
    }).start();
    
    // Skip shadow animation since we're using static shadow
  };
  
  const handlePressOut = () => {
    // Only animate scale, which can use native driver
    Animated.spring(scale, { 
      toValue: 1, 
      useNativeDriver: true,
      friction: 8,
    }).start();
    
    // Skip shadow animation since we're using static shadow
  };
  
  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };
  
  // No longer using animated shadow properties - removed shadowAnim interpolation
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'paused': return theme.colors.textTertiary;
      default: return theme.colors.textTertiary;
    }
  };

  // We're now using static shadow styling only

  // Static shadow only for Android
  const platformShadow = Platform.OS === 'android' ? {
    elevation: 4,
  } : {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  };

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
            // No shadow properties on animated component
          }
        ]}
      >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.cardTouchable}
      >
        <BlurView intensity={85} tint="light" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            {/* Header with type, status and menu */}
            <View style={styles.cardHeader}>
              <View style={styles.typeContainer}>
                <LinearGradient
                  colors={[`${listing.color || '#7FBCFF'}40`, `${listing.color || '#7FBCFF'}10`]}
                  style={styles.iconContainer}
                >
                  <MaterialCommunityIcons 
                    name={listing.icon || "paw"} 
                    size={16} 
                    color={listing.color || theme.colors.primary} 
                  />
                </LinearGradient>
                <Text style={styles.serviceType}>{listing.type}</Text>
              </View>
              
              <View style={styles.headerRight}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(listing.status)}20` }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(listing.status) }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(listing.status) }
                  ]}>
                    {listing.status}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
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
                <Text style={styles.metricValue}>{listing.price}</Text>
                <Text style={styles.metricLabel}>credits</Text>
              </View>
              
              <View style={styles.metricItem}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.metricValue}>{listing.rating}</Text>
                <Text style={styles.metricLabel}>rating</Text>
              </View>
              
              <View style={styles.metricItem}>
                <MaterialCommunityIcons 
                  name="calendar-check" 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.metricValue}>{listing.bookings}</Text>
                <Text style={styles.metricLabel}>bookings</Text>
              </View>
              
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
      
      {/* Menu dropdown - conditionally rendered */}
      {menuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.text} style={styles.menuIcon} />
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="pause-circle" size={16} color={theme.colors.warning} style={styles.menuIcon} />
            <Text style={styles.menuText}>Pause</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="trash-can" size={16} color={theme.colors.error} style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: theme.colors.error }]}>Delete</Text>
          </TouchableOpacity>
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
    // Shadow styling is applied programmatically via platformShadow
  },
  cardContainer: {
    borderRadius: 24,
    position: 'relative',
    // Shadows moved to outerContainer to avoid animation conflicts
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
});
