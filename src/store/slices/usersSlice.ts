import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  successMessage: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; role?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8, role } = params;
      const roleParam = role ? `&role=${role}` : '';
      const response = await api.get(`/user/all?page=${page}&limit=${limit}${roleParam}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch users'
      );
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/user/add', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create user'
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (userData: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    status?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { id, ...data } = userData;
      const response = await api.patch(`/user/edit/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update user'
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/user/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsers: (state) => {
      state.users = [];
      state.currentUser = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.users || action.payload.data || [];
        state.users = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id,
              name: item.name,
              email: item.email,
              phone: item.phone || '',
              role: item.role || 'admin',
              status: item.status !== false,
              createdAt: item.createdAt || '',
              updatedAt: item.updatedAt || '',
            }))
          : [];
        state.totalCount = action.payload.data?.totalCount || state.users.length;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'User created successfully';
        const newUser = action.payload.data;
        if (newUser) {
          state.users.unshift({
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone || '',
            role: newUser.role || 'admin',
            status: newUser.status !== false,
            createdAt: newUser.createdAt || '',
            updatedAt: newUser.updatedAt || '',
          });
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'User updated successfully';
        const updatedUser = action.payload.data;
        if (updatedUser) {
          const index = state.users.findIndex((user) => user.id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              phone: updatedUser.phone || '',
              role: updatedUser.role || 'admin',
              status: updatedUser.status !== false,
              createdAt: updatedUser.createdAt || '',
              updatedAt: updatedUser.updatedAt || '',
            };
          }
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload.data;
        if (user) {
          state.currentUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'admin',
            status: user.status !== false,
            createdAt: user.createdAt || '',
            updatedAt: user.updatedAt || '',
          };
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetUsers, clearMessages } = usersSlice.actions;
export default usersSlice.reducer;
