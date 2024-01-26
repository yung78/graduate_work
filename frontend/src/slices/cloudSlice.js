import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  view: false,
  files: [],
  onFocus: null,
  confirm: false,
  share: false,
  message: false,
  dounloadURL: false
};

export const cloudSlice = createSlice({
  name: 'cloud',
  initialState,
  reducers: {
    resetCloud: () => {
      return { ...initialState };
    },
    changeView: (state) => {
      return { ...state, view: !state.view };
    },
    addUserFiles: (state, action) => {
      return { ...state, files: action.payload };
    },
    focusOnFile: (state, action) => {
      return { ...state, onFocus: action.payload }; 
    },
    deleteFocusOnFile: (state) => {
      return { ...state, onFocus: null };
    },
    showDeleteConfirm: (state) => {
      return { ...state, confirm: true };
    },
    hideDeleteConfirm: (state) => {
      return { ...state, confirm: false };
    },
    showShareURL: (state) => {
      return { ...state, share: true };
    },
    hideShareURL: (state) => {
      return { ...state, share: false };
    },
    showMessage: (state) => {
      return { ...state, message: true };
    },
    hideMessage: (state) => {
      return { ...state, message: false };
    },
    saveDownloadURL: (state, action) => {
      return { ...state, dounloadURL: action.payload}
    }
  }
});

export const {
  resetCloud,
  changeView,
  addUserFiles,
  focusOnFile,
  deleteFocusOnFile,
  showDeleteConfirm,
  hideDeleteConfirm,
  showShareURL,
  hideShareURL,
  showMessage,
  hideMessage,
  saveDownloadURL,
} = cloudSlice.actions;

export default cloudSlice.reducer;