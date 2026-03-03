import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/app/contexts/AuthContext';

interface RequireAdminRouteProps {
  children: ReactNode;
}

export function RequireAdminRoute({ children }: RequireAdminRouteProps) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Checking session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="text-muted-foreground">Your account is authenticated but not authorized as admin.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

