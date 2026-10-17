import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Only stops navigation to a protected page without a token. The server checks every request anyway.
export default function RequireAuth({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
