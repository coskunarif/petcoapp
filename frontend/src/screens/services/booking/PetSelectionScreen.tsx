import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';

// Mock data for pets
const mockPets = [
  {
    id: 'pet1',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    age: '3 years',
    photoUri: null,
    color: '#6C63FF',
    icon: 'dog',
  },
  {
    id: 'pet2',
    name: 'Whiskers',
    species: 'cat',
    breed: 'Maine Coon',
    age: '5 years',
    photoUri: null,
    color: '#FF6384',
    icon: 'cat',
  },
  {
    id: 'pet3',
    name: 'Tweety',
    species: 'bird',
    breed: 'Canary',
    age: '1 year',
    photoUri: null,
    color: '#FFCE56',
    icon: 'bird',
  },
  {
    id: 'pet4',
    name: 'Hoppy',
    species: 'rabbit',
    breed: 'Dutch',
    age: '2 years',
    photoUri: null,
    color: '#36A2EB',
    icon: 'rabbit',
  },
];

// Route params interface
interface PetSelectionParams {
  serviceId: string;
  providerId: string;
  dateTime: {
    date: string;
    time: {
      hour: number;
      minute: number;
      display: string;
    };
  };
}

type PetSelectionRouteProp = RouteProp<{ PetSelection: PetSelectionParams }, 'PetSelection'>;
type PetSelectionNavigationProp = StackNavigationProp<any, 'PetSelection'>;

interface PetSelectionScreenProps {
  route: PetSelectionRouteProp;
  navigation: PetSelectionNavigationProp;
}

const PetSelectionScreen: React.FC<PetSelectionScreenProps> = ({
  route,
  navigation,
}) => {
  const { serviceId, providerId, dateTime } = route.params;
  
  // State for pets and selection
  const [pets, setPets] = useState(mockPets);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  
  // Calculate the date object from dateTime prop
  const [dateObj] = useState(() => {
    const [year, month, day] = dateTime.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(dateTime.time.hour);
    date.setMinutes(dateTime.time.minute);
    return date;
  });
  
  // Format the date for display
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Format the time for display
  const formattedTime = dateTime.time.display;
  
  // Handle pet selection
  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
  };
  
  // Handle continuing to the next step
  const handleContinue = () => {
    if (selectedPetId) {
      const selectedPet = pets.find(pet => pet.id === selectedPetId);
      
      if (selectedPet) {
        // Navigate to the booking confirmation screen
        navigation.navigate('BookingConfirmation', {
          serviceId,
          providerId,
          dateTime,
          pet: selectedPet,
          notes,
        });
      }
    } else {
      Alert.alert('Selection Required', 'Please select a pet for this service.');
    }
  };
  
  // Check if continue button should be enabled
  const isContinueEnabled = !!selectedPetId;
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your Pet</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Time Summary */}
          <View style={styles.timelineCard}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconCompleted]}>
                <MaterialCommunityIcons name="calendar-check" size={20} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Date & Time</Text>
                <Text style={styles.timelineDetail}>{formattedDate} at {formattedTime}</Text>
              </View>
              <TouchableOpacity
                style={styles.timelineEditButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timelineSeparator} />
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconActive]}>
                <MaterialCommunityIcons name="paw" size={20} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Pet Selection</Text>
                <Text style={styles.timelineDetail}>Choose which pet needs this service</Text>
              </View>
            </View>
            
            <View style={styles.timelineSeparator} />
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, styles.timelineIconInactive]}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={theme.colors.textTertiary} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, styles.timelineTitleInactive]}>Confirmation</Text>
                <Text style={[styles.timelineDetail, styles.timelineDetailInactive]}>Review and confirm booking</Text>
              </View>
            </View>
          </View>
          
          {/* Pet Selection */}
          <Text style={styles.sectionTitle}>Your Pets</Text>
          
          <View style={styles.petsContainer}>
            {pets.map(pet => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.petCard,
                  selectedPetId === pet.id && styles.petCardSelected,
                ]}
                onPress={() => handleSelectPet(pet.id)}
              >
                <View style={styles.petSelectIndicator}>
                  <View
                    style={[
                      styles.petSelectCircle,
                      selectedPetId === pet.id && styles.petSelectCircleSelected,
                    ]}
                  >
                    {selectedPetId === pet.id && (
                      <MaterialCommunityIcons name="check" size={14} color="white" />
                    )}
                  </View>
                </View>
                
                <View style={[styles.petPhotoContainer, { backgroundColor: `${pet.color}20` }]}>
                  {pet.photoUri ? (
                    <Image source={{ uri: pet.photoUri }} style={styles.petPhoto} />
                  ) : (
                    <MaterialCommunityIcons
                      name={pet.icon as any}
                      size={30}
                      color={pet.color}
                    />
                  )}
                </View>
                
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* No Pets */}
          {pets.length === 0 && (
            <View style={styles.noPetsContainer}>
              <MaterialCommunityIcons name="paw" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.noPetsText}>You don't have any pets added yet</Text>
              <TouchableOpacity
                style={styles.addPetButton}
                onPress={() => navigation.navigate('Tabs', { screen: 'PetOwner' })}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.addPetButtonGradient}
                >
                  <Text style={styles.addPetButtonText}>Add a Pet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Special Instructions */}
          {selectedPetId && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
              <TouchableOpacity
                style={styles.notesButton}
                onPress={() => {
                  // In a real app, navigate to a notes screen or show a modal
                  Alert.alert(
                    'Special Instructions',
                    'In a real app, this would open a text input for special instructions.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <MaterialCommunityIcons name="text-box-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.notesButtonText}>Add Special Instructions</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        
        {/* Footer with Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isContinueEnabled && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isContinueEnabled}
          >
            <LinearGradient
              colors={
                isContinueEnabled
                  ? [theme.colors.primary, theme.colors.primaryDark]
                  : ['#CCCCCC', '#AAAAAA']
              }
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    ...theme.elevation.small,
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineIconCompleted: {
    backgroundColor: theme.colors.success,
  },
  timelineIconActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineIconInactive: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineTitleInactive: {
    color: theme.colors.textTertiary,
  },
  timelineDetail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  timelineDetailInactive: {
    color: theme.colors.textTertiary,
  },
  timelineEditButton: {
    padding: 8,
  },
  timelineSeparator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginLeft: 18,
    marginVertical: 4,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: 16,
  },
  petsContainer: {
    marginBottom: 24,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  petCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
  petSelectIndicator: {
    marginRight: 12,
  },
  petSelectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petSelectCircleSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  petPhotoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...theme.elevation.small,
  },
  petPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  petBreed: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  noPetsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
    ...theme.elevation.small,
  },
  noPetsText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  addPetButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addPetButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPetButtonText: {
    ...theme.typography.button,
    color: 'white',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...theme.elevation.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  notesButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  continueButtonText: {
    ...theme.typography.button,
    color: 'white',
    marginRight: 8,
  },
});

export default PetSelectionScreen;