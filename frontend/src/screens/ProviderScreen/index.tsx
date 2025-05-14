import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, globalStyles } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProviderScreen() {
  const [activeTab, setActiveTab] = useState('myListings');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'myListings':
        return (
          <View style={styles.tabContent}>
            <View style={globalStyles.emptyStateContainer}>
              <MaterialCommunityIcons 
                name="store-outline" 
                size={40} 
                color={theme.colors.primary} 
              />
              <Text style={globalStyles.emptyStateText}>No service listings yet</Text>
              <Text style={globalStyles.emptyStateSubText}>
                Create your first pet care service listing to start earning
              </Text>
              <View style={globalStyles.button}>
                <Text style={globalStyles.buttonText}>Create Listing</Text>
              </View>
            </View>
          </View>
        );
      case 'requests':
        return (
          <View style={styles.tabContent}>
            <View style={globalStyles.emptyStateContainer}>
              <MaterialCommunityIcons 
                name="inbox-outline" 
                size={40} 
                color={theme.colors.primary} 
              />
              <Text style={globalStyles.emptyStateText}>No incoming requests</Text>
              <Text style={globalStyles.emptyStateSubText}>
                Service requests from pet owners will appear here
              </Text>
            </View>
          </View>
        );
      case 'earnings':
        return (
          <View style={styles.tabContent}>
            <View style={globalStyles.emptyStateContainer}>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={40} 
                color={theme.colors.primary} 
              />
              <Text style={globalStyles.emptyStateText}>No earnings yet</Text>
              <Text style={globalStyles.emptyStateSubText}>
                Your earnings from providing services will appear here
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Provider</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabButtonsContainer}>
            <View 
              style={[
                styles.tabButton, 
                activeTab === 'myListings' && styles.activeTabButton
              ]}
              onTouchEnd={() => setActiveTab('myListings')}
            >
              <MaterialCommunityIcons 
                name="store-outline" 
                size={20} 
                color={activeTab === 'myListings' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText, 
                  activeTab === 'myListings' && styles.activeTabButtonText
                ]}
              >
                My Listings
              </Text>
            </View>
            
            <View 
              style={[
                styles.tabButton, 
                activeTab === 'requests' && styles.activeTabButton
              ]}
              onTouchEnd={() => setActiveTab('requests')}
            >
              <MaterialCommunityIcons 
                name="inbox-outline" 
                size={20} 
                color={activeTab === 'requests' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText, 
                  activeTab === 'requests' && styles.activeTabButtonText
                ]}
              >
                Requests
              </Text>
            </View>
            
            <View 
              style={[
                styles.tabButton, 
                activeTab === 'earnings' && styles.activeTabButton
              ]}
              onTouchEnd={() => setActiveTab('earnings')}
            >
              <MaterialCommunityIcons 
                name="chart-line" 
                size={20} 
                color={activeTab === 'earnings' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText, 
                  activeTab === 'earnings' && styles.activeTabButtonText
                ]}
              >
                Earnings
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      
      <ScrollView style={styles.container}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginRight: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
  },
  tabContent: {
    padding: theme.spacing.md,
  },
});