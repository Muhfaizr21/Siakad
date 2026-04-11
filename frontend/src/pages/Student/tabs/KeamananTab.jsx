import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  History, 
  LogOut, 
  Eye, 
  EyeOff, 
  Monitor, 
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';

import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus mengandung huruf besar')
    .regex(/[a-z]/, 'Harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung angka'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirm_password"],
});

export default function KeamananTab() {
  const queryClient = useQueryClient();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const newPassword = watch('new_password', '');

  const { data: sessions } = useQuery({
    queryKey: ['profil', 'sesi-aktif'],
    queryFn: async () => {
      const { data } = await api.get('/profil/sesi-aktif');
      return data.data;
    }
  });

  const { data: history } = useQuery({
    queryKey: ['profil', 'riwayat-login'],
    queryFn: async () => {
      const { data } = await api.get('/profil/riwayat-login');
      return data.data;
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async (data) => {
      const { data: res } = await api.put('/profil/ganti-password', data);
      return res;
    },
    onSuccess: () => {
      reset();
      toast.success('Password berhasil diubah');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    }
  });

  const getStrength = (pwd) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    return (score / 4) * 100;
  };

  const strength = getStrength(newPassword);

  return (
    <div className="space-y-8">
      
      {/* Card A: Ganti Password */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
         <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#EAF1FF] text-[#00236F] p-3 rounded-2xl">
               <KeyRound size={24} />
            </div>
            <div>
               <h3 className="text-xl font-extrabold font-headline">Ganti Password</h3>
               <p className="text-sm font-medium text-[#a3a3a3]">Pastikan password kamu kuat dan sulit ditebak.</p>
            </div>
         </div>

         <form onSubmit={handleSubmit((data) => passwordMutation.mutate(data))} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 relative">
               <Label htmlFor="old_password">Password Saat Ini</Label>
               <div className="relative">
                  <Input 
                    id="old_password" 
                    type={showOld ? 'text' : 'password'} 
                    {...register('old_password')} 
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3a3a3]">
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
               {errors.old_password && <p className="text-xs font-bold text-[#0B4FAE]">{errors.old_password.message}</p>}
            </div>

            <div className="space-y-2">
               <Label htmlFor="new_password">Password Baru</Label>
               <div className="relative">
                  <Input 
                    id="new_password" 
                    type={showNew ? 'text' : 'password'} 
                    {...register('new_password')} 
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a3a3a3]">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
               <div className="h-1.5 w-full bg-[#f5f5f5] rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full transition-all duration-500 ${
                        strength < 50 ? 'bg-[#93B4FF]' : 
                        strength < 100 ? 'bg-[#0B4FAE]' : 'bg-[#00236F]'
                    }`} 
                    style={{ width: `${strength}%` }}
                   />
               </div>
               {errors.new_password && <p className="text-xs font-bold text-[#0B4FAE]">{errors.new_password.message}</p>}
            </div>

            <div className="space-y-2">
               <Label htmlFor="confirm_password">Konfirmasi Password Baru</Label>
               <Input id="confirm_password" type="password" {...register('confirm_password')} />
               {errors.confirm_password && <p className="text-xs font-bold text-[#0B4FAE]">{errors.confirm_password.message}</p>}
            </div>

            <div className="md:col-span-3 pt-4 border-t border-[#f5f5f5] flex justify-end">
               <button 
                type="submit" 
                disabled={passwordMutation.isPending}
                className="bg-[#00236F] text-white py-3 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0B4FAE] transition-all disabled:opacity-50"
               >
                 {passwordMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                 Perbarui Password
               </button>
            </div>
         </form>
      </div>

      {/* Card B: Sesi Aktif */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="bg-[#EAF1FF] text-[#00236F] p-3 rounded-2xl">
                   <Monitor size={24} />
                </div>
               <div>
                  <h3 className="text-xl font-extrabold font-headline">Sesi Aktif</h3>
                  <p className="text-sm font-medium text-[#a3a3a3]">Kelola perangkat yang sedang masuk ke akun kamu.</p>
               </div>
            </div>
            <button 
                className="text-xs font-black text-[#00236F] uppercase tracking-widest px-4 py-2 bg-[#EAF1FF] rounded-xl hover:bg-[#DCE8FF] transition-colors"
                onClick={() => toast('Fitur ini akan segera hadir')}
            >
                Akhiri Semua Sesi Lain
            </button>
         </div>

         <div className="space-y-4">
            {sessions?.map((s, idx) => (
               <div key={`session-${s.id ?? idx}-${s.device ?? 'unknown'}-${s.last_active ?? ''}`} className="flex items-center justify-between p-4 rounded-2xl border border-[#f5f5f5] hover:bg-[#fafafa] transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-white border border-[#e5e5e5] shadow-sm flex items-center justify-center text-[#525252]">
                        {s.device.includes('iPhone') || s.device.includes('Android') ? <Smartphone size={24} /> : <Globe size={24} />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-bold text-sm">{s.device}</h4>
                           {s.is_current && <span className="bg-[#EAF1FF] text-[#0B4FAE] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Perangkat Ini</span>}
                        </div>
                        <p className="text-xs font-medium text-[#a3a3a3]">{s.location} <span className="mx-1">•</span> {s.last_active}</p>
                     </div>
                  </div>
                  {!s.is_current && (
                    <button className="p-2 text-[#a3a3a3] hover:text-[#00236F] hover:bg-[#EAF1FF] rounded-xl transition-all">
                       <LogOut size={18} />
                    </button>
                  )}
               </div>
            ))}
         </div>
      </div>

      {/* Card C: Riwayat Login */}
      <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden">
         <div className="p-6 md:p-8 flex items-center justify-between border-b border-[#f5f5f5]">
            <div className="flex items-center gap-3">
                <div className="bg-[#EEF4FF] text-[#1D4E9E] p-3 rounded-2xl">
                   <History size={24} />
                </div>
                <h3 className="text-xl font-extrabold font-headline">Riwayat Login</h3>
            </div>
            <button className="text-sm font-bold text-[#00236F] hover:underline">Lihat Semua</button>
          </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-[#fafafa] border-b border-[#f5f5f5]">
                     <th className="px-8 py-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Waktu</th>
                     <th className="px-8 py-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Perangkat</th>
                     <th className="px-8 py-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Lokasi</th>
                     <th className="px-8 py-4 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#f5f5f5]">
                  {history?.map((h, idx) => (
                    <tr key={`history-${h.id ?? idx}-${h.created_at ?? ''}-${h.user_agent ?? 'unknown'}`} className="hover:bg-[#fafafa] transition-colors">
                       <td className="px-8 py-4 text-sm font-bold text-[#525252]">
                          {new Date(h.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                       </td>
                       <td className="px-8 py-4 text-sm font-bold">{h.user_agent}</td>
                       <td className="px-8 py-4 text-sm font-medium text-[#525252]">{h.location}</td>
                       <td className="px-8 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            h.status === 'Berhasil' ? 'bg-[#EAF1FF] text-[#0B4FAE] border-[#C9D8FF]' : 'bg-[#EDF3FF] text-[#1D4E9E] border-[#D3E1FF]'
                          }`}>
                             {h.status}
                          </span>
                       </td>
                    </tr>
                  ))}
                  {!history?.length && (
                    <tr>
                       <td colSpan={4} className="px-8 py-12 text-center text-[#a3a3a3] italic text-sm font-medium">Belum ada riwayat login.</td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
