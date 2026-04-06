import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuGroups = [
    {
      title: "Main Dashboard",
      items: [
        { name: "Executive Analytics", icon: "dashboard", path: "/admin" },
      ]
    },
    {
      title: "User & Access Control",
      items: [
        { name: "RBAC Engine", icon: "admin_panel_settings", path: "/admin/rbac" },
        { name: "Master Student Database", icon: "database", path: "/admin/students" },
        { name: "Master Lecturer Database", icon: "badge", path: "/admin/lecturers" },
        { name: "Admin Performance", icon: "monitoring", path: "/admin/performance" },
      ]
    },
    {
      title: "Academic & Treasury",
      items: [
        { name: "Academic Portal", icon: "event_upcoming", path: "/admin/academic" },
        { name: "Financial Treasury", icon: "payments", path: "/admin/treasury" },
        { name: "Infrastructure", icon: "domain", path: "/admin/infrastructure" },
      ]
    },
    {
      title: "Student Services",
      items: [
        { name: "Aspiration Center", icon: "forum", path: "/admin/aspirations" },
        { name: "Counseling Hub", icon: "psychology", path: "/admin/counseling" },
        { name: "Global Achievement", icon: "workspace_premium", path: "/admin/achievements" },
      ]
    },
    {
      title: "Organizations",
      items: [
        { name: "Proposal Pipeline", icon: "task", path: "/admin/proposals" },
        { name: "Ormawa Registry", icon: "groups", path: "/admin/ormawa" },
      ]
    },
    {
      title: "Communication",
      items: [
        { name: "Portal Content", icon: "campaign", path: "/admin/announcements" },
        { name: "Mass Broadcast", icon: "key_visualizer", path: "/admin/broadcast" },
      ]
    },
    {
      title: "System & Guard",
      items: [
        { name: "Immutable Audit Log", icon: "policy", path: "/admin/audit" },
        { name: "System Health", icon: "health_metrics", path: "/admin/health" },
        { name: "Security Protocol", icon: "shield", path: "/admin/security" },
        { name: "Global Configuration", icon: "settings_input_component", path: "/admin/config" },
      ]
    }
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary font-bold bg-primary/10 transition-all shadow-sm border border-primary/5";
  const inactiveStyle = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all group";

  return (
    <aside className="h-screen w-80 fixed left-0 top-0 flex flex-col bg-surface border-r border-outline-variant/30 z-50 font-headline select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Brand */}
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-primary leading-tight">Master Hub</h1>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-bold opacity-70">Super Admin Power</p>
          </div>
        </div>
        
        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="px-4 text-[11px] font-extrabold text-secondary/50 uppercase tracking-[0.15em] mb-4">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    end={item.path === "/admin"}
                    className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant/30 space-y-3 bg-surface-container-low/50">
          <button className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="text-sm">Export Report</span>
          </button>
          
          <NavLink 
            to="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-all font-bold group"
          >
            <span className="material-symbols-outlined text-[22px] group-hover:rotate-180 transition-transform duration-500">logout</span>
            <span className="text-sm">Terminate Session</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
