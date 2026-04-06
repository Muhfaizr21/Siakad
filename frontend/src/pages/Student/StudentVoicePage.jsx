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
import { Link } from 'react-router-dom';

const categories = [
  { id: 'Akademik', label: '🎓 Akademik', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { id: 'Fasilitas', label: '🏛️ Fasilitas', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { id: 'Kemahasiswaan', label: '👥 Kemahasiswaan', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'Saran & Ide', label: '💡 Saran & Ide', color: 'bg-green-50 text-green-600 border-green-100' },
  { id: 'Lainnya', label: '💬 Lainnya', color: 'bg-gray-50 text-gray-600 border-gray-100' },
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
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body p-6 md:p-10 transition-all duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8">
        <span className="hover:text-[#f97316] cursor-pointer transition-colors">Dashboard</span>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Suara Mahasiswa</span>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter mb-3 flex items-center gap-4">
              <div className="bg-[#f97316] p-3 rounded-2xl text-white shadow-xl shadow-orange-500/20">
                <MessageSquare size={32} strokeWidth={3} />
              </div>
              Suara Mahasiswa
            </h1>
            <p className="text-[#525252] font-semibold text-lg max-w-xl">
              Sampaikan aspirasi, saran, dan pengaduanmu kepada kampus untuk BKU yang lebih baik.
            </p>
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 px-8 py-5 bg-[#f97316] text-white font-black rounded-3xl hover:bg-[#ea580c] transition-all shadow-2xl shadow-orange-500/30 text-lg group"
          >
            <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            Sampaikan Aspirasi Baru
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isStatsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
          ) : (
            <>
              <StatCard label="Total Diajukan" value={stats?.total || 0} color="border-[#e5e5e5]" icon={<MessageSquare size={20} />} />
              <StatCard label="Di Fakultas" value={stats?.di_fakultas || 0} color="border-[#3b82f6]" icon={<Clock size={20} className="text-[#3b82f6]" />} bg="bg-[#eff6ff]" />
              <StatCard label="Di Universitas" value={stats?.di_universitas || 0} color="border-[#8b5cf6]" icon={<ShieldAlert size={20} className="text-[#8b5cf6]" />} bg="bg-[#f5f3ff]" />
              <StatCard label="Selesai" value={stats?.selesai || 0} color="border-[#16a34a]" icon={<CheckCircle2 size={20} className="text-[#16a34a]" />} bg="bg-[#f0fdf4]" />
            </>
          )}
        </div>

        {/* List Section */}
        <div className="bg-white rounded-[32px] border border-[#e5e5e5] shadow-sm overflow-hidden mb-12">
          <div className="px-10 py-8 border-b border-[#f5f5f5] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-black font-headline tracking-tight">Riwayat Aspirasi Kamu</h2>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a3] group-focus-within:text-[#f97316] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Cari nomor tiket / judul..." 
                  className="pl-12 pr-4 py-3 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-500/5 transition-all w-full md:w-64"
                />
              </div>
              <button className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-[#a3a3a3] hover:text-[#f97316] transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fafafa]/50 border-b border-[#f5f5f5]">
                  <th className="px-10 py-6 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Nomor Tiket</th>
                  <th className="px-10 py-6 text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Kategori & Judul</th>
                  <th className="px-10 py-6 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-center">Level Unit</th>
                  <th className="px-10 py-6 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-center">Status</th>
                  <th className="px-10 py-6 text-xs font-black text-[#a3a3a3] uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {isListLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan="5" className="px-10 py-8"><Skeleton className="h-16 w-full rounded-2xl" /></td></tr>
                  ))
                ) : listData?.list?.length > 0 ? (
                  listData.list.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-[#fafafa]/80 transition-all duration-300">
                      <td className="px-10 py-8">
                        <div className="font-black text-[#171717]">{ticket.nomor_tiket}</div>
                        <div className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-tighter mt-1">
                          {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-sm">
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
                      <td className="px-10 py-8 text-center">
                        <LevelBadge level={ticket.level_saat_ini} />
                      </td>
                      <td className="px-10 py-8 text-center">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {ticket.status === 'menunggu' && ticket.level_saat_ini === 'fakultas' && (
                            <button 
                              onClick={() => handleCancelTicket(ticket.id)}
                              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Batalkan Aspirasi"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <Link 
                            to={`/student/voice/tiket/${ticket.id}`}
                            className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all shadow-sm"
                          >
                            <ArrowRight size={20} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-24 text-center">
                      <div className="bg-[#fafafa] rounded-3xl p-10 border-2 border-dashed border-[#e5e5e5] inline-block">
                        <HelpCircle size={48} className="mx-auto text-[#d4d4d4] mb-4" />
                        <h3 className="text-xl font-black text-[#d4d4d4]">Kamu belum pernah mengirim aspirasi.</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listData?.last_page > 1 && (
            <div className="px-10 py-6 border-t border-[#f5f5f5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#a3a3a3]">
                Menampilkan <span className="text-[#171717]">{listData.list.length}</span> dari <span className="text-[#171717]">{listData.total}</span> data
              </span>
              <div className="flex items-center gap-2">
                {[...Array(listData.last_page)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                      page === (i + 1) ? 'bg-[#171717] text-white' : 'bg-[#fafafa] text-[#a3a3a3] hover:text-[#171717]'
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
    <div className={`${bg} rounded-[32px] border-b-4 ${color} p-8 flex items-center gap-6 shadow-sm`}>
      <div className="w-14 h-14 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-inherit shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-3xl font-black text-[#171717] leading-none mb-1">{value}</h4>
        <p className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  const styles = {
    fakultas: 'bg-blue-50 text-blue-600 border-blue-100',
    universitas: 'bg-purple-50 text-purple-600 border-purple-100',
    selesai: 'bg-gray-50 text-gray-400 border-gray-100'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[level] || styles.selesai}`}>
      {level === 'selesai' ? 'Tutup' : level}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    menunggu: 'bg-gray-100 text-gray-500 border-gray-200',
    diproses: 'bg-orange-50 text-orange-600 border-orange-100',
    ditindaklanjuti: 'bg-blue-50 text-blue-600 border-blue-100',
    selesai: 'bg-green-50 text-green-600 border-green-100'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.menunggu}`}>
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
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-10 border-b border-[#f5f5f5] flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black font-headline tracking-tighter">Sampaikan Aspirasimu</h3>
            <p className="text-sm font-bold text-[#a3a3a3] uppercase mt-1">Gunakan kata-kata yang bijak & membangun</p>
          </div>
          <button onClick={onClose} className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-2xl text-[#a3a3a3] hover:text-[#171717]"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar space-y-10">
          {/* Category Selector */}
          <div className="space-y-4">
            <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Pilih Kategori</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, kategori: cat.id })}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                    formData.kategori === cat.id 
                    ? 'border-[#f97316] bg-orange-50 text-[#f97316] shadow-lg shadow-orange-500/10' 
                    : 'border-[#e5e5e5] text-[#a3a3a3] hover:border-[#f97316]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
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
                className="w-full px-6 py-4 bg-[#fafafa] border border-[#e5e5e5] rounded-3xl font-bold text-lg focus:outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-500/5 transition-all"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
              />
            </div>

            {/* Isi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Detail Aspirasi Lengkap</label>
                <span className={`text-[10px] font-black uppercase ${formData.isi.length < 50 && formData.isi.length > 0 ? 'text-orange-500' : 'text-[#a3a3a3]'}`}>
                  {formData.isi.length < 50 ? `Kurang ${50 - formData.isi.length} karakter` : 'Minimal 50 terpenuhi ✓'}
                </span>
              </div>
              <textarea 
                rows={6}
                placeholder="Ceritakan secara detail aspirasi, saran, atau keluhan kamu..."
                className="w-full px-6 py-4 bg-[#fafafa] border border-[#e5e5e5] rounded-3xl font-medium text-base focus:outline-none focus:border-[#f97316] focus:ring-4 focus:ring-orange-500/5 transition-all resize-none"
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                required
              />
            </div>

            {/* Upload & Anonim Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Unggah Lampiran (Opsional)</label>
                <div className="relative group/upload">
                  <input 
                    type="file" 
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex items-center justify-between px-6 py-4 bg-[#fafafa] border border-dashed border-[#e5e5e5] rounded-3xl group-hover/upload:border-[#f97316] transition-all">
                    <span className="text-sm font-bold text-[#a3a3a3] truncate">
                      {formData.lampiran ? formData.lampiran.name : 'Pilih File (Max 5MB)'}
                    </span>
                    <Upload size={20} className="text-[#a3a3a3] group-hover/upload:text-[#f97316]" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#171717] uppercase tracking-widest ml-1">Status Pengiriman</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, is_anonim: !formData.is_anonim })}
                  className={`flex items-center justify-between w-full px-6 py-4 rounded-3xl border-2 transition-all ${
                    formData.is_anonim ? 'bg-black border-black text-white' : 'bg-[#fafafa] border-[#e5e5e5] text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${formData.is_anonim ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                      <User size={18} className={formData.is_anonim ? 'text-white' : 'text-[#a3a3a3]'} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest">Kirim Anonim?</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.is_anonim ? 'bg-[#f97316]' : 'bg-[#d4d4d4]'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_anonim ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            {formData.is_anonim && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="p-5 bg-orange-50 border border-orange-100 rounded-[24px] flex gap-4"
              >
                <ShieldAlert size={20} className="text-[#f97316] shrink-0" />
                <p className="text-[10px] font-bold text-orange-800/60 leading-relaxed uppercase">
                  Data pengirim akan disembunyikan dari pihak Admin Fakultas/Universitas, namun tetap tercatat secara internal demi keamanan sistem. Tindak lanjut yang memerlukan konfirmasi langsung mungkin tidak dapat diproses jika Anda anonim.
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 bg-white border-2 border-[#e5e5e5] text-[#a3a3a3] font-black rounded-3xl hover:bg-[#fafafa] hover:text-[#171717] hover:border-[#171717] transition-all uppercase tracking-widest text-xs"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || formData.judul === '' || formData.isi.length < 50}
              className="flex-[2] py-5 bg-[#171717] text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl shadow-black/20 text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
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
