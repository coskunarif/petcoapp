import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface Props {
  onCreateRequestPress: () => void;
  onOfferServicePress: () => void;
}

const QuickActionsSection: React.FC<Props> = ({ onCreateRequestPress, onOfferServicePress }) => {
  try {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Quick Actions</Text>
        </View>
      
        <View style={styles.buttonsContainer}>
          <Animated.View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.requestBtn]} 
              onPress={onCreateRequestPress}
              activeOpacity={0.85}
              accessibilityLabel="Request a pet service"
            >
              <View style={[styles.iconContainer, styles.requestIconContainer]}>
                <MaterialCommunityIcons name="paw" size={24} color="#fff" />
              </View>
              <Text style={styles.label}>Request Service</Text>
              <Text style={styles.description}>Find care for your pet</Text>
              <MaterialCommunityIcons 
                name="arrow-right" 
                size={20} 
                color={theme.colors.primary}
                style={styles.arrowIcon} 
              />
            </TouchableOpacity>
          </Animated.View>
        
          <Animated.View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.offerBtn]} 
              onPress={onOfferServicePress}
              activeOpacity={0.85}
              accessibilityLabel="Offer a pet service"
            >
              <View style={[styles.iconContainer, styles.offerIconContainer]}>
                <MaterialCommunityIcons name="hand-heart" size={24} color="#fff" />
              </View>
              <Text style={styles.label}>Offer Service</Text>
              <Text style={styles.description}>Become a pet caregiver</Text>
              <MaterialCommunityIcons 
                name="arrow-right" 
                size={20} 
                color={theme.colors.secondary}
                style={styles.arrowIcon} 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  } catch (err) {
    console.error('[QuickActionsSection] Error rendering quick actions:', err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error displaying quick actions</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    ...theme.typography.h2,
    marginBottom: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.medium,
    ...theme.elevation.medium,
  },
  actionBtn: {
    borderRadius: theme.borderRadius.medium,
    padding: 20,
    minHeight: 160,
    justifyContent: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  requestBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  offerBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  requestIconContainer: {
    backgroundColor: theme.colors.primary,
    ...theme.elevation.small,
  },
  offerIconContainer: {
    backgroundColor: theme.colors.secondary,
    ...theme.elevation.small,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 18,
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  errorContainer: {
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

export default QuickActionsSection;