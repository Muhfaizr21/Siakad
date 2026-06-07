import React, { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  useVoiceStatsQuery, 
  useVoiceListQuery, 
  useCreateVoiceMutation,
  useCancelVoiceMutation
} from '../../queries/useStudentVoiceQuery';
import { PageContent, PageHeader } from '@/components/ui/page';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import { Link, NavLink } from 'react-router-dom';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HelpCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>help</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Filter = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>filter_alt</span>;
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



const categories = [
  { id: 'Akademik', label: 'Akademik', color: 'bg-primary/10 text-primary border-primary/20' },
  { id: 'Fasilitas', label: 'Fasilitas', color: 'bg-secondary/10 text-secondary border-secondary/20' },
  { id: 'Kemahasiswaan', label: 'Kemahasiswaan', color: 'bg-success/10 text-success border-success/20' },
  { id: 'Saran & Ide', label: 'Saran & Ide', color: 'bg-info/10 text-info border-info/20' },
  { id: 'Lainnya', label: 'Lainnya', color: 'bg-surface text-text-muted border-border' },
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
    <PageContent className="font-body">
      <PageHeader 
        title="Suara Mahasiswa"
        subtitle="Sampaikan aspirasi, saran, dan pengaduanmu kepada kampus untuk BKU yang lebih baik."
        icon="chat"
        breadcrumbs={[
          { label: 'Dashboard', path: '/student/dashboard' },
          { label: 'Suara Mahasiswa', path: '/student/voice' }
        ]}
        action={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--theme-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-[var(--theme-primary)]/20 text-sm group"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300" style={{ fontSize: '18px' }}>add</span>
            Sampaikan Aspirasi Baru
          </button>
        }
      />

      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isStatsLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <StatCard label="Total Diajukan" value={stats?.total || 0} color="border-border" icon={<span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '18px' }} >chat</span>} bg="bg-surface" />
              <StatCard label="Di Fakultas" value={stats?.di_fakultas || 0} color="border-primary/20" icon={<span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '18px' }} >schedule</span>} bg="bg-primary/5" />
              <StatCard label="Di Universitas" value={stats?.di_universitas || 0} color="border-secondary/20" icon={<span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>security</span>} bg="bg-secondary/5" />
              <StatCard label="Selesai" value={stats?.selesai || 0} color="border-success/20" icon={<span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }} >check_circle</span>} bg="bg-success/5" />
            </>
          )}
        </div>

        {/* List Section */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
          <div className="px-5 md:px-6 py-5 border-b border-border-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black font-headline tracking-tight">Riwayat Aspirasi Kamu</h2>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-[var(--theme-primary)] transition-colors" style={{ fontSize: '18px' }} >search</span>
                <input 
                  type="text" 
                  placeholder="Cari nomor tiket / judul..." 
                  className="pl-12 pr-4 py-2.5 bg-background border border-border text-bku-text rounded-xl text-sm font-semibold focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all w-full md:w-64"
                />
              </div>
              <button className="p-2.5 bg-background border border-border text-text-muted hover:text-[var(--theme-primary)] transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background border-b border-border-muted">
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">Nomor Tiket</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest">Kategori & Judul</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-center">Level Unit</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-5 md:px-6 py-4 text-[11px] font-black text-text-muted uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {isListLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan="5" className="px-5 md:px-6 py-6"><Skeleton className="h-14 w-full rounded-xl" /></td></tr>
                  ))
                ) : listData?.list?.length > 0 ? (
                  listData.list.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-background/85 transition-all duration-300">
                      <td className="px-5 md:px-6 py-5">
                        <div className="font-black text-bku-text">{ticket.nomor_tiket}</div>
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-tighter mt-1">
                          {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 md:px-6 py-5 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${getCategoryStyle(ticket.kategori)}`}>
                            {ticket.kategori}
                          </span>
                          {ticket.is_anonim && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-text-muted uppercase tracking-widest bg-background border border-border px-2 py-0.5 rounded-md">
                              <span className="material-symbols-outlined opacity-40" style={{ fontSize: '10px' }}   strokeWidth={3}>visibility</span> Anonim
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-bku-text truncate">{ticket.judul}</div>
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
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >delete</span>
                            </button>
                          )}
                          <Link 
                            to={`/student/voice/tiket/${ticket.id}`}
                            className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white transition-all shadow-sm"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >arrow_forward</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="bg-background rounded-2xl p-7 border-2 border-dashed border-border inline-block">
                        <HelpCircle size={48} className="mx-auto text-text-muted opacity-50 mb-4" />
                        <h3 className="text-base md:text-lg font-black text-text-muted">Kamu belum pernah mengirim aspirasi.</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {listData?.last_page > 1 && (
            <div className="px-5 md:px-6 py-4 border-t border-border-muted flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted">
                Menampilkan <span className="text-bku-text">{listData.list.length}</span> dari <span className="text-bku-text">{listData.total}</span> data
              </span>
              <div className="flex items-center gap-2">
                {[...Array(listData.last_page)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                      page === (i + 1) ? 'bg-[var(--theme-primary)] text-white' : 'bg-background text-text-muted border border-border hover:text-[var(--theme-primary)]'
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
    </PageContent>
  );
}

function StatCard({ label, value, color, icon, bg = 'bg-surface' }) {
  return (
    <div className={`${bg} rounded-2xl border ${color} p-4 flex items-center gap-3 shadow-sm`}>
      <div className="w-10 h-10 bg-surface/70 backdrop-blur-md rounded-xl flex items-center justify-center border border-inherit shadow-inner">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-black text-bku-text leading-none mb-0.5">{value}</h4>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function LevelBadge({ level }) {
  const styles = {
    fakultas: 'bg-primary/10 text-primary border-primary/20',
    universitas: 'bg-secondary/10 text-secondary border-secondary/20',
    prodi: 'bg-success/10 text-success border-success/20',
    ormawa: 'bg-info/10 text-info border-info/20',
    selesai: 'bg-surface text-text-muted border-border'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles[level] || styles.selesai}`}>
      {level === 'selesai' ? 'Tutup' : level}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'menunggu': 'bg-surface text-text-muted border-border',
    'diproses': 'bg-primary/10 text-primary border-primary/20',
    'ditindaklanjuti': 'bg-info/10 text-info border-info/20',
    'disetujui fakultas': 'bg-success/10 text-success border-success/20',
    'ditolak fakultas': 'bg-error/10 text-error border-error/20',
    'ditolak': 'bg-error/10 text-error border-error/20',
    'proses': 'bg-primary/10 text-primary border-primary/20',
    'ditinjau': 'bg-warning/10 text-warning border-warning/20',
    'selesai': 'bg-success/10 text-success border-success/20'
  };
  const key = (status || 'menunggu').toLowerCase();
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${styles[key] || styles.menunggu}`}>
      {status}
    </span>
  );
}

const getCategoryStyle = (cat) => {
  return categories.find(c => c.id === cat)?.color || 'bg-surface text-text-muted border border-border';
};

function CreateAspirasiModal({ onClose }) {
  const [formData, setFormData] = useState({
    kategori: 'Akademik',
    judul: '',
    isi: '',
    tujuan: 'Fakultas',
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
    data.append('tujuan', formData.tujuan);
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
        className="absolute inset-0 bg-[var(--theme-primary)]/45 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-surface border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-5 md:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl md:text-2xl font-black font-headline tracking-tight text-bku-text">Sampaikan Aspirasimu</h3>
            <p className="text-sm font-bold text-text-muted uppercase mt-1">Gunakan kata-kata yang bijak & membangun</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-background border border-border rounded-xl text-text-muted hover:text-[var(--theme-primary)]"><span className="material-symbols-outlined" style={{ fontSize: '20px' }} >close</span></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Category Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black text-bku-text uppercase tracking-widest ml-1">Pilih Kategori</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, kategori: cat.id })}
                  className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wide transition-all border ${
                    formData.kategori === cat.id 
                    ? 'border-[var(--theme-primary)] bg-primary/10 text-primary shadow-sm' 
                    : 'border-border text-text-muted hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tujuan Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black text-bku-text uppercase tracking-widest ml-1">Tujuan Aspirasi</label>
            <select
              value={formData.tujuan}
              onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border text-bku-text rounded-xl font-bold text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all outline-none"
            >
              <option value="Fakultas">Fakultas</option>
              <option value="Universitas">Universitas</option>
              <option value="Prodi">Program Studi (Prodi)</option>
              <option value="Ormawa">Organisasi Mahasiswa (Ormawa)</option>
            </select>
          </div>

          <div className="space-y-6">
            {/* Judul */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-bku-text uppercase tracking-widest ml-1">Judul / Ringkasan</label>
                <span className={`text-[10px] font-black uppercase ${formData.judul.length > 150 ? 'text-error' : 'text-text-muted'}`}>
                  {formData.judul.length} / 150
                </span>
              </div>
              <input 
                type="text" 
                placeholder="Tuliskan inti dari aspirasimu..."
                className="w-full px-4 py-3 bg-background border border-border text-bku-text rounded-xl font-bold text-base focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                required
              />
            </div>

            {/* Isi */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-bku-text uppercase tracking-widest ml-1">Detail Aspirasi Lengkap</label>
                <span className={`text-[10px] font-black uppercase ${formData.isi.length < 50 && formData.isi.length > 0 ? 'text-primary' : 'text-text-muted'}`}>
                  {formData.isi.length < 50 ? `Kurang ${50 - formData.isi.length} karakter` : 'Minimal 50 terpenuhi ✓'}
                </span>
              </div>
              <textarea 
                rows={6}
                placeholder="Ceritakan secara detail aspirasi, saran, atau keluhan kamu..."
                className="w-full px-4 py-3 bg-background border border-border text-bku-text rounded-xl font-medium text-sm md:text-base focus:outline-none focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all resize-none"
                value={formData.isi}
                onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                required
              />
            </div>

            {/* Upload & Anonim Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-xs font-black text-bku-text uppercase tracking-widest ml-1">Unggah Lampiran (Opsional)</label>
                <div className="relative group/upload">
                  <input 
                    type="file" 
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="flex items-center justify-between px-4 py-3 bg-background border border-dashed border-border rounded-xl group-hover/upload:border-[var(--theme-primary)] transition-all">
                    <span className="text-sm font-bold text-text-muted truncate">
                      {formData.lampiran ? formData.lampiran.name : 'Pilih File (Max 5MB)'}
                    </span>
                    <span className="material-symbols-outlined text-text-muted group-hover/upload:text-[var(--theme-primary)]" style={{ fontSize: '18px' }} >upload</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-bku-text uppercase tracking-widest ml-1">Status Pengiriman</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, is_anonim: !formData.is_anonim })}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all ${
                    formData.is_anonim ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white' : 'bg-background border-border text-bku-text'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${formData.is_anonim ? 'bg-white/20' : 'bg-surface shadow-sm'}`}>
                      <User size={18} className={formData.is_anonim ? 'text-white' : 'text-text-muted'} />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wide">Kirim Anonim?</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${formData.is_anonim ? 'bg-primary/50' : 'bg-border'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-surface rounded-full transition-all ${formData.is_anonim ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            {formData.is_anonim && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3"
              >
                <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '18px' }}>security</span>
                <p className="text-[10px] font-bold text-primary leading-relaxed uppercase">
                  Data pengirim akan disembunyikan dari pihak Admin Fakultas/Universitas, namun tetap tercatat secara internal demi keamanan sistem. Tindak lanjut yang memerlukan konfirmasi langsung mungkin tidak dapat diproses jika Anda anonim.
                </p>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-surface border border-border text-text-muted font-black rounded-xl hover:bg-background hover:text-[var(--theme-primary)] hover:border-[var(--theme-primary)] transition-all uppercase tracking-wide text-xs"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || formData.judul === '' || formData.isi.length < 50}
              className="flex-[2] py-3 bg-[var(--theme-primary)] text-white font-black rounded-xl hover:opacity-90 transition-all shadow-md shadow-[var(--theme-primary)]/20 text-sm uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Kirim Aspirasi <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >check_circle</span></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
