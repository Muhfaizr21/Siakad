import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { ormawaService, API_BASE_URL } from '../../../services/api';

const menuGroups = [
  {
    title: 'MANAJEMEN UTAMA',
    items: [
      { name: 'Dashboard', path: '/ormawa', icon: 'dashboard', exact: true },
      { name: 'Anggota Aktif', path: '/ormawa/anggota', icon: 'group' },
      { name: 'Struktur Pengurus', path: '/ormawa/struktur', icon: 'account_tree' },
    ]
  },
  {
    title: 'OPERASIONAL & KEGIATAN',
    items: [
      { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: 'description' },
      { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: 'calendar_month' },
      { name: 'Sistem Absensi (QR)', path: '/ormawa/absensi', icon: 'qr_code' },
    ]
  },
  {
    title: 'ADMINISTRASI & KEUANGAN',
    items: [
      { name: 'Pagu & Buku Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet' },
      { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: 'assignment' },
    ]
  },
  {
    title: 'KOMUNIKASI & SISTEM',
    items: [
      { name: 'Aspirasi Masuk', path: '/ormawa/aspirasi', icon: 'campaign' },
      { name: 'Pusat Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications' },
      { name: 'Siaran Pengumuman', path: '/ormawa/pengumuman', icon: 'campaign' },
      { name: 'Role & Akses', path: '/ormawa/rbac', icon: 'security' },
      { name: 'Pengaturan Sistem', path: '/ormawa/pengaturan', icon: 'settings' },
    ]
  }
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const mahasiswa = useAuthStore(state => state.mahasiswa);
  const ormawaId = mahasiswa?.ormawaId || mahasiswa?.OrmawaID || 1;
  const [identity, setIdentity] = React.useState({ name: 'STUDENT HUB', alias: 'ORMAWA PORTAL' });

  const fetchIdentity = async () => {
    try {
      const data = await ormawaService.getSettings(ormawaId);
      if (data.status === 'success') setIdentity(data.data);
    } catch (e) {
      console.error("Gagal memuat identitas sidebar:", e);
    }
  };

  const getFullLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseDomain = API_BASE_URL ? API_BASE_URL.replace('/api', '') : '';
    const cleanPath = url.replace(/^\.\//, '/').replace(/^uploads/, '/uploads');
    return `${baseDomain}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  React.useEffect(() => {
    if (ormawaId) {
      fetchIdentity();
    }
  }, [ormawaId]);

  React.useEffect(() => {
    const handleUpdate = () => fetchIdentity();
    window.addEventListener('ormawa_settings_updated', handleUpdate);
    return () => window.removeEventListener('ormawa_settings_updated', handleUpdate);
  }, [ormawaId]);

  const allItems = menuGroups.flatMap(group => group.items);

  const isActive = (itemPath) => {
    const currentPath = location.pathname;
    if (currentPath === itemPath) return true;
    if (itemPath === '/ormawa') return currentPath === '/ormawa';
    
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
      <aside className={`
        fixed left-0 top-0 h-[100dvh] z-[70]
        bg-gradient-to-b from-bku-primary to-bku-hover text-slate-300
        transition-all duration-500 ease-in-out font-inter
        flex flex-col overscroll-contain border-r border-white/10 shadow-xl
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl shadow-white/5' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
        {/* Logo Section */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link to="/ormawa" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 p-1.5 overflow-hidden">
                {identity.logoUrl ? (
                  <img src={getFullLogoUrl(identity.logoUrl)} alt="Logo" className="w-full h-full object-contain brightness-110" />
                ) : (
                  <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain brightness-110" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bku-primary shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight overflow-hidden max-w-[140px]">
              <span className="text-sm font-extrabold text-white uppercase tracking-wider truncate font-headline">
                {identity.alias || identity.name}
              </span>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest font-headline">Portal Ormawa</span>
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
          {menuGroups.map((group, sIdx) => (
            <div key={sIdx} className="mb-6 last:mb-0">
              <h3 className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] font-headline">
                {group.title}
              </h3>

              <div className="space-y-1">
                {group.items.map((item) => {
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
                      
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined transition-all duration-300 ${active ? 'scale-110 text-amber-200' : 'group-hover:scale-110 text-slate-400 group-hover:text-white'}`} style={{ fontSize: '18px' }}>
                          {item.icon}
                        </span>
                      </div>
                      
                      <span className="tracking-tight flex-1 font-medium">{item.name}</span>
                      
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
