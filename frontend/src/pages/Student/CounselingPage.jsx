import React, { useState, useEffect } from 'react';

import { useBookingMutation, useCounselingJadwalQuery, useCounselingRiwayatQuery } from '../../queries/useCounselingQuery';
import { PageCard, PageContent, PageHeader } from '@/components/ui/page';
import { PrimaryStatsCard } from '@/components/ui/StatsCard';
import { DialogModal } from '@/components/ui/DialogModal';
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
          <PrimaryStatsCard 
            title="Slot" 
            value={totalSlot} 
            badgeText="Tersedia" 
            icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>calendar_month</span>}
            colorTheme="primary"
          />
          <PrimaryStatsCard 
            title="Total" 
            value={totalRiwayat} 
            badgeText="Sesi" 
            icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>description</span>}
            colorTheme="primary"
          />
          <PrimaryStatsCard 
            title="Sesi" 
            value={totalMenunggu} 
            badgeText="Menunggu" 
            icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>schedule</span>}
            colorTheme="warning"
          />
          <PrimaryStatsCard 
            title="Rekam" 
            value={totalMedicalRecords} 
            badgeText="Medis" 
            icon={({ size }) => <span className="material-symbols-outlined" style={{ fontSize: size }}>medical_information</span>}
            colorTheme="success"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { title: 'Konseling Akademik', icon: BookOpen,  color: TIPE_CONFIG.Akademik, desc: 'Motivasi belajar, strategi studi, dan perencanaan akademik.' },
            { title: 'Konseling Karir',    icon: Briefcase, color: TIPE_CONFIG.Karir,    desc: 'Minat bakat, persiapan kerja, dan pengembangan potensi.' },
            { title: 'Konseling Personal', icon: Heart,     color: TIPE_CONFIG.Personal, desc: 'Kesehatan mental, masalah pribadi, dan pengembangan diri.' },
          ].map(({ title, icon: Icon, color, desc }) => (
            <PageCard key={title} className="p-5 hover:shadow-md transition-all group cursor-default">
              <div className={`w-10 h-10 ${color.bg} ${color.border} border rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:-rotate-6`}>
                <Icon size={18} className={color.text} />
              </div>
              <h3 className="font-bold text-[15px] mb-1.5 font-headline">{title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
            </PageCard>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Jadwal */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header + Filter dalam satu baris */}
            <PageCard className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Title */}
              <div className="shrink-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold font-headline text-slate-800">Jadwal Tersedia</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">Slot ini tersinkron dari jadwal aktif psikolog</p>
              </div>

              {/* Filter pills — sejajar judul di desktop, full width di mobile */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                {['Semua', 'Akademik', 'Psikologi'].map((tipe) => (
                  <button
                    key={tipe}
                    onClick={() => setFilterTipe(tipe)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[12px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                      filterTipe === tipe
                        ? 'bg-[var(--theme-primary)] text-white border-[var(--theme-primary)] shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:bg-white'
                    }`}
                  >
                    {tipe}
                  </button>
                ))}
              </div>
            </PageCard>

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
                    <PageCard
                      key={slot.ID}
                      className="p-5 hover:border-[var(--theme-primary)] hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100 to-transparent rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none transition-transform group-hover:scale-150"></div>
                      <div className="min-w-0 flex-1 relative z-10">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${tc.bg} ${tc.text} border ${tc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                            {tc.label}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest border ${isFull ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            Kuota {slot.SisaKuota}/{slot.Kuota}
                          </span>
                        </div>

                        <h4 className="font-bold text-[16px] font-headline mb-1 text-slate-800">{slot.NamaKonselor}</h4>
                        {slot.Spesialisasi && (
                          <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-4">{slot.Spesialisasi}</p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13px] font-medium text-slate-500">
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[var(--theme-primary)] opacity-70 shrink-0" style={{ fontSize: '16px' }} >calendar_month</span>{formatLongDate(slot.Tanggal)}</span>
                          <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[var(--theme-primary)] opacity-70 shrink-0" style={{ fontSize: '16px' }} >schedule</span>{slot.JamMulai} – {slot.JamSelesai} WIB</span>
                          <span className="flex items-center gap-2 sm:col-span-2"><span className="material-symbols-outlined text-[var(--theme-primary)] opacity-70 shrink-0" style={{ fontSize: '16px' }} >location_on</span>{slot.Lokasi}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 relative z-10">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${isFull ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isFull ? 'Penuh' : 'Tersedia'}
                        </span>
                        <button
                          onClick={() => !isFull && setSelectedSlot(slot)}
                          disabled={isFull}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all bg-[var(--theme-primary)] text-white hover:opacity-90 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                        >
                          Ambil Antrean <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" style={{ fontSize: '16px' }} >arrow_forward</span>
                        </button>
                      </div>
                    </PageCard>
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
            <PageCard noPadding className="overflow-hidden">
              <div className="bg-gradient-to-br from-[var(--theme-primary)] to-[#00184A] p-6 text-[var(--theme-text-on-primary)] relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 opacity-80 mb-2">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Riwayat Konseling</span>
                  </div>
                  <h2 className="text-[18px] font-black font-headline text-white leading-tight">Pantau Sesi & Rekam Medis</h2>
                  <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/80">
                    Riwayat booking dan catatan psikolog sekarang tersedia di halaman khusus agar lebih mudah dibaca.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-black font-headline text-slate-800">{totalRiwayat}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Total</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
                    <p className="text-2xl font-black font-headline text-amber-600">{totalMenunggu}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">Menunggu</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                    <p className="text-2xl font-black font-headline text-emerald-600">{totalMedicalRecords}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">Rekam</p>
                  </div>
                </div>

                <NavLink
                  to="/student/counseling/history"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] px-4 py-3 text-[13px] font-bold text-white transition-all hover:bg-[var(--theme-primary-hover)] hover:shadow-md"
                >
                  Buka Riwayat Konseling
                  <ChevronRight size={18} />
                </NavLink>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-blue-500" style={{ fontSize: '20px' }} >show_chart</span>
                  <p className="text-[12px] font-semibold leading-relaxed text-blue-800">
                    Rekam medis hanya muncul setelah psikolog menyimpan catatan sesi pada halaman pasien.
                  </p>
                </div>
              </div>
            </PageCard>
          </div>
        </div>

        {/* ── BOOKING MODAL ── */}
        <DialogModal
          open={!!selectedSlot}
          onOpenChange={(open) => !open && setSelectedSlot(null)}
          maxWidth="max-w-xl"
          title={selectedSlot?.NamaKonselor || 'Pilih Antrean'}
          subtitle="Daftar Antrean Konseling"
          description="Sesi dilindungi protokol kerahasiaan"
          icon="volunteer_activism"
          footer={
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setSelectedSlot(null)}
                className="flex-1 py-3 rounded-2xl border border-border text-neutral-500 text-[13px] font-black hover:bg-neutral-50 transition-colors cursor-pointer bg-white uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                onClick={handleBooking}
                disabled={bookingMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-[var(--theme-primary)] text-white text-[13px] font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 cursor-pointer border-none uppercase tracking-wider"
              >
                {bookingMutation.isPending ? 'Memproses...' : <><span className="material-symbols-outlined text-[18px]" >check_circle</span> Konfirmasi</>}
              </button>
            </div>
          }
        >
          <div className="space-y-5 p-2">
            {/* Slot Summary */}
            {selectedSlot && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${(TIPE_CONFIG[selectedSlot.Tipe === 'Personal' || selectedSlot.Tipe === 'Karir' ? 'Psikologi' : selectedSlot.Tipe] ?? TIPE_CONFIG.Akademik).text}`}>
                    {selectedSlot.Tipe === 'Personal' || selectedSlot.Tipe === 'Karir' ? 'Psikologi' : selectedSlot.Tipe}
                  </span>
                  <p className="text-[14px] font-bold text-slate-800 mt-0.5">
                    {selectedSlot.JamMulai} – {selectedSlot.JamSelesai} WIB
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Tanggal</p>
                  <p className="text-[14px] font-bold text-slate-800">{new Date(selectedSlot.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
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
                      className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        mode === opt.value
                          ? 'border-[var(--theme-primary)] bg-blue-50/20 ring-2 ring-[var(--theme-primary)]/10 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] mt-0.5 shrink-0 transition-colors ${mode === opt.value ? 'text-[var(--theme-primary)]' : 'text-slate-400'}`}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className={`text-[13px] font-bold transition-colors ${mode === opt.value ? 'text-[var(--theme-primary)]' : 'text-slate-700'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Kategori Masalah / Topik <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Akademik', 'Psikologi'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTopik(cat)}
                      className={`px-4 py-2.5 rounded-xl border text-[13px] font-bold transition-all cursor-pointer ${
                        topik === cat
                          ? 'border-[var(--theme-primary)] bg-blue-50/20 text-[var(--theme-primary)] ring-2 ring-[var(--theme-primary)]/10 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Topik Pembahasan <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={keluhan}
                  onChange={(e) => setKeluhan(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--theme-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--theme-primary)]/10 transition-all resize-none placeholder:text-slate-300 font-medium text-slate-800"
                  placeholder="Contoh: Saya merasa kesulitan mengatur waktu belajar dan merasa cemas menjelang ujian..."
                />
                <p className="text-[11px] text-slate-400 font-bold mt-2">
                  {keluhan.length}/20 karakter minimum
                </p>
              </div>

              <label className="flex gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-blue-200 text-[var(--theme-primary)] focus:ring-[var(--theme-primary)] shrink-0 cursor-pointer"
                />
                <span className="text-[12px] font-semibold text-blue-800 leading-relaxed">
                  Saya memahami bahwa sesi ini bersifat rahasia, sukarela, dan data saya hanya dapat diakses oleh konselor terkait.
                </span>
              </label>
            </div>
          </div>
        </DialogModal>

      </div>
    </PageContent>
  );
}
