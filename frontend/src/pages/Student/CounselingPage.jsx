import React, { useState } from 'react';
import { 
  HeartHandshake, 
  BookOpen, 
  Briefcase, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  X, 
  CheckCircle2, 
  ChevronRight,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  useCounselingJadwalQuery, 
  useCounselingRiwayatQuery, 
  useBookingMutation, 
  useCancelBookingMutation 
} from '../../queries/useCounselingQuery';
import { CardGridSkeleton, NotifListSkeleton } from '../../components/ui/SkeletonGroups';
import EmptyState from '../../components/ui/EmptyState';
import { toast } from 'react-hot-toast';
import { NavLink } from 'react-router-dom';

const formatLongDate = (dateStr) =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));

const TIPE_CONFIG = {
  Akademik: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500' },
  Karir:    { bg: 'bg-sky-50',  text: 'text-sky-700',  border: 'border-sky-100',  dot: 'bg-sky-500'  },
  Personal: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },
};

const STATUS_CONFIG = {
  Selesai:      { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  Dikonfirmasi: { bg: 'bg-blue-50',    text: 'text-blue-700',    bar: 'bg-blue-500'    },
  Menunggu:     { bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-400'   },
  default:      { bg: 'bg-neutral-50', text: 'text-neutral-500', bar: 'bg-neutral-300' },
};

export default function CounselingPage() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [keluhan, setKeluhan] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [filterTipe, setFilterTipe] = useState('Semua');

  const { data: jadwal, isLoading: isJadwalLoading } = useCounselingJadwalQuery();
  const { data: riwayat, isLoading: isRiwayatLoading } = useCounselingRiwayatQuery();
  const bookingMutation = useBookingMutation();
  const cancelMutation  = useCancelBookingMutation();

  const totalSlot     = jadwal?.length ?? 0;
  const totalRiwayat  = riwayat?.length ?? 0;
  const totalMenunggu = riwayat?.filter(r => r.status === 'Menunggu').length ?? 0;

  const handleBooking = () => {
    if (!privacyAgreed) return toast.error('Harap setujui pernyataan privasi');
    if (keluhan.length < 20) return toast.error('Ceritakan topik minimal 20 karakter');
    bookingMutation.mutate({ jadwal_id: selectedSlot.ID, keluhan_awal: keluhan }, {
      onSuccess: () => { toast.success('Booking berhasil diajukan!'); setSelectedSlot(null); setKeluhan(''); setPrivacyAgreed(false); },
      onError: (err) => toast.error(err.response?.data?.message || 'Gagal melakukan booking'),
    });
  };

  const handleCancel = (id) => {
    if (confirm('Yakin ingin membatalkan jadwal konseling ini?')) {
      cancelMutation.mutate(id, {
        onSuccess: () => toast.success('Berhasil dibatalkan'),
        onError:   () => toast.error('Gagal membatalkan booking'),
      });
    }
  };

  const filtered = jadwal?.filter(s => filterTipe === 'Semua' || s.Tipe === filterTipe) ?? [];

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#171717] font-body">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-7">
          <NavLink to="/student/dashboard" className="hover:text-[#00236F] transition-colors font-medium">Dashboard</NavLink>
          <ChevronRight size={14} className="text-neutral-300" />
          <span className="text-[#171717] font-semibold">Konseling & Wellness</span>
        </nav>

        {/* ── HERO ── */}
        <div className="relative bg-[#00236F] rounded-3xl overflow-hidden mb-8 p-7 md:p-10">
          {/* Decorative rings */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute right-6 bottom-6 opacity-10">
            <HeartHandshake size={140} className="text-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-semibold mb-5">
              <ShieldCheck size={12} /> Privasi Terjamin 100%
            </span>
            <h1 className="text-2xl md:text-[2rem] font-extrabold text-white leading-tight mb-3 font-headline">
              Layanan Konseling<br />Mahasiswa BKU
            </h1>
            <p className="text-white/60 text-sm md:text-[15px] leading-relaxed mb-7 max-w-lg">
              Sesi privat bersama konselor profesional — rahasia, sukarela, dan aman untuk semua mahasiswa.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Slot Tersedia', value: totalSlot },
                { label: 'Total Sesi',    value: totalRiwayat },
                { label: 'Menunggu',      value: totalMenunggu },
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
                  <p className="text-xs text-neutral-400 mt-0.5">Pilih slot yang paling sesuai kebutuhanmu</p>
                </div>

                {/* Filter pills — sejajar judul di desktop, full width di mobile */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {['Semua', 'Akademik', 'Karir', 'Personal'].map((tipe) => (
                    <button
                      key={tipe}
                      onClick={() => setFilterTipe(tipe)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                        filterTipe === tipe
                          ? 'bg-[#00236F] text-white border-[#00236F]'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-[#00236F] hover:text-[#00236F]'
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

                        <h4 className="font-bold text-[15px] mb-3">{slot.NamaKonselor}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-neutral-500">
                          <span className="flex items-center gap-2"><Calendar size={14} className="text-neutral-300 shrink-0" />{formatLongDate(slot.Tanggal)}</span>
                          <span className="flex items-center gap-2"><Clock size={14} className="text-neutral-300 shrink-0" />{slot.JamMulai} – {slot.JamSelesai} WIB</span>
                          <span className="flex items-center gap-2 sm:col-span-2"><MapPin size={14} className="text-neutral-300 shrink-0" />{slot.Lokasi}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg border ${isFull ? 'bg-red-50 text-red-400 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {isFull ? 'Penuh' : 'Tersedia'}
                        </span>
                        <button
                          onClick={() => !isFull && setSelectedSlot(slot)}
                          disabled={isFull}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-[#00236F] text-[#00236F] hover:bg-[#00236F] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
                        >
                          Booking <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon="HeartHandshake"
                  iconColor="text-[#00236F]"
                  iconBgClass="bg-[#eef4ff]"
                  iconBorderClass="border-[#c9d8ff]"
                  title="Tidak Ada Jadwal"
                  description={filterTipe === 'Semua' ? 'Belum ada jadwal tersedia. Cek kembali beberapa saat lagi.' : `Jadwal untuk kategori ${filterTipe} sedang kosong.`}
                />
              )}
            </div>
          </div>

          {/* RIGHT — Riwayat */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-2xl border border-neutral-100 px-5 py-4">
              <h2 className="text-lg font-bold font-headline">Riwayat Konseling</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Pantau status sesi yang sudah diajukan</p>
            </div>

            <div className="space-y-3">
              {isRiwayatLoading ? (
                <NotifListSkeleton count={4} />
              ) : riwayat?.length > 0 ? (
                riwayat.map((h) => {
                  const sc = STATUS_CONFIG[h.status] ?? STATUS_CONFIG.default;
                  return (
                    <div key={h.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-blue-100 transition-colors">
                      {/* Status bar top */}
                      <div className={`h-1 w-full ${sc.bar}`} />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">{formatLongDate(h.tanggal)}</p>
                            <h5 className="font-bold text-sm mt-0.5">{h.tipe}</h5>
                          </div>
                          <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                            {h.status}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1.5 mb-3">
                          <User size={12} className="text-neutral-300" /> {h.nama_konselor}
                        </p>

                        <div className="flex items-center justify-between border-t border-neutral-50 pt-3">
                          <span className="text-[11px] text-neutral-400 font-semibold flex items-center gap-1">
                            <Clock size={11} /> {h.jam_mulai}
                          </span>
                          {h.status === 'Menunggu' && (
                            <button
                              onClick={() => handleCancel(h.id)}
                              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                              title="Batalkan Antrean"
                            >
                              <Trash2 size={13} /> Batalkan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  size="sm"
                  icon="Clock"
                  iconColor="text-[#00236F]"
                  iconBgClass="bg-[#eef4ff]"
                  iconBorderClass="border-[#c9d8ff]"
                  title="Belum Ada Riwayat" 
                  description="Riwayat sesi konseling kamu akan muncul di sini."
                />
              )}
            </div>
          </div>
        </div>

        {/* ── BOOKING MODAL ── */}
        {selectedSlot && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">

              {/* Modal Header */}
              <div className="bg-[#00236F] px-7 py-6 relative">
                <button onClick={() => setSelectedSlot(null)} className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors">
                  <X size={22} />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-white/60" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Konfirmasi Booking</span>
                </div>
                <h2 className="text-xl font-extrabold text-white font-headline">{selectedSlot.NamaKonselor}</h2>
                <p className="text-white/50 text-sm mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> Sesi dilindungi protokol kerahasiaan
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
                    Topik Pembahasan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={keluhan}
                    onChange={(e) => setKeluhan(e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:border-[#00236F] focus:bg-white transition-all resize-none placeholder:text-neutral-300"
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
                    className="w-4 h-4 mt-0.5 rounded border-blue-200 text-[#00236F] focus:ring-[#00236F] shrink-0 cursor-pointer"
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
                    className="flex-1 py-3 rounded-2xl bg-[#00236F] text-white text-sm font-bold hover:bg-[#0B4FAE] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                  >
                    {bookingMutation.isPending ? 'Memproses...' : <><CheckCircle2 size={16} /> Konfirmasi</>}
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