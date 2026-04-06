import React from 'react';
import { 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  HeartHandshake, 
  Stethoscope, 
  MessageSquare, 
  ChevronRight 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const quickAccess = [
  { name: 'KENCANA', icon: GraduationCap, path: '/student/kencana', desc: 'Program Pengenalan Kampus & PKKMB' },
  { name: 'Achievement', icon: Trophy, path: '/student/achievement', desc: 'Lapor dan kelola prestasi akademikmu' },
  { name: 'Scholarship', icon: BookOpen, path: '/student/scholarship', desc: 'Temukan dan daftar beasiswa tersedia' },
  { name: 'Counseling', icon: HeartHandshake, path: '/student/counseling', desc: 'Jadwalkan sesi konseling bersama ahli' },
  { name: 'Health Screening', icon: Stethoscope, path: '/student/health', desc: 'Pantau data kesehatanmu' },
  { name: 'Student Voice', icon: MessageSquare, path: '/student/voice', desc: 'Sampaikan aspirasi dan pengaduanmu' },
];

export default function QuickAccessGrid() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-extrabold font-headline mb-4 flex items-center gap-3">
        Akses Layanan Cepat
        <div className="h-1 flex-1 bg-gradient-to-r from-[#e5e5e5] to-transparent rounded-full ml-2"></div>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {quickAccess.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className="group bg-white p-4 rounded-2xl border border-[#e5e5e5] hover:bg-[#eef4ff] hover:border-[#00236F]/30 hover:shadow-md transition-all duration-300 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#eef4ff] text-[#00236F] flex items-center justify-center shrink-0 shadow-sm shadow-[#00236F]/10 group-hover:scale-105 transition-transform">
                <item.icon size={20} />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="font-bold font-headline text-sm group-hover:text-[#00236F] transition-colors truncate">{item.name}</h3>
                <p className="text-xs text-[#525252] font-medium leading-tight line-clamp-1">{item.desc}</p>
              </div>
            </div>
            <div className="bg-[#fafafa] p-1.5 rounded-full group-hover:bg-[#00236F]/10 transition-colors shrink-0 ml-2">
                <ChevronRight size={16} className="text-[#a3a3a3] group-hover:text-[#00236F] transition-all" />
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
