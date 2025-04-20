import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pets: [],
  loading: false,
  error: null,
};

const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    setPets(state, action) {
      state.pets = action.payload;
    },
    addPet(state, action) {
      state.pets.push(action.payload);
    },
    removePet(state, action) {
      state.pets = state.pets.filter(pet => pet.id !== action.payload);
    },
  },
});

export const { setPets, addPet, removePet } = petSlice.actions;
export default petSlice.reducer;
