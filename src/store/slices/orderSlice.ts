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
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/order/all');
      return response.data;
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
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOrders } = orderSlice.actions;
export default orderSlice.reducer;
