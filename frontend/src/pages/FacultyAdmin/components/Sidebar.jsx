import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/faculty', icon: 'dashboard' },
  { name: 'Validasi Proposal', path: '/faculty/validasi', icon: 'fact_check' },
  { name: 'Monitoring LPJ', path: '/faculty/lpj', icon: 'monitoring' },
  { name: 'Jadwal Kalender', path: '/faculty/jadwal', icon: 'calendar_today' },
  { name: 'Aspirasi Himpunan', path: '/faculty/aspirasi', icon: 'forum' },
  { name: 'Pusat Notifikasi', path: '/faculty/notifikasi', icon: 'notifications' },
  { name: 'Pengaturan', path: '/faculty/settings', icon: 'settings' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen z-[70]
        bg-[#1E293B] text-white
        transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined font-black">account_balance</span>
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-widest">SIAKAD</span>
              <p className="text-[10px] font-bold text-indigo-300 opacity-60 uppercase">Faculty Portal</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="px-4 py-2 space-y-1 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-[13px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#1e293b]/90 backdrop-blur-md border-t border-slate-700/50">
          <button 
            onClick={logout}
            className="w-full py-4 flex items-center justify-center gap-3 rounded-2xl bg-rose-500/10 text-rose-400 font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            LOGOUT FAKULTAS
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
