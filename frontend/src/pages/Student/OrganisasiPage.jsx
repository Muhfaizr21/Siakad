import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
} from 'lucide-react';
import {
  useOrganisasiListQuery,
  useCreateOrganisasiMutation,
  useUpdateOrganisasiMutation,
  useDeleteOrganisasiMutation,
} from '../../queries/useOrganisasiQuery';
import { CardGridSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'react-hot-toast';
import { NavLink } from 'react-router-dom';

const TIPE_COLORS = {
  UKM:            { bg: 'bg-[#EAF1FF]', text: 'text-[#0B4FAE]' },
  'Himpunan Prodi': { bg: 'bg-[#EEF4FF]', text: 'text-[#1D4E9E]' },
  BEM:            { bg: 'bg-[#EDF3FF]', text: 'text-[#113A80]' },
  DPM:            { bg: 'bg-[#F3F7FF]', text: 'text-[#294D8D]' },
  Komunitas:  { bg: 'bg-[#f5f5f5]', text: 'text-[#737373]' },
  Lainnya:    { bg: 'bg-[#f5f5f5]', text: 'text-[#737373]' },
};

const TIPE_OPTIONS = ['UKM', 'Himpunan Prodi', 'BEM', 'DPM', 'Komunitas', 'Lainnya'];

const EMPTY_FORM = {
  nama_organisasi: '',
  tipe: 'UKM',
  jabatan: '',
  periode_mulai: new Date().getFullYear(),
  periode_selesai: '',
  deskripsi_kegiatan: '',
  apresiasi: '',
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function OrganisasiPage() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);

  const { data: list, isLoading } = useOrganisasiListQuery();
  const createMut = useCreateOrganisasiMutation();
  const updateMut = useUpdateOrganisasiMutation();
  const deleteMut = useDeleteOrganisasiMutation();

  const openAdd = () => {
    setEditData(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditData(item);
    setForm({
      nama_organisasi:    item.NamaOrganisasi,
      tipe:               item.Tipe,
      jabatan:            item.Jabatan,
      periode_mulai:      item.PeriodeMulai,
      periode_selesai:    item.PeriodeSelesai ?? '',
      deskripsi_kegiatan: item.DeskripsiKegiatan,
      apresiasi:          item.apresiasi ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      periode_mulai:   Number(form.periode_mulai),
      periode_selesai: form.periode_selesai ? Number(form.periode_selesai) : null,
    };

    if (payload.periode_selesai && payload.periode_selesai < payload.periode_mulai) {
      toast.error('Periode selesai harus lebih besar dari periode mulai');
      return;
    }

    const action = editData
      ? updateMut.mutateAsync({ id: editData.ID, ...payload })
      : createMut.mutateAsync(payload);

    action
      .then(() => {
        toast.success(editData ? 'Riwayat berhasil diperbarui!' : 'Riwayat berhasil ditambahkan!');
        setShowModal(false);
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Gagal menyimpan data'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus riwayat organisasi ini?')) return;
    deleteMut.mutate(id, {
      onSuccess: () => toast.success('Riwayat berhasil dihapus'),
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal menghapus'),
    });
  };

  const tipeColor = (tipe) => TIPE_COLORS[tipe] ?? TIPE_COLORS['Lainnya'];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">

      <div className="max-w-7xl mx-auto">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-6">
           <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
           <ChevronRight size={16} />
           <span className="text-[#171717]">Organisasi</span>
         </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-1.5 flex items-center gap-3">
              <div className="bg-[#00236F] p-2 rounded-xl text-white shadow-md shadow-[#00236F]/20">
                <Users size={20} />
              </div>
              Portfolio Keorganisasian
            </h1>
            <p className="text-[#525252] font-medium text-sm md:text-base">Portofolio keaktifan organisasi kemahasiswaan kamu.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 bg-[#00236F] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#0B4FAE] transition-colors shadow-md shadow-[#00236F]/20 whitespace-nowrap text-sm"
          >
            <Plus size={18} /> Tambah Riwayat
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <CardGridSkeleton count={4} />
        ) : list?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {list.map((item) => {
              const tc = tipeColor(item.Tipe);
              const isPending = item.StatusVerifikasi === 'Menunggu';
              const isActive = !item.PeriodeSelesai;

              return (
                <div
                  key={item.ID}
                  className="group bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden hover:border-[#C9D8FF] hover:shadow-lg hover:shadow-[#00236F]/10 transition-all flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2 items-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${tc.bg} ${tc.text} border-current/20 uppercase tracking-wide`}>
                            {item.Tipe}
                          </span>
                        {isActive ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#EAF1FF] text-[#0B4FAE] border border-[#C9D8FF]">Aktif</span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">Selesai/Purna</span>
                        )}
                      </div>
                      
                      {isPending ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#a3a3a3] bg-[#fafafa] border border-[#e5e5e5]">
                          <Clock size={12} /> Menunggu Verifikasi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0]">
                          <CheckCircle2 size={12} /> Terverifikasi
                        </span>
                      )}
                    </div>

                    {/* Organization Title */}
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#171717] group-hover:text-[#00236F] transition-colors leading-snug">
                        {item.NamaOrganisasi}
                      </h3>
                      <p className="text-sm font-semibold text-[#525252] mt-1">{item.Jabatan}</p>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 gap-2 pt-3 border-t border-[#f5f5f5]">
                      <div className="flex text-sm">
                        <span className="w-32 shrink-0 text-[#a3a3a3] flex items-center gap-1.5">
                          <Calendar size={14} /> Periode:
                        </span>
                        <span className="font-medium text-[#171717]">
                          {item.PeriodeMulai} — {item.PeriodeSelesai ? item.PeriodeSelesai : 'Sekarang'}
                        </span>
                      </div>

                      <div className="flex text-sm">
                        <span className="w-32 shrink-0 text-[#a3a3a3] flex items-start gap-1.5 mt-0.5">
                           <Users size={14} /> Deskripsi:
                        </span>
                        <span className="text-[#525252] leading-relaxed line-clamp-3">
                           {item.DeskripsiKegiatan || '-'}
                        </span>
                      </div>

                      <div className="flex text-sm">
                        <span className="w-32 shrink-0 text-[#a3a3a3] flex items-start gap-1.5 mt-0.5">
                           <Award size={14} /> Apresiasi:
                        </span>
                        <span className="text-[#113A80] font-medium leading-relaxed bg-[#EEF4FF] px-2 py-1 rounded">
                           {item.apresiasi || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex border-t border-[#e5e5e5] bg-[#fafafa]">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-[#525252] hover:bg-[#EAF1FF] hover:text-[#00236F] transition-all border-r border-[#e5e5e5]"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.ID)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-[#525252] hover:bg-[#fef2f2] hover:text-[#ef4444] transition-all"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            icon="Users" 
            title="Belum Ada Riwayat Organisasi" 
            description="Tambahkan pengalaman organisasi kamu agar portofolio keaktifanmu semakin lengkap dan terlihat profesional." 
            actionLabel="Tambah Riwayat"
            iconBgClass="bg-[#EAF1FF]"
            iconBorderClass="border-[#C9D8FF]"
            actionClassName="bg-[#00236F] hover:bg-[#0B4FAE] text-white"
            onAction={openAdd}
          />
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#00236F]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#f5f5f5] shrink-0">
              <div>
                <h2 className="text-lg md:text-xl font-bold font-headline">
                  {editData ? 'Edit Riwayat Organisasi' : 'Tambah Riwayat Organisasi'}
                </h2>
                <p className="text-sm text-[#a3a3a3] mt-0.5">Lengkapi informasi portofolio organisasi kamu</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-[#a3a3a3] hover:text-[#00236F] hover:border-[#00236F] transition-colors flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-[#f5f5f5]">
                <div className="px-5 md:px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#171717] mb-1">
                      Nama Organisasi <span className="text-[#00236F]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama_organisasi}
                      onChange={(e) => setForm({ ...form, nama_organisasi: e.target.value })}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa]"
                      placeholder="Misal: UKM Paduan Suara"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#171717] mb-1">
                      Tipe Organisasi <span className="text-[#00236F]">*</span>
                    </label>
                    <select
                      value={form.tipe}
                      onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa]"
                    >
                      {TIPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#171717] mb-1">
                      Jabatan / Posisi <span className="text-[#00236F]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.jabatan}
                      onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa]"
                      placeholder="Misal: Ketua Umum"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-[#171717] mb-1">
                        Periode Mulai <span className="text-[#00236F]">*</span>
                      </label>
                      <select
                        value={form.periode_mulai}
                        onChange={(e) => setForm({ ...form, periode_mulai: e.target.value })}
                        className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 bg-[#fafafa]"
                      >
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#171717] mb-1">Periode Selesai</label>
                      <select
                        value={form.periode_selesai}
                        onChange={(e) => setForm({ ...form, periode_selesai: e.target.value })}
                        className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 bg-[#fafafa]"
                      >
                        <option value="">Sekarang (Aktif)</option>
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-5 md:px-6 py-5 space-y-4 flex flex-col">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#171717] mb-1">Deskripsi Kegiatan</label>
                    <textarea
                      value={form.deskripsi_kegiatan}
                      onChange={(e) => setForm({ ...form, deskripsi_kegiatan: e.target.value })}
                      rows={3}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa] resize-none"
                      placeholder="Ringkasan kontribusi dan program kerja..."
                    />
                  </div>

                   <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#171717] mb-1">Apresiasi / Penghargaan</label>
                    <textarea
                      value={form.apresiasi}
                      onChange={(e) => setForm({ ...form, apresiasi: e.target.value })}
                      rows={2}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa] resize-none"
                      placeholder="Opsional: Misal 'Predikat Pengurus Terbaik Bulan Agustus 2026'"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 md:px-6 py-4 border-t border-[#f5f5f5] bg-[#fafafa] flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-32 py-2.5 rounded-xl border border-[#e5e5e5] text-sm font-semibold text-[#525252] hover:bg-white transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  className="w-40 py-2.5 rounded-xl bg-[#00236F] text-white text-sm font-bold hover:bg-[#0B4FAE] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#00236F]/20 disabled:opacity-50"
                >
                  {(createMut.isPending || updateMut.isPending) ? 'Menyimpan...' : 'Simpan Riwayat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
