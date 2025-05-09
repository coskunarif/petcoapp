import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as petsService from '../services/petsService';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  care_instructions?: string; // Changed to match database schema
  image_url?: string; // Added to match database schema
  photos?: string[]; // Keep for backward compatibility
  vetInfo?: string;
  created_at?: string;
  updated_at?: string;
}

interface PetsState {
  petsList: Pet[];
  loading: boolean;
  error: string | null;
  selectedPet: Pet | null;
  editingPet: Pet | null;
  uploadProgress: number;
  isSubscribed: boolean;
  channelId: string | null; // Store channel ID instead of channel object
  singlePetLoading: boolean;
}

const initialState: PetsState = {
  petsList: [],
  loading: false,
  error: null,
  selectedPet: null,
  editingPet: null,
  uploadProgress: 0,
  isSubscribed: false,
  channelId: null,
  singlePetLoading: false,
};

// Async thunks
export const fetchPetsAsync = createAsyncThunk<Pet[], string>(
  'pets/fetchPets',
  async (userId: string, { rejectWithValue }) => {
    console.log('[fetchPetsAsync] called with userId:', userId);
    try {
      const pets = await petsService.fetchPets(userId);
      console.log('[fetchPetsAsync] pets fetched:', pets);
      return pets;
    } catch (err: any) {
      console.log('[fetchPetsAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to fetch pets');
    }
  }
);

export const fetchPetByIdAsync = createAsyncThunk<Pet | null, string>(
  'pets/fetchPetById',
  async (petId: string, { rejectWithValue }) => {
    console.log('[fetchPetByIdAsync] called with petId:', petId);
    try {
      const pet = await petsService.fetchPetById(petId);
      console.log('[fetchPetByIdAsync] pet fetched:', pet);
      return pet;
    } catch (err: any) {
      console.log('[fetchPetByIdAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to fetch pet');
    }
  }
);

export const addPetAsync = createAsyncThunk<Pet, Partial<Pet> & { owner_id: string }>(
  'pets/addPet',
  async (pet, { rejectWithValue }) => {
    console.log('[addPetAsync] Adding pet:', pet);
    try {
      return await petsService.addPet(pet);
    } catch (err: any) {
      console.error('[addPetAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to add pet');
    }
  }
);

export const updatePetAsync = createAsyncThunk<Pet, { petId: string; updates: Partial<Pet> }>(
  'pets/updatePet',
  async ({ petId, updates }, { rejectWithValue }) => {
    console.log('[updatePetAsync] Updating pet:', petId);
    try {
      return await petsService.updatePet(petId, updates);
    } catch (err: any) {
      console.error('[updatePetAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to update pet');
    }
  }
);

export const deletePetAsync = createAsyncThunk<string, string>(
  'pets/deletePet',
  async (petId, { rejectWithValue }) => {
    console.log('[deletePetAsync] Deleting pet:', petId);
    try {
      await petsService.deletePet(petId);
      return petId;
    } catch (err: any) {
      console.error('[deletePetAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to delete pet');
    }
  }
);

export const uploadPetImageAsync = createAsyncThunk<
  string,
  { file: File; userId: string; petId: string },
  { dispatch: any }
>(
  'pets/uploadPetImage',
  async ({ file, userId, petId }, { dispatch, rejectWithValue }) => {
    console.log('[uploadPetImageAsync] Uploading image for pet:', petId);
    try {
      // Update progress to show upload started
      dispatch(setUploadProgress(10));
      
      const url = await petsService.uploadPetImage(file, userId, petId);
      
      // Update progress to show upload completed
      dispatch(setUploadProgress(100));
      
      return url;
    } catch (err: any) {
      console.error('[uploadPetImageAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to upload image');
    }
  }
);

export const uploadMultiplePetImagesAsync = createAsyncThunk<
  string[],
  { files: File[]; userId: string; petId: string },
  { dispatch: any }
>(
  'pets/uploadMultiplePetImages',
  async ({ files, userId, petId }, { dispatch, rejectWithValue }) => {
    console.log('[uploadMultiplePetImagesAsync] Uploading multiple images for pet:', petId);
    try {
      const progressCallback = (progress: number) => {
        dispatch(setUploadProgress(progress));
      };
      
      return await petsService.uploadMultiplePetImages(files, userId, petId, progressCallback);
    } catch (err: any) {
      console.error('[uploadMultiplePetImagesAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to upload images');
    }
  }
);

export const deletePetImageAsync = createAsyncThunk<
  boolean,
  { imageUrl: string; petId: string; updatedPhotos: string[] },
  { dispatch: any }
>(
  'pets/deletePetImage',
  async ({ imageUrl, petId, updatedPhotos }, { dispatch, rejectWithValue }) => {
    console.log('[deletePetImageAsync] Deleting image for pet:', petId);
    try {
      const success = await petsService.deletePetImage(imageUrl);
      
      if (success) {
        // Update the pet with the new photos list
        await dispatch(updatePetAsync({
          petId, 
          updates: { photos: updatedPhotos }
        })).unwrap();
      }
      
      return success;
    } catch (err: any) {
      console.error('[deletePetImageAsync] error:', err);
      return rejectWithValue(err.message || 'Failed to delete image');
    }
  }
);

// Store to keep track of active channels outside of Redux
// This prevents storing non-serializable objects in Redux
const activeChannels: Record<string, RealtimeChannel> = {};

export const setupPetsSubscriptionAsync = createAsyncThunk<
  string, // Return channel ID instead of channel object
  string,
  { dispatch: any }
>(
  'pets/setupSubscription',
  async (userId: string, { dispatch }) => {
    console.log('[setupPetsSubscriptionAsync] Setting up subscription for user:', userId);
    
    // Create a unique channel ID for this subscription
    const channelId = `pets_${userId}_${Date.now()}`;
    
    const channel = petsService.subscribeToPetsChanges(userId, (payload) => {
      console.log('[setupPetsSubscriptionAsync] Realtime update received:', payload);
      
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      switch (eventType) {
        case 'INSERT':
          dispatch(petAdded(newRecord as Pet));
          break;
        case 'UPDATE':
          dispatch(petUpdated(newRecord as Pet));
          break;
        case 'DELETE':
          dispatch(petDeleted(oldRecord.id));
          break;
        default:
          break;
      }
    });
    
    // Store the channel in our local map
    activeChannels[channelId] = channel;
    
    return channelId;
  }
);

export const removePetsSubscriptionAsync = createAsyncThunk<
  void,
  void,
  { state: { pets: PetsState } }
>(
  'pets/removeSubscription',
  async (_, { getState }) => {
    const { channelId } = getState().pets;
    
    if (channelId && activeChannels[channelId]) {
      console.log('[removePetsSubscriptionAsync] Removing subscription');
      await petsService.unsubscribePets(activeChannels[channelId]);
      
      // Clean up the reference
      delete activeChannels[channelId];
    }
  }
);

const petsSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    setSelectedPet(state, action: PayloadAction<Pet | null>) {
      state.selectedPet = action.payload;
    },
    setEditingPet(state, action: PayloadAction<Pet | null>) {
      state.editingPet = action.payload;
    },
    setUploadProgress(state, action: PayloadAction<number>) {
      state.uploadProgress = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    petAdded(state, action: PayloadAction<Pet>) {
      // Only add if not already in the list
      const exists = state.petsList.some(pet => pet.id === action.payload.id);
      if (!exists) {
        state.petsList.unshift(action.payload);
      }
    },
    petUpdated(state, action: PayloadAction<Pet>) {
      const idx = state.petsList.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.petsList[idx] = action.payload;
      }
      
      // Also update selectedPet if it's the same pet
      if (state.selectedPet?.id === action.payload.id) {
        state.selectedPet = action.payload;
      }
      
      // Also update editingPet if it's the same pet
      if (state.editingPet?.id === action.payload.id) {
        state.editingPet = action.payload;
      }
    },
    petDeleted(state, action: PayloadAction<string>) {
      state.petsList = state.petsList.filter(p => p.id !== action.payload);
      
      // Also clear selectedPet if it's the deleted pet
      if (state.selectedPet?.id === action.payload) {
        state.selectedPet = null;
      }
      
      // Also clear editingPet if it's the deleted pet
      if (state.editingPet?.id === action.payload) {
        state.editingPet = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pets
      .addCase(fetchPetsAsync.pending, (state) => {
        console.log('[petsSlice] fetchPetsAsync.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPetsAsync.fulfilled, (state, action) => {
        console.log('[petsSlice] fetchPetsAsync.fulfilled. Setting petsList to:', action.payload);
        state.petsList = action.payload;
        state.loading = false;
      })
      .addCase(fetchPetsAsync.rejected, (state, action) => {
        console.log('[petsSlice] fetchPetsAsync.rejected. Error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single pet
      .addCase(fetchPetByIdAsync.pending, (state) => {
        state.singlePetLoading = true;
        state.error = null;
      })
      .addCase(fetchPetByIdAsync.fulfilled, (state, action) => {
        state.singlePetLoading = false;
        // Only set selectedPet if we found a pet
        if (action.payload) {
          state.selectedPet = action.payload;
          
          // Also update in petsList if it exists there
          const idx = state.petsList.findIndex(p => p.id === action.payload?.id);
          if (idx !== -1) {
            state.petsList[idx] = action.payload;
          }
        }
      })
      .addCase(fetchPetByIdAsync.rejected, (state, action) => {
        state.singlePetLoading = false;
        state.error = action.payload as string;
      })
      
      // Add pet
      .addCase(addPetAsync.pending, (state) => {
        console.log('[petsSlice] addPetAsync.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(addPetAsync.fulfilled, (state, action) => {
        console.log('[petsSlice] addPetAsync.fulfilled. Payload:', action.payload);
        // Ensure we don't add duplicates (might also receive via realtime)
        const exists = state.petsList.some(pet => pet.id === action.payload.id);
        if (!exists) {
          state.petsList.unshift(action.payload);
        }
        state.loading = false;
      })
      .addCase(addPetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update pet
      .addCase(updatePetAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePetAsync.fulfilled, (state, action) => {
        console.log('[petsSlice] updatePetAsync.fulfilled. Payload:', action.payload);
        const idx = state.petsList.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.petsList[idx] = action.payload;
        
        // Also update selectedPet if it's the same pet
        if (state.selectedPet?.id === action.payload.id) {
          state.selectedPet = action.payload;
        }
        
        state.loading = false;
      })
      .addCase(updatePetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete pet
      .addCase(deletePetAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePetAsync.fulfilled, (state, action) => {
        console.log('[petsSlice] deletePetAsync.fulfilled. Deleted pet ID:', action.payload);
        state.petsList = state.petsList.filter(p => p.id !== action.payload);
        
        // Also clear selectedPet if it's the deleted pet
        if (state.selectedPet?.id === action.payload) {
          state.selectedPet = null;
        }
        
        // Also clear editingPet if it's the deleted pet
        if (state.editingPet?.id === action.payload) {
          state.editingPet = null;
        }
        
        state.loading = false;
      })
      .addCase(deletePetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Upload image
      .addCase(uploadPetImageAsync.pending, (state) => {
        state.uploadProgress = 0;
      })
      .addCase(uploadPetImageAsync.fulfilled, (state) => {
        // Progress is set in the thunk
      })
      .addCase(uploadPetImageAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })
      
      // Upload multiple images
      .addCase(uploadMultiplePetImagesAsync.pending, (state) => {
        state.uploadProgress = 0;
      })
      .addCase(uploadMultiplePetImagesAsync.fulfilled, (state) => {
        state.uploadProgress = 100;
      })
      .addCase(uploadMultiplePetImagesAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        state.uploadProgress = 0;
      })
      
      // Delete image
      .addCase(deletePetImageAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Realtime subscription
      .addCase(setupPetsSubscriptionAsync.fulfilled, (state, action) => {
        state.channelId = action.payload;
        state.isSubscribed = true;
      })
      .addCase(removePetsSubscriptionAsync.fulfilled, (state) => {
        state.channelId = null;
        state.isSubscribed = false;
      });
  },
});

export const {
  setSelectedPet,
  setEditingPet,
  setUploadProgress,
  clearError,
  petAdded,
  petUpdated,
  petDeleted,
} = petsSlice.actions;

export default petsSlice.reducer;
