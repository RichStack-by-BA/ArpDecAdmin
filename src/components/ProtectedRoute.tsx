import type { RootState } from 'src/store';

import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const tokenObj = useSelector((state: RootState) => state.user);
  const location = useLocation();
  console.log(tokenObj?.token,'======token',location.pathname, children)

    if (!tokenObj?.token && location.pathname !== '/sign-in') {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}