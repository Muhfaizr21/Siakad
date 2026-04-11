"use client"
import React, { useState, useRef, useEffect } from 'react'
import useAuthStore from '../../../store/useAuthStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  Calendar,
  Menu,
  User,
  ChevronRight,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  Stethoscope,
  Award,
  BookOpen,
  FileText,
  Settings,
  PieChart,
  Megaphone,
  PlusCircle,
  Database,
  Headphones,
  Command
} from 'lucide-react'
import { Button } from './button'
import { Badge } from './badge'

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const pathnames = location.pathname.split('/').filter((x) => x);

  const pages = [
    { name: 'Dashboard Utama', path: '/faculty', icon: LayoutGrid },
    { name: 'Data Mahasiswa', path: '/faculty/mahasiswa', icon: Users },
    { name: 'Mahasiswa Baru', path: '/faculty/mahasiswa/baru', icon: PlusCircle },
    { name: 'Monitor PKKMB', path: '/faculty/pkkmb', icon: Database },
    { name: 'Manajemen Dosen', path: '/faculty/dosen', icon: UserCheck },
    { name: 'Status Kesehatan', path: '/faculty/kesehatan', icon: Stethoscope },
    { name: 'Student Voice', path: '/faculty/aspirasi', icon: Megaphone },
    { name: 'Validasi Prestasi', path: '/faculty/prestasi', icon: Award },
    { name: 'Beasiswa Internal', path: '/faculty/beasiswa', icon: Award },
    { name: 'Jadwal Konseling', path: '/faculty/konseling', icon: Headphones },
    { name: 'E-Persuratan', path: '/faculty/persuratan', icon: FileText },
    { name: 'ORMAWA Hub', path: '/faculty/ormawa/proposals', icon: FileText },
    { name: 'Organisasi Fakultas', path: '/faculty/organisasi', icon: Users },
    { name: 'Program Studi', path: '/faculty/prodi', icon: BookOpen },
    { name: 'Manajemen Konten', path: '/faculty/konten', icon: Megaphone },
    { name: 'Analisis Laporan', path: '/faculty/laporan', icon: PieChart },
    { name: 'Sistem & Pengaturan', path: '/faculty/pengaturan', icon: Settings },
  ];

  const [notifications, setNotifications] = useState({ aspirasi: 0, surat: 0, prestasi: 0, total: 0 });
  const [loadingNotif, setLoadingNotif] = useState(false);

  const fetchNotifStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/faculty/notifications/stats');
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

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-[50] h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 font-body transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Menu className="size-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 overflow-hidden">
          <div className="p-2 rounded-lg bg-primary/5 text-primary">
            <LayoutGrid className="size-4" />
          </div>
          <div className="flex items-center text-[11px] font-bold tracking-tight uppercase">
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;

              return (
                <React.Fragment key={to}>
                  <ChevronRight className="size-3 mx-1 text-slate-300 first:hidden" />
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
              <Search className="size-4 stroke-[2.5px]" />
            </div>
            <input
              className="w-full h-11 pl-12 pr-12 bg-gray-100/50 border-transparent border focus:border-primary/20 focus:bg-white rounded-2xl text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner"
              placeholder="Cari fitur atau halaman..."
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            <div className="absolute right-4 flex items-center gap-1 opacity-40 group-focus-within:opacity-100 transition-opacity">
              <div className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm flex items-center gap-1">
                <Command className="size-2.5" />
                <span>/</span>
              </div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasil Pencarian</p>
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
                        <page.icon className="size-4" />
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

      <div className="flex items-center gap-3 lg:gap-5">
        {/* Quick Notification Tray */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100/50">
          <div className="relative p-2.5 rounded-xl hover:bg-white text-slate-500 hover:text-primary transition-all hover:shadow-sm group cursor-pointer">
            <Bell className="size-5 active:scale-90 transition-transform" />
            {notifications.total > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-500/20 animate-pulse">
                {notifications.total > 9 ? '9+' : notifications.total}
              </span>
            )}

            {/* Popover Preview (Real Data) */}
            <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inbox Antrean</h4>
                {notifications.total > 0 && (
                  <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none font-black text-[9px] px-2 py-0.5">
                    {notifications.total} NEW
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/persuratan')}>
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover/item:bg-amber-100 transition-colors">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">E-Persuratan</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.surat} berkas menunggu verifikasi</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/aspirasi')}>
                  <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover/item:bg-primary transition-colors group-hover/item:text-white">
                    <Megaphone className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Student Voice</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.aspirasi} aspirasi baru masuk</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/faculty/prestasi')}>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover/item:bg-emerald-100 transition-colors">
                    <Award className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Validasi Prestasi</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">{notifications.prestasi} klaim menunggu dpa</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => navigate('/faculty')} variant="ghost" className="w-full mt-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5">
                Pusat Kendali Utama
              </Button>
            </div>
          </div>

          <button className="hidden sm:flex p-2.5 rounded-xl hover:bg-white text-slate-500 hover:text-primary transition-all hover:shadow-sm active:scale-90">
            <Calendar className="size-5" />
          </button>
        </div>

        {/* User Account Profile */}
        <div className="flex items-center gap-3.5 pl-4 border-l border-slate-200/60 group cursor-pointer ml-2">
          <div className="flex flex-col items-end leading-none">
            <p className="text-sm font-black text-slate-900 tracking-tight">
              {(() => {
                const userEmail = useAuthStore(state => state.mahasiswa?.email) || "";
                const match = userEmail.match(/^admin\.([a-zA-Z0-9]+)@/i);
                if (match) {
                  const code = match[1].toUpperCase();
                  if (code === 'SOC') return 'Admin School of Computing';
                  if (code === 'FT') return 'Admin Fakultas Teknik';
                  if (code === 'FH') return 'Admin Fakultas Hukum';
                  if (code === 'FE') return 'Admin Fakultas Ekonomi';
                  return `Admin Fakultas ${code}`;
                }
                return "Admin Fakultas";
              })()}
            </p>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1 opacity-70">
              Portal Management
            </p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border-[3px] border-slate-100 text-white flex items-center justify-center font-black text-xs shadow-xl shadow-slate-900/10 group-hover:shadow-primary/20 group-hover:border-primary/20 transition-all duration-300">
               {(() => {
                const userEmail = useAuthStore(state => state.mahasiswa?.email) || "";
                const match = userEmail.match(/^admin\.([a-zA-Z0-9]+)@/i);
                return match ? match[1].toUpperCase() : "AF";
              })()}
            </div>
            <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-[3px] border-white rounded-full shadow-lg shadow-emerald-500/20"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavBar
