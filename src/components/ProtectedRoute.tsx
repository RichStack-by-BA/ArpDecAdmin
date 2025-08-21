import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.user);
  const location = useLocation();
  console.log(token,'======token',location.pathname)
debugger
  if (!token && location.pathname == '/sign-in') {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}