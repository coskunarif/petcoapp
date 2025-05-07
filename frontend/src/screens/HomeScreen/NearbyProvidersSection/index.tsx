import React from 'react';
import { View, Text, FlatList, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProviderCard from './ProviderCard';
import { theme } from '../../../theme';

interface Props {
  providers: any[];
  onProviderPress: (provider: any) => void;
}

const NearbyProvidersSection: React.FC<Props> = ({ providers, onProviderPress }) => {
  try {
    if (!providers?.length) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="map-search" size={40} color={theme.colors.primary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No nearby providers</Text>
            <Text style={styles.emptyDescription}>
              We couldn't find any pet service providers in your area
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <Animated.View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Nearby Providers</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View all</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={providers}
          keyExtractor={item => item.userId || `provider-${Math.random()}`}
          renderItem={({ item }) => (
            <ProviderCard provider={item} onPress={() => onProviderPress(item)} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
    );
  } catch (err) {
    console.error('[NearbyProvidersSection] Error rendering section:', err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error displaying providers</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    ...theme.typography.h2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
  listContent: {
    paddingVertical: 4,
  },
  emptyContainer: {
    marginVertical: 24,
    marginHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  emptyContent: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: theme.borderRadius.medium,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(230,230,255,0.5)',
    marginBottom: 8,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  emptyTitle: {
    ...theme.typography.h3,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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

export default NearbyProvidersSection;