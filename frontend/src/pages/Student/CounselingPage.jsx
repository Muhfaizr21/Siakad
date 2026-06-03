import React, { useState, useEffect } from 'react';

import { 
  useCounselingJadwalQuery, 
  useCounselingRiwayatQuery, 
  useBookingMutation, 
} from '../../queries/useCounselingQuery';
import { CardGridSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'react-hot-toast';
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
  Akademik: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500' },
  Karir:    { bg: 'bg-sky-50',  text: 'text-sky-700',  border: 'border-sky-100',  dot: 'bg-sky-500'  },
  Personal: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },
};

export default function CounselingPage() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [keluhan, setKeluhan] = useState('');
  const [mode, setMode] = useState('Tatap Muka');
  const [topik, setTopik] = useState('Pribadi');
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
      const defaultTopic = selectedSlot.Tipe || selectedSlot.Spesialisasi || 'Pribadi';
      if (defaultTopic === 'Personal') {
        setTopik('Pribadi');
      } else if (['Akademik', 'Karir', 'Pribadi', 'Keluarga', 'Sosial', 'Lainnya'].includes(defaultTopic)) {
        setTopik(defaultTopic);
      } else {
        setTopik('Pribadi');
      }
    }
  }, [selectedSlot]);

  const handleBooking = () => {
    if (!privacyAgreed) return toast.error('Harap setujui pernyataan privasi');
    if (keluhan.length < 20) return toast.error('Ceritakan topik minimal 20 karakter');
    bookingMutation.mutate({
      psikolog_id: selectedSlot.PsikologID,
      slot_id: selectedSlot.SlotID || selectedSlot.ID,
      date: selectedSlot.Tanggal?.slice(0, 10),
      start: selectedSlot.JamMulai,
      end: selectedSlot.JamSelesai,
      topic: topik,
      complaint: keluhan,
      mode: mode,
    }, {
      onSuccess: () => { 
        toast.success('Booking berhasil diajukan!'); 
        setSelectedSlot(null); 
        setKeluhan(''); 
        setMode('Tatap Muka');
        setTopik('Pribadi');
        setPrivacyAgreed(false); 
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal melakukan booking'),
    });
  };

  const filtered = jadwal?.filter(s => filterTipe === 'Semua' || s.Tipe === filterTipe) ?? [];

  return (
    <div className="px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 font-body text-[#171717] min-h-screen bg-[#fafafa]">
      <div className="w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-7">
          <NavLink to="/student/dashboard" className="hover:text-bku-primary transition-colors font-medium">Dashboard</NavLink>
          <ChevronRight size={14} className="text-neutral-300" />
          <span className="text-[#171717] font-semibold">Konseling & Wellness</span>
        </nav>

        {/* ── HERO ── */}
        <div className="relative bg-bku-primary rounded-3xl overflow-hidden mb-8 p-7 md:p-10">
          {/* Decorative rings */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute right-6 bottom-6 opacity-10">
            <HeartHandshake size={140} className="text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold mb-5">
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }} Check >security</span> Privasi Terjamin 100%
            </span>
            <h1 className="text-2xl md:text-[2rem] font-extrabold text-white leading-tight mb-3 font-headline">
              Layanan Konseling<br />Mahasiswa BKU
            </h1>
            <p className="text-white/60 text-sm md:text-[15px] leading-relaxed mb-7 max-w-lg">
              Sesi privat bersama psikolog profesional — rahasia, sukarela, dan aman untuk semua mahasiswa.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Slot Tersedia', value: totalSlot },
                { label: 'Total Sesi',    value: totalRiwayat },
                { label: 'Menunggu',      value: totalMenunggu },
                { label: 'Rekam Medis',   value: totalMedicalRecords },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5 text-center min-w-[90px]">
                  <p className="text-white font-extrabold text-xl leading-none">{value}</p>
                  <p className="text-white/50 text-[11px] font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LAYANAN CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { title: 'Konseling Akademik', icon: BookOpen,  color: TIPE_CONFIG.Akademik, desc: 'Motivasi belajar, strategi studi, dan perencanaan akademik.' },
            { title: 'Konseling Karir',    icon: Briefcase, color: TIPE_CONFIG.Karir,    desc: 'Minat bakat, persiapan kerja, dan pengembangan potensi.' },
            { title: 'Konseling Personal', icon: Heart,     color: TIPE_CONFIG.Personal, desc: 'Kesehatan mental, masalah pribadi, dan pengembangan diri.' },
          ].map(({ title, icon: Icon, color, desc }) => (
            // eslint-disable-next-line
            <div key={title} className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-md transition-all group cursor-default">
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
            <div className="bg-white rounded-2xl border border-neutral-100 px-5 py-4">
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
                  {['Semua', 'Akademik', 'Karir', 'Personal'].map((tipe) => (
                    <button
                      key={tipe}
                      onClick={() => setFilterTipe(tipe)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                        filterTipe === tipe
                          ? 'bg-bku-primary text-white border-bku-primary'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-bku-primary hover:text-bku-primary'
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
                  const tc = TIPE_CONFIG[slot.Tipe] ?? TIPE_CONFIG.Akademik;
                  const isFull = slot.SisaKuota <= 0;
                  return (
                    <div
                      key={slot.ID}
                      className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                    >
                      <div className="min-w-0 flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${tc.bg} ${tc.text} border ${tc.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                            {slot.Tipe}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${isFull ? 'bg-red-50 text-red-500 border-red-100' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
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
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-bku-primary text-bku-primary hover:bg-bku-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
                        >
                          Booking <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon="HeartHandshake"
                  iconColor="text-bku-primary"
                  iconBgClass="bg-[#eef4ff]"
                  iconBorderClass="border-[#c9d8ff]"
                  title="Tidak Ada Jadwal"
                  description={filterTipe === 'Semua' ? 'Belum ada jadwal tersedia. Cek kembali beberapa saat lagi.' : `Jadwal untuk kategori ${filterTipe} sedang kosong.`}
                />
              )}
            </div>
          </div>

          {/* RIGHT — Riwayat Summary */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
              <div className="bg-bku-primary p-5 text-white">
                <div className="flex items-center gap-2 text-white/70">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >description</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Riwayat Konseling</span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold font-headline">Pantau Sesi & Rekam Medis</h2>
                <p className="mt-1 text-sm font-medium leading-relaxed text-white/60">
                  Riwayat booking dan catatan psikolog sekarang tersedia di halaman khusus agar lebih mudah dibaca.
                </p>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3 text-center">
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
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-bku-primary px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#0B4FAE]"
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
        {selectedSlot && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

              {/* Modal Header */}
              <div className="bg-bku-primary px-7 py-6 relative">
                <button onClick={() => setSelectedSlot(null)} className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }} >close</span>
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-white/60" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Konfirmasi Booking</span>
                </div>
                <h2 className="text-xl font-extrabold font-headline" style={{ color: 'var(--theme-h2)' }}>{selectedSlot.NamaKonselor}</h2>
                <p className="text-white/50 text-sm mt-0.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }} Check >security</span> Sesi dilindungi protokol kerahasiaan
                </p>
              </div>

              {/* Slot Summary */}
              <div className="px-7 pt-5">
                <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${(TIPE_CONFIG[selectedSlot.Tipe] ?? TIPE_CONFIG.Akademik).text}`}>
                      {selectedSlot.Tipe}
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
              </div>

              {/* Form */}
              <div className="px-7 py-5 space-y-5">
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
                        className={`flex items-start gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                          mode === opt.value
                            ? 'border-[#00236F] bg-blue-50/20 ring-2 ring-[#00236F]/5'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${mode === opt.value ? 'text-[#00236F]' : 'text-neutral-400'}`}>
                          {opt.icon}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${mode === opt.value ? 'text-[#00236F]' : 'text-neutral-700'}`}>
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
                    {['Akademik', 'Karir', 'Pribadi', 'Keluarga', 'Sosial', 'Lainnya'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTopik(cat)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          topik === cat
                            ? 'border-[#00236F] bg-blue-50/20 text-[#00236F] ring-2 ring-[#00236F]/5'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-600'
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
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-bku-primary focus:bg-white transition-all resize-none placeholder:text-neutral-300"
                    placeholder="Contoh: Saya merasa kesulitan mengatur waktu belajar dan merasa cemas menjelang ujian..."
                  />
                  <p className="text-[10px] text-neutral-400 font-medium mt-1">
                    {keluhan.length}/20 karakter minimum
                  </p>
                </div>

                <label className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl cursor-pointer hover:bg-blue-50/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-blue-200 text-bku-primary focus:ring-bku-primary shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-blue-800 leading-relaxed">
                    Saya memahami bahwa sesi ini bersifat rahasia, sukarela, dan data saya hanya dapat diakses oleh konselor terkait.
                  </span>
                </label>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 py-3 rounded-2xl border border-neutral-200 text-neutral-500 text-sm font-bold hover:bg-neutral-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={bookingMutation.isPending}
                    className="flex-1 py-3 rounded-2xl bg-bku-primary text-white text-sm font-bold hover:bg-[#0B4FAE] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                  >
                    {bookingMutation.isPending ? 'Memproses...' : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >check_circle</span> Konfirmasi</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
