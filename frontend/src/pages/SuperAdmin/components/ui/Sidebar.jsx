import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../../store/useAuthStore';


const menuSections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/faculty', icon: 'dashboard' },
    ]
  },
  {
    label: 'Academic Management',
    items: [
      { name: 'Data Psikolog', path: '/faculty/psikolog', icon: 'how_to_reg' },
      { name: 'Data Mahasiswa', path: '/faculty/mahasiswa', icon: 'group' },
      { name: 'Mahasiswa Baru', path: '/faculty/mahasiswa/baru', icon: 'person_add' },
      { name: 'Monitor PKKMB', path: '/faculty/pkkmb', icon: 'check_circle' },
      { name: 'Pantau Kesehatan', path: '/faculty/kesehatan', icon: 'monitor_heart' },
    ]
  },
  {
    label: 'Student Services',
    items: [
      { name: 'Student Voice', path: '/faculty/aspirasi', icon: 'chat' },
      { name: 'Validasi Prestasi', path: '/faculty/prestasi', icon: 'emoji_events' },
      { name: 'Beasiswa Internal', path: '/faculty/beasiswa', icon: 'school' },
      { name: 'Jadwal Konseling', path: '/faculty/konseling', icon: 'calendar_month' },
      { name: 'E-Persuratan', path: '/faculty/persuratan', icon: 'inbox' },
    ]
  },
  {
    label: 'Community & Content',
    items: [
      { name: 'Proposal ORMAWA', path: '/faculty/ormawa/proposals', icon: 'description' },
      { name: 'Organisasi Fakultas', path: '/faculty/organisasi', icon: 'apartment' },
      { name: 'Konten & Artikel', path: '/faculty/konten', icon: 'inventory_2' },
    ]
  },
  {
    label: 'System & Reports',
    items: [
      { name: 'Laporan Fakultas', path: '/faculty/laporan', icon: 'bar_chart' },
      { name: 'Program Studi', path: '/faculty/prodi', icon: 'school' },
      { name: 'Pengaturan', path: '/faculty/pengaturan', icon: 'settings' },
    ]
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find all items that match the current path
  const allItems = menuSections.flatMap(section => section.items);

  const isActive = (itemPath) => {
    const currentPath = location.pathname;

    // 1. Check for exact match
    if (currentPath === itemPath) return true;

    // 2. Dashboard is always active if path is /faculty or /faculty/dashboard
    if (itemPath === '/faculty') return currentPath === '/faculty' || currentPath === '/faculty/dashboard';

    // 3. For sub-paths (like /faculty/mahasiswa/baru vs /faculty/mahasiswa)
    // We check if current path starts with itemPath
    if (currentPath.startsWith(itemPath)) {
      // Check if there's any other menu item that has a more specific match (longer path)
      const moreSpecificMatch = allItems.find(item =>
        item.path !== itemPath &&
        item.path.length > itemPath.length &&
        currentPath.startsWith(item.path)
      );

      // If no other menu item matches the current path better, then this one is the winner
      return !moreSpecificMatch;
    }

    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-[100dvh] z-[70]
        bg-white border-r border-slate-200/60
        transition-all duration-500 ease-in-out font-body
        flex flex-col overscroll-contain
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl shadow-primary/10' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>

        {/* Logo Section */}
        <div className="px-6 py-8 flex items-center justify-between">
          <Link to="/faculty" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-300 p-1.5">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                STUDENT HUB
              </span>
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Portal Fakultas</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined size-4 rotate-180" >chevron_right</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 overflow-y-auto no-scrollbar scroll-smooth pb-10 overscroll-contain">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mb-8 last:mb-0">
              <h3 className="px-4 mb-3 text-[10px] font-black text-slate-400/80 uppercase tracking-[0.25em]">
                {section.label}
              </h3>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen && setIsOpen(false)}
                      className={`
                        relative flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold transition-all duration-300 group active:scale-[0.98]
                        ${active
                          ? 'bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary/90'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                      `}
                    >
                      
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} style={{ fontSize: '20px' }}>
                          {item.icon}
                        </span>
                      </div>
                      
                      <span className="text-[13px] tracking-tight flex-1">{item.name}</span>
                      
                      {active ? (
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-white/50" style={{ fontSize: '16px' }}>chevron_right</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" style={{ fontSize: '16px' }}>chevron_right</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Improved Logout Section */}
        <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-rose-50 hover:bg-rose-600 group transition-all duration-300 active:scale-95 border border-rose-100/50"
          >
            <span className="material-symbols-outlined size-4 text-rose-600 group-hover:text-white transition-colors" >logout</span>
            <span className="text-[11px] font-black text-rose-600 group-hover:text-white uppercase tracking-widest transition-colors">KELUAR</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
