import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalShell from '../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../components/layout/PortalConfig';

export default function PsychologistLayout() {
  const config = PORTAL_CONFIG.psychologist;

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
}