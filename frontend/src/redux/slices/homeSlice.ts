import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

interface ServiceType {
  id: string;
  name: string;
}

interface HomeState {
  serviceTypes: ServiceType[];
  requestServiceModalVisible: boolean;
}

const initialState: HomeState = {
  serviceTypes: [],
  requestServiceModalVisible: false,
};

export const fetchServiceTypes = createAsyncThunk(
  'home/fetchServiceTypes',
  async () => {
    const { data, error } = await supabase
      .from('service_types')
      .select('id, name')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as ServiceType[];
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    showRequestServiceModal: (state) => {
      state.requestServiceModalVisible = true;
    },
    hideRequestServiceModal: (state) => {
      state.requestServiceModalVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchServiceTypes.fulfilled, (state, action) => {
      state.serviceTypes = action.payload;
    });
  },
});

export const { showRequestServiceModal, hideRequestServiceModal } = homeSlice.actions;
export default homeSlice.reducer;