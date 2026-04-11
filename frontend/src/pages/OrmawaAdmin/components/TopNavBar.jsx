import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { fetchWithAuth, API_BASE_URL } from '../../../services/api';
import { cn } from '@/lib/utils';

const API = `${API_BASE_URL}/ormawa`;

// ─── Navigation pages for search ────────────────────────────────────────────
const NAV_PAGES = [
  { name: 'Dashboard', path: '/ormawa', icon: 'dashboard', keywords: ['beranda', 'home', 'dashboard', 'statistik'] },
  { name: 'KENCANA (PKKMB)', path: '/ormawa/pkkmb', icon: 'school', keywords: ['pkkmb', 'kencana', 'mahasiswa baru', 'maba', 'kuis'] },
  { name: 'Manajemen Anggota', path: '/ormawa/anggota', icon: 'group', keywords: ['anggota', 'member', 'keanggotaan'] },
  { name: 'Manajemen Staf', path: '/ormawa/staff', icon: 'groups', keywords: ['staf', 'staff', 'pengurus'] },
  { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: 'edit_note', keywords: ['proposal', 'lpj', 'kegiatan', 'program kerja'] },
  { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: 'calendar_today', keywords: ['jadwal', 'kalender', 'agenda', 'event'] },
  { name: 'Sistem Absensi (QR)', path: '/ormawa/absensi', icon: 'qr_code_scanner', keywords: ['absensi', 'hadir', 'qr', 'presensi'] },
  { name: 'Buku Kas & Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet', keywords: ['kas', 'keuangan', 'transaksi', 'uang', 'saldo'] },
  { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: 'folder_open', keywords: ['lpj', 'laporan', 'pertanggungjawaban'] },
  { name: 'Aspirasi Organisasi', path: '/ormawa/aspirasi', icon: 'light_mode', keywords: ['aspirasi', 'masukan', 'saran'] },
  { name: 'Siaran & Pengumuman', path: '/ormawa/pengumuman', icon: 'campaign', keywords: ['pengumuman', 'siaran', 'broadcast', 'info'] },
  { name: 'Struktur Pengurus', path: '/ormawa/struktur', icon: 'account_tree', keywords: ['struktur', 'organisasi', 'divisi', 'bagan'] },
  { name: 'Role & Hak Akses', path: '/ormawa/rbac', icon: 'admin_panel_settings', keywords: ['role', 'akses', 'izin', 'permission'] },
  { name: 'Pusat Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications', keywords: ['notifikasi', 'pemberitahuan'] },
  { name: 'Pengaturan Sistem', path: '/ormawa/pengaturan', icon: 'settings', keywords: ['pengaturan', 'setting', 'konfigurasi', 'profil ormawa'] },
];

// ─── Icon map for notification types ────────────────────────────────────────
const NOTIF_ICON_MAP = {
  proposal: 'edit_note',
  kegiatan: 'calendar_today',
  anggota: 'group',
  keuangan: 'account_balance_wallet',
  pengumuman: 'campaign',
  default: 'notifications',
};
const NOTIF_COLOR_MAP = {
  proposal: 'bg-blue-50 text-blue-600',
  kegiatan: 'bg-amber-50 text-amber-600',
  anggota: 'bg-violet-50 text-violet-600',
  keuangan: 'bg-emerald-50 text-emerald-600',
  pengumuman: 'bg-rose-50 text-rose-600',
  default: 'bg-slate-50 text-slate-500',
};

const TopNavBar = ({ setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const mahasiswa = useAuthStore(state => state.mahasiswa);
  const ormawaId = mahasiswa?.ormawaId || mahasiswa?.OrmawaID || mahasiswa?.ID || 1;

  const name = user?.nama || mahasiswa?.Nama || user?.Email || 'User';
  const role = user?.role || 'Ormawa Admin';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // ── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(false);

  // ── Refs for click-outside ─────────────────────────────────────────────────
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoadingNotif(true);
    try {
      const json = await fetchWithAuth(`${API}/notifications?ormawaId=${ormawaId}`);
      if (json.status === 'success') {
        setNotifications(json.data || []);
      } else {
        // demo fallback
        setNotifications([
          { ID: 1, Judul: 'Proposal diajukan', Pesan: 'Proposal "Webinar Nasional" telah diajukan.', Tipe: 'proposal', IsRead: false, CreatedAt: new Date().toISOString() },
          { ID: 2, Judul: 'Kegiatan baru', Pesan: 'Latihan rutin telah ditambahkan ke jadwal.', Tipe: 'kegiatan', IsRead: true, CreatedAt: new Date(Date.now() - 86400000).toISOString() },
          { ID: 3, Judul: 'Anggota baru', Pesan: '3 mahasiswa telah bergabung sebagai anggota.', Tipe: 'anggota', IsRead: false, CreatedAt: new Date(Date.now() - 172800000).toISOString() },
        ]);
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotif(false);
    }
  }, [ormawaId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.IsRead).length;

  // ── Mark one notification as read ─────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await fetchWithAuth(`${API}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.ID === id ? { ...n, IsRead: true } : n));
    } catch {}
  };

  // ── Mark all notifications as read ────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await fetchWithAuth(`${API}/notifications/read-all`, { method: 'PUT', body: JSON.stringify({ OrmawaID: ormawaId }), headers: { 'Content-Type': 'application/json' } });
      setNotifications(prev => prev.map(n => ({ ...n, IsRead: true })));
    } catch {}
  };

  // ── Search logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = NAV_PAGES.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.keywords.some(k => k.includes(q))
    ).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery]);

  const handleSearchNavigate = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearch(false);
  };

  // ── Click outside to close dropdowns ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowSearch(false); setShowNotif(false); setShowProfile(false);
  }, [location.pathname]);

  // ── Keyboard shortcut ⌘K ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setShowNotif(false);
        setShowProfile(false);
        setTimeout(() => searchRef.current?.querySelector('input')?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setShowSearch(false); setShowNotif(false); setShowProfile(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-15rem)] z-[50] bg-white/90 backdrop-blur-xl flex justify-between items-center px-4 lg:px-8 h-16 border-b border-slate-100 shadow-sm transition-all duration-300">

      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined font-black text-[20px]">menu</span>
        </button>

        {/* Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-sm lg:max-w-md hidden sm:block">
          <div
            className={cn(
              'flex items-center gap-3 bg-slate-50 border px-4 py-2 rounded-xl transition-all duration-200 cursor-text shadow-sm',
              showSearch ? 'border-primary/30 ring-4 ring-primary/10 bg-white' : 'border-slate-100 hover:border-slate-200'
            )}
            onClick={() => setShowSearch(true)}
          >
            <span className={cn('material-symbols-outlined text-lg transition-colors', showSearch ? 'text-primary' : 'text-slate-400')}>search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-[12px] w-full font-medium text-slate-900 placeholder:text-slate-400 outline-none"
              placeholder="Cari fitur, menu, atau halaman..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
            />
            {searchQuery ? (
              <button onClick={e => { e.stopPropagation(); setSearchQuery(''); }} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 bg-white/60 text-[9px] font-black text-slate-400">
                <span className="text-[10px]">⌘</span>K
              </div>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
              {searchResults.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-3xl block mb-2">search_off</span>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tidak ada hasil untuk "{searchQuery}"</p>
                </div>
              ) : (
                <div className="py-2">
                  <p className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Halaman</p>
                  {searchResults.map(r => (
                    <button
                      key={r.path}
                      onClick={() => handleSearchNavigate(r.path)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors group',
                        location.pathname === r.path && 'bg-primary/5'
                      )}
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', location.pathname === r.path ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary')}>
                        <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                      </div>
                      <div>
                        <p className={cn('text-[12px] font-black font-headline', location.pathname === r.path ? 'text-primary' : 'text-slate-900')}>{r.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{r.path}</p>
                      </div>
                      {location.pathname === r.path && (
                        <span className="ml-auto text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Halaman Ini</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Show recent pages when focused with empty query */}
          {showSearch && !searchQuery && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="py-2">
                <p className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Menu Cepat</p>
                {NAV_PAGES.slice(0, 5).map(r => (
                  <button
                    key={r.path}
                    onClick={() => handleSearchNavigate(r.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary">
                      <span className="material-symbols-outlined text-[16px]">{r.icon}</span>
                    </div>
                    <span className="text-[12px] font-black text-slate-700 group-hover:text-primary">{r.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: notification + profile */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">

        {/* ── Notification Bell ── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); setShowSearch(false); }}
            className={cn(
              'relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200',
              showNotif ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotif && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-black text-slate-900 font-headline">Notifikasi</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{unreadCount} belum dibaca</p>
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-colors">
                    Tandai semua
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {loadingNotif ? (
                  <div className="p-6 space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-2/3" />
                          <div className="h-2 bg-slate-100 rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                    <span className="material-symbols-outlined text-4xl">notifications_off</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <button
                      key={notif.ID}
                      onClick={() => { handleMarkRead(notif.ID); navigate('/ormawa/notifikasi'); setShowNotif(false); }}
                      className={cn(
                        'w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50/80 last:border-0',
                        !notif.IsRead && 'bg-primary/[0.02]'
                      )}
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', NOTIF_COLOR_MAP[notif.Tipe] || NOTIF_COLOR_MAP.default)}>
                        <span className="material-symbols-outlined text-[16px]">{NOTIF_ICON_MAP[notif.Tipe] || NOTIF_ICON_MAP.default}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[12px] font-black font-headline leading-tight', notif.IsRead ? 'text-slate-500' : 'text-slate-900')}>{notif.Judul}</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5 line-clamp-2">{notif.Pesan}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-1">
                        {!notif.IsRead && <div className="w-2 h-2 rounded-full bg-primary shadow shadow-primary/40 mt-1" />}
                        <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                          {notif.CreatedAt ? new Date(notif.CreatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-50">
                <button
                  onClick={() => { navigate('/ormawa/notifikasi'); setShowNotif(false); }}
                  className="w-full text-center text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest py-1 transition-colors"
                >
                  Lihat Semua Notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile ── */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); setShowSearch(false); }}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 border-l border-slate-100 group"
          >
            <div className="text-right hidden sm:block">
              <div className="text-[12px] font-black text-slate-900 leading-none mb-0.5">{name}</div>
              <div className="text-[8px] text-primary font-black uppercase tracking-widest opacity-80">{role}</div>
            </div>
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg transition-all duration-200 ring-2',
              showProfile ? 'bg-slate-900 text-white ring-slate-900 scale-95' : 'bg-primary text-white ring-primary/20 group-hover:ring-primary/40 group-hover:scale-105'
            )}>
              {initials}
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Header */}
              <div className="p-5 bg-gradient-to-br from-primary/5 to-transparent border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-slate-900 font-headline leading-tight truncate">{name}</p>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">{role}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {[
                  { label: 'Dashboard', icon: 'dashboard', path: '/ormawa' },
                  { label: 'Pengaturan Sistem', icon: 'settings', path: '/ormawa/pengaturan' },
                  { label: 'Pusat Notifikasi', icon: 'notifications', path: '/ormawa/notifikasi', badge: unreadCount },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setShowProfile(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors group"
                  >
                    <span className={cn('material-symbols-outlined text-[18px] transition-colors', location.pathname === item.path ? 'text-primary' : 'text-slate-400 group-hover:text-primary')}>{item.icon}</span>
                    <span className={cn('text-[12px] font-black flex-1', location.pathname === item.path ? 'text-primary' : 'text-slate-700 group-hover:text-slate-900')}>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div className="p-3 border-t border-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Keluar dari Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
