import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import PortalTopbar from './PortalTopbar';


export default function PortalShell({ config }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!config) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <p>PortalShell: No config provided</p>
      </div>
    );
  }




  return (
    <div
      className="flex h-screen w-screen font-inter overflow-hidden"
      style={{ backgroundColor: 'var(--theme-bg)' }}
    >
      {/* ─── Desktop Sidebar ─── */}
      <div className="hidden lg:flex h-full shrink-0">
        <PortalSidebar config={config} />
      </div>

      {/* ─── Mobile Sidebar (overlay) ─── */}
      {mobileSidebarOpen && (
        <>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 backdrop-blur-sm animate-in fade-in duration-300"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            aria-label="Tutup menu"
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50">
            <PortalSidebar
              config={config}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        <PortalTopbar
          config={config}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Debug: show Outlet is rendering */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6" style={{ backgroundColor: 'var(--theme-bg)' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}