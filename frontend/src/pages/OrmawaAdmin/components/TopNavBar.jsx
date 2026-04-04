import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const TopNavBar = () => {
  const { user, switchMockRole, mockRoles } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 h-16 border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 bg-surface-container-low/50 hover:bg-surface-container-low border border-outline-variant/30 px-5 py-2.5 rounded-2xl w-full max-w-md transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 group shadow-sm">
        <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-xl">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 text-[13px] w-full font-bold text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
          placeholder="Cari proposal, anggota, atau laporan..." 
          type="text" 
        />
        <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-outline-variant/50 bg-white/50 text-[10px] font-black text-on-surface-variant/60 shadow-inner">
          <span className="text-[12px]">⌘</span>K
        </div>
      </div>
      <div className="flex items-center gap-6">
        {/* Role Switcher */}
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-on-surface-variant">Simulasi Role:</span>
           <select 
              value={user?.role?.id || ''}
              onChange={(e) => switchMockRole(parseInt(e.target.value))}
              className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl focus:ring-primary focus:border-primary px-3 py-1.5 cursor-pointer outline-none"
           >
              {mockRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
           </select>
        </div>

        <button className="text-slate-500 hover:text-primary transition-colors focus:ring-2 ring-primary/20 p-2 rounded-full hidden md:block">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
             <div className="text-sm font-bold text-on-surface leading-tight">{user?.name}</div>
             <div className="text-[10px] text-on-surface-variant font-medium">{user?.role?.name}</div>
          </div>
          <div className="w-9 h-9 bg-primary/20 text-primary border border-primary/30 rounded-full flex justify-center items-center font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
