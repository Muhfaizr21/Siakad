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
      { name: 'Buku Kas & Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet' },
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
        bg-white border-r border-slate-200/60
        transition-all duration-500 ease-in-out font-body
        flex flex-col overscroll-contain
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl shadow-primary/10' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
        {/* Logo Section */}
        <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <Link to="/ormawa" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-300 p-1.5 overflow-hidden">
                {identity.logoUrl ? (
                  <img src={getFullLogoUrl(identity.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight overflow-hidden max-w-[140px]">
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider truncate">
                {identity.alias || identity.name}
              </span>
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Portal Ormawa</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined size-4 rotate-180">chevron_right</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 overflow-y-auto no-scrollbar scroll-smooth pb-10 overscroll-contain">
          {menuGroups.map((group, sIdx) => (
            <div key={sIdx} className="mb-8 last:mb-0">
              <h3 className="px-4 mb-3 text-[10px] font-black text-slate-400/80 uppercase tracking-[0.25em]">
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
        <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-bold text-rose-600 hover:bg-rose-50/80 transition-all duration-300 group active:scale-[0.98]"
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-rose-500/80 group-hover:text-rose-600 transition-all duration-300 group-hover:scale-110" style={{ fontSize: '20px' }}>
                logout
              </span>
            </div>
            <span className="text-[13px] tracking-tight flex-1 text-left font-bold text-rose-600/90 group-hover:text-rose-600 transition-colors duration-300">
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
