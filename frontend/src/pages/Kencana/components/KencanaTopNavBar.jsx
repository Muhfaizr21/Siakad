import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { useMentorProfileQuery } from '../../../queries/useKencanaMentorQuery';

const portalLabels = {
  admin: { label: 'Admin Kencana', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  fakultas: { label: 'Kencana Fakultas', badge: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
  mentor: { label: 'Dewan Pembimbing', badge: 'bg-violet-50 text-violet-700 border-violet-100', dot: 'bg-violet-500' },
};

const breadcrumbLabels = {
  'kencana-admin': 'Dashboard',
  'kencana-fakultas': 'Dashboard',
  'kencana-mentor': 'Dashboard',
  'periods': 'Kelola Periode',
  'stages': 'Tahap & Sesi',
  'participants': 'Data Peserta',
  'scores': 'Rekap Nilai',
  'remedials': 'Remedial',
  'certificates': 'Sertifikat',
  'mentors': 'Kelola Mentor',
  'students': 'Mahasiswa Bimbingan',
  'available': 'Cari Mahasiswa',
  'settings': 'Pengaturan',
};

const KencanaTopNavBar = ({ setIsOpen, portalType = 'admin' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: mentorProfile } = useMentorProfileQuery(portalType === 'mentor');
  const pathnames = location.pathname.split('/').filter((x) => x);
  const portal = portalLabels[portalType] || portalLabels.admin;
  const email = mentorProfile?.email || user?.email || user?.Email || '-';
  const name = mentorProfile?.name || user?.nama || user?.name || email.split('@')[0] || 'User';
  const initial = String(name || email || 'U').charAt(0).toUpperCase();

  const getBreadcrumbLabel = (path) => {
    return breadcrumbLabels[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  const getRoleDisplay = () => {
    const role = user?.role;
    if (role === 'kencana_admin') return 'Admin Kencana';
    if (role === 'kencana_fakultas') return 'Admin Fakultas';
    if (role === 'kencana_mentor') return 'Dewan Pembimbing';
    return role || 'User';
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-[50] h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-8 font-body transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen?.(true)}
          className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu</span>
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 overflow-hidden">
          <div className="flex items-center text-[10px] font-extrabold tracking-widest uppercase">
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;

              return (
                <React.Fragment key={to}>
                  {index > 0 && (
                    <span className="material-symbols-outlined text-slate-300 mx-1.5 text-[14px] leading-none select-none">
                      chevron_right
                    </span>
                  )}
                  {last ? (
                    <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl truncate max-w-[160px] border border-slate-200/50 normal-case font-extrabold text-[11px] font-body">
                      {getBreadcrumbLabel(value)}
                    </span>
                  ) : (
                    <Link
                      to={to}
                      className="text-slate-400 hover:text-slate-600 transition-all duration-200 truncate max-w-[150px]"
                    >
                      {getBreadcrumbLabel(value)}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>

        {/* Portal Badge */}
        <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[10px] font-extrabold tracking-wider uppercase border ${portal.badge} shadow-sm`}>
          <span className={`w-1.5 h-1.5 ${portal.dot} rounded-full animate-pulse`} />
          {portal.label}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile */}
        <div className="relative">
        <button 
          type="button"
          className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-50 p-1 pr-2 rounded-2xl transition-all duration-300 border border-slate-200/60 bg-white shadow-sm hover:shadow-md"
          onClick={() => setIsProfileOpen((open) => !open)}
          title="Buka profil"
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
            portalType === 'admin' ? 'from-emerald-500 to-teal-600' :
            portalType === 'fakultas' ? 'from-blue-500 to-indigo-600' :
            'from-violet-500 to-purple-600'
          } text-white flex items-center justify-center font-black text-xs ring-2 ring-white shadow-md shrink-0`}>
            {initial}
          </div>
          <div className="hidden sm:flex flex-col leading-tight pr-1 shrink-0 text-left">
            <span className="text-[11px] font-extrabold text-slate-800 group-hover:text-slate-600 transition-colors truncate max-w-[140px]">
              {name}
            </span>
            <span className="text-[9px] font-bold text-slate-400 mt-0.5 truncate max-w-[160px]">
              {email}
            </span>
          </div>
          <span className="material-symbols-outlined text-[16px] text-slate-400" style={{ fontSize: '16px' }}>expand_more</span>
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="bg-slate-900 p-5 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">Profil Kencana</p>
              <p className="mt-2 truncate text-lg font-black">{name}</p>
              <p className="truncate text-sm font-semibold text-white/70">{email}</p>
              <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest">{getRoleDisplay()}</p>
            </div>
            <div className="p-2">
              {portalType === 'mentor' && (
                <button onClick={() => { setIsProfileOpen(false); navigate('/kencana-mentor/settings'); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-700">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
                  Pengaturan Profil
                </button>
              )}
              <button onClick={() => { logout(); navigate('/login'); }} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                Keluar
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default KencanaTopNavBar;
