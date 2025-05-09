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

const { width } = Dimensions.get('window');
const isMobile = width < 600;

interface RequestsFilterToggleProps {
  asProvider: boolean;
  onToggle: (asProvider: boolean) => void;
}

export default function RequestsFilterToggle({ asProvider, onToggle }: RequestsFilterToggleProps) {
  // Animation references
  const slideAnim = useRef(new Animated.Value(asProvider ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Initial entrance animation
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    // Animate slider when selection changes
    Animated.spring(slideAnim, {
      toValue: asProvider ? 0 : 1,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [asProvider]);
  
  // Calculate the position of the active slider
  const sliderPosition = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50], // Adjust based on the width of your buttons
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
                width: styles.tabContainer.width,
              }
            ]}
          />
          
          {/* Toggle Buttons */}
          <TouchableOpacity 
            style={[styles.tabContainer, styles.leftTab]} 
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
            style={[styles.tabContainer, styles.rightTab]} 
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
    width: width / 2 - 32,
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
    width: (width - 32) / 2,
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