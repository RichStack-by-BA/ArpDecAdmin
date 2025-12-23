import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from 'src/api';

export interface Policy {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PolicyState {
  policies: Policy[];
  currentPolicy: Policy | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  totalCount: number;
  currentPage: number;
}

const initialState: PolicyState = {
  policies: [],
  currentPolicy: null,
  loading: false,
  error: null,
  successMessage: null,
  totalCount: 0,
  currentPage: 1,
};

export const fetchPolicies = createAsyncThunk(
  'policy/fetchPolicies',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 8 } = params;
      const response = await api.get(`/policy/all?page=${page}&limit=${limit}`);
      return { ...response.data, page };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch policies'
      );
    }
  }
);

export const fetchPolicyById = createAsyncThunk(
  'policy/fetchPolicyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/policy/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch policy'
      );
    }
  }
);

export const createPolicy = createAsyncThunk(
  'policy/createPolicy',
  async (policyData: {
    name: string;
    content: string;
    isActive?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/policy/add', policyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create policy'
      );
    }
  }
);

export const updatePolicy = createAsyncThunk(
  'policy/updatePolicy',
  async (policyData: {
    id: string;
    name: string;
    content: string;
    isActive?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { id, ...data } = policyData;
      const payload = {
        name: data.name,
        content: data.content,
        isActive: data.isActive ?? true,
        id,
      };
      const response = await api.patch(`/policy/edit/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update policy'
      );
    }
  }
);

const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {
    resetPolicies: (state) => {
      state.policies = [];
      state.currentPolicy = null;
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
      // Fetch all policies
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload.data?.policies || [];
        state.policies = Array.isArray(items)
          ? items.map((item: any) => ({
              id: item._id,
              name: item.name,
              content: item.content,
              isActive: item.isActive || false,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }))
          : [];
        state.totalCount = action.payload.total || action.payload.data?.totalCount || action.payload.data?.count || 0;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch policy by ID
      .addCase(fetchPolicyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyById.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload.data?.policy;
        if (item) {
          state.currentPolicy = {
            id: item._id,
            name: item.name,
            content: item.content,
            isActive: item.isActive || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        }
      })
      .addCase(fetchPolicyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create policy
      .addCase(createPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Policy created successfully';
        const item = action.payload.data?.policy;
        if (item) {
          state.policies.push({
            id: item._id,
            name: item.name,
            content: item.content,
            isActive: item.isActive || false,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });
        }
      })
      .addCase(createPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update policy
      .addCase(updatePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = 'Policy updated successfully';
        const item = action.payload.data?.policy;
        if (item) {
          const index = state.policies.findIndex((pol) => pol.id === item._id);
          if (index !== -1) {
            state.policies[index] = {
              id: item._id,
              name: item.name,
              content: item.content,
              isActive: item.isActive || false,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          }
        }
      })
      .addCase(updatePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPolicies, clearMessages } = policySlice.actions;
export default policySlice.reducer;
