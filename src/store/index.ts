import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice'; // example slice
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    // add more slices here
  },
});

// Types for use in app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
