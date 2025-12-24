import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import SuperAdminRoute from 'src/components/SuperAdminRoute';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const AdminPage = lazy(() => import('src/pages/admin'));
export const AddAdminPage = lazy(() => import('src/pages/admin-add'));
export const CustomerPage = lazy(() => import('src/pages/customer'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const VerifyOtpPage = lazy(() => import('src/pages/verify-otp'));
export const ResetPasswordPage = lazy(() => import('src/pages/reset-password'));
export const NeedHelpPage = lazy(() => import('src/pages/need-help'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const AddProductPage = lazy(() => import('src/pages/product-add'));
 
export const EditProductPage = lazy(() => import('src/pages/product-edit'));
export const OrdersPage = lazy(() => import('src/pages/order'));
export const CategoryPage = lazy(() => import('src/pages/category'));
export const AddCategoryPage = lazy(() => import('src/pages/category-add'));
export const OfferPage = lazy(() => import('src/pages/offer'));
export const AddOfferPage = lazy(() => import('src/pages/offer-add'));
export const PolicyPage = lazy(() => import('src/pages/policy'));
export const AddPolicyPage = lazy(() => import('src/pages/policy-add'));
export const TaxPage = lazy(() => import('src/pages/tax'));
export const AddTaxPage = lazy(() => import('src/pages/tax-add'));
export const ProfilePage = lazy(() => import('src/pages/profile'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'admin', element: <SuperAdminRoute><AdminPage /></SuperAdminRoute> },
      { path: 'admin/add', element: <SuperAdminRoute><AddAdminPage /></SuperAdminRoute> },
      { path: 'admin/edit/:id', element: <SuperAdminRoute><AddAdminPage /></SuperAdminRoute> },
      { path: 'customer', element: <CustomerPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/add', element: <AddProductPage /> },
      { path: 'products/edit/:id', element: <EditProductPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'category', element: <CategoryPage /> },
      { path: 'category/add', element: <AddCategoryPage /> },
      { path: 'category/edit/:id', element: <AddCategoryPage /> },
      { path: 'offer', element: <OfferPage /> },
      { path: 'offer/add', element: <AddOfferPage /> },
      { path: 'offer/edit/:id', element: <AddOfferPage /> },
      { path: 'tax', element: <TaxPage /> },
      { path: 'tax/add', element: <AddTaxPage /> },
      { path: 'tax/edit/:id', element: <AddTaxPage /> },
      { path: 'policy', element: <PolicyPage /> },
      { path: 'policy/add', element: <AddPolicyPage /> },
      { path: 'policy/edit/:id', element: <AddPolicyPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'forgot-password',
    element: (
      <AuthLayout>
        <ForgotPasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: 'verify-otp',
    element: (
      <AuthLayout>
        <VerifyOtpPage />
      </AuthLayout>
    ),
  },
  {
    path: 'reset-password',
    element: (
      <AuthLayout>
        <ResetPasswordPage />
      </AuthLayout>
    ),
  },
  {
    path: 'need-help',
    element: (
      <AuthLayout>
        <NeedHelpPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
