import React, { useState } from 'react';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  setEditingPet,
  addPetAsync,
  updatePetAsync,
  uploadPetImageAsync,
  setUploadProgress,
} from '../../store/petsSlice';
import BasicInfoSection from '../../components/BasicInfoSection';
import CareInstructionsSection from '../../components/CareInstructionsSection';
import PhotoGallerySection from '../../components/PhotoGallerySection';

interface PetDetailParams {
  pet: {
    id: string;
    name: string;
    species: string;
    owner_id: string;
    care?: Record<string, any>;
    photo?: string;
    photos?: string[];
  };
}

const PetDetailModal: React.FC<{
  route: RouteProp<{ params: PetDetailParams }>
}> = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { editingPet, uploadProgress } = useSelector((state: RootState) => state.pets);
  const [form, setForm] = useState<{
    id?: string;
    name: string;
    species: string;
    owner_id?: string;
    care?: Record<string, any>;
    photo?: string;
    photos?: string[];
  }>(route?.params?.pet || editingPet || {
    name: '',
    species: '',
    care: {},
    photos: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!form) {
    navigation.goBack();
    return null;
  }

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleCareChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, care: { ...prev.care, [field]: value } }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setForm((prev: any) => ({ ...prev, photos }));
  };

  const handleImageUpload = async (file: File) => {
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
    if (!form.name || !form.species || !form.owner_id) {
      setError('Name, species, and owner ID are required');
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
        if (!form.owner_id) {
          throw new Error('Owner ID is required');
        }
        await dispatch(addPetAsync({ ...form, owner_id: form.owner_id }) as any).unwrap();
      } else {
        // Update existing pet
        await dispatch(updatePetAsync({ petId: form.id, updates: form }) as any).unwrap();
      }
      dispatch(setEditingPet(null));
      if (navigation) {
        navigation.goBack();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save pet');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    dispatch(setEditingPet(null));
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(24,38,63,0.22)', // subtle overlay
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        outline: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.82)',
          borderRadius: 28,
          width: 420,
          maxWidth: '96vw',
          padding: 32,
          boxShadow: '0 8px 32px 0 rgba(74,144,226,0.18), 0 1.5px 8px 0 rgba(173,216,255,0.12)',
          border: '1.2px solid rgba(173,216,255,0.14)',
          margin: '0 16px',
          outline: 'none',
        }}
        tabIndex={0}
      >
        <h2 style={{
          marginTop: 0,
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 14,
          textAlign: 'center',
          color: '#223a5f',
          letterSpacing: 0.2,
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 2px 8px rgba(74,144,226,0.08)'
        }}>{form.id ? 'Edit Pet' : 'Add Pet'}</h2>
        {error && <div style={{ color: '#e53935', marginBottom: 16, fontWeight: 600, fontSize: 15, textAlign: 'center', letterSpacing: 0.2 }}>{error}</div>}
        <BasicInfoSection form={form} onChange={handleChange} />
        <CareInstructionsSection care={form.care || {}} onChange={handleCareChange} />
        <PhotoGallerySection photos={form.photos || []} onUpload={handleImageUpload} uploadProgress={uploadProgress} />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginTop: 28 }}>
          <button
            onClick={handleCancel}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.68)',
              border: '1.2px solid #b4c7e7',
              color: '#5774a6',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.1,
              marginRight: 8,
              boxShadow: '0 2px 6px rgba(180,199,231,0.10)',
              cursor: saving ? 'not-allowed' : 'pointer',
              outline: 'none',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 16,
              background: '#1976d2',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.1,
              marginLeft: 8,
              boxShadow: '0 4px 16px rgba(25,118,210,0.16)',
              cursor: saving ? 'not-allowed' : 'pointer',
              outline: 'none',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDetailModal;
