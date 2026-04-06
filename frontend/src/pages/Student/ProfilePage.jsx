import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  User, 
  ShieldCheck, 
  BellRing, 
  Camera, 
  Loader2, 
  UserCircle2, 
  CheckCircle2, 
  Info,
  ChevronRight
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import DataDiriTab from './tabs/DataDiriTab';
import KeamananTab from './tabs/KeamananTab';
import PreferensiTab from './tabs/PreferensiTab';
import AvatarUploadModal from './components/AvatarUploadModal';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['mahasiswa', 'profile'],
    queryFn: async () => {
      const { data } = await api.get('/profil');
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#f97316] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">Gagal memuat profil. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const statusColors = {
    aktif: 'bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]',
    cuti: 'bg-[#fff7ed] text-[#d97706] border-[#ffedd5]',
    alumni: 'bg-[#fafafa] text-[#737373] border-[#f5f5f5]',
  };

  const currentStatus = profile?.Status?.toLowerCase() || 'alumni';

  return (
    <div className="p-6 md:p-10 text-[#171717]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8">
        <span className="hover:text-[#f97316] cursor-pointer transition-colors">Dashboard</span>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Student Profile</span>
      </div>

      <div className="w-full">
        
        {/* Header: Identity Section */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-10 shadow-sm mb-8 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
            
            {/* Left: Avatar */}
            <div className="flex flex-col items-center gap-4 group/avatar relative">
               <div className="w-32 h-32 rounded-full bg-[#fafafa] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative transition-transform duration-500 group-hover/avatar:scale-105">
                  {profile?.PhotoURL ? (
                    <img src={profile.PhotoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 size={72} className="text-[#d4d4d4]" strokeWidth={1} />
                  )}
                  <button 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto</span>
                  </button>
               </div>
               <button 
                onClick={() => setIsAvatarModalOpen(true)}
                className="text-[11px] font-extrabold text-[#f97316] uppercase tracking-widest hover:underline md:hidden"
               >
                 Ganti Foto
               </button>
            </div>

            {/* Right: SiaKAD Info */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-black font-headline truncate max-w-[280px]">{profile?.Name}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[currentStatus]}`}>
                      {profile?.Status}
                    </span>
                  </div>
                  <p className="text-[#a3a3a3] font-bold text-sm tracking-wide">NIM: <span className="text-[#171717]">{profile?.NIM}</span></p>
               </div>
               
               <div className="grid grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Program Studi</label>
                    <p className="text-sm font-bold truncate">{profile?.Major?.Name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Angkatan</label>
                    <p className="text-sm font-bold">{profile?.EntryYear}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block mb-1">Semester</label>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                        {profile?.CurrentSemester} <span className="text-[#a3a3a3] opacity-30 text-xs">•</span> <span className="text-[#f97316]">Aktif</span>
                    </p>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#f5f5f5] flex items-center gap-2 text-xs font-bold text-[#a3a3a3] italic">
            <Info size={14} className="text-[#d4d4d4]" />
            Data di atas bersumber dari SIAKAD kampus dan bersifat read-only (tidak dapat diubah).
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f97316] opacity-[0.02] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="data-diri" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto mb-10 h-auto sm:h-12 p-1.5 sm:p-1">
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
