import React from 'react';

const TopNavBar = () => {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-8 py-3 w-[calc(100%-16rem)] ml-64 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-['Plus_Jakarta_Sans'] outline-none" 
            placeholder="Search records, courses, or students..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="text-right">
            <p className="text-sm font-bold text-blue-900">Prof. Sarah Chen</p>
            <p className="text-[10px] text-slate-500 font-medium">Faculty Admin</p>
          </div>
          <img 
            alt="Professor Profile Photo" 
            className="w-10 h-10 rounded-full object-cover border-2 border-primary/10" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwu74GdWHYE1A_3DfCV8vsgmVITXHqJewt84r36aoABnRcJdIg9M1IKtLFJqpXNrJh4cECt-cU0R9hyXKuq1C8JKNGpjK4QCLqYx-Z7uHDve7YveU2inSQdQ81XtGCq5j742VhEpvF80w2uPLD0HEZO233TMUZ1b6ZxtuMGaNAjJ7c0oUTuonAYwsoR8qZR12Qo85lBxasx1vUdlPn2yU0awjn7waqfxldZ4Oa_fW6cojsMyoTLVGQ9ncb0gmXjUWNBGNPQbZHvWo_" 
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
