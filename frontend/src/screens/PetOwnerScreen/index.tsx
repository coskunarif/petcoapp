import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme, globalStyles } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PetList from '../../components/pets/PetList';
import AddPetModal from '../../components/pets/AddPetModal';

export default function PetOwnerScreen() {
  const [activeTab, setActiveTab] = useState('myPets');
  const [addPetModalVisible, setAddPetModalVisible] = useState(false);
  const navigation = useNavigation();

  // Handler for pet press
  const handlePetPress = (pet: any) => {
    navigation.navigate('PetDetail', { pet });
  };

  // Handler for add pet press
  const handleAddPetPress = () => {
    setAddPetModalVisible(true);
  };

  // Handler for pet form submission
  const handleAddPetSubmit = (petData: any) => {
    console.log('New pet data:', petData);
    // In a real app, this would save the pet data to the backend
    Alert.alert(
      'Pet Added',
      `${petData.name} has been added to your pets`,
      [{ text: 'OK' }]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'myPets':
        return (
          <View style={styles.tabContent}>
            <PetList onPetPress={handlePetPress} onAddPetPress={handleAddPetPress} />
          </View>
        );
      case 'findServices':
        return (
          <View style={styles.tabContent}>
            <View style={globalStyles.emptyStateContainer}>
              <MaterialCommunityIcons 
                name="magnify" 
                size={40} 
                color={theme.colors.primary} 
              />
              <Text style={globalStyles.emptyStateText}>Find the perfect pet care</Text>
              <Text style={globalStyles.emptyStateSubText}>
                Browse services from trusted pet care providers
              </Text>
            </View>
          </View>
        );
      case 'myRequests':
        return (
          <View style={styles.tabContent}>
            <View style={globalStyles.emptyStateContainer}>
              <MaterialCommunityIcons 
                name="clipboard-list-outline" 
                size={40} 
                color={theme.colors.primary} 
              />
              <Text style={globalStyles.emptyStateText}>No active requests</Text>
              <Text style={globalStyles.emptyStateSubText}>
                Your service requests will appear here
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
        <Text style={styles.headerTitle}>Pet Owner</Text>
      </View>
      
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabButtonsContainer}>
            <View 
              style={[
                styles.tabButton, 
                activeTab === 'myPets' && styles.activeTabButton
              ]}
              onTouchEnd={() => setActiveTab('myPets')}
            >
              <MaterialCommunityIcons 
                name="dog" 
                size={20} 
                color={activeTab === 'myPets' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText, 
                  activeTab === 'myPets' && styles.activeTabButtonText
                ]}
              >
                My Pets
              </Text>
            </View>
            
            <View 
              style={[
                styles.tabButton, 
                activeTab === 'findServices' && styles.activeTabButton
              ]}
              onTouchEnd={() => setActiveTab('findServices')}
            >
              <MaterialCommunityIcons 
                name="magnify" 
                size={20} 
                color={activeTab === 'findServices' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText, 
                  activeTab === 'findServices' && styles.activeTabButtonText
                ]}
              >
                Find Services
              </Text>
            </View>
            
            <View 
              style={[
                styles.tabButton, 
                activeTab === 'myRequests' && styles.activeTabButton
              ]}
              onTouchEnd={() => setActiveTab('myRequests')}
            >
              <MaterialCommunityIcons 
                name="clipboard-list-outline" 
                size={20} 
                color={activeTab === 'myRequests' ? theme.colors.primary : theme.colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText, 
                  activeTab === 'myRequests' && styles.activeTabButtonText
                ]}
              >
                My Requests
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      
      <ScrollView style={styles.container}>
        {renderTabContent()}
      </ScrollView>

      {/* Add Pet Modal */}
      <AddPetModal
        visible={addPetModalVisible}
        onClose={() => setAddPetModalVisible(false)}
        onSubmit={handleAddPetSubmit}
      />
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