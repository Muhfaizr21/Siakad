import React from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown, Menu, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

const TopNavBar = ({ setIsOpen }) => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 z-[50] h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <LayoutGrid className="size-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">Portal Psikolog</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SIAKAD BKU</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-primary transition-all cursor-pointer">
          <Bell className="size-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[12px] font-black text-slate-900 leading-none">{user?.Email?.split('@')[0] || "Psikolog"}</p>
            <p className="text-[9px] font-bold text-primary mt-1 leading-none uppercase tracking-widest">Psikolog Klinis</p>
          </div>
          
          <div className="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 p-1 rounded-full transition-all">
            <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary/20">
              {user?.Email?.[0]?.toUpperCase() || 'P'}
            </div>
            <ChevronDown className="size-3 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
