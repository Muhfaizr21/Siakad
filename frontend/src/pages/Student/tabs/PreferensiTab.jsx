import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  BellRing, 
  Mail, 
  Trophy, 
  BookOpen, 
  HeartHandshake, 
  MessageSquare, 
  GraduationCap, 
  Bell,
  Settings2,
  Info,
  Loader2,
  Save
} from 'lucide-react';

import { Switch } from '../../../components/ui/Switch';
import { Label } from '../../../components/ui/Label';

const NOTIF_CATEGORIES = [
  { id: 'EmailAchievement', label: 'Prestasi', desc: 'Update verifikasi dan penolakan laporan prestasi.', icon: Trophy, color: 'text-[#f59e0b] bg-[#fffbeb]' },
  { id: 'EmailBeasiswa', label: 'Beasiswa', desc: 'Perubahan status pengajuan dan pengingat deadline beasiswa.', icon: BookOpen, color: 'text-[#10b981] bg-[#f0fdf4]' },
  { id: 'EmailCounseling', label: 'Konseling', desc: 'Konfirmasi booking dan pengingat sesi konseling.', icon: HeartHandshake, color: 'text-[#ef4444] bg-[#fef2f2]' },
  { id: 'EmailVoice', label: 'Student Voice', desc: 'Notifikasi saat aspirasi atau pengaduanmu direspons admin.', icon: MessageSquare, color: 'text-[#3b82f6] bg-[#eff6ff]' },
  { id: 'EmailKencana', label: 'KENCANA', desc: 'Pengingat kuis dan materi yang belum diselesaikan.', icon: GraduationCap, color: 'text-[#f97316] bg-[#fff7ed]' },
  { id: 'EmailNews', label: 'Pengumuman Kampus', desc: 'Berita dan informasi terbaru dari pihak universitas.', icon: Bell, color: 'text-[#8b5cf6] bg-[#f5f3ff]' },
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
        <Loader2 className="animate-spin text-[#f97316]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
      
      {/* Section: In-App Notifications (Locked) */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
         <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#fff7ed] text-[#f97316] p-2.5 rounded-xl">
               <BellRing size={20} />
            </div>
            <h3 className="text-lg font-extrabold font-headline">Notifikasi Dalam Aplikasi</h3>
         </div>
         
         <div className="bg-[#fafafa] p-5 rounded-2xl border border-[#f5f5f5] flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#f97316]">
                  <Settings2 size={20} />
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
               <div className="bg-[#eff6ff] text-[#3b82f6] p-2.5 rounded-xl">
                  <Mail size={20} />
               </div>
               <div>
                  <h3 className="text-lg font-extrabold font-headline">Notifikasi Email</h3>
                  <p className="text-sm font-medium text-[#a3a3a3]">Atur email apa saja yang ingin kamu terima.</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NOTIF_CATEGORIES.map((cat) => (
               <div key={cat.id} className="p-4 rounded-2xl border border-[#f5f5f5] hover:border-[#fed7aa] transition-all flex items-start justify-between group">
                  <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                        <cat.icon size={20} />
                     </div>
                     <div className="flex flex-col gap-0.5">
                        <Label htmlFor={cat.id} className="cursor-pointer font-bold text-sm group-hover:text-[#f97316] transition-colors">{cat.label}</Label>
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

         <div className="mt-10 p-5 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-medium text-blue-700 leading-relaxed">
               <strong>Catatan:</strong> Perubahan preferensi akan segera diterapkan. Kami menyarankan untuk tetap mengaktifkan notifikasi <strong>Beasiswa</strong> dan <strong>Konseling</strong> agar kamu tidak melewatkan informasi penting.
            </p>
         </div>
      </div>

    </div>
  );
}
