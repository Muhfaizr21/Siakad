import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { 
  User, 
  ShieldCheck, 
  BellRing, 
  Camera, 
  Loader2, 
  UserCircle2, 
  Info,
  ChevronRight
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import DataDiriTab from './tabs/DataDiriTab';
import KeamananTab from './tabs/KeamananTab';
import PreferensiTab from './tabs/PreferensiTab';
import AvatarUploadModal from './components/AvatarUploadModal';

export default function ProfilePage() {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['mahasiswa', 'profile'],
    queryFn: async () => {
      const { data } = await api.get('/profil');
      const raw = data.data || {};
      return {
        ...raw,
        Name: raw.Name || raw.Nama,
        NIM: raw.NIM || raw.nim,
        Status: raw.Status || raw.StatusAkun || raw.status,
        PhotoURL: raw.PhotoURL || raw.FotoURL,
        EntryYear: raw.EntryYear || raw.TahunMasuk,
        CurrentSemester: raw.CurrentSemester || raw.SemesterSekarang,
        Major: raw.Major || raw.ProgramStudi || null,
        Faculty: raw.Faculty || raw.Fakultas || null,
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#00236F] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <p className="text-[#00236F] font-bold">Gagal memuat profil. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const statusColors = {
    aktif: 'bg-[#EAF1FF] text-[#00236F] border-[#C9D8FF]',
    cuti: 'bg-[#EAF1FF] text-[#0B4FAE] border-[#C9D8FF]',
    alumni: 'bg-[#fafafa] text-[#737373] border-[#f5f5f5]',
  };

  const currentStatus = profile?.Status?.toLowerCase() || 'alumni';

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 text-[#171717]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-6">
        <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Student Profile</span>
      </div>

      <div className="w-full">
        
        {/* Header: Identity Section */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] p-5 md:p-7 shadow-sm mb-6 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
            
            {/* Left: Avatar */}
            <div className="flex flex-col items-center gap-4 group/avatar relative">
               <div className="w-28 h-28 rounded-full bg-[#fafafa] border-4 border-white shadow-lg flex items-center justify-center overflow-hidden relative transition-transform duration-500 group-hover/avatar:scale-105">
                  {profile?.PhotoURL ? (
                    <img src={profile.PhotoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 size={72} className="text-[#d4d4d4]" strokeWidth={1} />
                  )}
                  <button 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute inset-0 bg-[#00236F]/55 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto</span>
                  </button>
               </div>
                <button 
                 onClick={() => setIsAvatarModalOpen(true)}
                 className="text-[11px] font-extrabold text-[#00236F] uppercase tracking-widest hover:underline md:hidden"
                >
                  Ganti Foto
                </button>
             </div>

            {/* Right: SiaKAD Info */}
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl md:text-2xl font-black font-headline truncate max-w-[280px]">{profile?.Name}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[currentStatus]}`}>
                      {profile?.Status}
                    </span>
                  </div>
                   <p className="text-[#a3a3a3] font-bold text-xs md:text-sm tracking-wide">NIM: <span className="text-[#171717]">{profile?.NIM}</span></p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Program Studi</label>
                    <p className="text-sm font-bold truncate">{profile?.Major?.Name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Fakultas</label>
                    <p className="text-sm font-bold truncate">{profile?.Faculty?.Nama || profile?.Major?.Fakultas?.Nama || '-'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Angkatan</label>
                    <p className="text-sm font-bold">{profile?.EntryYear}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Semester</label>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                        {profile?.CurrentSemester} <span className="text-[#a3a3a3] opacity-30 text-xs">•</span> <span className="text-[#00236F]">Aktif</span>
                    </p>
                  </div>
               </div>
             </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-[#f5f5f5] flex items-center gap-2 text-xs font-bold text-[#a3a3a3] italic">
            <Info size={14} className="text-[#d4d4d4]" />
            Data di atas bersumber dari SIAKAD kampus dan bersifat read-only (tidak dapat diubah).
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00236F] opacity-[0.03] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="data-diri" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto mb-8 h-auto sm:h-11 p-1.5 sm:p-1">
            <TabsTrigger value="data-diri" className="gap-2">
              <User size={16} /> Data Diri
            </TabsTrigger>
            <TabsTrigger value="keamanan" className="gap-2">
              <ShieldCheck size={16} /> Keamanan Akun
            </TabsTrigger>
            <TabsTrigger value="preferensi" className="gap-2">
              <BellRing size={16} /> Preferensi Notif
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-diri" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <DataDiriTab profile={profile} />
          </TabsContent>

          <TabsContent value="keamanan" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <KeamananTab />
          </TabsContent>

          <TabsContent value="preferensi" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <PreferensiTab />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <AvatarUploadModal 
          isOpen={isAvatarModalOpen} 
          onClose={() => setIsAvatarModalOpen(false)} 
          currentPhoto={profile?.PhotoURL}
        />

      </div>
    </div>
  );
}
