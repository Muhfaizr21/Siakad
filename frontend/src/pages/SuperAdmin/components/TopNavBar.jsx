import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Search, User, LogOut, Settings, 
  ChevronRight, UserCircle2, LayoutGrid,
  Menu, Command, Calendar, MessageSquare, ClipboardList, X
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { adminService } from '../../../services/api';
import { cn } from '@/lib/utils';

const searchMenus = [
  { name: "Dashboard", path: "/admin", type: "Menu Utama" },
  { name: "Log Aktivitas", path: "/admin/audit", type: "Menu Utama" },
  { name: "Data Fakultas", path: "/admin/faculties", type: "Manajemen Data" },
  { name: "Data Prodi", path: "/admin/prodi", type: "Manajemen Data" },
  { name: "Data Mahasiswa", path: "/admin/students", type: "Manajemen Data" },
  { name: "Data Dosen", path: "/admin/lecturers", type: "Manajemen Data" },
  { name: "Global Proposals", path: "/admin/proposals", type: "Kegiatan" },
  { name: "Kelola Ormawa", path: "/admin/organizations", type: "Kegiatan" },
  { name: "Beasiswa", path: "/admin/scholarships", type: "Layanan" },
  { name: "Aspirasi", path: "/admin/aspirations", type: "Layanan" },
  { name: "Konseling", path: "/admin/counseling", type: "Layanan" },
  { name: "Prestasi Mandiri", path: "/admin/prestasi-mandiri", type: "Layanan" },
  { name: "Kelola Akses (RBAC)", path: "/admin/rbac", type: "Keamanan" },
  { name: "Performa Admin", path: "/admin/performance", type: "Keamanan" },
  { name: "Kelola Berita", path: "/admin/announcements", type: "Sistem" },
  { name: "Pengaturan Sistem", path: "/admin/config", type: "Sistem" },
];

const TopNavBar = ({ setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const { user, logout } = useAuthStore();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const searchInputRef = useRef(null);
  const notifRef = useRef(null);
  const settingsRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Shortcut for Search (Cmd + /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click Outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Notifications Dummy (combining proposals and aspirations for demo)
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const [propsRes, aspRes] = await Promise.all([
          adminService.getGlobalProposals().catch(() => ({ data: [] })),
          adminService.getGlobalAspirations().catch(() => ({ data: [] }))
        ]);
        
        let notifs = [];
        if(propsRes?.data) {
          notifs = [...notifs, ...propsRes.data.filter(p => p.Status === 'Pending').slice(0, 2).map(p => ({
            id: p.ID, type: 'proposal', title: p.NamaKegiatan, time: 'Baru', icon: ClipboardList
          }))];
        }
        if(aspRes?.data) {
          notifs = [...notifs, ...aspRes.data.filter(a => a.Status === 'Pending').slice(0, 2).map(a => ({
            id: a.ID, type: 'aspirasi', title: a.Judul, time: 'Baru', icon: MessageSquare
          }))];
        }
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed fetching notifs", err);
      }
    };
    fetchNotifs();
  }, []);

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
      'prestasi-mandiri': 'Prestasi Mandiri',
      'rbac': 'Akses (RBAC)',
      'performance': 'Performa Admin',
      'announcements': 'Kelola Berita',
      'config': 'Pengaturan',
    };
    return labels[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  const filteredSearch = searchMenus.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        <div ref={searchContainerRef} className="relative w-full max-w-sm hidden xl:flex flex-col items-center group ml-4 relative">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4 size-4 text-slate-400 stroke-[2.5px]" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full h-11 pl-12 pr-12 bg-slate-50 border-transparent border focus:border-[#00236f]/20 focus:bg-white rounded-2xl text-[12px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-[#00236f]/5 transition-all outline-none"
              placeholder="Cari fitur atau data..."
              type="text"
            />
            {searchQuery && (
               <button onClick={() => setSearchQuery('')} className="absolute right-12 p-1 text-slate-400 hover:text-slate-600">
                  <X className="size-3" />
               </button>
            )}
            <div className="absolute right-4 flex items-center gap-1 opacity-40">
              <div className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-500 shadow-sm flex items-center gap-1">
                <Command className="size-2.5" />
                <span>/</span>
              </div>
            </div>
          </div>

          {/* Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-14 left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
               {searchQuery ? (
                 <div className="py-2">
                   <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Hasil Pencarian</div>
                   {filteredSearch.length > 0 ? filteredSearch.map((item, idx) => (
                      <Link 
                        key={idx} 
                        to={item.path} 
                        onClick={() => { setIsSearchFocused(false); setSearchQuery(''); }}
                        className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                         <Search className="size-4 text-slate-400 mr-3" />
                         <div>
                           <p className="text-xs font-bold text-slate-800">{item.name}</p>
                           <p className="text-[10px] text-slate-500 mt-0.5">{item.type}</p>
                         </div>
                      </Link>
                   )) : (
                     <div className="px-4 py-4 text-center text-xs text-slate-500">Tidak ada hasil ditemukan</div>
                   )}
                 </div>
               ) : (
                 <div className="py-2">
                   <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase">Pencarian Cepat</div>
                   {searchMenus.slice(0, 4).map((item, idx) => (
                      <Link 
                        key={idx} 
                        to={item.path} 
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <Search className="size-3.5 text-slate-400 mr-3" />
                        <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                      </Link>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 relative">
          {/* Notification Button & Dropdown */}
          <div ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-[#00236f] transition-all relative"
            >
              <Bell className="size-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border-2 border-slate-50 ring-2 ring-rose-500/10" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                   <h3 className="text-xs font-bold font-headline uppercase tracking-wide">Notifikasi</h3>
                   <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{notifications.length} Baru</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                   {notifications.length > 0 ? notifications.map((n, i) => (
                     <div key={i} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer flex gap-3">
                       <div className="p-2 rounded-lg bg-blue-50 text-blue-600 h-fit">
                         <n.icon className="size-4" />
                       </div>
                       <div>
                         <p className="text-xs font-semibold text-slate-800 line-clamp-2">{n.title}</p>
                         <p className="text-[10px] text-slate-500 mt-1">{n.type === 'proposal' ? 'Proposal Baru' : 'Aspirasi Baru'} • {n.time}</p>
                       </div>
                     </div>
                   )) : (
                     <div className="px-4 py-8 text-center text-xs text-slate-500">Tidak ada notifikasi baru</div>
                   )}
                </div>
                <div className="p-2 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-1.5 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg uppercase tracking-wide">Tandai semua dibaca</button>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-[#00236f] transition-all">
            <Settings className="size-5" />
          </button>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        {/* Profile Dropdown */}
        <div ref={settingsRef} className="relative">
          <div 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-3.5 pl-2 group cursor-pointer transition-all hover:opacity-80 active:scale-95"
          >
            <div className="flex flex-col items-end leading-none">
              <p className="text-[12px] font-black text-slate-900 tracking-tight font-headline uppercase leading-none group-hover:text-[#00236f] transition-colors">
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

          {isSettingsOpen && (
            <div className="absolute top-14 right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
               <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                 <p className="text-xs font-bold text-slate-800 truncate">{user?.Email || 'admin@bku.ac.id'}</p>
               </div>
               <div className="p-2">
                 <Link to="/admin/profile" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                    <User className="size-4 mr-3" /> Profil Saya
                 </Link>
                 <Link to="/admin/config" onClick={() => setIsSettingsOpen(false)} className="flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors">
                    <Settings className="size-4 mr-3" /> Pengaturan
                 </Link>
               </div>
               <div className="p-2 border-t border-slate-100">
                 <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    <LogOut className="size-4 mr-3" /> Keluar
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
