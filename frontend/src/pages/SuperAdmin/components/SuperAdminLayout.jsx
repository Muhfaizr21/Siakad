import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';

export default function SuperAdminLayout() {
  const config = PORTAL_CONFIG.superadmin;

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
}