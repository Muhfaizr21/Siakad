import React, { useState, useEffect, useRef } from 'react';
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
              className="absolute top-full right-0 mt-3 w-64 rounded-2xl shadow-xl border overflow-hidden z-50"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              {/* User Info Header */}
              <div
                className="p-5 border-b"
                style={{
                  background: 'var(--theme-primary)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg border border-white/20"
                  >
                    {displayInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider truncate">{displayRole}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
                  style={{ color: 'var(--theme-error)' }}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}