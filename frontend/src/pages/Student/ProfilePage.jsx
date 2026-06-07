import React, { useState } from 'react';
import { PageContent } from '@/components/ui/page';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

import { NavLink } from 'react-router-dom';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import DataDiriTab from './tabs/DataDiriTab';
import KeamananTab from './tabs/KeamananTab';
import PreferensiTab from './tabs/PreferensiTab';
import AvatarUploadModal from './components/AvatarUploadModal';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const UserCircle2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>account_circle</span>;
const Camera = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>photo_camera</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



export default function ProfilePage() {
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
        <span className="material-symbols-outlined w-10 h-10 text-[var(--theme-primary)] animate-spin" >sync</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 text-center">
        <p className="text-[var(--theme-primary)] font-bold">Gagal memuat profil. Silakan coba lagi nanti.</p>
      </div>
    );
  }

  const statusColors = {
    aktif: 'bg-primary/10 text-primary border-primary/20',
    cuti: 'bg-secondary/10 text-secondary border-secondary/20',
    alumni: 'bg-surface text-text-muted border-border',
  };

  const currentStatus = profile?.StatusAkademik?.toLowerCase() || 'alumni';

  return (
    <PageContent className="font-body">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-text-muted mb-6">
        <NavLink to="/student/dashboard" className="hover:text-[var(--theme-primary)] cursor-pointer transition-colors">Dashboard</NavLink>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
        <span className="text-bku-text">Student Profile</span>
      </div>

      <div className="w-full">
        
        {/* Header: Identity Section */}
        <div className="bg-surface rounded-2xl border border-border p-5 md:p-7 shadow-sm mb-6 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
            
            {/* Left: Avatar */}
            <div className="flex flex-col items-center gap-4 group/avatar relative">
               <div className="w-28 h-28 rounded-full bg-background border-4 border-surface shadow-lg flex items-center justify-center overflow-hidden relative transition-transform duration-500 group-hover/avatar:scale-105">
                  {profile?.FotoURL ? (
                    <img src={profile.FotoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 size={72} className="text-text-muted opacity-50" strokeWidth={1} />
                  )}
                  <button 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute inset-0 bg-[var(--theme-primary)]/55 text-white flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto</span>
                  </button>
               </div>
                <button 
                 onClick={() => setIsAvatarModalOpen(true)}
                 className="text-[11px] font-extrabold text-[var(--theme-primary)] uppercase tracking-widest hover:underline md:hidden"
                >
                  Ganti Foto
                </button>
             </div>

            {/* Right: SiaKAD Info */}
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl md:text-2xl font-black font-headline truncate max-w-[280px] text-bku-text">{profile?.Nama}</h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[currentStatus] || statusColors['aktif']}`}>
                      {profile?.StatusAkademik}
                    </span>
                  </div>
                   <p className="text-text-muted font-bold text-xs md:text-sm tracking-wide">NIM: <span className="text-bku-text">{profile?.NIM}</span></p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Program Studi</label>
                    <p className="text-sm font-bold truncate">{profile?.ProgramStudi?.Nama}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Angkatan</label>
                    <p className="text-sm font-bold">{profile?.TahunMasuk}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Semester</label>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                        {profile?.SemesterSekarang} <span className="text-text-muted opacity-30 text-xs">•</span> <span className="text-[var(--theme-primary)]">Aktif</span>
                    </p>
                  </div>
               </div>
             </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-border-muted flex items-center gap-2 text-xs font-bold text-text-muted italic">
            <span className="material-symbols-outlined text-text-muted opacity-50" style={{ fontSize: 14 }}>info</span>
            Data di atas bersumber dari sistem Student Hub dan bersifat read-only (tidak dapat diubah).
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--theme-primary)] opacity-[0.03] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="data-diri" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto mb-8 h-auto sm:h-11 p-1.5 sm:p-1">
            <TabsTrigger value="data-diri" className="gap-2">
              <User size={16} /> Data Diri
            </TabsTrigger>
            <TabsTrigger value="keamanan" className="gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >security</span> Keamanan Akun
            </TabsTrigger>
            <TabsTrigger value="preferensi" className="gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >notifications</span> Preferensi Notif
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
    </PageContent>
  );
}
