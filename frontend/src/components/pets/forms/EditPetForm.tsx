import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../../theme';
import { LinearGradient } from 'expo-linear-gradient';

// Define data for species selection
const petSpecies = [
  { id: 'dog', name: 'Dog', icon: 'dog' },
  { id: 'cat', name: 'Cat', icon: 'cat' },
  { id: 'bird', name: 'Bird', icon: 'bird' },
  { id: 'rabbit', name: 'Rabbit', icon: 'rabbit' },
  { id: 'fish', name: 'Fish', icon: 'fish' },
  { id: 'turtle', name: 'Turtle', icon: 'turtle' },
  { id: 'other', name: 'Other', icon: 'paw' },
];

interface EditPetFormProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: string;
    weight?: string;
    photoUri?: string;
    careInstructions?: string;
  };
  onSubmit: (petData: any) => void;
  onCancel: () => void;
}

const EditPetForm: React.FC<EditPetFormProps> = ({ pet, onSubmit, onCancel }) => {
  // Form state
  const [petName, setPetName] = useState(pet.name || '');
  const [selectedSpecies, setSelectedSpecies] = useState<string>(pet.species || '');
  const [breed, setBreed] = useState(pet.breed || '');
  const [age, setAge] = useState(pet.age || '');
  const [weight, setWeight] = useState(pet.weight || '');
  const [photo, setPhoto] = useState<string | null>(pet.photoUri || null);
  const [careInstructions, setCareInstructions] = useState(pet.careInstructions || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle photo selection
  const handleChoosePhoto = async () => {
    try {
      // Request permission to access the media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant access to your photo library to add pet photos.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Open the image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!pickerResult.canceled) {
        setPhoto(pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      Alert.alert('Error', 'There was an error selecting the photo.');
    }
  };

  // Handle form submission with validation
  const handleSubmit = () => {
    // Reset errors
    const newErrors: { [key: string]: string } = {};
    
    // Validate required fields
    if (!petName.trim()) {
      newErrors.petName = 'Pet name is required';
    }
    
    if (!selectedSpecies) {
      newErrors.species = 'Please select a species';
    }
    
    // Set errors or submit if valid
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Form is valid, submit the data
    onSubmit({
      id: pet.id,
      name: petName,
      species: selectedSpecies,
      breed: breed || undefined,
      age: age || undefined,
      weight: weight || undefined,
      photoUri: photo || undefined,
      careInstructions: careInstructions || undefined,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Edit Pet</Text>
      
      {/* Pet Photo */}
      <View style={styles.photoSection}>
        <TouchableOpacity 
          style={styles.photoContainer}
          onPress={handleChoosePhoto}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={styles.petPhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons 
                name="camera-plus" 
                size={40} 
                color={theme.colors.primary} 
              />
              <Text style={styles.photoPlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Pet Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pet Name*</Text>
        <TextInput
          style={[styles.input, errors.petName && styles.inputError]}
          value={petName}
          onChangeText={setPetName}
          placeholder="Enter your pet's name"
          placeholderTextColor={theme.colors.textTertiary}
        />
        {errors.petName && (
          <Text style={styles.errorText}>{errors.petName}</Text>
        )}
      </View>
      
      {/* Species Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Species*</Text>
        <View style={styles.speciesContainer}>
          {petSpecies.map(species => (
            <TouchableOpacity
              key={species.id}
              style={[
                styles.speciesOption,
                selectedSpecies === species.id && styles.selectedSpeciesOption
              ]}
              onPress={() => setSelectedSpecies(species.id)}
            >
              <MaterialCommunityIcons
                name={species.icon as any}
                size={24}
                color={selectedSpecies === species.id ? 'white' : theme.colors.primary}
              />
              <Text 
                style={[
                  styles.speciesText,
                  selectedSpecies === species.id && styles.selectedSpeciesText
                ]}
              >
                {species.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.species && (
          <Text style={styles.errorText}>{errors.species}</Text>
        )}
      </View>
      
      {/* Breed */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Breed (Optional)</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Enter breed"
          placeholderTextColor={theme.colors.textTertiary}
        />
      </View>
      
      {/* Age and Weight in one row */}
      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.md }]}>
          <Text style={styles.label}>Age (Optional)</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="2 years"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Weight (Optional)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="10 lbs"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
      
      {/* Care Instructions */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Care Instructions (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={careInstructions}
          onChangeText={setCareInstructions}
          placeholder="Special care requirements, allergies, medication, etc."
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          numberOfLines={Platform.OS === 'ios' ? undefined : 4}
          textAlignVertical="top"
        />
      </View>
      
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.submitButtonGradient}
          >
            <Text style={styles.submitButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    ...theme.elevation.small,
  },
  petPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speciesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  speciesOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    margin: 4,
  },
  selectedSpeciesOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  speciesText: {
    ...theme.typography.body,
    fontSize: 14,
    marginLeft: 4,
  },
  selectedSpeciesText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cancelButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...theme.typography.body,
    fontWeight: '700',
    color: 'white',
  },
});

export default EditPetForm;