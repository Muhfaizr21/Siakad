import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { Outlet } from 'react-router-dom';

const SuperAdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 bg-[radial-gradient(at_0%_0%,rgba(0,35,111,0.08)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(59,130,246,0.05)_0px,transparent_50%)] h-screen flex font-inter overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-full w-full lg:pl-72 transition-all duration-300 overflow-x-hidden">
        <TopNavBar setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-20 w-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
