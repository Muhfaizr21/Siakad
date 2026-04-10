import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  ChevronRight,
  Activity,
  Droplets,
  Heart,
  User,
  Clock,
  X,
  Info,
  FileText,
  ShieldCheck,
  TrendingUp,
  Scale,
  ArrowRight,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Thermometer,
} from 'lucide-react';
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
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom';
import HealthCharacter from '../../components/health/HealthCharacter';

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
      }));
  }, [riwayat]);

  const bmiCat = getBMICategory(terbaru?.bmi);
  const bpStat = getBPStatus(terbaru?.sistolik, terbaru?.diastolik);
  const statusInfo = getStatusInfo(terbaru?.status_kesehatan, terbaru?.bmi, terbaru?.sistolik, terbaru?.diastolik);

  const handleInputSubmit = (formData) => {
    mandiriMutation.mutate(formData, {
      onSuccess: () => { toast.success('Data kesehatan berhasil diperbarui!'); setIsInputOpen(false); },
      onError:   (err) => toast.error(err.response?.data?.message || 'Gagal menyimpan data.'),
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#171717] font-body">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 lg:py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-neutral-400 mb-6">
          <NavLink to="/student/dashboard" className="hover:text-[#00236F] transition-colors font-medium">Dashboard</NavLink>
          <ChevronRight size={14} className="text-neutral-300" />
          <span className="text-[#171717] font-semibold">Health Screening</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#00236F] p-2 rounded-xl text-white">
              <Stethoscope size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline tracking-tight">Pusat Kesehatan BKU</h1>
              <p className="text-xs text-neutral-400 mt-0.5">Pantau tren kesehatan & rekam medis digital kamu</p>
            </div>
          </div>
          <button
            onClick={() => setIsInputOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00236F] text-white font-semibold rounded-xl hover:bg-[#0B4FAE] transition-all text-sm shadow-md shadow-[#00236F]/20"
          >
            <Plus size={16} strokeWidth={2.5} /> Input Data Mandiri
          </button>
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
                    <Clock size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717] tracking-tight">Kondisi Terakhir</h3>
                    <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                      Diperbarui {fmt(terbaru.tanggal_periksa, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Tervalidasi BKU</span>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-neutral-50/50">
                <StatItem label="Tinggi" value={terbaru.tinggi_badan} unit="cm" icon={<TrendingUp size={16} />} colorClass="text-blue-600" bgClass="bg-blue-100" />
                <StatItem label="Berat" value={terbaru.berat_badan} unit="kg" icon={<Scale size={16} />} colorClass="text-emerald-600" bgClass="bg-emerald-100" />
                <StatItem label="Tensi" value={`${terbaru.sistolik}/${terbaru.diastolik}`} unit="mmHg" icon={<Activity size={16} />} colorClass="text-rose-600" bgClass="bg-rose-100" />
                <StatItem label="Gol. Darah" value={terbaru.golongan_darah || '–'} unit="Tipe" icon={<Droplets size={16} />} colorClass="text-red-600" bgClass="bg-red-100" />
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
                  {bmiCat.label} <ArrowRight size={14} />
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

        {/* ── Analytics & Vitals ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Weight Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-headline">Tren Berat Badan</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">6 Pemeriksaan Terakhir</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-neutral-400">Terakhir</p>
                  <p className="text-sm font-bold text-[#00236F]">{terbaru?.berat_badan || '--'} kg</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl text-[#00236F] border border-blue-100">
                  <TrendingUp size={16} />
                </div>
              </div>
            </div>
            <div className="w-full" style={{ minHeight: '200px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200} debounce={50}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBerat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0B4FAE" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#0B4FAE" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#a3a3a3' }} dy={10} />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                      cursor={{ stroke: '#0B4FAE', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 700, padding: '8px 14px' }}
                      itemStyle={{ color: '#0B4FAE' }}
                    />
                    <Area type="monotone" dataKey="berat" stroke="#0B4FAE" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBerat)" animationDuration={1500} />
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
          <div className="bg-[#00236F] rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <Activity size={16} className="text-blue-200" />
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
                      ? 'bg-[#00236F] text-white shadow-sm'
                      : 'bg-neutral-50 text-neutral-500 border border-neutral-200 hover:border-[#00236F] hover:text-[#00236F]'
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
                            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-100 shadow-sm flex flex-col items-center justify-center group-hover:border-[#00236F]/30 transition-colors shrink-0">
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
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="flex items-center gap-1">
                              {rec.sumber === 'mandiri'
                                ? <User size={11} className="text-neutral-400" />
                                : <ShieldCheck size={11} className="text-[#00236F]" />
                              }
                              <span className="text-[10px] font-bold text-[#171717] uppercase">{rec.sumber.replace(/_/g, ' ')}</span>
                            </div>
                            {rec.diperiksa_oleh && <span className="text-[9px] text-neutral-400 max-w-[90px] truncate">by {rec.diperiksa_oleh}</span>}
                          </div>
                        </td>
                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedDetailId(rec.id)}
                            className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-[#00236F] hover:bg-[#00236F] hover:text-white transition-all ml-auto shadow-sm"
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
          {/* Clinic CTA */}
          <div className="bg-[#00236F] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="bg-white/10 w-fit p-2 rounded-xl mb-4 border border-white/10">
                <Heart size={20} className="text-blue-200" />
              </div>
              <h4 className="text-base font-bold mb-2 leading-tight">Butuh Dukungan Medis Profesional?</h4>
              <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-xs">
                Layanan Klinik Utama BKU tersedia untuk konsultasi gratis bagi seluruh sivitas akademik aktif.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10">Gedung E – Lantai Dasar</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10">0812-BKU-MEDIC</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#00236F] text-sm font-bold rounded-xl hover:bg-blue-50 transition-all">
                Reservasi Konsul <ArrowRight size={16} />
              </button>
            </div>
            <Activity size={240} className="absolute right-[-80px] bottom-[-80px] text-white opacity-[0.04] pointer-events-none" />
          </div>

          {/* Privacy Info */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-xl text-[#00236F] border border-blue-100">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-base font-bold tracking-tight">Kerahasiaan Rekam Medis</h4>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                BKU Student Hub menjaga 100% privasi data kesehatan Anda. Riwayat medis hanya dapat diakses oleh Anda dan tenaga medis universitas bersertifikasi untuk keperluan klinis resmi.
              </p>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-start gap-2">
                <AlertCircle size={14} className="text-[#0B4FAE] shrink-0 mt-0.5" />
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Data mandiri digunakan sebagai referensi awal, bukan hasil diagnosis medis final.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-50 flex items-center justify-between text-neutral-300">
              <div className="flex items-center gap-2">
                <Clock size={14} />
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
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatItem({ label, value, unit, icon, colorClass = "text-[#00236F]", bgClass = "bg-[#00236F]/5" }) {
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
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00236F] text-white text-sm font-bold rounded-xl hover:bg-[#0B4FAE] transition-all"
      >
        <Plus size={16} strokeWidth={2.5} /> Input Sekarang
      </button>
    </motion.div>
  );
}

function InputModal({ onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    tinggi_badan: '', berat_badan: '',
    sistolik: '', diastolik: '',
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-[#00236F]/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.94,  y: 20 }}
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#00236F] p-5 flex flex-col justify-between text-white shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                <Activity size={16} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Live Analytics</h2>
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
                <span className={`text-[10px] font-bold uppercase ${bpStat.label === 'Pending' ? 'text-white/30' : bpStat.color}`}>
                  {bpStat.label === 'Pending' ? 'Menunggu input' : `Status: ${bpStat.label}`}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-[10px] text-white/40 leading-relaxed">
              Indikator dihitung otomatis berdasarkan data yang kamu masukkan.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-5 overflow-y-auto bg-white">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#171717]">Perbarui Biometrik</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">Laporan Kesehatan Mandiri</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-[#00236F] hover:border-[#00236F] transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Tinggi Badan" unit="cm"   value={formData.tinggi_badan} onChange={v => setFormData(p => ({ ...p, tinggi_badan: v }))} icon={<TrendingUp size={13}/>} placeholder="170" />
              <InputField label="Berat Badan"  unit="kg"   value={formData.berat_badan}  onChange={v => setFormData(p => ({ ...p, berat_badan:  v }))} icon={<Scale size={13}/>}      placeholder="65"  />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Tensi Sistolik"  unit="mmHg" value={formData.sistolik}  onChange={v => setFormData(p => ({ ...p, sistolik:  v }))} icon={<Activity size={13}/>} placeholder="120" />
              <InputField label="Tensi Diastolik" unit="mmHg" value={formData.diastolik} onChange={v => setFormData(p => ({ ...p, diastolik: v }))} icon={<Activity size={13}/>} placeholder="80"  />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Calendar size={12} className="text-[#00236F]" /> Tanggal Pengukuran
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#00236F] transition-all"
                value={formData.tanggal}
                onChange={e => setFormData(p => ({ ...p, tanggal: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <FileText size={12} className="text-[#00236F]" /> Keluhan / Catatan (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan kondisi kesehatanmu atau keluhan yang dirasakan..."
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#00236F] transition-all resize-none"
                value={formData.keluhan}
                onChange={e => setFormData(p => ({ ...p, keluhan: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-neutral-200 text-neutral-500 text-sm font-bold rounded-xl hover:bg-neutral-50 transition-all"
            >
              Batal
            </button>
            <button
              disabled={isLoading || !formData.tinggi_badan || !formData.berat_badan}
              onClick={() => onSubmit({
                ...formData,
                tinggi_badan: parseFloat(formData.tinggi_badan),
                berat_badan:  parseFloat(formData.berat_badan),
                sistolik:     parseInt(formData.sistolik)  || 0,
                diastolik:    parseInt(formData.diastolik) || 0,
                tanggal:      new Date(formData.tanggal).toISOString(),
              })}
              className="flex-2 py-2.5 bg-[#00236F] text-white text-sm font-bold rounded-xl hover:bg-[#0B4FAE] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-[#00236F]/20"
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle2 size={16} /> Simpan Rekam Medis</>
              }
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, unit, value, onChange, icon, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-[#171717] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        {icon} {label} <span className="text-neutral-300 font-normal normal-case tracking-normal">({unit})</span>
      </label>
      <input
        type="number"
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#00236F] transition-all text-[#171717]"
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
          onClick={onClose} className="absolute inset-0 bg-[#00236F]/50 backdrop-blur-sm" />

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
              className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-[#00236F] transition-all"
            >
              <X size={16} />
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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-[#00236F]/50 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{   opacity: 0, scale: 0.94,  y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className={`px-5 py-4 ${bmiCat.bg} border-b ${bmiCat.border}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-white border shadow-sm ${bmiCat.color}`}>
              BMI: {bmiCat.label}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center text-neutral-400 hover:text-[#00236F] transition-all"
            >
              <X size={16} />
            </button>
          </div>
          <h2 className="text-lg font-bold text-[#171717]">Rekam Medis</h2>
          <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
            <Calendar size={12} className="text-[#00236F]" />
            {fmt(record.tanggal_periksa, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Tinggi', value: record.tinggi_badan, unit: 'cm' },
              { label: 'Berat',  value: record.berat_badan,  unit: 'kg' },
              { label: 'BMI',    value: record.bmi,          unit: 'pt' },
              { label: 'Tensi',  value: `${record.sistolik}/${record.diastolik}`, unit: 'mmHg' },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-base font-black text-[#171717] leading-none">{value}</p>
                <p className="text-[9px] text-neutral-300 font-semibold mt-0.5">{unit}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {record.keluhan && (
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Bookmark size={11} className="text-[#00236F]" /> Keluhan
                </p>
                <p className="text-sm text-neutral-600 leading-relaxed italic">"{record.keluhan}"</p>
              </div>
            )}
            {record.catatan_medis && (
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle size={11} /> Analisis & Saran Medis
                </p>
                <p className="text-sm font-semibold text-blue-800 leading-relaxed">{record.catatan_medis}</p>
              </div>
            )}

            <div className="flex items-center justify-between p-3.5 bg-[#00236F] rounded-xl text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <User size={16} className="text-blue-200" />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Sumber</p>
                  <p className="text-sm font-bold capitalize">{record.sumber.replace(/_/g, ' ')}</p>
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

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 bg-neutral-50 border border-neutral-200 text-neutral-500 text-sm font-bold rounded-xl hover:bg-neutral-100 transition-all"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
