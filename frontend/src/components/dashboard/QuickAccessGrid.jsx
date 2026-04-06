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
    <div className="mb-12">
      <h2 className="text-xl font-extrabold font-headline mb-6 flex items-center gap-3">
        Akses Layanan Cepat
        <div className="h-1 flex-1 bg-gradient-to-r from-[#e5e5e5] to-transparent rounded-full ml-2"></div>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quickAccess.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.path} 
            className="group bg-white p-6 rounded-3xl border border-[#e5e5e5] hover:bg-[#fff7ed] hover:border-[#f97316]/30 hover:shadow-xl hover:shadow-orange-100/50 transition-all transform hover:scale-[1.02] duration-300 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#fff7ed] text-[#f97316] flex items-center justify-center shrink-0 shadow-sm shadow-orange-100 group-hover:scale-110 transition-transform">
                <item.icon size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold font-headline text-lg group-hover:text-[#f97316] transition-colors">{item.name}</h3>
                <p className="text-sm text-[#525252] font-medium leading-tight line-clamp-1">{item.desc}</p>
              </div>
            </div>
            <div className="bg-[#fafafa] p-2 rounded-full group-hover:bg-[#f97316]/10 transition-colors">
                <ChevronRight size={20} className="text-[#a3a3a3] group-hover:text-[#f97316] transition-all" />
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
