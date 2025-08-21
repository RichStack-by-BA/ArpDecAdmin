import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import App from './app';
import { store } from './store';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';
import ProtectedRoute from './components/ProtectedRoute';

// Add import for ProtectedRoute
// import ProtectedRoute from './components/ProtectedRoute';

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <ProtectedRoute>
        <App>
          <Outlet />
        </App>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);