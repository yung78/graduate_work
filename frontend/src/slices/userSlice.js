import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  id: '',
  name: '',
  lastName: '',
  email: '',
  avatar: '/img/unknown_user.png',
  files: '',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    changeAvatar: (state, action) => {
      return { ...state, avatar: action.payload };
    },
    resetPersonData: () => {
      return { ...initialState };
    },
    loadPersonData: (state, action) => {
      const { id, name, lastName, email, avatar, files } = action.payload
      if (avatar === '') {
        return { id, name, lastName, email, avatar: '/img/unknown_user.png', files };
      }
      
      return { id, name, lastName, email, avatar, files };
    },
    changeField: (state, action) => {
      const key = action.payload[0];
      const value = action.payload[1];
      state[key] = value;
      return state;
    }
  },
});

export const {
  changeAvatar,
  resetPersonData,
  loadPersonData,
  changeField,
} = userSlice.actions;

export default userSlice.reducer; 