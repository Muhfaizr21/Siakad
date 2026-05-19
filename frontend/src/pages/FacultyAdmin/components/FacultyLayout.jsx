import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const FacultyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 h-screen font-body overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 h-full flex flex-col transition-all duration-300 overflow-x-hidden">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16 scroll-smooth w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default FacultyLayout;
