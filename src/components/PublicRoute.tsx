import { Navigate } from 'react-router-dom';
import { getToken } from 'src/utils/encrypt-decrypt';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
