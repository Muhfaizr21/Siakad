import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { toast } from 'react-hot-toast';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor HP minimal 10 digit').regex(/^(08|\+628)/, 'Format nomor HP harus 08xx atau +628xx'),
  birth_place: z.string().min(1, 'Tempat lahir wajib diisi'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.string().min(1, 'Jenis kelamin wajib diisi'),
  religion: z.string().min(1, 'Agama wajib diisi'),
  address: z.string().min(5, 'Alamat domisili minimal 5 karakter'),
  city: z.string().min(1, 'Kota domisili wajib diisi'),
  zip_code: z.string().length(5, 'Kode pos harus 5 digit'),
});

export default function DataDiriTab({ profile }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: profile?.Email || '',
      phone: profile?.Phone || '',
      birth_place: profile?.BirthPlace || '',
      birth_date: profile?.BirthDate ? new Date(profile.BirthDate).toISOString().split('T')[0] : '',
      gender: profile?.Gender || '',
      religion: profile?.Religion || '',
      address: profile?.Address || '',
      city: profile?.City || '',
      zip_code: profile?.ZipCode || '',
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const { data: res } = await api.put('/profil/data-diri', data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mahasiswa', 'profile']);
      toast.success('Data diri berhasil diperbarui');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui data');
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Aktif</Label>
          <Input id="email" {...register('email')} placeholder="email@contoh.com" />
          {errors.email && <p className="text-xs font-bold text-[#0B4FAE]">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
          <Input id="phone" {...register('phone')} placeholder="08xxxxxxxxxx" />
          {errors.phone && <p className="text-xs font-bold text-[#0B4FAE]">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_place">Tempat Lahir</Label>
          <Input id="birth_place" {...register('birth_place')} />
          {errors.birth_place && <p className="text-xs font-bold text-[#0B4FAE]">{errors.birth_place.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date">Tanggal Lahir</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
          {errors.birth_date && <p className="text-xs font-bold text-[#0B4FAE]">{errors.birth_date.message}</p>}
        </div>

        <div className="space-y-3">
          <Label>Jenis Kelamin</Label>
          <div className="flex gap-6 pt-2">
             <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Laki-laki" {...register('gender')} className="w-4 h-4 text-[#00236F] focus:ring-[#00236F]" />
                <span className="text-sm font-bold text-[#525252] group-hover:text-[#171717]">Laki-laki</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer group">
                <input type="radio" value="Perempuan" {...register('gender')} className="w-4 h-4 text-[#00236F] focus:ring-[#00236F]" />
                <span className="text-sm font-bold text-[#525252] group-hover:text-[#171717]">Perempuan</span>
             </label>
          </div>
          {errors.gender && <p className="text-xs font-bold text-[#0B4FAE]">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Agama</Label>
          <Select 
            defaultValue={profile?.Religion} 
            onValueChange={(val) => setValue('religion', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Agama" />
            </SelectTrigger>
            <SelectContent>
              {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Khonghucu'].map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.religion && <p className="text-xs font-bold text-[#0B4FAE]">{errors.religion.message}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="address">Alamat Domisili Saat Ini</Label>
          <Textarea id="address" {...register('address')} placeholder="Jl. Contoh No. 123..." />
          {errors.address && <p className="text-xs font-bold text-[#0B4FAE]">{errors.address.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Kota Domisili</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-xs font-bold text-[#0B4FAE]">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">Kode Pos</Label>
          <Input id="zip_code" {...register('zip_code')} maxLength={5} />
          {errors.zip_code && <p className="text-xs font-bold text-[#0B4FAE]">{errors.zip_code.message}</p>}
        </div>

      </div>

      <div className="flex flex-col sm:flex-row gap-4 border-t border-[#f5f5f5] pt-8">
        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="flex-1 bg-[#00236F] text-white py-3 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0B4FAE] transition-all shadow-md shadow-[#00236F]/20 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Perubahan
        </button>
        <button 
          type="button" 
          onClick={() => reset()}
          className="bg-white border border-[#e5e5e5] text-[#171717] py-3 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#fafafa] transition-all"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>
    </form>
  );
}
