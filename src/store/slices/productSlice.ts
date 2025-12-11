import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  coverUrl: string;
  image: string;
  images: string[];
  colors: string[];
  status: boolean;
  isActive: boolean;
  stock: number;
  categoryId: string;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  priceSale: number | null;
  description?: string;
  specifications?: string;
  taxId?: string;
  policy?: string;
  variants?: Array<{
    name: string;
    images: string[];
    stock: number;
  }>;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  productLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  productLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8 } = params;
      const response = await api.get(`/product/all?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'product/addProduct',
  async (productData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/product/add', productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${productId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ productId, productData }: { productId: string; productData: any }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/product/edit/${productId}`, productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
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
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
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
              discountPrice: item.discountPrice || 0,
              coverUrl: item.thumbnail || item.images?.[0] || '',
              image: item.image || item.images?.[0] || '',
              images: item.images || [],
              colors: item.colors || [],
              status: item.isActive,
              isActive: item.isActive,
              stock: item.stock || 0,
              categoryId: item.categories?.[0]?._id || '',
              categories: item.categories || [],
              priceSale: item.discountPrice && item.discountPrice > 0 ? item.discountPrice : null,
            }))
          : [];
        state.totalCount = action.payload.data?.count || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally add the new product to the list
        // state.products.unshift(newProductFromResponse);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.productLoading = false;
        const item = action.payload.data?.product;
        if (item) {
          state.selectedProduct = {
            id: item._id,
            name: item.name,
            price: item.price,
            discountPrice: item.discountPrice || 0,
            coverUrl: item.thumbnail || item.images?.[0] || '',
            image: item.image || item.images?.[0] || '',
            images: item.images || [],
            colors: item.colors || [],
            status: item.isActive,
            isActive: item.isActive,
            stock: item.stock || 0,
            categoryId: item.categories?.[0] || '',
            categories: item.categories?.map((catId: string) => ({ _id: catId, name: '', slug: '' })) || [],
            priceSale: item.discountPrice && item.discountPrice > 0 ? item.discountPrice : null,
            description: item.description || '',
            specifications: item.specifications || '',
            taxId: item.taxId || '',
            policy: item.policy || '',
            variants: item.variants || [],
          };
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the product in the list
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProducts, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;