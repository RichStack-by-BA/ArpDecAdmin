
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Extend state to handle loading and error
type UserState = {
  name: string;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  token: string | null; 
};

const initialState: UserState = {
  name: '',
  isLoggedIn: false,
  loading: false,
  error: null,
  token: null,
};

// Async thunk for login API
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('http://13.60.253.221/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      const data = await response.json();
      return data; // Adjust based on your API response
    } catch (error: any) {
      return rejectWithValue(error.message);
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
        state.token = action.payload.token || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;