import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export default function PortalTopbar({ config, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const mahasiswa = useAuthStore(state => state.mahasiswa);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Build breadcrumb from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPage = pathParts.length > 1
    ? pathParts[pathParts.length - 1]
    : (pathParts[0] || 'Dashboard');

  const pageTitle = currentPage
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Find menu group label
  const getMenuGroup = () => {
    const allItems = config.menu.flatMap(g => g.items);
    const match = allItems.find(item => {
      if (item.path === location.pathname) return true;
      if (item.hasSubmenu && item.submenu?.some(s => s.path === location.pathname)) return true;
      if (location.pathname.startsWith(item.path) && item.path !== '/') {
        return !allItems.some(other =>
          other.path !== item.path &&
          other.path.length > item.path.length &&
          location.pathname.startsWith(other.path)
        );
      }
      return false;
    });
    if (match) {
      const group = config.menu.find(g => g.items.includes(match));
      return group?.group || '';
    }
    return '';
  };

  const menuGroup = getMenuGroup();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  // Get user display info
  const displayName = user?.name || user?.nama || user?.Nama || mahasiswa?.nama || 'User';
  const displayRole = user?.role || config.roleLabel || 'User';
  const displayInitial = String(displayName).charAt(0).toUpperCase();

  // Detect current portal and resolve valid routes
  const portalRoutes = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/admin'))         return { profile: '/admin/profile',     pengaturan: '/admin/theme' };
    if (p.startsWith('/ormawa'))        return { profile: null,                   pengaturan: '/ormawa/pengaturan' };
    if (p.startsWith('/faculty'))       return { profile: '/faculty/profile',     pengaturan: '/faculty/pengaturan' };
    if (p.startsWith('/psychologist'))  return { profile: '/psychologist/profile', pengaturan: null };
    if (p.startsWith('/student'))       return { profile: '/student/profile',     pengaturan: null };
    return { profile: null, pengaturan: null };
  }, [location.pathname]);

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 border-b transition-all duration-300 font-inter"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
      }}
    >
      {/* ─── Left: Hamburger + Breadcrumb ─── */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl transition-colors active:scale-95"
          style={{
            color: 'var(--theme-text-muted)',
            backgroundColor: 'var(--theme-bg)',
          }}
          aria-label="Buka menu"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-2 text-xs overflow-hidden">
          <span
            className="text-[10px] font-bold uppercase tracking-widest truncate"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {config.title}
          </span>
          <span style={{ color: 'var(--theme-text-muted)' }}>›</span>
          {menuGroup && (
            <>
              <span
                className="text-[10px] font-bold uppercase tracking-widest truncate hidden lg:block"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {menuGroup}
              </span>
              <span style={{ color: 'var(--theme-text-muted)' }}>›</span>
            </>
          )}
          <span
            className="text-xs font-semibold truncate max-w-[160px]"
            style={{ color: 'var(--theme-text)' }}
          >
            {pageTitle}
          </span>
        </nav>
      </div>

      {/* ─── Right: Actions + Profile ─── */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        {/* Search */}
        <button
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: 'var(--theme-bg)',
            color: 'var(--theme-text-muted)',
          }}
        >
          <span className="material-symbols-outlined text-lg">search</span>
          <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider">Cari</span>
          <span className="hidden xl:inline text-[9px] px-1.5 py-0.5 rounded bg-black/5 font-mono">⌘K</span>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl transition-colors hover:opacity-80 active:scale-95"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        {/* Separator */}
        <div
          className="hidden sm:block w-px h-8"
          style={{ backgroundColor: 'var(--theme-border)' }}
        />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 cursor-pointer p-1 pr-3 rounded-full transition-all border hover:shadow-sm active:scale-95"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {displayInitial}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="text-[11px] font-bold truncate max-w-[100px]"
                style={{ color: 'var(--theme-text)' }}
              >
                {displayName}
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                {displayRole}
              </span>
            </div>
            <span
              className="material-symbols-outlined text-lg hidden sm:block"
              style={{ fontSize: '16px', color: 'var(--theme-text-muted)' }}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div
              className="absolute top-full right-0 mt-3 w-72 rounded-2xl shadow-xl border overflow-hidden z-50"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              {/* User Info Header */}
              <div
                className="p-5 border-b relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary), color-mix(in srgb, var(--theme-primary) 70%, #000))',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                {/* Decorative circle */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-black text-xl border border-white/25 shrink-0 shadow-lg"
                  >
                    {displayInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-sm truncate leading-snug">{displayName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-white/60" style={{ fontSize: '11px' }}>mail</span>
                      <p className="text-[11px] text-white/70 font-medium truncate">{user?.Email || user?.email || '—'}</p>
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-white/15 border border-white/20 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-white/80" style={{ fontSize: '10px' }}>badge</span>
                      <span className="text-[9px] text-white/90 font-black uppercase tracking-widest">{displayRole}</span>
                    </div>
                  </div>
                </div>

                {/* Ormawa name if applicable */}
                {(mahasiswa?.ormawaName || user?.ormawaName || config?.orgName) && (
                  <div className="mt-3 flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl relative z-10">
                    <span className="material-symbols-outlined text-white/70" style={{ fontSize: '13px' }}>groups</span>
                    <span className="text-[10px] text-white/80 font-bold truncate">
                      {mahasiswa?.ormawaName || user?.ormawaName || config?.orgName}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="p-2">
                {portalRoutes.profile && (
                  <button
                    onClick={() => { navigate(portalRoutes.profile); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-black/[0.04] text-left"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                    </span>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-bold">Profil Saya</span>
                      <span className="text-[10px] mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>Lihat &amp; edit profil</span>
                    </div>
                  </button>
                )}

                {portalRoutes.pengaturan && (
                  <button
                    onClick={() => { navigate(portalRoutes.pengaturan); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-black/[0.04] text-left"
                    style={{ color: 'var(--theme-text)' }}
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                      <span className="material-symbols-outlined text-slate-500" style={{ fontSize: '16px' }}>settings</span>
                    </span>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-bold">Pengaturan</span>
                      <span className="text-[10px] mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>Tema &amp; preferensi</span>
                    </div>
                  </button>
                )}

                <div className="my-1.5 border-t" style={{ borderColor: 'var(--theme-border)' }} />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-red-50 text-left"
                  style={{ color: 'var(--theme-error)' }}
                >
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-500" style={{ fontSize: '16px' }}>logout</span>
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-bold">Keluar</span>
                    <span className="text-[10px] mt-0.5 text-red-400">Akhiri sesi</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}