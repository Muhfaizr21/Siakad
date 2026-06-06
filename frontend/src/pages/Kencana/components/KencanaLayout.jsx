import React from 'react';
import { Outlet } from 'react-router-dom';
import PortalShell from '../../../components/layout/PortalShell';
import { PORTAL_CONFIG } from '../../../components/layout/PortalConfig';
import useAuthStore from '../../../store/useAuthStore';

const KencanaLayout = ({ portalType = 'admin' }) => {
  const role = useAuthStore(state => state.user?.role);
  const effectivePortalType = portalType === 'mentor' ? 'mentor' : String(role || '').toLowerCase() === 'kencana_fakultas' ? 'fakultas' : 'admin';
  
  const configKey = effectivePortalType === 'mentor' 
    ? 'kencana_mentor' 
    : effectivePortalType === 'fakultas' 
      ? 'kencana_fakultas' 
      : 'kencana_admin';

  const config = PORTAL_CONFIG[configKey];

  return (
    <PortalShell config={config}>
      <Outlet />
    </PortalShell>
  );
};

export default KencanaLayout;