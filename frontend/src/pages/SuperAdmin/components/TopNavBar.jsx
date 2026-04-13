import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, LogOut, Settings, 
  ChevronRight, UserCircle2, LayoutGrid,
  Menu, Command, Calendar, ChevronDown, Lock,
  UserCircle, FileText, Megaphone, Award, HelpCircle
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

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const pathnames = location.pathname.split('/').filter((x) => x);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const pages = [
    { name: 'Dashboard Monitoring', path: '/admin', icon: LayoutGrid },
    { name: 'Log Audit Sistem', path: '/admin/audit', icon: Lock },
    { name: 'Data Master Fakultas', path: '/admin/faculties', icon: LayoutGrid },
    { name: 'Program Studi Global', path: '/admin/prodi', icon: LayoutGrid },
    { name: 'Basis Data Mahasiswa', path: '/admin/students', icon: User },
    { name: 'Basis Data Dosen', path: '/admin/lecturers', icon: UserCircle2 },
    { name: 'Proposal Universitas', path: '/admin/proposals', icon: FileText },
    { name: 'Manajemen Organisasi', path: '/admin/organizations', icon: LayoutGrid },
    { name: 'Katalog Beasiswa', path: '/admin/scholarships', icon: Award },
    { name: 'Pusat Aspirasi', path: '/admin/aspirations', icon: Megaphone },
    { name: 'Manajemen Konseling', path: '/admin/counseling', icon: HelpCircle },
    { name: 'Konfigurasi RBAC', path: '/admin/rbac', icon: Lock },
    { name: 'Performa Sistem', path: '/admin/performance', icon: FileText },
    { name: 'Kelola Berita/News', path: '/admin/announcements', icon: Megaphone },
    { name: 'Pengaturan Sistem', path: '/admin/config', icon: Settings },
  ];

  const [stats, setStats] = useState({ aspirasi_aktif: 0, antrean_proposal: 0, total_mahasiswa: 0 });

  const fetchStats = async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch('http://localhost:8000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.status === 'success') {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Dashboard stats failed");
    }
  };

  useEffect(() => {
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
      'admin': 'Main Dashboard',
      'audit': 'Log Aktivitas',
      'faculties': 'Data Fakultas',
      'prodi': 'Program Studi',
      'students': 'Data Mahasiswa',
      'lecturers': 'Data Dosen',
      'proposals': 'Proposal Global',
      'organizations': 'Kelola Ormawa',
      'scholarships': 'Beasiswa',
      'aspirations': 'Pusat Aspirasi',
      'counseling': 'Konseling',
      'rbac': 'Akses (RBAC)',
      'performance': 'Performa Admin',
      'announcements': 'Kelola Berita',
      'config': 'Pengaturan',
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
          <div className="p-2 rounded-lg bg-[#00236f]/5 text-[#00236f]">
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
                      className="text-slate-400 hover:text-[#00236f] transition-colors truncate max-w-[150px]"
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
              className="w-full h-11 pl-12 pr-12 bg-slate-50 border-transparent border focus:border-[#00236f]/20 focus:bg-white rounded-2xl text-[12px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-[#00236f]/5 transition-all outline-none"
              placeholder="Cari fitur atau data..."
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
                      <div className="p-2 rounded-lg bg-[#00236f]/5 text-[#00236f] group-hover:bg-[#00236f] group-hover:text-white transition-colors">
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
        {/* Quick Notification Tray (Updated like FacultyAdmin) */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100/50">
          <div className="relative p-2.5 rounded-xl hover:bg-white text-slate-500 hover:text-[#00236f] transition-all hover:shadow-sm group cursor-pointer">
            <Bell className="size-5 active:scale-95 transition-transform" />
            {(stats.aspirasi_aktif + stats.antrean_proposal) > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white ring-2 ring-rose-500/20 animate-pulse">
                {(stats.aspirasi_aktif + stats.antrean_proposal)}
              </span>
            )}

            {/* Popover Preview (Super Admin Perspective) */}
            <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[100] cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Watchlist</h4>
                {(stats.aspirasi_aktif + stats.antrean_proposal) > 0 && (
                  <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] px-2 py-0.5">
                    {stats.aspirasi_aktif + stats.antrean_proposal} PENDING
                  </Badge>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/admin/proposals')}>
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 group-hover/item:bg-orange-100 transition-colors">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Antrean Proposal</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">{stats.antrean_proposal} pengajuan menunggu approval</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/admin/aspirations')}>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover/item:bg-blue-100 transition-colors">
                    <Megaphone className="size-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Pusat Aspirasi</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">{stats.aspirasi_aktif} aspirasi belum direspon</p>
                  </div>
                </div>

                <div className="flex gap-4 items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group/item" onClick={() => navigate('/admin/audit')}>
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all">
                    <Lock className="size-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">System Audit</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">Check system logs & security</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => navigate('/admin')} variant="ghost" className="w-full mt-6 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#00236f] hover:bg-[#00236f]/5 transition-all">
                Monitoring Komprehensif
              </Button>
            </div>
          </div>

          <button onClick={() => navigate('/admin/audit')} className="hidden sm:flex p-2.5 rounded-xl hover:bg-white text-slate-500 hover:text-[#00236f] transition-all hover:shadow-sm active:scale-90">
            <Calendar className="size-5" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 p-1 rounded-full transition-all outline-none">
              <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                 {user?.Email?.[0]?.toUpperCase() || 'A'}
              </div>
              <ChevronDown className="size-3 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-1.5 shadow-xl border border-slate-100 bg-white">
            <div className="px-3 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Super Admin</p>
              <p className="text-xs font-bold text-slate-900 truncate">{user?.Email}</p>
            </div>
            
            <DropdownMenuItem onClick={() => navigate('/admin/profile')} className="rounded-xl p-2.5 focus:bg-slate-50 group cursor-pointer transition-all">
              <UserCircle className="mr-2 size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Profil Admin</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/admin/config')} className="rounded-xl p-2.5 focus:bg-slate-50 group cursor-pointer transition-all">
              <Settings className="mr-2 size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Konfigurasi</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 bg-slate-50" />
            
            <DropdownMenuItem 
              onClick={() => {
                logout();
                navigate('/login');
              }} 
              className="rounded-xl p-2.5 focus:bg-rose-50 group cursor-pointer transition-all"
            >
              <LogOut className="mr-2 size-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
              <span className="text-xs font-bold text-rose-500 group-hover:text-rose-600 transition-colors">Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNavBar;