import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-[#fafafa] font-body overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {/* This renders the child routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
