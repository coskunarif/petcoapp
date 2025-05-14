import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { theme, globalStyles } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import TodaySchedule from '../../components/dashboard/TodaySchedule';

export default function DashboardScreen() {
  // State for role toggle - in a real app this would be from Redux
  const [activeRole, setActiveRole] = useState<'owner' | 'provider'>('owner');
  const navigation = useNavigation();
  
  // Get current time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

  // Navigate to screens
  const goToPetOwner = () => navigation.navigate('PetOwner' as never);
  const goToProvider = () => navigation.navigate('Provider' as never);
  const goToMessages = () => navigation.navigate('Messages' as never);
  
  // Toggle active role
  const toggleRole = () => {
    setActiveRole(activeRole === 'owner' ? 'provider' : 'owner');
  };
  
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.subtitle}>Here's your pet care summary</Text>
            </View>
            <TouchableOpacity onPress={toggleRole} style={styles.roleToggle}>
              <LinearGradient
                colors={
                  activeRole === 'owner' 
                    ? ['#66BB6A', '#43A047'] // Green for owner
                    : ['#FFA726', '#FB8C00'] // Orange for provider
                }
                style={styles.roleToggleGradient}
              >
                <MaterialCommunityIcons 
                  name={activeRole === 'owner' ? 'dog' : 'handshake'} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.roleToggleText}>
                  {activeRole === 'owner' ? 'Pet Owner' : 'Provider'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.section}>
          <Text style={globalStyles.sectionHeader}>
            {activeRole === 'owner' ? 'Your Pet Care' : 'Your Services'} Today
          </Text>
          <TodaySchedule activeRole={activeRole} />
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={globalStyles.sectionHeader}>Recent Activity</Text>
          <View style={globalStyles.card}>
            <ActivityFeed activeRole={activeRole} />
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={globalStyles.sectionHeader}>Quick Actions</Text>
          
          {/* Show different actions based on active role */}
          {activeRole === 'owner' ? (
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={goToPetOwner}
              >
                <MaterialCommunityIcons 
                  name="dog" 
                  size={28} 
                  color="#66BB6A" // Green
                />
                <Text style={styles.quickActionText}>Add Pet</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={goToPetOwner}
              >
                <MaterialCommunityIcons 
                  name="magnify" 
                  size={28} 
                  color="#42A5F5" // Blue
                />
                <Text style={styles.quickActionText}>Find Services</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={toggleRole}
              >
                <MaterialCommunityIcons 
                  name="swap-horizontal" 
                  size={28} 
                  color="#FFA726" // Orange
                />
                <Text style={styles.quickActionText}>Switch to Provider</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={goToMessages}
              >
                <MaterialCommunityIcons 
                  name="chat" 
                  size={28} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.quickActionText}>Messages</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={goToProvider}
              >
                <MaterialCommunityIcons 
                  name="store-plus" 
                  size={28} 
                  color="#FFA726" // Orange
                />
                <Text style={styles.quickActionText}>Create Listing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={goToProvider}
              >
                <MaterialCommunityIcons 
                  name="inbox" 
                  size={28} 
                  color="#42A5F5" // Blue
                />
                <Text style={styles.quickActionText}>View Requests</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={toggleRole}
              >
                <MaterialCommunityIcons 
                  name="swap-horizontal" 
                  size={28} 
                  color="#66BB6A" // Green
                />
                <Text style={styles.quickActionText}>Switch to Owner</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={goToMessages}
              >
                <MaterialCommunityIcons 
                  name="chart-bar" 
                  size={28} 
                  color="#9C27B0" // Purple
                />
                <Text style={styles.quickActionText}>Earnings</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  roleToggle: {
    marginLeft: theme.spacing.sm,
  },
  roleToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.pill,
    ...theme.elevation.small,
  },
  roleToggleText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyStateText: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
  },
  emptyStateSubText: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.elevation.small,
  },
  quickActionText: {
    ...theme.typography.label,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});