import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import PortalTopbar from './PortalTopbar';
import { PORTAL_CONFIG } from './PortalConfig';

export default function PortalShell({ config }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!config) {
    console.warn('[PortalShell] No config provided, rendering without sidebar');
    console.warn('[PortalShell] Available configs:', Object.keys(PORTAL_CONFIG || {}));
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

        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6"
          style={{ backgroundColor: 'var(--theme-bg)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Layout Builder (untuk build route config) ───────────────────────────────

/**
 * Helper untuk membuat route dengan portal shell.
 * Usage:
 *
 *   import { buildPortalLayout } from './PortalShell';
 *
 *   const routes = buildPortalLayout({
 *     configKey: 'superadmin',
 *     basePath: '/admin',
 *     allowedRoles: ['super_admin'],
 *     childRoutes: [
 *       { path: '', element: <Dashboard /> },
 *       { path: 'users', element: <Users /> },
 *     ]
 *   });
 */
export function buildPortalLayout({ configKey, basePath, allowedRoles, childRoutes, wrapper: Wrapper }) {
  // Loader yang resolve config dari role
  const resolveConfig = (role) => {
    const { PORTAL_CONFIG } = require('./PortalConfig');
    // Dynamic resolve based on path
    const pathToConfig = {
      '/admin': 'superadmin',
      '/student': 'student',
      '/faculty': 'faculty',
      '/ormawa': 'ormawa',
      '/kencana-admin': 'kencana_admin',
      '/kencana-fakultas': 'kencana_fakultas',
      '/kencana-mentor': 'kencana_mentor',
      '/psychologist': 'psychologist',
    };
    return PORTAL_CONFIG[pathToConfig[basePath] || configKey] || PORTAL_CONFIG.student;
  };

  return {
    path: basePath,
    element: (
      <Wrapper allowedRoles={allowedRoles}>
        <PortalShell configKey={configKey} resolveConfig={resolveConfig} />
      </Wrapper>
    ),
    children: childRoutes,
  };
}