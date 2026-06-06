import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useAchievementsQuery,
  useCreateAchievementMutation,
  useDeleteAchievementMutation,
} from '../../queries/useAchievementQuery';
import { useOrganisasiListQuery } from '../../queries/useOrganisasiQuery';

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '@/components/ui/SkeletonGroups';
import EmptyState from '@/components/ui/EmptyState';
import { API_BASE_URL } from '../../services/api';

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
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null); // Data For Detail Modal

  // Queries
  const { data: achievementData, isLoading } = useAchievementsQuery();
  const createMutation = useCreateAchievementMutation();
  const deleteMutation = useDeleteAchievementMutation();

  const stats = achievementData?.stats || { total: 0, verified: 0, pending: 0 };

  const [filterSemester, setFilterSemester] = useState('all');
  const [filterPeriode, setFilterPeriode] = useState('all');
  const [filterProdi, setFilterProdi] = useState('all');

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

  const data = useMemo(() => {
    return mappedList.filter(item => {
      const matchSem = filterSemester === 'all' || item.semester_filter === filterSemester;
      const matchPer = filterPeriode === 'all' || item.periode_filter === filterPeriode;
      const matchPr = filterProdi === 'all' || item.prodi_filter === filterProdi;
      return matchSem && matchPer && matchPr;
    });
  }, [mappedList, filterSemester, filterPeriode, filterProdi]);

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
        header: 'No',
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: 'nama_kegiatan',
        header: 'Nama Lomba & Kategori',
        cell: (info) => {
          const name = info.row.original.nama_kegiatan || info.row.original.NamaKegiatan || '';
          const category = info.row.original.kategori || info.row.original.Kategori || '';
          const tipe = info.row.original.tipe || info.row.original.Tipe || 'Laporan Prestasi';
          return (
            <div>
              <p className="font-bold text-[#171717]">{name}</p>
              <div className="flex gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-[#00236F] bg-[#eef4ff] px-1.5 py-0.5 rounded">{category}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tipe === 'Pengajuan Dana' ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>{tipe}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'tingkat',
        header: 'Tingkat',
        cell: (info) => {
          const val = info.row.original.tingkat || info.row.original.Tingkat || '';
          return <span className="text-[#525252]">{val}</span>;
        },
      },
      {
        accessorKey: 'peringkat',
        header: 'Peringkat / Pendanaan',
        cell: (info) => {
          const row = info.row.original;
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
          return <span className="font-semibold text-[#00236F]">{val}</span>;
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Tanggal',
        cell: (info) => {
          const val = info.row.original.created_at || info.row.original.CreatedAt || '';
          return <span className="text-[#525252] text-sm">{formatDate(val)}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const val = info.row.original.status || info.row.original.Status || 'Menunggu';
          let style = 'bg-[#f5f5f5] text-[#525252] border-[#e5e5e5]';
          if (val === 'Diverifikasi' || val === 'Valid' || val === 'Disetujui') style = 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]';
          if (val === 'Menunggu' || val === 'Pending') style = 'bg-[#eef4ff] text-[#00236F] border-[#c9d8ff]';
          if (val === 'Ditolak') style = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';

          return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
              {val === 'Diverifikasi' || val === 'Valid' || val === 'Disetujui' ? 'Disetujui' : val}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: (info) => {
          const status = info.row.original.status || info.row.original.Status || 'Menunggu';
          const id = info.row.original.id || info.row.original.ID;
          return (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDetail(info.row.original)}
                className="p-1.5 text-[#00236F] bg-[#eef4ff] rounded hover:bg-[#dbe7ff] transition-colors"
                title="Detail"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >visibility</span>
              </button>
              {status === 'Menunggu' && (
                <button
                  onClick={() => handleDelete(id)}
                  className="p-1.5 text-[#dc2626] bg-[#fef2f2] rounded hover:bg-[#fee2e2] transition-colors"
                  title="Hapus"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline flex items-center gap-2.5">
            <Trophy className="text-[#00236F]" size={30} />
            Achievement
          </h1>
          <p className="text-[#525252] mt-1 font-medium text-sm md:text-base">Lapor, pantau status verifikasi, dan kelola seluruh prestasi akademik/non-akademikmu.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00236F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#0B4FAE] transition-colors shadow-sm shadow-[#00236F]/20"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >add</span>
          Lapor Prestasi Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F]">
            <Trophy size={18} />
          </div>
          <div>
            <p className="text-xs text-[#a3a3a3] font-semibold tracking-wide">TOTAL PRESTASI</p>
            <p className="text-xl font-extrabold text-[#171717]">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex justify-center items-center text-[#16a34a]">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >check_circle</span>
          </div>
          <div>
            <p className="text-xs text-[#a3a3a3] font-semibold tracking-wide">DIVERIFIKASI</p>
            <p className="text-xl font-extrabold text-[#171717]">{stats.verified}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F]">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >schedule</span>
          </div>
          <div>
            <p className="text-xs text-[#a3a3a3] font-semibold tracking-wide">MENUNGGU VALIDASI</p>
            <p className="text-xl font-extrabold text-[#171717]">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-[#e5e5e5] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[#f4f8ff]">
          <div>
            <h2 className="font-bold text-base md:text-lg">Riwayat Prestasi</h2>
            <p className="text-xs text-[#737373] mt-0.5">Gunakan pencarian dan filter untuk menyaring data prestasimu.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" style={{ fontSize: '18px' }} >search</span>
              <input
                type="text"
                placeholder="Cari nama lomba..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-[#00236F] text-sm bg-white"
              />
            </div>
            
            <div className="relative">
              <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-bold bg-white text-[#525252] focus:outline-none focus:border-[#00236F] appearance-none cursor-pointer">
                <option value="all">Semua Semester</option>
                {semesterOptions.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#525252] pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
            </div>

            <div className="relative">
              <select value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-bold bg-white text-[#525252] focus:outline-none focus:border-[#00236F] appearance-none cursor-pointer">
                <option value="all">Semua Periode</option>
                {periodeOptions.map(per => (
                  <option key={per} value={per}>Periode {per}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#525252] pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
            </div>

            <div className="relative">
              <select value={filterProdi} onChange={e => setFilterProdi(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-[#e5e5e5] text-xs font-bold bg-white text-[#525252] focus:outline-none focus:border-[#00236F] appearance-none cursor-pointer">
                <option value="all">Semua Prodi</option>
                {prodiOptions.map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#525252] pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
            </div>

            {(globalFilter || filterSemester !== 'all' || filterPeriode !== 'all' || filterProdi !== 'all') && (
              <button 
                onClick={() => { setGlobalFilter(''); setFilterSemester('all'); setFilterPeriode('all'); setFilterProdi('all'); }}
                className="h-9 px-3 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-[#f4f8ff] border-b border-[#dbe7ff]">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 md:px-6 py-3.5 text-xs font-bold text-[#1E3A8A] uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8">
                    <TableSkeleton rows={5} cols={7} />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12">
                    <EmptyState 
                      icon="Trophy" 
                      iconColor="text-[#00236F]"
                      iconBgClass="bg-[#eef4ff]"
                      iconBorderClass="border-[#c9d8ff]"
                      title="Belum Ada Prestasi" 
                      description="Lapor prestasi pertamamu sekarang dan dapatkan poin serta pengakuan resmi dari kampus!" 
                      actionLabel="Lapor Prestasi"
                      actionClassName="bg-[#00236F] hover:bg-[#0B4FAE]"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef1f6] hover:bg-[#f7faff] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 md:px-6 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Details */}
        <div className="p-4 border-t border-[#e5e5e5] flex items-center justify-between text-sm text-[#525252]">
          <div>
            Menampilkan halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount() || 1}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-[#e5e5e5] rounded bg-white hover:bg-[#eef4ff] disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-[#e5e5e5] rounded bg-white hover:bg-[#eef4ff] disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LAPOR PRESTASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold font-headline">{tipeValue === 'Pengajuan Dana' ? 'Ajukan Dana Lomba Baru' : 'Lapor Prestasi Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-[#171717]">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1 text-[#525252]">Tipe Pengajuan <span className="text-red-500">*</span></label>
                <select {...register('tipe')} defaultValue="Laporan Prestasi" className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]">
                  <option value="Laporan Prestasi">Laporan Prestasi (Riwayat Kompetisi)</option>
                  <option value="Pengajuan Dana">Pengajuan Dana Lomba (Keikutsertaan Lomba Luar Kampus)</option>
                </select>
                {errors.tipe && <p className="text-xs text-red-500 mt-1">{errors.tipe.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#525252]">Nama Lomba/Kompetisi <span className="text-red-500">*</span></label>
                  <input {...register('nama_lomba')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none" placeholder="Cth: Gemastik 2026" />
                  {errors.nama_lomba && <p className="text-xs text-red-500 mt-1">{errors.nama_lomba.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#525252]">Kategori <span className="text-red-500">*</span></label>
                  <select {...register('kategori')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]">
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
                  <label className="block text-sm font-semibold mb-1 text-[#525252]">Tingkat <span className="text-red-500">*</span></label>
                  <select {...register('tingkat')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]">
                    <option value="">Pilih Tingkat</option>
                    <option value="Lokal">Lokal (Antar Prodi/Univ)</option>
                    <option value="Regional">Regional (Antar Kampus Jabar)</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                  {errors.tingkat && <p className="text-xs text-red-500 mt-1">{errors.tingkat.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#525252]">Penyelenggara <span className="text-red-500">*</span></label>
                  <input {...register('penyelenggara')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none" placeholder="Cth: Kemendikbud" />
                  {errors.penyelenggara && <p className="text-xs text-red-500 mt-1">{errors.penyelenggara.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-[#525252]">Tanggal Pelaksanaan <span className="text-red-500">*</span></label>
                  <input type="date" {...register('tanggal')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]" />
                  {errors.tanggal && <p className="text-xs text-red-500 mt-1">{errors.tanggal.message}</p>}
                </div>
                {tipeValue === 'Laporan Prestasi' ? (
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[#525252]">Peringkat Diraih <span className="text-red-500">*</span></label>
                    <select {...register('peringkat')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]">
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
                    <label className="block text-sm font-semibold mb-1 text-[#525252]">Dana yang Diajukan (Rp) <span className="text-red-500">*</span></label>
                    <input type="number" {...register('dana_diajukan')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none" placeholder="Cth: 1500000" />
                    {errors.dana_diajukan && <p className="text-xs text-red-500 mt-1">{errors.dana_diajukan.message}</p>}
                  </div>
                )}
              </div>

              <div>
                 <label className="block text-sm font-semibold mb-1 text-[#525252]">Pilih Organisasi Berafiliasi (Opsional)</label>
                 <select {...register('riwayat_organisasi_id')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]">
                    <option value="">(Tidak terkait organisasi)</option>
                    {orgList.map(org => (
                       <option key={org.id || org.ID} value={org.id || org.ID}>{org.NamaOrganisasi} ({org.Jabatan})</option>
                    ))}
                 </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-[#525252]">
                  {tipeValue === 'Pengajuan Dana' ? 'Upload Proposal/Bukti Pendukung' : 'Upload Sertifikat/Bukti'} <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-6 text-center hover:bg-[#fafafa] transition-colors relative">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" {...register('sertifikat')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="pointer-events-none flex flex-col items-center">
                    <span className="material-symbols-outlined text-[#a3a3a3] mb-2" style={{ fontSize: '32px' }} Cloud >upload</span>
                    <p className="text-sm font-semibold text-[#00236F]">Klik untuk Upload File</p>
                    <p className="text-xs text-[#a3a3a3] mt-1">Format: PDF, JPG, PNG (Max. 5MB)</p>
                    {fileValue && fileValue.length > 0 && (
                      <div className="mt-3 px-3 py-1 bg-[#eef4ff] border border-[#c9d8ff] text-[#00236F] text-xs font-bold rounded-lg truncate w-full max-w-xs">
                        Terpilih: {fileValue[0].name}
                      </div>
                    )}
                  </div>
                </div>
                {errors.sertifikat && <p className="text-xs text-red-500 mt-1">{errors.sertifikat?.message || errors.sertifikat?.root?.message}</p>}
              </div>

              <div className="pt-4 border-t border-[#e5e5e5] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold border border-[#e5e5e5] text-[#171717] hover:bg-[#f5f5f5]">Batal</button>
                <button type="submit" disabled={createMutation.isLoading} className="px-5 py-2.5 rounded-xl font-bold bg-[#00236F] text-white hover:bg-[#0B4FAE] disabled:opacity-50">
                  {createMutation.isLoading ? 'Menyimpan...' : (tipeValue === 'Pengajuan Dana' ? 'Kirim Pengajuan Dana' : 'Simpan Prestasi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {selectedDetail && (() => {
        const detailTipe = selectedDetail.tipe || selectedDetail.Tipe || 'Laporan Prestasi';
        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5]">
                <h2 className="text-xl font-bold font-headline">
                  {detailTipe === 'Pengajuan Dana' ? 'Detail Pengajuan Dana Lomba' : 'Detail Prestasi'}
                </h2>
                <button onClick={() => setSelectedDetail(null)} className="text-[#a3a3a3] hover:text-[#171717]">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >close</span>
                </button>
              </div>
              <div className="p-6">
                
                {(selectedDetail.catatan_verifikator || selectedDetail.CatatanVerifikator) && (
                   <div className={`p-4 rounded-xl mb-6 border ${selectedDetail.status === 'Ditolak' || selectedDetail.Status === 'Ditolak' ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]' : 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'}`}>
                     <p className="font-bold text-sm">{selectedDetail.status === 'Ditolak' || selectedDetail.Status === 'Ditolak' ? 'Alasan Ditolak:' : 'Catatan Verifikator:'}</p>
                     <p className="text-sm mt-1">{selectedDetail.catatan_verifikator || selectedDetail.CatatanVerifikator}</p>
                   </div>
                )}

                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3] w-1/3">Tipe Pengajuan</td><td className="py-2 font-bold text-[#171717]">{detailTipe}</td></tr>
                    <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Nama Lomba</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.nama_kegiatan || selectedDetail.NamaKegiatan}</td></tr>
                    <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Kategori / Tingkat</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.kategori || selectedDetail.Kategori} - {selectedDetail.tingkat || selectedDetail.Tingkat}</td></tr>
                    <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Penyelenggara</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.penyelenggara || selectedDetail.Penyelenggara || '—'}</td></tr>
                    
                    {detailTipe === 'Pengajuan Dana' ? (
                      <>
                        <tr className="border-b border-[#f5f5f5]">
                          <td className="py-2.5 font-semibold text-[#a3a3a3]">Dana Diajukan</td>
                          <td className="py-2 font-bold text-[#00236F]">Rp {(selectedDetail.dana_diajukan || selectedDetail.DanaDiajukan || 0).toLocaleString('id-ID')}</td>
                        </tr>
                        <tr className="border-b border-[#f5f5f5]">
                          <td className="py-2.5 font-semibold text-[#a3a3a3]">Dana Disetujui</td>
                          <td className="py-2 font-bold text-emerald-600">
                            {(selectedDetail.dana_disetujui || selectedDetail.DanaDisetujui) ? `Rp ${(selectedDetail.dana_disetujui || selectedDetail.DanaDisetujui).toLocaleString('id-ID')}` : 'Belum disetujui'}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Peringkat</td><td className="py-2 font-bold text-[#00236F]">{selectedDetail.peringkat || selectedDetail.Peringkat || '—'}</td></tr>
                    )}
                    
                    <tr className="border-b border-[#f5f5f5]">
                      <td className="py-2.5 font-semibold text-[#a3a3a3]">Status</td>
                      <td className="py-2 font-bold text-[#171717]">
                        {selectedDetail.status === 'Diverifikasi' || selectedDetail.status === 'Valid' || selectedDetail.status === 'Disetujui' || selectedDetail.Status === 'Diverifikasi' || selectedDetail.Status === 'Disetujui' ? 'Disetujui' : (selectedDetail.status || selectedDetail.Status || 'Menunggu')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-6">
                  <p className="font-semibold text-sm mb-2 text-[#a3a3a3]">
                    {detailTipe === 'Pengajuan Dana' ? 'Proposal / Dokumen Pendukung' : 'Bukti Sertifikat'}
                  </p>
                  {(selectedDetail.bukti_url || selectedDetail.BuktiURL) ? (
                    <a href={`${API_BASE_URL.replace('/api', '')}${selectedDetail.bukti_url || selectedDetail.BuktiURL}`} target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 border border-[#e5e5e5] rounded-xl hover:bg-[#eef4ff] hover:border-[#00236F] transition-colors text-sm font-bold text-[#00236F]">
                      {detailTipe === 'Pengajuan Dana' ? 'Lihat Proposal / Dokumen' : 'Lihat Dokumen Sertifikat'}
                    </a>
                  ) : (
                    <p className="text-sm italic text-[#a3a3a3]">Tidak ada lampiran.</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
