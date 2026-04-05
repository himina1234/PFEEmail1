import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Charger les utilisateurs depuis localStorage
const loadUsersFromStorage = () => {
  const savedUsers = localStorage.getItem('users');
  return savedUsers ? JSON.parse(savedUsers) : [];
};

// Charger l'utilisateur courant depuis localStorage
const loadCurrentUserFromStorage = () => {
  const savedUser = localStorage.getItem('currentUser');
  return savedUser ? JSON.parse(savedUser) : null;
};

// Sauvegarder les utilisateurs dans localStorage
const saveUsersToStorage = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Sauvegarder l'utilisateur courant dans localStorage
const saveCurrentUserToStorage = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Action asynchrone pour mettre à jour le profil
export const updateUserProfile = createAsyncThunk(
  'users/updateProfile',
  async ({ userId, userData }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const users = state.users.list;
      
      // Mettre à jour l'utilisateur dans la liste
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      );
      
      // Sauvegarder dans localStorage
      saveUsersToStorage(updatedUsers);
      
      // Mettre à jour l'utilisateur courant si c'est le même
      const currentUser = state.users.currentUser;
      if (currentUser && currentUser.id === userId) {
        const updatedCurrentUser = { ...currentUser, ...userData };
        saveCurrentUserToStorage(updatedCurrentUser);
        return { updatedUsers, updatedCurrentUser };
      }
      
      return { updatedUsers };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour ajouter des utilisateurs (import Excel)
export const addUsers = createAsyncThunk(
  'users/addUsers',
  async (newUsers, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const existingUsers = state.users.list;
      const updatedUsers = [...existingUsers, ...newUsers];
      saveUsersToStorage(updatedUsers);
      return updatedUsers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const updatedUsers = state.users.list.filter(user => user.id !== userId);
      saveUsersToStorage(updatedUsers);
      return updatedUsers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour réinitialiser le mot de passe
export const resetUserPassword = createAsyncThunk(
  'users/resetPassword',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
        let password = '';
        for (let i = 0; i < 8; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };
      
      const newPassword = generatePassword();
      const state = getState();
      const updatedUsers = state.users.list.map(user => 
        user.id === userId ? { ...user, password: newPassword } : user
      );
      
      saveUsersToStorage(updatedUsers);
      return { updatedUsers, newPassword, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: loadUsersFromStorage(),
    currentUser: loadCurrentUserFromStorage(),
    isLoading: false,
    error: null,
  },
  reducers: {
    // Synchroniser avec localStorage
    syncUsers: (state) => {
      state.list = loadUsersFromStorage();
    },
    syncCurrentUser: (state) => {
      state.currentUser = loadCurrentUserFromStorage();
    },
    // Déconnexion
    logout: (state) => {
      state.currentUser = null;
      localStorage.removeItem('currentUser');
    },
    // Connexion locale (pour les utilisateurs importés)
    loginLocal: (state, action) => {
      const { matricule, password } = action.payload;
      const user = state.list.find(u => u.matricule === matricule && u.password === password);
      if (user) {
        state.currentUser = user;
        saveCurrentUserToStorage(user);
      }
    },
    // Mettre à jour l'utilisateur courant
    updateCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
      saveCurrentUserToStorage(state.currentUser);
      
      // Mettre à jour aussi dans la liste
      state.list = state.list.map(user => 
        user.id === state.currentUser.id ? state.currentUser : user
      );
      saveUsersToStorage(state.list);
    },
  },
  extraReducers: (builder) => {
    builder
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.updatedUsers;
        if (action.payload.updatedCurrentUser) {
          state.currentUser = action.payload.updatedCurrentUser;
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // addUsers
      .addCase(addUsers.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      // resetUserPassword
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.list = action.payload.updatedUsers;
      });
  },
});

export const { syncUsers, syncCurrentUser, logout, loginLocal, updateCurrentUser } = userSlice.actions;
export default userSlice.reducer;