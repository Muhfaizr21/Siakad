import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { toast } from 'react-hot-toast';
import { Save, RotateCcw, Loader2, User, Phone, Users, GraduationCap } from 'lucide-react';

import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/Select';

const schema = z.object({
  // Pribadi
  nik: z.string().optional(),
  nisn: z.string().optional(),
  birth_place: z.string().min(1, 'Tempat lahir wajib diisi'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.string().min(1, 'Jenis kelamin wajib diisi'),
  religion: z.string().min(1, 'Agama wajib diisi'),
  kewarganegaraan: z.string().optional(),
  status_pernikahan: z.string().optional(),
  golongan_darah: z.string().optional(),

  // Kontak
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor HP minimal 10 digit').regex(/^(08|\+628)/, 'Format nomor HP harus 08xx atau +628xx'),
  address: z.string().min(5, 'Alamat domisili minimal 5 karakter'),
  city: z.string().min(1, 'Kota domisili wajib diisi'),
  zip_code: z.string().length(5, 'Kode pos harus 5 digit'),

  // Keluarga
  nama_ayah: z.string().optional(),
  pekerjaan_ayah: z.string().optional(),
  nama_ibu_kandung: z.string().optional(),
  pekerjaan_ibu: z.string().optional(),
  penghasilan_ortu: z.union([z.string(), z.number()]).optional(),

  // Pendidikan
  asal_sekolah: z.string().optional(),
});

export default function DataDiriTab({ profile }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nik: profile?.NIK || '',
      nisn: profile?.NISN || '',
      birth_place: profile?.TempatLahir || '',
      birth_date: profile?.TanggalLahir ? new Date(profile.TanggalLahir).toISOString().split('T')[0] : '',
      gender: profile?.JenisKelamin || '',
      religion: profile?.Agama || '',
      kewarganegaraan: profile?.Kewarganegaraan || '',
      status_pernikahan: profile?.StatusPernikahan || '',
      golongan_darah: profile?.GolonganDarah || '',
      
      email: profile?.EmailPersonal || '',
      phone: profile?.NoHP || '',
      address: profile?.Alamat || '',
      city: profile?.Kota || '',
      zip_code: profile?.KodePos || '',

      nama_ayah: profile?.NamaAyah || '',
      pekerjaan_ayah: profile?.PekerjaanAyah || '',
      nama_ibu_kandung: profile?.NamaIbuKandung || '',
      pekerjaan_ibu: profile?.PekerjaanIbu || '',
      penghasilan_ortu: profile?.PenghasilanOrtu || 0,

      asal_sekolah: profile?.AsalSekolah || '',
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Normalisasi tipe data integer
      const payload = {
         ...data,
         penghasilan_ortu: parseInt(data.penghasilan_ortu) || 0,
      };
      const { data: res } = await api.put('/profil/data-diri', payload);
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

  const GOLONGAN_DARAH = ['A', 'B', 'AB', 'O', 'Tidak Tahu'];
  const KEWARGANEGARAAN = ['WNI', 'WNA'];
  const STATUS_NIKAH = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden">
      
      {/* SEKSI: PRIBADI */}
      <div className="p-6 md:p-8 border-b border-[#f5f5f5]">
        <h3 className="text-lg font-bold font-headline mb-5 flex items-center gap-2 text-[#00236F]">
           <User size={18} /> Data Pribadi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label>NIK KTP</Label>
            <Input {...register('nik')} placeholder="16 Digit NIK" maxLength={16} />
            {errors.nik && <p className="text-xs font-bold text-[#w0B4FAE]">{errors.nik.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>NISN</Label>
            <Input {...register('nisn')} placeholder="Nomor Induk Siswa Nasional" />
          </div>

          <div className="space-y-2">
            <Label>Tempat Lahir</Label>
            <Input {...register('birth_place')} />
            {errors.birth_place && <p className="text-xs font-bold text-[#0B4FAE]">{errors.birth_place.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tanggal Lahir</Label>
            <Input type="date" {...register('birth_date')} />
            {errors.birth_date && <p className="text-xs font-bold text-[#0B4FAE]">{errors.birth_date.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Jenis Kelamin</Label>
            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" value="Laki-laki" {...register('gender')} className="w-4 h-4 text-[#00236F]" />
                  <span className="text-sm font-bold text-[#525252]">Laki-laki</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" value="Perempuan" {...register('gender')} className="w-4 h-4 text-[#00236F]" />
                  <span className="text-sm font-bold text-[#525252]">Perempuan</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Agama</Label>
            <Select defaultValue={profile?.Agama} onValueChange={(val) => setValue('religion', val)}>
              <SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
              <SelectContent>
                {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Budha', 'Khonghucu'].map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.religion && <p className="text-xs font-bold text-[#0B4FAE]">{errors.religion.message}</p>}
          </div>

          <div className="space-y-2">
             <Label>Golongan Darah</Label>
             <Select defaultValue={profile?.GolonganDarah} onValueChange={(val) => setValue('golongan_darah', val)}>
              <SelectTrigger><SelectValue placeholder="- Pilih -" /></SelectTrigger>
              <SelectContent>
                {GOLONGAN_DARAH.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
             </Select>
          </div>

          <div className="space-y-2">
             <Label>Kewarganegaraan</Label>
             <Select defaultValue={profile?.Kewarganegaraan} onValueChange={(val) => setValue('kewarganegaraan', val)}>
              <SelectTrigger><SelectValue placeholder="- Pilih -" /></SelectTrigger>
              <SelectContent>
                {KEWARGANEGARAAN.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
             </Select>
          </div>

          <div className="space-y-2">
             <Label>Status Pernikahan</Label>
             <Select defaultValue={profile?.StatusPernikahan} onValueChange={(val) => setValue('status_pernikahan', val)}>
              <SelectTrigger><SelectValue placeholder="- Pilih -" /></SelectTrigger>
              <SelectContent>
                {STATUS_NIKAH.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
             </Select>
          </div>
        </div>
      </div>

      {/* SEKSI: KONTAK */}
      <div className="p-6 md:p-8 border-b border-[#f5f5f5] bg-[#fafafa]">
        <h3 className="text-lg font-bold font-headline mb-5 flex items-center gap-2 text-[#00236F]">
           <Phone size={18} /> Kontak Katut & Domisili
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
           <div className="space-y-2">
            <Label>Email Personal Aktif</Label>
            <Input {...register('email')} placeholder="email@contoh.com" />
            {errors.email && <p className="text-xs font-bold text-[#0B4FAE]">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Nomor HP / WhatsApp Aktif</Label>
            <Input {...register('phone')} placeholder="08xxxxxxxxxx" />
            {errors.phone && <p className="text-xs font-bold text-[#0B4FAE]">{errors.phone.message}</p>}
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label>Alamat Tinggal / Domisili Lengkap</Label>
            <Textarea {...register('address')} placeholder="Jalan Raya No. 123, RT/RW..." rows={2} />
            {errors.address && <p className="text-xs font-bold text-[#0B4FAE]">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Kota / Kabupaten Tinggal</Label>
            <Input {...register('city')} />
            {errors.city && <p className="text-xs font-bold text-[#0B4FAE]">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Kode Pos</Label>
            <Input {...register('zip_code')} maxLength={5} />
            {errors.zip_code && <p className="text-xs font-bold text-[#0B4FAE]">{errors.zip_code.message}</p>}
          </div>
        </div>
      </div>

      {/* SEKSI: KELUARGA */}
      <div className="p-6 md:p-8 border-b border-[#f5f5f5]">
        <h3 className="text-lg font-bold font-headline mb-5 flex items-center gap-2 text-[#0B4FAE]">
           <Users size={18} /> Data Keluarga / Orang Tua
        </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
           <div className="space-y-2">
            <Label>Nama Lengkap Ayah Kandung</Label>
            <Input {...register('nama_ayah')} />
          </div>
          <div className="space-y-2">
            <Label>Pekerjaan Ayah</Label>
            <Input {...register('pekerjaan_ayah')} />
          </div>

          <div className="space-y-2">
            <Label>Nama Lengkap Ibu Kandung</Label>
            <Input {...register('nama_ibu_kandung')} />
          </div>
          <div className="space-y-2">
            <Label>Pekerjaan Ibu</Label>
            <Input {...register('pekerjaan_ibu')} />
          </div>

          <div className="space-y-2">
            <Label>Penghasilan Kumulatif Orang Tua (Rp / Bulan)</Label>
            <Input type="number" {...register('penghasilan_ortu')} placeholder="Tanpa pemisah titik (contoh: 5000000)" />
          </div>
         </div>
      </div>

       {/* SEKSI: PENDIDIKAN */}
      <div className="p-6 md:p-8 bg-[#fafafa]">
        <h3 className="text-lg font-bold font-headline mb-5 flex items-center gap-2 text-[#0B4FAE]">
           <GraduationCap size={18} /> Pendidikan Terakhir
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <Label>Asal Sekolah (SMA / SMK / Sederajat)</Label>
            <Input {...register('asal_sekolah')} placeholder="SMA Negeri 1 ..." />
          </div>
        </div>
      </div>

      {/* AKSI */}
      <div className="p-6 md:px-8 md:py-6 flex flex-col sm:flex-row gap-4 border-t border-[#f5f5f5]">
        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="flex-1 bg-[#00236F] text-white py-3.5 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0B4FAE] transition-all shadow-md shadow-[#00236F]/20 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Seluruh Perubahan
        </button>
        <button 
          type="button" 
          onClick={() => reset()}
          className="bg-white border border-[#e5e5e5] text-[#171717] py-3.5 px-8 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#fafafa] transition-all"
        >
          <RotateCcw size={18} />
          Batal & Reset
        </button>
      </div>
    </form>
  );
}
