import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  status: boolean;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/category/all');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetCategories: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.categories || [];
        state.categories = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id,
              name: item.name,
              slug: item.slug,
              image: item.image || '',
              description: item.description || '',
              status: item.status || false,
            }))
          : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCategories } = categorySlice.actions;
export default categorySlice.reducer;