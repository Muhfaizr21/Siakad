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
  Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  useHealthRingkasanQuery, 
  useHealthRiwayatQuery,
  useHealthMandiriMutation,
  useHealthTipsQuery
} from '../../queries/useHealthQuery';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

// BMI Categories & Colors
const getBMICategory = (bmi) => {
  if (!bmi || isNaN(bmi)) return { label: 'Unknown', color: 'text-[#a3a3a3]', bg: 'bg-[#fafafa]', border: 'border-[#e5e5e5]', desc: '-', light: 'bg-[#e5e5e5]' };
  const val = parseFloat(bmi);
  if (val < 18.5) return { label: 'Kurus', color: 'text-[#3b82f6]', bg: 'bg-[#eff6ff]', border: 'border-[#3b82f6]', desc: 'Berat badan kurang dari ideal.', light: 'bg-blue-400' };
  if (val < 25) return { label: 'Normal', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', border: 'border-[#16a34a]', desc: 'Berat badan ideal dan sehat.', light: 'bg-green-500' };
  if (val < 30) return { label: 'Gemuk', color: 'text-[#f59e0b]', bg: 'bg-[#fff7ed]', border: 'border-[#f59e0b]', desc: 'Kelebihan berat badan ringan.', light: 'bg-orange-400' };
  return { label: 'Obesitas', color: 'text-[#ef4444]', bg: 'bg-[#fef2f2]', border: 'border-[#ef4444]', desc: 'Kelebihan berat badan tingkat tinggi.', light: 'bg-red-500' };
};

// BP Categories
const getBPStatus = (sistolik, diastolik) => {
  const s = parseInt(sistolik);
  const d = parseInt(diastolik);
  if (!s || !d || isNaN(s) || isNaN(d)) return { label: 'Pending', color: 'text-[#a3a3a3]', bg: 'bg-[#fafafa]', light: 'bg-[#e5e5e5]' };
  if (s >= 140 || d >= 90) return { label: 'Tinggi', color: 'text-[#ef4444]', bg: 'bg-[#fef2f2]', light: 'bg-[#ef4444]' };
  if (s >= 120 || d >= 80) return { label: 'Perhatian', color: 'text-[#f59e0b]', bg: 'bg-[#fffbeb]', light: 'bg-[#f59e0b]' };
  return { label: 'Normal', color: 'text-[#16a34a]', bg: 'bg-[#f0fdf4]', light: 'bg-[#16a34a]' };
};

export default function HealthScreeningPage() {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [filterSumber, setFilterSumber] = useState('Semua');

  // Queries
  const { data: terbaru, isLoading: isTerbaruLoading } = useHealthRingkasanQuery();
  const { data: riwayat, isLoading: isRiwayatLoading } = useHealthRiwayatQuery({ sumber: filterSumber });
  const { data: tips } = useHealthTipsQuery(terbaru?.bmi);
  const mandiriMutation = useHealthMandiriMutation();

  const chartData = useMemo(() => {
    if (!riwayat) return [];
    return [...riwayat]
      .sort((a, b) => new Date(a.tanggal_periksa) - new Date(b.tanggal_periksa))
      .slice(-6)
      .map(item => ({
        name: new Date(item.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        berat: item.berat_badan
      }));
  }, [riwayat]);

  const bmiCat = getBMICategory(terbaru?.bmi);
  const bpStat = getBPStatus(terbaru?.sistolik, terbaru?.diastolik);

  const handleInputSubmit = (formData) => {
    mandiriMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Data kesehatan berhasil diperbarui! 🎉');
        setIsInputOpen(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Gagal menyimpan data. Coba cek koneksi.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] font-body p-6 md:p-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium text-[#a3a3a3] mb-8">
        <span className="hover:text-[#f97316] cursor-pointer transition-colors">Dashboard</span>
        <ChevronRight size={16} />
        <span className="text-[#171717]">Health Screening</span>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Page Title & Action */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tight mb-2 flex items-center gap-4">
              <div className="bg-[#171717] p-2.5 rounded-2xl text-white shadow-xl shadow-black/10">
                <Stethoscope size={32} />
              </div>
              Pusat Kesehatan BKU
            </h1>
            <p className="text-[#525252] font-medium text-lg">Kelola data biometrik dan rekam medis digital kamu.</p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsInputOpen(true)}
            className="flex items-center gap-3 px-8 py-5 bg-[#171717] text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl shadow-black/10"
          >
            <Plus size={22} strokeWidth={3} />
            Input Data Mandiri
          </motion.button>
        </div>

        {/* Hero Section: Latest Stats */}
        {isTerbaruLoading ? (
           <Skeleton className="h-[300px] rounded-3xl mb-12" />
        ) : terbaru ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Main Stats Card */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:shadow-black/5">
               <div className="p-10 border-b border-[#f5f5f5] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full animate-pulse ${terbaru.status_kesehatan === 'sehat' ? 'bg-[#16a34a]' : 'bg-[#f97316]'}`} />
                    <span className="text-xs font-black text-[#a3a3a3] uppercase tracking-widest">Kondisi Terakhir: {new Date(terbaru.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-[#a3a3a3] uppercase opacity-40">Privacy Protected</span>
                     <ShieldCheck size={16} className="text-[#16a34a] opacity-40"/>
                  </div>
               </div>
               
               <div className="p-10 grid grid-cols-2 md:grid-cols-4 gap-12">
                  <StatItem label="Tinggi" value={terbaru.tinggi_badan} unit="cm" icon={<TrendingUp size={20}/>} />
                  <StatItem label="Berat" value={terbaru.berat_badan} unit="kg" icon={<Scale size={20}/>} />
                  <StatItem label="Tensi" value={`${terbaru.sistolik}/${terbaru.diastolik}`} unit="mmHg" icon={<Activity size={20}/>} />
                  <StatItem label="Gol. Darah" value={terbaru.golongan_darah || '-'} unit="Tipe" icon={<Droplets size={20} className="text-[#ef4444]"/>} />
               </div>

               <div className="px-10 py-8 bg-[#fafafa] flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-2xl bg-white border border-[#e5e5e5] shadow-sm ${bpStat.color}`}>
                       <Heart size={24} fill="currentColor" strokeWidth={0} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#a3a3a3] uppercase tracking-widest mb-1">Status Kesehatan Umum</p>
                      <p className={`text-xl font-black capitalize tracking-tight ${terbaru.status_kesehatan === 'sehat' ? 'text-[#16a34a]' : 'text-[#f97316]'}`}>
                        {terbaru.status_kesehatan.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-[#a3a3a3] uppercase">Tekanan Darah: </span>
                       <span className={`text-xs font-black uppercase ${bpStat.color}`}>{bpStat.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 h-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-10 h-full rounded-full transition-all duration-700 ${i === 1 ? bpStat.light : 'bg-[#e5e5e5]'}`} />
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            {/* BMI Gauge Card */}
            <div className={`lg:col-span-4 rounded-3xl p-10 border shadow-2xl shadow-black/5 flex flex-col justify-between relative overflow-hidden transition-all duration-700 ${bmiCat.bg} ${bmiCat.border}/40`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest">Indeks Massa Tubuh</p>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-white/50 border border-white ${bmiCat.color}`}>
                      IMT Digital
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <h2 className="text-7xl font-black tracking-tighter text-[#171717]">{terbaru.bmi}</h2>
                    <span className="text-lg font-bold text-[#a3a3a3]">BMI</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 text-xl font-black ${bmiCat.color}`}>
                    {bmiCat.label}
                    <ArrowRight size={20} />
                  </div>
                </div>

                <div className="relative z-10 mt-10">
                   <div className="flex justify-between mb-3 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest opacity-60">
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40+</span>
                  </div>
                  <div className="w-full h-4 bg-white/40 border border-white/40 rounded-full overflow-hidden flex relative backdrop-blur-md">
                    <div className="h-full bg-blue-400/80" style={{ width: '18.5%' }} />
                    <div className="h-full bg-green-500/80" style={{ width: '25%' }} />
                    <div className="h-full bg-orange-400/80" style={{ width: '20%' }} />
                    <div className="h-full bg-red-400/80" style={{ width: '36.5%' }} />
                    
                    <motion.div 
                      initial={{ left: 0 }}
                      animate={{ left: `${Math.min(Math.max((terbaru.bmi / 40) * 100, 5), 95)}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 10 }}
                      className="absolute top-[-4px] bottom-[-4px] w-2 bg-[#171717] ring-4 ring-white/50 rounded-full shadow-2xl"
                    />
                  </div>
                </div>

                <div className="mt-10 p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white relative z-10 shadow-sm">
                   <div className="flex items-center gap-3 mb-2 text-[#a3a3a3]">
                      <Info size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tips Berdasarkan IMT</span>
                   </div>
                   <p className="text-sm font-bold text-[#525252] leading-relaxed italic">
                    "{tips || 'Jaga pola makan seimbang dan tetap aktif bergerak setiap hari.'}"
                   </p>
                </div>

                <Activity size={240} className="absolute right-[-60px] top-[-30px] text-[#171717] opacity-[0.02] pointer-events-none" />
            </div>
          </div>
        ) : (
          <EmptyState onOpen={() => setIsInputOpen(true)} />
        )}

        {/* Analytics & Vitals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
           {/* Weight Trend */}
           <div className="lg:col-span-2 bg-white rounded-3xl p-10 border border-[#e5e5e5] shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h3 className="text-2xl font-black font-headline tracking-tight">Tren Berat Badan</h3>
                  <p className="text-sm font-bold text-[#a3a3a3] uppercase mt-1">Grafik 6 Pemeriksaan Terakhir</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#a3a3a3] uppercase">Terakhir</p>
                    <p className="text-lg font-black text-[#f97316]">{terbaru?.berat_badan || '--'} kg</p>
                  </div>
                  <div className="p-3 bg-[#fff7ed] rounded-2xl text-[#f97316] border border-[#fed7aa]/30">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>
              
              <div className="h-64 min-h-[256px] w-full relative z-10">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBerat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f1f1" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 800, fill: '#a3a3a3' }}
                        dy={15}
                      />
                      <YAxis 
                        hide={true}
                        domain={['dataMin - 5', 'dataMax + 5']} 
                      />
                      <Tooltip 
                        cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '5 5' }}
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 900, padding: '12px 20px' }}
                        itemStyle={{ color: '#f97316' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="berat" 
                        stroke="#f97316" 
                        strokeWidth={5} 
                        fillOpacity={1} 
                        fill="url(#colorBerat)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#a3a3a3] font-bold text-sm italic">
                    Belum cukup data untuk grafik tren.
                  </div>
                )}
              </div>
              
              <Scale size={200} className="absolute left-[-40px] bottom-[-60px] text-[#fafafa] pointer-events-none group-hover:text-[#f5f5f5] transition-colors" />
           </div>

           {/* Blood Pressure Awareness Panel */}
           <div className="bg-[#171717] rounded-3xl p-10 text-white flex flex-col justify-between shadow-2xl shadow-black/10 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5 group-hover:rotate-12 transition-transform">
                       <Activity size={24} className="text-[#f97316]" />
                    </div>
                    <h3 className="text-2xl font-black font-headline tracking-widest">TENSI LOG</h3>
                 </div>
                 
                 <div className="space-y-8">
                    <BPReference label="NORMAL" range="< 120 / 80" color="bg-green-500" text="text-green-400" />
                    <BPReference label="PRE-HIPERTENSI" range="120-139 / 80-89" color="bg-orange-500" text="text-orange-400" />
                    <BPReference label="HIPERTENSI" range=">= 140 / 90" color="bg-red-500" text="text-red-400" />
                 </div>
              </div>
              
              <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 relative z-10 flex items-start gap-4 backdrop-blur-sm">
                 <Thermometer size={20} className="text-orange-400 shrink-0 mt-1" />
                 <p className="text-xs font-semibold text-white/50 leading-relaxed italic">
                    Hindari kafein dan istirahat sejenak 5 menit sebelum melakukan pengecekan tensi mandiri.
                 </p>
              </div>
              
              <Heart size={300} className="absolute right-[-100px] top-[-100px] text-white opacity-[0.02] pointer-events-none rotate-12" />
           </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-3xl border border-[#e5e5e5] shadow-sm overflow-hidden mb-12 flex flex-col">
          <div className="p-10 border-b border-[#f5f5f5] flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h2 className="text-3xl font-black font-headline tracking-tighter">Riwayat Rekam Medis</h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
                 <p className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest">Database BKU Hub Validated</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 bg-[#fafafa] p-1.5 rounded-[24px] border border-[#e5e5e5]">
               {['Semua', 'mandiri', 'kencana_screening', 'klinik_kampus'].map(s => (
                 <button 
                  key={s}
                  onClick={() => setFilterSumber(s)}
                  className={`px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterSumber === s ? 'bg-[#171717] text-white shadow-xl shadow-black/10' : 'text-[#a3a3a3] hover:text-[#171717]'
                  }`}
                 >
                   {s === 'Semua' ? 'Filter: Semua' : s.replace('_', ' ')}
                 </button>
               ))}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fafafa]/50 border-b border-[#e5e5e5]">
                  <th className="px-10 py-6 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Tanggal / Sesi</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest">Vitals (TB/BB/BP)</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest text-center">BMI Analytics</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest text-center">Outcome</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest text-center">Authority</th>
                  <th className="px-10 py-6 text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {isRiwayatLoading ? (
                  [...Array(3)].map((_, i) => <tr key={i}><td colSpan="6" className="p-10"><Skeleton className="h-20 w-full rounded-2xl" /></td></tr>)
                ) : riwayat?.length > 0 ? (
                  riwayat.map((rec) => (
                    <tr key={rec.id} className="group hover:bg-[#fafafa]/80 transition-all duration-300">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e5e5] shadow-sm flex flex-col items-center justify-center group-hover:border-[#171717] transition-all duration-500">
                              <span className="text-sm font-black text-[#171717]">{new Date(rec.tanggal_periksa).getDate()}</span>
                              <span className="text-[9px] font-black text-[#a3a3a3] uppercase tracking-tighter">{new Date(rec.tanggal_periksa).toLocaleDateString('id-ID', { month: 'short' })}</span>
                           </div>
                           <div>
                              <div className="font-black text-xs text-[#171717]">{new Date(rec.tanggal_periksa).getFullYear()}</div>
                              <div className="text-[10px] font-bold text-[#a3a3a3] uppercase mt-0.5 tracking-tighter italic">Pemeriksaan Berkala</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="text-base font-black text-[#171717] mb-1">{rec.tinggi_badan} <span className="text-[#d4d4d4] font-medium">/</span> {rec.berat_badan} <span className="text-[#d4d4d4] font-medium">/</span> {rec.sistolik}/{rec.diastolik}</div>
                         <div className="flex gap-2">
                            <span className="text-[8px] font-black text-[#a3a3a3] bg-[#fafafa] px-1.5 py-0.5 rounded border border-[#e5e5e5]">CM</span>
                            <span className="text-[8px] font-black text-[#a3a3a3] bg-[#fafafa] px-1.5 py-0.5 rounded border border-[#e5e5e5]">KG</span>
                            <span className="text-[8px] font-black text-[#a3a3a3] bg-[#fafafa] px-1.5 py-0.5 rounded border border-[#e5e5e5]">mmHg</span>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-center tabular-nums">
                         <div className="text-lg font-black text-[#171717] group-hover:scale-110 transition-transform">{rec.bmi}</div>
                         <div className={`text-[10px] font-black uppercase tracking-tighter ${getBMICategory(rec.bmi).color}`}>{getBMICategory(rec.bmi).label}</div>
                      </td>
                      <td className="px-10 py-8 text-center whitespace-nowrap">
                         <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-current bg-opacity-5 ${
                           rec.status_kesehatan === 'sehat' ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#fff7ed] text-[#f97316]'
                         }`}>
                           {rec.status_kesehatan.replace('_', ' ')}
                         </span>
                      </td>
                      <td className="px-10 py-8 text-center whitespace-nowrap">
                         <div className="flex flex-col items-center gap-1 group-hover:opacity-100 transition-opacity">
                           <div className="flex items-center gap-2">
                             {rec.sumber === 'mandiri' ? <User size={14} className="text-[#a3a3a3]"/> : <ShieldCheck size={14} className="text-[#171717]"/>}
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#171717]">
                               {rec.sumber.replace('_', ' ')}
                             </span>
                           </div>
                           {rec.diperiksa_oleh && <span className="text-[9px] font-bold text-[#a3a3a3] max-w-[100px] truncate">By {rec.diperiksa_oleh}</span>}
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <motion.button 
                          whileHover={{ x: 5 }}
                          onClick={() => setSelectedDetail(rec)}
                          className="w-10 h-10 rounded-2xl bg-white border border-[#e5e5e5] flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-all ml-auto shadow-sm"
                         >
                           <ChevronRight size={22}/>
                         </motion.button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-32 text-center">
                       <div className="inline-block p-8 bg-[#fafafa] rounded-3xl border-2 border-dashed border-[#e5e5e5]">
                          <Bookmark size={56} className="mx-auto text-[#d4d4d4] mb-4" />
                          <h3 className="text-xl font-black text-[#d4d4d4]">Belum ada rekam medis.</h3>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support CTA Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#171717] to-black rounded-3xl p-12 text-white relative overflow-hidden group shadow-2xl shadow-black/20"
           >
              <div className="relative z-10">
                <div className="bg-white/10 w-fit p-3 rounded-2xl mb-8 border border-white/5">
                   <Heart size={32} className="text-[#f97316]" />
                </div>
                <h4 className="text-3xl font-black mb-6 leading-tight tracking-tight">Butuh Dukungan Medis Profesional?</h4>
                <p className="text-white/50 font-medium text-lg leading-relaxed mb-10 max-w-sm">
                  Layanan Klinik Utama BKU tersedia untuk konsultasi gratis bagi seluruh sivitas akademik aktif.
                </p>
                <div className="flex flex-wrap gap-4 mb-12">
                  <div className="bg-white/5 px-5 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest border border-white/5 backdrop-blur-md">Gedung E - Lantai Dasar</div>
                  <div className="bg-white/5 px-5 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest border border-white/5 backdrop-blur-md">Hotline: 0812-BKU-MEDIC</div>
                </div>
                <button className="px-10 py-5 bg-[#f97316] text-white font-black rounded-3xl hover:bg-[#ea580c] transition-all flex items-center gap-3 shadow-xl shadow-orange-500/20 active:scale-95">
                  Reservasi Konsul <ArrowRight size={22} />
                </button>
              </div>
              <Activity size={350} className="absolute right-[-100px] bottom-[-100px] text-white opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
           </motion.div>

           <div className="bg-white rounded-3xl p-12 border border-[#e5e5e5] flex flex-col justify-between shadow-sm hover:shadow-xl transition-all hover:bg-[#fafafa]/50">
              <div>
                <div className="flex items-center gap-5 mb-8">
                   <div className="p-4 bg-[#f0fdf4] rounded-[24px] text-[#16a34a] border border-[#dcfce7]">
                      <ShieldCheck size={32} />
                   </div>
                   <h4 className="text-2xl font-black tracking-tight">Kerahasiaan Rekam Medis</h4>
                </div>
                <p className="text-base text-[#525252] font-semibold leading-relaxed mb-8">
                  BKU Student Hub berkomitmen menjaga 100% privasi data kesehatan Anda. Riwayat medis hanya dapat diakses oleh Anda dan tenaga medis universitas yang bersertifikasi untuk keperluan klinis resmi saja.
                </p>
                <div className="p-5 bg-[#fafafa] rounded-3xl border border-[#e5e5e5] flex items-center gap-4">
                   <AlertCircle size={20} className="text-[#3b82f6] shrink-0" />
                   <p className="text-[10px] font-bold text-[#a3a3a3] uppercase leading-tight italic">
                     Data mandiri digunakan sebagai referensi awal, bukan hasil diagnosis medis final.
                   </p>
                </div>
              </div>
              <div className="mt-12 pt-10 border-t border-[#f5f5f5] flex items-center justify-between text-[#a3a3a3]">
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <span className="text-xs font-black uppercase tracking-widest tracking-tighter">Verified System 2026</span>
                </div>
                <div className="w-10 h-1 bg-[#e5e5e5] rounded-full" />
              </div>
           </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isInputOpen && (
          <InputModal 
            onClose={() => setIsInputOpen(false)} 
            onSubmit={handleInputSubmit}
            isLoading={mandiriMutation.isPending}
          />
        )}
        {selectedDetail && (
          <DetailModal 
            record={selectedDetail} 
            onClose={() => setSelectedDetail(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ label, value, unit, icon }) {
  return (
    <div className="space-y-4 group/stat">
      <div className="flex items-center gap-2.5 text-[#a3a3a3] font-black text-[10px] uppercase tracking-widest group-hover/stat:text-[#f97316] transition-colors">
         {icon} {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-black text-[#171717] tracking-tight group-hover/stat:scale-105 transition-transform duration-500 inline-block">{value}</span>
        <span className="text-xs font-black text-[#d4d4d4] uppercase">{unit}</span>
      </div>
    </div>
  );
}

function BPReference({ label, range, color, text }) {
  return (
    <div className="group/bp">
      <div className="flex items-center justify-between mb-2">
         <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none bg-white/5 px-2 py-1 rounded-md">{label}</span>
         <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg bg-opacity-10 border border-opacity-30 ${text} border-current`}>
           {range}
         </span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
         <div className={`h-full ${color} w-full opacity-30 shadow-[0_0_15px_-3px] group-hover/bp:opacity-60 transition-opacity`} />
      </div>
    </div>
  );
}

function EmptyState({ onOpen }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-24 border-4 border-dashed border-[#e5e5e5] text-center mb-12 shadow-sm"
    >
       <div className="w-28 h-28 bg-[#fafafa] rounded-3xl flex items-center justify-center mx-auto mb-10 border border-[#e5e5e5] shadow-inner">
          <Stethoscope size={48} className="text-[#d4d4d4]" />
       </div>
       <h3 className="text-3xl font-black text-[#171717] mb-4 font-headline tracking-tighter">Belum Ada Catatan Kesehatan</h3>
       <p className="text-[#a3a3a3] font-medium max-w-md mx-auto mb-14 leading-relaxed text-xl">
          Mulailah perjalanan hidup sehatmu hari ini dengan menginput data biometrik mandiri pertamamu.
       </p>
       <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpen}
        className="px-14 py-6 bg-[#171717] text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl shadow-black/20 text-lg flex items-center gap-3 mx-auto"
       >
         <Plus size={24} strokeWidth={3} /> Input Sekarang
       </motion.button>
    </motion.div>
  );
}

function InputModal({ onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    tinggi_badan: '',
    berat_badan: '',
    sistolik: '',
    diastolik: '',
    keluhan: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  const bmi = useMemo(() => {
    if (!formData.tinggi_badan || !formData.berat_badan) return null;
    const h = formData.tinggi_badan / 100;
    const res = (formData.berat_badan / (h * h));
    return isNaN(res) ? null : res.toFixed(1);
  }, [formData.tinggi_badan, formData.berat_badan]);

  const bmiCat = getBMICategory(bmi);
  const bpStat = getBPStatus(formData.sistolik, formData.diastolik);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#171717]/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Sidebar: Live Indicators */}
        <div className="w-full md:w-[360px] bg-[#171717] p-10 flex flex-col justify-between text-white border-r border-white/5">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                 <div className="w-10 h-10 rounded-2xl bg-[#f97316] flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Activity size={24} strokeWidth={3} />
                 </div>
                 <h2 className="text-xl font-black font-headline tracking-widest">LIVE ANALYTICS</h2>
              </div>

              <div className="space-y-12">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">IMT/BMI METER</label>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black tracking-tighter">{bmi || '--.-'}</span>
                       <span className="text-xs font-bold text-white/30 uppercase">POINTS</span>
                    </div>
                    {bmi && (
                       <div className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${bmiCat.color}`}>
                          <div className={`w-2 h-2 rounded-full ${bmiCat.light} shadow-lg`} />
                          {bmiCat.label}
                       </div>
                    )}
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-4 relative">
                       <AnimatePresence>
                        {bmi && (
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${Math.min(Math.max((bmi / 40) * 100, 5), 100)}%` }}
                            className={`h-full ${bmiCat.light} shadow-[0_0_15px] shadow-current transition-colors`} 
                          />
                        )}
                       </AnimatePresence>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">BLOOD PRESSURE</label>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-black tracking-tighter">
                          {formData.sistolik || '--'}<span className="text-white/20">/</span>{formData.diastolik || '--'}
                       </span>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                      bpStat.label === 'Pending' ? 'text-white/30 border-white/5' : `border-current ${bpStat.color} bg-opacity-5`
                    }`}>
                       {bpStat.label === 'Pending' ? 'MENUNGGU INPUT' : `STATUS: ${bpStat.label}`}
                    </div>
                 </div>
              </div>
           </div>

           <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 relative z-10">
              <p className="text-[10px] font-medium text-white/40 leading-relaxed italic">
                Sistem akan menghitung indikator kesehatan secara otomatis berdasarkan data yang Anda masukkan.
              </p>
           </div>
           
           <Heart size={300} className="absolute left-[-100px] bottom-[-100px] text-white opacity-[0.02] pointer-events-none" />
        </div>

        {/* Right Form: Input Fields */}
        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-white">
           <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-[#171717] tracking-tight">Perbarui Biometrik</h3>
                <p className="text-xs font-bold text-[#a3a3a3] uppercase mt-1">Laporan Kesehatan Mandiri BKU</p>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-2xl bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center text-[#d4d4d4] hover:text-[#171717] hover:border-[#171717] transition-all"
              >
                <X size={24}/>
              </button>
           </div>

           <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <InputField 
                    label="Tinggi Badan" 
                    unit="cm" 
                    value={formData.tinggi_badan}
                    onChange={v => setFormData({ ...formData, tinggi_badan: v })}
                    icon={<TrendingUp size={16}/>}
                    placeholder="Contoh: 170"
                 />
                 <InputField 
                    label="Berat Badan" 
                    unit="kg" 
                    value={formData.berat_badan}
                    onChange={v => setFormData({ ...formData, berat_badan: v })}
                    icon={<Scale size={16}/>}
                    placeholder="Contoh: 65"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <InputField 
                    label="Tensi Sistolik" 
                    unit="mmHg" 
                    value={formData.sistolik}
                    onChange={v => setFormData({ ...formData, sistolik: v })}
                    icon={<Activity size={16}/>}
                    placeholder="Contoh: 120"
                 />
                 <InputField 
                    label="Tensi Diastolik" 
                    unit="mmHg" 
                    value={formData.diastolik}
                    onChange={v => setFormData({ ...formData, diastolik: v })}
                    icon={<Activity size={16}/>}
                    placeholder="Contoh: 80"
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[#171717] uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar size={14} className="text-[#f97316]"/> Tanggal Pengukuran Data
                 </label>
                 <input 
                  type="date"
                  className="w-full px-8 py-5 bg-[#fafafa] border border-[#e5e5e5] rounded-3xl font-black text-lg focus:outline-none focus:border-[#171717] focus:ring-4 focus:ring-black/5 transition-all"
                  value={formData.tanggal}
                  onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-[#171717] uppercase tracking-widest ml-1 flex items-center gap-2">
                   <FileText size={14} className="text-[#f97316]"/> Keluhan atau Catatan Medis (Opsional)
                 </label>
                 <textarea 
                  rows={4}
                  placeholder="Ceritakan kondisi kesehatanmu atau keluhan yang kamu rasakan..."
                  className="w-full px-8 py-5 bg-[#fafafa] border border-[#e5e5e5] rounded-3xl font-medium text-base focus:outline-none focus:border-[#171717] focus:ring-4 focus:ring-black/5 transition-all resize-none"
                  value={formData.keluhan}
                  onChange={e => setFormData({ ...formData, keluhan: e.target.value })}
                 />
              </div>
           </div>

           <div className="mt-12 flex flex-col-reverse md:flex-row gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-5 bg-white border-2 border-[#e5e5e5] text-[#a3a3a3] font-black rounded-3xl hover:bg-[#fafafa] hover:text-[#171717] hover:border-[#171717] transition-all"
              >
                 BATALKAN
              </button>
              <button 
                disabled={isLoading || !formData.tinggi_badan || !formData.berat_badan}
                onClick={() => onSubmit({
                  ...formData,
                  tinggi_badan: parseFloat(formData.tinggi_badan),
                  berat_badan: parseFloat(formData.berat_badan),
                  sistolik: parseInt(formData.sistolik) || 0,
                  diastolik: parseInt(formData.diastolik) || 0,
                  tanggal: new Date(formData.tanggal).toISOString()
                })}
                className="flex-[2] py-5 bg-[#171717] text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl shadow-black/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>SIMPAN REKAM MEDIS <CheckCircle2 size={22} /></>
                )}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, unit, value, onChange, icon, placeholder }) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black text-[#171717] uppercase tracking-widest ml-1 flex items-center gap-2">
          {icon} {label} ({unit})
       </label>
       <input 
        type="number"
        placeholder={placeholder}
        className="w-full px-8 py-5 bg-[#fafafa] border border-[#e5e5e5] rounded-3xl font-black text-xl focus:outline-none focus:border-[#171717] focus:ring-4 focus:ring-black/5 transition-all text-[#171717]"
        value={value}
        onChange={e => onChange(e.target.value)}
       />
    </div>
  );
}

function DetailModal({ record, onClose }) {
  const bmiCat = getBMICategory(record.bmi);
  const bpStat = getBPStatus(record.sistolik, record.diastolik);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#171717]/90 backdrop-blur-3xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        className="relative bg-white w-full max-w-2xl rounded-[60px] shadow-2xl overflow-hidden"
      >
        <div className={`p-12 ${bmiCat.bg} border-b-2 ${bmiCat.border}/20 relative`}>
           <div className="flex items-center justify-between mb-10">
              <div className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-white border shadow-sm ${bmiCat.color}`}>
                BMI STATUS: {bmiCat.label}
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center text-[#a3a3a3] hover:text-[#171717] transition-all"
              >
                <X size={28}/>
              </button>
           </div>
           <h2 className="text-5xl font-black font-headline tracking-tighter text-[#171717] mb-3">Rekam Medis</h2>
           <p className="text-base font-bold text-[#a3a3a3] uppercase tracking-widest flex items-center gap-3">
             <Calendar size={18} className="text-[#f97316]"/> {new Date(record.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
           </p>
           
           <Activity size={200} className="absolute right-[-60px] bottom-[-60px] text-[#171717] opacity-[0.03] pointer-events-none" />
        </div>

        <div className="p-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
              <DetailStat label="Tinggi" value={record.tinggi_badan} unit="CM" />
              <DetailStat label="Berat" value={record.berat_badan} unit="KG" />
              <DetailStat label="BMI" value={record.bmi} unit="PT" />
              <DetailStat label="Tensi" value={`${record.sistolik}/${record.diastolik}`} unit="MMHG" />
           </div>

           <div className="space-y-8">
              {record.keluhan && (
                <div className="p-8 bg-[#fafafa] rounded-[40px] border border-[#e5e5e5] relative group">
                   <h4 className="flex items-center gap-3 text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest mb-4">
                      <Bookmark size={16} className="text-[#f97316]" /> Keluhan Mahasiswa
                   </h4>
                   <p className="text-lg font-medium text-[#171717] leading-relaxed italic pr-6 italic">
                      "{record.keluhan}"
                   </p>
                </div>
              )}

              {record.catatan_medis && (
                <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 relative group shadow-sm transition-all hover:shadow-xl hover:shadow-blue-200/20">
                   <h4 className="flex items-center gap-3 text-[11px] font-black text-[#1e40af] uppercase tracking-widest mb-4">
                      <AlertCircle size={16} className="text-blue-500" /> Analisis Medis & Saran
                   </h4>
                   <p className="text-lg font-black text-blue-900/80 leading-relaxed">
                      {record.catatan_medis}
                   </p>
                </div>
              )}
              
              <div className="flex items-center justify-between p-8 bg-[#171717] rounded-[40px] text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02]">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/5 shadow-inner">
                       <User size={28} className="text-[#f97316]" />
                    </div>
                    <div>
                       <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Authoritas Data</p>
                       <p className="font-black text-xl capitalize tracking-tight">{record.sumber.replace('_', ' ')}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Health Grade</p>
                    <p className={`text-sm font-black uppercase tracking-widest ${recStatusColor(record.status_kesehatan)}`}>
                       {record.status_kesehatan.replace('_', ' ')}
                    </p>
                 </div>
              </div>
           </div>

           <motion.button 
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full mt-14 py-6 bg-[#fafafa] text-[#a3a3a3] font-black rounded-3xl hover:bg-[#171717] hover:text-white transition-all shadow-inner tracking-widest text-xs"
           >
              CLOSE RECORDS
           </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function DetailStat({ label, value, unit }) {
  return (
    <div className="space-y-2 group/dstat">
      <span className="text-[11px] font-black text-[#a3a3a3] uppercase tracking-widest block transition-colors group-hover/dstat:text-[#f97316]">{label}</span>
      <p className="text-3xl font-black text-[#171717] tracking-tighter">
        {value} <span className="text-[11px] text-[#d4d4d4] font-bold">{unit}</span>
      </p>
    </div>
  );
}

const recStatusColor = (status) => {
   return status === 'sehat' ? 'text-green-400' : 'text-orange-400';
};
