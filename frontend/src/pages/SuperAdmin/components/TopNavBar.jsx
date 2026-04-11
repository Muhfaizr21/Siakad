import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, User, LogOut, Settings, 
  ChevronRight, UserCircle2, LayoutGrid,
  Menu, Command, Calendar
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { cn } from '@/lib/utils';

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const user = useAuthStore(state => state.user);

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
                  ) || value}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Global Search Interface */}
        <div className="relative w-full max-w-sm hidden xl:flex flex-col items-center group ml-4">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4 size-4 text-slate-400 stroke-[2.5px]" />
            <input
              className="w-full h-11 pl-12 pr-12 bg-slate-50 border-transparent border focus:border-[#00236f]/20 focus:bg-white rounded-2xl text-[12px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-[#00236f]/5 transition-all outline-none"
              placeholder="Cari fitur atau data..."
              type="text"
            />
            <div className="absolute right-4 flex items-center gap-1 opacity-40">
              <div className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-500 shadow-sm flex items-center gap-1">
                <Command className="size-2.5" />
                <span>/</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-[#00236f] transition-all relative">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/10" />
          </button>
          <button className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-[#00236f] transition-all">
            <Settings className="size-5" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3.5 pl-2 group cursor-pointer">
          <div className="flex flex-col items-end leading-none">
            <p className="text-[12px] font-black text-slate-900 tracking-tight font-headline uppercase leading-none">
              {user?.Email?.split('@')[0] || 'Super Admin'}
            </p>
            <p className="text-[9px] font-bold text-[#00236f] tracking-widest uppercase mt-1.5 opacity-70">
              {user?.Role?.replace('_', ' ') || 'Sistem Admin'}
            </p>
          </div>
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border-[3px] border-slate-100/50 text-white flex items-center justify-center font-black text-xs shadow-xl shadow-slate-900/10 transition-all group-hover:border-[#00236f]/20 overflow-hidden">
               {user?.Email?.[0]?.toUpperCase() || <UserCircle2 className="size-6" />}
            </div>
            <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-[3px] border-white rounded-full shadow-lg shadow-emerald-500/20"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
