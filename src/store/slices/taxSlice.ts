import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Tax {
  id: string;
  name: string;
  rate: number;
  type: 'igst' | 'sgst' | 'cgst';
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TaxState {
  taxes: Tax[];
  currentTax: Tax | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: TaxState = {
  taxes: [],
  currentTax: null,
  loading: false,
  error: null,
  successMessage: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchTaxes = createAsyncThunk(
  'tax/fetchTaxes',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8 } = params;
      const response = await api.get(`/tax/all?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch taxes'
      );
    }
  }
);

export const fetchTaxById = createAsyncThunk(
  'tax/fetchTaxById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tax/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tax'
      );
    }
  }
);

export const createTax = createAsyncThunk(
  'tax/createTax',
  async (taxData: {
    name: string;
    rate: number;
    type: 'igst' | 'sgst' | 'cgst';
    status?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/tax/add', taxData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create tax'
      );
    }
  }
);

export const updateTax = createAsyncThunk(
  'tax/updateTax',
  async (taxData: {
    id: string;
    name: string;
    rate: number;
    type: 'igst' | 'sgst' | 'cgst';
    status?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { id, ...data } = taxData;
      const payload = {
        name: data.name,
        rate: data.rate,
        type: data.type,
        status: data.status ?? true,
        id,
      };
      const response = await api.patch(`/tax/edit/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update tax'
      );
    }
  }
);

const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {
    resetTaxes: (state) => {
      state.taxes = [];
      state.currentTax = null;
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
      // Fetch all taxes
      .addCase(fetchTaxes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxes.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.taxes || [];
        state.taxes = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id,
              name: item.name,
              rate: item.rate,
              type: item.type,
              status: item.status || false,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }))
          : [];
        state.totalCount = action.payload.data?.count || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchTaxes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch tax by ID
      .addCase(fetchTaxById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload.data?.tax;
        if (item) {
          state.currentTax = {
            id: item._id,
            name: item.name,
            rate: item.rate,
            type: item.type,
            status: item.status || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }
      })
      .addCase(fetchTaxById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create tax
      .addCase(createTax.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTax.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Tax created successfully';
        const item = action.payload.data?.tax;
        if (item) {
          state.taxes.push({
            id: item._id,
            name: item.name,
            rate: item.rate,
            type: item.type,
            status: item.status || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });
        }
      })
      .addCase(createTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update tax
      .addCase(updateTax.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTax.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Tax updated successfully';
        const item = action.payload.data?.tax;
        if (item) {
          const index = state.taxes.findIndex((tax) => tax.id === item._id);
          if (index !== -1) {
            state.taxes[index] = {
              id: item._id,
              name: item.name,
              rate: item.rate,
              type: item.type,
              status: item.status || false,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          }
        }
      })
      .addCase(updateTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetTaxes, clearMessages } = taxSlice.actions;
export default taxSlice.reducer;