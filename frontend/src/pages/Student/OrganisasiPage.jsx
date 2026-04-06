import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
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

// Badge color for organisation type
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
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function OrganisasiPage() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null); // null = add, obj = edit
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

      <div className="max-w-6xl mx-auto">
         {/* Breadcrumb */}
         <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-6">
           <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
           <ChevronRight size={16} />
           <span className="text-[#171717]">Organisasi</span>
         </div>

        {/* Page Title */}
        <div className="mb-7 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-headline mb-1.5 flex items-center gap-3">
              <div className="bg-[#00236F] p-2 rounded-xl text-white shadow-md shadow-[#00236F]/20">
                <Users size={20} />
              </div>
              Riwayat Organisasi
            </h1>
            <p className="text-[#525252] font-medium text-sm md:text-base">Portofolio keaktifan organisasi kemahasiswaan kamu.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#00236F] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#0B4FAE] transition-colors shadow-md shadow-[#00236F]/20 whitespace-nowrap text-sm"
          >
            <Plus size={18} /> Tambah Riwayat
          </button>
        </div>

        {/* Card Grid */}
        {isLoading ? (
          <CardGridSkeleton count={4} />
        ) : list?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((item) => {
              const tc = tipeColor(item.Tipe);
              const isPending = item.StatusVerifikasi === 'Menunggu';
              return (
                <div
                  key={item.ID}
                  className="group bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden hover:border-[#C9D8FF] hover:shadow-md hover:shadow-[#00236F]/10 transition-all flex flex-col"
                >
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    {/* Top: tipe badge + status */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tc.bg} ${tc.text} border-current/20`}>
                        {item.Tipe}
                      </span>
                      {isPending ? (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EAF1FF] text-[#0B4FAE] rounded-full text-xs font-bold">
                          <Clock size={11} /> Menunggu Verifikasi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f0fdf4] text-[#16a34a] rounded-full text-xs font-bold">
                          <CheckCircle2 size={11} /> Terverifikasi
                        </span>
                      )}
                    </div>

                    {/* Name & Position */}
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-[#171717] group-hover:text-[#00236F] transition-colors leading-snug">
                        {item.NamaOrganisasi}
                      </h3>
                      <p className="text-sm font-semibold text-[#525252] mt-0.5">{item.Jabatan}</p>
                    </div>

                    {/* Periode */}
                    <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                      <Calendar size={14} />
                      <span className="font-medium">
                        {item.PeriodeMulai} — {item.PeriodeSelesai ? item.PeriodeSelesai : 'Sekarang'}
                      </span>
                    </div>

                    {/* Deskripsi */}
                    {item.DeskripsiKegiatan && (
                      <p className="text-sm text-[#737373] leading-relaxed line-clamp-2 pt-2 border-t border-[#f5f5f5]">
                        {item.DeskripsiKegiatan}
                      </p>
                    )}
                  </div>

                  {/* Footer actions — only if Menunggu */}
                    {isPending && (
                    <div className="flex border-t border-[#e5e5e5]">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-[#525252] hover:bg-[#EAF1FF] hover:text-[#00236F] transition-all border-r border-[#e5e5e5]"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.ID)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-[#525252] hover:bg-[#fef2f2] hover:text-[#ef4444] transition-all"
                      >
                        <Trash2 size={13} /> Hapus
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
            description="Tambahkan pengalaman organisasi kamu agar portofolio keaktifanmu semakin lengkap dan menarik bagi beasiswa." 
            actionLabel="Tambah Organisasi"
            iconBgClass="bg-[#EAF1FF]"
            iconBorderClass="border-[#C9D8FF]"
            actionClassName="bg-[#00236F] hover:bg-[#0B4FAE] text-white"
            onAction={openAdd}
          />
        )}
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#00236F]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#f5f5f5]">
              <div>
                <h2 className="text-lg md:text-xl font-bold font-headline">
                  {editData ? 'Edit Riwayat Organisasi' : 'Tambah Riwayat Organisasi'}
                </h2>
                <p className="text-sm text-[#a3a3a3] mt-0.5">Lengkapi informasi organisasi kamu</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-[#a3a3a3] hover:text-[#00236F] hover:border-[#00236F] transition-colors flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            {/* Form Body — two column */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-[#f5f5f5]">

                {/* LEFT */}
                <div className="px-5 md:px-6 py-5 space-y-4">
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-semibold text-[#171717] mb-1">
                      Nama Organisasi <span className="text-[#00236F]">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama_organisasi}
                      onChange={(e) => setForm({ ...form, nama_organisasi: e.target.value })}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa]"
                      placeholder="Misal: UKM Paduan Suara BKU"
                      required
                    />
                  </div>

                  {/* Tipe */}
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

                  {/* Jabatan */}
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
                </div>

                {/* RIGHT */}
                <div className="px-5 md:px-6 py-5 space-y-4">
                  {/* Periode */}
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

                  {/* Deskripsi */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#171717] mb-1">Deskripsi Kegiatan</label>
                    <textarea
                      value={form.deskripsi_kegiatan}
                      onChange={(e) => setForm({ ...form, deskripsi_kegiatan: e.target.value })}
                      rows={5}
                      className="w-full border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all bg-[#fafafa] resize-none"
                      placeholder="Ringkasan kontribusi dan kegiatan utama..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#e5e5e5] text-sm font-semibold text-[#525252] hover:bg-[#fafafa] transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={createMut.isPending || updateMut.isPending}
                      className="flex-1 py-2.5 rounded-xl bg-[#00236F] text-white text-sm font-bold hover:bg-[#0B4FAE] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#00236F]/20 disabled:opacity-50"
                    >
                      {(createMut.isPending || updateMut.isPending) ? 'Menyimpan...' : 'Simpan Riwayat'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
