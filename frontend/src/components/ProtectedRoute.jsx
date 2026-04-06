import React from 'react';
import { Navigate } from 'react-router-dom';
import { getDefaultRouteByRole, getSession, hasRole, isAuthenticated } from '../lib/auth';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length === 0) {
    return children;
  }

  const session = getSession();
  const role = session?.user?.role;

  if (!hasRole(allowedRoles)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return children;
}
