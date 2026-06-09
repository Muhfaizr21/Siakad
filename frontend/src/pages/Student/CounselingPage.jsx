import React, { useState, useEffect } from 'react';

import { 
  useCounselingJadwalQuery, 
  useCounselingRiwayatQuery, 
  useBookingMutation, 
} from '../../queries/useCounselingQuery';
import { PageContent, PageHeader } from '@/components/ui/page';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { CardGridSkeleton } from '@/components/ui/SkeletonGroups';
import EmptyState from '@/components/ui/EmptyState';
import { toast, Toaster } from 'react-hot-toast';
import { NavLink } from 'react-router-dom';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const HeartHandshake = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>volunteer_activism</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;
const Icon = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;
const Sparkles = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>auto_awesome</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BookOpen = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>menu_book</span>;
const Briefcase = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>work</span>;
const Heart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;



const formatLongDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
};

const TIPE_CONFIG = {
  Akademik:  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500', label: 'Akademik' },
  Karir:     { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500', label: 'Psikologi' },
  Personal:  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500', label: 'Psikologi' },
  Psikologi: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500', label: 'Psikologi' },
};

export default function CounselingPage() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [keluhan, setKeluhan] = useState('');
  const [mode, setMode] = useState('Tatap Muka');
  const [topik, setTopik] = useState('Psikologi');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [filterTipe, setFilterTipe] = useState('Semua');

  const { data: jadwal, isLoading: isJadwalLoading } = useCounselingJadwalQuery();
  const { data: riwayat } = useCounselingRiwayatQuery();
  const bookingMutation = useBookingMutation();

  const totalSlot     = jadwal?.length ?? 0;
  const totalRiwayat  = riwayat?.length ?? 0;
  const totalMenunggu = riwayat?.filter(r => r.status === 'Menunggu').length ?? 0;
  const totalMedicalRecords = riwayat?.reduce((total, item) => total + Number(item.medical_record_count || 0), 0) ?? 0;

  useEffect(() => {
    if (selectedSlot) {
      const defaultTopic = selectedSlot.Tipe || selectedSlot.Spesialisasi || 'Psikologi';
      if (defaultTopic === 'Personal' || defaultTopic === 'Karir' || defaultTopic === 'Pribadi') {
        setTopik('Psikologi');
      } else if (['Akademik', 'Psikologi'].includes(defaultTopic)) {
        setTopik(defaultTopic);
      } else {
        setTopik('Psikologi');
      }
    }
  }, [selectedSlot]);

  const handleBooking = () => {
    console.log("handleBooking triggered:", { selectedSlot, privacyAgreed, keluhan, topik, mode });
    if (!privacyAgreed) return toast.error('Harap setujui pernyataan privasi');
    if (keluhan.length < 20) return toast.error('Ceritakan topik minimal 20 karakter');

    const payload = {
      psikolog_id: selectedSlot.PsikologID,
      slot_id: selectedSlot.SlotID || selectedSlot.ID,
      date: selectedSlot.Tanggal ? selectedSlot.Tanggal.slice(0, 10) : new Date().toISOString().slice(0, 10),
      start: selectedSlot.JamMulai,
      end: selectedSlot.JamSelesai,
      topic: topik,
      complaint: keluhan,
      mode: mode,
    };

    console.log("Sending booking payload:", payload);

    bookingMutation.mutate(payload, {
      onSuccess: () => { 
        toast.success('Booking berhasil diajukan!'); 
        setSelectedSlot(null); 
        setKeluhan(''); 
        setMode('Tatap Muka');
        setTopik('Psikologi');
        setPrivacyAgreed(false); 
      },
      onError: (err) => {
        console.error("Booking mutation failed:", err);
        toast.error(err.response?.data?.message || 'Gagal melakukan booking');
      },
    });
  };

  const filtered = jadwal?.filter(s => {
    if (filterTipe === 'Semua') return true;
    const mappedTipe = (s.Tipe === 'Personal' || s.Tipe === 'Karir' || s.Tipe === 'Psikologi') ? 'Psikologi' : 'Akademik';
    return mappedTipe === filterTipe;
  }) ?? [];

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" />
      <div className="w-full">

        <PageHeader 
          title="Layanan Konseling Mahasiswa"
          subtitle="Sesi privat bersama psikolog profesional — rahasia, sukarela, dan aman untuk semua mahasiswa."
          icon="volunteer_activism"
          breadcrumbs={[
            { label: 'Dashboard', path: '/student/dashboard' },
            { label: 'Konseling & Wellness', path: '/student/counseling' }
          ]}
          action={
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>security</span> Privasi Terjamin 100%
            </span>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Slot Tersedia', value: totalSlot, icon: 'calendar_month', color: 'border-border', bg: 'bg-surface', text: 'text-[var(--theme-primary)]' },
            { label: 'Total Sesi',    value: totalRiwayat, icon: 'description', color: 'border-primary/20', bg: 'bg-primary/5', text: 'text-[var(--theme-primary)]' },
            { label: 'Menunggu',      value: totalMenunggu, icon: 'schedule', color: 'border-warning/20', bg: 'bg-warning/5', text: 'text-warning' },
            { label: 'Rekam Medis',   value: totalMedicalRecords, icon: 'medical_information', color: 'border-success/20', bg: 'bg-success/5', text: 'text-success' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.bg} rounded-2xl border ${stat.color} p-4 flex items-center gap-3 shadow-sm`}>
              <div className="w-10 h-10 bg-surface/70 backdrop-blur-md rounded-xl flex items-center justify-center border border-inherit shadow-inner">
                <span className={`material-symbols-outlined ${stat.text}`} style={{ fontSize: '18px' }}>{stat.icon}</span>
              </div>
              <div>
                <h4 className="text-2xl font-black text-bku-text leading-none mb-0.5">{stat.value}</h4>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { title: 'Konseling Akademik', icon: BookOpen,  color: TIPE_CONFIG.Akademik, desc: 'Motivasi belajar, strategi studi, dan perencanaan akademik.' },
            { title: 'Konseling Karir',    icon: Briefcase, color: TIPE_CONFIG.Karir,    desc: 'Minat bakat, persiapan kerja, dan pengembangan potensi.' },
            { title: 'Konseling Personal', icon: Heart,     color: TIPE_CONFIG.Personal, desc: 'Kesehatan mental, masalah pribadi, dan pengembangan diri.' },
          ].map(({ title, icon: Icon, color, desc }) => (
            // eslint-disable-next-line
            <div key={title} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-md transition-all group cursor-default">
              <div className={`w-10 h-10 ${color.bg} ${color.border} border rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={18} className={color.text} />
              </div>
              <h3 className="font-bold text-[15px] mb-1.5">{title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Jadwal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header + Filter dalam satu baris */}
            <div className="bg-surface rounded-2xl border border-border px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Title */}
                <div className="shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-headline">Jadwal Tersedia</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">Slot ini tersinkron dari jadwal aktif psikolog</p>
                </div>

                {/* Filter pills — sejajar judul di desktop, full width di mobile */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {['Semua', 'Akademik', 'Psikologi'].map((tipe) => (
                    <button
                      key={tipe}
                      onClick={() => setFilterTipe(tipe)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                        filterTipe === tipe
                          ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)]'
                          : 'bg-neutral-50 text-neutral-500 border-border hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)]'
                      }`}
                    >
                      {tipe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Slot List */}
            <div className="space-y-3">
              {isJadwalLoading ? (
                <CardGridSkeleton count={4} />
              ) : filtered.length > 0 ? (
                filtered.map((slot) => {
                  const slotTipeMapped = (slot.Tipe === 'Personal' || slot.Tipe === 'Karir') ? 'Psikologi' : slot.Tipe;
                  const tc = TIPE_CONFIG[slotTipeMapped] ?? TIPE_CONFIG.Akademik;
                  const isFull = slot.SisaKuota <= 0;
                  return (
                    <div
                      key={slot.ID}
                      className="bg-surface rounded-2xl border border-border p-5 hover:border-blue-200 hover:shadow-sm transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                    >
                      <div className="min-w-0 flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tc.bg} ${tc.text} border ${tc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                            {tc.label}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isFull ? 'bg-red-50 text-red-500 border-red-100' : 'bg-neutral-50 text-neutral-400 border-border'}`}>
                            Kuota {slot.SisaKuota}/{slot.Kuota}
                          </span>
                        </div>

                        <h4 className="font-bold text-[15px] mb-1">{slot.NamaKonselor}</h4>
                        {slot.Spesialisasi && (
                          <p className="text-xs font-semibold text-neutral-400 mb-3">{slot.Spesialisasi}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-neutral-500">
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-neutral-300 shrink-0" style={{ fontSize: '14px' }} >calendar_month</span>{formatLongDate(slot.Tanggal)}</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-neutral-300 shrink-0" style={{ fontSize: '14px' }} >schedule</span>{slot.JamMulai} – {slot.JamSelesai} WIB</span>
                          <span className="flex items-center gap-2 sm:col-span-2"><span className="material-symbols-outlined text-neutral-300 shrink-0" style={{ fontSize: '14px' }} >location_on</span>{slot.Lokasi}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border ${isFull ? 'bg-red-50 text-red-400 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isFull ? 'Penuh' : 'Tersedia'}
                        </span>
                        <button
                          onClick={() => !isFull && setSelectedSlot(slot)}
                          disabled={isFull}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-[var(--theme-primary)] text-[var(--theme-primary)] hover:bg-[var(--theme-primary)] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:border-border disabled:text-neutral-400"
                        >
                          Ambil Antrean <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon="HeartHandshake"
                  iconColor="text-[var(--theme-primary)]"
                  iconBgClass="bg-[var(--theme-primary-light)]"
                  iconBorderClass="border-[var(--theme-primary-light)]"
                  title="Tidak Ada Jadwal"
                  description={filterTipe === 'Semua' ? 'Belum ada jadwal tersedia. Cek kembali beberapa saat lagi.' : `Jadwal untuk kategori ${filterTipe} sedang kosong.`}
                />
              )}
            </div>
          </div>

          {/* RIGHT — Riwayat Summary */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="bg-[var(--theme-primary)] p-5 text-[var(--theme-text-on-primary)]">
                <div className="flex items-center gap-2 opacity-80">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Riwayat Konseling</span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold font-headline text-inherit">Pantau Sesi & Rekam Medis</h2>
                <p className="mt-1 text-sm font-medium leading-relaxed opacity-90">
                  Riwayat booking dan catatan psikolog sekarang tersedia di halaman khusus agar lebih mudah dibaca.
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border bg-neutral-50 p-3 text-center">
                    <p className="text-xl font-extrabold text-neutral-900">{totalRiwayat}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-neutral-400">Total</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-center">
                    <p className="text-xl font-extrabold text-amber-700">{totalMenunggu}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-amber-500">Menunggu</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-extrabold text-emerald-700">{totalMedicalRecords}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-emerald-500">Rekam</p>
                  </div>
                </div>

                <NavLink
                  to="/student/counseling/history"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--theme-primary-hover)]"
                >
                  Buka Riwayat Konseling
                  <ChevronRight size={16} />
                </NavLink>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-blue-600" style={{ fontSize: '18px' }} >show_chart</span>
                    <p className="text-xs font-semibold leading-relaxed text-blue-900">
                      Rekam medis hanya muncul setelah psikolog menyimpan catatan sesi pada halaman pasien.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOOKING MODAL ── */}
        <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)} maxWidth="max-w-lg">
          <DialogContent>
            {/* Modal Header */}
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-[var(--theme-primary)]" />
                <span className="text-[var(--theme-text-muted)] text-xs font-bold uppercase tracking-wider">Daftar Antrean Konseling</span>
              </div>
              <DialogTitle>{selectedSlot?.NamaKonselor}</DialogTitle>
              <DialogDescription className="text-xs text-[var(--theme-text-muted)] flex items-center gap-1.5 mt-1 font-semibold">
                <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '13px' }} >security</span> Sesi dilindungi protokol kerahasiaan
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-8 space-y-5 max-h-[50vh] no-scrollbar text-left bg-white">
              {/* Slot Summary */}
              {selectedSlot && (
                <div className="bg-neutral-50 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${(TIPE_CONFIG[selectedSlot.Tipe === 'Personal' || selectedSlot.Tipe === 'Karir' ? 'Psikologi' : selectedSlot.Tipe] ?? TIPE_CONFIG.Akademik).text}`}>
                      {selectedSlot.Tipe === 'Personal' || selectedSlot.Tipe === 'Karir' ? 'Psikologi' : selectedSlot.Tipe}
                    </span>
                    <p className="text-sm font-bold text-neutral-700 mt-0.5">
                      {selectedSlot.JamMulai} – {selectedSlot.JamSelesai} WIB
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 font-medium">Tanggal</p>
                    <p className="text-sm font-bold text-neutral-700">{new Date(selectedSlot.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                    Metode Konseling <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { value: 'Tatap Muka', label: 'Tatap Muka (Offline)', desc: 'Konseling langsung di ruang BK', icon: 'groups' },
                      { value: 'Online', label: 'Online (Zoom)', desc: 'Konseling daring via video call', icon: 'videocam' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMode(opt.value)}
                        className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          mode === opt.value
                            ? 'border-[var(--theme-primary)] bg-blue-50/20 ring-2 ring-[#00236F]/5'
                            : 'border-border hover:border-border bg-white text-[var(--theme-text)]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${mode === opt.value ? 'text-[var(--theme-primary)]' : 'text-neutral-400'}`}>
                          {opt.icon}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${mode === opt.value ? 'text-[var(--theme-primary)]' : 'text-neutral-700'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[9px] text-neutral-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                    Kategori Masalah / Topik <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Akademik', 'Psikologi'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTopik(cat)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          topik === cat
                            ? 'border-[var(--theme-primary)] bg-blue-50/20 text-[var(--theme-primary)] ring-2 ring-[#00236F]/5'
                            : 'border-border hover:border-border bg-white text-neutral-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                    Topik Pembahasan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={keluhan}
                    onChange={(e) => setKeluhan(e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-50 border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--theme-primary)] focus:bg-white transition-all resize-none placeholder:text-neutral-300 font-semibold text-[var(--theme-text)] bg-[var(--theme-bg)]"
                    placeholder="Contoh: Saya merasa kesulitan mengatur waktu belajar dan merasa cemas menjelang ujian..."
                  />
                  <p className="text-[10px] text-neutral-400 font-semibold mt-1">
                    {keluhan.length}/20 karakter minimum
                  </p>
                </div>

                <label className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-50/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-blue-200 text-[var(--theme-primary)] focus:ring-[#00236F] shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-blue-800 leading-relaxed">
                    Saya memahami bahwa sesi ini bersifat rahasia, sukarela, dan data saya hanya dapat diakses oleh konselor terkait.
                  </span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="p-8 border-t border-slate-100/60 bg-slate-50/20 shrink-0 flex gap-3">
              <button
                onClick={() => setSelectedSlot(null)}
                className="flex-1 py-3 rounded-2xl border border-border text-neutral-500 text-xs font-black hover:bg-neutral-50 transition-colors cursor-pointer bg-white uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                onClick={handleBooking}
                disabled={bookingMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-[var(--theme-primary)] text-white text-xs font-black hover:bg-[var(--theme-primary-hover)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 cursor-pointer border-none uppercase tracking-wider"
              >
                {bookingMutation.isPending ? 'Memproses...' : <><span className="material-symbols-outlined text-sm" >check_circle</span> Konfirmasi</>}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </PageContent>
  );
}
