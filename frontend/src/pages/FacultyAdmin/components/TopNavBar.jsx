import React from 'react';

const TopNavBar = ({ setIsOpen }) => {
  return (
    <header className="fixed top-2 right-4 left-4 lg:left-72 z-50 flex justify-between items-center px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-xl shadow-primary/5">
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger for mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">search</span>
          <input
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all outline-none"
            placeholder="Cari data, dosen, atau mahasiswa..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-primary hover:bg-white rounded-xl transition-all relative">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-primary hover:bg-white rounded-xl transition-all">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-black text-slate-900 leading-none mb-1">Prof. Dr. Sarah Chen</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80">Admin Fakultas</p>
          </div>
          <div className="relative">
            <img
              alt="Profile"
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
