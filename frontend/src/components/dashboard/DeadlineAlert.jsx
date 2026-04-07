import React from 'react';
import { AlertCircle, ChevronRight, Calendar, BookOpen, HeartHandshake, Info } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const DEADLINE_ICONS = {
    beasiswa: BookOpen,
    konseling: HeartHandshake,
    kampus: Calendar,
    kencana: Info,
    organisasi: Info,
};

export default function DeadlineAlert({ deadlines }) {
  if (!deadlines || deadlines.length === 0) return null;

  const visibleDeadlines = deadlines.slice(0, 3);

  return (
    <div className="w-full bg-gradient-to-br from-[#f4f8ff] to-[#eaf1ff] border border-[#c9d8ff] rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden group/alert animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#00236F]/10 pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <h2 className="text-sm md:text-base font-extrabold font-headline flex items-center gap-2 text-[#00236F]">
          <AlertCircle size={18} />
          Pengingat Jatuh Tempo
        </h2>
        <NavLink 
            to="/student/notifikasi"
            className="text-[11px] font-bold text-[#00236F] hover:underline flex items-center gap-1 group/btn"
        >
            Lihat Semua
            <ChevronRight size={14} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
        </NavLink>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 relative z-10">
        {visibleDeadlines.map((item, i) => {
          const Icon = DEADLINE_ICONS[item.tipe] || Info;
          const urgencyColor = 
            item.sisa_hari < 3 ? 'text-[#dc2626] bg-[#fef2f2]' : 
            item.sisa_hari < 7 ? 'text-[#00236F] bg-[#eef4ff]' : 
            'text-[#737373] bg-[#fafafa]';

          return (
            <NavLink 
                key={i} 
                to={item.link || '#'} 
                className="bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-[#dbe7ff] flex items-center justify-between hover:shadow-md hover:border-[#00236F]/30 transition-all group/card"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#eef4ff] text-[#00236F] flex items-center justify-center shrink-0 border border-[#dbe7ff]">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#171717] truncate">{item.nama}</h4>
                  <p className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${urgencyColor}`}>
                     {item.sisa_hari} Hari Lagi
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#d4d4d4] group-hover/card:text-[#00236F] group-hover/card:translate-x-1 transition-all ml-2 shrink-0" />
            </NavLink>
          );
        })}
      </div>

      {deadlines.length > 3 && (
        <p className="text-[11px] text-[#1E3A8A] font-semibold mt-3 relative z-10">
          +{deadlines.length - 3} pengingat lainnya tersedia di halaman kegiatan.
        </p>
      )}
    </div>
  );
}
