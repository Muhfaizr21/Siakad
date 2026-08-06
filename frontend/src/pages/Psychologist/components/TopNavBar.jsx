import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

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

  const pages = [
    { name: 'Dashboard Performa', path: '/psychologist', icon: 'dashboard' },
    { name: 'Janji Temu Konseling', path: '/psychologist/bookings', icon: 'schedule' },
    { name: 'Jadwal Praktek', path: '/psychologist/schedule', icon: 'calendar_month' },
    { name: 'Rekam Medis Pasien', path: '/psychologist/patients', icon: 'group' },
    { name: 'Rujukan & Tindak Lanjut', path: '/psychologist/referrals', icon: 'send' },
    { name: 'Analitik & Tren', path: '/psychologist/analytics', icon: 'bar_chart' },
    { name: 'Laporan Klinis', path: '/psychologist/reports', icon: 'description' },
    { name: 'Pusat Notifikasi', path: '/psychologist/notifications', icon: 'notifications' },
    { name: 'Pengaturan Akun', path: '/psychologist/settings', icon: 'settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      'psychologist': 'Dashboard',
      'bookings': 'Janji Temu',
      'schedule': 'Jadwal Praktek',
      'patients': 'Rekam Medis',
      'referrals': 'Tindak Lanjut',
      'analytics': 'Analitik & Tren',
      'reports': 'Laporan Klinis',
      'notifications': 'Notifikasi',
      'settings': 'Pengaturan',
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
            <span className="material-symbols-outlined text-xl shrink-0">menu</span>
          </button>

          {/* Unified BKU Grid icon & Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-xl bg-bku-primary/5 text-bku-primary flex items-center justify-center border border-bku-primary/10 shadow-sm shrink-0">
              <span className="material-symbols-outlined text-lg shrink-0">grid_view</span>
            </div>
            <div className="flex items-center text-[10px] font-extrabold tracking-widest uppercase font-headline">
              {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return (
                  <React.Fragment key={to}>
                    {index > 0 && (
                      <span className="material-symbols-outlined text-slate-300 mx-2 text-sm shrink-0 leading-none select-none">
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
                        className="text-slate-400 hover:text-bku-primary transition-all duration-200 truncate max-w-[150px]"
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
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-bku-primary/5 text-bku-primary rounded-2xl text-[10px] font-extrabold tracking-wider uppercase border border-bku-primary/10 shadow-sm shadow-bku-primary/5">
            <span className="w-1.5 h-1.5 bg-bku-primary rounded-full animate-pulse" />
            Psikolog Klinis
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
              <span className="material-symbols-outlined text-xl shrink-0">search</span>
              <span className="hidden sm:inline text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mr-1">CARI (Ctrl+K)</span>
            </button>

            {/* Notification Bell */}
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-bku-primary transition-all cursor-pointer group active:scale-95 shadow-sm">
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-12 text-xl shrink-0">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            </div>

            {/* Calendar Button */}
            <button 
              onClick={() => navigate('/psychologist/schedule')}
              className="hidden sm:flex w-10 h-10 items-center justify-center shrink-0 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-bku-primary transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-xl shrink-0">calendar_month</span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Premium Capsule Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 p-1 pr-3 rounded-full transition-all duration-300 outline-none border border-slate-200/60 bg-white shadow-sm hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-bku-primary to-indigo-500 text-white flex items-center justify-center font-black text-sm ring-2 ring-white shadow-md shadow-bku-primary/20 group-hover:scale-105 transition-transform shrink-0">
                  {user?.Email?.[0]?.toUpperCase() || 'P'}
                </div>
                <div className="hidden sm:flex flex-col leading-tight pr-1.5 shrink-0 text-left">
                  <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-bku-primary transition-colors truncate max-w-[100px]">
                    {user?.Email?.split('@')[0] || "Psikolog"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Psikolog</span>
                </div>
                <span className="material-symbols-outlined text-base shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">expand_more</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-1.5 shadow-xl border border-white/40 glass-card font-inter">
              <DropdownMenuItem onClick={() => navigate('/psychologist/settings')} className="rounded-xl p-2.5 focus:bg-slate-50 group cursor-pointer transition-all">
                <span className="material-symbols-outlined mr-2.5 text-base shrink-0 text-slate-400 group-hover:text-bku-primary transition-colors">settings</span>
                <span className="text-[12px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Pengaturan Profil</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-50" />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl p-2.5 focus:bg-rose-50 group cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined mr-2.5 text-base shrink-0 text-rose-400 group-hover:text-rose-600 transition-colors">logout</span>
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
              <span className="material-symbols-outlined text-slate-400 text-2xl shrink-0">search</span>
              <input
                ref={searchInputRef}
                autoFocus
                className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none h-6"
                placeholder="Ketik menu atau rekam medis yang dicari..."
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
                      <span className="material-symbols-outlined text-lg shrink-0">{page.icon}</span>
                    </div>
                    <div className="flex flex-col flex-1 leading-tight text-left">
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{page.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{page.path}</span>
                    </div>
                    <span className="material-symbols-outlined text-base shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">arrow_forward</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-slate-300 text-4xl shrink-0">find_in_page</span>
                  <p className="text-xs font-bold text-slate-400">Tidak ada fitur yang cocok</p>
                  <p className="text-[10px] text-slate-400/70 max-w-[200px]">Coba cari dengan kata kunci lain seperti 'janji temu', 'jadwal', 'rekam medis'.</p>
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
