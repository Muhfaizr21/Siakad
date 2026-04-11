import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has one of them
  if (allowedRoles.length > 0 && user) {
    const userRole = String(user.role || '').toLowerCase();
    const isAllowed = allowedRoles.some(role => role.toLowerCase() === userRole);
    
    if (!isAllowed) {
      // Redirect to a 403 page or home
      return <Navigate to="/403" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
