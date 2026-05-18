import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { toast } from 'react-hot-toast';


import { Switch } from '../../../components/ui/Switch';
import { Label } from '../../../components/ui/Label';

const NOTIF_CATEGORIES = [
  { id: 'EmailAchievement', label: 'Prestasi', desc: 'Update verifikasi dan penolakan laporan prestasi.', icon: 'emoji_events', color: 'text-[#00236F] bg-[#EAF1FF]' },
  { id: 'EmailBeasiswa', label: 'Beasiswa', desc: 'Perubahan status pengajuan dan pengingat deadline beasiswa.', icon: 'menu_book', color: 'text-[#0B4FAE] bg-[#EEF4FF]' },
  { id: 'EmailCounseling', label: 'Konseling', desc: 'Konfirmasi booking dan pengingat sesi konseling.', icon: 'handshake', color: 'text-[#1D4E9E] bg-[#EDF3FF]' },
  { id: 'EmailVoice', label: 'Student Voice', desc: 'Notifikasi saat aspirasi atau pengaduanmu direspons admin.', icon: 'forum', color: 'text-[#113A80] bg-[#F3F7FF]' },
  { id: 'EmailKencana', label: 'KENCANA', desc: 'Pengingat kuis dan materi yang belum diselesaikan.', icon: 'school', color: 'text-[#294D8D] bg-[#EEF4FF]' },
  { id: 'EmailNews', label: 'Pengumuman Kampus', desc: 'Berita dan informasi terbaru dari pihak universitas.', icon: 'notifications', color: 'text-[#2A4C86] bg-[#EDF3FF]' },
];

export default function PreferensiTab() {
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['profil', 'preferensi-notif'],
    queryFn: async () => {
      const { data } = await api.get('/profil/preferensi-notif');
      return data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      const { data: res } = await api.put('/profil/preferensi-notif', updatedData);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profil', 'preferensi-notif']);
      toast.success('Preferensi notifikasi disimpan');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan preferensi');
    }
  });

  const handleToggle = (id, prevValue) => {
    const updated = { ...prefs, [id]: !prevValue };
    mutation.mutate(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-[#00236F]" style={{ fontSize: '32px' }} >sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      
      {/* Section: In-App Notifications (Locked) */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#EAF1FF] text-[#00236F] p-2.5 rounded-xl">
               <span className="material-symbols-outlined" style={{ fontSize: '20px' }} Ring >notifications</span>
            </div>
            <h3 className="text-lg font-extrabold font-headline">Notifikasi Dalam Aplikasi</h3>
         </div>
         
          <div className="bg-[#fafafa] p-5 rounded-2xl border border-[#f5f5f5] flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#00236F]">
                   <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >settings</span>
                </div>
               <div>
                  <h4 className="font-bold text-sm">Semua Notifikasi Sistem</h4>
                  <p className="text-xs font-medium text-[#a3a3a3]">Selalu mendapatkan update dari portal BKU Student Hub.</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black uppercase text-[#a3a3a3] tracking-widest bg-white px-2 py-0.5 rounded-lg">Wajib Aktif</span>
               <Switch checked={true} disabled />
            </div>
         </div>
      </div>

      {/* Section: Email Notifications */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="bg-[#EAF1FF] text-[#00236F] p-2.5 rounded-xl">
                   <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >mail</span>
                </div>
               <div>
                  <h3 className="text-lg font-extrabold font-headline">Notifikasi Email</h3>
                  <p className="text-sm font-medium text-[#a3a3a3]">Atur email apa saja yang ingin kamu terima.</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NOTIF_CATEGORIES.map((cat) => (
                <div key={cat.id} className="p-4 rounded-2xl border border-[#f5f5f5] hover:border-[#C9D8FF] transition-all flex items-start justify-between group">
                  <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{cat.icon}</span>
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <Label htmlFor={cat.id} className="cursor-pointer font-bold text-sm group-hover:text-[#00236F] transition-colors">{cat.label}</Label>
                        <p className="text-xs font-medium text-[#a3a3a3] leading-relaxed max-w-[240px]">{cat.desc}</p>
                     </div>
                  </div>
                  <Switch 
                    id={cat.id} 
                    checked={prefs?.[cat.id]} 
                    onCheckedChange={() => handleToggle(cat.id, prefs?.[cat.id])} 
                    disabled={mutation.isPending}
                  />
               </div>
            ))}
         </div>

          <div className="mt-10 p-5 rounded-2xl bg-[#EAF1FF] border border-[#C9D8FF] flex items-start gap-3">
             <span className="material-symbols-outlined text-[#0B4FAE] shrink-0 mt-0.5" style={{ fontSize: 18 }}>info</span>
             <p className="text-xs font-medium text-[#1D4E9E] leading-relaxed">
                <strong>Catatan:</strong> Perubahan preferensi akan segera diterapkan. Kami menyarankan untuk tetap mengaktifkan notifikasi <strong>Beasiswa</strong> dan <strong>Konseling</strong> agar kamu tidak melewatkan informasi penting.
             </p>
          </div>
      </div>

    </div>
  );
}
