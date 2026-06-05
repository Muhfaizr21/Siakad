import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';
import useAuthStore from '../../../store/useAuthStore';

export default function OrmawaLayout() {
  const config = PORTAL_CONFIG.ormawa;
  const location = useLocation();
  const user = useAuthStore(state => state.user);

  const userPermissions = user?.permissions || user?.Permissions || [];
  const isSuperOrAdmin = user?.role === 'super_admin' || user?.role === 'ormawa_admin' || userPermissions.includes('*');

  // Find if current path is a menu item and requires a permission
  const currentPath = location.pathname;
  const allItems = (config.menu || []).flatMap(g => g.items || []);
  const currentItem = allItems.find(item => item.path === currentPath);

  if (currentItem?.permission && !isSuperOrAdmin && !userPermissions.includes(currentItem.permission)) {
    return <Navigate to="/403" replace />;
  }

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
}