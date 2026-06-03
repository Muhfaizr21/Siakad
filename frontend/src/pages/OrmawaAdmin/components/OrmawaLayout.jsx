import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { Outlet } from 'react-router-dom';

const OrmawaLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 bg-[radial-gradient(at_0%_0%,rgba(0,35,111,0.08)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(59,130,246,0.05)_0px,transparent_50%)] text-slate-900 h-screen font-inter overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="lg:ml-64 h-full flex flex-col transition-all duration-300 overflow-x-hidden">
        <TopNavBar setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-20 w-full relative">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default OrmawaLayout;
