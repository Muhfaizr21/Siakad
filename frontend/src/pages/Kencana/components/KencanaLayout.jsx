import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';

export default function KencanaLayout({ portalType = 'admin' }) {
  // Map portalType to config key
  const configMap = {
    admin: 'kencana_admin',
    fakultas: 'kencana_fakultas',
    mentor: 'kencana_mentor',
  };

  const configKey = configMap[portalType] || 'kencana_admin';
  const config = PORTAL_CONFIG[configKey];

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
}