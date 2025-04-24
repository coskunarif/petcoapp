import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as petsService from '../services/petsService';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  care?: {
    feeding?: string;
    medication?: string;
    exercise?: string;
    specialInstructions?: string;
  };
  photos?: string[];
  vetInfo?: string;
}

interface PetsState {
  petsList: Pet[];
  loading: boolean;
  error: string | null;
  selectedPet: Pet | null;
  editingPet: Pet | null;
  uploadProgress: number;
}

const initialState: PetsState = {
  petsList: [],
  loading: false,
  error: null,
  selectedPet: null,
  editingPet: null,
  uploadProgress: 0,
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

export const addPetAsync = createAsyncThunk<Pet, Partial<Pet> & { owner_id: string }>(
  'pets/addPet',
  async (pet, { rejectWithValue }) => {
    try {
      return await petsService.addPet(pet);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to add pet');
    }
  }
);

export const updatePetAsync = createAsyncThunk<Pet, { petId: string; updates: Partial<Pet> }>(
  'pets/updatePet',
  async ({ petId, updates }, { rejectWithValue }) => {
    try {
      return await petsService.updatePet(petId, updates);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update pet');
    }
  }
);

export const deletePetAsync = createAsyncThunk<string, string>(
  'pets/deletePet',
  async (petId, { rejectWithValue }) => {
    try {
      await petsService.deletePet(petId);
      return petId;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete pet');
    }
  }
);

export const uploadPetImageAsync = createAsyncThunk<string, { file: File; userId: string; petId: string }>(
  'pets/uploadPetImage',
  async ({ file, userId, petId }, { rejectWithValue }) => {
    try {
      return await petsService.uploadPetImage(file, userId, petId);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to upload image');
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
        console.log('[petsSlice] fetchPetsAsync.fulfilled. Payload:', action.payload);
        state.petsList = action.payload;
        state.loading = false;
      })
      .addCase(fetchPetsAsync.rejected, (state, action) => {
      console.log('[petsSlice] fetchPetsAsync.rejected. Error:', action.payload);
        console.log('[petsSlice] fetchPetsAsync.rejected. Error:', action.payload);
        state.loading = false;
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
        state.petsList.unshift(action.payload);
        state.loading = false;
      })
      .addCase(addPetAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update pet
      .addCase(updatePetAsync.fulfilled, (state, action) => {
        const idx = state.petsList.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.petsList[idx] = action.payload;
      })
      .addCase(updatePetAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete pet
      .addCase(deletePetAsync.fulfilled, (state, action) => {
        state.petsList = state.petsList.filter(p => p.id !== action.payload);
      })
      .addCase(deletePetAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Upload image
      .addCase(uploadPetImageAsync.pending, (state) => {
        state.uploadProgress = 0;
      })
      .addCase(uploadPetImageAsync.fulfilled, (state) => {
        state.uploadProgress = 100;
      })
      .addCase(uploadPetImageAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });
  },
});

export const {
  setSelectedPet,
  setEditingPet,
  setUploadProgress,
} = petsSlice.actions;

export default petsSlice.reducer;
