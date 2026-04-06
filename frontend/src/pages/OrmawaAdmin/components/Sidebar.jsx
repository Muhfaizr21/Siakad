import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/ormawa', icon: 'dashboard' },
  { name: 'Manajemen Anggota', path: '/ormawa/anggota', icon: 'group' },
  { name: 'Manajemen Staf', path: '/ormawa/staff', icon: 'groups' },
  { name: 'Proposal & Kegiatan', path: '/ormawa/proposal', icon: 'edit_note' },
  { name: 'Jadwal Kalender', path: '/ormawa/jadwal', icon: 'calendar_today' },
  { name: 'Sistem Absensi (QR)', path: '/ormawa/absensi', icon: 'qr_code_scanner' },
  { name: 'Buku Kas & Keuangan', path: '/ormawa/keuangan', icon: 'account_balance_wallet' },
  { name: 'Laporan & LPJ', path: '/ormawa/lpj', icon: 'folder_open' },
  { name: 'Aspirasi Organisasi', path: '/ormawa/aspirasi', icon: 'light_mode' },
  { name: 'Siaran & Pengumuman', path: '/ormawa/pengumuman', icon: 'campaign' },
  { name: 'Struktur Pengurus', path: '/ormawa/struktur', icon: 'account_tree' },
  { name: 'Role & Hak Akses', path: '/ormawa/rbac', icon: 'admin_panel_settings' },
  { name: 'Pusat Notifikasi', path: '/ormawa/notifikasi', icon: 'notifications' },
  { name: 'Pengaturan Sistem', path: '/ormawa/pengaturan', icon: 'settings' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[60] bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-screen z-[70]
        bg-surface-container-low border-r border-outline-variant/10
        transition-all duration-500 ease-in-out font-body
        ${isOpen ? 'translate-x-0 w-72 shadow-2xl shadow-primary/20' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined font-black">hub</span>
            </div>
            <div className="leading-none">
              <span className="text-sm font-black text-on-surface uppercase tracking-widest">SIAKAD</span>
              <p className="text-[10px] font-bold text-primary opacity-60">ORMAWA PORTAL</p>
            </div>
          </div>
          {/* Close for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-2 space-y-1 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group
                  ${isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface text-sm'}
                `}
              >
                <span className={`material-symbols-outlined transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 text-[20px]'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout Section (Always bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-surface-container-low/80 backdrop-blur-md border-t border-outline-variant/5">
          <button 
            onClick={logout}
            className="w-full py-4 flex items-center justify-center gap-3 rounded-[1.5rem] bg-rose-50 text-rose-600 font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-rose-100/50"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            KELUAR
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
