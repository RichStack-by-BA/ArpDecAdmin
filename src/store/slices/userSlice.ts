import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getToken, setToken } from 'src/utils/encrypt-decrypt';
import { api } from 'src/api';

// Extend state to handle loading and error
type UserState = {
  name: string;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
  userDetails: any | null;
};

const initialState: UserState = {
  name: '',
  isLoggedIn: false,
  loading: false,
  error: null,
  token: null,
  userDetails: null,
};

// Async thunk for login API
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  }
);

export const fetchUserDetails = createAsyncThunk(
  'user/fetchUserDetails',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return null;
      }
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch user details'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.name = '';
      state.isLoggedIn = false;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.name = action.payload.name || '';
        state.isLoggedIn = true;
        state.loading = false;
        state.error = null;
        state.token = action.payload.data || null;
        if (action.payload.data.token) {
          // const encrytedToken=encryptData(action.payload.data.token);
          setToken(action.payload.data.token)
          // localStorage.setItem('token', action.payload.data.token); // Save token to local storage
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.userDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;