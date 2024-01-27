import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  onFocus: null,
  addModal: false,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    focusOnUser: (state, action) => {
      return { ...state, onFocus: action.payload }; 
    },
    deleteFocusOnUser: (state) => {
      return { ...state, onFocus: null };
    },
    showAddModal: (state) => {
      return { ...state, addModal: true }
    },
    hideAddModal: (state) => {
      return { ...state, addModal: false }
    },
  }
});

export const {
  focusOnUser,
  deleteFocusOnUser,
  showAddModal,
  hideAddModal

} = adminSlice.actions;

export default adminSlice.reducer;