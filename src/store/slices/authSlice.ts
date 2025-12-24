import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { api } from 'src/api'; // Your axios instance

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk<
  string, // success return type
  { email: string; password: string }, // argument type
  { rejectValue: string } // reject payload type
>('auth/loginUser', async (credentials, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', credentials); // Correct endpoint
    return response.data.token; // Expecting { token: '...' }
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || 'Login failed'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.token = action.payload;
        localStorage.setItem('token', action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Something went wrong';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
