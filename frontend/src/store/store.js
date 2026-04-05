// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice'; // Ajouter cette ligne

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    chat: chatReducer, // Ajouter le chat reducer
  },
});