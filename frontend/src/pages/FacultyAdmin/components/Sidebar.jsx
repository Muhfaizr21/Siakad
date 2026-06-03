import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

const menuSections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/faculty/dashboard', icon: 'dashboard' },
    ]
  },
  {
    label: 'Academic Management',
    items: [
      { name: 'Data Mahasiswa', path: '/faculty/mahasiswa', icon: 'group' },
      { name: 'Data Konseling', path: '/faculty/psikolog', icon: 'psychology' },
      { name: 'Monitor Kencana', path: '/faculty/pkkmb', icon: 'check_circle' },
      { name: 'Pantau Kesehatan', path: '/faculty/kesehatan', icon: 'favorite' },
    ]
  },
  {
    label: 'Student Services',
    items: [
      { name: 'Student Voice', path: '/faculty/aspirasi', icon: 'chat' },
      { name: 'Validasi Prestasi', path: '/faculty/prestasi', icon: 'emoji_events' },
      { name: 'Beasiswa Internal', path: '/faculty/beasiswa', icon: 'school' },
    ]
  },
  {
    label: 'Community & Content',
    items: [
      { name: 'Program Studi', path: '/faculty/prodi', icon: 'school' },
      { name: 'Proposal ORMAWA', path: '/faculty/ormawa/proposals', icon: 'note' },
      { name: 'Organisasi Fakultas', path: '/faculty/organisasi', icon: 'apartment' },
    ]
  },
  {
    label: 'System & Reports',
    items: [
      { name: 'Periode Akademik', path: '/faculty/jadwal', icon: 'calendar_month' },
      { name: 'Laporan Fakultas', path: '/faculty/laporan', icon: 'bar_chart' },
      { name: 'Pengaturan', path: '/faculty/pengaturan', icon: 'settings' },
    ]
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
        bg-gradient-to-b from-bku-primary to-bku-hover text-slate-300
        transition-all duration-500 ease-in-out font-inter
        flex flex-col overscroll-contain border-r border-white/10 shadow-xl
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>

        {/* Logo Section */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-white/10">
          <Link to="/faculty" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 p-1.5">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain brightness-110" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bku-primary shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider font-headline">
                STUDENT HUB
              </span>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest font-headline">Portal Fakultas</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined size-4 rotate-180" style={{ fontSize: '16px' }}>chevron_right</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar scroll-smooth pb-10 overscroll-contain">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mb-6 last:mb-0">
              <h3 className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] font-headline">
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
                        relative flex items-center gap-3.5 px-4 py-2 rounded-xl font-bold transition-all duration-300 group active:scale-[0.98] font-inter text-xs
                        ${active
                          ? 'bg-white/10 text-white border-l-4 border-l-amber-200 shadow-md shadow-white/5'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'}
                      `}
                    >
<div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`} style={{ fontSize: '20px' }}>
                          {item.icon}
                        </span>
                      </div>

                      <span className="text-[13px] tracking-tight flex-1">{item.name}</span>
                      {active ? (
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-white/50" style={{ fontSize: '14px' }}>chevron_right</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-slate-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" style={{ fontSize: '14px' }}>chevron_right</span>
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
        <div className="p-4 bg-transparent border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-300 group active:scale-[0.98]"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-rose-400 group-hover:text-rose-300 transition-all duration-300 group-hover:scale-110" style={{ fontSize: '18px' }}>
                logout
              </span>
            </div>
            <span className="text-xs tracking-tight flex-1 text-left font-semibold font-headline">
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
