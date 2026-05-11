import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  Users, Calendar, Clock, ClipboardCheck, 
  TrendingUp, ArrowRight, Activity, 
  CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function PsychologistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const psychoStats = [
    { label: 'Total Pasien', value: '128', progress: '100%', color: 'bg-blue-500' },
    { label: 'Sesi Selesai', value: '42', progress: '75%', color: 'bg-emerald-500' },
    { label: 'Menunggu', value: '12', progress: '25%', color: 'bg-amber-500' },
  ];

  const services = [
    { name: 'Jadwal', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-600' },
    { name: 'Rekam', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-600' },
    { name: 'Asesmen', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', hover: 'hover:bg-indigo-600' },
    { name: 'Analitik', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', hover: 'hover:bg-amber-600' },
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Compact Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl mb-6 group h-48 flex items-center">
            <div className="absolute inset-0 bg-primary-container z-0">
              <img 
                alt="Banner" 
                className="w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-105 transition-all duration-700" 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=2000" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-container via-primary-container/70 to-transparent"></div>
            </div>
            <div className="relative z-10 px-8">
              <h1 className="text-2xl font-black text-primary font-headline tracking-tight">
                Selamat Sore, Psikolog! 👋
              </h1>
              <p className="text-sm font-medium text-on-primary-container/80 mt-1 max-w-md">
                Ada 12 antrean menunggu perhatian Anda hari ini.
              </p>
              <div className="mt-4 flex gap-3">
                <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
                  Lihat Hari Ini
                </button>
                <button className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/30 transition-all">
                  Riwayat
                </button>
              </div>
            </div>
          </section>

          {/* Compact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Stats (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div className={UI.card.base + " p-5"}>
                <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-4">Statistik Klinis</h3>
                <div className="space-y-6">
                  {psychoStats.map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-on-surface-variant">{stat.label}</span>
                        <span className="text-lg font-black text-primary">{stat.value}</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: stat.progress }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Action (Compact) */}
              <div className="bg-secondary-container/30 p-5 rounded-3xl border border-secondary-container">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-primary text-sm">Sesi Sekarang</h3>
                  <span className="px-2 py-0.5 bg-white/50 rounded-full text-[9px] font-black text-secondary">LIVE</span>
                </div>
                <div className="flex gap-3 items-center mb-4">
                  <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-sm">Ahmad Syarif</h4>
                    <p className="text-on-secondary-container text-[10px] font-medium">Stres Akademik</p>
                  </div>
                </div>
                <button className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm">
                  Buka Rekam Medis
                </button>
              </div>
            </div>

            {/* Right Content (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Compact Quick Access */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {services.map((item, i) => (
                  <button key={i} className="group flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-[1.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-md transition-all">
                    <div className={`size-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-[11px] font-bold tracking-wide">{item.name}</span>
                  </button>
                ))}
              </div>

              {/* Compact List */}
              <div className={UI.card.base + " p-5"}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-primary text-sm">Booking Baru</h3>
                  <button className="text-primary text-[10px] font-bold hover:underline">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="bg-surface-container-low p-3 rounded-xl flex items-center gap-3 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-xs">John Doe Syahputra</h5>
                        <p className="text-[10px] text-on-surface-variant truncate italic">"Butuh bantuan terkait kecemasan skripsi."</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
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
