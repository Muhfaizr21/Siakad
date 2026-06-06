import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';
import { SuperAdminOrmawaProvider } from '../../../contexts/SuperAdminOrmawaContext';

export default function SuperAdminLayout() {
  const config = PORTAL_CONFIG.superadmin;

  return (
    <SuperAdminOrmawaProvider>
      <PortalShell config={config}>
        <Outlet />
      </PortalShell>
    </SuperAdminOrmawaProvider>
  );
}