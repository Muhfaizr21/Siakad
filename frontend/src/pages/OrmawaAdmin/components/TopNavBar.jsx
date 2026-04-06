import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const TopNavBar = ({ setIsOpen }) => {
  const { user, switchMockRole, mockRoles } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-[50] bg-white/80 backdrop-blur-md flex justify-between items-center px-4 lg:px-8 h-20 border-b border-outline-variant/5 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined font-black">menu</span>
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-surface-container-low/50 border border-outline-variant/30 px-5 py-3 rounded-[1.5rem] w-full max-w-xs lg:max-w-md transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 group shadow-sm hidden sm:flex">
          <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-[13px] w-full font-bold text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
            placeholder="Cari data..." 
            type="text" 
          />
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-outline-variant/50 bg-white/50 text-[10px] font-black text-on-surface-variant/60 shadow-inner">
            <span className="text-[12px]">⌘</span>K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Role Switcher - Hidden on small mobile */}
        <div className="hidden md:flex items-center gap-2">
           <select 
              value={user?.role?.id || ''}
              onChange={(e) => switchMockRole(parseInt(e.target.value))}
              className="bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-primary focus:border-primary px-4 py-2 cursor-pointer outline-none transition-all hover:bg-primary/10"
           >
              {mockRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
           </select>
        </div>

        <button className="text-on-surface-variant hover:text-primary transition-colors p-3 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5 hover:border-primary/30 relative group">
          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">notifications</span>
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 lg:pl-6 border-l border-outline-variant/10">
          <div className="text-right hidden sm:block">
             <div className="text-[13px] font-black text-on-surface leading-none mb-1">{user?.name}</div>
             <div className="text-[9px] text-primary font-black uppercase tracking-widest opacity-60">{user?.role?.name}</div>
          </div>
          <div className="w-11 h-11 bg-primary text-white rounded-2xl flex justify-center items-center font-black text-lg shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer border-2 border-white/50 overflow-hidden">
             {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
