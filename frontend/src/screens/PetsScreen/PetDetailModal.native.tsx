import React, { useState, useCallback, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setEditingPet,
  addPetAsync,
  updatePetAsync,
  uploadPetImageAsync,
  setUploadProgress,
} from '../../store/petsSlice';
import BasicInfoSection from '../../components/BasicInfoSection.native';
import CareInstructionsSection from '../../components/CareInstructionsSection.native';
import PhotoGallerySection from '../../components/PhotoGallerySection.native';

// Helper function to convert care object to care_instructions string
const careObjectToString = (careObj: any) => {
  if (!careObj) return '';
  
  const parts = [];
  if (careObj.feeding) parts.push(`Feeding: ${careObj.feeding}`);
  if (careObj.medication) parts.push(`Medication: ${careObj.medication}`);
  if (careObj.exercise) parts.push(`Exercise: ${careObj.exercise}`);
  if (careObj.special) parts.push(`Special Instructions: ${careObj.special}`);
  
  return parts.join('. ');
};

// Helper function to parse care_instructions string to care object
const stringToCareObject = (instructionsStr: string) => {
  if (!instructionsStr) return {};
  
  const careObj: any = {};
  
  // Extract feeding information
  const feedingMatch = instructionsStr.match(/Feeding:\s*(.*?)(?:\.|\n|$)/i);
  if (feedingMatch && feedingMatch[1]) careObj.feeding = feedingMatch[1].trim();
  
  // Extract medication information
  const medicationMatch = instructionsStr.match(/Medication:\s*(.*?)(?:\.|\n|$)/i);
  if (medicationMatch && medicationMatch[1]) careObj.medication = medicationMatch[1].trim();
  
  // Extract exercise information
  const exerciseMatch = instructionsStr.match(/Exercise:\s*(.*?)(?:\.|\n|$)/i);
  if (exerciseMatch && exerciseMatch[1]) careObj.exercise = exerciseMatch[1].trim();
  
  // Extract special instructions
  const specialMatch = instructionsStr.match(/Special Instructions:\s*(.*?)(?:\.|\n|$)/i);
  if (specialMatch && specialMatch[1]) careObj.special = specialMatch[1].trim();
  
  return careObj;
};

const PetDetailModal: React.FC = () => {
  const dispatch = useDispatch();
  const { editingPet, uploadProgress } = useSelector((state: RootState) => state.pets);
  // Initialize form with editingPet data and convert care_instructions to care object
  const initialForm = useMemo(() => {
    console.log('[PetDetailModal] Initializing form with editingPet:', JSON.stringify(editingPet));
    
    if (!editingPet) return null;
    
    // Create initial form with all pet properties
    const initialData = { ...editingPet };
    
    // Check for both plural and singular forms of care_instructions
    // (database schema shows care_instructions but error suggests care_instruction might exist)
    const careInstructions = initialData.care_instructions || initialData.care_instruction || '';
    
    // If we have care instructions, parse it into a care object for the UI
    if (careInstructions) {
      console.log('[PetDetailModal] Converting care instructions to care object:', careInstructions);
      initialData.care = stringToCareObject(careInstructions);
      // Ensure we're using the correct field name for the database
      initialData.care_instructions = careInstructions;
      // Remove any singular form if it exists
      if ('care_instruction' in initialData) {
        delete initialData.care_instruction;
      }
    } else {
      // Handle case where database has 'care_instructions' column but the value is missing
      
      // Check if there's an old 'care' object we can use
      if (initialData.care) {
        console.log('[PetDetailModal] Using existing care object:', initialData.care);
        // Keep the care object and create care_instructions from it
        initialData.care_instructions = careObjectToString(initialData.care);
      } else {
        console.log('[PetDetailModal] No care data found, initializing empty care object');
        // Neither care_instructions nor care exists, initialize empty
        initialData.care = {};
      }
    }
    
    // If we have image_url but not photos array, initialize photos
    if (initialData.image_url && (!initialData.photos || initialData.photos.length === 0)) {
      console.log('[PetDetailModal] Using image_url as photos[0]:', initialData.image_url);
      initialData.photos = [initialData.image_url];
    }
    
    console.log('[PetDetailModal] Initialized form data:', JSON.stringify(initialData));
    return initialData;
  }, [editingPet]);
  
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('[PetDetailModal] Rendering with editingPet:', editingPet?.id);

  // Defensive check for form
  if (!form) {
    console.log('[PetDetailModal] No form data available, not rendering modal');
    return null;
  }

  const handleChange = useCallback((field: string, value: any) => {
    console.log('[PetDetailModal] handleChange:', field, value);
    setForm((prev: any) => {
      if (!prev) {
        console.warn('[PetDetailModal] handleChange called with null previous state');
        return { [field]: value };
      }
      return { ...prev, [field]: value };
    });
  }, []);


  const handleCareChange = useCallback((field: string, value: any) => {
    console.log('[PetDetailModal] handleCareChange:', field, value);
    setForm((prev: any) => {
      if (!prev) {
        console.warn('[PetDetailModal] handleCareChange called with null previous state');
        return { 
          // Store temporary care object for UI
          care: { [field]: value },
          // Update care_instructions string for database
          care_instructions: careObjectToString({ [field]: value })
        };
      }
      
      // Create updated care object
      const updatedCare = { ...(prev.care || {}), [field]: value };
      
      return { 
        ...prev, 
        // Store care object for UI
        care: updatedCare,
        // Update care_instructions string for database
        care_instructions: careObjectToString(updatedCare)
      };
    });
  }, []);

  const handlePhotosChange = useCallback((photos: string[]) => {
    console.log('[PetDetailModal] handlePhotosChange, count:', photos.length);
    setForm((prev: any) => {
      if (!prev) {
        console.warn('[PetDetailModal] handlePhotosChange called with null previous state');
        return { photos };
      }
      return { ...prev, photos };
    });
  }, []);

  const handleImageUpload = async (file: any) => {
    console.log('[PetDetailModal] handleImageUpload called');
    if (!form.owner_id) {
      console.error('[PetDetailModal] Cannot upload image - missing owner_id');
      setError('Cannot upload image - missing user information');
      return;
    }
    
    dispatch(setUploadProgress(0));
    try {
      console.log('[PetDetailModal] Dispatching uploadPetImageAsync');
      const url = await dispatch(
        uploadPetImageAsync({ 
          file, 
          userId: form.owner_id, 
          petId: form.id || 'temp-id'  // Use a temp ID if this is a new pet
        }) as any
      ).unwrap();
      
      console.log('[PetDetailModal] Image uploaded successfully:', url);
      handlePhotosChange([...(form.photos || []), url]);
    } catch (err: any) {
      console.error('[PetDetailModal] Image upload error:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    }
  };

  const validate = () => {
    console.log('[PetDetailModal] Validating form');
    
    // Clear previous errors
    setError(null);
    
    // Required fields
    if (!form.name || form.name.trim() === '') {
      console.warn('[PetDetailModal] Validation error: Name is required');
      setError('Pet name is required');
      return false;
    }
    
    if (!form.species || form.species.trim() === '') {
      console.warn('[PetDetailModal] Validation error: Species is required');
      setError('Species is required');
      return false;
    }
    
    // Validate age if provided
    if (form.age !== undefined && form.age !== null) {
      const age = Number(form.age);
      if (isNaN(age) || age < 0 || age > 100) {
        console.warn('[PetDetailModal] Validation error: Invalid age');
        setError('Please enter a valid age (0-100)');
        return false;
      }
    }
    
    // Validate weight if provided
    if (form.weight !== undefined && form.weight !== null) {
      const weight = Number(form.weight);
      if (isNaN(weight) || weight <= 0 || weight > 1000) {
        console.warn('[PetDetailModal] Validation error: Invalid weight');
        setError('Please enter a valid weight');
        return false;
      }
    }
    
    console.log('[PetDetailModal] Form validation successful');
    return true;
  };

  const handleSave = async () => {
    console.log('[PetDetailModal] handleSave called');
    setSaving(true);
    setError(null);
    
    if (!validate()) {
      console.log('[PetDetailModal] Validation failed, not saving');
      setSaving(false);
      return;
    }
    
    try {
      // Prepare the pet data for the database - only include fields that match the schema
      const petData: any = {
        // Only include id if it's a valid UUID (not empty)
        // For new pets, let the database generate an ID
        owner_id: form.owner_id,
        name: form.name,
        species: form.species
      };
      
      // Only add the ID if it's a non-empty string (for existing pets)
      if (form.id && form.id.trim() !== '') {
        petData.id = form.id;
      }
      
      // Add optional fields if they exist
      if (form.breed) petData.breed = form.breed;
      if (form.age !== undefined) petData.age = form.age;
      if (form.weight !== undefined) petData.weight = form.weight;
      
      // Handle images - prioritize the first photo as image_url
      if (form.photos && form.photos.length > 0) {
        petData.image_url = form.photos[0];
      } else if (form.image_url) {
        petData.image_url = form.image_url;
      }
      
      // Make sure care_instructions is set from the current care object
      if (form.care) {
        petData.care_instructions = careObjectToString(form.care);
      } else if (form.care_instructions) {
        // Keep existing care_instructions if present
        petData.care_instructions = form.care_instructions;
      }
      
      // Ensure no UI-only fields are sent to the database
      console.log('[PetDetailModal] Cleaned pet data for database:', petData);
      
      console.log('[PetDetailModal] Prepared pet data:', petData);
      
      // Check if this is a new pet or existing pet
      const isNewPet = !form.id || form.id.trim() === '';
      
      if (isNewPet) {
        // Add new pet - no ID field, let database generate it
        console.log('[PetDetailModal] Adding new pet');
        await dispatch(addPetAsync(petData) as any).unwrap();
        console.log('[PetDetailModal] Successfully added new pet');
      } else {
        // Update existing pet
        console.log('[PetDetailModal] Updating existing pet:', petData.id);
        await dispatch(updatePetAsync({ 
          petId: petData.id, 
          updates: petData 
        }) as any).unwrap();
        console.log('[PetDetailModal] Successfully updated pet:', petData.id);
      }
      dispatch(setEditingPet(null));
    } catch (err: any) {
      console.error('[PetDetailModal] Error saving pet:', err);
      setError(err.message || 'Failed to save pet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('[PetDetailModal] handleCancel called');
    dispatch(setEditingPet(null));
  };

  try {
    return (
      <Modal
        visible={!!form}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            width: '90%',
            maxHeight: '90%',
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}>
              <Text style={{
                fontSize: 22, 
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}>{form.id ? 'Edit Pet' : 'Add Pet'}</Text>
              <TouchableOpacity onPress={handleCancel} style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#f5f5f5',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MaterialCommunityIcons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Content */}
            <ScrollView style={{maxHeight: 400}} contentContainerStyle={{padding: 16}}>
              <BasicInfoSection form={form} onChange={handleChange} />
              <CareInstructionsSection care={form.care || {}} onChange={handleCareChange} />
              <PhotoGallerySection 
                photos={form.photos || []} 
                onUpload={handleImageUpload} 
                uploadProgress={uploadProgress} 
                onChange={handlePhotosChange} 
              />
              
              {error && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(211,47,47,0.1)',
                  borderRadius: 8,
                  padding: 12,
                  marginVertical: 16,
                }}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color="#d32f2f" />
                  <Text style={{
                    color: '#d32f2f',
                    marginLeft: 8,
                    flex: 1,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>{error}</Text>
                </View>
              )}
            </ScrollView>
            
            {/* Footer with buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#eee',
            }}>
              <TouchableOpacity 
                style={{
                  flex: 1,
                  padding: 14,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  marginRight: 8,
                  alignItems: 'center',
                }}
                onPress={handleCancel} 
                disabled={saving}
              >
                <Text style={{
                  color: '#333',
                  fontWeight: '600',
                  fontSize: 16,
                }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  flex: 1,
                  padding: 14,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 8,
                  marginLeft: 8,
                  alignItems: 'center',
                }}
                onPress={handleSave} 
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: 16,
                  }}>{form.id ? 'Update' : 'Save'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  } catch (err) {
    console.error('[PetDetailModal] Error rendering modal:', err);
    return null;
  }
};

const styles2025 = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    maxWidth: 460,
    maxHeight: '90%',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    ...theme.elevation.large,
  },
  modalCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211,47,47,0.08)',
    borderRadius: theme.borderRadius.small,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  error: {
    color: theme.colors.error,
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    minWidth: 100,
    alignItems: 'center',
    ...theme.elevation.small,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});


export default PetDetailModal;
