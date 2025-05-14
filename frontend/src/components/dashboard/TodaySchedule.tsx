import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for today's schedule
const mockOwnerSchedule = [
  {
    id: '1',
    type: 'dog_walking',
    title: 'Dog Walking - Max',
    time: '2:00 PM - 3:00 PM',
    provider: 'Jane Smith',
    status: 'upcoming',
    color: '#66BB6A', // Green
    icon: 'walk',
  },
  {
    id: '2',
    type: 'grooming',
    title: 'Grooming - Bella',
    time: '5:00 PM - 6:30 PM',
    provider: 'Pet Salon',
    status: 'upcoming',
    color: '#42A5F5', // Blue
    icon: 'scissors-cutting',
  },
];

const mockProviderSchedule = [
  {
    id: '1',
    type: 'dog_walking',
    title: 'Dog Walking',
    time: '2:00 PM - 3:00 PM',
    client: 'John Doe',
    pet: 'Max (Golden Retriever)',
    status: 'upcoming',
    color: '#FFA726', // Orange
    icon: 'walk',
  },
  {
    id: '2',
    type: 'pet_sitting',
    title: 'Pet Sitting',
    time: '7:00 PM - 9:00 PM',
    client: 'Sarah Jones',
    pet: 'Mittens (Cat)',
    status: 'upcoming',
    color: '#9C27B0', // Purple
    icon: 'home',
  },
];

interface ScheduleItem {
  id: string;
  type: string;
  title: string;
  time: string;
  provider?: string;
  client?: string;
  pet?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  color: string;
  icon: string;
}

interface TodayScheduleProps {
  activeRole: 'owner' | 'provider';
  onItemPress?: (item: ScheduleItem) => void;
}

const TodaySchedule: React.FC<TodayScheduleProps> = ({ activeRole, onItemPress }) => {
  // Get schedule based on active role
  const scheduleData = activeRole === 'owner' ? mockOwnerSchedule : mockProviderSchedule;

  // If there are no scheduled items, show empty state
  if (scheduleData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="calendar-blank" 
          size={40} 
          color={activeRole === 'owner' ? '#66BB6A' : '#FFA726'} 
        />
        <Text style={styles.emptyTitle}>
          {activeRole === 'owner' ? 'No scheduled pet care' : 'No services scheduled'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {activeRole === 'owner' 
            ? 'Your scheduled pet care services will appear here' 
            : 'Services you need to provide today will appear here'}
        </Text>
      </View>
    );
  }

  // Render owner schedule items
  const renderOwnerScheduleItem = (item: ScheduleItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.scheduleItem}
      onPress={() => onItemPress && onItemPress(item)}
    >
      <LinearGradient
        colors={[`${item.color}20`, `${item.color}10`]}
        style={styles.scheduleItemGradient}
      >
        <View style={styles.scheduleHeader}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
          </View>
          <Text style={styles.scheduleTime}>{item.time}</Text>
        </View>
        <Text style={styles.scheduleTitle}>{item.title}</Text>
        {item.provider && (
          <Text style={styles.scheduleProvider}>Provider: {item.provider}</Text>
        )}
        <View style={styles.scheduleFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${item.color}30` }]}>
            <Text style={[styles.statusText, { color: item.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render provider schedule items
  const renderProviderScheduleItem = (item: ScheduleItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.scheduleItem}
      onPress={() => onItemPress && onItemPress(item)}
    >
      <LinearGradient
        colors={[`${item.color}20`, `${item.color}10`]}
        style={styles.scheduleItemGradient}
      >
        <View style={styles.scheduleHeader}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
          </View>
          <Text style={styles.scheduleTime}>{item.time}</Text>
        </View>
        <Text style={styles.scheduleTitle}>{item.title}</Text>
        {item.client && (
          <Text style={styles.scheduleClient}>Client: {item.client}</Text>
        )}
        {item.pet && (
          <Text style={styles.schedulePet}>Pet: {item.pet}</Text>
        )}
        <View style={styles.scheduleFooter}>
          <View style={[styles.statusBadge, { backgroundColor: `${item.color}30` }]}>
            <Text style={[styles.statusText, { color: item.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {scheduleData.map(item => 
        activeRole === 'owner' 
          ? renderOwnerScheduleItem(item) 
          : renderProviderScheduleItem(item)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  scheduleItem: {
    width: 250,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  scheduleItemGradient: {
    padding: theme.spacing.md,
    height: '100%',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleTime: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  scheduleTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  scheduleProvider: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  scheduleClient: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  schedulePet: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  scheduleFooter: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

export default TodaySchedule;