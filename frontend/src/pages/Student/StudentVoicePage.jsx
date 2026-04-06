import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  MoreVertical,
  X,
  Upload,
  User,
  Eye,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useVoiceStatsQuery, 
  useVoiceListQuery, 
  useCreateVoiceMutation,
  useCancelVoiceMutation
} from '../../queries/useStudentVoiceQuery';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { Link, NavLink } from 'react-router-dom';

const categories = [
  { id: 'Akademik', label: 'Akademik', color: 'bg-[#EAF1FF] text-[#0B4FAE] border-[#C9D8FF]' },
  { id: 'Fasilitas', label: 'Fasilitas', color: 'bg-[#EEF4FF] text-[#1D4E9E] border-[#D5E2FF]' },
  { id: 'Kemahasiswaan', label: 'Kemahasiswaan', color: 'bg-[#F3F7FF] text-[#294D8D] border-[#DFE8FF]' },
  { id: 'Saran & Ide', label: 'Saran & Ide', color: 'bg-[#EDF3FF] text-[#113A80] border-[#D3E1FF]' },
  { id: 'Lainnya', label: 'Lainnya', color: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
];

export default function StudentVoicePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  // Queries
  const { data: stats, isLoading: isStatsLoading } = useVoiceStatsQuery();
  const { data: listData, isLoading: isListLoading } = useVoiceListQuery(page);
  const cancelMutation = useCancelVoiceMutation();

  const handleCancelTicket = (id) => {
    if (window.confirm('Apakah Anda yakin ingin membatalkan aspirasi ini?')) {
      cancelMutation.mutate(id, {
        onSuccess: () => toast.success('Aspirasi berhasil dibatalkan'),
        onError: (err) => toast.error(err.response?.data?.message || 'Gagal membatalkan aspirasi')
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 transition-all duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-6">
        <NavLink to="/student/dashboard" className="hover:text-[#00236F] cursor-pointer transition-colors">Dashboard</NavLink>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Suara Mahasiswa</span>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tight mb-2 flex items-center gap-3">
              <div className="bg-[#00236F] p-2 rounded-xl text-white shadow-md shadow-[#00236F]/20">
                <MessageSquare size={20} strokeWidth={2.5} />
              </div>
              Suara Mahasiswa
            </h1>
            <p className="text-[#525252] font-medium text-sm md:text-base max-w-xl">
              Sampaikan aspirasi, saran, dan pengaduanmu kepada kampus untuk BKU yang lebih baik.
            </p>
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#00236F] text-white font-bold rounded-xl hover:bg-[#0B4FAE] transition-all shadow-md shadow-[#00236F]/20 text-sm group"
          >
            <Plus size={18} strokeWidth={2.8} className="group-hover:rotate-90 transition-transform duration-300" />
            Sampaikan Aspirasi Baru
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isStatsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <StatCard label="Total Diajukan" value={stats?.total || 0} color="border-[#D5E2FF]" icon={<MessageSquare size={18} className="text-[#00236F]" />} bg="bg-white" />
              <StatCard label="Di Fakultas" value={stats?.di_fakultas || 0} color="border-[#C9D8FF]" icon={<Clock size={18} className="text-[#0B4FAE]" />} bg="bg-[#EAF1FF]" />
              <StatCard label="Di Universitas" value={stats?.di_universitas || 0} color="border-[#D3E1FF]" icon={<ShieldAlert size={18} className="text-[#1D4E9E]" />} bg="bg-[#EEF4FF]" />
              <StatCard label="Selesai" value={stats?.selesai || 0} color="border-[#16a34a]" icon={<CheckCircle2 size={20} className="text-[#16a34a]" />} bg="bg-[#f0fdf4]" />
            </>
          )}
        </div>

        {/* List Section */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden mb-8">
          <div className="px-5 md:px-6 py-5 border-b border-[#f5f5f5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black font-headline tracking-tight">Riwayat Aspirasi Kamu</h2>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] group-focus-within:text-[#00236F] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari nomor tiket / judul..." 
                  className="pl-12 pr-4 py-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-sm font-semibold focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all w-full md:w-64"
                />
              </div>
              <button className="p-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-[#a3a3a3] hover:text-[#00236F] transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fafafa]/50 border-b border-[#f5f5f5]">
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Nomor Tiket</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest">Kategori & Judul</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest text-center">Level Unit</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest text-center">Status</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {isListLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan="5" className="px-5 md:px-6 py-6"><Skeleton className="h-14 w-full rounded-xl" /></td></tr>
                  ))
                ) : listData?.list?.length > 0 ? (
                  listData.list.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-[#fafafa]/80 transition-all duration-300">
                      <td className="px-5 md:px-6 py-5">
                        <div className="font-black text-[#171717]">{ticket.nomor_tiket}</div>
                        <div className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-tighter mt-1">
                          {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 md:px-6 py-5 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${getCategoryStyle(ticket.kategori)}`}>
                            {ticket.kategori}
                          </span>
                          {ticket.is_anonim && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-[#a3a3a3] uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                              <Eye size={10} className="opacity-40" strokeWidth={3} /> Anonim
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-[#171717] truncate">{ticket.judul}</div>
                      </td>
                      <td className="px-5 md:px-6 py-5 text-center">
                        <LevelBadge level={ticket.level_saat_ini} />
                      </td>
                      <td className="px-5 md:px-6 py-5 text-center">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-5 md:px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {ticket.status === 'menunggu' && ticket.level_saat_ini === 'fakultas' && (
                            <button 
                              onClick={() => handleCancelTicket(ticket.id)}
                            className="w-9 h-9 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Batalkan Aspirasi"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <Link 
                            to={`/student/voice/tiket/${ticket.id}`}
                            className="w-9 h-9 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center text-[#00236F] hover:bg-[#00236F] hover:text-white transition-all shadow-sm"
                          >
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="bg-[#fafafa] rounded-2xl p-7 border-2 border-dashed border-[#d4def3] inline-block">
                        <HelpCircle size={48} className="mx-auto text-[#d4d4d4] mb-4" />
                        <h3 className="text-base md:text-lg font-black text-[#a3a3a3]">Kamu belum pernah mengirim aspirasi.</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listData?.last_page > 1 && (
            <div className="px-5 md:px-6 py-4 border-t border-[#f5f5f5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#a3a3a3]">
                Menampilkan <span className="text-[#171717]">{listData.list.length}</span> dari <span className="text-[#171717]">{listData.total}</span> data
              </span>
              <div className="flex items-center gap-2">
                {[...Array(listData.last_page)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      page === (i + 1) ? 'bg-[#00236F] text-white' : 'bg-[#fafafa] text-[#a3a3a3] hover:text-[#00236F]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateAspirasiModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, color, icon, bg = 'bg-white' }) {
  return (
    <div className={`${bg} rounded-2xl border ${color} p-4 flex items-center gap-3 shadow-sm`}>
      <div className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-xl flex items-center justify-center border border-inherit shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-black text-[#171717] leading-none mb-0.5">{value}</h4>
        <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  const styles = {
    fakultas: 'bg-[#EAF1FF] text-[#0B4FAE] border-[#C9D8FF]',
    universitas: 'bg-[#EEF4FF] text-[#1D4E9E] border-[#D5E2FF]',
    selesai: 'bg-gray-50 text-gray-400 border-gray-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles[level] || styles.selesai}`}>
      {level === 'selesai' ? 'Tutup' : level}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    menunggu: 'bg-gray-100 text-gray-500 border-gray-200',
    diproses: 'bg-[#EEF4FF] text-[#1D4E9E] border-[#D5E2FF]',
    ditindaklanjuti: 'bg-[#EAF1FF] text-[#0B4FAE] border-[#C9D8FF]',
    selesai: 'bg-green-50 text-green-600 border-green-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles[status] || styles.menunggu}`}>
      {status}
    </span>
  );
}

const getCategoryStyle = (cat) => {
  return categories.find(c => c.id === cat)?.color || 'bg-gray-50 text-gray-500';
};

function CreateAspirasiModal({ onClose }) {
  const [formData, setFormData] = useState({
    kategori: 'Akademik',
    judul: '',
    isi: '',
    is_anonim: false,
    lampiran: null
  });
  
  const createMutation = useCreateVoiceMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.judul.length > 150) return toast.error('Judul terlalu panjang');
    if (formData.isi.length < 50) return toast.error('Isi aspirasi minimal 50 karakter');

    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('kategori', formData.kategori);
    data.append('isi', formData.isi);
    data.append('is_anonim', formData.is_anonim);
    if (formData.lampiran) {
      data.append('lampiran', formData.lampiran);
    }

    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Aspirasi berhasil dikirim! 🎉');
        onClose();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal mengirim aspirasi')
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#00236F]/45 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 md:p-6 border-b border-[#f5f5f5] flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-black font-headline tracking-tight">Sampaikan Aspirasimu</h3>
            <p className="text-sm font-bold text-[#a3a3a3] uppercase mt-1">Gunakan kata-kata yang bijak & membangun</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-[#a3a3a3] hover:text-[#00236F]"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Category Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Pilih Kategori</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, kategori: cat.id })}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all border ${
                    formData.kategori === cat.id 
                    ? 'border-[#00236F] bg-[#EAF1FF] text-[#00236F] shadow-sm' 
                    : 'border-[#e5e5e5] text-[#a3a3a3] hover:border-[#00236F] hover:text-[#00236F]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Judul */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Judul / Ringkasan</label>
                <span className={`text-[10px] font-black uppercase ${formData.judul.length > 150 ? 'text-red-500' : 'text-[#a3a3a3]'}`}>
                  {formData.judul.length} / 150
                </span>
              </div>
                <input 
                  type="text" 
                  placeholder="Tuliskan inti dari aspirasimu..."
                  className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-bold text-base focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all"
                  value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
              />
            </div>

            {/* Isi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Detail Aspirasi Lengkap</label>
                <span className={`text-[10px] font-black uppercase ${formData.isi.length < 50 && formData.isi.length > 0 ? 'text-[#0B4FAE]' : 'text-[#a3a3a3]'}`}>
                  {formData.isi.length < 50 ? `Kurang ${50 - formData.isi.length} karakter` : 'Minimal 50 terpenuhi ✓'}
                </span>
              </div>
              <textarea 
                rows={6}
                placeholder="Ceritakan secara detail aspirasi, saran, atau keluhan kamu..."
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xl font-medium text-sm md:text-base focus:outline-none focus:border-[#00236F] focus:ring-4 focus:ring-[#00236F]/10 transition-all resize-none"
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                required
              />
            </div>

            {/* Upload & Anonim Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Unggah Lampiran (Opsional)</label>
                <div className="relative group/upload">
                  <input 
                    type="file" 
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border border-dashed border-[#e5e5e5] rounded-xl group-hover/upload:border-[#00236F] transition-all">
                    <span className="text-sm font-bold text-[#a3a3a3] truncate">
                      {formData.lampiran ? formData.lampiran.name : 'Pilih File (Max 5MB)'}
                    </span>
                    <Upload size={18} className="text-[#a3a3a3] group-hover/upload:text-[#00236F]" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Status Pengiriman</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, is_anonim: !formData.is_anonim })}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all ${
                    formData.is_anonim ? 'bg-[#00236F] border-[#00236F] text-white' : 'bg-[#fafafa] border-[#e5e5e5] text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${formData.is_anonim ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                      <User size={18} className={formData.is_anonim ? 'text-white' : 'text-[#a3a3a3]'} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wide">Kirim Anonim?</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.is_anonim ? 'bg-[#93B4FF]' : 'bg-[#d4d4d4]'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_anonim ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            {formData.is_anonim && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-[#EAF1FF] border border-[#C9D8FF] rounded-xl flex gap-3"
              >
                <ShieldAlert size={18} className="text-[#0B4FAE] shrink-0" />
                <p className="text-[10px] font-bold text-[#0B4FAE] leading-relaxed uppercase">
                  Data pengirim akan disembunyikan dari pihak Admin Fakultas/Universitas, namun tetap tercatat secara internal demi keamanan sistem. Tindak lanjut yang memerlukan konfirmasi langsung mungkin tidak dapat diproses jika Anda anonim.
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-[#e5e5e5] text-[#a3a3a3] font-black rounded-xl hover:bg-[#fafafa] hover:text-[#00236F] hover:border-[#00236F] transition-all uppercase tracking-wide text-xs"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || formData.judul === '' || formData.isi.length < 50}
              className="flex-[2] py-3 bg-[#00236F] text-white font-black rounded-xl hover:bg-[#0B4FAE] transition-all shadow-md shadow-[#00236F]/20 text-sm uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Kirim Aspirasi <CheckCircle2 size={20} /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
