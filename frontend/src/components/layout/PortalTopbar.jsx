import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import NotificationDropdown from './NotificationDropdown';
import { fetchWithAuth, adminService } from '../../services/api';

const getItemIcon = (name, path) => {
  const n = name.toLowerCase();
  const p = path.toLowerCase();
  if (n.includes('dashboard')) return 'grid_view';
  if (n.includes('mahasiswa') || n.includes('student')) return 'group';
  if (n.includes('dosen') || n.includes('lecturer')) return 'psychology_alt';
  if (n.includes('psikolog') || n.includes('psychologist')) return 'psychology';
  if (n.includes('prodi') || n.includes('program studi')) return 'school';
  if (n.includes('jadwal') || n.includes('calendar')) return 'calendar_month';
  if (n.includes('krs')) return 'app_registration';
  if (n.includes('nilai') || n.includes('grade')) return 'grade';
  if (n.includes('laporan') || n.includes('report')) return 'analytics';
  if (n.includes('pengaturan') || n.includes('setting')) return 'settings';
  if (n.includes('prestasi') || n.includes('achievement')) return 'emoji_events';
  if (n.includes('beasiswa') || n.includes('scholarship')) return 'workspace_premium';
  if (n.includes('proposal') || n.includes('ormawa')) return 'description';
  if (n.includes('organisasi')) return 'corporate_fare';
  if (n.includes('notif') || n.includes('notifikasi')) return 'notifications';
  return 'explore';
};

export default function PortalTopbar({ config, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const mahasiswa = useAuthStore(state => state.mahasiswa);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Search Palette State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [facultiesList, setFacultiesList] = useState([]);
  const [activeFacultyId, setActiveFacultyId] = useState(
    localStorage.getItem('superadmin_fakultas_id') || ''
  );

  const [studentsList, setStudentsList] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(
    localStorage.getItem('superadmin_impersonate_student_id') || ''
  );

  const [ormawasList, setOrmawasList] = useState([]);
  const [activeOrmawaId, setActiveOrmawaId] = useState(
    localStorage.getItem('superadmin_ormawa_id') || ''
  );

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchWithAuth('/api/admin/fakultas')
        .then(data => {
          if (data.status === 'success' && data.data) {
            setFacultiesList(data.data);
            if (!localStorage.getItem('superadmin_fakultas_id') && data.data.length > 0) {
              const firstId = String(data.data[0].id || data.data[0].ID);
              localStorage.setItem('superadmin_fakultas_id', firstId);
              setActiveFacultyId(firstId);
              window.dispatchEvent(new Event('storage'));
            }
          }
        })
        .catch(err => console.error('Gagal mengambil daftar fakultas:', err));

      adminService.getAllStudents()
        .then(res => {
          if (res.status === 'success' && res.data) {
            setStudentsList(res.data);
            if (!localStorage.getItem('superadmin_impersonate_student_id') && res.data.length > 0) {
              const firstId = String(res.data[0].id || res.data[0].ID);
              localStorage.setItem('superadmin_impersonate_student_id', firstId);
              setActiveStudentId(firstId);
              window.dispatchEvent(new Event('storage'));
            }
          }
        })
        .catch(err => console.error('Gagal mengambil daftar mahasiswa:', err));

      adminService.getAllOrmawa()
        .then(res => {
          if (res.status === 'success' && res.data) {
            setOrmawasList(res.data);
            if (!localStorage.getItem('superadmin_ormawa_id') && res.data.length > 0) {
              const firstId = String(res.data[0].id || res.data[0].ID);
              localStorage.setItem('superadmin_ormawa_id', firstId);
              setActiveOrmawaId(firstId);
              window.dispatchEvent(new Event('storage'));
            }
          }
        })
        .catch(err => console.error('Gagal mengambil daftar ormawa:', err));
    }
  }, [user]);

  const handleFacultyChange = (e) => {
    const newId = e.target.value;
    localStorage.setItem('superadmin_fakultas_id', newId);
    setActiveFacultyId(newId);
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  const handleStudentChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      localStorage.setItem('superadmin_impersonate_student_id', newId);
    } else {
      localStorage.removeItem('superadmin_impersonate_student_id');
    }
    setActiveStudentId(newId);
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  const handleOrmawaChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      localStorage.setItem('superadmin_ormawa_id', newId);
    } else {
      localStorage.removeItem('superadmin_ormawa_id');
    }
    setActiveOrmawaId(newId);
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

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
  const displayRole = user?.role_display || user?.role || config.roleLabel || 'User';
  const displayInitial = String(displayName).charAt(0).toUpperCase();

  // Detect current portal and resolve valid routes
  const portalRoutes = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/admin')) return { profile: '/admin/profile', pengaturan: '/admin/theme' };
    if (p.startsWith('/ormawa')) return { profile: null, pengaturan: '/ormawa/pengaturan' };
    if (p.startsWith('/faculty')) return { profile: '/faculty/profile', pengaturan: '/faculty/pengaturan' };
    if (p.startsWith('/psychologist')) return { profile: '/psychologist/profile', pengaturan: null };
    if (p.startsWith('/student')) return { profile: '/student/profile', pengaturan: null };
    return { profile: null, pengaturan: null };
  }, [location.pathname]);

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
    if (!config || !config.menu) return '';
    const allItems = config.menu.flatMap(g => g.items || []);
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
      const group = config.menu.find(g => (g.items || []).includes(match));
      return group?.group || '';
    }
    return '';
  };

  const menuGroup = getMenuGroup();

  const allSearchableItems = useMemo(() => {
    if (!config || !config.menu) return [];
    return config.menu.flatMap(group =>
      (group.items || []).flatMap(item => {
        const items = [];
        if (item.hasSubmenu && item.submenu) {
          item.submenu.forEach(sub => {
            items.push({ name: `${item.name} › ${sub.name}`, path: sub.path, group: group.group });
          });
        } else {
          items.push({ name: item.name, path: item.path, group: group.group });
        }
        return items;
      })
    );
  }, [config]);

  const filteredSearchItems = useMemo(() => {
    if (!searchQuery) return allSearchableItems.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return allSearchableItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.group.toLowerCase().includes(query)
    );
  }, [searchQuery, allSearchableItems]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        setSearchQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredSearchItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredSearchItems.length) % Math.max(1, filteredSearchItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSearchItems[selectedIndex]) {
        navigate(filteredSearchItems[selectedIndex].path);
        setIsSearchOpen(false);
      }
    }
  };

  return (
    <>
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

          {/* Faculty Switcher for Super Admin */}
          {user?.role === 'super_admin' && facultiesList.length > 0 && (
            <div className="flex items-center gap-2 ml-4 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1">
              <span className="material-symbols-outlined text-slate-400 !text-[16px]">corporate_fare</span>
              <select
                value={activeFacultyId}
                onChange={handleFacultyChange}
                className="bg-transparent border-0 text-slate-600 text-xs font-bold outline-none cursor-pointer p-0 pr-6 focus:ring-0"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              >
                {facultiesList.map(f => (
                  <option key={f.id || f.ID} value={f.id || f.ID}>
                    {f.nama || f.Nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Switcher for Super Admin on Student-focused pages */}
          {user?.role === 'super_admin' && studentsList.length > 0 && location.pathname.includes('/admin/student') && (
            <div className="flex items-center gap-2 ml-2 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1">
              <span className="material-symbols-outlined text-emerald-500 !text-[16px]">school</span>
              <select
                value={activeStudentId}
                onChange={handleStudentChange}
                className="bg-transparent border-0 text-emerald-700 text-xs font-bold outline-none cursor-pointer p-0 pr-6 focus:ring-0"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              >
                {studentsList.map(s => (
                  <option key={s.id || s.ID} value={s.id || s.ID}>
                    {s.Nama} ({s.NIM})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ormawa Switcher for Super Admin on Ormawa pages */}
          {user?.role === 'super_admin' && ormawasList.length > 0 && location.pathname.includes('/admin/ormawa') && (
            <div className="flex items-center gap-2 ml-2 bg-violet-50 border border-violet-100 rounded-xl px-2.5 py-1">
              <span className="material-symbols-outlined text-violet-500 !text-[16px]">groups</span>
              <select
                value={activeOrmawaId}
                onChange={handleOrmawaChange}
                className="bg-transparent border-0 text-violet-700 text-xs font-bold outline-none cursor-pointer p-0 pr-6 focus:ring-0"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              >
                {ormawasList.map(o => (
                  <option key={o.id || o.ID} value={o.id || o.ID}>
                    {o.Singkatan || o.Nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ─── Right: Actions + Profile ─── */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {/* Search */}
          <button
            onClick={() => { setIsSearchOpen(true); setSearchQuery(''); setSelectedIndex(0); }}
            title="Cari menu atau halaman (Ctrl+K)"
            className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl text-xs transition-all hover:opacity-80 active:scale-95 border"
            style={{
              backgroundColor: 'var(--theme-bg)',
              color: 'var(--theme-text-muted)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>search</span>
            <span
              className="hidden lg:inline text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
            >Ctrl K</span>
          </button>

          {/* Notifications */}
          <div className="flex items-center justify-center shrink-0">
            <NotificationDropdown />
          </div>

          {/* Separator */}
          <div
            className="hidden sm:block w-px h-8"
            style={{ backgroundColor: 'var(--theme-border)' }}
          />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 rounded-2xl transition-all border border-slate-200/60 bg-white hover:bg-slate-50/50 active:scale-[0.98] max-w-[400px]"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {displayInitial}
              </div>
              <div className="hidden sm:flex flex-col leading-none min-w-0 overflow-hidden text-left px-1">
                <span
                  className="text-xs font-bold truncate block w-full"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {displayName}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.05em] mt-1.5 opacity-60 truncate"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {String(displayRole).toUpperCase().includes('FACULTY') ? 'Admin Fakultas' : displayRole}
                </span>
              </div>
              <span
                className="material-symbols-outlined text-[18px] hidden sm:block ml-1 opacity-40 group-hover:opacity-100 transition-opacity"
                style={{ fontSize: '18px', color: 'var(--theme-text-muted)' }}
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
                  {(user?.ormawa_name || mahasiswa?.ormawaName || user?.ormawaName || config?.orgName) && (
                    <div className="mt-3 flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl relative z-10">
                      <span className="material-symbols-outlined text-white/70" style={{ fontSize: '13px' }}>groups</span>
                      <span className="text-[10px] text-white/80 font-bold truncate">
                        {user?.ormawa_name || mahasiswa?.ormawaName || user?.ormawaName || config?.orgName}
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

      {/* ─── Search Command Palette Modal ─── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[999] flex justify-center items-start pt-[15vh] p-4 animate-in fade-in duration-200"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-[0_32px_64px_-12px_rgba(15,23,42,0.15)] overflow-hidden flex flex-col max-h-[65vh] animate-in zoom-in-95 duration-250"
            onClick={e => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <span className="material-symbols-outlined text-slate-400 text-xl font-medium">search</span>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari menu, layanan, atau halaman..."
                className="flex-1 bg-transparent border-0 outline-none focus:outline-none focus:border-0 focus:ring-0 text-sm font-semibold text-slate-800 placeholder-slate-400 h-9 w-full shadow-none focus:shadow-none"
                style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
              />
              <span className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-mono text-[9px] font-bold text-slate-400 shadow-sm select-none">ESC</span>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 min-h-[150px] max-h-[320px] custom-scrollbar">
              {filteredSearchItems.length > 0 ? (
                <div className="space-y-1">
                  {filteredSearchItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const icon = getItemIcon(item.name, item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setIsSearchOpen(false); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-left border ${isSelected
                            ? 'bg-slate-50 border-slate-100 shadow-sm text-slate-900 font-semibold'
                            : 'text-slate-600 border-transparent hover:bg-slate-50/50'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'
                          }`}>
                          <span className="material-symbols-outlined text-lg">{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">{item.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{item.group}</span>
                        </div>
                        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isSelected ? 'text-slate-900 translate-x-0.5' : 'text-slate-300'
                          }`}>arrow_forward</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-3 text-slate-300 animate-pulse">search_off</span>
                  <p className="text-xs font-bold text-slate-500">Tidak ada hasil ditemukan</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Coba masukkan kata kunci yang berbeda atau navigasikan lewat sidebar menu.</p>
                </div>
              )}
            </div>

            {/* Command Palette Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] font-bold text-slate-400 select-none">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[14px] bg-white border border-slate-200 px-1 py-0.5 rounded shadow-xs leading-none">keyboard_arrow_up</span>
                  <span className="material-symbols-outlined !text-[14px] bg-white border border-slate-200 px-1 py-0.5 rounded shadow-xs leading-none">keyboard_arrow_down</span>
                  Navigasi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[12px] bg-white border border-slate-200 px-1 py-0.5 rounded shadow-xs leading-none">keyboard_return</span>
                  Pilih
                </span>
              </div>
              <span className="flex items-center gap-1 text-slate-300">Spotlight Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}