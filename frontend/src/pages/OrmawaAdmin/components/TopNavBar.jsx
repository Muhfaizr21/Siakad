import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import api from '../../../lib/axios';

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const pathnames = location.pathname.split('/').filter((x) => x);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const [ormawaInfo, setOrmawaInfo] = useState(null);
  const [stats, setStats] = useState({ 
    totalProposals: 0, 
    totalEvents: 0, 
    unreadNotifications: 0 
  });

  const pages = [
    { name: 'Dashboard Performa', path: '/ormawa', icon: 'dashboard' },
    { name: 'Manajemen Anggota', path: '/ormawa/anggota', icon: 'group' },
    { name: 'Struktur Pengurus', path: '/ormawa/struktur', icon: 'account_tree' },
    { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: 'description' },
    { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: 'calendar_month' },
    { name: 'Sistem Absensi (QR)', path: '/ormawa/absensi', icon: 'qr_code' },
    { name: 'Pagu & Buku Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet' },
    { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: 'assignment' },
    { name: 'Aspirasi Masuk', path: '/ormawa/aspirasi', icon: 'campaign' },
    { name: 'Pusat Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications' },
  ];

  const getLogoPath = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseDomain = 'http://localhost:8000';
    return `${baseDomain}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/ormawa/profile');
      if (res.data.status === 'success') {
        const d = res.data.data;
        setOrmawaInfo({
          Nama: d?.Nama || d?.nama || '',
          Singkatan: d?.Singkatan || d?.singkatan || '',
          Kategori: d?.Kategori || d?.kategori || '',
          LogoURL: d?.LogoURL || d?.logo_url || d?.logoUrl || ''
        });
      }
    } catch (err) {
      console.error("Failed to fetch ormawa profile");
    }
  };

  const fetchStats = async () => {
    try {
      const ormawaId = user?.ormawa_id || user?.OrmawaID || user?.ormawaId || 1;
      const res = await api.get(`/ormawa/stats?ormawaId=${ormawaId}`);
      if (res.data.status === 'success') {
        setStats(prev => ({ ...prev, ...res.data.data }));
      }
      
      const notifRes = await api.get(`/ormawa/notifications?ormawaId=${ormawaId}`);
      if (notifRes.data.status === 'success') {
        const unread = (notifRes.data.data || []).filter(n => {
          const isRead = n.is_read ?? n.IsRead ?? false;
          return !isRead;
        }).length;
        setStats(prev => ({ ...prev, unreadNotifications: unread }));
      }
    } catch (err) {
      console.error("Failed to fetch ormawa stats");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
    
// Listen for setting and notification changes to live reload
    const handleSettingsUpdate = () => {
      fetchProfile();
    };
    const handleNotifsUpdate = () => {
      fetchStats();
    };
    window.addEventListener('ormawa_settings_updated', handleSettingsUpdate);
    window.addEventListener('ormawa_notifications_updated', handleNotifsUpdate);

    const interval = setInterval(fetchStats, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('ormawa_settings_updated', handleSettingsUpdate);
      window.removeEventListener('ormawa_notifications_updated', handleNotifsUpdate);
    };
  }, [user]);

  const filteredResults = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const getBreadcrumbLabel = (path) => {
    const labels = {
      'ormawa': 'Dashboard',
      'anggota': 'Anggota',
      'proposal': 'Proposal & Kegiatan',
      'jadwal': 'Kalender Kerja',
      'absensi': 'Presensi Digital',
      'keuangan': 'Pagu Keuangan',
      'lpj': 'Laporan LPJ',
      'aspirasi': 'Pusat Aspirasi',
      'notifikasi': 'Pemberitahuan',
      'pengaturan': 'Konfigurasi',
      'struktur': 'Struktur Pengurus',
      'rbac': 'Role & Akses',
    };
    return labels[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-[50] h-20 glass-card border-b border-white/40 flex items-center justify-between px-6 lg:px-10 font-body transition-all duration-300">
        <div className="flex items-center gap-6 flex-1">
          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen?.(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
          >
            <span className="material-symbols-outlined size-5" style={{ fontSize: '20px' }}>menu</span>
          </button>

          {/* Unified BKU Grid icon & Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-3 overflow-hidden">
            <div 
              className="p-2 rounded-xl flex items-center justify-center border shadow-sm shrink-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)', color: 'var(--theme-primary)' }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontSize: '18px' }}>grid_view</span>
            </div>
            <div className="flex items-center text-[10px] font-extrabold tracking-widest uppercase font-headline">
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return (
                  <React.Fragment key={to}>
                    {index > 0 && (
                      <span className="material-symbols-outlined text-slate-300 mx-2 text-[14px] leading-none select-none">
                        chevron_right
                      </span>
                    )}
                    {last ? (
                      <span className="text-slate-800 bg-slate-100/50 px-3 py-1 rounded-xl truncate max-w-[160px] border border-slate-200/30 normal-case font-extrabold text-[11px] font-body">
                        {getBreadcrumbLabel(value)}
                      </span>
                    ) : (
                      <Link
                        to={to}
                        className="text-slate-400 transition-all duration-200 truncate max-w-[150px]"
                        style={{ ':hover': { color: 'var(--theme-primary)' } }}
                      >
                        {getBreadcrumbLabel(value)}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </nav>

          {/* Premium Context Badge Indicator */}
          <div 
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-[10px] font-extrabold tracking-wider uppercase border shadow-sm"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', 
              color: 'var(--theme-primary)',
              borderColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-primary)' }} />
            {ormawaInfo?.Singkatan || ormawaInfo?.Kategori || "ORMAWA Hub"}
          </div>
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          {/* Action Row */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="h-10 px-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-bku-primary transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
              <span className="hidden sm:inline text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mr-1">CARI (Ctrl+K)</span>
            </button>

            {/* Notification Bell */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-bku-primary transition-all cursor-pointer group active:scale-95 shadow-sm">
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-12" style={{ fontSize: '20px' }}>notifications</span>
              {stats.unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-500/20 animate-pulse">
                  {stats.unreadNotifications}
                </span>
              )}

              {/* Popover Preview */}
              <div className="fixed sm:absolute top-20 sm:top-full left-4 right-4 sm:left-auto sm:right-0 mt-4 sm:w-80 w-auto glass-card rounded-3xl shadow-xl border border-white/40 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] cursor-default font-inter" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-[10px] font-bold font-headline uppercase tracking-widest" style={{ color: 'var(--theme-h4)' }}>Pemberitahuan</h4>
                  {stats.unreadNotifications > 0 && (
                    <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                      {stats.unreadNotifications} BARU
                    </Badge>
                  )}
                </div>
                <div className="space-y-3 text-left">
                  <div className="flex gap-4 items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => { navigate('/ormawa/proposal'); }}>
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600 group-hover/item:bg-orange-600 group-hover/item:text-white transition-colors flex items-center justify-center w-9 h-9 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-900 leading-none uppercase tracking-tight font-headline">Status Proposal</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 truncate">Pantau progress pengajuan proposal</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => { navigate('/ormawa/aspirasi'); }}>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors flex items-center justify-center w-9 h-9 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-900 leading-none uppercase tracking-tight font-headline">Aspirasi Masuk</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 truncate">Lihat feedback aspirasi terbaru</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Button */}
            <button 
              onClick={() => navigate('/ormawa/jadwal')}
              className="hidden sm:flex w-10 h-10 items-center justify-center shrink-0 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-bku-primary transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Premium Capsule Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 p-1 pr-3 rounded-full transition-all duration-300 outline-none border border-slate-200/60 bg-white shadow-sm hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-bku-primary to-indigo-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-900/10 group-hover:scale-105 transition-transform shrink-0 overflow-hidden ring-2 ring-white">
                  {ormawaInfo?.LogoURL ? (
                    <img 
                      src={getLogoPath(ormawaInfo.LogoURL)} 
                      alt="Logo Ormawa" 
                      className="w-full h-full object-contain p-1 bg-white" 
                    />
                  ) : (
                    ormawaInfo?.Singkatan?.[0] || user?.Email?.[0]?.toUpperCase() || 'O'
                  )}
                </div>
                <div className="hidden sm:flex flex-col leading-tight pr-1.5 shrink-0 text-left">
                  <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-bku-primary transition-colors truncate max-w-[100px]">
                    {ormawaInfo?.Nama || "Administrator"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Ormawa Admin</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 transition-colors" style={{ fontSize: '16px' }}>expand_more</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-1.5 shadow-xl border border-white/40 glass-card font-inter">
              <DropdownMenuItem onClick={() => navigate('/ormawa/pengaturan')} className="rounded-xl p-2.5 focus:bg-slate-50 group cursor-pointer transition-all">
                <span className="material-symbols-outlined mr-2.5 size-4 text-slate-400 group-hover:text-bku-primary transition-colors" style={{ fontSize: '16px' }}>settings</span>
                <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Pengaturan Profil</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              
              <DropdownMenuItem 
                onClick={() => {
                  logout();
                  navigate('/login');
                }} 
                className="rounded-xl p-2.5 focus:bg-rose-50 group cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined mr-2.5 size-4 text-rose-400 group-hover:text-rose-600 transition-colors" style={{ fontSize: '16px' }}>logout</span>
                <span className="text-[12px] font-bold text-rose-500 group-hover:text-rose-600 transition-colors">Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Spotlight Command Palette Search Overlay */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-start justify-center pt-[12vh] px-4 animate-in fade-in duration-200"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            ref={searchRef}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '22px' }}>search</span>
              <input
                ref={searchInputRef}
                autoFocus
                className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none h-6"
                placeholder="Ketik menu atau halaman ormawa yang dicari..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex items-center gap-1">
                <div className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-black text-slate-400 uppercase">
                  ESC
                </div>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 no-scrollbar">
              <div className="px-3 py-2 border-b border-slate-50 mb-1 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Hasil Pencarian ({filteredResults.length})</p>
              </div>

              {filteredResults.length > 0 ? (
                filteredResults.map((page, index) => (
                  <div
                    key={index}
                    onClick={() => handleNavigate(page.path)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all duration-200 group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-bku-primary/5 text-bku-primary flex items-center justify-center group-hover:bg-bku-primary group-hover:text-white transition-colors shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{page.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1 leading-tight text-left">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{page.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{page.path}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">arrow_forward</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-slate-300" style={{ fontSize: '40px' }}>find_in_page</span>
                  <p className="text-xs font-bold text-slate-400">Tidak ada fitur yang cocok</p>
                  <p className="text-[10px] text-slate-400/70 max-w-[200px]">Coba cari dengan kata kunci lain seperti 'anggota', 'keuangan', 'absensi'.</p>
                </div>
              )}
            </div>

            {/* Hotkeys Guide Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm text-slate-500">↑↓</span>
                <span>Navigasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm text-slate-500">Enter</span>
                <span>Pilih</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm text-slate-500">ESC</span>
                <span>Tutup</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavBar;
