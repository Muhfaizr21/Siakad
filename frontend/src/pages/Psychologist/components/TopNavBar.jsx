import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

const TopNavBar = ({ setIsOpen }) => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-[50] h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 transition-all duration-300 font-body">
      <div className="flex items-center gap-6 flex-1">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
        >
          <span className="material-symbols-outlined size-5">menu</span>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/5 text-primary">
            <span className="material-symbols-outlined size-4">grid_view</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Portal Psikolog</h1>
            <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">SIAKAD BKU</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-primary transition-all cursor-pointer">
          <span className="material-symbols-outlined size-5">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        {/* User Account Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:flex flex-col items-end mr-1 text-right">
            <p className="text-[12px] font-black text-slate-900 leading-none">{user?.Email?.split('@')[0] || "Psikolog"}</p>
            <p className="text-[9px] font-bold text-primary mt-1 leading-none uppercase tracking-widest">Psikolog Klinis</p>
          </div>
          
          <div 
            onClick={handleLogout}
            title="Keluar dari Portal"
            className="flex items-center gap-2 cursor-pointer hover:bg-rose-50 p-1.5 rounded-full transition-all group border border-transparent hover:border-rose-100"
          >
            <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20 group-hover:bg-rose-600 transition-colors overflow-hidden relative">
              {user?.FotoURL || user?.ProfilePicture ? (
                <img src={user.FotoURL || user.ProfilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-white/80" style={{ fontSize: '24px' }}>person</span>
              )}
            </div>
            <span className="material-symbols-outlined size-3.5 text-slate-400 group-hover:text-rose-600 transition-colors">logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
