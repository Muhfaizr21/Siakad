import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  TrendingUp, Calendar, Users, Activity,
  ArrowUpRight, ArrowDownRight, Filter,
  Download, BarChart3, PieChart, LineChart,
  Brain, AlertCircle, CheckCircle2,
  Clock, MessageSquare
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function AnalyticsTrends() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('6 Bulan Terakhir');

  const stats = [
    { label: 'Total Pasien Unik', value: '1,284', trend: '+12%', isPositive: true, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
    { label: 'Sesi Selesai', value: '452', trend: '+8%', isPositive: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Kasus Mendesak', value: '12', trend: '-15%', isPositive: true, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Kepuasan Layanan', value: '4.9', trend: '+2%', isPositive: true, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const topIssues = [
    { name: 'Stres Akademik', percentage: 45, color: 'bg-primary' },
    { name: 'Kecemasan Karir', percentage: 25, color: 'bg-indigo-500' },
    { name: 'Masalah Relasi', percentage: 15, color: 'bg-rose-500' },
    { name: 'Lain-lain', percentage: 15, color: 'bg-slate-300' },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Header & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
             <div>
                <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Analitik & Tren</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Pantau statistik kesehatan mental mahasiswa secara kolektif</p>
             </div>
             <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
                   <Calendar size={16} className="text-slate-400" />
                   <select 
                     value={timeRange}
                     onChange={(e) => setTimeRange(e.target.value)}
                     className="text-[10px] font-black uppercase tracking-widest outline-none bg-transparent cursor-pointer"
                   >
                      <option>30 Hari Terakhir</option>
                      <option>6 Bulan Terakhir</option>
                      <option>1 Tahun Terakhir</option>
                   </select>
                </div>
                <button className="p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary shadow-sm transition-all">
                   <Download size={18} />
                </button>
             </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:scale-[1.03] transition-all">
                   <div className="flex items-center justify-between mb-4">
                      <div className={`size-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                         <stat.icon size={24} />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${stat.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                         {stat.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                         {stat.trend}
                      </div>
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1 font-headline">{stat.value}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* Main Chart Card (Col 8) */}
             <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-10">
                      <div>
                         <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <LineChart size={18} /> Tren Konseling Bulanan
                         </h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Volume sesi selama {timeRange}</p>
                      </div>
                      <div className="flex gap-2">
                         <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                            <div className="size-2 bg-primary rounded-full"></div>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tahun Ini</span>
                         </div>
                      </div>
                   </div>

                   {/* Mock Chart Area */}
                   <div className="h-64 flex items-end justify-between gap-4 px-2">
                      {[40, 65, 45, 90, 75, 85, 60, 95, 80, 100, 70, 85].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                           <div className="w-full relative">
                              <div 
                                className="w-full bg-slate-50 rounded-full group-hover:bg-primary/10 transition-colors" 
                                style={{ height: '200px' }}
                              ></div>
                              <div 
                                className="absolute bottom-0 left-0 w-full bg-primary rounded-full group-hover:bg-indigo-600 transition-all duration-700"
                                style={{ height: `${h}%` }}
                              >
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}
                                 </div>
                              </div>
                           </div>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                              {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][i]}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
                      <div className="relative z-10">
                         <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 text-white/50">Isu Paling Dominan</h4>
                         <div className="space-y-6">
                            {topIssues.map((issue, i) => (
                               <div key={i}>
                                  <div className="flex justify-between items-center mb-2">
                                     <span className="text-[10px] font-black uppercase tracking-widest">{issue.name}</span>
                                     <span className="text-[10px] font-black">{issue.percentage}%</span>
                                  </div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                     <div className={`h-full ${issue.color} rounded-full`} style={{ width: `${issue.percentage}%` }}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                      <Brain size={150} className="absolute -right-12 -bottom-12 text-white/5" />
                   </div>

                   <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="size-32 rounded-full border-[12px] border-slate-50 flex items-center justify-center relative mb-6">
                         <div className="absolute inset-0 rounded-full border-[12px] border-emerald-500 border-t-transparent -rotate-45"></div>
                         <div className="text-center">
                            <p className="text-2xl font-black text-slate-900 leading-none">82%</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Stabil</p>
                         </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-2">Kesehatan Mental Kampus</h4>
                      <p className="text-[10px] font-medium text-slate-400 uppercase leading-relaxed px-4">
                         Sebagian besar mahasiswa dalam kondisi psikologis stabil bulan ini.
                      </p>
                   </div>
                </div>
             </div>

             {/* Side Insights (Col 4) */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                   <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-8">
                      <TrendingUp size={18} /> Rekomendasi Klinis
                   </h3>
                   <div className="space-y-6">
                      <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 relative overflow-hidden group hover:bg-primary/10 transition-colors">
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                               <div className="p-1.5 bg-primary text-white rounded-lg">
                                  <AlertCircle size={14} />
                               </div>
                               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Tindakan Diperlukan</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-700 leading-relaxed uppercase">
                               Tren stres akademik naik tajam menjelang UTS. Disarankan mengadakan workshop "Stress Management".
                            </p>
                         </div>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100 relative overflow-hidden group hover:bg-emerald-100 transition-colors">
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                               <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                                  <CheckCircle2 size={14} />
                               </div>
                               <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Insight Positif</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-700 leading-relaxed uppercase">
                               Program meditasi harian di asrama berhasil menurunkan tingkat kecemasan sebesar 15%.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                   <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-8">
                      <Clock size={18} /> Aktivitas Terakhir
                   </h3>
                   <div className="space-y-6">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex gap-4 group cursor-pointer">
                           <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                              <MessageSquare size={18} />
                           </div>
                           <div className="flex-1">
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Sesi Baru Selesai</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">30 Menit yang lalu • Farmasi</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

          </div>

        </div>
      </main>
    </div>
  );
}
