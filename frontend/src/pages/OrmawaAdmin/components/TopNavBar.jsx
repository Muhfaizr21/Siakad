import React from 'react';
import useAuthStore from '../../../store/useAuthStore';

const TopNavBar = ({ setIsOpen }) => {
  const user = useAuthStore(state => state.user);
  const mahasiswa = useAuthStore(state => state.mahasiswa);
  const name = user?.nama || mahasiswa?.Nama || user?.Email || 'User';
  const role = user?.role || 'Ormawa Admin';

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-15rem)] z-[50] bg-white/80 backdrop-blur-md flex justify-between items-center px-4 lg:px-6 h-16 border-b border-outline-variant/5 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined font-black text-[20px]">menu</span>
        </button>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-surface-container-low/50 border border-outline-variant/30 px-4 py-2 rounded-xl w-full max-w-xs lg:max-w-md transition-all duration-300 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 group shadow-sm hidden sm:flex">
          <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">search</span>
          <input 
            className="bg-transparent border-none focus:ring-0 text-[12px] w-full font-bold text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
            placeholder="Cari data..." 
            type="text" 
          />
          <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-outline-variant/50 bg-white/50 text-[9px] font-black text-on-surface-variant/60 shadow-inner">
            <span className="text-[10px]">⌘</span>K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2.5 rounded-xl bg-surface-container-low/50 border border-outline-variant/5 hover:border-primary/30 relative group">
          <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-3 lg:pl-4 border-l border-outline-variant/10">
          <div className="text-right hidden sm:block">
             <div className="text-[12px] font-black text-on-surface leading-none mb-0.5">{name}</div>
             <div className="text-[8px] text-primary font-black uppercase tracking-widest opacity-80">{role}</div>
          </div>
          <div className="w-9 h-9 bg-primary text-white rounded-xl flex justify-center items-center font-black text-base shadow-lg shadow-primary/20 hover:scale-105 transition-transform cursor-pointer border border-white/50 overflow-hidden">
             {name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
