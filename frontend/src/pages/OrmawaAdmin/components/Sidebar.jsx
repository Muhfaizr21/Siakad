import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/ormawa', icon: 'dashboard' },
  { name: 'Manajemen Anggota', path: '/ormawa/anggota', icon: 'group' },
  { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: 'draw' },
  { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: 'edit_calendar' },
  { name: 'Sistem Absensi (QR)', path: '/ormawa/absensi', icon: 'qr_code_scanner' },
  { name: 'Buku Kas & Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet' },
  { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: 'folder_open' },
  { name: 'Siaran & Pengumuman', path: '/ormawa/pengumuman', icon: 'campaign' },
  { name: 'Struktur Pengurus', path: '/ormawa/struktur', icon: 'account_tree' },
  { name: 'Role & Hak Akses', path: '/ormawa/rbac', icon: 'admin_panel_settings' },
  { name: 'Pusat Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications_active' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [ormawaName, setOrmawaName] = useState('SIAKAD ORMAWA');
  const [logoUrl, setLogoUrl] = useState(null);

  const fetchIdentity = () => {
    fetch(`http://localhost:8000/api/ormawa/settings/${ormawaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setOrmawaName(data.data.name || 'SIAKAD ORMAWA');
          setLogoUrl(data.data.logoUrl);
        }
      })
      .catch(err => console.error("Sidebar identity load failed", err));
  };

  useEffect(() => {
    fetchIdentity();

    const handleUpdate = () => fetchIdentity();
    window.addEventListener('ormawa_settings_updated', handleUpdate);
    return () => window.removeEventListener('ormawa_settings_updated', handleUpdate);
  }, [ormawaId]);

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanPath = url.replace('./', '/');
    return `http://localhost:8000${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-surface-container-lowest flex flex-col p-4 z-50 shadow-xl shadow-slate-200/40">
      <div className="mb-10 px-4 py-2 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl text-white shadow-xl shadow-primary/20 shrink-0 overflow-hidden font-bold">
          {logoUrl ? (
            <img src={getLogoUrl(logoUrl)} alt="logo" className="w-full h-full object-contain" />
          ) : (
            <span className="material-symbols-outlined text-2xl text-white">admin_panel_settings</span>
          )}
        </div>
        <div>
          <h1 className="text-[12px] font-bold text-on-surface font-headline leading-tight mb-0.5 tracking-tight uppercase line-clamp-2">{ormawaName}</h1>
          <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest leading-none opacity-80">Siakad Admin Portal</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (location.pathname === '/ormawa' && item.path === '/ormawa');
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-headline text-sm font-bold ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/10' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-outline-variant/20 space-y-2">
        <Link 
          to="/ormawa/pengaturan" 
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-headline text-sm font-bold ${
            location.pathname === '/ormawa/pengaturan' 
              ? 'bg-primary/10 text-primary border border-primary/10' 
              : 'text-on-surface-variant hover:bg-surface-container hover:text-primary border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          Pengaturan
        </Link>
        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all duration-300 font-headline text-sm font-bold">
          <span className="material-symbols-outlined">logout</span>
          Keluar
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
