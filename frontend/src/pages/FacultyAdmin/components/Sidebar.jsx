import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/faculty', icon: 'dashboard' },
  { 
    name: 'Data Master', 
    icon: 'folder_managed',
    subItems: [
      { name: 'Data PMB', path: '/faculty/pmb' },
      { name: 'Program Studi', path: '/faculty/prodi' },
      { name: 'Data Dosen', path: '/faculty/dosen' },
      { name: 'Data Mahasiswa', path: '/faculty/mahasiswa' },
    ]
  },
  {
    name: 'Akademik',
    icon: 'school',
    subItems: [
      { name: 'Jadwal Kuliah', path: '/faculty/jadwal' },
      { name: 'Manajemen KRS', path: '/faculty/krs' },
      { name: 'Pengelolaan Nilai', path: '/faculty/nilai' },
    ]
  },
  {
    name: 'Manajemen',
    icon: 'settings_suggest',
    subItems: [
      { name: 'Manajemen Konten', path: '/faculty/konten' },
      { name: 'Aspirasi', path: '/faculty/aspirasi' },
      { name: 'Laporan', path: '/faculty/laporan' },
      { name: 'Pengaturan', path: '/faculty/pengaturan' },
    ]
  }
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
    setOpenDropdowns(prev => ({ ...prev, [name]: !prev[name] }));
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
              <span className="material-symbols-outlined font-black">account_balance</span>
            </div>
            <div className="leading-none">
              <span className="text-sm font-black text-on-surface uppercase tracking-widest">SIAKAD</span>
              <p className="text-[10px] font-bold text-primary opacity-60 uppercase">Faculty Portal</p>
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
                              block py-2.5 px-4 rounded-xl text-[12px] font-bold transition-all duration-300 relative
                              ${isSubActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1'
                                : 'text-on-surface-variant hover:text-primary hover:bg-primary/5'}
                            `}
                          >
                            {/* Dot indicator for active */}
                            {isSubActive && <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary ring-4 ring-surface-container-low" />}
                            {subItem.name}
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
