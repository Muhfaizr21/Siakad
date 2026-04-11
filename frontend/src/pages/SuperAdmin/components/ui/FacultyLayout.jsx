import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const FacultyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 h-screen font-body overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 h-full flex flex-col transition-all duration-300 relative">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="flex-1 overflow-y-auto pt-24 px-4 lg:px-8 pb-12 overflow-x-hidden scroll-smooth scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default FacultyLayout;
