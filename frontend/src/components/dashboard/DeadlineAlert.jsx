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

  return (
    <div className="bg-[#fffbeb] border-l-8 border-[#fbbf24] rounded-3xl p-6 md:p-8 mb-10 shadow-sm relative overflow-hidden group/alert animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold font-headline flex items-center gap-3 text-[#d97706]">
          <AlertCircle size={24} />
          Pengingat Jatuh Tempo
        </h2>
        <NavLink 
            to="/student/dashboard" // To calendar section
            className="text-sm font-bold text-[#d97706] hover:underline flex items-center gap-1 group/btn"
        >
            Lihat Semua Kegiatan
            <ChevronRight size={16} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
        </NavLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deadlines.map((item, i) => {
          const Icon = DEADLINE_ICONS[item.tipe] || Info;
          const urgencyColor = 
            item.sisa_hari < 3 ? 'text-[#dc2626] bg-[#fef2f2]' : 
            item.sisa_hari < 7 ? 'text-[#d97706] bg-[#fffbeb]' : 
            'text-[#737373] bg-[#fafafa]';

          return (
            <NavLink 
                key={i} 
                to={item.link} 
                className="bg-white p-4 rounded-2xl border border-[#fee2e2] flex items-center justify-between hover:shadow-md transition-all group/card"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fffbeb] text-[#d97706] flex items-center justify-center shrink-0 border border-[#fef3c7]">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#171717] line-clamp-1">{item.nama}</h4>
                  <p className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${urgencyColor}`}>
                    {item.sisa_hari} Hari Lagi
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#d4d4d4] group-hover/card:text-[#d97706] group-hover/card:translate-x-1 transition-all" />
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
