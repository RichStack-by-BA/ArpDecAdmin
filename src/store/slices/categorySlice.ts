import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  title?: string;
  image: string;
  description: string;
  status: boolean;
  parentId?: string | null;
}

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  successMessage: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8 } = params;
      const response = await api.get(`/category/all?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData: {
    name: string;
    slug?: string;
    title: string;
    description: string;
    image: string;
    parentId?: string | null;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/category/add', categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create category'
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async (categoryData: {
    id: string;
    name: string;
    slug?: string;
    title: string;
    description: string;
    image: string;
    parentId?: string | null;
  }, { rejectWithValue }) => {
    try {
      const { id, parentId, ...data } = categoryData;
      // Include id in the request body along with other fields
      const payload = {
        name: data.name,
        title: data.title,
        description: data.description,
        image: data.image,
        slug: data.slug || "",
        parentId: parentId || null,
        id,
      };
      const response = await api.patch(`/category/edit/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update category'
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/category/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category'
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
      state.currentCategory = null;
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
      // Fetch all categories
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
              title: item.title,
              image: item.image || '',
              description: item.description || '',
              status: item.status || false,
              parentId: item.parentId || null,
            }))
          : [];
        state.totalCount = action.payload.data?.count || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload.data?.category;
        if (item) {
          state.currentCategory = {
            id: item._id,
            name: item.name,
            slug: item.slug,
            title: item.title,
            image: item.image || '',
            description: item.description || '',
            status: item.status || false,
            parentId: item.parentId || null,
          };
        }
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Category created successfully';
        const item = action.payload.data?.category;
        if (item) {
          state.categories.push({
            id: item._id,
            name: item.name,
            slug: item.slug,
            title: item.title,
            image: item.image || '',
            description: item.description || '',
            status: item.status || false,
            parentId: item.parentId || null,
          });
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Category updated successfully';
        const item = action.payload.data?.category;
        if (item) {
          const index = state.categories.findIndex((cat) => cat.id === item._id);
          if (index !== -1) {
            state.categories[index] = {
              id: item._id,
              name: item.name,
              slug: item.slug,
              title: item.title,
              image: item.image || '',
              description: item.description || '',
              status: item.status || false,
              parentId: item.parentId || null,
            };
          }
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCategories, clearMessages } = categorySlice.actions;
export default categorySlice.reducer;