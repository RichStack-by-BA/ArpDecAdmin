import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { api } from 'src/api';

export interface PresignedUrlResponse {
  url: string;
  key: string;
  bucket: string;
  fields: {
    'Content-Type': string;
  };
}

interface UploadState {
  loading: boolean;
  error: string | null;
  uploadedUrl: string | null;
}

const initialState: UploadState = {
  loading: false,
  error: null,
  uploadedUrl: null,
};

// Get presigned URL from backend
export const getPresignedUrl = createAsyncThunk<
  PresignedUrlResponse,
  { userId: string; contentType: string; fileSize: number },
  { rejectValue: string }
>('upload/getPresignedUrl', async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post('/image/presigned-url', payload);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to get presigned URL'
    );
  }
});

// Upload file to S3 using presigned URL
export const uploadFileToS3 = createAsyncThunk<
  string,
  { presignedUrl: string; file: File; contentType: string },
  { rejectValue: string }
>('upload/uploadFileToS3', async ({ presignedUrl, file, contentType }, { rejectWithValue }) => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
    });

    // Extract the base URL (without query parameters) as the final image URL
    const finalUrl = presignedUrl.split('?')[0];
    return finalUrl;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to upload file to S3');
  }
});

// Combined action to handle the complete upload flow
export const uploadImage = createAsyncThunk<
  string,
  { userId: string; file: File },
  { rejectValue: string }
>('upload/uploadImage', async ({ userId, file }, { dispatch, rejectWithValue }) => {
  try {
    // Step 1: Get presigned URL
    const presignedData = await dispatch(
      getPresignedUrl({
        userId,
        contentType: file.type,
        fileSize: file.size,
      })
    ).unwrap();

    // Step 2: Upload to S3
    const finalUrl = await dispatch(
      uploadFileToS3({
        presignedUrl: presignedData.url,
        file,
        contentType: file.type,
      })
    ).unwrap();

    return finalUrl;
  } catch (error: any) {
    return rejectWithValue(error || 'Error uploading image');
  }
});

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    clearUploadState: (state) => {
      state.loading = false;
      state.error = null;
      state.uploadedUrl = null;
    },
    clearUploadError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Presigned URL
      .addCase(getPresignedUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPresignedUrl.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getPresignedUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to get presigned URL';
      })
      // Upload to S3
      .addCase(uploadFileToS3.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFileToS3.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedUrl = action.payload;
      })
      .addCase(uploadFileToS3.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to upload file';
      })
      // Combined Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadedUrl = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error uploading image';
      });
  },
});

export const { clearUploadState, clearUploadError } = uploadSlice.actions;
export default uploadSlice.reducer;
