import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProfile, loginUser, registerUser } from '../services/api';

const AUTH_STORAGE_KEY = 'flipkart_auth';

const loadAuthState = () => {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  try {
    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedValue) {
      return { token: null, user: null };
    }

    const parsedValue = JSON.parse(storedValue);

    return {
      token: parsedValue?.token || null,
      user: parsedValue?.user || null,
    };
  } catch (_error) {
    return { token: null, user: null };
  }
};

export const persistAuthState = (authState) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!authState?.token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: authState.token,
      user: authState.user,
    })
  );
};

const persistedAuth = loadAuthState();

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await loginUser(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await registerUser(payload);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    return await getProfile();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  token: persistedAuth.token,
  user: persistedAuth.user,
  isAuthenticated: Boolean(persistedAuth.token),
  loading: false,
  error: null,
  initialized: !persistedAuth.token,
  isLoginModalOpen: false,
  modalMode: 'login',
};

const applyAuthSuccess = (state, action) => {
  state.loading = false;
  state.error = null;
  state.token = action.payload.token;
  state.user = action.payload.user;
  state.isAuthenticated = true;
  state.initialized = true;
  state.isLoginModalOpen = false;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openLoginModal: (state, action) => {
      state.isLoginModalOpen = true;
      state.modalMode = action.payload || 'login';
      state.error = null;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
      state.error = null;
    },
    switchModalMode: (state, action) => {
      state.modalMode = action.payload;
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.initialized = true;
      state.isLoginModalOpen = false;
      state.modalMode = 'login';
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, applyAuthSuccess)
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to login right now';
        state.initialized = true;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, applyAuthSuccess)
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to create your account right now';
        state.initialized = true;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
        state.error = null;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

export const {
  openLoginModal,
  closeLoginModal,
  switchModalMode,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
