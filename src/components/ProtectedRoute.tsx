import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from 'src/utils/encrypt-decrypt';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
const token = getToken();
  const location = useLocation();
  console.log(token,'======token',location.pathname)

    if (!token && location.pathname !== '/sign-in') {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}