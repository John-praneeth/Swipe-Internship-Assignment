import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials, RegisterData } from '../types/auth';
import { authService, getStoredToken, setStoredToken, removeStoredToken } from '../services/authService';

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  users: [],
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      if (!result) {
        return rejectWithValue('Invalid email or password');
      }
      
      setStoredToken(result.token);
      return result.user;
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const result = await authService.register(userData);
      if ('error' in result) {
        return rejectWithValue(result.error);
      }
      
      setStoredToken(result.token);
      return result.user;
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const validateSession = createAsyncThunk(
  'auth/validateSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredToken();
      if (!token) {
        return rejectWithValue('No token found');
      }

      const user = await authService.validateSession(token);
      if (!user) {
        removeStoredToken();
        return rejectWithValue('Invalid session');
      }

      return user;
    } catch (error) {
      removeStoredToken();
      return rejectWithValue('Session validation failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = getStoredToken();
      if (token) {
        await authService.logout(token);
      }
      removeStoredToken();
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'auth/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const users = await authService.getAllUsers();
      return users;
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const createUserByAdmin = createAsyncThunk(
  'auth/createUser',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const result = await authService.createUser(userData);
      if ('error' in result) {
        return rejectWithValue(result.error);
      }
      return result;
    } catch (error) {
      return rejectWithValue('Failed to create user');
    }
  }
);

export const updateUserByAdmin = createAsyncThunk(
  'auth/updateUser',
  async ({ id, updates }: { id: string; updates: Partial<User> }, { rejectWithValue }) => {
    try {
      const user = await authService.updateUser(id, updates);
      if (!user) {
        return rejectWithValue('User not found');
      }
      return user;
    } catch (error) {
      return rejectWithValue('Failed to update user');
    }
  }
);

export const deleteUserByAdmin = createAsyncThunk(
  'auth/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const success = await authService.deleteUser(id);
      if (!success) {
        return rejectWithValue('User not found');
      }
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Validate Session
    builder
      .addCase(validateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(validateSession.rejected, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Fetch All Users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state) => {
        state.loading = false;
      });

    // Create User
    builder
      .addCase(createUserByAdmin.fulfilled, (state, action) => {
        state.users.push(action.payload);
      });

    // Update User
    builder
      .addCase(updateUserByAdmin.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });

    // Delete User
    builder
      .addCase(deleteUserByAdmin.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentUser } = authSlice.actions;

export default authSlice.reducer;
