import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Order {
  id: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  userId: {
    _id: string;
    email: string;
  };
  items: Array<{
    productId: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
    _id: string;
  }>;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8 } = params;
      const response = await api.get(`/order/all?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrders: (state) => {
      state.orders = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.orders || [];
        state.orders = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id,
              shippingAddress: item.shippingAddress,
              userId: item.userId,
              items: item.items,
              paymentMethod: item.paymentMethod,
              paymentStatus: item.paymentStatus,
              orderStatus: item.orderStatus,
              totalAmount: item.totalAmount,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }))
          : [];
        state.totalCount = action.payload.data?.count || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOrders } = orderSlice.actions;
export default orderSlice.reducer;
