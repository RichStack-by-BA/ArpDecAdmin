import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from 'src/utils/encrypt-decrypt';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/forgot-password', '/reset-password', '/need-help'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Re-check token whenever location changes
  useEffect(() => {
    setIsChecking(true);
    const currentToken = getToken();
    setToken(currentToken);
    setIsChecking(false);
  }, [location.pathname]);

  // Show nothing while checking to prevent flash of content
  if (isChecking) {
    return null;
  }

  if (!token && !isPublicRoute) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}