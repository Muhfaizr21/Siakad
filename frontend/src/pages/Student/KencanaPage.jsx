import React from 'react';
import { Link } from 'react-router-dom';
import { useKencanaDashboardQuery } from '../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, MetricCard, PrimaryButton, ProgressBar, StatusBadge } from './Kencana/components';

import { motion, AnimatePresence } from 'framer-motion';
import { CardGridSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const PlayCircle = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>play_circle</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Info = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const Award = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>emoji_events</span>;



// Native date formatter (no date-fns needed)
const formatTanggal = (dateStr, opts = {}) => {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', ...opts }).format(new Date(dateStr));
  } catch { return dateStr; }
};

// ======================== STATUS CONFIG ========================
const TAHAP_STATUS_CONFIG = {
  akan_datang: { label: 'Akan Datang', color: 'text-[#a3a3a3]', bg: 'bg-[#f5f5f5]', border: 'border-[#e5e5e5]' },
  berlangsung: { label: 'Berlangsung', color: 'text-bku-primary', bg: 'bg-[#eef4ff]', border: 'border-[#c9d8ff]' },
  selesai: { label: 'Selesai ✓', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]' },
};
const KUIS_STATUS_CONFIG = {
  belum_dikerjakan: { label: 'Belum Dikerjakan', color: 'text-[#a3a3a3]', bg: 'bg-[#f5f5f5]' },
  lulus: { label: 'Lulus', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]' },
  tidak_lulus: { label: 'Tidak Lulus', color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]' },
};
const KESELURUHAN_STATUS = {
  belum_mulai: { label: 'Belum Mulai', color: 'text-[#a3a3a3]', bg: 'bg-[#f5f5f5]', border: 'border-[#e5e5e5]' },
  berlangsung: { label: 'Sedang Berlangsung', color: 'text-bku-primary', bg: 'bg-[#eef4ff]', border: 'border-[#c9d8ff]' },
  lulus: { label: 'Lulus ✓', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]' },
  tidak_lulus: { label: 'Tidak Lulus', color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]' },
};

// ======================== BANDING MODAL ========================
function BandingModal({ onClose, progressData }) {
  const [selectedKuisId, setSelectedKuisId] = useState('');
  const [alasan, setAlasan] = useState('');
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const fileInputRef = useRef(null);
  const ajukanBanding = useAjukanBandingMutation();

  // Kumpulkan kuis yang sudah dikerjakan dari semua tahap
  const kuisYangDikerjakan = progressData?.tahaps?.flatMap(t =>
    t.materis?.filter(m => m.kuis && m.kuis.status !== 'belum_dikerjakan').map(m => ({
      id: m.kuis.kuis_id,
      judul: m.kuis.judul_kuis,
      nilai: m.kuis.nilai_terbaik,
      terakhir: m.kuis.terakhir_dikerjakan,
    }))
  ) || [];

  const selectedKuis = kuisYangDikerjakan.find(k => String(k.id) === selectedKuisId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { toast.error('Centang pernyataan terlebih dahulu.'); return; }

    const formData = new FormData();
    formData.append('kuis_id', selectedKuisId);
    formData.append('alasan', alasan);
    if (file) formData.append('bukti_file', file);

    ajukanBanding.mutate(formData, {
      onSuccess: () => {
        toast.success('Banding berhasil diajukan!');
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Gagal mengajukan banding');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#171717] to-[#333] p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Ajukan Banding Kuis</h2>
            <p className="text-sm text-neutral-400 mt-0.5">Batas pengajuan: 72 jam setelah kuis dikerjakan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pilih Kuis */}
          <div>
            <label className="block text-sm font-bold text-[#171717] mb-2">Kuis yang Ingin Dibanding *</label>
            <select
              value={selectedKuisId}
              onChange={e => setSelectedKuisId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-sm font-medium focus:outline-none focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10"
              required
            >
              <option value="">-- Pilih Kuis --</option>
              {kuisYangDikerjakan.map(k => (
                <option key={k.id} value={k.id}>{k.judul} (Nilai: {k.nilai})</option>
              ))}
            </select>
          </div>

          {/* Nilai yang tertera */}
          {selectedKuis && (
            <div className="bg-[#fafafa] rounded-xl p-4 border border-[#e5e5e5]">
              <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest mb-1">Nilai yang Tertera</p>
              <p className="text-2xl font-black text-bku-primary">{selectedKuis.nilai}</p>
            </div>
          )}

          {/* Alasan */}
          <div>
            <label className="block text-sm font-bold text-[#171717] mb-2">
              Alasan Banding * <span className="text-[#a3a3a3] font-normal">(min 50 karakter)</span>
            </label>
            <textarea
              value={alasan}
              onChange={e => setAlasan(e.target.value)}
              placeholder="Jelaskan kenapa kamu merasa nilaimu tidak sesuai..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm font-medium focus:outline-none focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/10 resize-none"
              required
            />
            <p className={`text-xs mt-1 ${alasan.length < 50 ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
              {alasan.length}/50 karakter minimum
            </p>
          </div>

          {/* Upload Bukti */}
          <div>
            <label className="block text-sm font-bold text-[#171717] mb-2">
              Bukti Pendukung <span className="text-[#a3a3a3] font-normal">(opsional, max 5MB)</span>
            </label>
            {file ? (
              <div className="flex items-center gap-3 p-3 bg-[#eef4ff] rounded-xl border border-[#c9d8ff]">
                <span className="material-symbols-outlined text-bku-primary shrink-0" style={{ fontSize: '20px' }} >description</span>
                <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-[#a3a3a3] hover:text-[#dc2626]">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#e5e5e5] rounded-xl text-sm font-bold text-[#a3a3a3] hover:border-bku-primary hover:text-bku-primary transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >upload</span> Pilih File (JPG, PNG, PDF)
              </button>
            )}
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-bku-primary border-[#d4d4d4] rounded focus:ring-bku-primary" />
            <span className="text-sm font-medium text-[#525252] leading-relaxed">
              Saya menyatakan bahwa pengajuan banding ini benar dan dapat dipertanggungjawabkan.
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-[#e5e5e5] font-bold text-[#525252] hover:bg-[#f5f5f5] transition-colors">
              Batal
            </button>
            <button type="submit" disabled={ajukanBanding.isPending || !agreed || alasan.length < 50 || !selectedKuisId}
              className="flex-1 py-3 rounded-2xl bg-bku-primary text-white font-bold hover:bg-[#0B4FAE] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {ajukanBanding.isPending ? <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> Mengirim...</> : 'Kirim Banding'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function KencanaPage() {
  const { data, isLoading, isError } = useKencanaDashboardQuery();

  if (isLoading) return <KencanaShell title="Dashboard Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Dashboard Kencana"><ErrorPanel message="Gagal memuat dashboard Kencana." /></KencanaShell>;

  const blockers = data?.blockers || [];
  const notifications = data?.notifications || [];

  return (
    <KencanaShell
      title="Dashboard Kencana"
      subtitle="Pantau seluruh tahapan orientasi, pembinaan, nilai, remedial, dan sertifikat Kencana dari satu tempat."
      actions={<PrimaryButton to="/student/kencana/timeline">Lihat Timeline <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span></PrimaryButton>}
    >
      <section className="overflow-hidden rounded-[2rem] border border-[#d8c9ad] bg-[#1d1b16] text-white shadow-xl">
        <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d8a84f]">{data?.period?.name || 'Kencana'}</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Status: {data?.graduation_status ? <span>{data.graduation_status.replaceAll('_', ' ')}</span> : 'Belum Mulai'}</h2>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-[#e8dfcf]">Tahap aktif: {data?.active_stage?.name || 'Menunggu jadwal admin'}. Timeline, sesi, quiz, dan tugas mengikuti data yang dipublish pengelola.</p>
            <div className="mt-6 max-w-xl">
              <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-[#e8dfcf]"><span>Progress Total</span><span>{data?.progress_total || 0}%</span></div>
              <ProgressBar value={data?.progress_total || 0} />
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d8a84f]">Nilai Akhir Sementara</p>
            <p className="mt-3 text-6xl font-black">{Number(data?.temporary_final_score || 0).toFixed(1)}</p>
            <div className="mt-4"><StatusBadge status={data?.graduation_status} /></div>
            <p className="mt-4 text-sm font-semibold text-[#e8dfcf]">{data?.needs_remedial ? 'Ada komponen yang perlu diperbaiki.' : 'Tidak ada remedial aktif saat ini.'}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Periode" value={data?.period?.year || '-'} hint={data?.period?.name} icon="calendar_month" />
        <MetricCard label="Progress" value={`${data?.progress_total || 0}%`} hint="Sesi dan materi selesai" icon="trending_up" />
        <MetricCard label="Nilai" value={Number(data?.temporary_final_score || 0).toFixed(1)} hint="Bobot 25/35/40" icon="grade" />
        <MetricCard label="Remedial" value={data?.needs_remedial ? 'Perlu' : 'Tidak'} hint="Berdasarkan status saat ini" icon="rule" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h3 className="text-xl font-black">Lanjutkan Kegiatan</h3>
          {data?.last_activity?.id ? (
            <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#f7f1e5] p-5 md:flex-row md:items-center md:justify-between">
              <div>