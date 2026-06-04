import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';

export default function OrmawaLayout() {
  const config = PORTAL_CONFIG.ormawa;

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
}