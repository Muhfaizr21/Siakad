import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuGroups = [
    {
      title: "Menu Utama",
      items: [
        { name: "Dashboard", icon: "dashboard", path: "/admin" },
        { name: "Log Aktivitas", icon: "policy", path: "/admin/audit" },
      ]
    },
    {
      title: "Manajemen Data",
      items: [
        { name: "Data Fakultas", icon: "domain", path: "/admin/faculties" },
        { name: "Data Prodi", icon: "school", path: "/admin/majors" },
        { name: "Data Mahasiswa", icon: "database", path: "/admin/students" },
        { name: "Data Dosen", icon: "badge", path: "/admin/lecturers" },
      ]
    },
    {
      title: "Kegiatan & Ormawa",
      items: [
        { name: "Monitoring Proposal", icon: "task", path: "/admin/proposals" },
        { name: "Kelola Ormawa", icon: "groups", path: "/admin/organizations" },
      ]
    },
    {
      title: "Layanan & Bantuan",
      items: [
        { name: "Beasiswa", icon: "payments", path: "/admin/scholarships" },
        { name: "Aspirasi", icon: "forum", path: "/admin/aspirations" },
        { name: "Konseling", icon: "psychology", path: "/admin/counseling" },
      ]
    },
    {
      title: "Keamanan & Akses",
      items: [
        { name: "Kelola Akses", icon: "admin_panel_settings", path: "/admin/rbac" },
        { name: "Performa Admin", icon: "monitoring", path: "/admin/performance" },
      ]
    },
    {
      title: "Sistem & Informasi",
      items: [
        { name: "Kelola Berita", icon: "campaign", path: "/admin/announcements" },
        { name: "Pengaturan", icon: "settings", path: "/admin/config" },
      ]
    }
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary font-bold bg-primary/10 transition-all shadow-sm border border-primary/5";
  const inactiveStyle = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-slate-50 transition-all group";

  return (
    <aside className="h-screen w-80 fixed left-0 top-0 flex flex-col bg-white border-r border-slate-200 z-50 select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Brand */}
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-primary leading-tight uppercase ">Master Hub</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold opacity-90">Super Admin Panel</p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide ">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item, itemIdx) => (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    end={item.path === "/admin"}
                    className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span className="text-sm font-bold tracking-tight ">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 space-y-2 bg-slate-50/50 ">
          <button className="w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all ">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Unduh Laporan</span>
          </button>

          <NavLink
            to="/login"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold group "
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm">Keluar</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
