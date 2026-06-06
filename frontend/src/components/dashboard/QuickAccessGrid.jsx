import React from 'react';
import { NavLink } from 'react-router-dom';

const quickAccess = [
  { name: 'KENCANA', icon: 'school', path: '/student/kencana', bg: 'bg-blue-50', hexColor: '#2563eb', border: 'border-blue-100', label: 'Program Pengenalan Kampus & PKKMB' },
  { name: 'Achievement', icon: 'emoji_events', path: '/student/achievement', bg: 'bg-amber-50', hexColor: '#d97706', border: 'border-amber-100', label: 'Lapor dan kelola prestasi akademikmu' },
  { name: 'Scholarship', icon: 'workspace_premium', path: '/student/scholarship', bg: 'bg-emerald-50', hexColor: '#16a34a', border: 'border-emerald-100', label: 'Temukan dan daftar beasiswa tersedia' },
  { name: 'Organisasi', icon: 'groups', path: '/student/organisasi', bg: 'bg-[#EAF1FF]', hexColor: '#00236F', border: 'border-[#C9D8FF]', label: 'Kelola keorganisasian dan daftar Ormawa' },
  { name: 'Counseling', icon: 'support_agent', path: '/student/counseling', bg: 'bg-violet-50', hexColor: '#7c3aed', border: 'border-violet-100', label: 'Jadwalkan sesi konseling bersama ahli' },
  { name: 'Health', icon: 'monitor_heart', path: '/student/health', bg: 'bg-rose-50', hexColor: '#e11d48', border: 'border-rose-100', label: 'Pantau data kesehatanmu' },
  { name: 'Student Voice', icon: 'chat', path: '/student/voice', bg: 'bg-indigo-50', hexColor: '#4f46e5', border: 'border-indigo-100', label: 'Sampaikan aspirasi dan pengaduanmu' },
];

export default function QuickAccessGrid() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-4 w-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
        <h2 className="text-sm font-semibold text-muted-foreground">Akses Cepat</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {quickAccess.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={`group glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border ${item.border} hover:bg-blue-50`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm ${item.bg}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: item.hexColor }}>{item.icon}</span>
            </div>
            <span className="text-xs font-medium text-muted group-hover:text-primary text-center leading-tight transition-colors">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}