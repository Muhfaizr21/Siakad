import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { ormawaService } from '../../../services/api';

const menuItems = [
  { name: 'Dashboard', path: '/ormawa', icon: 'dashboard', permission: 'dashboard' },
  { name: 'KENCANA (PKKMB)', path: '/ormawa/pkkmb', icon: 'school', permission: 'dashboard' },
  { name: 'Manajemen Anggota', path: '/ormawa/anggota', icon: 'group', permission: 'anggota' },
  { name: 'Manajemen Staf', path: '/ormawa/staff', icon: 'groups', permission: 'anggota' },
  { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: 'edit_note', permission: 'proposal' },
  { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: 'calendar_today', permission: 'jadwal' },
  { name: 'Sistem Absensi (QR)', path: '/ormawa/absensi', icon: 'qr_code_scanner', permission: 'absensi' },
  { name: 'Buku Kas & Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet', permission: 'keuangan' },
  { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: 'folder_open', permission: 'lpj' },
  { name: 'Aspirasi Organisasi', path: '/ormawa/aspirasi', icon: 'light_mode', permission: 'aspirasi' },
  { name: 'Siaran & Pengumuman', path: '/ormawa/pengumuman', icon: 'campaign', permission: 'pengumuman' },
  { name: 'Struktur Pengurus', path: '/ormawa/struktur', icon: 'account_tree', permission: 'struktur' },
  { name: 'Role & Hak Akses', path: '/ormawa/rbac', icon: 'admin_panel_settings', permission: 'rbac' },
  { name: 'Pusat Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications', permission: 'dashboard' },
  { name: 'Pengaturan Sistem', path: '/ormawa/pengaturan', icon: 'settings', permission: 'dashboard' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);
  const mahasiswa = useAuthStore(state => state.mahasiswa);
  const ormawaId = mahasiswa?.ormawaId || mahasiswa?.OrmawaID || 1;
  const hasPermission = (perm, action) => true; // Temporary mapping or fetch from user roles
  const [identity, setIdentity] = React.useState({ name: 'STUDENT HUB', alias: 'ORMAWA PORTAL' });

  // Filter menu based on permissions
  const filteredMenu = menuItems.filter(item => {
    if (item.permission === 'dashboard') return true;
    return hasPermission(item.permission, 'view');
  });

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
    // Derive base domain from API_BASE_URL (remove /api)
    const baseDomain = API_BASE_URL ? API_BASE_URL.replace('/api', '') : 'http://localhost:8000';
    const cleanPath = url.replace(/^\.\//, '/').replace(/^uploads/, '/uploads');
    return `${baseDomain}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  React.useEffect(() => {
    if (ormawaId) {
      fetchIdentity();
    }
  }, [ormawaId]);

  // Listen for global settings updates (sent from Settings.jsx)
  React.useEffect(() => {
    const handleUpdate = () => fetchIdentity();
    window.addEventListener('ormawa_settings_updated', handleUpdate);
    return () => window.removeEventListener('ormawa_settings_updated', handleUpdate);
  }, [ormawaId]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-full z-[70]
        bg-white border-r border-slate-100
        transition-all duration-500 ease-in-out font-headline
        w-64 lg:w-60
        ${isOpen ? 'translate-x-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)]' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <Link to="/ormawa" className="flex items-center gap-3.5 group">
            <div className="relative">
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-300 p-1.5 overflow-hidden shrink-0">
                {identity.logoUrl ? (
                  <img src={getFullLogoUrl(identity.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight overflow-hidden max-w-[120px]">
              <span className="text-sm font-black text-slate-900 uppercase tracking-wider truncate">
                {identity.alias || identity.name}
              </span>
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Portal Ormawa</span>
            </div>
          </Link>
          {/* Close for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar scroll-smooth">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl font-black transition-all duration-300 group relative overflow-hidden
                  ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-primary text-sm'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-full" />
                )}
                <span className={`material-symbols-outlined transition-transform duration-300 ${isActive ? 'scale-110 !text-white' : 'group-hover:scale-110 text-[20px] text-slate-400 group-hover:text-primary'}`}>
                  {item.icon}
                </span>
                <span className="text-[11px] tracking-tight uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Section (Always bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-slate-50">
          <button
            onClick={logout}
            className="w-full py-3 flex items-center justify-center gap-3 rounded-2xl bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            KELUAR
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
