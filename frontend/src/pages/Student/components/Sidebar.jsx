import React from 'react';

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[#fcf9f8] flex flex-col pt-20 pb-8 px-4 border-r border-slate-100 hidden md:flex">
      <div className="mb-8 px-4">
        <h2 className="text-lg font-black text-blue-900 font-headline">BKU Hub</h2>
        <p className="text-xs font-['Plus_Jakarta_Sans'] text-slate-500 tracking-wide">Academic Portal</p>
      </div>
      <nav className="flex-1 space-y-1">
        <a className="flex items-center gap-3 bg-blue-50 text-blue-900 font-bold rounded-lg px-4 py-3 transition-transform duration-200" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">Overview</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-blue-800 hover:translate-x-1 transition-all" href="#">
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">My Courses</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-blue-800 hover:translate-x-1 transition-all" href="#">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">Schedule</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-blue-800 hover:translate-x-1 transition-all" href="#">
          <span className="material-symbols-outlined">grade</span>
          <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">Grades</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 hover:text-blue-800 hover:translate-x-1 transition-all" href="#">
          <span className="material-symbols-outlined">school</span>
          <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">Student Services</span>
        </a>
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-100">
        <button className="w-full bg-primary text-on-primary py-3 px-4 rounded-xl font-semibold text-sm mb-6 hover:shadow-lg transition-shadow">
          View Transcript
        </button>
        <div className="space-y-1">
          <a className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-blue-800 transition-all text-sm" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
          <a className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-error transition-all text-sm" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
