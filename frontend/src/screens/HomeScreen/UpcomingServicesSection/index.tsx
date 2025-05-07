import React from 'react';
import { View, Text, FlatList, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ServiceCard from './ServiceCard';
import { theme } from '../../../theme';

interface Props {
  services: { asProvider: any[]; asRequester: any[] };
  onServicePress: (service: any) => void;
}

const UpcomingServicesSection: React.FC<Props> = ({ services, onServicePress }) => {
  try {
    const allServices = [...(services.asProvider || []), ...(services.asRequester || [])];
    
    // Sort services by date (closest first)
    const sortedServices = [...allServices].sort((a, b) => {
      const dateA = new Date(a.start_time).getTime();
      const dateB = new Date(b.start_time).getTime();
      return dateA - dateB;
    });
    
    if (sortedServices.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <MaterialCommunityIcons name="calendar-blank" size={40} color={theme.colors.primary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No upcoming services</Text>
            <Text style={styles.emptyDescription}>
              Your scheduled pet services will appear here
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <Animated.View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Upcoming Services</Text>
          <Text style={styles.subtitle}>{sortedServices.length} scheduled</Text>
        </View>
        
        <FlatList
          horizontal
          data={sortedServices}
          keyExtractor={item => item.id || `service-${Math.random()}`}
          renderItem={({ item }) => (
            <ServiceCard service={item} onPress={() => onServicePress(item)} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          decelerationRate="fast"
          snapToAlignment="start"
          snapToInterval={276} // Card width + horizontal margin
        />
      </Animated.View>
    );
  } catch (err) {
    console.error('[UpcomingServicesSection] Error rendering section:', err);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error displaying upcoming services</Text>
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
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    ...theme.typography.h2,
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 4,
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

export default UpcomingServicesSection;