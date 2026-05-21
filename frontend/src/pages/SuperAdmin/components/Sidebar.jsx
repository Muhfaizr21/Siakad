import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import useAuthStore from '../../../store/useAuthStore';

const menuGroups = [
  {
    title: "Menu Utama",
    items: [
      { name: "Dashboard", icon: 'dashboard', path: "/admin", exact: true },
      { name: "Log Aktivitas", icon: 'warning', path: "/admin/audit" },
    ]
  },
  {
    title: "Manajemen Data",
    items: [
      { name: "Data Fakultas", icon: 'apartment', path: "/admin/faculties" },
      { name: "Data Prodi", icon: 'database', path: "/admin/prodi" },
      { name: "Data Mahasiswa", icon: 'school', path: "/admin/students" },
      { name: "Data Psikolog", icon: 'psychology', path: "/admin/psychologists" },
    ]
  },
  {
    title: "Kegiatan & Ormawa",
    items: [
      { name: "Global Proposals", icon: 'assignment', path: "/admin/proposals" },
      { name: "Kelola Ormawa", icon: 'group', path: "/admin/organizations" },
    ]
  },
  {
    title: "Layanan & Bantuan",
    items: [
      { name: "Beasiswa", icon: 'payment', path: "/admin/scholarships" },
      { name: "Prestasi Mahasiswa", icon: 'emoji_events', path: "/admin/achievements" },
      { name: "Aspirasi", icon: 'chat', path: "/admin/aspirations" },
    ]
  },
  {
    title: "Keamanan & Akses",
    items: [
      { name: "Kelola Akses (RBAC)", icon: 'security', path: "/admin/rbac" },
      { name: "Performa Admin", icon: 'show_chart', path: "/admin/performance" },
    ]
  },
  {
    title: "Sistem & Informasi",
    items: [
      { name: "Kelola Berita", icon: 'newspaper', path: "/admin/announcements" },
      { name: "Pengaturan Sistem", icon: 'settings', path: "/admin/config" },
    ]
  }
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`h-screen w-72 fixed left-0 top-0 flex flex-col bg-white border-r border-[#e5e5e5] z-50 select-none transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Brand Header */}
        <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="relative">
              <div className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-300 p-1.5">
                <img src="/images/bku logo.png" alt="BKU Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[15px] font-black text-[#171717] font-headline tracking-tight">
                MASTER HUB
              </span>
              <span className="text-[10px] font-bold text-[#00236f] uppercase tracking-widest opacity-80 font-jakarta">Super Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 no-scrollbar">
          {menuGroups.map((group, gi) => (
            <div key={gi} className="mb-6">
              <p className="px-4 mb-2 text-[8px] font-black uppercase tracking-[0.4em] text-slate-400/80 font-headline">
                {group.title}
              </p>
              {group.items.map((item, ii) => (
                <NavLink
                  key={ii}
                  to={item.path}
                  end={!!item.exact}
                  className={({ isActive }) =>
                    isActive
                      ? 'sa-nav-item sa-nav-active'
                      : 'sa-nav-item sa-nav-inactive'
                  }
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>{item.icon}</span>
                  <span className="text-[13px] font-semibold tracking-tight font-headline">{item.name}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="shrink-0 px-4 py-6 border-t border-slate-200/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-rose-100/50"
          >
            <span className="material-symbols-outlined " size={16}>logout</span>
            Keluar Sistem
          </button>
        </div>
      </div>

      <style>{`
        .sa-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          margin-bottom: 4px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sa-nav-active {
          background: #eef4ff !important;
          color: #00236f !important;
          border: 1px solid #c9d8ff;
        }
        .sa-nav-inactive {
          color: #525252;
          background: transparent;
        }
        .sa-nav-inactive:hover {
          background: #f7faff;
          color: #171717;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
