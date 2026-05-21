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

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Command = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>keyboard_command_key</span>;
const UserCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>account_circle</span>;



const API = `${API_BASE_URL}/faculty`

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
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
  const [loadingNotif, setLoadingNotif] = useState(false);

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
    // Refresh setiap 30 detik untuk real-time feel
    const interval = setInterval(fetchNotifStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredResults = pages.filter(page =>
    page.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
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

  const [facultyName, setFacultyName] = useState("");

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
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-[50] h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 font-body transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
        >
          <span className="material-symbols-outlined size-5" style={{ fontSize: '18px' }} >menu</span>
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2.5 overflow-hidden">
          <div className="p-2.5 rounded-2xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
            <span className="material-symbols-outlined size-4" style={{ fontSize: '16px' }} >grid_view</span>
          </div>
          <div className="flex items-center text-[11px] font-black tracking-[0.15em] uppercase font-headline">
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;

              return (
                <React.Fragment key={to}>
                  {index > 0 && <span className="text-slate-300 mx-2.5 font-normal text-[10px] select-none">/</span>}
                  {last ? (
                    <span className="text-slate-900 truncate max-w-[150px]">
                      {getBreadcrumbLabel(value)}
                    </span>
                  ) : (
                    <Link
                      to={to}
                      className="text-slate-400 hover:text-primary transition-colors truncate max-w-[150px]"
                    >
                      {getBreadcrumbLabel(value)}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Global Search Interface */}
        <div ref={searchRef} className="relative w-full max-w-sm hidden xl:flex flex-col items-center group ml-4">
          <div className="relative w-full flex items-center">
            <div className="absolute left-4 p-0.5 rounded transition-colors group-focus-within:text-primary text-slate-400">
              <span className="material-symbols-outlined size-4 stroke-[2.5px]" style={{ fontSize: '18px' }} >search</span>
            </div>
            <input
              ref={searchInputRef}
              className="w-full h-10 pl-11 pr-11 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white rounded-2xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              placeholder="Cari fitur atau halaman... (Press /)"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            <div className="absolute right-4 flex items-center gap-1 opacity-45 group-focus-within:opacity-100 transition-opacity">
              <div className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9px] font-black text-slate-500 flex items-center gap-0.5">
                <Command className="size-2 text-[10px]" style={{ fontSize: '10px' }} />
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Hasil Pencarian</p>
              </div>
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                {filteredResults.length > 0 ? (
                  filteredResults.map((page, index) => (
                    <div
                      key={index}
                      onClick={() => handleNavigate(page.path)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined size-4" style={{ fontSize: '16px' }} >{page.icon}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{page.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-medium text-slate-400">Tidak ada fitur yang cocok</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Roomier Action Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="relative p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 text-slate-500 hover:text-primary transition-all cursor-pointer group">
            <span className="material-symbols-outlined size-5 active:scale-90 transition-transform" style={{ fontSize: '20px' }} >notifications</span>
            {notifications.total > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-500/20 animate-pulse">
                {notifications.total > 9 ? '9+' : notifications.total}
              </span>
            )}

            {/* Popover Preview (Real Data) */}
            <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Inbox Antrean</h4>
                {notifications.total > 0 && (
                  <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none font-black text-[9px] px-2 py-0.5">
                    {notifications.total} NEW
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/ormawa/proposals')}>
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover/item:bg-indigo-100 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined size-4" style={{ fontSize: '18px' }} >description</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">Proposal ORMAWA</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.proposal} antrean pengajuan baru</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/persuratan')}>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover/item:bg-amber-100 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined size-4" style={{ fontSize: '18px' }} >mail</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">E-Persuratan</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.surat} berkas menunggu verifikasi</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/aspirasi')}>
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover/item:bg-primary transition-colors group-hover/item:text-white flex items-center justify-center">
                    <span className="material-symbols-outlined size-4" style={{ fontSize: '18px' }} >campaign</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">Student Voice</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.aspirasi} aspirasi baru masuk</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/prestasi')}>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover/item:bg-emerald-100 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined size-4" style={{ fontSize: '18px' }} >emoji_events</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight font-headline">Validasi Prestasi</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.prestasi} klaim menunggu dpa</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => navigate('/faculty')} variant="ghost" className="w-full mt-4 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5">
                Pusat Kendali Utama
              </Button>
            </div>
          </div>

          <button className="hidden sm:flex p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 text-slate-500 hover:text-primary transition-all active:scale-90">
            <span className="material-symbols-outlined size-5" style={{ fontSize: '20px' }} >calendar_month</span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        {/* Real Faculty Label */}
        <div className="hidden sm:flex flex-col text-right mr-1 leading-tight">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">Administrator</span>
          <span className="text-[12px] font-black text-slate-800 tracking-tight font-headline">
            {facultyName || (() => {
              const userEmail = user?.Email || "";
              const match = userEmail.match(/^admin\.([a-zA-Z0-9]+)@/i);
              if (match) {
                const code = match[1].toUpperCase();
                const namaMap = {
                  'FF':  'Farmasi',
                  'FK':  'Keperawatan',
                  'FIK': 'Ilmu Kesehatan',
                  'FS':  'Sosial',
                };
                return namaMap[code] ? `Fak. ${namaMap[code]}` : `Fak. ${code}`;
              }
              return "Portal Admin";
            })()}
          </span>
        </div>

        {/* User Account Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 p-1.5 pr-3.5 rounded-full transition-all outline-none border border-slate-100 bg-white/50">
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-[12px] ring-2 ring-white shadow-sm font-headline">
                 {user?.Email?.match(/^admin\.([a-zA-Z0-9]+)@/i)?.[1]?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{user?.Email?.split('@')[0]}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Admin</span>
              </div>
              <span className="material-symbols-outlined size-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" style={{ fontSize: '14px' }} >expand_more</span>
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
              <span className="material-symbols-outlined mr-2 size-4 text-slate-400 group-hover:text-primary transition-colors" style={{ fontSize: '16px' }} >settings</span>
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
              <span className="material-symbols-outlined mr-2 size-4 text-rose-400 group-hover:text-rose-600 transition-colors" style={{ fontSize: '16px' }} >logout</span>
              <span className="text-xs font-bold text-rose-500 group-hover:text-rose-600 transition-colors">Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default TopNavBar
