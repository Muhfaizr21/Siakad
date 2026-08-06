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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);
  const pathnames = location.pathname.split('/').filter((x) => x);

  const pages = [
    { name: 'Dashboard Utama', path: '/faculty', icon: 'grid_view' },
    { name: 'Data Mahasiswa', path: '/faculty/mahasiswa', icon: 'group' },
{ name: 'Monitor PKKMB', path: '/faculty/pkkmb', icon: 'database' },
    { name: 'Status Kesehatan', path: '/faculty/kesehatan', icon: 'medical_services' },
    { name: 'Student Voice', path: '/faculty/aspirasi', icon: 'campaign' },
    { name: 'Validasi Prestasi', path: '/faculty/prestasi', icon: 'emoji_events' },
    { name: 'Beasiswa Internal', path: '/faculty/beasiswa', icon: 'emoji_events' },
    { name: 'ORMAWA Hub', path: '/faculty/ormawa/proposals', icon: 'description' },
    { name: 'Organisasi Fakultas', path: '/faculty/organisasi', icon: 'group' },
    { name: 'Program Studi', path: '/faculty/prodi', icon: 'menu_book' },
    { name: 'Data Konseling', path: '/faculty/psikolog', icon: 'psychology' },
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

  // Close notif popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotifOpen]);

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

      'pkkmb': 'Monitor PKKMB',
      'kesehatan': 'Status Kesehatan',
      'aspirasi': 'Student Voice',
      'prestasi': 'Validasi Prestasi',
      'beasiswa': 'Beasiswa Internal',

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
      <header className="fixed top-0 right-0 left-0 lg:left-64 z-[50] h-20 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 font-inter transition-all duration-300">
        <div className="flex items-center gap-6 flex-1">
          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2.5 rounded-xl bg-white text-slate-600 hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Dynamic Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Portal</span>
              <span className="text-slate-300 mx-1">/</span>
              <div className="flex items-center">
                {pathnames.map((value, index) => {
                  const last = index === pathnames.length - 1;
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                  if (value.toLowerCase() === 'faculty' && index === 0) return null;

                  return (
                    <React.Fragment key={to}>
                      {index > 1 && (
                        <span className="material-symbols-outlined text-slate-300 mx-1.5 text-[14px] leading-none select-none">
                          chevron_right
                        </span>
                      )}
                      {last ? (
                        <span className="text-primary bg-primary/5 px-3 py-1.5 rounded-lg font-bold text-[11px] border border-primary/10 transition-all">
                          {getBreadcrumbLabel(value)}
                        </span>
                      ) : (
                        <Link
                          to={to}
                          className="text-slate-500 hover:text-primary font-bold text-[11px] transition-colors duration-200 px-1"
                        >
                          {getBreadcrumbLabel(value)}
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Premium Faculty Badge Indicator */}
          {facultyName && (
            <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold tracking-wider uppercase border border-emerald-100 shadow-sm">
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute opacity-40" />
                <span className="w-2 h-2 bg-emerald-500 rounded-full relative" />
              </div>
              {facultyName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          {/* Action Row */}
          <div className="flex items-center gap-3">
            {/* Search Trigger Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="group h-11 px-4 rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:bg-white hover:border-primary/30 text-slate-500 transition-all active:scale-95 flex items-center gap-3"
            >
              <span className="material-symbols-outlined group-hover:text-primary transition-colors text-[20px]">search</span>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-slate-500 transition-colors">Cari</span>
                <span className="text-[8px] font-medium text-slate-300 mt-0.5">Ctrl + K</span>
              </div>
            </button>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotifOpen(prev => !prev)}
                className={`w-11 h-11 flex items-center justify-center shrink-0 rounded-2xl border transition-all active:scale-95 ${
                  isNotifOpen
                    ? 'bg-primary/10 border-primary/20 text-primary shadow-inner'
                    : 'bg-slate-50/50 border-slate-200/80 hover:bg-white hover:border-primary/30 text-slate-500 hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${isNotifOpen ? 'scale-110' : ''}`}>notifications</span>
                {notifications.total > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white ring-4 ring-rose-500/10">
                    {notifications.total > 9 ? '9+' : notifications.total}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div
                  className="absolute top-14 right-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 z-[300] animate-in fade-in slide-in-from-top-2 duration-300 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pemberitahuan</h4>
                    {notifications.total > 0 && (
                      <span className="bg-rose-50 text-rose-600 font-bold text-[9px] px-2.5 py-1 rounded-full uppercase">
                        {notifications.total} Baru
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Proposal ORMAWA', icon: 'description', color: 'indigo', count: notifications.proposal, path: '/faculty/ormawa/proposals' },
                      { name: 'Student Voice', icon: 'campaign', color: 'primary', count: notifications.aspirasi, path: '/faculty/aspirasi' },
                      { name: 'Validasi Prestasi', icon: 'emoji_events', color: 'emerald', count: notifications.prestasi, path: '/faculty/prestasi' }
                    ].map((item, i) => (
                      <div 
                        key={i}
                        className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group/item border border-transparent hover:border-slate-100"
                        onClick={() => { navigate(item.path); setIsNotifOpen(false); }}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-${item.color === 'primary' ? 'primary/10' : item.color + '-50'} text-${item.color === 'primary' ? 'primary' : item.color + '-600'} flex items-center justify-center group-hover/item:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-slate-800 tracking-tight">{item.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.count || 0} Pengajuan</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => { navigate('/faculty'); setIsNotifOpen(false); }}
                    className="w-full mt-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-primary/5 transition-all border border-slate-100"
                  >
                    Lihat Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Calendar Button */}
            <button 
              onClick={() => navigate('/faculty/jadwal')}
              className="hidden sm:flex w-11 h-11 items-center justify-center shrink-0 rounded-2xl bg-slate-50/50 border border-slate-200/80 hover:bg-white hover:border-primary/30 text-slate-500 hover:text-primary transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </button>
          </div>

          <div className="h-8 w-[1.5px] bg-slate-200 mx-1 hidden sm:block"></div>

          {/* User Account Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer group p-1.5 pr-4 rounded-2xl transition-all duration-300 outline-none border border-slate-200/80 bg-white hover:shadow-lg hover:shadow-slate-200/50 max-w-[220px]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:rotate-3 transition-all shrink-0">
                   {user?.Email?.match(/^admin\.([a-zA-Z0-9]+)@/i)?.[1]?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col leading-none min-w-0 overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors truncate block w-full">
                    {user?.Email?.split('@')[0]}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">Fakultas Admin</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-all ml-1 shrink-0" style={{ fontSize: '18px' }}>expand_more</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 mt-4 rounded-[1.5rem] p-2 shadow-2xl border border-slate-100 bg-white/95 backdrop-blur-xl">
              <div className="px-4 py-3 mb-2 border-b border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Profil Admin</p>
                <p className="text-[11px] font-bold text-slate-800 truncate mt-1">{user?.Email}</p>
              </div>
              
              <DropdownMenuItem onClick={() => navigate('/faculty/pengaturan')} className="rounded-xl px-3 py-2.5 focus:bg-primary/5 group cursor-pointer transition-colors">
                <UserCircle className="mr-3 size-4 text-slate-400 group-focus:text-primary" style={{ fontSize: '18px' }} />
                <span className="text-xs font-bold text-slate-600 group-focus:text-slate-900">Detail Profil</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate('/faculty/pengaturan')} className="rounded-xl px-3 py-2.5 focus:bg-primary/5 group cursor-pointer transition-colors">
                <span className="material-symbols-outlined mr-3 size-4 text-slate-400 group-focus:text-primary" style={{ fontSize: '18px' }}>settings</span>
                <span className="text-xs font-bold text-slate-600 group-focus:text-slate-900">Pengaturan</span>
              </DropdownMenuItem>

              <div className="h-px bg-slate-50 my-2 mx-2"></div>
              
              <DropdownMenuItem 
                onClick={() => { logout(); navigate('/login'); }} 
                className="rounded-xl px-3 py-2.5 focus:bg-rose-50 group cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined mr-3 size-4 text-rose-400 group-focus:text-rose-600" style={{ fontSize: '18px' }}>logout</span>
                <span className="text-xs font-bold text-rose-500">Keluar Sistem</span>
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
