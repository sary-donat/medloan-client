import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Convenience only: the role in AuthResponse is for display, and the server returns 403 to a non-admin anyway.
export default function RequireAdmin({ children }) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.token) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (auth.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
}
