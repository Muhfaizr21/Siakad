import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import { LayoutDashboard, Calendar, Users, ClipboardCheck, BarChart3, FileText, Clock, Settings, Bell, LogOut } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/psychologist', icon: LayoutDashboard },
  { name: 'Janji Temu', path: '/psychologist/bookings', icon: Clock },
  { name: 'Jadwal Praktek', path: '/psychologist/schedule', icon: Calendar },
  { name: 'Rekam Medis', path: '/psychologist/patients', icon: Users },
  { name: 'Manajemen Asesmen', path: '/psychologist/assessments', icon: ClipboardCheck },
  { name: 'Analitik & Tren', path: '/psychologist/analytics', icon: BarChart3 },
  { name: 'Laporan Klinis', path: '/psychologist/reports', icon: FileText },
  { name: 'Pusat Notifikasi', path: '/psychologist/notifications', icon: Bell },
  { name: 'Pengaturan', path: '/psychologist/settings', icon: Settings },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

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
        bg-[#fcf9f8] border-r border-slate-100
        transition-all duration-500 ease-in-out
        w-64
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section (Mirroring Student) */}
        <div className="px-8 pt-10 pb-8 flex flex-col gap-1 shrink-0">
          <h2 className="text-xl font-black text-blue-900 font-headline">Portal Psikolog</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BKUhub Academic Portal</p>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 py-2 space-y-1 h-[calc(100vh-250px)] overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-slate-500 hover:text-blue-800 hover:translate-x-1'}
                `}
              >
                <Icon className={`size-5 ${isActive ? 'text-blue-900' : 'text-slate-400 group-hover:text-blue-800'}`} />
                <span className="text-sm tracking-wide font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-[#fcf9f8]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-rose-600 transition-all text-sm font-medium"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
