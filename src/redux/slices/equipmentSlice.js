
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  equipment: [],
  equipmentByCategory: {
    Camera: [],
    Drone: [],
    Gaming: [],
  },
  subCategories: {
    Camera: ['DSLR', 'Mirrorless', 'Lens'],
    Drone: ['Mini Drone', 'Camera Drone', 'Professional Drone', 'Compact Drone', 'FPV Drone'],
    Gaming: ['Console'],
  },
  selectedEquipment: null,
  loading: false,
  error: null,
  categories: [
    { id: 'Camera', name: 'Camera & Lenses', icon: 'camera' },
    { id: 'Drone', name: 'Drones', icon: 'flight' },
    { id: 'Gaming', name: 'Gaming Consoles', icon: 'sports-esports' },
  ],
};

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    // Equipment actions
    fetchEquipmentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEquipmentSuccess: (state, action) => {
      state.loading = false;
      state.equipment = action.payload;
      
      // Organize equipment by category
      if (action.payload && Array.isArray(action.payload)) {
        action.payload.forEach(item => {
          if (item.category && state.equipmentByCategory[item.category]) {
            state.equipmentByCategory[item.category].push(item);
          }
        });
      }
    },
    fetchEquipmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Equipment by category actions
    fetchEquipmentByCategoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEquipmentByCategorySuccess: (state, action) => {
      state.loading = false;
      const { category, data } = action.payload;
      state.equipmentByCategory[category] = data || [];
    },
    fetchEquipmentByCategoryFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Single equipment actions
    fetchEquipmentByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEquipmentByIdSuccess: (state, action) => {
      state.loading = false;
      state.selectedEquipment = action.payload;
    },
    fetchEquipmentByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear selected equipment
    clearSelectedEquipment: (state) => {
      state.selectedEquipment = null;
    },
  },
});

export const {
  fetchEquipmentRequest,
  fetchEquipmentSuccess,
  fetchEquipmentFailure,
  fetchEquipmentByCategoryRequest,
  fetchEquipmentByCategorySuccess,
  fetchEquipmentByCategoryFailure,
  fetchEquipmentByIdRequest,
  fetchEquipmentByIdSuccess,
  fetchEquipmentByIdFailure,
  clearSelectedEquipment,
} = equipmentSlice.actions;

export default equipmentSlice.reducer;
