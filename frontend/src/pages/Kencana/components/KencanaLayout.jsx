import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import KencanaSidebar from './KencanaSidebar';
import KencanaTopNavBar from './KencanaTopNavBar';
import useAuthStore from '../../../store/useAuthStore';

const KencanaLayout = ({ children, portalType = 'admin' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = useAuthStore(state => state.user?.role);
  const effectivePortalType = portalType === 'mentor' ? 'mentor' : String(role || '').toLowerCase() === 'kencana_fakultas' ? 'fakultas' : 'admin';

  return (
    <div className="bg-[#fafafa] h-screen flex font-body overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <KencanaSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        portalType={effectivePortalType} 
      />
      
      <main className="flex-1 flex flex-col h-full w-full lg:pl-72 transition-all duration-300 overflow-x-hidden">
        <KencanaTopNavBar setIsOpen={setIsSidebarOpen} portalType={effectivePortalType} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 w-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default KencanaLayout;