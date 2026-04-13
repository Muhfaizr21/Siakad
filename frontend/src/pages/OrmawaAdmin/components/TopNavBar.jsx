import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, LogOut, Settings, 
  ChevronRight, Users, LayoutGrid,
  Menu, Command, Calendar, ChevronDown, 
  FileText, Megaphone, HelpCircle, 
  ShieldCheck, Wallet, QrCode, ClipboardList
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import api from '../../../lib/axios';

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
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
    { name: 'Dashboard Performa', path: '/ormawa', icon: LayoutGrid },
    { name: 'Manajemen Anggota', path: '/ormawa/anggota', icon: Users },
    { name: 'Manajemen Staff', path: '/ormawa/staff', icon: ShieldCheck },
    { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: FileText },
    { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: Calendar },
    { name: 'Sistem Absensi', path: '/ormawa/absensi', icon: QrCode },
    { name: 'Keuangan & Kas', path: '/ormawa/keuangan', icon: Wallet },
    { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: ClipboardList },
    { name: 'Aspirasi Masuk', path: '/ormawa/aspirasi', icon: Megaphone },
    { name: 'Notifikasi Sistem', path: '/ormawa/notifikasi', icon: Bell },
  ];

  const fetchProfile = async () => {
    try {
      const res = await api.get('/ormawa/profile');
      if (res.data.status === 'success') {
        setOrmawaInfo(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch ormawa profile");
    }
  };

  const fetchStats = async () => {
    try {
      const ormawaId = user?.ormawa_id || 1;
      const res = await api.get(`/ormawa/stats?ormawaId=${ormawaId}`);
      if (res.data.status === 'success') {
        setStats(prev => ({ ...prev, ...res.data.data }));
      }
      
      const notifRes = await api.get(`/ormawa/notifications?ormawaId=${ormawaId}`);
      if (notifRes.data.status === 'success') {
        const unread = notifRes.data.data.filter(n => !n.IsRead).length;
        setStats(prev => ({ ...prev, unreadNotifications: unread }));
      }
    } catch (err) {
      console.error("Failed to fetch ormawa stats");
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
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
      'ormawa': 'Main Dashboard',
      'anggota': 'Anggota',
      'staff': 'Staf & Ahli',
      'proposal': 'Plan & Proposal',
      'jadwal': 'Kalender Kerja',
      'absensi': 'Presensi Digital',
      'keuangan': 'Buku Kas',
      'lpj': 'Laporan LPJ',
      'aspirasi': 'Pusat Aspirasi',
      'notifikasi': 'Pemberitahuan',
      'pengaturan': 'Konfigurasi',
    };
    return labels[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-[50] h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 font-sans transition-all duration-300">
      <div className="flex items-center gap-6 flex-1">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen?.(true)}
          className="lg:hidden p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <Menu className="size-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 overflow-hidden">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <LayoutGrid className="size-4" />
          </div>
          <div className="flex items-center text-[10px] font-black tracking-tight uppercase font-headline">
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
                      className="text-slate-400 hover:text-rose-600 transition-colors truncate max-w-[150px]"
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
            <Search className="absolute left-4 size-4 text-slate-400 stroke-[2.5px]" />
            <input
              className="w-full h-11 pl-12 pr-12 bg-slate-50 border-transparent border focus:border-rose-200 focus:bg-white rounded-2xl text-[12px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-rose-50 transition-all outline-none"
              placeholder="Cari menu ormawa..."
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            <div className="absolute right-4 flex items-center gap-1 opacity-40 group-focus-within:opacity-100 transition-opacity">
              <div className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-500 shadow-sm flex items-center gap-1">
                <Command className="size-2.5" />
                <span>/</span>
              </div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchQuery.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
              <div className="px-3 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Navigation</p>
              </div>
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
                {filteredResults.length > 0 ? (
                  filteredResults.map((page, index) => (
                    <div
                      key={index}
                      onClick={() => handleNavigate(page.path)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        <page.icon className="size-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{page.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-medium text-slate-400">Pencarian tidak ditemukan</p>
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
          <div className="relative p-2.5 rounded-xl hover:bg-white text-slate-500 hover:text-rose-600 transition-all hover:shadow-sm group cursor-pointer">
            <Bell className="size-5 active:scale-95 transition-transform" />
            {stats.unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-500/20 animate-pulse">
                {stats.unreadNotifications}
              </span>
            )}

            {/* Popover Preview */}
            <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pemberitahuan</h4>
                {stats.unreadNotifications > 0 && (
                  <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] px-2 py-0.5">
                    {stats.unreadNotifications} BARU
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/ormawa/proposal')}>
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 group-hover/item:bg-orange-100 transition-colors">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Status Proposal</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">Pantau progress pengajuan</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/ormawa/aspirasi')}>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover/item:bg-blue-100 transition-colors">
                    <Megaphone className="size-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Aspirasi Mahasiswa</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">Lihat feedback terbaru</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => navigate('/ormawa/notifikasi')} variant="ghost" className="w-full mt-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                Pusat Informasi Lengkap
              </Button>
            </div>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        {/* Profile Dropdown with Organization Context */}
        <div className="flex items-center gap-3 lg:gap-4 pl-2 border-l border-slate-100">
          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                {ormawaInfo?.Singkatan || ormawaInfo?.Kategori || "ORMAWA"}
              </span>
              <p className="text-[12px] font-black text-slate-900 leading-none">{user?.Email?.split('@')[0] || "Admin"}</p>
            </div>
            <p className="text-[10px] font-bold text-rose-600 mt-1 leading-none uppercase tracking-tighter">
              {ormawaInfo?.Nama || "Administrator"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 p-1 rounded-full transition-all outline-none">
                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-lg shadow-slate-900/10 group-hover:scale-105 transition-transform">
                  {ormawaInfo?.Singkatan?.[0] || user?.Email?.[0]?.toUpperCase() || 'O'}
                </div>
                <ChevronDown className="size-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 rounded-[2rem] p-4 shadow-2xl border border-slate-100 bg-white translate-x-2">
              <DropdownMenuLabel className="p-2 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Organization Profile</p>
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                      <Users className="size-4" />
                   </div>
                   <div className="flex flex-col overflow-hidden">
                      <p className="text-xs font-black text-slate-900 truncate leading-none mb-1">{ormawaInfo?.Nama || 'Admin'}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">{user?.Email}</p>
                   </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="my-2 bg-slate-50" />
              
              <DropdownMenuItem onClick={() => navigate('/ormawa/pengaturan')} className="rounded-2xl p-3 focus:bg-slate-50 group cursor-pointer transition-all">
                <Settings className="mr-3 size-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
                <span className="text-[12px] font-black text-slate-600 group-hover:text-slate-900 transition-colors">Pengaturan Profil</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-slate-50" />
              
              <DropdownMenuItem 
                onClick={() => {
                  logout();
                  navigate('/login');
                }} 
                className="rounded-2xl p-3 focus:bg-rose-50 group cursor-pointer transition-all"
              >
                <LogOut className="mr-3 size-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
                <span className="text-[12px] font-black text-rose-500 group-hover:text-rose-600 transition-colors">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
