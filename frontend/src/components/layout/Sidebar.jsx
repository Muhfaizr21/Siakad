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
  const [isLogoutHovered, setIsLogoutHovered] = React.useState(false);

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
    <aside className="w-[260px] md:w-64 h-screen sticky top-0 flex flex-col z-20 shrink-0 font-inter select-none shadow-xl border-r border-white/10 transition-all duration-500"
      style={{
        background: `linear-gradient(to bottom, var(--theme-sidebar-bg), color-mix(in srgb, var(--theme-sidebar-bg) 90%, var(--theme-primary)))`,
        color: 'var(--theme-sidebar-text)'
      }}
    >
      {/* Logo Section */}
      <div className="px-6 py-6 flex items-center justify-between shrink-0 border-b border-white/10">
        <Link to="/student/dashboard" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 p-1.5 overflow-hidden">
              <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain brightness-110" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 shadow-sm" style={{ borderColor: 'var(--theme-sidebar-bg)' }}></div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-extrabold uppercase tracking-wider font-headline" style={{ color: 'var(--theme-sidebar-text)' }}>
              STUDENT HUB
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-headline" style={{ color: 'color-mix(in srgb, var(--theme-sidebar-text) 70%, var(--theme-secondary))' }}>Portal Mahasiswa</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar scroll-smooth pb-10 overscroll-contain space-y-1">
        <div className="mb-8 last:mb-0">
          <h3 className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.25em] font-headline"
              style={{ color: 'color-mix(in srgb, var(--theme-sidebar-text) 50%, transparent)' }}>
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
                    relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 group active:scale-[0.98] font-inter text-xs
                    ${active ? 'bg-white/10 border-l-4 shadow-md shadow-white/5' : 'hover:bg-white/5'}
                  `}
                  style={{
                    color: active ? 'var(--theme-sidebar-text)' : 'color-mix(in srgb, var(--theme-sidebar-text) 70%, transparent)',
                    borderLeftColor: active ? 'var(--theme-secondary)' : 'transparent'
                  }}
                >

                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className={`transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                          style={{ color: active ? 'var(--theme-secondary)' : 'color-mix(in srgb, var(--theme-sidebar-text) 60%, transparent)' }}>
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                  </div>

                  <span className="tracking-tight flex-1 font-medium">{item.name}</span>

                  {active ? (
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'color-mix(in srgb, var(--theme-sidebar-text) 50%, transparent)' }}>chevron_right</span>
                    </div>
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                            style={{ fontSize: '14px', color: 'color-mix(in srgb, var(--theme-sidebar-text) 50%, transparent)' }}>chevron_right</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Improved Logout Section */}
      <div className="p-4 bg-transparent border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-[0.98] text-xs cursor-pointer shadow-sm hover:shadow-md border border-transparent"
          style={{
            backgroundColor: isLogoutHovered ? '#b91c1c' : '#dc2626',
            color: '#ffffff'
          }}
        >
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <span 
              className="material-symbols-outlined transition-all duration-300 group-hover:scale-110" 
              style={{ 
                fontSize: '18px', 
                color: '#ffffff' 
              }}
            >
              logout
            </span>
          </div>
          <span className="tracking-tight flex-1 text-left font-semibold font-headline text-white">
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
}
