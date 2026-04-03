import React from 'react';

const Sidebar = () => {
  return (
    <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-slate-50 border-r border-slate-200/50 z-50 font-['Plus_Jakarta_Sans'] text-sm tracking-wide">
      <div className="flex flex-col h-full py-8 px-4">
        {/* Header Brand */}
        <div className="px-4 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">account_balance</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-blue-900 leading-tight">Super Admin</h1>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">Institutional Control</p>
          </div>
        </div>
        
        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1">
          {/* Analytics is Active by Intent */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined">group</span>
            <span>User Management</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined">gavel</span>
            <span>Content Moderation</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-900 font-bold border-r-4 border-blue-900 bg-blue-50/50 transition-all cursor-pointer">
            <span className="material-symbols-outlined">analytics</span>
            <span>Analytics</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined">settings_suggest</span>
            <span>System Settings</span>
          </div>
        </nav>

        {/* CTA */}
        <div className="mt-auto px-4 py-6">
          <button className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined text-sm">description</span>
            Generate Report
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-200/50 pt-4 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container/20 transition-all cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
