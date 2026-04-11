import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#fafafa] font-body overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar for Mobile */}
      {mobileSidebarOpen && (
        <>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-[#171717]/35 backdrop-blur-[1px] z-40"
            aria-label="Tutup menu"
          />
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50">
            <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          {/* This renders the child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
