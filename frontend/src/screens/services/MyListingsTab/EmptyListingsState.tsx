import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';

const { width } = Dimensions.get('window');

export default function EmptyListingsState() {
  return (
    <View style={styles.container}>
      <BlurView intensity={40} tint="light" style={styles.blurContainer}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(108, 99, 255, 0.2)', 'rgba(108, 99, 255, 0.05)']}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons 
              name="clipboard-plus" 
              size={50} 
              color={theme.colors.primary}
              style={styles.icon}
            />
          </LinearGradient>
        </View>
        
        <Text style={styles.title}>No Active Listings</Text>
        <Text style={styles.description}>
          Create your first service listing and start offering your pet care services to others.
        </Text>
        
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <TouchableOpacity style={styles.button}>
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Create New Listing</Text>
          </TouchableOpacity>
        </LinearGradient>
        
        <TouchableOpacity style={styles.helpButton}>
          <MaterialCommunityIcons name="help-circle-outline" size={16} color={theme.colors.primary} style={styles.helpIcon} />
          <Text style={styles.helpText}>How do listings work?</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32,
  },
  blurContainer: {
    width: '100%',
    maxWidth: 420,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...theme.elevation.medium,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.small,
  },
  icon: {
    opacity: 0.9,
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonGradient: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 16,
    ...theme.elevation.small,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpIcon: {
    marginRight: 6,
  },
  helpText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
