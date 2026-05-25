import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

const menuItems = [
  { name: 'Dashboard', path: '/psychologist', icon: 'dashboard' },
  { name: 'Janji Temu', path: '/psychologist/bookings', icon: 'schedule' },
  { name: 'Jadwal Praktek', path: '/psychologist/schedule', icon: 'calendar_month' },
  { name: 'Rekam Medis', path: '/psychologist/patients', icon: 'group' },
  { name: 'Tindak Lanjut', path: '/psychologist/referrals', icon: 'send' },
  { name: 'Analitik & Tren', path: '/psychologist/analytics', icon: 'bar_chart' },
  { name: 'Laporan Klinis', path: '/psychologist/reports', icon: 'description' },
  { name: 'Pusat Notifikasi', path: '/psychologist/notifications', icon: 'notifications' },
  { name: 'Pengaturan', path: '/psychologist/settings', icon: 'settings' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const isActive = (itemPath) => {
    const currentPath = location.pathname;
    if (currentPath === itemPath) return true;
    if (itemPath === '/psychologist') return currentPath === '/psychologist';
    return currentPath.startsWith(itemPath);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-[100dvh] z-[70]
        bg-white border-r border-slate-200/60
        transition-all duration-500 ease-in-out font-body
        flex flex-col overscroll-contain
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl shadow-primary/10' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
        {/* Logo Section */}
        <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <Link to="/psychologist" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-300 p-1.5 overflow-hidden">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                STUDENT HUB
              </span>
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Portal Psikolog</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined size-4 rotate-180">chevron_right</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 overflow-y-auto no-scrollbar scroll-smooth pb-10 overscroll-contain space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  relative flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold transition-all duration-300 group active:scale-[0.98]
                  ${active
                    ? 'bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} style={{ fontSize: '20px' }}>
                    {item.icon}
                  </span>
                </div>
                
                <span className="text-[13px] tracking-tight flex-1">{item.name}</span>
                
                {active ? (
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white/50" style={{ fontSize: '16px' }}>chevron_right</span>
                  </div>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" style={{ fontSize: '16px' }}>chevron_right</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Improved Logout Section */}
        <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-rose-600 hover:bg-rose-50/80 transition-all duration-300 group active:scale-[0.98]"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-rose-500/80 group-hover:text-rose-600 transition-all duration-300 group-hover:scale-110" style={{ fontSize: '20px' }}>
                logout
              </span>
            </div>
            <span className="text-[13px] tracking-tight flex-1 text-left font-bold text-rose-600/90 group-hover:text-rose-600 transition-colors duration-300">
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
