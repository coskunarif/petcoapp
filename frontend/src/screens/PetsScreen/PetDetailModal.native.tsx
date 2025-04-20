import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
    if (!form.user_id || !form.id) return;
    dispatch(setUploadProgress(0));
    try {
      const url = await dispatch(
        uploadPetImageAsync({ file, userId: form.user_id, petId: form.id }) as any
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
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.title}>{form.id ? 'Edit Pet' : 'Add Pet'}</Text>
            <BasicInfoSection form={form} onChange={handleChange} />
            <CareInstructionsSection care={form.care || {}} onChange={handleCareChange} />
            <PhotoGallerySection photos={form.photos || []} onUpload={handleImageUpload} uploadProgress={uploadProgress} onChange={handlePhotosChange} />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.row}>
              <TouchableOpacity style={styles.cancel} onPress={handleCancel} disabled={saving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.save} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.44)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancel: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cancelText: {
    color: '#555',
    fontWeight: 'bold',
  },
  save: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#1976d2',
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PetDetailModal;
