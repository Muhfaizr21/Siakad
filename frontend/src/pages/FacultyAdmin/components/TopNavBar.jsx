"use client"
import React, { useState, useRef, useEffect } from 'react'
import useAuthStore from '../../../store/useAuthStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Button } from './button'
import { Badge } from './badge'
import { API_BASE_URL } from '../../../services/api'

// Fallbacks for custom elements
const Command = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>
    keyboard_command_key
  </span>
);
const UserCircle = ({ size, className, ...props }) => (
  <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>
    account_circle
  </span>
);

const API = `${API_BASE_URL}/faculty`

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const pathnames = location.pathname.split('/').filter((x) => x);

  const pages = [
    { name: 'Dashboard Utama', path: '/faculty', icon: 'grid_view' },
    { name: 'Data Mahasiswa', path: '/faculty/mahasiswa', icon: 'group' },
    { name: 'Mahasiswa Baru', path: '/faculty/mahasiswa/baru', icon: 'add_circle' },
    { name: 'Monitor PKKMB', path: '/faculty/pkkmb', icon: 'database' },
    { name: 'Status Kesehatan', path: '/faculty/kesehatan', icon: 'medical_services' },
    { name: 'Student Voice', path: '/faculty/aspirasi', icon: 'campaign' },
    { name: 'Validasi Prestasi', path: '/faculty/prestasi', icon: 'emoji_events' },
    { name: 'Beasiswa Internal', path: '/faculty/beasiswa', icon: 'emoji_events' },
    { name: 'Jadwal Konseling', path: '/faculty/konseling', icon: 'headphones' },
    { name: 'E-Persuratan', path: '/faculty/persuratan', icon: 'description' },
    { name: 'ORMAWA Hub', path: '/faculty/ormawa/proposals', icon: 'description' },
    { name: 'Organisasi Fakultas', path: '/faculty/organisasi', icon: 'group' },
    { name: 'Program Studi', path: '/faculty/prodi', icon: 'menu_book' },
    { name: 'Manajemen Konten', path: '/faculty/konten', icon: 'campaign' },
    { name: 'Analisis Laporan', path: '/faculty/laporan', icon: 'pie_chart' },
    { name: 'Sistem & Pengaturan', path: '/faculty/pengaturan', icon: 'settings' },
  ];

  const [notifications, setNotifications] = useState({ aspirasi: 0, surat: 0, prestasi: 0, total: 0 });
  const [facultyName, setFacultyName] = useState("");

  const fetchNotifStats = async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API}/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.status === 'success') {
        setNotifications(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifStats();
    const interval = setInterval(fetchNotifStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hotkey handler (Ctrl+K or Command+K or /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle body scroll locking and input focusing
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      setSearchQuery("");
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  const filteredResults = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const getBreadcrumbLabel = (path) => {
    const labels = {
      'faculty': 'Portal Fakultas',
      'mahasiswa': 'Data Mahasiswa',
      'baru': 'Mahasiswa Baru',
      'pkkmb': 'Monitor PKKMB',
      'kesehatan': 'Status Kesehatan',
      'aspirasi': 'Student Voice',
      'prestasi': 'Validasi Prestasi',
      'beasiswa': 'Beasiswa Internal',
      'konseling': 'Jadwal Konseling',
      'persuratan': 'E-Persuratan',
      'ormawa': 'ORMAWA Hub',
      'proposals': 'Proposal & Anggaran',
      'organisasi': 'Organisasi Fakultas',
      'konten': 'Konten & Artikel',
      'laporan': 'Analisis Laporan',
      'prodi': 'Program Studi',
      'pengaturan': 'Sistem & Konfigurasi',
    };
    return labels[path.toLowerCase()] || path.charAt(0) + path.slice(1);
  };

  useEffect(() => {
    const fetchFacultyName = async () => {
      try {
        const token = useAuthStore.getState().accessToken;
        const res = await fetch(`${API}/faculties`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.status === 'success' && json.data && json.data.length > 0) {
          setFacultyName(json.data[0].Nama);
        }
      } catch (err) {
        console.error("Failed to fetch faculty name");
      }
    };
    fetchFacultyName();
  }, []);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-[50] h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 font-body transition-all duration-300">
        <div className="flex items-center gap-6 flex-1">
          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
          >
            <span className="material-symbols-outlined size-5" style={{ fontSize: '20px' }}>menu</span>
          </button>

          {/* Dynamic Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
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
                      <span className="text-slate-800 bg-slate-100 px-3 py-1 rounded-xl truncate max-w-[160px] border border-slate-200/50 normal-case font-extrabold text-[11px] font-body">
                        {getBreadcrumbLabel(value)}
                      </span>
                    ) : (
                      <Link
                        to={to}
                        className="text-slate-400 hover:text-primary transition-all duration-200 truncate max-w-[150px]"
                      >
                        {getBreadcrumbLabel(value)}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </nav>

          {/* Premium Faculty Badge Indicator */}
          {facultyName && (
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/5 text-emerald-600 rounded-2xl text-[10px] font-extrabold tracking-wider uppercase border border-emerald-500/10 shadow-sm shadow-emerald-500/5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {facultyName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          {/* Action Row */}
          <div className="flex items-center gap-2">
            {/* Search Trigger Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="h-10 px-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-primary transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>search</span>
              <span className="hidden sm:inline text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mr-1">CARI (Ctrl+K)</span>
            </button>

            {/* Notification Bell */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-primary transition-all cursor-pointer group active:scale-95 shadow-sm">
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-12" style={{ fontSize: '20px' }}>notifications</span>
              {notifications.total > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-500/20 animate-pulse">
                  {notifications.total > 9 ? '9+' : notifications.total}
                </span>
              )}

              {/* Popover Preview (Real Data) */}
              <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Inbox Antrean</h4>
                  {notifications.total > 0 && (
                    <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none font-black text-[9px] px-2 py-0.5 rounded-lg">
                      {notifications.total} BARU
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4 items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/ormawa/proposals')}>
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors flex items-center justify-center w-9 h-9 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">Proposal ORMAWA</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.proposal || 0} pengajuan baru</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/persuratan')}>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover/item:bg-amber-600 group-hover/item:text-white transition-colors flex items-center justify-center w-9 h-9 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">E-Persuratan</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.surat || 0} verifikasi surat</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/aspirasi')}>
                    <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors flex items-center justify-center w-9 h-9 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">Student Voice</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.aspirasi || 0} aspirasi baru</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/prestasi')}>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors flex items-center justify-center w-9 h-9 shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>emoji_events</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">Validasi Prestasi</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.prestasi || 0} klaim menunggu</p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => navigate('/faculty')} variant="ghost" className="w-full mt-4 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5">
                  Dashboard Utama
                </Button>
              </div>
            </div>

            {/* Calendar Button */}
            <button 
              onClick={() => navigate('/faculty/jadwal')}
              className="hidden sm:flex w-10 h-10 items-center justify-center shrink-0 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-primary transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Account Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 p-1 pr-3 rounded-full transition-all duration-300 outline-none border border-slate-200/60 bg-white shadow-sm hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-black text-sm ring-2 ring-white shadow-md shadow-primary/20 group-hover:scale-105 transition-all duration-300 shrink-0">
                   {user?.Email?.match(/^admin\.([a-zA-Z0-9]+)@/i)?.[1]?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col leading-tight pr-1.5 shrink-0">
                  <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-primary transition-colors truncate max-w-[100px]">
                    {user?.Email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Admin</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-slate-600 transition-colors" style={{ fontSize: '16px' }}>expand_more</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-1.5 shadow-xl border border-slate-100 bg-white">
              <div className="px-3 py-2 mb-1 border-b border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-headline">Akun Saya</p>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{user?.Email}</p>
              </div>
              
              <DropdownMenuItem onClick={() => navigate('/faculty/pengaturan')} className="rounded-xl p-2 focus:bg-slate-50 group cursor-pointer">
                <UserCircle className="mr-2 size-4 text-slate-400 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }} />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Profil</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/faculty/pengaturan')} className="rounded-xl p-2 focus:bg-slate-50 group cursor-pointer">
                <span className="material-symbols-outlined mr-2 size-4 text-slate-400 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }}>settings</span>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Pengaturan</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              
              <DropdownMenuItem 
                onClick={() => {
                  logout();
                  navigate('/login');
                }} 
                className="rounded-xl p-2 focus:bg-rose-50 group cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2 size-4 text-rose-400 group-hover:text-rose-600 transition-colors" style={{ fontSize: '16px' }}>logout</span>
                <span className="text-xs font-bold text-rose-500 group-hover:text-rose-600 transition-colors">Keluar</span>
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
                className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none h-6"
                placeholder="Ketik menu atau halaman yang ingin dicari..."
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
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Hasil Pencarian ({filteredResults.length})</p>
              </div>

              {filteredResults.length > 0 ? (
                filteredResults.map((page, index) => (
                  <div
                    key={index}
                    onClick={() => handleNavigate(page.path)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all duration-200 group active:scale-[0.99]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{page.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1 leading-tight">
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
                  <p className="text-[10px] text-slate-400/70 max-w-[200px]">Coba cari dengan kata kunci lain seperti 'mahasiswa', 'aspirasi', 'dosen'.</p>
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
  )
}

export default TopNavBar
