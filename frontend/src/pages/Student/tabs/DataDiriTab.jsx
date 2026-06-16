import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { toast } from 'react-hot-toast';


import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RotateCcw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>restart_alt</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;
const Phone = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>phone</span>;



const FIELD_CLASS = 'w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 py-3 text-sm font-semibold text-[var(--theme-text)] outline-none transition-all focus:border-[var(--theme-primary)] focus:bg-[var(--theme-surface)] focus:ring-4 focus:ring-[var(--theme-primary-light)] placeholder-[var(--theme-text-subtle)]';

const Label = ({ children, icon: Icon, ...props }) => (
  <span className="mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--theme-text-muted)]" {...props}>
    {Icon && <Icon size={13} className="text-[var(--theme-text-subtle)]" />}
    {children}
  </span>
);

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input type={type} className={cn(FIELD_CLASS, className)} ref={ref} {...props} />
));

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
  const [confirmDataOpen, setConfirmDataOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

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
    <form
      onSubmit={handleSubmit(
        (data) => {
          mutation.mutate(data);
        },
        (errs) => {
          const flatErrors = Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: errs[k].message }), {});
          console.error('Validation errors:', JSON.stringify(flatErrors, null, 2));
          
          const errorMessages = Object.values(errs).map(e => e.message);
          if (errorMessages.length > 0) {
            if (errorMessages.length <= 2) {
              toast.error(`Gagal menyimpan:\n• ${errorMessages.join('\n• ')}`);
            } else {
              toast.error(`Gagal menyimpan:\n• ${errorMessages.slice(0, 2).join('\n• ')}\n• ...dan ${errorMessages.length - 2} error lainnya (cek konsol browser)`);
            }
          } else {
            toast.error('Mohon lengkapi seluruh field yang wajib diisi');
          }
        }
      )}
      className="space-y-8 p-5 lg:p-5"
    >
      {/* SEKSI: PRIBADI */}
      <div className="border-b border-[var(--theme-border-muted)] pb-6">
        <h2 className="text-sm font-black font-headline uppercase tracking-widest mb-1" style={{ color: 'var(--theme-h2)' }}>Data Pribadi</h2>
        <p className="text-xs font-semibold leading-relaxed text-[var(--theme-text-muted)] mb-6">Identitas dasar yang terdaftar dalam sistem akademik.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <Label>NIK KTP</Label>
            <Input {...register('nik')} placeholder="16 Digit NIK" maxLength={16} />
            {errors.nik && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.nik.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>NPM / NIM</Label>
            <Input value={profile?.NIM || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>NISN</Label>
            <Input {...register('nisn')} placeholder="Nomor Induk Siswa Nasional" maxLength={10} />
            {errors.nisn && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.nisn.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tempat Lahir</Label>
            <Input {...register('birth_place')} />
            {errors.birth_place && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.birth_place.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tanggal Lahir</Label>
            <Input type="date" {...register('birth_date')} />
            {errors.birth_date && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.birth_date.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Jenis Kelamin</Label>
            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" value="Laki-laki" {...register('gender')} className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-sm font-bold text-[var(--theme-text)]">Laki-laki</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" value="Perempuan" {...register('gender')} className="w-4 h-4 text-[var(--theme-primary)]" />
                  <span className="text-sm font-bold text-[var(--theme-text)]">Perempuan</span>
              </label>
            </div>
            {errors.gender && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.gender.message}</p>}
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
            {errors.religion && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.religion.message}</p>}
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
      <div className="border-b border-[var(--theme-border-muted)] pb-6">
        <h2 className="text-sm font-black font-headline uppercase tracking-widest mb-1" style={{ color: 'var(--theme-h2)' }}>Kontak & Domisili</h2>
        <p className="text-xs font-semibold leading-relaxed text-[var(--theme-text-muted)] mb-6">Informasi untuk komunikasi dan pengiriman dokumen.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
           <div className="space-y-2">
            <Label>Email Personal Aktif</Label>
            <Input {...register('email')} placeholder="email@contoh.com" />
            {errors.email && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Nomor HP / WhatsApp Aktif</Label>
            <Input {...register('phone')} placeholder="08xxxxxxxxxx" />
            {errors.phone && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.phone.message}</p>}
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <Label>Alamat Tinggal / Domisili Lengkap</Label>
            <Textarea {...register('address')} placeholder="Jalan Raya No. 123, RT/RW..." rows={2} />
            {errors.address && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Kota / Kabupaten Tinggal</Label>
            <Input {...register('city')} />
            {errors.city && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Kode Pos</Label>
            <Input {...register('zip_code')} maxLength={5} />
            {errors.zip_code && <p className="text-xs font-bold text-[var(--theme-primary)]">{errors.zip_code.message}</p>}
          </div>
        </div>
      </div>

      {/* SEKSI: KELUARGA */}
      <div className="border-b border-[var(--theme-border-muted)] pb-6">
        <h2 className="text-sm font-black font-headline uppercase tracking-widest mb-1" style={{ color: 'var(--theme-h2)' }}>Data Keluarga</h2>
        <p className="text-xs font-semibold leading-relaxed text-[var(--theme-text-muted)] mb-6">Informasi orang tua / wali untuk keperluan administrasi.</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
           <div className="space-y-2">
            <Label>Nama Lengkap Ayah</Label>
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
      <div className="pb-6">
        <h2 className="text-sm font-black font-headline uppercase tracking-widest mb-1" style={{ color: 'var(--theme-h2)' }}>Pendidikan Terakhir</h2>
        <p className="text-xs font-semibold leading-relaxed text-[var(--theme-text-muted)] mb-6">Riwayat asal sekolah menengah.</p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <Label>Asal Sekolah (SMA / SMK / Sederajat)</Label>
            <Input {...register('asal_sekolah')} placeholder="SMA Negeri 1 ..." />
          </div>
        </div>
      </div>

      {/* AKSI */}
      <div className="flex flex-col gap-3 border-t px-6 py-5 sm:flex-row sm:justify-end" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg)' }}>
        <button 
          type="button" 
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] px-7 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-muted)] transition-all hover:bg-[var(--theme-bg)] hover:text-[var(--theme-text)] active:scale-95 cursor-pointer"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        <button 
          type="submit" 
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] px-7 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--theme-primary)]/20 transition-all hover:bg-[var(--theme-primary-hover)] active:scale-95 disabled:cursor-wait disabled:opacity-70 border-none cursor-pointer"
        >
          {mutation.isPending ? <span className="material-symbols-outlined animate-spin text-base shrink-0">sync</span> : <span className="material-symbols-outlined text-base shrink-0">save</span>}
          Simpan Profil
        </button>
      </div>
    </form>
  );
}
