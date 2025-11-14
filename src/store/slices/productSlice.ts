import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  coverUrl: string;
  colors: string[];
  status: string;
  priceSale: number | null;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/product/all');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.products = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.products || [];
        state.products = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id,
              name: item.name,
              price: item.price,
              coverUrl: item.thumbnail || item.images?.[0] || '',
              colors: item.colors || [],
              status: item.discountPrice && item.discountPrice > 0 ? 'sale' : 'new',
              priceSale: item.discountPrice && item.discountPrice > 0 ? item.discountPrice : null,
            }))
          : [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProducts } = productSlice.actions;
export default productSlice.reducer;