import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { LinearGradient } from 'expo-linear-gradient';
import PetPhotoGallery from '../../components/pets/PetPhotoGallery';

// Interface for route params
interface PetPhotoParams {
  pet: {
    id: string;
    name: string;
    photos?: string[];
    photoUri?: string;
  };
  onSave: (photos: string[], mainPhotoIndex: number) => void;
}

// Types for navigation
type PetPhotoNavigationProp = StackNavigationProp<any, 'PetPhoto'>;
type PetPhotoRouteProp = RouteProp<{ PetPhoto: PetPhotoParams }, 'PetPhoto'>;

interface PetPhotoScreenProps {
  navigation: PetPhotoNavigationProp;
  route: PetPhotoRouteProp;
}

const PetPhotoScreen: React.FC<PetPhotoScreenProps> = ({ navigation, route }) => {
  const { pet, onSave } = route.params;
  
  // Initialize photos state from pet data
  const [photos, setPhotos] = useState<string[]>(() => {
    const photoList: string[] = [];
    
    // Add main photo if it exists
    if (pet.photoUri) {
      photoList.push(pet.photoUri);
    }
    
    // Add additional photos if they exist
    if (pet.photos) {
      photoList.push(...pet.photos);
    }
    
    return photoList;
  });
  
  // Track the main photo index
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  
  // Handle adding a new photo
  const handleAddPhoto = useCallback((uri: string) => {
    setPhotos(current => [...current, uri]);
  }, []);
  
  // Handle removing a photo
  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos(current => {
      const updated = [...current];
      updated.splice(index, 1);
      
      // Adjust main photo index if needed
      if (index === mainPhotoIndex) {
        setMainPhotoIndex(0); // Reset to first photo if main photo was removed
      } else if (index < mainPhotoIndex) {
        setMainPhotoIndex(prev => prev - 1); // Shift index down if a photo before main was removed
      }
      
      return updated;
    });
  }, [mainPhotoIndex]);
  
  // Save changes and navigate back
  const handleSave = () => {
    if (photos.length === 0) {
      Alert.alert(
        'No Photos',
        'Your pet should have at least one photo. Please add a photo before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Call the onSave callback with updated photos
    onSave(photos, mainPhotoIndex);
    
    // Navigate back
    navigation.goBack();
  };
  
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['rgba(236, 240, 253, 0.8)', 'rgba(252, 252, 252, 0.8)']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pet.name}'s Photos</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Gallery Component */}
          <PetPhotoGallery
            photos={photos}
            onPhotoAdded={handleAddPhoto}
            onPhotoRemoved={handleRemovePhoto}
            mainPhotoIndex={mainPhotoIndex}
            onSetMainPhoto={setMainPhotoIndex}
            maxPhotos={10}
          />
          
          {/* Gallery Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Photo Tips</Text>
            <View style={styles.instructionItem}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.instructionText}>
                Add clear, well-lit photos of your pet
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.instructionText}>
                The first photo will be used as your pet's profile picture
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.instructionText}>
                You can add up to 10 photos for your pet
              </Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Save Button */}
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Photos</Text>
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
    backgroundColor: '#f9f9f9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerTitle: {
    ...theme.typography.h2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    ...theme.elevation.small,
  },
  instructionsTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  footerContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  saveButton: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  saveButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...theme.typography.button,
    color: 'white',
    fontWeight: '700',
  },
});

export default PetPhotoScreen;