import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import EditPetModal from '../../components/pets/EditPetModal';
import DeletePetConfirmModal from '../../components/pets/DeletePetConfirmModal';

// Interface for route params
interface PetDetailParams {
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: string;
    weight?: string;
    photoUri?: string;
    photos?: string[];
    careInstructions?: string;
    color: string;
    icon: string;
  };
}

// Types for navigation
type PetDetailNavigationProp = StackNavigationProp<any, 'PetDetail'>;
type PetDetailRouteProp = RouteProp<{ PetDetail: PetDetailParams }, 'PetDetail'>;

interface PetDetailScreenProps {
  navigation: PetDetailNavigationProp;
  route: PetDetailRouteProp;
}

const PetDetailScreen: React.FC<PetDetailScreenProps> = ({ navigation, route }) => {
  const { pet: initialPet } = route.params;
  
  // State for pet data
  const [pet, setPet] = useState(initialPet);
  
  // State for the active tab
  const [activeTab, setActiveTab] = useState<'info' | 'care' | 'services'>('info');
  
  // State for edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  // State for delete confirmation modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Function to handle editing the pet
  const handleEditPet = () => {
    setEditModalVisible(true);
  };
  
  // Function to handle edit form submission
  const handleEditFormSubmit = (updatedPet: any) => {
    // In a real app, this would update the pet data in the backend
    console.log('Updated pet data:', updatedPet);
    setPet(updatedPet);
    
    Alert.alert(
      'Pet Updated',
      `${updatedPet.name} has been updated successfully`,
      [{ text: 'OK' }]
    );
  };
  
  // Handle navigating to photo management screen
  const handleManagePhotos = () => {
    navigation.navigate('PetPhoto', {
      pet: {
        id: pet.id,
        name: pet.name,
        photoUri: pet.photoUri,
        photos: pet.photos || [],
      },
      onSave: (updatedPhotos, mainPhotoIndex) => {
        // Update the pet with the new photos
        const mainPhoto = updatedPhotos[mainPhotoIndex];
        const otherPhotos = updatedPhotos.filter((_, i) => i !== mainPhotoIndex);
        
        setPet({
          ...pet,
          photoUri: mainPhoto,
          photos: otherPhotos,
        });
        
        Alert.alert(
          'Photos Updated',
          `${pet.name}'s photos have been updated successfully`,
          [{ text: 'OK' }]
        );
      }
    });
  };
  
  // Handle navigating to care instructions screen
  const handleEditCareInstructions = () => {
    navigation.navigate('CareInstructions', {
      pet: {
        id: pet.id,
        name: pet.name,
        careInstructions: pet.careInstructions,
      },
      onSave: (updatedInstructions) => {
        // Update the pet with the new care instructions
        setPet({
          ...pet,
          careInstructions: updatedInstructions,
        });
        
        Alert.alert(
          'Care Instructions Updated',
          `${pet.name}'s care instructions have been updated successfully`,
          [{ text: 'OK' }]
        );
      }
    });
  };

  // Function to handle requesting a service
  const handleRequestService = () => {
    Alert.alert(
      'Request Service',
      'This would open the service request flow',
      [{ text: 'OK' }]
    );
  };
  
  // Function to handle initiating pet deletion
  const handleDeletePet = () => {
    // Show the confirmation modal instead of an alert
    setDeleteModalVisible(true);
  };
  
  // Function to handle confirming pet deletion
  const handleConfirmDelete = () => {
    // In a real app, this would delete from database
    console.log('Deleting pet:', pet.id);
    
    // Close the modal
    setDeleteModalVisible(false);
    
    // Show success message
    Alert.alert(
      'Pet Deleted', 
      `${pet.name} has been removed from your pets`,
      [{ text: 'OK' }]
    );
    
    // Navigate back to the pets list
    navigation.goBack();
  };
  
  // Function to handle canceling pet deletion
  const handleCancelDelete = () => {
    // Just close the modal
    setDeleteModalVisible(false);
  };
  
  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Species</Text>
              <Text style={styles.infoValue}>{pet.species}</Text>
            </View>
            
            {pet.breed && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Breed</Text>
                <Text style={styles.infoValue}>{pet.breed}</Text>
              </View>
            )}
            
            {pet.age && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{pet.age}</Text>
              </View>
            )}
            
            {pet.weight && (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{pet.weight}</Text>
              </View>
            )}
          </View>
        );
        
      case 'care':
        return (
          <View style={styles.tabContent}>
            {pet.careInstructions ? (
              <View style={styles.careContainer}>
                <Text style={styles.careText}>{pet.careInstructions}</Text>
                <TouchableOpacity 
                  style={styles.editCareButton}
                  onPress={handleEditCareInstructions}
                >
                  <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
                  <Text style={styles.editCareButtonText}>Edit Instructions</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyCareContainer}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={40}
                  color={theme.colors.textTertiary}
                />
                <Text style={styles.emptyCareTitle}>No Care Instructions</Text>
                <Text style={styles.emptyCareText}>
                  Add special care instructions, allergies, medication details, or other important information.
                </Text>
                <TouchableOpacity 
                  style={styles.addCareButton}
                  onPress={handleEditCareInstructions}
                >
                  <Text style={styles.addCareButtonText}>Add Care Instructions</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
        
      case 'services':
        return (
          <View style={styles.tabContent}>
            <View style={styles.serviceHistoryContainer}>
              <Text style={styles.serviceHistoryTitle}>Service History</Text>
              <View style={styles.emptyServiceContainer}>
                <MaterialCommunityIcons
                  name="history"
                  size={40}
                  color={theme.colors.textTertiary}
                />
                <Text style={styles.emptyServiceTitle}>No Services Yet</Text>
                <Text style={styles.emptyServiceText}>
                  Book pet care services for {pet.name} and they will appear here.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.requestServiceButton}
                onPress={handleRequestService}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.requestServiceGradient}
                >
                  <Text style={styles.requestServiceText}>Request a Service</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(236, 240, 253, 0.8)', 'rgba(252, 252, 252, 0.8)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header with Back Button */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPet}
          >
            <MaterialCommunityIcons name="pencil" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Pet Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.photoContainer, { backgroundColor: `${pet.color}20` }]}>
            {pet.photoUri ? (
              <Image source={{ uri: pet.photoUri }} style={styles.photo} />
            ) : (
              <MaterialCommunityIcons
                name={pet.icon as any}
                size={60}
                color={pet.color}
              />
            )}
          </View>
          
          <Text style={styles.petName}>{pet.name}</Text>
          
          {pet.breed && (
            <Text style={styles.petBreed}>{pet.breed}</Text>
          )}
          
          <TouchableOpacity 
            style={styles.managePhotosButton}
            onPress={handleManagePhotos}
          >
            <MaterialCommunityIcons name="image-multiple" size={16} color={theme.colors.primary} />
            <Text style={styles.managePhotosText}>Manage Photos</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.activeTab]}
            onPress={() => setActiveTab('info')}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={activeTab === 'info' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}
            >
              Basic Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'care' && styles.activeTab]}
            onPress={() => setActiveTab('care')}
          >
            <MaterialCommunityIcons
              name="medical-bag"
              size={22}
              color={activeTab === 'care' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'care' && styles.activeTabText]}
            >
              Care
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.activeTab]}
            onPress={() => setActiveTab('services')}
          >
            <MaterialCommunityIcons
              name="spa"
              size={22}
              color={activeTab === 'services' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text
              style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}
            >
              Services
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <ScrollView style={styles.contentScrollView}>
          {renderTabContent()}
        </ScrollView>
        
        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePet}
        >
          <Text style={styles.deleteButtonText}>Delete Pet</Text>
        </TouchableOpacity>
        
        {/* Edit Pet Modal */}
        <EditPetModal
          visible={editModalVisible}
          pet={pet}
          onClose={() => setEditModalVisible(false)}
          onSubmit={handleEditFormSubmit}
        />
        
        {/* Delete Pet Confirmation Modal */}
        <DeletePetConfirmModal
          visible={deleteModalVisible}
          petName={pet.name}
          petPhotoUri={pet.photoUri}
          petIcon={pet.icon}
          petColor={pet.color}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  petName: {
    ...theme.typography.h1,
    marginTop: theme.spacing.md,
  },
  petBreed: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  managePhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    marginTop: theme.spacing.md,
  },
  managePhotosText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  contentScrollView: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  careContainer: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    ...theme.elevation.small,
  },
  careText: {
    ...theme.typography.body,
    lineHeight: 22,
  },
  emptyCareContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    ...theme.elevation.small,
  },
  emptyCareTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
  },
  emptyCareText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  addCareButton: {
    backgroundColor: `${theme.colors.primary}15`,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.pill,
  },
  addCareButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  editCareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: `${theme.colors.primary}15`,
  },
  editCareButtonText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceHistoryContainer: {
    paddingBottom: theme.spacing.lg,
  },
  serviceHistoryTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  emptyServiceContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.elevation.small,
  },
  emptyServiceTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
  },
  emptyServiceText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  requestServiceButton: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  requestServiceGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestServiceText: {
    ...theme.typography.body,
    color: 'white',
    fontWeight: '700',
  },
  deleteButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.medium,
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});

export default PetDetailScreen;