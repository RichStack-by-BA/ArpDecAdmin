import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { getToken } from 'src/utils/encrypt-decrypt';

interface SuperAdminRouteProps {
  children: React.ReactNode;
}

export default function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { userDetails } = useSelector((state: any) => state.user);
  const token = getToken();

  if (!token || !userDetails || userDetails?.user?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
