import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/faculty', icon: 'grid_view' },
  { name: 'Penerimaan (PMB)', path: '/faculty/pmb', icon: 'person_add' },
  {
    name: 'Mahasiswa',
    icon: 'group',
    subItems: [
      { name: 'Data Mahasiswa', path: '/faculty/mahasiswa' },
      { name: 'Tambah Mahasiswa', path: '/faculty/mahasiswa/tambah' },
      { name: 'Import Data', path: '/faculty/mahasiswa/import' },
      { name: 'Status Mahasiswa', path: '/faculty/mahasiswa/status' },
    ]
  },
  { name: 'Dosen', path: '/faculty/dosen', icon: 'supervisor_account' },
  {
    name: 'Program Studi',
    icon: 'school',
    subItems: [
      { name: 'Data Prodi', path: '/faculty/prodi' },
      { name: 'Kurikulum', path: '/faculty/prodi/kurikulum' },
      { name: 'Mata Kuliah', path: '/faculty/prodi/matakuliah' },
    ]
  },
  {
    name: 'Dosen',
    icon: 'supervisor_account',
    subItems: [
      { name: 'Data Dosen', path: '/faculty/dosen' },
      { name: 'Penugasan Mengajar', path: '/faculty/dosen/penugasan' },
      { name: 'Beban SKS', path: '/faculty/dosen/beban-sks' },
    ]
  },
  {
    name: 'Jadwal',
    icon: 'event_note',
    subItems: [
      { name: 'Jadwal Kuliah', path: '/faculty/jadwal' },
      { name: 'Jadwal Ujian', path: '/faculty/jadwal/ujian' },
      { name: 'Kelola Ruangan', path: '/faculty/jadwal/ruangan' },
    ]
  },
  {
    name: 'KRS',
    icon: 'menu_book',
    subItems: [
      { name: 'Validasi KRS', path: '/faculty/krs' },
      { name: 'Periode KRS', path: '/faculty/krs/periode' },
      { name: 'Monitoring SKS', path: '/faculty/krs/monitoring' },
    ]
  },
  {
    name: 'Nilai & Transkrip',
    icon: 'assignment',
    subItems: [
      { name: 'Input Nilai', path: '/faculty/nilai' },
      { name: 'Rekap Nilai', path: '/faculty/nilai/rekap' },
      { name: 'Transkrip', path: '/faculty/nilai/transkrip' },
    ]
  },
  {
    name: 'PMB',
    icon: 'person_add',
    subItems: [
      { name: 'Pendaftar', path: '/faculty/pmb' },
      { name: 'Seleksi', path: '/faculty/pmb/seleksi' },
      { name: 'Kelulusan', path: '/faculty/pmb/kelulusan' },
    ]
  },
  {
    name: 'Konten Website',
    icon: 'newspaper',
    subItems: [
      { name: 'Berita', path: '/faculty/konten/berita' },
      { name: 'Event', path: '/faculty/konten/event' },
      { name: 'Aspirasi Mahasiswa', path: '/faculty/aspirasi' },
      { name: 'Profil Fakultas', path: '/faculty/konten/profil' },
    ]
  },
  { name: 'Laporan', path: '/faculty/laporan', icon: 'analytics' },
  { name: 'Hak Akses', path: '/faculty/hak-akses', icon: 'shield' },
  {
    name: 'Pengaturan',
    icon: 'settings',
    subItems: [
      { name: 'Tahun Akademik', path: '/faculty/pengaturan' },
      { name: 'Profil Portal', path: '/faculty/pengaturan/profil' },
    ]
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const initialState = {};
    menuItems.forEach(item => {
      if (item.subItems) {
        initialState[item.name] = item.subItems.some(sub => location.pathname.startsWith(sub.path));
      }
    });
    return initialState;
  });

  const toggleDropdown = (name) => {
    setOpenDropdowns(prev => {
      const isCurrentlyOpen = prev[name];
      const newState = {};
      // Close all others
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      // Toggle the clicked one
      newState[name] = !isCurrentlyOpen;
      return newState;
    });
  };

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
              <span className="material-symbols-outlined font-black text-2xl">school</span>
            </div>
            <div className="leading-none">
              <span className="text-lg font-black text-on-surface tracking-tight">SIAKAD</span>
              <p className="text-[11px] font-medium text-on-surface-variant">Fakultas Admin</p>
            </div>
          </div>
          {/* Close for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-2 space-y-1 h-[calc(100vh-180px)] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            if (item.subItems) {
              const isOpenDrop = openDropdowns[item.name];
              const isGroupActive = item.subItems.some(sub => location.pathname.startsWith(sub.path));
              return (
                <div key={item.name} className="flex flex-col space-y-1">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`
                      flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all duration-300 group w-full
                      ${isGroupActive && !isOpenDrop
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}
                      text-sm
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 text-[20px] ${isGroupActive && !isOpenDrop ? 'text-primary' : ''}`}>
                        {item.icon}
                      </span>
                      <span className="text-[13px] tracking-tight">{item.name}</span>
                    </div>
                    <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isOpenDrop ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                   {/* Dropdown Content */}
                  <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out pl-9 pr-2
                    ${isOpenDrop ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="flex flex-col space-y-1 border-l-2 border-outline-variant/30 ml-2 pl-3 py-2">
                      {item.subItems.map((subItem) => {
                        const isSubActive = location.pathname.startsWith(subItem.path);
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={() => setIsOpen(false)}
                            className={`
                              block py-2.5 px-4 rounded-xl text-[13px] font-semibold transition-all duration-300 relative
                              ${isSubActive
                                ? 'text-primary bg-primary/5 shadow-sm'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 hover:translate-x-1'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                               {isSubActive ? (
                                 <div className="w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-primary/10" />
                               ) : (
                                 <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
                               )}
                               <span className="truncate">{subItem.name}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = location.pathname === item.path || (item.path !== '/faculty' && location.pathname.startsWith(item.path));
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
            LOGOUT FAKULTAS
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
