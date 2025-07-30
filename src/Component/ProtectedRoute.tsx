// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: ('company' | 'superadmin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { state } = useAuth();

  if (state.isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  if (!state?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles?.includes(state?.user?.domain_type as 'company' | 'superadmin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};