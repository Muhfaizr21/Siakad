import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { Outlet } from 'react-router-dom';

const SuperAdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex font-sans overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col min-h-screen w-full lg:pl-72 transition-all duration-300">
        <TopNavBar setIsOpen={setIsSidebarOpen} />
        
        <div className="pt-20 flex-1">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
