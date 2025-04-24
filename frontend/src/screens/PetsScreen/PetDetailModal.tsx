import React, { useState } from 'react';
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
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          width: 400,
          maxWidth: '95vw',
          padding: 24,
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>{form.id ? 'Edit Pet' : 'Add Pet'}</h2>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <BasicInfoSection form={form} onChange={handleChange} />
        <CareInstructionsSection care={form.care || {}} onChange={handleCareChange} />
        <PhotoGallerySection photos={form.photos || []} onUpload={handleImageUpload} uploadProgress={uploadProgress} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button onClick={handleCancel} disabled={saving} style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid #ccc', background: '#fafafa', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: '#1976d2', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetDetailModal;
