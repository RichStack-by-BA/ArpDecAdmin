import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { api } from 'src/api';

export interface Offer {
  id: string;
  title: string;
  slug: string;
  offerCode?: string;
  description: string;
  image: string;
  discountType?: string;
  discountValue?: number;
  discountPercentage?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimitPerUser?: number;
  totalUsageLimit?: number;
  usedCount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableTo?: string;
  status: boolean;
  isActive: boolean;
}

interface OfferState {
  offers: Offer[];
  currentOffer: Offer | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: OfferState = {
  offers: [],
  currentOffer: null,
  loading: false,
  error: null,
  successMessage: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchOffers = createAsyncThunk(
  'offer/fetchOffers',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8 } = params;
      const response = await api.get(`/offer/all?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch offers'
      );
    }
  }
);

export const createOffer = createAsyncThunk(
  'offer/createOffer',
  async (offerData: {
    title: string;
    slug?: string;
    description: string;
    image: string;
    discountPercentage?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/offer/add', offerData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create offer'
      );
    }
  }
);

export const updateOffer = createAsyncThunk(
  'offer/updateOffer',
  async (offerData: {
    id: string;
    title: string;
    description: string;
    offerCode: string;
    discountType: string;
    discountValue: number;
    minPurchaseAmount?: number | null;
    maxDiscountAmount?: number | null;
    validFrom: string;
    validTill: string;
    usageLimitPerUser?: number | null;
    totalUsageLimit?: number | null;
    applicableTo: string;
    applicableProducts?: string[];
    applicableCategories?: string[];
    isActive?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { id, ...data } = offerData;
      const response = await api.patch(`/offer/edit/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update offer'
      );
    }
  }
);

export const fetchOfferById = createAsyncThunk(
  'offer/fetchOfferById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/offer/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch offer'
      );
    }
  }
);

const offerSlice = createSlice({
  name: 'offer',
  initialState,
  reducers: {
    resetOffers: (state) => {
      state.offers = [];
      state.currentOffer = null;
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
      // Fetch all offers
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.offers || [];
        state.offers = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id || item.id,
              title: item.title,
              slug: item.slug,
              offerCode: item.offerCode || '',
              image: item.image || '',
              description: item.description || '',
              discountType: item.discountType,
              discountValue: item.discountValue,
              discountPercentage: item.discountPercentage,
              minPurchaseAmount: item.minPurchaseAmount,
              maxDiscountAmount: item.maxDiscountAmount,
              startDate: item.validFrom || item.startDate,
              endDate: item.validTill || item.endDate,
              usageLimitPerUser: item.usageLimitPerUser,
              totalUsageLimit: item.totalUsageLimit,
              usedCount: item.usedCount,
              applicableProducts: item.applicableProducts || [],
              applicableCategories: item.applicableCategories || [],
              applicableTo: item.applicableTo,
              status: item.status || false,
              isActive: item.isActive ?? true,
            }))
          : [];
        state.totalCount = action.payload.total || action.payload.data?.totalCount || action.payload.data?.count || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch offer by ID
      .addCase(fetchOfferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOfferById.fulfilled, (state, action) => {
        state.loading = false;
        // Handle nested response structure: data.offer.data
        const item = action.payload.data?.offer?.data || action.payload.data?.offer;
        if (item) {
          state.currentOffer = {
            id: item._id || item.id,
            title: item.title,
            slug: item.slug || '',
            offerCode: item.offerCode || '',
            image: item.image || '',
            description: item.description || '',
            discountType: item.discountType,
            discountValue: item.discountValue,
            discountPercentage: item.discountPercentage,
            minPurchaseAmount: item.minPurchaseAmount,
            maxDiscountAmount: item.maxDiscountAmount,
            startDate: item.validFrom || item.startDate,
            endDate: item.validTill || item.endDate,
            usageLimitPerUser: item.usage?.perUser || item.usageLimitPerUser,
            totalUsageLimit: item.usage?.totalLimit || item.totalUsageLimit,
            usedCount: item.usage?.usedCount || item.usedCount || 0,
            applicableProducts: Array.isArray(item.applicableProducts) 
              ? item.applicableProducts.map((p: any) => typeof p === 'string' ? p : p.id) 
              : [],
            applicableCategories: Array.isArray(item.applicableCategories) 
              ? item.applicableCategories.map((c: any) => typeof c === 'string' ? c : c.id) 
              : [],
            applicableTo: item.applicableTo,
            status: item.status || false,
            isActive: item.isActive ?? true,
          };
        }
      })
      .addCase(fetchOfferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create offer
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Offer created successfully';
        const item = action.payload.data?.offer;
        if (item) {
          state.offers.unshift({
            id: item._id,
            title: item.title,
            slug: item.slug,
            offerCode: item.offerCode || '',
            image: item.image || '',
            description: item.description || '',
            discountType: item.discountType,
            discountValue: item.discountValue,
            discountPercentage: item.discountPercentage,
            minPurchaseAmount: item.minPurchaseAmount,
            maxDiscountAmount: item.maxDiscountAmount,
            startDate: item.validFrom || item.startDate,
            endDate: item.validTill || item.endDate,
            usageLimitPerUser: item.usageLimitPerUser,
            totalUsageLimit: item.totalUsageLimit,
            usedCount: item.usedCount,
            applicableProducts: item.applicableProducts || [],
            applicableCategories: item.applicableCategories || [],
            applicableTo: item.applicableTo,
            status: item.status || false,
            isActive: item.isActive ?? true,
          });
        }
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update offer
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message || 'Offer updated successfully';
        const item = action.payload.data?.offer;
        if (item) {
          const index = state.offers.findIndex((o) => o.id === item._id);
          if (index !== -1) {
            state.offers[index] = {
              id: item._id,
              title: item.title,
              slug: item.slug,
              offerCode: item.offerCode || '',
              image: item.image || '',
              description: item.description || '',
              discountType: item.discountType,
              discountValue: item.discountValue,
              discountPercentage: item.discountPercentage,
              minPurchaseAmount: item.minPurchaseAmount,
              maxDiscountAmount: item.maxDiscountAmount,
              startDate: item.validFrom || item.startDate,
              endDate: item.validTill || item.endDate,
              usageLimitPerUser: item.usageLimitPerUser,
              totalUsageLimit: item.totalUsageLimit,
              usedCount: item.usedCount,
              applicableProducts: item.applicableProducts || [],
              applicableCategories: item.applicableCategories || [],
              applicableTo: item.applicableTo,
              status: item.status || false,
              isActive: item.isActive ?? true,
            };
          }
        }
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetOffers, clearMessages } = offerSlice.actions;
export default offerSlice.reducer;
