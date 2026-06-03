import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-slate-50 bg-[radial-gradient(at_0%_0%,rgba(0,35,111,0.08)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(59,130,246,0.05)_0px,transparent_50%)] font-inter overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Sidebar for Mobile */}
      {mobileSidebarOpen && (
        <>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            aria-label="Tutup menu"
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* This renders the child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
