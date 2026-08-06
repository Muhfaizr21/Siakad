import React, { useState, useMemo } from 'react';
import { PageContent, PageHeader, PageCard, PageCardHeader } from '@/components/ui/page';
import { DialogModal } from '@/components/ui/DialogModal';
import { DataTable } from '@/components/ui/DataTable';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useAchievementsQuery,
  useCreateAchievementMutation,
  useDeleteAchievementMutation,
} from '../../queries/useAchievementQuery';
import { useOrganisasiListQuery } from '../../queries/useOrganisasiQuery';


import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Trophy = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;



// Format Date Utility
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

// Zod Schema
const achievementSchema = z.object({
  tipe: z.enum(['Laporan Prestasi', 'Pengajuan Dana'], {
    required_error: 'Pilih tipe pengajuan',
  }),
  nama_lomba: z.string().min(3, { message: 'Nama lomba minimal 3 karakter' }),
  kategori: z.enum(['Akademik', 'Non-Akademik', 'Olahraga', 'Seni', 'Wirausaha'], {
    required_error: 'Pilih kategori',
  }),
  tingkat: z.enum(['Lokal', 'Regional', 'Nasional', 'Internasional'], {
    required_error: 'Pilih tingkat lomba',
  }),
  penyelenggara: z.string().min(3, { message: 'Nama penyelenggara minimal 3 karakter' }),
  tanggal: z.string().nonempty({ message: 'Tanggal wajib diisi' }),
  peringkat: z.string().optional(),
  dana_diajukan: z.string().optional(),
  sertifikat: z
    .any()
    .refine((files) => files?.length === 1, 'File wajib diunggah')
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      'Ukuran file maksimal 5MB'
    )
    .refine(
      (files) => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(files?.[0]?.type),
      'Format hanya PDF, JPG, atau PNG'
    ),
  riwayat_organisasi_id: z.string().optional(),
  cabang: z.string().optional(),
  kelompok_prestasi: z.string().optional(),
  bentuk: z.string().optional(),
  url_peserta: z.string().optional(),
  url_foto_upp: z.string().optional(),
  url_dokumen_undangan: z.string().optional(),
  jenis_rekognisi: z.string().optional(),
  jumlah_unit_peserta: z.string().optional(),
  anggota_mahasiswa: z.string().optional(),
  pembimbing_dosen: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipe === 'Laporan Prestasi' && !data.peringkat) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pilih peringkat yang diraih',
      path: ['peringkat'],
    });
  }
  if (data.tipe === 'Pengajuan Dana') {
    if (!data.dana_diajukan || isNaN(Number(data.dana_diajukan)) || Number(data.dana_diajukan) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Dana diajukan wajib diisi dengan angka positif',
        path: ['dana_diajukan'],
      });
    }
  }
});

export default function AchievementPage() {
  const user = useAuthStore(state => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null); // Data For Detail Modal

  // Queries
  const { data: achievementData, isLoading } = useAchievementsQuery();
  const createMutation = useCreateAchievementMutation();
  const deleteMutation = useDeleteAchievementMutation();

  const stats = achievementData?.stats || { total: 0, verified: 0, pending: 0 };



  const mappedList = useMemo(() => {
    return (achievementData?.list || []).map(a => {
      return {
        ...a,
        semester_filter: a.mahasiswa?.SemesterSekarang || a.mahasiswa?.semester_sekarang ? String(a.mahasiswa?.SemesterSekarang || a.mahasiswa?.semester_sekarang) : '',
        periode_filter: a.tanggal || a.Tanggal ? String(new Date(a.tanggal || a.Tanggal).getFullYear()) : (a.created_at || a.CreatedAt ? String(new Date(a.created_at || a.CreatedAt).getFullYear()) : ''),
        prodi_filter: a.mahasiswa?.ProgramStudi?.Nama || a.mahasiswa?.program_studi?.nama || '',
      };
    });
  }, [achievementData]);

  const semesterOptions = useMemo(() => {
    const semesters = new Set();
    mappedList.forEach(a => {
      if (a.semester_filter) semesters.add(a.semester_filter);
    });
    return Array.from(semesters).sort((a, b) => Number(a) - Number(b));
  }, [mappedList]);

  const periodeOptions = useMemo(() => {
    const periods = new Set();
    mappedList.forEach(a => {
      if (a.periode_filter) periods.add(a.periode_filter);
    });
    return Array.from(periods).sort((a, b) => Number(b) - Number(a));
  }, [mappedList]);

  const prodiOptions = useMemo(() => {
    const prodis = new Set();
    mappedList.forEach(a => {
      if (a.prodi_filter) prodis.add(a.prodi_filter);
    });
    return Array.from(prodis).sort();
  }, [mappedList]);


  const { data: orgData } = useOrganisasiListQuery();
  const orgList = orgData || [];

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(achievementSchema),
  });
  
  const fileValue = watch('sertifikat');
  const tipeValue = watch('tipe') || 'Laporan Prestasi';

  const onSubmit = (formData) => {
    const payload = new FormData();
    payload.append('tipe', formData.tipe);
    payload.append('nama_kegiatan', formData.nama_lomba);
    payload.append('kategori', formData.kategori);
    payload.append('tingkat', formData.tingkat);
    payload.append('penyelenggara', formData.penyelenggara);
    payload.append('tanggal', formData.tanggal);
    if (formData.tipe === 'Laporan Prestasi') {
      payload.append('peringkat', formData.peringkat);
    } else {
      payload.append('dana_diajukan', formData.dana_diajukan);
    }
    payload.append('bukti', formData.sertifikat[0]);
    
    if (formData.riwayat_organisasi_id) {
       payload.append('riwayat_organisasi_id', formData.riwayat_organisasi_id);
    }
    if (formData.cabang) payload.append('cabang', formData.cabang);
    if (formData.kelompok_prestasi) payload.append('kelompok_prestasi', formData.kelompok_prestasi);
    if (formData.bentuk) payload.append('bentuk', formData.bentuk);
    if (formData.url_peserta) payload.append('url_peserta', formData.url_peserta);
    if (formData.url_foto_upp) payload.append('url_foto_upp', formData.url_foto_upp);
    if (formData.url_dokumen_undangan) payload.append('url_dokumen_undangan', formData.url_dokumen_undangan);
    if (formData.jenis_rekognisi) payload.append('jenis_rekognisi', formData.jenis_rekognisi);
    if (formData.jumlah_unit_peserta) payload.append('jumlah_unit_peserta', formData.jumlah_unit_peserta);

    // Convert comma separated string to JSON array
    if (formData.anggota_mahasiswa) {
       const arr = formData.anggota_mahasiswa.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
       if (arr.length > 0) payload.append('anggota_mahasiswa', JSON.stringify(arr));
    }
    if (formData.pembimbing_dosen) {
       const arr = formData.pembimbing_dosen.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
       if (arr.length > 0) payload.append('pembimbing_dosen', JSON.stringify(arr));
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(formData.tipe === 'Pengajuan Dana' ? 'Pengajuan dana berhasil dikirim!' : 'Prestasi berhasil dilaporkan!');
        reset();
        setIsModalOpen(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Gagal menyimpan data');
      },
    });
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Berhasil dihapus'),
        onError: () => toast.error('Gagal menghapus data'),
      });
    }
  };

  // Table Setup
  const columns = useMemo(
    () => [
      {
        key: 'no',
        label: 'No',
        render: (v, row, idx) => idx + 1,
      },
      {
        key: 'nama_kegiatan',
        label: 'Nama Lomba & Kategori',
        sortable: true,
        render: (v, row) => {
          const name = row.nama_kegiatan || row.NamaKegiatan || '';
          const category = row.kategori || row.Kategori || '';
          const tipe = row.tipe || row.Tipe || 'Laporan Prestasi';
          return (
            <div>
              <p className="font-bold text-on-surface">{name}</p>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-[var(--theme-primary)] bg-[var(--theme-primary-light)] px-1.5 py-0.5 rounded">{category}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tipe === 'Pengajuan Dana' ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>{tipe}</span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'tingkat',
        label: 'Tingkat',
        sortable: true,
        render: (v, row) => {
          const val = row.tingkat || row.Tingkat || '';
          return <span className="text-[#525252]">{val}</span>;
        },
      },
      {
        key: 'peringkat',
        label: 'Peringkat / Pendanaan',
        sortable: true,
        render: (v, row) => {
          const tipe = row.tipe || row.Tipe || 'Laporan Prestasi';
          if (tipe === 'Pengajuan Dana') {
            const reqAmt = row.dana_diajukan || row.DanaDiajukan || 0;
            const appAmt = row.dana_disetujui || row.DanaDisetujui || 0;
            return (
              <div className="text-xs whitespace-nowrap">
                <p className="text-[#525252]">Diajukan: <span className="font-bold">Rp {reqAmt.toLocaleString('id-ID')}</span></p>
                {appAmt > 0 ? (
                  <p className="text-emerald-600 font-bold mt-0.5">Disetujui: Rp {appAmt.toLocaleString('id-ID')}</p>
                ) : (
                  <p className="text-[#a3a3a3] italic mt-0.5">Belum disetujui</p>
                )}
              </div>
            );
          }
          const val = row.peringkat || row.Peringkat || '';
          return <span className="font-semibold text-[var(--theme-primary)]">{val}</span>;
        },
      },
      {
        key: 'created_at',
        label: 'Tanggal',
        sortable: true,
        render: (v, row) => {
          const val = row.created_at || row.CreatedAt || '';
          return <span className="text-[#525252] text-sm">{formatDate(val)}</span>;
        },
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (v, row) => {
          const val = row.status || row.Status || 'Menunggu';
          let style = 'bg-[#f5f5f5] text-[#525252] border-border';
          if (val === 'Diverifikasi' || val === 'Valid' || val === 'Disetujui') style = 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]';
          if (val === 'Menunggu' || val === 'Pending') style = 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-[var(--theme-primary-light)]';
          if (val === 'Ditolak') style = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';

          return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
              {val === 'Diverifikasi' || val === 'Valid' || val === 'Disetujui' ? 'Disetujui' : val}
            </span>
          );
        },
      }
    ],
    []
  );

  return (
    <PageContent className="font-body">
      
      <PageHeader
        title="Achievement"
        subtitle="Lapor, pantau status verifikasi, dan kelola seluruh prestasi akademik/non-akademikmu."
        icon="emoji_events"
        breadcrumbs={[
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Achievement', path: '/student/achievement' }
        ]}
        action={
          user?.role !== 'super_admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--theme-primary)] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-colors shadow-sm shadow-[var(--theme-primary)]/20 w-full sm:w-auto"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >add</span>
              Lapor Prestasi Baru
            </button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PageCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex justify-center items-center text-indigo-600 shadow-sm border border-indigo-100">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold tracking-wider uppercase">TOTAL PRESTASI</p>
              <p className="text-2xl font-black text-neutral-800 tracking-tight">{stats.total}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex justify-center items-center text-emerald-600 shadow-sm border border-emerald-100">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >check_circle</span>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold tracking-wider uppercase">DIVERIFIKASI</p>
              <p className="text-2xl font-black text-neutral-800 tracking-tight">{stats.verified}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex justify-center items-center text-amber-600 shadow-sm border border-amber-100">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >schedule</span>
            </div>
            <div>
              <p className="text-[11px] text-neutral-400 font-bold tracking-wider uppercase">MENUNGGU VALIDASI</p>
              <p className="text-2xl font-black text-neutral-800 tracking-tight">{stats.pending}</p>
            </div>
          </div>
        </PageCard>
      </div>

      {/* Table Section */}
      <DataTable
        title="Riwayat Prestasi"
        subtitle="Daftar laporan prestasi dan pengajuan dana yang telah diajukan."
        columns={columns}
        data={mappedList}
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Cari lomba, kategori..."
        pagination={true}
        pageSize={10}
        onRowClick={(row) => setSelectedDetail(row)}
        emptyMessage="Belum Ada Prestasi. Lapor prestasi pertamamu sekarang!"
        emptyIcon="emoji_events"

        actions={(row) => {
          const status = row.status || row.Status || 'Menunggu';
          const id = row.id || row.ID;
          return (
            status === 'Menunggu' && user?.role !== 'super_admin' ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(id); }}
                className="p-1.5 text-[#dc2626] bg-[#fef2f2] rounded hover:bg-[#fee2e2] transition-colors"
                title="Hapus"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
              </button>
            ) : null
          );
        }}
        filters={[
          {
            key: 'semester_filter',
            placeholder: 'Semester',
            options: semesterOptions.map(s => ({ label: `Semester ${s}`, value: s }))
          },
          {
            key: 'periode_filter',
            placeholder: 'Periode',
            options: periodeOptions.map(p => ({ label: `Periode ${p}`, value: p }))
          },
          {
            key: 'prodi_filter',
            placeholder: 'Prodi',
            options: prodiOptions.map(p => ({ label: p, value: p }))
          }
        ]}
      />

      {/* MODAL LAPOR PRESTASI */}
      <DialogModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={tipeValue === 'Pengajuan Dana' ? 'Ajukan Dana Lomba Baru' : 'Lapor Prestasi Baru'}
        subtitle="Isi data prestasi atau rencana pendanaan lomba luar kampus dengan lengkap."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh]">
          <div className="p-5 sm:p-8 overflow-y-auto space-y-5 text-left bg-white">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Tipe Pengajuan <span className="text-red-500">*</span></label>
              <select {...register('tipe')} defaultValue="Laporan Prestasi" className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-on-surface bg-[var(--theme-bg)] h-[40px] text-xs font-semibold">
                <option value="Laporan Prestasi">Laporan Prestasi (Riwayat Kompetisi)</option>
                <option value="Pengajuan Dana">Pengajuan Dana Lomba (Keikutsertaan Lomba Luar Kampus)</option>
              </select>
              {errors.tipe && <p className="text-xs text-red-500 mt-1">{errors.tipe.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Nama Lomba/Kompetisi <span className="text-red-500">*</span></label>
                <input {...register('nama_lomba')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-xs font-semibold h-[40px] bg-white text-[var(--theme-text)]" placeholder="Cth: Gemastik 2026" />
                {errors.nama_lomba && <p className="text-xs text-red-500 mt-1">{errors.nama_lomba.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Kategori <span className="text-red-500">*</span></label>
                <select {...register('kategori')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-on-surface bg-[var(--theme-bg)] h-[40px] text-xs font-semibold">
                  <option value="">Pilih Kategori</option>
                  <option value="Akademik">Akademik</option>
                  <option value="Non-Akademik">Non-Akademik</option>
                  <option value="Olahraga">Olahraga</option>
                  <option value="Seni">Seni</option>
                  <option value="Wirausaha">Wirausaha</option>
                </select>
                {errors.kategori && <p className="text-xs text-red-500 mt-1">{errors.kategori.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Tingkat <span className="text-red-500">*</span></label>
                <select {...register('tingkat')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-on-surface bg-[var(--theme-bg)] h-[40px] text-xs font-semibold">
                  <option value="">Pilih Tingkat</option>
                  <option value="Lokal">Lokal (Antar Prodi/Univ)</option>
                  <option value="Regional">Regional (Antar Kampus Jabar)</option>
                  <option value="Nasional">Nasional</option>
                  <option value="Internasional">Internasional</option>
                </select>
                {errors.tingkat && <p className="text-xs text-red-500 mt-1">{errors.tingkat.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Penyelenggara <span className="text-red-500">*</span></label>
                <input {...register('penyelenggara')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-xs font-semibold h-[40px] bg-white text-[var(--theme-text)]" placeholder="Cth: Kemendikbud" />
                {errors.penyelenggara && <p className="text-xs text-red-500 mt-1">{errors.penyelenggara.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Tanggal Pelaksanaan <span className="text-red-500">*</span></label>
                <input type="date" {...register('tanggal')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-on-surface bg-white h-[40px] text-xs font-semibold" />
                {errors.tanggal && <p className="text-xs text-red-500 mt-1">{errors.tanggal.message}</p>}
              </div>
              {tipeValue === 'Laporan Prestasi' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Peringkat Diraih <span className="text-red-500">*</span></label>
                  <select {...register('peringkat')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-on-surface bg-[var(--theme-bg)] h-[40px] text-xs font-semibold">
                    <option value="">Pilih Peringkat</option>
                    <option value="Juara 1">Juara 1 (Emas)</option>
                    <option value="Juara 2">Juara 2 (Perak)</option>
                    <option value="Juara 3">Juara 3 (Perunggu)</option>
                    <option value="Harapan 1">Harapan 1</option>
                    <option value="Harapan 2">Harapan 2</option>
                    <option value="Finalis">Finalis</option>
                    <option value="Peserta">Partisipan / Peserta</option>
                  </select>
                  {errors.peringkat && <p className="text-xs text-red-500 mt-1">{errors.peringkat.message}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Dana yang Diajukan (Rp) <span className="text-red-500">*</span></label>
                  <input type="number" {...register('dana_diajukan')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-xs font-semibold h-[40px] bg-white text-[var(--theme-text)]" placeholder="Cth: 1500000" />
                  {errors.dana_diajukan && <p className="text-xs text-red-500 mt-1">{errors.dana_diajukan.message}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">Pilih Organisasi Berafiliasi (Opsional)</label>
              <select {...register('riwayat_organisasi_id')} className="w-full border border-border rounded-xl px-4 py-2 focus:border-[var(--theme-primary)] outline-none text-on-surface bg-[var(--theme-bg)] h-[40px] text-xs font-semibold">
                <option value="">(Tidak terkait organisasi)</option>
                {orgList.map(org => (
                  <option key={org.id || org.ID} value={org.id || org.ID}>{org.NamaOrganisasi} ({org.Jabatan})</option>
                ))}
              </select>
            </div>

            {/* SIMKATMAWA Optional Fields */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-4 mt-2">
               <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{fontSize: '18px'}}>account_balance</span>
                  Informasi Tambahan untuk SIMKATMAWA (Opsional)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">Cabang Lomba</label>
                    <input {...register('cabang')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="Cth: Lomba Esai" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">Bentuk Kompetisi</label>
                    <input {...register('bentuk')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="Cth: Luring / Daring" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">URL Peserta / Info Lomba</label>
                    <input {...register('url_peserta')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">URL Foto UPP (Serah Terima)</label>
                    <input {...register('url_foto_upp')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">URL Dokumen Undangan</label>
                    <input {...register('url_dokumen_undangan')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">Jumlah Unit Peserta</label>
                    <input type="number" {...register('jumlah_unit_peserta')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="Cth: 1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">ID Mahasiswa Tim (Pisahkan dengan koma)</label>
                    <input {...register('anggota_mahasiswa')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="Cth: 1, 2, 3" />
                    <p className="text-[10px] text-slate-500 mt-1">Isi jika prestasi ini diraih secara berkelompok.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-[#525252]">ID Dosen Pembimbing (Pisahkan dengan koma)</label>
                    <input {...register('pembimbing_dosen')} className="w-full border border-border rounded-xl px-3 py-1.5 focus:border-[var(--theme-primary)] outline-none text-sm" placeholder="Cth: 5, 8" />
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#525252]">
                {tipeValue === 'Pengajuan Dana' ? 'Upload Proposal/Bukti Pendukung' : 'Upload Sertifikat/Bukti'} <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-background transition-colors relative">
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" {...register('sertifikat')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="pointer-events-none flex flex-col items-center">
                  <span className="material-symbols-outlined text-[#a3a3a3] mb-2" style={{ fontSize: '32px' }}>upload</span>
                  <p className="text-sm font-semibold text-[var(--theme-primary)]">Klik untuk Upload File</p>
                  <p className="text-xs text-[#a3a3a3] mt-1">Format: PDF, JPG, PNG (Max. 5MB)</p>
                  {fileValue && fileValue.length > 0 && (
                    <div className="mt-3 px-3 py-1 bg-[var(--theme-primary-light)] border border-[var(--theme-primary-light)] text-[var(--theme-primary)] text-xs font-bold rounded-lg truncate w-full max-w-xs">
                      Terpilih: {fileValue[0].name}
                    </div>
                  )}
                </div>
              </div>
              {errors.sertifikat && <p className="text-xs text-red-500 mt-1">{errors.sertifikat?.message || errors.sertifikat?.root?.message}</p>}
            </div>
          </div>

          <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-border text-neutral-500 text-xs font-black hover:bg-neutral-50 transition-colors cursor-pointer bg-white uppercase tracking-wider">Batal</button>
            <button type="submit" disabled={createMutation.isLoading} className="flex-1 py-3 rounded-xl bg-[var(--theme-primary)] text-white text-xs font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border-none shadow-md shadow-[var(--theme-primary)]/20">
              {createMutation.isLoading ? 'Menyimpan...' : (tipeValue === 'Pengajuan Dana' ? 'Kirim Pengajuan' : 'Simpan Laporan')}
            </button>
          </div>
        </form>
      </DialogModal>

      {/* MODAL DETAIL */}
      <DialogModal
        open={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        title={selectedDetail && (selectedDetail.tipe || selectedDetail.Tipe || 'Laporan Prestasi') === 'Pengajuan Dana' ? 'Detail Pengajuan Dana Lomba' : 'Detail Prestasi'}
        subtitle="Informasi lengkap dan status verifikasi pengajuan atau pelaporan prestasi."
        maxWidth="max-w-xl"
      >
        {selectedDetail && (
          <div className="flex flex-col max-h-[85vh]">
            <div className="p-5 sm:p-8 overflow-y-auto space-y-5 text-left bg-white">
              {(selectedDetail.catatan_verifikator || selectedDetail.CatatanVerifikator) && (
                 <div className={`p-4 rounded-xl border ${selectedDetail.status === 'Ditolak' || selectedDetail.Status === 'Ditolak' ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]' : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'} font-semibold text-xs leading-relaxed`}>
                   <p className="font-bold text-sm">{selectedDetail.status === 'Ditolak' || selectedDetail.Status === 'Ditolak' ? 'Alasan Ditolak:' : 'Catatan Verifikator:'}</p>
                   <p className="text-xs mt-1">{selectedDetail.catatan_verifikator || selectedDetail.CatatanVerifikator}</p>
                 </div>
              )}

              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-[var(--theme-border-muted)]"><td className="py-2.5 font-semibold text-[#a3a3a3] w-1/3">Tipe Pengajuan</td><td className="py-2 font-bold text-on-surface">{(selectedDetail.tipe || selectedDetail.Tipe || 'Laporan Prestasi')}</td></tr>
                  <tr className="border-b border-[var(--theme-border-muted)]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Nama Lomba</td><td className="py-2 font-bold text-on-surface">{selectedDetail.nama_kegiatan || selectedDetail.NamaKegiatan}</td></tr>
                  <tr className="border-b border-[var(--theme-border-muted)]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Kategori / Tingkat</td><td className="py-2 font-bold text-on-surface">{selectedDetail.kategori || selectedDetail.Kategori} - {selectedDetail.tingkat || selectedDetail.Tingkat}</td></tr>
                  <tr className="border-b border-[var(--theme-border-muted)]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Penyelenggara</td><td className="py-2 font-bold text-on-surface">{selectedDetail.penyelenggara || selectedDetail.Penyelenggara || '—'}</td></tr>
                  
                  {(selectedDetail.tipe || selectedDetail.Tipe || 'Laporan Prestasi') === 'Pengajuan Dana' ? (
                    <>
                      <tr className="border-b border-[var(--theme-border-muted)]">
                        <td className="py-2.5 font-semibold text-[#a3a3a3]">Dana Diajukan</td>
                        <td className="py-2 font-bold text-[var(--theme-primary)]">Rp {(selectedDetail.dana_diajukan || selectedDetail.DanaDiajukan || 0).toLocaleString('id-ID')}</td>
                      </tr>
                      <tr className="border-b border-[var(--theme-border-muted)]">
                        <td className="py-2.5 font-semibold text-[#a3a3a3]">Dana Disetujui</td>
                        <td className="py-2 font-bold text-emerald-600">
                          {(selectedDetail.dana_disetujui || selectedDetail.DanaDisetujui) ? `Rp ${(selectedDetail.dana_disetujui || selectedDetail.DanaDisetujui).toLocaleString('id-ID')}` : 'Belum disetujui'}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr className="border-b border-[var(--theme-border-muted)]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Peringkat</td><td className="py-2 font-bold text-[var(--theme-primary)]">{selectedDetail.peringkat || selectedDetail.Peringkat || '—'}</td></tr>
                  )}
                  
                  <tr className="border-b border-[var(--theme-border-muted)]">
                    <td className="py-2.5 font-semibold text-[#a3a3a3]">Status</td>
                    <td className="py-2 font-bold text-on-surface">
                      {selectedDetail.status === 'Diverifikasi' || selectedDetail.status === 'Valid' || selectedDetail.status === 'Disetujui' || selectedDetail.Status === 'Diverifikasi' || selectedDetail.Status === 'Disetujui' ? 'Disetujui' : (selectedDetail.status || selectedDetail.Status || 'Menunggu')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6">
                <p className="font-semibold text-sm mb-2 text-[#a3a3a3]">
                  {(selectedDetail.tipe || selectedDetail.Tipe || 'Laporan Prestasi') === 'Pengajuan Dana' ? 'Proposal / Dokumen Pendukung' : 'Bukti Sertifikat'}
                </p>
                {(selectedDetail.bukti_url || selectedDetail.BuktiURL) ? (
                  <a href={`${API_BASE_URL.replace('/api', '')}${selectedDetail.bukti_url || selectedDetail.BuktiURL}`} target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 border border-border rounded-xl hover:bg-[var(--theme-primary-light)] hover:border-[var(--theme-primary)] transition-colors text-sm font-bold text-[var(--theme-primary)]">
                    {(selectedDetail.tipe || selectedDetail.Tipe || 'Laporan Prestasi') === 'Pengajuan Dana' ? 'Lihat Proposal / Dokumen' : 'Lihat Dokumen Sertifikat'}
                  </a>
                ) : (
                  <p className="text-sm italic text-[#a3a3a3]">Tidak ada lampiran.</p>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                onClick={() => setSelectedDetail(null)}
                className="w-full sm:w-auto py-3 px-6 bg-white border border-border text-[var(--theme-text-muted)] text-xs font-black rounded-xl hover:bg-[var(--theme-bg)] transition-all uppercase tracking-wider cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </DialogModal>

    </PageContent>
  );
}
