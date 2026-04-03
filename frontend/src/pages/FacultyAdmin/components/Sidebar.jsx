import React from 'react';

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col w-64 border-r-0 bg-slate-50 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900 tracking-tight">BKU Student Hub</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Faculty Administration</p>
          </div>
        </div>
        <nav className="space-y-2 font-['Plus_Jakarta_Sans'] font-medium text-sm">
          {/* Active Navigation: Student Records */}
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl transition-transform text-blue-900 font-bold border-r-4 border-blue-900 bg-slate-100 translate-x-1" href="#">
            <span className="material-symbols-outlined">folder_shared</span>
            <span>Student Records</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-800 hover:bg-slate-200/50 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined">school</span>
            <span>Faculty Courses</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-800 hover:bg-slate-200/50 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span>Department Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-800 hover:bg-slate-200/50 transition-colors duration-200" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Faculty Settings</span>
          </a>
        </nav>
      </div>
      <div className="mt-auto p-8 space-y-2 border-t border-slate-100 font-['Plus_Jakarta_Sans'] font-medium text-sm">
        <a className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-blue-800 transition-colors" href="#">
          <span className="material-symbols-outlined">help</span>
          <span>Support</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors" href="#">
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
