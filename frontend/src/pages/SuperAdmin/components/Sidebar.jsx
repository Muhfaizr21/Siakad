import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShieldAlert, Building2, Database,
  GraduationCap, Briefcase, ClipboardList, Users,
  CreditCard, MessageSquare, BrainCircuit,
  ShieldCheck, Activity, Newspaper, Settings, LogOut
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const menuGroups = [
  {
    title: "Menu Utama",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/admin", exact: true },
      { name: "Log Aktivitas", icon: ShieldAlert, path: "/admin/audit" },
    ]
  },
  {
    title: "Manajemen Data",
    items: [
      { name: "Data Fakultas", icon: Building2, path: "/admin/faculties" },
      { name: "Data Prodi", icon: Database, path: "/admin/prodi" },
      { name: "Data Mahasiswa", icon: GraduationCap, path: "/admin/students" },
      { name: "Data Dosen", icon: Briefcase, path: "/admin/lecturers" },
    ]
  },
  {
    title: "Kegiatan & Ormawa",
    items: [
      { name: "Global Proposals", icon: ClipboardList, path: "/admin/proposals" },
      { name: "Kelola Ormawa", icon: Users, path: "/admin/organizations" },
    ]
  },
  {
    title: "Layanan & Bantuan",
    items: [
      { name: "Beasiswa", icon: CreditCard, path: "/admin/scholarships" },
      { name: "Aspirasi", icon: MessageSquare, path: "/admin/aspirations" },
      { name: "Konseling", icon: BrainCircuit, path: "/admin/counseling" },
    ]
  },
  {
    title: "Keamanan & Akses",
    items: [
      { name: "Kelola Akses (RBAC)", icon: ShieldCheck, path: "/admin/rbac" },
      { name: "Performa Admin", icon: Activity, path: "/admin/performance" },
    ]
  },
  {
    title: "Sistem & Informasi",
    items: [
      { name: "Kelola Berita", icon: Newspaper, path: "/admin/announcements" },
      { name: "Pengaturan Sistem", icon: Settings, path: "/admin/config" },
    ]
  }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 flex flex-col bg-[#f6f3f2] border-r border-slate-200/50 z-50 select-none">
      <div className="flex flex-col h-full overflow-hidden">

        {/* Brand Header */}
        <div className="shrink-0 px-6 py-6 flex items-center gap-4">
          <div className="size-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20"
            style={{ background: '#00236f' }}>
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-black text-slate-900 uppercase tracking-tighter leading-none font-headline">Master Hub</p>
            <p className="text-[9px] font-bold text-[#00236f] uppercase tracking-[0.2em] mt-1 opacity-80">Super Admin Panel</p>
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
                  <item.icon size={18} strokeWidth={2} className="shrink-0" />
                  <span className="text-[12px] tracking-tight">{item.name}</span>
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
            <LogOut size={16} />
            Keluar Sistem
          </button>
        </div>
      </div>

      <style>{`
        .sa-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 16px;
          border-radius: 14px;
          margin-bottom: 2px;
          font-weight: 700;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sa-nav-active {
          background: #00236f !important;
          color: #ffffff !important;
          box-shadow: 0 10px 15px -3px rgba(0, 35, 111, 0.25);
          transform: translateX(4px);
        }
        .sa-nav-inactive {
          color: #64748b;
          background: transparent;
        }
        .sa-nav-inactive:hover {
          background: #eae7e7;
          color: #00236f;
          transform: translateX(2px);
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
