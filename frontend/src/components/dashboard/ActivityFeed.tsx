import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';

// Mock data for activity feed
const mockActivities = [
  {
    id: '1',
    type: 'service_booked',
    title: 'Booked Dog Walking',
    description: 'You booked a dog walking service with Jane Doe',
    time: '2 hours ago',
    icon: 'walk',
    color: '#66BB6A', // Green
    role: 'owner',
  },
  {
    id: '2',
    type: 'service_completed',
    title: 'Pet Sitting Completed',
    description: 'Pet sitting service for Max was completed',
    time: '1 day ago',
    icon: 'home',
    color: '#42A5F5', // Blue
    role: 'owner',
  },
  {
    id: '3',
    type: 'request_received',
    title: 'New Service Request',
    description: 'You received a request for dog grooming',
    time: '2 days ago',
    icon: 'scissors-cutting',
    color: '#FFA726', // Orange
    role: 'provider',
  },
  {
    id: '4',
    type: 'payment_received',
    title: 'Payment Received',
    description: 'You received $35 for dog walking service',
    time: '3 days ago',
    icon: 'cash',
    color: '#9C27B0', // Purple
    role: 'provider',
  },
];

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  role: 'owner' | 'provider';
}

interface ActivityFeedProps {
  activeRole: 'owner' | 'provider';
  onItemPress?: (item: ActivityItem) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activeRole, onItemPress }) => {
  // Filter activities by role
  const filteredActivities = activeRole === 'all' 
    ? mockActivities 
    : mockActivities.filter(activity => activity.role === activeRole);

  // If there are no activities, show empty state
  if (filteredActivities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="clock-outline" 
          size={40} 
          color={theme.colors.primary} 
        />
        <Text style={styles.emptyTitle}>No recent activity</Text>
        <Text style={styles.emptySubtitle}>
          {activeRole === 'owner' 
            ? 'Your recent pet care activities will appear here' 
            : 'Your recent service activities will appear here'}
        </Text>
      </View>
    );
  }

  // Render each activity item
  const renderItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity 
      style={styles.activityItem}
      onPress={() => onItemPress && onItemPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={filteredActivities}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.elevation.small,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  activityTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    marginBottom: 2,
  },
  activityDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  activityTime: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
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

export default ActivityFeed;