import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import KencanaSidebar from './KencanaSidebar';
import KencanaTopNavBar from './KencanaTopNavBar';

const KencanaLayout = ({ children, portalType = 'admin' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        portalType={portalType} 
      />
      
      <main className="flex-1 flex flex-col h-full w-full lg:pl-72 transition-all duration-300 overflow-x-hidden">
        <KencanaTopNavBar setIsOpen={setIsSidebarOpen} portalType={portalType} />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 w-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default KencanaLayout;
