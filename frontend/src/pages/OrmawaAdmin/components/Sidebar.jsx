import React from 'react';

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 flex flex-col p-4 z-50">
      <div className="mb-8 px-4 py-2">
        <h1 className="text-xl font-bold text-blue-900 font-headline">Admin Ormawa</h1>
        <p className="text-xs text-secondary font-medium tracking-wide">BKU University</p>
      </div>
      <nav className="flex-1 space-y-1">
        <a className="flex items-center gap-3 px-4 py-3 bg-blue-900 text-white rounded-lg transition-all font-plus-jakarta text-sm font-medium opacity-90" href="#">
          <span className="material-symbols-outlined">corporate_fare</span>
          Organization Profile
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
          <span className="material-symbols-outlined">event_available</span>
          Event Management
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
          <span className="material-symbols-outlined">group</span>
          Member Directory
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          Budget/Finance
        </a>
      </nav>
      <div className="pt-4 border-t border-slate-100 space-y-1">
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
          <span className="material-symbols-outlined">settings</span>
          Settings
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-plus-jakarta text-sm font-medium" href="#">
          <span className="material-symbols-outlined">logout</span>
          Logout
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
