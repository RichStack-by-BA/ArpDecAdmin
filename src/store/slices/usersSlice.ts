import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: string;
  status: boolean | string;
  isEmailVerified?: boolean;
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
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (role) {
        queryParams.append('role', role);
      }
      
      const response = await api.get(`/user/all?${queryParams.toString()}`);
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
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
    status?: string;
    isActive?: boolean;
  }, { rejectWithValue }) => {
    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        role: userData.role,
        status: userData.status || 'active',
        isActive: userData.isActive ?? true,
      };
      const response = await api.post('/user/add', payload);
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
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
    role: string;
    status?: string;
    isActive?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { id, ...data } = userData;
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        role: data.role,
        status: data.status || 'active',
        isActive: data.isActive ?? true,
      };
      if (data.password) {
        payload.password = data.password;
      }
      const response = await api.patch(`/user/edit/${id}`, payload);
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
              name: `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || '',
              firstName: item.firstName || '',
              lastName: item.lastName || '',
              email: item.email,
              phone: item.phone || '',
              role: item.role || 'admin',
              status: item.status === 'active' || item.status === true,
              isEmailVerified: typeof item.isEmailVerified !== 'undefined' ? item.isEmailVerified : undefined,
              createdAt: item.createdAt || '',
              updatedAt: item.updatedAt || '',
            }))
          : [];
        state.totalCount = action.payload.total || action.payload.data?.totalCount || action.payload.data?.total || state.users.length;
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
            name: `${newUser.firstName || ''} ${newUser.lastName || ''}`.trim() || newUser.name || '',
            firstName: newUser.firstName || '',
            lastName: newUser.lastName || '',
            email: newUser.email,
            phone: newUser.phone || '',
            role: newUser.role || 'admin',
            status: newUser.status === 'active' || newUser.status === true,
            isEmailVerified: typeof newUser.isEmailVerified !== 'undefined' ? newUser.isEmailVerified : undefined,
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
              name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.name || '',
              firstName: updatedUser.firstName || '',
              lastName: updatedUser.lastName || '',
              email: updatedUser.email,
              phone: updatedUser.phone || '',
              role: updatedUser.role || 'admin',
              status: updatedUser.status === 'active' || updatedUser.status === true,
              isEmailVerified: typeof updatedUser.isEmailVerified !== 'undefined' ? updatedUser.isEmailVerified : undefined,
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
        // Handle response with different wrapper structures: data, user, or direct
        const user = action.payload.data.user || action.payload.data || action.payload;
        if (user) {
          state.currentUser = {
            id: user._id || user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'admin',
            status: user.status === 'active' || user.status === true || user.isActive === true,
            isEmailVerified: typeof user.isEmailVerified !== 'undefined' ? user.isEmailVerified : undefined,
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
