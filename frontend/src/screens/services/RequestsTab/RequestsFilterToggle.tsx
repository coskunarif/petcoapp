import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';

const { width: screenWidth } = Dimensions.get('window');
const width = Math.min(screenWidth, 600); // Cap the width for large screens
const isMobile = screenWidth < 600;

interface RequestsFilterToggleProps {
  asProvider: boolean;
  onToggle: (asProvider: boolean) => void;
}

export default function RequestsFilterToggle({ asProvider, onToggle }: RequestsFilterToggleProps) {
  // Animation references
  const slideAnim = useRef(new Animated.Value(asProvider ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Effect to ensure slideAnim value is in sync with asProvider prop on mount
  useEffect(() => {
    slideAnim.setValue(asProvider ? 0 : 1);
  }, []);

  useEffect(() => {
    // Initial entrance animation
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    // Set initial position immediately to avoid flicker on first render
    slideAnim.setValue(asProvider ? 0 : 1);

    // Animate slider when selection changes (smoother animation)
    Animated.spring(slideAnim, {
      toValue: asProvider ? 0 : 1,
      friction: 10,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [asProvider]);
  
  // Calculate the position of the active slider
  // Use the actual width instead of a fixed value
  const buttonWidth = (width - 32) / 2;
  const sliderPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, buttonWidth], // Use actual button width
  });
  
  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <BlurView intensity={25} tint="light" style={styles.blurContainer}>
        <View style={styles.toggleContainer}>
          {/* Active Indicator */}
          <Animated.View
            style={[
              styles.activeIndicator,
              {
                transform: [{ translateX: sliderPosition }],
                width: buttonWidth, // Use calculated buttonWidth
              }
            ]}
          />
          
          {/* Toggle Buttons */}
          <TouchableOpacity
            style={[
              styles.tabContainer,
              styles.leftTab,
              { width: buttonWidth }
            ]}
            onPress={() => onToggle(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="account-tie" 
              size={16} 
              color={asProvider ? "#FFFFFF" : theme.colors.textSecondary} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              asProvider && styles.activeTabText
            ]}>
              As Provider
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabContainer,
              styles.rightTab,
              { width: buttonWidth }
            ]}
            onPress={() => onToggle(false)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name="account" 
              size={16} 
              color={!asProvider ? "#FFFFFF" : theme.colors.textSecondary} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabText,
              !asProvider && styles.activeTabText
            ]}>
              As Requester
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...theme.elevation.medium,
  },
  toggleContainer: {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    height: 44,
  },
  activeIndicator: {
    position: 'absolute',
    height: '100%',
    // Width is set dynamically in the component
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    ...theme.elevation.small,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    // Width is calculated in the component
    zIndex: 2,
  },
  leftTab: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  rightTab: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});