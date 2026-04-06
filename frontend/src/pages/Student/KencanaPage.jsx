import React, { useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  useKencanaProgressQuery,
  useGenerateSertifikatMutation,
  useBandingQuery,
  useAjukanBandingMutation,
} from '../../queries/useKencanaQuery';
import {
  GraduationCap, CheckCircle2, FileText, PlayCircle, Award, XCircle,
  Download, AlertCircle, ChevronRight, Clock, Trophy, BookOpen,
  Upload, X, Info, Loader2, AlertTriangle, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardGridSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';

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
  berlangsung: { label: 'Berlangsung', color: 'text-[#00236F]', bg: 'bg-[#eef4ff]', border: 'border-[#c9d8ff]' },
  selesai: { label: 'Selesai ✓', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]' },
};
const KUIS_STATUS_CONFIG = {
  belum_dikerjakan: { label: 'Belum Dikerjakan', color: 'text-[#a3a3a3]', bg: 'bg-[#f5f5f5]' },
  lulus: { label: 'Lulus', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]' },
  tidak_lulus: { label: 'Tidak Lulus', color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]' },
};
const KESELURUHAN_STATUS = {
  belum_mulai: { label: 'Belum Mulai', color: 'text-[#a3a3a3]', bg: 'bg-[#f5f5f5]', border: 'border-[#e5e5e5]' },
  berlangsung: { label: 'Sedang Berlangsung', color: 'text-[#00236F]', bg: 'bg-[#eef4ff]', border: 'border-[#c9d8ff]' },
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
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Pilih Kuis */}
          <div>
            <label className="block text-sm font-bold text-[#171717] mb-2">Kuis yang Ingin Dibanding *</label>
            <select
              value={selectedKuisId}
              onChange={e => setSelectedKuisId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10"
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
              <p className="text-2xl font-black text-[#00236F]">{selectedKuis.nilai}</p>
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
              className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm font-medium focus:outline-none focus:border-[#00236F] focus:ring-2 focus:ring-[#00236F]/10 resize-none"
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
                <FileText size={20} className="text-[#00236F] shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-[#a3a3a3] hover:text-[#dc2626]">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#e5e5e5] rounded-xl text-sm font-bold text-[#a3a3a3] hover:border-[#00236F] hover:text-[#00236F] transition-colors"
              >
                <Upload size={18} /> Pilih File (JPG, PNG, PDF)
              </button>
            )}
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#00236F] border-[#d4d4d4] rounded focus:ring-[#00236F]" />
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
              className="flex-1 py-3 rounded-2xl bg-[#00236F] text-white font-bold hover:bg-[#0B4FAE] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {ajukanBanding.isPending ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</> : 'Kirim Banding'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function KencanaPage() {
  const navigate = useNavigate();
  const mahasiswa = useAuthStore(state => state.mahasiswa) || {};
  const [showBandingModal, setShowBandingModal] = useState(false);
  const [activeTahap, setActiveTahap] = useState(null);
  const tahapRefs = useRef({});

  const { data: progressData, isLoading } = useKencanaProgressQuery();
  const generateCertMutation = useGenerateSertifikatMutation();
  const { data: bandingList } = useBandingQuery();

  const handleGenerateSertifikat = () => {
    generateCertMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success('Sertifikat berhasil dibuat!');
        window.open(data.file_url, '_blank');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Gagal membuat sertifikat');
      },
    });
  };

  const scrollToTahap = (tahapId) => {
    setActiveTahap(tahapId);
    tahapRefs.current[tahapId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nilaiKumulatif = progressData?.nilai_kumulatif ?? 0;
  const statusKeseluruhan = progressData?.status_keseluruhan ?? 'belum_mulai';
  const statusCfg = KESELURUHAN_STATUS[statusKeseluruhan] ?? KESELURUHAN_STATUS.belum_mulai;
  const totalKuis = progressData?.total_kuis ?? 0;
  const kuisSelesai = progressData?.kuis_selesai ?? 0;
  const progressPct = totalKuis > 0 ? Math.round((kuisSelesai / totalKuis) * 100) : 0;
  const hasSertifikat = progressData?.has_sertifikat;
  const eligibleSertifikat = progressData?.eligible_sertifikat;

  // Banding check
  const activeBanding = bandingList?.filter(b => b.status === 'menunggu' || b.status === 'diproses') || [];
  const hasWorkedKuis = kuisSelesai > 0;
  const canAjukanBanding = hasWorkedKuis && activeBanding.length === 0;

  const BANDING_STATUS_CFG = {
    menunggu: { label: 'Menunggu Review', color: 'text-[#d97706]', bg: 'bg-[#fffbeb]', border: 'border-[#fcd34d]' },
    diproses: { label: 'Sedang Diproses', color: 'text-[#2563eb]', bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]' },
    diterima: { label: 'Diterima — Nilai Diperbarui', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]' },
    ditolak: { label: 'Ditolak', color: 'text-[#dc2626]', bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]' },
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 bg-[#fafafa] min-h-screen space-y-8">
        <div className="h-10 w-64 bg-[#e5e5e5] rounded-full animate-pulse" />
        <div className="h-52 rounded-3xl bg-[#e5e5e5] animate-pulse" />
        <CardGridSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa] pb-16">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8">
        <NavLink to="/student/dashboard" className="hover:text-[#00236F] transition-colors">Dashboard</NavLink>
        <ChevronRight size={16} />
        <span className="text-[#171717]">KENCANA</span>
      </div>

      {/* ===== HERO: NILAI KUMULATIF ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm overflow-hidden mb-6"
      >
        <div className="bg-gradient-to-r from-[#00236F] to-[#0B4FAE] p-4 md:p-5 text-white">
          <div className="flex items-center gap-2.5 mb-1">
            <GraduationCap size={20} />
            <h1 className="text-lg md:text-xl font-black font-headline tracking-wide uppercase">KENCANA — Program Pengenalan Kampus</h1>
          </div>
          <p className="text-[#dbe7ff] text-xs md:text-sm">Portal orientasi mahasiswa baru untuk memahami kampus, layanan, dan budaya akademik BKU.</p>
        </div>

        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-5">
          {/* Left — Progress + Nilai */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#525252]">{kuisSelesai} dari {totalKuis} Kuis Selesai</span>
              <span className="text-sm font-black text-[#00236F]">{progressPct}%</span>
            </div>
            <div className="h-3 bg-[#f5f5f5] rounded-full overflow-hidden mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#00236F] to-[#0B4FAE] rounded-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest mb-1">Nilai Kumulatif</p>
                <p className={`text-4xl md:text-5xl font-black ${nilaiKumulatif >= 75 ? 'text-[#16a34a]' : nilaiKumulatif > 0 ? 'text-[#00236F]' : 'text-[#d4d4d4]'}`}>
                  {nilaiKumulatif.toFixed(1)}
                </p>
                <p className="text-xs text-[#a3a3a3] font-medium">/ 100 poin</p>
              </div>
              <div className={`px-4 py-2 rounded-full border text-sm font-black ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                {statusCfg.label}
              </div>
            </div>

            {hasSertifikat && (
              <p className="text-xs text-[#a3a3a3] font-medium mt-3">
                No. Sertifikat: <strong className="text-[#171717]">{progressData?.nomor_sertifikat}</strong>
              </p>
            )}
          </div>

          {/* Right — Actions */}
          <div className="flex flex-col gap-2.5 min-w-[190px]">
            {eligibleSertifikat ? (
              <button
                onClick={handleGenerateSertifikat}
                disabled={generateCertMutation.isPending}
                className="flex items-center justify-center gap-2 bg-[#00236F] hover:bg-[#0B4FAE] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-70"
              >
                {generateCertMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {hasSertifikat ? 'Unduh Sertifikat' : 'Generate Sertifikat'}
              </button>
            ) : (
              <button disabled className="flex items-center justify-center gap-2 bg-[#f5f5f5] text-[#a3a3a3] px-6 py-3.5 rounded-2xl font-bold cursor-not-allowed border border-[#e5e5e5]">
                <Award size={18} /> Sertifikat (Terkunci)
              </button>
            )}
            {canAjukanBanding && (
              <button
                onClick={() => setShowBandingModal(true)}
                className="flex items-center justify-center gap-2 bg-white border-2 border-[#e5e5e5] text-[#525252] hover:border-[#00236F] hover:text-[#00236F] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
              >
                <AlertCircle size={18} /> Ajukan Banding
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ===== TIMELINE STEPPER ===== */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-sm p-4 md:p-5 mb-6">
        <h2 className="text-sm font-black text-[#a3a3a3] uppercase tracking-widest mb-6">Timeline 3 Tahap KENCANA</h2>
        <div className="flex flex-col md:flex-row gap-4 md:gap-0">
          {progressData?.tahaps?.map((tahap, idx) => {
            const cfg = TAHAP_STATUS_CONFIG[tahap.status] ?? TAHAP_STATUS_CONFIG.akan_datang;
            const isLast = idx === progressData.tahaps.length - 1;
            const pct = tahap.total_kuis > 0 ? Math.round((tahap.kuis_selesai / tahap.total_kuis) * 100) : 0;
            return (
              <React.Fragment key={tahap.tahap_id}>
                <button
                  onClick={() => scrollToTahap(tahap.tahap_id)}
                  className={`flex-1 p-3.5 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                    activeTahap === tahap.tahap_id ? 'border-[#00236F] bg-[#eef4ff]' : `${cfg.border} ${cfg.bg} hover:border-[#00236F]`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>Tahap {idx + 1}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                  </div>
                  <h3 className="font-black text-[#171717] mb-1">{tahap.label}</h3>
                  {tahap.tanggal_mulai && (
                    <p className="text-xs text-[#a3a3a3] font-medium flex items-center gap-1 mb-3">
                      <Clock size={11} />
                      {formatTanggal(tahap.tanggal_mulai, { day: 'numeric', month: 'short' })} — {formatTanggal(tahap.tanggal_selesai)}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#525252]">{tahap.kuis_selesai}/{tahap.total_kuis} kuis</span>
                    <span className="text-xs font-bold text-[#00236F]">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00236F] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </button>
                {!isLast && (
                  <div className="hidden md:flex items-center justify-center px-2">
                    <ChevronRight size={20} className="text-[#d4d4d4]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ===== MATERI PER TAHAP ===== */}
      <div className="space-y-10">
        {progressData?.tahaps?.length > 0 ? (
          progressData.tahaps.map((tahap, tahapIdx) => {
            const cfg = TAHAP_STATUS_CONFIG[tahap.status] ?? TAHAP_STATUS_CONFIG.akan_datang;
            return (
              <div
                key={tahap.tahap_id}
                ref={el => tahapRefs.current[tahap.tahap_id] = el}
                className="scroll-mt-20"
              >
                {/* Sub-header Tahap */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`px-4 py-2 rounded-xl border font-black text-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    Tahap {tahapIdx + 1}: {tahap.label}
                  </div>
                  {tahap.tanggal_mulai && (
                    <span className="text-xs text-[#a3a3a3] font-medium">
                      {formatTanggal(tahap.tanggal_mulai, { day: 'numeric', month: 'short' })} — {formatTanggal(tahap.tanggal_selesai)}
                    </span>
                  )}
                  <div className="flex-1 h-px bg-[#e5e5e5]" />
                </div>

                {tahap.materis?.length === 0 ? (
                  <EmptyState icon="BookOpen" title="Belum Ada Materi" description="Materi untuk tahap ini belum tersedia." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tahap.materis?.map((materi, idx) => {
                      const kuis = materi.kuis;
                      const kuisCfg = kuis ? (KUIS_STATUS_CONFIG[kuis.status] ?? KUIS_STATUS_CONFIG.belum_dikerjakan) : null;
                      return (
                        <motion.div
                          key={materi.materi_id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-2xl border border-[#e5e5e5] hover:border-[#c9d8ff] hover:shadow-md transition-all duration-300 flex flex-col"
                        >
                          {/* Card Header */}
                          <div className="p-4 flex-1">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <span className="text-xs font-black text-[#00236F] bg-[#eef4ff] px-2.5 py-1 rounded-lg border border-[#c9d8ff]">
                                Modul {idx + 1}
                              </span>
                              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                                materi.tipe === 'PDF' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                              }`}>
                                {materi.tipe === 'PDF' ? <FileText size={12} /> : <PlayCircle size={12} />}
                                {materi.tipe}
                              </span>
                            </div>
                            <h3 className="font-black text-[#171717] text-sm md:text-base leading-snug mb-2">{materi.judul}</h3>
                            <p className="text-[11px] text-[#737373] mb-2.5 leading-relaxed">
                              Pelajari materi ini terlebih dahulu, lalu kerjakan kuis untuk menambah progres tahap.
                            </p>
                            <a
                              href={materi.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00236F] hover:underline"
                            >
                              {materi.tipe === 'PDF' ? <FileText size={12} /> : <PlayCircle size={12} />}
                              Buka Materi
                            </a>
                          </div>

                          {/* Kuis Section */}
                          {kuis && (
                            <div className="border-t border-[#f5f5f5] p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[#a3a3a3] uppercase tracking-wider">Status Kuis</span>
                                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${kuisCfg.bg} ${kuisCfg.color}`}>
                                  {kuis.status === 'lulus' ? `Nilai: ${kuis.nilai_terbaik.toFixed(0)}` : kuisCfg.label}
                                </span>
                              </div>

                              {kuis.status === 'belum_dikerjakan' ? (
                                <div className="space-y-2">
                                  <button
                                    onClick={() => navigate(`/student/kencana/kuis/${kuis.kuis_id}`)}
                                    className="w-full bg-[#00236F] hover:bg-[#0B4FAE] text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
                                  >
                                    Kerjakan Kuis
                                  </button>
                                  <p className="text-[11px] text-[#737373]">
                                    Rekomendasi: selesaikan kuis sekarang untuk membuka progres tahap berikutnya.
                                  </p>
                                </div>
                              ) : kuis.status === 'lulus' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-[#16a34a]">
                                    <CheckCircle2 size={16} /> Lulus (Nilai: {kuis.nilai_terbaik.toFixed(0)})
                                  </div>
                                  <button
                                    onClick={() => navigate(`/student/kencana/kuis/${kuis.kuis_id}`)}
                                    className="w-full bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#525252] py-2 rounded-xl text-xs font-bold transition-colors"
                                  >
                                    Ulangi Kuis
                                  </button>
                                  <p className="text-[11px] text-[#737373]">Kamu sudah aman. Ulangi hanya jika ingin nilai lebih baik.</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-[#dc2626]">
                                    <XCircle size={16} /> Tidak Lulus (Nilai: {kuis.nilai_terbaik.toFixed(0)})
                                  </div>
                                  <button
                                    onClick={() => navigate(`/student/kencana/kuis/${kuis.kuis_id}`)}
                                    className="w-full bg-[#00236F] hover:bg-[#0B4FAE] text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
                                  >
                                    Coba Lagi
                                  </button>
                                  <p className="text-[11px] text-[#737373]">Tips: baca ulang materi, fokus ke soal dengan bobot tinggi.</p>
                                </div>
                              )}

                              <p className="text-xs text-[#a3a3a3] mt-2">
                                Bobot: <strong className="text-[#525252]">{kuis.bobot_persen}%</strong> dari nilai total
                                {kuis.jumlah_attempt > 0 && ` · ${kuis.jumlah_attempt}x dikerjakan`}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <EmptyState icon="GraduationCap" title="Belum Ada Data KENCANA" description="Program KENCANA belum tersedia saat ini. Hubungi admin kemahasiswaan." />
        )}
      </div>

      {/* ===== FORM BANDING ===== */}
      {hasWorkedKuis && canAjukanBanding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl border-2 border-dashed border-[#c9d8ff] p-5 md:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#eef4ff] flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-[#00236F]" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-[#171717] text-base md:text-lg mb-1">Pengajuan Banding</h3>
              <p className="text-xs md:text-sm font-medium text-[#737373] mb-3 leading-relaxed">
                Jika kamu merasa ada kesalahan dalam penilaian kuis, kamu dapat mengajukan banding dalam waktu <strong>3×24 jam</strong> setelah kuis dikerjakan.
              </p>
              <button
                onClick={() => setShowBandingModal(true)}
                className="inline-flex items-center gap-2 bg-[#00236F] hover:bg-[#0B4FAE] text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
              >
                <AlertCircle size={16} /> Ajukan Banding
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== STATUS BANDING AKTIF ===== */}
      {bandingList && bandingList.length > 0 && (
        <div className="mt-10 space-y-4">
          <h2 className="font-black text-[#171717] flex items-center gap-2">
            <Info size={18} className="text-[#00236F]" /> Status Banding
          </h2>
          {bandingList.map(banding => {
            const cfg = BANDING_STATUS_CFG[banding.status] ?? BANDING_STATUS_CFG.menunggu;
            return (
              <div key={banding.id} className={`bg-white rounded-2xl border-2 p-5 ${cfg.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-[#a3a3a3] font-bold uppercase tracking-widest">
                      Banding #{banding.id} · {banding.kuis?.judul || 'Kuis'}
                    </p>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-[#525252] font-medium">{banding.alasan}</p>
                {banding.status === 'ditolak' && banding.catatan_admin && (
                  <div className="mt-3 p-3 bg-[#fef2f2] rounded-xl border border-[#fecaca] text-sm text-[#dc2626] font-medium">
                    <strong>Alasan Penolakan:</strong> {banding.catatan_admin}
                  </div>
                )}
                {banding.status === 'diterima' && (
                  <div className="mt-3 p-3 bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] text-sm text-[#16a34a] font-medium flex items-center gap-2">
                    <CheckCheck size={16} /> Nilai kuis telah diperbarui. Nilai kumulatif ikut ter-update.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Banding Modal */}
      <AnimatePresence>
        {showBandingModal && (
          <BandingModal onClose={() => setShowBandingModal(false)} progressData={progressData} />
        )}
      </AnimatePresence>
    </div>
  );
}
