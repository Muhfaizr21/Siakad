import React from 'react';
import { UserCircle2, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function HeroCard({ data }) {
  const { mahasiswa, pesan_kontekstual, link_kontekstual } = data;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Selamat Pagi';
    if (hour >= 12 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const statusColors = {
    aktif: 'bg-[#16a34a] text-white',
    cuti: 'bg-[#d97706] text-white',
    alumni: 'bg-[#737373] text-white',
  };

  const currentStatus = mahasiswa?.status?.toLowerCase() || 'alumni';

  return (
    <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border-l-8 border-[#f97316] rounded-3xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl md:text-4xl font-extrabold font-headline">
              {getGreeting()}, {mahasiswa?.nama_depan || mahasiswa?.nama}! 👋
            </h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[currentStatus]}`}>
              {mahasiswa?.status}
            </span>
          </div>
          
          <p className="text-[#525252] font-semibold text-sm md:text-base flex items-center flex-wrap gap-x-3 gap-y-1 mb-6">
            <span>NIM: <span className="text-[#171717]">{mahasiswa?.nim}</span></span>
            <span className="text-[#d4d4d4] hidden md:inline">•</span>
            <span>{mahasiswa?.prodi}</span>
            <span className="text-[#d4d4d4] hidden md:inline">•</span>
            <span>Semester {mahasiswa?.semester}</span>
          </p>

          {/* Contextual Message */}
          <NavLink 
            to={link_kontekstual || '#'} 
            className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-[#fed7aa] text-sm font-bold text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all shadow-sm group/btn"
          >
            {pesan_kontekstual}
            <ChevronRight size={18} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
          </NavLink>
        </div>

        {/* Avatar */}
        <div className="hidden sm:block">
          <div className="w-[88px] h-[88px] rounded-full bg-white border-4 border-[#f97316] shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500">
             {mahasiswa?.foto_url ? (
               <img src={mahasiswa.foto_url} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserCircle2 size={56} className="text-[#a3a3a3]" strokeWidth={1} />
             )}
          </div>
        </div>
      </div>
      
      {/* Decorative BG pattern */}
      <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-[#f97316] opacity-[0.03] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
    </div>
  );
}
