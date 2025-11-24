import { configureStore } from '@reduxjs/toolkit';

import taxReducer from './slices/taxSlice';
import userReducer from './slices/userSlice'; // example slice
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import orderReducer from './slices/orderSlice';
import uploadReducer from './slices/uploadSlice';
import policyReducer from './slices/policySlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    users: usersReducer,
    product: productReducer,
    order: orderReducer,
    category: categoryReducer,
    upload: uploadReducer,
    policy: policyReducer,
    tax: taxReducer,
    // add more slices here
  },
});

// Types for use in app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
