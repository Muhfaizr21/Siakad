import React from 'react';
import { Activity, Trophy, MessageSquare, BookOpen, GraduationCap, HeartHandshake, Users, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ACTIVITY_ICONS = {
  achievement: { icon: Trophy, bg: 'bg-[#eef4ff]', text: 'text-[#00236F]' },
  beasiswa: { icon: BookOpen, bg: 'bg-[#f0fdf4]', text: 'text-[#16a34a]' },
  konseling: { icon: HeartHandshake, bg: 'bg-[#fef2f2]', text: 'text-[#ef4444]' },
  kencana: { icon: GraduationCap, bg: 'bg-[#eef4ff]', text: 'text-[#00236F]' },
  voice: { icon: MessageSquare, bg: 'bg-[#eff6ff]', text: 'text-[#3b82f6]' },
  organisasi: { icon: Users, bg: 'bg-[#f5f3ff]', text: 'text-[#8b5cf6]' },
};

function formatRelativeTime(date) {
  const diff = (new Date() - new Date(date)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 172800) return 'Kemarin';
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function ActivityFeed({ activities }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-[#e5e5e5] shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-extrabold font-headline flex items-center gap-2.5">
          <Activity size={20} className="text-[#00236F]" />
          Aktivitas Terbaru
        </h3>
        {/* <NavLink to="/student/dashboard" className="text-xs font-bold text-[#a3a3a3] hover:text-primary transition-colors">Lihat Semua</NavLink> */}
      </div>

      {activities?.length > 0 ? (
        <div className="flex-1 flex flex-col gap-6 relative">
          {/* Vertical line connector */}
          <div className="absolute left-6 top-2 bottom-6 w-[1px] bg-[#f5f5f5] z-0"></div>
          
          {activities.map((item, i) => {
            const config = ACTIVITY_ICONS[item.tipe] || { icon: Info, bg: 'bg-[#fafafa]', text: 'text-[#a3a3a3]' };
            return (
              <NavLink 
                key={i} 
                to={item.link || '#'} 
                className="flex items-start gap-4 group/item relative z-10 hover:translate-x-1 transition-transform"
              >
                <div className={`w-12 h-12 ${config.bg} ${config.text} rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm ring-4 ring-white`}>
                  <config.icon size={22} />
                </div>
                <div className="flex-1 flex flex-col gap-1 pt-1 border-b border-[#f5f5f5] pb-4 group-last/item:border-0">
                   <p className="text-sm font-bold text-[#171717] leading-snug group-hover/item:text-[#00236F] transition-colors">
                       {item.deskripsi}
                   </p>
                   <span className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest">
                      {formatRelativeTime(item.created_at)}
                   </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-40">
           <Info size={40} className="text-[#d4d4d4] mb-3" />
           <p className="text-sm font-bold text-[#a3a3a3] text-center max-w-[200px]">
              Belum ada aktivitas. Mulai eksplorasi layanan BKU Student Hub!
           </p>
        </div>
      )}
    </div>
  );
}
