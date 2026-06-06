import React, { useState, useMemo, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useHealthRingkasanQuery,
  useHealthRiwayatQuery,
  useHealthDetailQuery,
  useHealthMandiriMutation,
  useHealthTipsQuery,
} from '../../queries/useHealthQuery';
import { healthBookingService } from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import HealthCharacter from '../../components/health/HealthCharacter';
import {
  normalizeRecord,
  calculateHealthScore,
  calculateStreak,
  getInterpretationDelta
} from '../../utils/healthAnalytics';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Scale = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>scale</span>;
const Droplets = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>water_drop</span>;
const Thermometer = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>thermometer</span>;
const Bookmark = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bookmark</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Info = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const ChevronRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>chevron_right</span>;
const Stethoscope = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>medical_services</span>;
const Heart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



// ── Helpers ──────────────────────────────────────────────────────────────────
const getBMICategory = (bmi) => {
  if (!bmi || isNaN(bmi)) return { label: 'Unknown', color: 'text-neutral-400', bg: 'bg-neutral-50', border: 'border-neutral-200', dot: 'bg-neutral-300', bar: 'bg-neutral-300' };
  const v = parseFloat(bmi);
  if (v < 18.5) return { label: 'Kekurangan BB', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-400',   bar: 'bg-blue-400'   };
  if (v < 25)   return { label: 'Normal',        color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200',dot: 'bg-emerald-500',bar: 'bg-emerald-500'};
  if (v < 30)   return { label: 'Kelebihan BB',  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400',  bar: 'bg-amber-400'  };
  return         { label: 'Obesitas',             color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500',    bar: 'bg-red-500'    };
};

const getBPStatus = (s, d) => {
  const sv = parseInt(s), dv = parseInt(d);
  if (!sv || !dv || isNaN(sv) || isNaN(dv)) return { label: 'Belum Ada Data', color: 'text-neutral-400', bg: 'bg-neutral-50', bar: 'bg-neutral-300' };
  if (sv >= 140 || dv >= 90)                return { label: 'Hipertensi',      color: 'text-red-600',     bg: 'bg-red-50',      bar: 'bg-red-500'     };
  if (sv >= 120 || dv >= 80)                return { label: 'Pre-Hipertensi',  color: 'text-amber-600',   bg: 'bg-amber-50',    bar: 'bg-amber-400'   };
  return                                     { label: 'Normal',               color: 'text-emerald-600', bg: 'bg-emerald-50',  bar: 'bg-emerald-500' };
};

// Returns display label + description + color theme based on overall health status
const getStatusInfo = (status, bmi, sistolik, diastolik) => {
  const sv = parseInt(sistolik);
  const dv = parseInt(diastolik);
  const vBmi = parseFloat(bmi);

  // Hipertensi is most critical
  if (sv >= 140 || dv >= 90) {
    return {
      label: 'Hipertensi',
      desc: 'Tekanan darah kamu tinggi. Segera konsultasikan ke dokter atau klinik kampus.',
      text: 'text-rose-600',
      iconBg: 'bg-rose-500 shadow-rose-500/20',
    };
  }

  // Check string status from backend
  if (status) {
    const s = status.toLowerCase();
    if (s === 'sehat' || s === 'baik') {
      return {
        label: 'Sehat',
        desc: 'Indikator tubuh kamu prima! Pertahankan pola hidup sehat dan olahraga rutin.',
        text: 'text-emerald-600',
        iconBg: 'bg-emerald-500 shadow-emerald-500/20',
      };
    }
    if (s.includes('bahaya') || s.includes('kritis') || s.includes('darurat')) {
      return {
        label: 'Memerlukan Tindakan',
        desc: 'Kondisi kesehatanmu memerlukan perhatian segera. Hubungi klinik kampus sekarang.',
        text: 'text-rose-600',
        iconBg: 'bg-rose-500 shadow-rose-500/20',
      };
    }
    if (s.includes('tindak') || s.includes('lanjut')) {
      return {
        label: 'Perlu Tindak Lanjut',
        desc: 'Ada indikator yang perlu ditindaklanjuti. Jadwalkan konsultasi dengan tenaga medis.',
        text: 'text-rose-500',
        iconBg: 'bg-rose-500 shadow-rose-500/20',
      };
    }
    if (s.includes('pantauan') || s.includes('observasi') || s.includes('waspada')) {
      return {
        label: 'Dalam Pantauan',
        desc: 'Beberapa indikator perlu diperhatikan. Jangan ragu konsultasi ke klinik kampus.',
        text: 'text-amber-600',
        iconBg: 'bg-amber-500 shadow-amber-500/20',
      };
    }
  }

  // BMI-based fallback
  if (!isNaN(vBmi)) {
    if (vBmi >= 30) return { label: 'Obesitas', desc: 'Indeks massa tubuh kamu perlu perhatian serius. Konsultasikan program diet sehat.', text: 'text-red-600', iconBg: 'bg-red-500 shadow-red-500/20' };
    if (vBmi >= 25) return { label: 'Kelebihan Berat Badan', desc: 'Berat badanmu melebihi ideal. Coba terapkan pola makan sehat dan olahraga teratur.', text: 'text-amber-600', iconBg: 'bg-amber-500 shadow-amber-500/20' };
    if (vBmi < 18.5) return { label: 'Kekurangan Berat Badan', desc: 'Berat badanmu kurang dari ideal. Tingkatkan asupan nutrisi dan konsumsi makanan bergizi.', text: 'text-blue-600', iconBg: 'bg-blue-500 shadow-blue-500/20' };
  }

  // Pre-hypertension
  if ((sv >= 120 && sv < 140) || (dv >= 80 && dv < 90)) {
    return {
      label: 'Pre-Hipertensi',
      desc: 'Tekanan darahmu sedikit di atas normal. Kurangi stres, konsumsi garam, dan rutin olahraga.',
      text: 'text-amber-600',
      iconBg: 'bg-amber-500 shadow-amber-500/20',
    };
  }

  // Default healthy
  return {
    label: 'Sehat',
    desc: 'Semua indikator kesehatanmu dalam batas normal. Pertahankan gaya hidup sehat!',
    text: 'text-emerald-600',
    iconBg: 'bg-emerald-500 shadow-emerald-500/20',
  };
};

const fmt = (dateStr, opts) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', opts).format(d);
};
// ─────────────────────────────────────────────────────────────────────────────

export default function HealthScreeningPage() {
  const [isInputOpen,   setIsInputOpen]   = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [filterSumber,  setFilterSumber]  = useState('Semua');
  const [successModalData, setSuccessModalData] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('berat');

  // Booking states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [bookingKeluhan, setBookingKeluhan] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Fetch booking data
  const fetchBookingData = async () => {
    setLoadingSchedules(true);
    try {
      const [schedulesRes, bookingsRes] = await Promise.all([
        healthBookingService.getAvailableSchedules(),
        healthBookingService.getMyBookings(),
      ]);
      if (schedulesRes.success) {
        setAvailableSchedules(schedulesRes.data || []);
      }
      if (bookingsRes.success) {
        setMyBookings(bookingsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching booking data:', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    if (isBookingModalOpen) {
      fetchBookingData();
    }
  }, [isBookingModalOpen]);

  // Create booking
  const handleCreateBooking = async () => {
    if (!selectedSchedule) {
      toast.error('Pilih jadwal terlebih dahulu');
      return;
    }
    if (!bookingKeluhan.trim()) {
      toast.error('Silakan isi keluhan Anda');
      return;
    }

    setSubmittingBooking(true);
    try {
      const res = await healthBookingService.createBooking({
        jadwal_id: selectedSchedule.id,
        keluhan: bookingKeluhan,
      });
      if (res.success) {
        toast.success('Booking berhasil! Menunggu konfirmasi dari tenaga kesehatan.');
        setIsBookingModalOpen(false);
        setSelectedSchedule(null);
        setBookingKeluhan('');
        fetchBookingData();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal membuat booking');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;

    try {
      const res = await healthBookingService.cancelBooking(bookingId);
      if (res.success) {
        toast.success('Booking berhasil dibatalkan');
        fetchBookingData();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal membatalkan booking');
    }
  };

  const { data: terbaru, isLoading: isTerbaruLoading } = useHealthRingkasanQuery();
  const { data: riwayat, isLoading: isRiwayatLoading } = useHealthRiwayatQuery({ sumber: filterSumber });
  const { data: detailRecord, isLoading: isDetailLoading } = useHealthDetailQuery(selectedDetailId);
  const { data: tips }                                  = useHealthTipsQuery(terbaru?.bmi);
  const mandiriMutation                                 = useHealthMandiriMutation();

  const chartData = useMemo(() => {
    if (!riwayat) return [];
    return [...riwayat]
      .sort((a, b) => new Date(a.tanggal_periksa) - new Date(b.tanggal_periksa))
      .slice(-6)
      .map(item => ({
        name:  fmt(item.tanggal_periksa, { day: 'numeric', month: 'short' }),
        berat: item.berat_badan,
        bmi: item.bmi,
        skor: calculateHealthScore(item),
      }));
  }, [riwayat]);

  const bmiCat = getBMICategory(terbaru?.bmi);
  const bpStat = getBPStatus(terbaru?.sistolik, terbaru?.diastolik);
  const statusInfo = getStatusInfo(terbaru?.status_kesehatan, terbaru?.bmi, terbaru?.sistolik, terbaru?.diastolik);

  const lifestyleData = useMemo(() => {
    if (!terbaru?.keluhan) return null;
    try {
      if (terbaru.keluhan.startsWith('{') && terbaru.keluhan.endsWith('}')) {
        return JSON.parse(terbaru.keluhan);
      }
    } catch (_) {}
    return null;
  }, [terbaru]);

  const jamTidur = lifestyleData?.jam_tidur ?? 8;
  const olahraga = lifestyleData?.olahraga ?? 2;
  const air = lifestyleData?.konsumsi_air ?? 2.0;
  const stres = lifestyleData?.tingkat_stres ?? 5;

  // Fetch booking data on mount
  useEffect(() => {
    fetchBookingData();
  }, []);

  const handleInputSubmit = (formData) => {
    mandiriMutation.mutate(formData, {
      onSuccess: (res) => {
        toast.success('Data kesehatan berhasil diperbarui!');
        setIsInputOpen(false);
        const prev = riwayat && riwayat.length > 0 ? normalizeRecord(riwayat[0]) : null;
        const newRecord = normalizeRecord(res?.data || res || formData);
        setSuccessModalData({ current: newRecord, previous: prev });
      },
      onError:   (err) => toast.error(err.response?.data?.message || 'Gagal menyimpan data.'),
    });
  };

  // Fetch booking data on mount
  useEffect(() => {
    fetchBookingData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#171717] font-body">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-6">
          <NavLink to="/student/dashboard" className="hover:text-bku-primary transition-colors font-medium">Dashboard</NavLink>
          <ChevronRight size={14} className="text-neutral-300" />
          <span className="text-[#171717] font-semibold">Health Screening</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-bku-primary p-2 rounded-xl text-white">
              <Stethoscope size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline tracking-tight">Pusat Kesehatan BKU</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Pantau tren kesehatan & rekam medis digital kamu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all text-sm shadow-md shadow-emerald-500/20"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} strokeWidth={2.5}>calendar_month</span> Ambil Antrian
            </button>
            <button
              onClick={() => setIsInputOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-bku-primary text-white font-semibold rounded-xl hover:bg-[#0B4FAE] transition-all text-sm shadow-md shadow-bku-primary/20"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} strokeWidth={2.5}>add</span> Input Data Mandiri
            </button>
          </div>
        </div>

        {/* ── HERO: Latest Stats ── */}
        {isTerbaruLoading ? (
          <Skeleton className="h-56 rounded-2xl mb-6" />
        ) : terbaru ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">

            {/* Main Stats */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-white bg-opacity-50">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center p-2 rounded-xl text-white shadow-md ${statusInfo.iconBg}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >schedule</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] tracking-tight">Kondisi Terakhir</h3>
                    <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                      Diperbarui {fmt(terbaru.tanggal_periksa, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >security</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Tervalidasi BKU</span>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-neutral-50/50">
                <StatItem label="Tinggi" value={terbaru.tinggi_badan} unit="cm" icon={<span className="material-symbols-outlined font-bold" style={{ fontSize: '16px' }} >straighten</span>} colorClass="text-blue-600" bgClass="bg-blue-50" />
                <StatItem label="Berat" value={terbaru.berat_badan} unit="kg" icon={<Scale size={16} />} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
                <StatItem label="Tidur" value={jamTidur} unit="Jam" icon={<span className="material-symbols-outlined font-bold" style={{ fontSize: '16px' }} >bedtime</span>} colorClass="text-teal-600" bgClass="bg-teal-50" />
                <StatItem label="Olahraga" value={olahraga} unit="x/Mgg" icon={<span className="material-symbols-outlined font-bold" style={{ fontSize: '16px' }} >fitness_center</span>} colorClass="text-amber-600" bgClass="bg-amber-50" />
                <StatItem label="Air Minum" value={air} unit="L/Hari" icon={<Droplets size={16} />} colorClass="text-sky-600" bgClass="bg-sky-50" />
                <StatItem label="Stres" value={stres} unit="/10" icon={<span className="material-symbols-outlined font-bold" style={{ fontSize: '16px' }} >psychology</span>} colorClass="text-purple-600" bgClass="bg-purple-50" />
              </div>

              <div className="p-6 bg-white border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-5 relative z-10 w-full">
                  <HealthCharacter 
                    bmi={terbaru.bmi} 
                    sistolik={terbaru.sistolik} 
                    diastolik={terbaru.diastolik} 
                    statusKesehatan={terbaru.status_kesehatan} 
                    className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 transition-transform hover:scale-105"
                  />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Status Umum</p>
                    <p className={`text-xl sm:text-2xl font-black capitalize tracking-tight ${statusInfo.text}`}>
                      {statusInfo.label}
                    </p>
                    <p className={`text-xs font-medium mt-1 max-w-[280px] leading-relaxed hidden sm:block text-neutral-500`}>
                      {statusInfo.desc}
                    </p>
                  </div>
                  
                  {/* Circular Health Score gauge right inside status block */}
                  {(() => {
                    const score = calculateHealthScore(terbaru);
                    const ringColor = score >= 85 ? "#10b981" : score >= 70 ? "#f59e0b" : "#f43f5e";
                    const scoreLabel = score >= 85 ? "Sangat Sehat 👍" : score >= 70 ? "Cukup Sehat 👍" : "Perlu Atensi ⚠️";
                    return (
                      <div className="flex items-center gap-3 bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-100 shrink-0">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="3.5" fill="transparent" />
                            <circle 
                              cx="24" 
                              cy="24" 
                              r="20" 
                              stroke={ringColor} 
                              strokeWidth="3.5" 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 20}
                              strokeDashoffset={2 * Math.PI * 20 * (1 - score / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-[13px] font-black text-[#171717]">{score}</span>
                            <span className="text-[6px] text-neutral-400 font-bold uppercase tracking-wider leading-none">Skor</span>
                          </div>
                        </div>
                        <div className="hidden xs:block">
                          <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Wellness Score</p>
                          <p className="text-[11px] font-bold text-[#171717] mt-0.5">{scoreLabel}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto relative z-10 shrink-0">
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Tensi Darah</span>
                    <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${bpStat.bg} ${bpStat.color} shadow-sm border border-black/5`}>
                      {bpStat.label}
                    </span>
                  </div>
                  <div className="flex gap-1 w-full sm:w-32 mt-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i === 0 ? bpStat.bar : 'bg-neutral-100'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Card */}
            <div className={`lg:col-span-4 rounded-2xl border p-5 flex flex-col justify-between relative overflow-hidden ${bmiCat.bg} ${bmiCat.border}`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Indeks Massa Tubuh</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 border border-white ${bmiCat.color}`}>IMT</span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-black tracking-tight text-[#171717]">{terbaru.bmi}</span>
                  <span className="text-sm font-semibold text-neutral-400">BMI</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${bmiCat.color}`}>
                  {bmiCat.label} <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >arrow_forward</span>
                </span>
              </div>

              {/* BMI Bar */}
              <div className="relative z-10 mt-5">
                <div className="flex justify-between mb-1.5 text-[9px] font-semibold text-neutral-400">
                  <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
                </div>
                <div className="w-full h-2.5 bg-white/50 border border-white/40 rounded-full overflow-hidden flex relative">
                  <div className="h-full bg-blue-400/70"   style={{ width: '18.5%' }} />
                  <div className="h-full bg-emerald-500/70" style={{ width: '25%'   }} />
                  <div className="h-full bg-amber-400/70"  style={{ width: '20%'   }} />
                  <div className="h-full bg-red-400/70"    style={{ width: '36.5%' }} />
                  <motion.div
                    initial={{ left: 0 }}
                    animate={{ left: `${Math.min(Math.max((terbaru.bmi / 40) * 100, 3), 95)}%` }}
                    transition={{ type: 'spring', stiffness: 60, damping: 12 }}
                    className="absolute top-[-3px] bottom-[-3px] w-1.5 bg-[#171717] ring-2 ring-white rounded-full shadow"
                  />
                </div>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3.5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/80 relative z-10">
                <div className="flex items-center gap-2 mb-1 text-neutral-400">
                  <Info size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Tips IMT</span>
                </div>
                <p className="text-xs font-medium text-neutral-600 leading-relaxed italic">
                  "{tips || 'Jaga pola makan seimbang dan tetap aktif bergerak.'}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyHealthState onOpen={() => setIsInputOpen(true)} />
        )}

        {/* ── Antrian Saya ── */}
        {myBookings && myBookings.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '20px' }}>calendar_month</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#171717]">Antrian Saya</h2>
                  <p className="text-[10px] text-neutral-400">Riwayat pendaftaran klinik</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                + Tambah
              </button>
            </div>
            <div className="divide-y divide-neutral-50">
              {myBookings.slice(0, 3).map((booking) => {
                const statusColors = {
                  'Menunggu Konfirmasi': 'bg-amber-50 text-amber-600 border-amber-200',
                  'Dikonfirmasi': 'bg-blue-50 text-blue-600 border-blue-200',
                  'Selesai': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                  'Ditolak': 'bg-red-50 text-red-600 border-red-200',
                  'Dibatalkan': 'bg-slate-100 text-slate-500 border-slate-200',
                };
                const statusColor = statusColors[booking.status] || 'bg-slate-100 text-slate-600 border-slate-200';

                return (
                  <div key={booking.id} className="px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-neutral-500" style={{ fontSize: '18px' }}>medical_services</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#171717]">
                          {booking.jadwal?.tenaga_kes?.nama || 'Tenaga Kesehatan'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {booking.jadwal?.tanggal ? new Date(booking.jadwal.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : '-'}
                          {' • '}
                          {booking.jadwal?.jam_mulai || ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColor}`}>
                        {booking.status}
                      </span>
                      {(booking.status === 'Menunggu Konfirmasi' || booking.status === 'Dikonfirmasi') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-[10px] font-bold text-red-500 hover:underline"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Analytics & Vitals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Weight Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold font-headline">Tren & Perkembangan Tubuh</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">6 Pemeriksaan Terakhir</p>
              </div>
              <div className="flex bg-neutral-100 p-1 rounded-xl gap-1 shrink-0 border border-neutral-200/50">
                {[
                  { id: 'berat', label: 'Berat' },
                  { id: 'bmi', label: 'IMT/BMI' },
                  { id: 'skor', label: 'Wellness Score' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChartTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      activeChartTab === tab.id
                        ? 'bg-white text-bku-primary shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full" style={{ minHeight: '200px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200} debounce={50}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dynamicColor" x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%"  
                          stopColor={activeChartTab === 'skor' ? '#f59e0b' : activeChartTab === 'bmi' ? '#10b981' : '#0B4FAE'} 
                          stopOpacity={0.15} 
                        />
                        <stop 
                          offset="95%" 
                          stopColor={activeChartTab === 'skor' ? '#f59e0b' : activeChartTab === 'bmi' ? '#10b981' : '#0B4FAE'} 
                          stopOpacity={0}    
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#a3a3a3' }} dy={10} />
                    <YAxis hide domain={activeChartTab === 'skor' ? [0, 100] : activeChartTab === 'bmi' ? [10, 40] : ['dataMin - 3', 'dataMax + 3']} />
                    <Tooltip
                      cursor={{ 
                        stroke: activeChartTab === 'skor' ? '#f59e0b' : activeChartTab === 'bmi' ? '#10b981' : '#0B4FAE', 
                        strokeWidth: 1, 
                        strokeDasharray: '4 4' 
                      }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontSize: '12px', fontWeight: 700, padding: '8px 14px' }}
                      itemStyle={{ color: activeChartTab === 'skor' ? '#d97706' : activeChartTab === 'bmi' ? '#059669' : '#0B4FAE' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={activeChartTab} 
                      stroke={activeChartTab === 'skor' ? '#f59e0b' : activeChartTab === 'bmi' ? '#10b981' : '#0B4FAE'} 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#dynamicColor)" 
                      animationDuration={1000} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                  Belum cukup data untuk grafik tren.
                </div>
              )}
            </div>
          </div>

          {/* BP Reference */}
          <div className="bg-bku-primary rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-blue-200" style={{ fontSize: '16px' }} >show_chart</span>
                </div>
                <h3 className="text-sm font-bold tracking-wide">Tensi Referensi</h3>
              </div>
              <div className="space-y-4">
                <BPReference label="Normal"         range="< 120 / 80"      color="bg-emerald-500" text="text-emerald-400" />
                <BPReference label="Pre-Hipertensi" range="120–139 / 80–89" color="bg-blue-300"    text="text-blue-300"   />
                <BPReference label="Hipertensi"     range="≥ 140 / 90"      color="bg-red-500"     text="text-red-400"    />
              </div>
            </div>
            <div className="mt-5 p-3.5 bg-white/5 rounded-xl border border-white/10 flex gap-3 relative z-10">
              <Thermometer size={14} className="text-blue-200 shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/50 leading-relaxed">
                Istirahat 5 menit sebelum mengecek tensi mandiri untuk hasil yang akurat.
              </p>
            </div>
            <Heart size={200} className="absolute right-[-70px] top-[-70px] text-white opacity-[0.03] pointer-events-none" />
          </div>
        </div>

        {/* ── History Table ── */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-neutral-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-headline">Riwayat Rekam Medis</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">BKU Hub Validated</p>
              </div>
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {['Semua', 'mandiri', 'kencana_screening', 'klinik_kampus'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSumber(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                    filterSumber === s
                      ? 'bg-bku-primary text-white shadow-sm'
                      : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-bku-primary hover:text-bku-primary'
                  }`}
                >
                  {s === 'Semua' ? 'Semua' : s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-50">
                  {['Tanggal', 'TB / BB / Tensi', 'BMI', 'Status', 'Sumber', ''].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[10px] font-bold text-neutral-400 uppercase tracking-wider ${i >= 2 ? 'text-center' : ''} ${i === 5 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {isRiwayatLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}><td colSpan="6" className="px-5 py-4"><Skeleton className="h-12 w-full rounded-xl" /></td></tr>
                  ))
                ) : riwayat?.length > 0 ? (
                  riwayat.map((rec) => {
                    const rb = getBMICategory(rec.bmi);
                    return (
                      <tr key={rec.id} className="group hover:bg-neutral-50 transition-colors">
                        {/* Tanggal */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-100 shadow-sm flex flex-col items-center justify-center group-hover:border-bku-primary/30 transition-colors shrink-0">
                              <span className="text-xs font-black text-[#171717] leading-none">{new Date(rec.tanggal_periksa).getDate()}</span>
                              <span className="text-[8px] font-bold text-neutral-400 uppercase">{fmt(rec.tanggal_periksa, { month: 'short' })}</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#171717]">{new Date(rec.tanggal_periksa).getFullYear()}</p>
                              <p className="text-[10px] text-neutral-400">Berkala</p>
                            </div>
                          </div>
                        </td>
                        {/* Vitals */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-[#171717]">
                            {rec.tinggi_badan} <span className="text-neutral-300 font-normal">/</span> {rec.berat_badan} <span className="text-neutral-300 font-normal">/</span> {rec.sistolik}/{rec.diastolik}
                          </p>
                          <div className="flex gap-1.5 mt-1">
                            {['cm', 'kg', 'mmHg'].map(u => (
                              <span key={u} className="text-[8px] font-bold text-neutral-400 bg-neutral-50 border border-neutral-200 px-1.5 py-0.5 rounded">{u}</span>
                            ))}
                          </div>
                        </td>
                        {/* BMI */}
                        <td className="px-5 py-4 text-center">
                          <p className="text-sm font-black text-[#171717]">{rec.bmi}</p>
                          <p className={`text-[10px] font-bold uppercase ${rb.color}`}>{rb.label}</p>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            rec.status_kesehatan === 'sehat' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {rec.status_kesehatan.replace('_', ' ')}
                          </span>
                        </td>
                        {/* Sumber */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {(() => {
                              if (rec.sumber === 'kencana_screening') {
                                return (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-600 shadow-sm">
                                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>verified</span>
                                    <span className="text-[9px] font-extrabold tracking-wide uppercase">Kencana Screening</span>
                                  </div>
                                );
                              } else if (rec.sumber === 'klinik_kampus') {
                                return (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
                                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>shield</span>
                                    <span className="text-[9px] font-extrabold tracking-wide uppercase">Klinik Kampus</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-50 border border-neutral-100 text-neutral-500 shadow-sm">
                                    <User size={11} className="text-neutral-400" />
                                    <span className="text-[9px] font-extrabold tracking-wide uppercase">Mandiri</span>
                                  </div>
                                );
                              }
                            })()}
                            {rec.diperiksa_oleh && (
                              <span className="text-[9px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/50 max-w-[120px] truncate shadow-sm" title={rec.diperiksa_oleh}>
                                by {rec.diperiksa_oleh}
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedDetailId(rec.id)}
                            className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-bku-primary hover:bg-bku-primary hover:text-white transition-all ml-auto shadow-sm"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center">
                          <Bookmark size={20} className="text-neutral-300" />
                        </div>
                        <p className="text-sm font-semibold text-neutral-400">Belum ada rekam medis.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CTA Panels ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asuransi CTA */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="bg-white/10 w-fit p-2 rounded-xl mb-4 border border-white/10">
                <span className="material-symbols-outlined text-blue-200" style={{ fontSize: '20px' }} >health_and_safety</span>
              </div>
              <h4 className="text-base font-bold mb-2 leading-tight">Asuransi Kesehatan</h4>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Ajukan klaim asuransi kesehatan BKU Assurance atau reimburse biaya medis kamu.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10">BKU Assurance</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10">BPJS</span>
              </div>
              <NavLink
                to="/student/insurance"
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-600 text-sm font-bold rounded-xl hover:bg-emerald-50 transition-all w-fit"
              >
                Ajukan Klaim <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >arrow_forward</span>
              </NavLink>
            </div>
            <span className="material-symbols-outlined absolute right-[-60px] top-[-60px] text-white opacity-[0.05] pointer-events-none" style={{ fontSize: '200px' }} >health_and_safety</span>
          </div>

          {/* Privacy Info */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-xl text-bku-primary border border-blue-100">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >security</span>
                </div>
                <h4 className="text-base font-bold tracking-tight">Kerahasiaan Rekam Medis</h4>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                BKU Student Hub menjaga 100% privasi data kesehatan Anda. Riwayat medis hanya dapat diakses oleh Anda dan tenaga medis universitas bersertifikasi untuk keperluan klinis resmi.
              </p>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-2">
                <span className="material-symbols-outlined text-[#0B4FAE] shrink-0 mt-0.5" style={{ fontSize: '14px' }} >error</span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Data mandiri digunakan sebagai referensi awal, bukan hasil diagnosis medis final.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >schedule</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider">Verified System 2026</span>
              </div>
              <div className="w-8 h-1 bg-neutral-100 rounded-full" />
            </div>
          </div>
        </div>

      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {isInputOpen && (
          <InputModal
            onClose={() => setIsInputOpen(false)}
            onSubmit={handleInputSubmit}
            isLoading={mandiriMutation.isPending}
          />
        )}
        {selectedDetailId && (
          <DetailModal
            record={detailRecord}
            isLoading={isDetailLoading}
            onClose={() => setSelectedDetailId(null)}
          />
        )}
        {successModalData && (
          <SuccessFeedbackModal
            data={successModalData}
            onClose={() => setSuccessModalData(null)}
          />
        )}
        {isBookingModalOpen && (
          <BookingModal
            schedules={availableSchedules}
            myBookings={myBookings}
            loading={loadingSchedules}
            selectedSchedule={selectedSchedule}
            setSelectedSchedule={setSelectedSchedule}
            bookingKeluhan={bookingKeluhan}
            setBookingKeluhan={setBookingKeluhan}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedSchedule(null);
              setBookingKeluhan('');
            }}
            onSubmit={handleCreateBooking}
            onCancel={handleCancelBooking}
            isSubmitting={submittingBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatItem({ label, value, unit, icon, colorClass = "text-bku-primary", bgClass = "bg-bku-primary/5" }) {
  return (
    <div className="relative overflow-hidden bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group/stat flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider group-hover/stat:text-neutral-600 transition-colors">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg ${bgClass} ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-[#171717] tracking-tight">{value}</span>
        <span className="text-[10px] font-bold text-neutral-400 uppercase">{unit}</span>
      </div>
    </div>
  );
}

function BPReference({ label, range, color, text }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{label}</span>
        <span className={`text-[10px] font-bold ${text}`}>{range}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} w-full opacity-40`} />
      </div>
    </div>
  );
}

function EmptyHealthState({ onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-10 border-2 border-dashed border-neutral-200 text-center mb-6"
    >
      <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200">
        <Stethoscope size={28} className="text-neutral-300" />
      </div>
      <h3 className="text-lg font-bold text-[#171717] mb-2">Belum Ada Catatan Kesehatan</h3>
      <p className="text-sm text-neutral-400 max-w-sm mx-auto mb-5 leading-relaxed">
        Mulai perjalanan hidup sehatmu dengan menginput data biometrik pertamamu.
      </p>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-bku-primary text-white text-sm font-bold rounded-xl hover:bg-[#0B4FAE] transition-all"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={2.5}>add</span> Input Sekarang
      </button>
    </motion.div>
  );
}

function InputModal({ onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    tinggi_badan: '', berat_badan: '',
    sistolik: '', diastolik: '',
    gula_darah: '', golongan_darah: 'A',
    jam_tidur: '8', olahraga: '2',
    konsumsi_air: '2.0', merokok: 'Tidak',
    tingkat_stres: 5, mood: 'Biasa Saja',
    motivasi_belajar: 'Biasa Saja',
    sakit_kepala: false, pusing: false,
    lelah: false, nyeri_sendi: false,
    keluhan: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  const bmi = useMemo(() => {
    if (!formData.tinggi_badan || !formData.berat_badan) return null;
    const h = formData.tinggi_badan / 100;
    const r = formData.berat_badan / (h * h);
    return isNaN(r) ? null : r.toFixed(1);
  }, [formData.tinggi_badan, formData.berat_badan]);

  const bmiCat = getBMICategory(bmi);
  const bpStat  = getBPStatus(formData.sistolik, formData.diastolik);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-bku-primary/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.94,  y: 20 }}
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-bku-primary p-6 flex flex-col justify-between text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '16px' }} >show_chart</span>
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider">Live Analytics</h2>
            </div>

            <div className="space-y-6">
              {/* BMI Live */}
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">BMI Meter</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-3xl font-black tracking-tight">{bmi || '–'}</span>
                  <span className="text-xs text-white/30 font-semibold">pts</span>
                </div>
                {bmi && (
                  <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${bmiCat.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${bmiCat.dot}`} /> {bmiCat.label}
                  </span>
                )}
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  {bmi && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(Math.max((bmi / 40) * 100, 5), 100)}%` }}
                      className={`h-full ${bmiCat.bar}`}
                    />
                  )}
                </div>
              </div>

              {/* BP Live */}
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Tekanan Darah</p>
                <div className="text-2xl font-black tracking-tight mb-1">
                  {formData.sistolik || '–'}<span className="text-white/20">/</span>{formData.diastolik || '–'}
                </div>
                <span className={`text-[10px] font-bold uppercase ${bpStat.label === 'Belum Ada Data' ? 'text-white/30' : bpStat.color}`}>
                  {bpStat.label === 'Belum Ada Data' ? 'Menunggu input' : `Status: ${bpStat.label}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-white/40 leading-relaxed font-semibold">
              Indikator dihitung otomatis berdasarkan data yang kamu masukkan.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col justify-between max-h-[90vh]">
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#171717]">Perbarui Biometrik</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider font-bold">Laporan Kesehatan Mandiri</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-bku-primary hover:border-bku-primary transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* 1. Kategori Fisik */}
              <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <span className="material-symbols-outlined text-blue-600 font-bold" style={{ fontSize: '18px' }}>accessibility_new</span>
                  <span className="text-[10px] font-black text-bku-primary uppercase tracking-wider">1. Kategori Fisik</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Tinggi Badan" unit="cm" value={formData.tinggi_badan} onChange={v => setFormData(p => ({ ...p, tinggi_badan: v }))} icon={<span className="material-symbols-outlined text-blue-500 font-bold" style={{ fontSize: '14px' }}>straighten</span>} placeholder="170" />
                  <InputField label="Berat Badan" unit="kg" value={formData.berat_badan} onChange={v => setFormData(p => ({ ...p, berat_badan: v }))} icon={<span className="material-symbols-outlined text-blue-500 font-bold" style={{ fontSize: '14px' }}>scale</span>} placeholder="65" />
                </div>
              </div>

              {/* 2. Gaya Hidup */}
              <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <span className="material-symbols-outlined text-teal-600 font-bold" style={{ fontSize: '18px' }}>sports_gymnastics</span>
                  <span className="text-[10px] font-black text-bku-primary uppercase tracking-wider">2. Gaya Hidup (Self-report)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-teal-500 font-bold" style={{ fontSize: '14px' }}>bedtime</span> Jam Tidur / Hari
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.jam_tidur}
                      onChange={e => setFormData(p => ({ ...p, jam_tidur: e.target.value }))}
                    >
                      {['4', '5', '6', '7', '8', '9'].map(v => <option key={v} value={v}>{v} Jam</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-teal-500 font-bold" style={{ fontSize: '14px' }}>fitness_center</span> Olahraga / Minggu
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.olahraga}
                      onChange={e => setFormData(p => ({ ...p, olahraga: e.target.value }))}
                    >
                      {['0', '1', '2', '3', '4'].map(v => <option key={v} value={v}>{v} Kali</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-teal-500 font-bold" style={{ fontSize: '14px' }}>local_drink</span> Air Minum (L)
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.konsumsi_air}
                      onChange={e => setFormData(p => ({ ...p, konsumsi_air: e.target.value }))}
                    >
                      {['1.0', '1.5', '2.0', '2.5', '3.0'].map(v => <option key={v} value={v}>{v} Liter</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-teal-500 font-bold" style={{ fontSize: '14px' }}>smoke_free</span> Apakah Merokok?
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.merokok}
                      onChange={e => setFormData(p => ({ ...p, merokok: e.target.value }))}
                    >
                      {['Tidak', 'Ya'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Mental */}
              <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <span className="material-symbols-outlined text-purple-600 font-bold" style={{ fontSize: '18px' }}>psychology</span>
                  <span className="text-[10px] font-black text-bku-primary uppercase tracking-wider">3. Kategori Mental (Self-report)</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5">
                      Tingkat Stres (1-10)
                    </label>
                    <span className="px-2 py-0.5 text-xs font-extrabold bg-purple-100 text-purple-700 rounded-lg">{formData.tingkat_stres}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    className="w-full accent-purple-600 bg-neutral-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                    value={formData.tingkat_stres} 
                    onChange={e => setFormData(p => ({ ...p, tingkat_stres: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-purple-500 font-bold" style={{ fontSize: '14px' }}>mood</span> Mood Minggu Ini
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.mood}
                      onChange={e => setFormData(p => ({ ...p, mood: e.target.value }))}
                    >
                      {['Sangat Baik', 'Baik', 'Biasa Saja', 'Buruk', 'Sangat Buruk'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-purple-500 font-bold" style={{ fontSize: '14px' }}>auto_stories</span> Motivasi Belajar
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.motivasi_belajar}
                      onChange={e => setFormData(p => ({ ...p, motivasi_belajar: e.target.value }))}
                    >
                      {['Sangat Tinggi', 'Tinggi', 'Biasa Saja', 'Rendah', 'Sangat Rendah'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Keluhan */}
              <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <span className="material-symbols-outlined text-red-600 font-bold" style={{ fontSize: '18px' }}>healing</span>
                  <span className="text-[10px] font-black text-bku-primary uppercase tracking-wider">4. Kategori Keluhan (Bila Ada)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'sakit_kepala', label: 'Sakit Kepala' },
                    { key: 'pusing', label: 'Pusing' },
                    { key: 'lelah', label: 'Lelah / Lemas' },
                    { key: 'nyeri_sendi', label: 'Nyeri Sendi' },
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                        formData[item.key]
                          ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="material-symbols-outlined font-bold" style={{ fontSize: '15px' }}>
                        {formData[item.key] ? 'check_circle' : 'add_circle'}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Kategori Opsional (Alat/Klinik) */}
              <div className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50/50 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                  <span className="material-symbols-outlined text-blue-900 font-bold" style={{ fontSize: '18px' }}>query_stats</span>
                  <span className="text-[10px] font-black text-bku-primary uppercase tracking-wider">5. Kategori Opsional (Alat/Klinik)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Tensi Sistolik" unit="mmHg" value={formData.sistolik} onChange={v => setFormData(p => ({ ...p, sistolik: v }))} icon={<span className="material-symbols-outlined text-blue-500 font-bold" style={{ fontSize: '14px' }}>arrow_upward</span>} placeholder="120" isOptional={true} />
                  <InputField label="Tensi Diastolik" unit="mmHg" value={formData.diastolik} onChange={v => setFormData(p => ({ ...p, diastolik: v }))} icon={<span className="material-symbols-outlined text-blue-500 font-bold" style={{ fontSize: '14px' }}>arrow_downward</span>} placeholder="80" isOptional={true} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Gula Darah" unit="mg/dL" value={formData.gula_darah} onChange={v => setFormData(p => ({ ...p, gula_darah: v }))} icon={<span className="material-symbols-outlined text-blue-500 font-bold" style={{ fontSize: '14px' }}>water_drop</span>} placeholder="90" isOptional={true} />
                  <div>
                    <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-500 font-bold" style={{ fontSize: '14px' }}>bloodtype</span> Golongan Darah
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400 border border-neutral-200/50 normal-case tracking-normal">Opsional</span>
                    </label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all text-[#171717] h-[40px]"
                      value={formData.golongan_darah}
                      onChange={e => setFormData(p => ({ ...p, golongan_darah: e.target.value }))}
                    >
                      {['A', 'B', 'AB', 'O', '-'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Catatan */}
              <div>
                <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '12px' }}>description</span> Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan kondisi kesehatanmu atau keluhan yang dirasakan..."
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-bku-primary transition-all resize-none font-bold"
                  value={formData.keluhan}
                  onChange={e => setFormData(p => ({ ...p, keluhan: e.target.value }))}
                />
              </div>

              {/* 7. Tanggal */}
              <div>
                <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '12px' }}>calendar_month</span> Tanggal Pengukuran
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-bku-primary transition-all"
                  value={formData.tanggal}
                  onChange={e => setFormData(p => ({ ...p, tanggal: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-neutral-100 pt-4 shrink-0 bg-white">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-neutral-200 text-neutral-500 text-xs font-black rounded-xl hover:bg-neutral-50 transition-all uppercase tracking-wider"
            >
              Batal
            </button>
            <button
              disabled={isLoading || !formData.tinggi_badan || !formData.berat_badan}
              onClick={() => {
                const notesPayload = {
                  is_screening_realistis: true,
                  jam_tidur: parseInt(formData.jam_tidur) || 8,
                  olahraga: parseInt(formData.olahraga) || 0,
                  konsumsi_air: parseFloat(formData.konsumsi_air) || 2.0,
                  merokok: formData.merokok,
                  tingkat_stres: parseInt(formData.tingkat_stres) || 5,
                  mood: formData.mood,
                  motivasi_belajar: formData.motivasi_belajar,
                  daftar_keluhan: [
                    ...(formData.sakit_kepala ? ['Sakit Kepala'] : []),
                    ...(formData.pusing ? ['Pusing'] : []),
                    ...(formData.lelah ? ['Lelah / Lemas'] : []),
                    ...(formData.nyeri_sendi ? ['Nyeri Sendi'] : []),
                  ],
                  catatan_tambahan: formData.keluhan,
                };
                const notesStr = JSON.stringify(notesPayload);
                onSubmit({
                  tinggi_badan: parseFloat(formData.tinggi_badan),
                  berat_badan:  parseFloat(formData.berat_badan),
                  sistolik:     parseInt(formData.sistolik)  || 120,
                  diastolik:    parseInt(formData.diastolik) || 80,
                  gula_darah:   parseInt(formData.gula_darah) || 0,
                  golongan_darah: formData.golongan_darah,
                  catatan:      notesStr,
                  keluhan:      notesStr,
                  tanggal:      new Date(formData.tanggal).toISOString(),
                });
              }}
              className="flex-1 py-3 bg-bku-primary text-white text-xs font-black rounded-xl hover:bg-[#0B4FAE] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-bku-primary/20 uppercase tracking-wider"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >check_circle</span> Simpan Rekam Medis</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, unit, value, onChange, icon, placeholder, isOptional }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5 justify-between">
        <span className="flex items-center gap-1.5">
          {icon} {label} <span className="text-neutral-300 font-normal normal-case tracking-normal">({unit})</span>
        </span>
        {isOptional && (
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-400 border border-neutral-200/50 normal-case tracking-normal">Opsional</span>
        )}
      </label>
      <input
        type="number"
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-bku-primary transition-all text-[#171717]"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function DetailModal({ record, isLoading, onClose }) {
  if (isLoading || !record) {
    return (
      <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-bku-primary/50 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#171717]">Memuat rekam medis...</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-bku-primary transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
            </button>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </motion.div>
      </div>
    );
  }

  const bmiCat = getBMICategory(record.bmi);

  let parsedNotes = null;
  if (record.keluhan) {
    try {
      if (record.keluhan.trim().startsWith('{')) {
        parsedNotes = JSON.parse(record.keluhan);
      }
    } catch (e) {
      // standard string
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-bku-primary/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.94,  y: 20 }}
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className={`px-6 py-4 ${bmiCat.bg} border-b ${bmiCat.border} shrink-0`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white border shadow-sm ${bmiCat.color}`}>
              BMI: {bmiCat.label}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center text-neutral-400 hover:text-bku-primary transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >close</span>
            </button>
          </div>
          <h2 className="text-lg font-black text-[#171717] tracking-tight">Laporan Rekam Medis</h2>
          <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5 font-semibold">
            <span className="material-symbols-outlined text-bku-primary font-bold" style={{ fontSize: '12px' }} >calendar_month</span>
            {fmt(record.tanggal_periksa, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Physical Metrics Grid */}
          <div>
            <h4 className="text-[10px] font-black font-headline uppercase tracking-wider mb-2.5" style={{ color: 'var(--theme-h4)' }}>Indikator Utama</h4>
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { label: 'Tinggi', value: record.tinggi_badan, unit: 'cm', color: 'text-blue-600' },
                { label: 'Berat',  value: record.berat_badan,  unit: 'kg', color: 'text-blue-600' },
                { label: 'BMI',    value: record.bmi,          unit: 'pts', color: bmiCat.color },
                { label: 'Tensi',  value: `${record.sistolik}/${record.diastolik}`, unit: 'mmHg', color: 'text-bku-primary' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100/70 text-center">
                  <p className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-sm font-black leading-none ${color}`}>{value}</p>
                  <p className="text-[9px] text-neutral-300 font-semibold mt-1">{unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gula Darah & Golongan Darah */}
          {(record.gula_darah > 0 || record.golongan_darah) && (
            <div className="grid grid-cols-2 gap-3">
              {record.gula_darah > 0 && (
                <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined font-bold" style={{ fontSize: '16px' }}>water_drop</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">Gula Darah</p>
                    <p className="text-sm font-black text-[#171717]">{record.gula_darah} <span className="text-[10px] text-neutral-400 font-semibold">mg/dL</span></p>
                  </div>
                </div>
              )}
              {record.golongan_darah && record.golongan_darah !== '-' && (
                <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined font-bold" style={{ fontSize: '16px' }}>bloodtype</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider">Golongan Darah</p>
                    <p className="text-sm font-black text-[#171717]">{record.golongan_darah}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Lifestyle & Mental Insights */}
          {parsedNotes && (
            <>
              {/* Lifestyle Category */}
              <div className="bg-teal-50/20 border border-teal-100/50 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-teal-700 uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-teal-100/30">
                  <span className="material-symbols-outlined font-bold" style={{ fontSize: '14px' }}>sports_gymnastics</span> Gaya Hidup (Self-report)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Jam Tidur</span>
                    <span className="text-xs font-bold text-neutral-700">{parsedNotes.jam_tidur} Jam / Hari</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Olahraga</span>
                    <span className="text-xs font-bold text-neutral-700">{parsedNotes.olahraga} Kali / Minggu</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Konsumsi Air</span>
                    <span className="text-xs font-bold text-neutral-700">{parsedNotes.konsumsi_air} Liter</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Apakah Merokok</span>
                    <span className="text-xs font-bold text-neutral-700">{parsedNotes.merokok}</span>
                  </div>
                </div>
              </div>

              {/* Mental Category */}
              <div className="bg-purple-50/20 border border-purple-100/50 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5 pb-1.5 border-b border-purple-100/30">
                  <span className="material-symbols-outlined font-bold" style={{ fontSize: '14px' }}>psychology</span> Kondisi Mental (Self-report)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Tingkat Stres</span>
                    <span className="text-xs font-bold text-purple-700">{parsedNotes.tingkat_stres || 0} / 10</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Mood</span>
                    <span className="text-xs font-bold text-neutral-700">{parsedNotes.mood || '-'}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Motivasi Belajar</span>
                    <span className="text-xs font-bold text-neutral-700">{parsedNotes.motivasi_belajar || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Symptoms Category */}
              {parsedNotes.daftar_keluhan && parsedNotes.daftar_keluhan.length > 0 && (
                <div className="bg-rose-50/20 border border-rose-100/50 rounded-2xl p-4 space-y-2.5">
                  <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined font-bold" style={{ fontSize: '14px' }}>healing</span> Keluhan Fisik
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedNotes.daftar_keluhan.map((kel, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-bold">
                        {kel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Standard notes if standard text */}
          {!parsedNotes && record.keluhan && (
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined font-bold text-bku-primary" style={{ fontSize: '14px' }}>bookmark</span> Keluhan
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed italic">"{record.keluhan}"</p>
            </div>
          )}

          {parsedNotes && parsedNotes.catatan_tambahan && (
            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined font-bold text-bku-primary" style={{ fontSize: '14px' }}>bookmark</span> Catatan Tambahan
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed italic">"{parsedNotes.catatan_tambahan}"</p>
            </div>
          )}

          {record.catatan_medis && (
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined font-bold text-blue-500" style={{ fontSize: '14px' }} >error</span> Analisis & Saran Medis
              </p>
              <p className="text-xs font-semibold text-blue-800 leading-relaxed">{record.catatan_medis}</p>
            </div>
          )}

          {/* Source and status banner */}
          <div className="flex items-center justify-between p-4 bg-bku-primary rounded-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-200" style={{ fontSize: '16px' }}>admin_panel_settings</span>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Sumber Data</p>
                <p className="text-xs font-bold capitalize">{record.sumber.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Status</p>
              <p className={`text-xs font-bold uppercase ${record.status_kesehatan === 'sehat' ? 'text-emerald-400' : 'text-blue-300'}`}>
                {record.status_kesehatan.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-100 shrink-0 bg-white flex flex-col sm:flex-row gap-3">
          <NavLink
            to="/student/insurance"
            state={{
              tanggal: record.tanggal_periksa ? record.tanggal_periksa.split('T')[0] : '',
              deskripsi: `Klaim biaya pemeriksaan kesehatan (${record.jenis_pemeriksaan}) pada tanggal ${fmt(record.tanggal_periksa, { day: 'numeric', month: 'long', year: 'numeric' })}. Catatan: ${record.catatan_medis || record.catatan || 'Pemeriksaan rutin.'}`
            }}
            onClick={onClose}
            className="flex-1 py-3 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <span className="material-symbols-outlined text-[16px]">health_and_safety</span> Ajukan Asuransi
          </NavLink>
          <button
            onClick={onClose}
            className="py-3 px-6 bg-neutral-50 border border-neutral-200 text-neutral-500 text-xs font-black rounded-xl hover:bg-neutral-100 transition-all uppercase tracking-wider"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SuccessFeedbackModal({ data, onClose }) {
  const currentRecord = data.current;
  const previousRecord = data.previous;
  
  const score = calculateHealthScore(currentRecord);
  const delta = getInterpretationDelta(currentRecord, previousRecord);
  const streak = calculateStreak([currentRecord, ...(previousRecord ? [previousRecord] : [])]);
  
  // Calculate stress level if present
  let stressLevel = 0;
  if (currentRecord.keluhan && currentRecord.keluhan.startsWith('{')) {
    try {
      const parsed = JSON.parse(currentRecord.keluhan);
      stressLevel = parseInt(parsed.tingkat_stres) || 0;
    } catch (_) {}
  }
  
  // Custom suggestion based on score
  let badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
  let scoreColor = "text-emerald-500";
  let ringColor = "#10b981";
  
  if (score < 70) {
    badgeColor = "bg-rose-50 text-rose-600 border-rose-100";
    scoreColor = "text-rose-500";
    ringColor = "#f43f5e";
  } else if (score < 85) {
    badgeColor = "bg-amber-50 text-amber-600 border-amber-100";
    scoreColor = "text-amber-500";
    ringColor = "#f59e0b";
  }

  // Check if student needs counselor or clinic
  const needsCounseling = stressLevel >= 7 || currentRecord.bmi >= 30;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-bku-primary/60 backdrop-blur-md" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]"
      >
        {/* Top Header Card */}
        <div className="bg-bku-primary p-6 text-white text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            
            
            <h2 className="text-xl font-extrabold font-headline leading-tight">Data Kesehatan Disimpan!</h2>
            <p className="text-xs text-blue-200 mt-1 max-w-xs leading-relaxed">
              Hasil analisis otomatis parameter kebugaran dan gaya hidup kamu.
            </p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* Radial Score Gauge & Interpretation Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            {/* SVG Radial Score */}
            <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Skor Kesehatan</span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#f3f4f6" strokeWidth="8" fill="transparent" strokeDasharray="" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke={ringColor} 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Poin</span>
                </div>
              </div>
            </div>

            {/* General evaluation text */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '15px' }}>psychology</span>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Interpretasi</span>
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                {score >= 85 
                  ? "Sangat Baik! Tubuh dan gaya hidup kamu menunjukkan konsistensi prima. Teruskan habit ini!" 
                  : score >= 70 
                    ? "Cukup Baik! Ada beberapa hal kecil yang bisa ditingkatkan agar kesehatanmu lebih optimal." 
                    : "Perlu Perhatian! Disarankan untuk menyeimbangkan pola makan, istirahat, dan kelola stres."
                }
              </p>
            </div>
          </div>

          {/* Inline Personal Comments Delta */}
          {delta && (
            <div className={`p-4 rounded-2xl border ${
              delta.type === 'success' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' :
              delta.type === 'warning' ? 'bg-rose-50/50 border-rose-100 text-rose-900' :
              'bg-blue-50/50 border-blue-100 text-blue-900'
            }`}>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: '18px' }}>
                  {delta.type === 'success' ? 'check_circle' : delta.type === 'warning' ? 'warning' : 'info'}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1">Perbandingan Kesehatan</p>
                  <p className="text-xs font-semibold leading-relaxed leading-normal">{delta.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Grid Stats Comparison (Current vs Previous) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '15px' }}>monitoring</span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ringkasan Metrik</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Berat Badan', val: `${currentRecord.berat_badan} kg`, prevVal: previousRecord ? `${previousRecord.berat_badan} kg` : '-' },
                { label: 'IMT (BMI)', val: currentRecord.bmi, prevVal: previousRecord ? previousRecord.bmi : '-' },
                { label: 'Tensi Darah', val: `${currentRecord.sistolik}/${currentRecord.diastolik}`, prevVal: previousRecord ? `${previousRecord.sistolik}/${previousRecord.diastolik}` : '-' },
              ].map(({ label, val, prevVal }) => (
                <div key={label} className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{label}</span>
                  <div>
                    <p className="text-sm font-black text-[#171717]">{val}</p>
                    <p className="text-[9px] text-neutral-300 font-semibold mt-0.5">Lalu: {prevVal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Recommending Psychologists or Clinic */}
          {needsCounseling && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
              <div className="bg-bku-primary p-2 rounded-xl text-white shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>support_agent</span>
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-xs font-bold text-blue-900">Rekomendasi Tindak Lanjut</p>
                <p className="text-[11px] text-blue-700 leading-relaxed font-semibold">
                  Tingkat stresmu atau BMI terdeteksi memerlukan panduan ahli. Kamu bisa berkonsultasi gratis dengan psikolog profesional di unit konseling universitas secara rahasia.
                </p>
                <a 
                  href="/student/counseling"
                  className="inline-flex items-center gap-1 text-[11px] font-black text-bku-primary hover:underline"
                >
                  Jadwalkan Konseling Sekarang <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_forward</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 bg-bku-primary text-white text-xs font-bold rounded-xl hover:bg-[#0B4FAE] transition-all shadow-md shadow-bku-primary/10 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">check</span> Paham, Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ========================
// Booking Modal
// ========================
function BookingModal({
  schedules,
  myBookings,
  loading,
  selectedSchedule,
  setSelectedSchedule,
  bookingKeluhan,
  setBookingKeluhan,
  onClose,
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Menunggu Konfirmasi': 'bg-amber-100 text-amber-700',
      'Dikonfirmasi': 'bg-blue-100 text-blue-700',
      'Ditolak': 'bg-red-100 text-red-700',
      'Dibatalkan': 'bg-slate-100 text-slate-500',
      'Selesai': 'bg-emerald-100 text-emerald-700',
    };
    return badges[status] || 'bg-slate-100 text-slate-600';
  };

  // Filter schedules yang masih ada kuota
  const availableSchedules = schedules.filter(s => s.sisa_kuota > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#171717]">Ambil Antrian Klinik Kesehatan</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Pilih jadwal yang tersedia</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* My Bookings Section */}
          {myBookings && myBookings.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-bku-primary"></span>
                Booking Saya
              </h4>
              <div className="space-y-2">
                {myBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '18px' }}>calendar_month</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#171717]">{formatDate(booking.jadwal?.tanggal)}</p>
                          <p className="text-xs text-neutral-400">{formatTime(booking.jadwal?.jam_mulai)} - {formatTime(booking.jadwal?.jam_selesai)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                        {(booking.status === 'Menunggu Konfirmasi' || booking.status === 'Dikonfirmasi') && (
                          <button
                            onClick={() => onCancel(booking.id)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Schedules */}
          <div>
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Jadwal Tersedia ({availableSchedules.length})
            </h4>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : availableSchedules.length === 0 ? (
              <div className="text-center py-8 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="material-symbols-outlined text-4xl text-neutral-300">event_busy</span>
                <p className="text-sm text-neutral-400 mt-2">Belum ada jadwal tersedia</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableSchedules.map((schedule) => {
                  const isSelected = selectedSchedule?.id === schedule.id;
                  return (
                    <button
                      key={schedule.id}
                      onClick={() => setSelectedSchedule(schedule)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-bku-primary bg-bku-primary/5'
                          : 'border-neutral-100 bg-white hover:border-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-bku-primary text-white' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>medical_services</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#171717]">
                              {schedule.tenaga_kes?.nama || 'Tenaga Kesehatan'} • {schedule.tipe_layanan}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {formatDate(schedule.tanggal)} • {formatTime(schedule.jam_mulai)} - {formatTime(schedule.jam_selesai)}
                            </p>
                            <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>location_on</span>
                              {schedule.lokasi}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            schedule.sisa_kuota <= 2 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            Sisa: {schedule.sisa_kuota}/{schedule.kuota}
                          </div>
                          {isSelected && (
                            <span className="material-symbols-outlined text-bku-primary mt-1 block" style={{ fontSize: '20px' }}>check_circle</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keluhan Input */}
          {selectedSchedule && (
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Keluhan Anda
              </label>
              <textarea
                value={bookingKeluhan}
                onChange={(e) => setBookingKeluhan(e.target.value)}
                placeholder="Jelaskan keluhan atau kebutuhan kesehatan Anda..."
                rows={3}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-100 bg-neutral-50 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-neutral-200 text-neutral-600 text-sm font-bold rounded-xl hover:bg-neutral-100 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            disabled={!selectedSchedule || !bookingKeluhan.trim() || isSubmitting}
            className="flex-1 py-3 bg-bku-primary text-white text-sm font-bold rounded-xl hover:bg-[#0B4FAE] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }}>progress_activity</span>
                Mengirim...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                Daftarkan Sekarang
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

