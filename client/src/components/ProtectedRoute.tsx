import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homePathForRole, useAuth } from '../auth/AuthContext';
import { Role } from '../api/types';
import { Spinner } from './ui';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Loading…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathForRole(user.role)} replace />;
  return <Outlet />;
}
