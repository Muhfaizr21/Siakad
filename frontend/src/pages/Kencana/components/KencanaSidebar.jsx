import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { useMentorProfileQuery } from '../../../queries/useKencanaMentorQuery';

// Portal configurations with their own menus, colors, and branding
const portalConfig = {
  admin: {
    title: 'KENCANA',
    subtitle: 'Admin Universitas',
    basePath: '/kencana-admin',
    accentColor: 'emerald',
    menuGroups: [
      {
        title: 'Menu Utama',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/kencana-admin', exact: true },
          { name: 'Kelola Timeline', icon: 'date_range', path: '/kencana-admin/timeline' },
        ]
      },
      {
        title: 'Konten Orientasi',
        items: [
          { name: 'Pra-Kencana', icon: 'flag', path: '/kencana-admin/pre-kencana' },
          { name: 'Kencana University', icon: 'account_balance', path: '/kencana-admin/university' },
          { name: 'Kencana Fakultas', icon: 'school', path: '/kencana-admin/faculty-stages' },
        ]
      },
      {
        title: 'Pasca-Kencana',
        items: [
          { name: 'Rekap Keseluruhan', icon: 'bar_chart', path: '/kencana-admin/score-summary' },
          { name: 'Rekap Nilai', icon: 'grade', path: '/kencana-admin/scores' },
          { name: 'Remedial', icon: 'autorenew', path: '/kencana-admin/remedials' },
          { name: 'Sertifikat', icon: 'workspace_premium', path: '/kencana-admin/certificates' },
        ]
      },
      {
        title: 'Data Peserta',
        items: [
          { name: 'Data Peserta', icon: 'groups', path: '/kencana-admin/participants' },
        ]
      },
      {
        title: 'Pembimbing',
        items: [
          { name: 'Kelola Kelompok', icon: 'diversity_3', path: '/kencana-admin/groups' },
          { name: 'Kelola Mentor', icon: 'supervisor_account', path: '/kencana-admin/mentors' },
        ]
      },
    ]
  },
  fakultas: {
    title: 'KENCANA',
    subtitle: 'Portal Fakultas',
    basePath: '/kencana-admin',
    accentColor: 'blue',
    menuGroups: [
      {
        title: 'Menu Utama',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/kencana-admin', exact: true },
        ]
      },
      {
        title: 'Data Fakultas',
        items: [
          { name: 'Peserta Fakultas', icon: 'groups', path: '/kencana-admin/participants' },
          { name: 'Nilai Fakultas', icon: 'grade', path: '/kencana-admin/scores' },
        ]
      },
      {
        title: 'Jadwal',
        items: [
          { name: 'Jadwal & Tahap', icon: 'calendar_month', path: '/kencana-admin/faculty-stages' },
        ]
      },
      {
        title: 'Pembimbing',
        items: [
          { name: 'Kelompok Fakultas', icon: 'diversity_3', path: '/kencana-admin/groups' },
          { name: 'Dewan Pembimbing', icon: 'supervisor_account', path: '/kencana-admin/mentors' },
        ]
      },
    ]
  },
  mentor: {
    title: 'KENCANA',
    subtitle: 'Dewan Pembimbing',
    basePath: '/kencana-mentor',
    accentColor: 'violet',
    menuGroups: [
      {
        title: 'Menu Utama',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/kencana-mentor', exact: true },
        ]
      },
      {
        title: 'Bimbingan',
        items: [
          { name: 'Kelompok Saya', icon: 'diversity_3', path: '/kencana-mentor/groups' },
          { name: 'Cari Mahasiswa', icon: 'person_search', path: '/kencana-mentor/available' },
        ]
      },
      {
        title: 'Lainnya',
        items: [
          { name: 'Pengaturan', icon: 'settings', path: '/kencana-mentor/settings' },
        ]
      },
    ]
  }
};

const accentStyles = {
  emerald: {
    activeBg: 'bg-emerald-600',
    activeHover: 'hover:bg-emerald-700',
    activeShadow: 'shadow-emerald-600/25',
    statusDot: 'bg-emerald-500',
    subtitleColor: 'text-emerald-400/70',
    logoRing: 'ring-emerald-500/20',
    logoBg: 'bg-emerald-50',
  },
  blue: {
    activeBg: 'bg-blue-600',
    activeHover: 'hover:bg-blue-700',
    activeShadow: 'shadow-blue-600/25',
    statusDot: 'bg-blue-500',
    subtitleColor: 'text-blue-400/70',
    logoRing: 'ring-blue-500/20',
    logoBg: 'bg-blue-50',
  },
  violet: {
    activeBg: 'bg-violet-600',
    activeHover: 'hover:bg-violet-700',
    activeShadow: 'shadow-violet-600/25',
    statusDot: 'bg-violet-500',
    subtitleColor: 'text-violet-400/70',
    logoRing: 'ring-violet-500/20',
    logoBg: 'bg-violet-50',
  },
};

const KencanaSidebar = ({ isOpen, setIsOpen, portalType = 'admin' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogoutHovered, setIsLogoutHovered] = React.useState(false);
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  
  const { data: mentorProfile } = useMentorProfileQuery(portalType === 'mentor');

  // Deep clone to avoid mutating the global config object
  const rawConfig = portalConfig[portalType] || portalConfig.admin;
  const config = JSON.parse(JSON.stringify(rawConfig));

  if (portalType === 'mentor' && mentorProfile) {
    if (mentorProfile.scope_type === 'faculty') {
      config.subtitle = 'Pembimbing Fakultas';
    } else {
      config.subtitle = 'Pembimbing Universitas';
    }
  }

  const accent = accentStyles[config.accentColor] || accentStyles.emerald;

  const allItems = config.menuGroups.flatMap(group => group.items);

  const isActive = (itemPath, exact) => {
    const currentPath = location.pathname;
    if (currentPath === itemPath) return true;
    if (exact) return currentPath === itemPath;
    
    if (itemPath === config.basePath) return currentPath === config.basePath;

    if (currentPath.startsWith(itemPath)) {
      const moreSpecificMatch = allItems.find(item => 
        item.path !== itemPath && 
        item.path.length > itemPath.length && 
        currentPath.startsWith(item.path)
      );
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
      <aside
        className={`
          fixed left-0 top-0 h-[100dvh] z-[70]
          border-r border-white/10
          transition-all duration-500 ease-in-out font-body
          flex flex-col overscroll-contain
          ${isOpen ? 'translate-x-0 w-72 shadow-2xl shadow-slate-900/10' : '-translate-x-full lg:translate-x-0 w-72'}
        `}
        style={{
          background: `linear-gradient(to bottom, var(--theme-sidebar-bg, #00236f), color-mix(in srgb, var(--theme-sidebar-bg, #00236f) 90%, var(--theme-primary, #00236f)))`,
          color: 'var(--theme-sidebar-text, #ffffff)'
        }}
      >
        {/* Logo Section */}
        <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <Link to={config.basePath} className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300 p-1.5 overflow-hidden">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain brightness-110" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 shadow-sm"
                style={{ borderColor: 'var(--theme-sidebar-bg, #00236f)' }}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm font-black uppercase tracking-wider"
                style={{ color: 'var(--theme-sidebar-text, #ffffff)' }}
              >
                {config.title}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: 'color-mix(in srgb, var(--theme-sidebar-text, #ffffff) 70%, var(--theme-secondary, #fed7aa))' }}
              >
                {config.subtitle}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined size-4 rotate-180">chevron_right</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 min-h-0 custom-scrollbar">
          {config.menuGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <div className="px-3 mb-2 flex items-center gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'color-mix(in srgb, var(--theme-sidebar-text, #ffffff) 50%, transparent)' }}
                >
                  {group.title}
                </span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>
              <nav className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const active = isActive(item.path, item.exact);
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3.5 px-3 py-2.5 rounded-2xl font-bold text-sm
                        transition-all duration-300 relative group overflow-hidden
                        ${active 
                          ? 'bg-white/10 border-l-4 shadow-md shadow-white/5' 
                          : 'hover:bg-white/5'
                        }
                      `}
                      style={{
                        color: active ? 'var(--theme-sidebar-text, #ffffff)' : 'color-mix(in srgb, var(--theme-sidebar-text, #ffffff) 70%, transparent)',
                        borderLeftColor: active ? 'var(--theme-secondary, #fed7aa)' : 'transparent'
                      }}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      
                      <span
                        className="material-symbols-outlined size-5 relative z-10"
                        style={{
                          color: active ? 'var(--theme-secondary, #fed7aa)' : 'color-mix(in srgb, var(--theme-sidebar-text, #ffffff) 60%, transparent)',
                          fontVariationSettings: "'FILL' 1"
                        }}
                      >
                        {item.icon}
                      </span>
                      
                      <span className="relative z-10 flex-1">{item.name}</span>

                      {item.badge && (
                        <span className={`
                          relative z-10 px-2 py-0.5 rounded-full text-[10px] font-black
                          ${active ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {user?.role === 'super_admin' && (
          <div className="p-4 bg-transparent border-t border-white/10 shrink-0">
            <Link
              to="/admin"
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-amber-400 hover:bg-white/5 transition-all duration-300 group active:scale-[0.98]"
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-400 group-hover:scale-110 transition-all duration-300" style={{ fontSize: '20px' }}>
                  arrow_back
                </span>
              </div>
              <span className="text-[13px] tracking-tight flex-1 text-left font-bold text-amber-400 transition-colors duration-300">
                Master Hub
              </span>
            </Link>
          </div>
        )}

        {/* Logout Section */}
        <div className="p-4 bg-transparent border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 active:scale-[0.98] text-xs cursor-pointer shadow-sm hover:shadow-md border border-transparent"
            style={{
              backgroundColor: isLogoutHovered
                ? 'color-mix(in srgb, var(--theme-error, #dc2626) 90%, black)'
                : 'var(--theme-error, #dc2626)',
              color: '#ffffff'
            }}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span 
                className="material-symbols-outlined transition-all duration-300" 
                style={{ 
                  fontSize: '18px', 
                  color: '#ffffff' 
                }}
              >
                logout
              </span>
            </div>
            <span className="text-xs tracking-tight flex-1 text-left font-semibold font-headline text-white">
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default KencanaSidebar;
