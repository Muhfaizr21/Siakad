import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const FacultyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-slate-50 bg-[radial-gradient(at_0%_0%,rgba(0,35,111,0.08)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(59,130,246,0.05)_0px,transparent_50%)] text-slate-900 h-screen font-inter overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 h-full flex flex-col transition-all duration-300 overflow-x-hidden">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-20 scroll-smooth w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default FacultyLayout;
