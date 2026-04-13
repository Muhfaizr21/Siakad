import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useAchievementsQuery,
  useCreatePrestasiMandiriMutation,
  useSubmitPrestasiMandiriMutation,
  useDeleteAchievementMutation,
} from '../../queries/useAchievementQuery';
import { useOrganisasiListQuery } from '../../queries/useOrganisasiQuery';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  UploadCloud,
} from 'lucide-react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import { TableSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';

// Format Date Utility
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

// Zod Schema
const achievementSchema = z.object({
  nama_lomba: z.string().min(3, { message: 'Nama lomba minimal 3 karakter' }),
  kategori: z.enum(['Akademik', 'Non-Akademik', 'Olahraga', 'Seni', 'Wirausaha'], {
    required_error: 'Pilih kategori',
  }),
  tingkat: z.enum(['Lokal', 'Regional', 'Nasional', 'Internasional'], {
    required_error: 'Pilih tingkat lomba',
  }),
  penyelenggara: z.string().min(3, { message: 'Nama penyelenggara minimal 3 karakter' }),
  tanggal: z.string().nonempty({ message: 'Tanggal wajib diisi' }),
  peringkat: z.enum(['Juara 1', 'Juara 2', 'Juara 3', 'Harapan 1', 'Harapan 2', 'Finalis', 'Peserta'], {
    required_error: 'Pilih peringkat',
  }),
  sertifikat: z.any().optional(),
  riwayat_organisasi_id: z.string().optional(),
});

export default function AchievementPage() {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null); // Data For Detail Modal

  // Queries
  const { data: achievementData, isLoading } = useAchievementsQuery();
  const createMutation = useCreatePrestasiMandiriMutation();
  const submitMutation = useSubmitPrestasiMandiriMutation();
  const deleteMutation = useDeleteAchievementMutation();

  const stats = achievementData?.stats || { total: 0, verified: 0, pending: 0 };
  const data = useMemo(() => achievementData?.list || [], [achievementData]);

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

  const onSubmit = (formData) => {
    const levelMap = {
      Lokal: 'KAB',
      Regional: 'PROV',
      Nasional: 'NAS',
      Internasional: 'INT',
    };
    const kategoriMap = {
      Akademik: 'RISNOV',
      'Non-Akademik': 'MINAT',
      Olahraga: 'OLAHRAGA',
      Seni: 'SENBUD',
      Wirausaha: 'RISNOVSSH',
    };
    const peringkatMap = {
      'Juara 1': 'JUARA1',
      'Juara 2': 'JUARA2',
      'Juara 3': 'JUARA3',
      'Harapan 1': 'HARAPAN1',
      'Harapan 2': 'HARAPAN2',
      Finalis: 'APRESIASI',
      Peserta: 'PESERTA',
    };

    const payload = {
      level: levelMap[formData.tingkat] || 'NAS',
      kategori: kategoriMap[formData.kategori] || 'MINAT',
      lomba: formData.nama_lomba,
      cabang: formData.kategori,
      penyelenggara: formData.penyelenggara,
      peringkat: peringkatMap[formData.peringkat] || 'PESERTA',
      jumlah_unit_peserta: 1,
      kelompok_prestasi: 'INDIVIDU',
      bentuk: 'LURING',
      url_peserta: 'https://example.com/peserta',
      url_sertifikat: 'https://example.com/sertifikat',
      tgl_sertifikat: formData.tanggal,
      url_foto_upp: '',
      url_dokumen_undangan: '',
      keterangan: formData.riwayat_organisasi_id || '',
      mahasiswa: [],
      dosen: [],
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Draft prestasi mandiri berhasil disimpan');
        reset();
        setIsModalOpen(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Gagal menyimpan draft prestasi');
      },
    });
  };

  const handleSubmitToFaculty = (id) => {
    submitMutation.mutate(id, {
      onSuccess: () => toast.success('Berhasil dikirim ke admin fakultas'),
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal kirim ke fakultas'),
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
        accessorKey: 'NamaKegiatan',
        header: 'Nama Lomba & Kategori',
        cell: (info) => (
          <div>
            <p className="font-bold text-[#171717]">{info.getValue()}</p>
            <p className="text-xs text-[#a3a3a3]">{info.row.original.Kategori}</p>
          </div>
        ),
      },
      {
        accessorKey: 'Tingkat',
        header: 'Tingkat',
        cell: (info) => <span className="text-[#525252]">{info.getValue()}</span>,
      },
      {
        accessorKey: 'Peringkat',
        header: 'Peringkat',
        cell: (info) => <span className="font-semibold text-[#00236F]">{info.getValue()}</span>,
      },
      {
        accessorKey: 'CreatedAt',
        header: 'Tanggal',
        cell: (info) => <span className="text-[#525252] text-sm">{formatDate(info.getValue())}</span>,
      },
      {
        accessorKey: 'Status',
        header: 'Status',
        cell: (info) => {
          const val = info.getValue();
          let style = 'bg-[#f5f5f5] text-[#525252] border-[#e5e5e5]';
          if (val === 'Diverifikasi' || val === 'approved_superadmin') style = 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]';
          if (val === 'Menunggu' || val === 'submitted_to_fakultas' || val === 'review_fakultas' || val === 'forwarded_to_superadmin') style = 'bg-[#eef4ff] text-[#00236F] border-[#c9d8ff]';
          if (val === 'Ditolak' || val === 'rejected_superadmin') style = 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]';

          return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
              {val}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: (info) => (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDetail(info.row.original)}
              className="p-1.5 text-[#00236F] bg-[#eef4ff] rounded hover:bg-[#dbe7ff] transition-colors"
              title="Detail"
            >
              <Eye size={16} />
            </button>
             {info.row.original.Status === 'draft' && (
               <button
                 onClick={() => handleSubmitToFaculty(info.row.original.ID)}
                 className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#00236F] rounded hover:bg-[#0B4FAE] transition-colors"
                 title="Kirim"
               >
                 Kirim
               </button>
             )}
             {(info.row.original.Status === 'Menunggu' || info.row.original.Status === 'draft' || info.row.original.Status === 'rejected_superadmin') && (
               <button
                 onClick={() => handleDelete(info.row.original.ID)}
                 className="p-1.5 text-[#dc2626] bg-[#fef2f2] rounded hover:bg-[#fee2e2] transition-colors"
                 title="Hapus"
               >
                 <Trash2 size={16} />
               </button>
             )}
          </div>
        ),
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
          <Plus size={16} />
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
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs text-[#a3a3a3] font-semibold tracking-wide">DIVERIFIKASI</p>
            <p className="text-xl font-extrabold text-[#171717]">{stats.verified}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e5e5e5] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F]">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs text-[#a3a3a3] font-semibold tracking-wide">MENUNGGU VALIDASI</p>
            <p className="text-xl font-extrabold text-[#171717]">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-[#e5e5e5] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#f4f8ff]">
          <div>
            <h2 className="font-bold text-base md:text-lg">Riwayat Prestasi</h2>
            <p className="text-xs text-[#737373] mt-0.5">Gunakan pencarian untuk menemukan kompetisi tertentu dengan cepat.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" size={18} />
            <input
              type="text"
              placeholder="Cari nama lomba..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#e5e5e5] focus:outline-none focus:border-[#00236F] text-sm"
            />
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
              <h2 className="text-xl font-bold font-headline">Lapor Prestasi Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-[#171717]">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-5">
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
              </div>

              <div>
                 <label className="block text-sm font-semibold mb-1 text-[#525252]">Pilih Organisasi Berafiliasi (Opsional)</label>
                 <select {...register('riwayat_organisasi_id')} className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2 focus:border-[#00236F] outline-none text-[#171717]">
                    <option value="">(Tidak terkait organisasi)</option>
                    {orgList.map(org => (
                       <option key={org.ID} value={org.ID}>{org.NamaOrganisasi} ({org.Jabatan})</option>
                    ))}
                 </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-[#525252]">Upload Sertifikat/Bukti <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-[#e5e5e5] rounded-xl p-6 text-center hover:bg-[#fafafa] transition-colors relative">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" {...register('sertifikat')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="pointer-events-none flex flex-col items-center">
                    <UploadCloud size={32} className="text-[#a3a3a3] mb-2" />
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
                  {createMutation.isLoading ? 'Menyimpan...' : 'Simpan Prestasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-[#e5e5e5]">
              <h2 className="text-xl font-bold font-headline">Detail Prestasi</h2>
              <button onClick={() => setSelectedDetail(null)} className="text-[#a3a3a3] hover:text-[#171717]">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              
              {selectedDetail.Status === 'Ditolak' && (
                 <div className="bg-[#fef2f2] border border-[#fecaca] p-4 rounded-xl mb-6">
                   <p className="font-bold text-[#dc2626] text-sm">Alasan Ditolak:</p>
                   <p className="text-[#991b1b] text-sm mt-1">{selectedDetail.CatatanVerifikator || 'Tidak ada catatan.'}</p>
                 </div>
              )}

              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3] w-1/3">Nama Lomba</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.NamaKegiatan}</td></tr>
                  <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Kategori / Tingkat</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.Kategori} - {selectedDetail.Tingkat}</td></tr>
                  <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Penyelenggara</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.Penyelenggara}</td></tr>
                  <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Peringkat</td><td className="py-2 font-bold text-[#00236F]">{selectedDetail.Peringkat}</td></tr>
                  <tr className="border-b border-[#f5f5f5]"><td className="py-2.5 font-semibold text-[#a3a3a3]">Status</td><td className="py-2 font-bold text-[#171717]">{selectedDetail.Status}</td></tr>
                </tbody>
              </table>

              <div className="mt-6">
                <p className="font-semibold text-sm mb-2 text-[#a3a3a3]">Bukti Sertifikat</p>
                {selectedDetail.BuktiURL ? (
                  <a href={`http://localhost:8000${selectedDetail.BuktiURL}`} target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 border border-[#e5e5e5] rounded-xl hover:bg-[#eef4ff] hover:border-[#00236F] transition-colors text-sm font-bold text-[#00236F]">
                    Lihat Dokumen Sertifikat
                  </a>
                ) : (
                  <p className="text-sm italic text-[#a3a3a3]">Tidak ada lampiran.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
