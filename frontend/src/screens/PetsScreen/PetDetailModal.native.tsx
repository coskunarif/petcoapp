import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated } from 'react-native';
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

const PetDetailModal: React.FC = () => {
  const dispatch = useDispatch();
  const { editingPet, uploadProgress } = useSelector((state: RootState) => state.pets);
  const [form, setForm] = useState(editingPet);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!form) return null;

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCareChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, care: { ...prev.care, [field]: value } }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setForm((prev: any) => ({ ...prev, photos }));
  };

  const handleImageUpload = async (file: any) => {
    if (!form.owner_id || !form.id) return;
    dispatch(setUploadProgress(0));
    try {
      const url = await dispatch(
        uploadPetImageAsync({ file, userId: form.owner_id, petId: form.id }) as any
      ).unwrap();
      handlePhotosChange([...(form.photos || []), url]);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    }
  };

  const validate = () => {
    if (!form.name || !form.species) {
      setError('Name and species are required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (!validate()) {
      setSaving(false);
      return;
    }
    try {
      if (!form.id) {
        // Add new pet
        await dispatch(addPetAsync(form) as any).unwrap();
      } else {
        // Update existing pet
        await dispatch(updatePetAsync({ petId: form.id, updates: form }) as any).unwrap();
      }
      dispatch(setEditingPet(null));
    } catch (err: any) {
      setError(err.message || 'Failed to save pet');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    dispatch(setEditingPet(null));
  };

  return (
    <Modal
      visible={!!form}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={styles2025.overlay}>
        <Animated.View style={[styles2025.glassModal, { opacity: !!form ? 1 : 0, transform: [{ translateY: !!form ? 0 : 40 }] }]}>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <Text style={styles2025.title}>{form.id ? 'Edit Pet' : 'Add Pet'}</Text>
            <BasicInfoSection form={form} onChange={handleChange} />
            <CareInstructionsSection care={form.care || {}} onChange={handleCareChange} />
            <PhotoGallerySection photos={form.photos || []} onUpload={handleImageUpload} uploadProgress={uploadProgress} onChange={handlePhotosChange} />
            {error && <Text style={styles2025.error}>{error}</Text>}
            <View style={styles2025.row}>
              <TouchableOpacity style={styles2025.cancel} onPress={handleCancel} disabled={saving}>
                <Text style={styles2025.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles2025.save} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles2025.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles2025 = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(24,38,63,0.22)', // subtle overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  glassModal: {
    width: '94%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 0,
    // Glassmorphism blur (optional, fallback to soft background)
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    color: '#223a5f',
    letterSpacing: 0.2,
    fontFamily: 'System', // modern system font
    textShadowColor: 'rgba(74,144,226,0.08)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  error: {
    color: '#e53935',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 28,
  },
  cancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1.2,
    borderColor: '#b4c7e7',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#b4c7e7',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  cancelText: {
    color: '#5774a6',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
  save: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#1976d2',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  saveText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.1,
  },
});


export default PetDetailModal;
