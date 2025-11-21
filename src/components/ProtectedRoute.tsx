import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from 'src/utils/encrypt-decrypt';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
const token = getToken();
  const location = useLocation();
  // console.log(token,'======token',location.pathname)

  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/forgot-password', '/reset-password', '/need-help'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (!token && !isPublicRoute) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}