import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { menuItems } from '../../constants/menuItems';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Tetap lanjutkan logout sisi client meskipun API gagal
    } finally {
      logout();
      toast.success('Berhasil logout');
      navigate('/login', { replace: true });
    }
  };

  const isActive = (itemPath) => {
    const currentPath = location.pathname;
    if (currentPath === itemPath) return true;
    if (itemPath === '/student/dashboard') return currentPath === '/student/dashboard' || currentPath === '/student';
    
    // For sub-paths
    if (currentPath.startsWith(itemPath)) {
      const moreSpecificMatch = menuItems.find(item => 
        item.path !== itemPath && 
        item.path.length > itemPath.length && 
        currentPath.startsWith(item.path)
      );
      return !moreSpecificMatch;
    }
    return false;
  };

  return (
    <aside className="w-[260px] md:w-64 bg-white border-r border-slate-200/60 h-screen sticky top-0 flex flex-col z-20 shrink-0 font-body select-none">
      {/* Logo Section */}
      <div className="px-6 py-8 flex items-center justify-between shrink-0">
        <Link to="/student/dashboard" className="flex items-center gap-3.5 group">
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
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Portal Mahasiswa</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar scroll-smooth pb-10 overscroll-contain space-y-1">
        <div className="mb-8 last:mb-0">
          <h3 className="px-4 mb-3 text-[10px] font-black text-slate-400/80 uppercase tracking-[0.25em]">
            Menu Utama
          </h3>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={`
                    relative flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold transition-all duration-300 group active:scale-[0.98]
                    ${active
                      ? 'bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <span className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                      <Icon size={20} strokeWidth={2.5} />
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
          </div>
        </div>
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
          <span className="text-[13px] tracking-tight flex-1 text-left font-bold text-rose-600/90 group-hover:text-rose-600 transition-colors duration-300 font-headline">
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
}
