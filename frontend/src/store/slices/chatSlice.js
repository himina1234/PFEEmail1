// store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// État initial
const initialState = {
  conversations: [],
  currentMessages: [],
  loading: false,
  error: null,
  onlineUsers: []
};

// Async thunks pour les opérations asynchrones
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ senderId, receiverId, message, senderRole }) => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newMessage = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      message,
      senderRole,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    return newMessage;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ userId, otherUserId }) => {
    const messages = localStorage.getItem(`chat_${userId}_${otherUserId}`);
    return messages ? JSON.parse(messages) : [];
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.currentMessages.push(action.payload);
      // Sauvegarder dans localStorage
      const { senderId, receiverId } = action.payload;
      const key = `chat_${senderId}_${receiverId}`;
      const existing = localStorage.getItem(key);
      const messages = existing ? JSON.parse(existing) : [];
      messages.push(action.payload);
      localStorage.setItem(key, JSON.stringify(messages));
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    markAsRead: (state, action) => {
      const { messageId } = action.payload;
      const message = state.currentMessages.find(m => m.id === messageId);
      if (message) {
        message.read = true;
      }
    },
    clearCurrentMessages: (state) => {
      state.currentMessages = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { 
  addMessage, 
  setOnlineUsers, 
  markAsRead, 
  clearCurrentMessages,
  setLoading,
  setError
} = chatSlice.actions;

export default chatSlice.reducer;