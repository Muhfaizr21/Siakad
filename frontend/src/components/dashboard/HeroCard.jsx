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
    cuti: 'bg-[#00236F] text-white',
    alumni: 'bg-[#737373] text-white',
  };

  const currentStatus = mahasiswa?.status?.toLowerCase() || 'alumni';

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');
    return `${baseUrl}${path}`;
  };

  return (
    <div className="bg-gradient-to-br from-[#eef4ff] to-[#e2ebff] border-l-4 border-[#00236F] rounded-2xl p-4 md:p-5 mb-2 shadow-sm relative overflow-hidden group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold font-headline leading-tight">
              {getGreeting()}, {mahasiswa?.nama_depan || mahasiswa?.nama}! 👋
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColors[currentStatus]}`}>
              {mahasiswa?.status}
            </span>
          </div>
          
          <p className="text-[#525252] font-semibold text-xs md:text-sm flex items-center flex-wrap gap-x-2.5 gap-y-1 mb-4">
            <span>NIM: <span className="text-[#171717]">{mahasiswa?.nim}</span></span>
            <span className="text-[#d4d4d4] hidden md:inline">•</span>
            <span>{mahasiswa?.prodi}</span>
            <span className="text-[#d4d4d4] hidden md:inline">•</span>
            <span>Semester {mahasiswa?.semester}</span>
          </p>
 
          {/* Contextual Message */}
          <NavLink 
            to={link_kontekstual || '#'} 
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-[#c9d8ff] text-xs font-bold text-[#00236F] hover:bg-[#00236F] hover:text-white transition-all shadow-sm group/btn"
          >
            {pesan_kontekstual}
            <ChevronRight size={16} className="translate-x-0 group-hover/btn:translate-x-1 transition-transform" />
          </NavLink>
        </div>
 
        {/* Avatar */}
        <div className="hidden sm:block">
          <div className="w-[68px] h-[68px] rounded-full bg-white border-2 border-[#00236F] shadow-md flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500">
             {mahasiswa?.foto_url ? (
               <img src={getFullUrl(mahasiswa.foto_url)} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserCircle2 size={42} className="text-[#a3a3a3]" strokeWidth={1} />
             )}
          </div>
        </div>
      </div>
      
      {/* Decorative BG pattern */}
      <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-[#00236F] opacity-[0.05] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
    </div>
  );
}
