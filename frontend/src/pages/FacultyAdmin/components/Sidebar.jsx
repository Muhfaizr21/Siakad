import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const menuSections = [
  {
    label: 'Utama',
    items: [
      { name: 'Dashboard', path: '/faculty', icon: 'grid_view' },
    ]
  },
  {
    label: 'Akademik',
    items: [
      { name: 'Penerimaan (PMB)', path: '/faculty/pmb', icon: 'person_add' },
      { name: 'Manajemen Mahasiswa', path: '/faculty/mahasiswa', icon: 'group' },
      { name: 'Data Dosen', path: '/faculty/dosen', icon: 'supervisor_account' },
      { name: 'Program Studi', path: '/faculty/prodi', icon: 'account_balance' },
      { name: 'Jadwal Kuliah', path: '/faculty/jadwal', icon: 'event_note' },
      { name: 'Validasi KRS', path: '/faculty/krs', icon: 'fact_check' },
      { name: 'Input Nilai', path: '/faculty/nilai', icon: 'grade' },
    ]
  },
  {
    label: 'Layanan Mahasiswa',
    items: [
      { name: 'Aspirasi Mahasiswa', path: '/faculty/aspirasi', icon: 'forum' },
      { name: 'Jadwal Konseling', path: '/faculty/konseling', icon: 'event_available' },
      { name: 'Verifikasi Prestasi', path: '/faculty/prestasi', icon: 'verified' },
      { name: 'E-Persuratan', path: '/faculty/persuratan', icon: 'forward_to_inbox' },
    ]
  },
  {
    label: 'Kelulusan & Karir',
    items: [
      { name: 'Pendaftaran Yudisium', path: '/faculty/yudisium', icon: 'school' },
      { name: 'Manajemen MBKM', path: '/faculty/mbkm', icon: 'explore' },
      { name: 'Pengajuan Beasiswa', path: '/faculty/beasiswa', icon: 'workspace_premium' },
    ]
  },
  {
    label: 'Organisasi & Konten',
    items: [
      { name: 'Proposal ORMAWA', path: '/faculty/ormawa/proposals', icon: 'description' },
      { name: 'Organisasi Fakultas', path: '/faculty/organisasi', icon: 'groups' },
      { name: 'Konten Website', path: '/faculty/konten', icon: 'newspaper' },
    ]
  },
  {
    label: 'Administrasi',
    items: [
      { name: 'Mahasiswa Baru', path: '/faculty/mahasiswa/baru', icon: 'person_add' },
      { name: 'Master Fakultas', path: '/faculty/fakultas', icon: 'corporate_fare' },
      { name: 'Laporan & Rekap', path: '/faculty/laporan', icon: 'analytics' },
      { name: 'Pengaturan Akun', path: '/faculty/pengaturan', icon: 'settings' },
    ]
  },
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
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/5 border border-primary/20">
              <span className="material-symbols-outlined font-black">school</span>
            </div>
            <div className="leading-none overflow-hidden max-w-[120px]">
              <span className="text-xs font-black text-on-surface uppercase tracking-widest block truncate">
                SIAKAD
              </span>
              <p className="text-[9px] font-bold text-primary opacity-60 uppercase truncate">Portal Fakultas</p>
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
        <nav className="px-3 py-1 h-[calc(100vh-170px)] overflow-y-auto no-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="mt-5">
              {/* Section Label */}
              <div className="px-4 mb-2">
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">
                  {section.label}
                </span>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-2xl font-bold transition-all duration-200 group
                        ${isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                          : 'text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface'}
                      `}
                    >
                      <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isActive ? '' : 'text-on-surface-variant/70 group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <span className="text-[13px] tracking-tight">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User / Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-container-low/80 backdrop-blur-md border-t border-outline-variant/10">
          <button
            onClick={logout}
            className="w-full py-3.5 flex items-center justify-center gap-3 rounded-[1.5rem] bg-rose-50 text-rose-600 font-bold text-[11px] uppercase tracking-[0.2em] shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-rose-100/50"
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
