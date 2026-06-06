import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles = [], requiredPermissions = [] }) => {
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles or permissions are specified, perform check
  if (user && (allowedRoles.length > 0 || requiredPermissions.length > 0)) {
    const userRoles = String(user.role || user.Role || '').toLowerCase().split(',').map(r => r.trim());
    const userPermissions = user.permissions || user.Permissions || [];

    // Super Admin or wildcard permission bypasses all checks
    if (userRoles.includes('super_admin') || userPermissions.includes('*')) {
      return children;
    }

    // 1. Check if user has one of the allowed roles
    const isAllowedRole = allowedRoles.length > 0 && allowedRoles.some(allowedRole => 
      userRoles.includes(allowedRole.toLowerCase())
    );
    if (isAllowedRole) {
      return children;
    }

    // 2. Check if user has one of the required permissions (fallback)
    if (requiredPermissions.length > 0) {
      const hasReqPerm = requiredPermissions.some(perm => userPermissions.includes(perm));
      if (hasReqPerm) {
        return children;
      }
    }

    // If both checks fail, deny access
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
