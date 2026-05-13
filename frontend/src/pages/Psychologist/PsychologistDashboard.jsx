import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, ClipboardCheck, 
  TrendingUp, ArrowRight, Activity, 
  CheckCircle2, AlertCircle, FileText
} from 'lucide-react';
import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

export default function PsychologistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    psychologistService.getDashboard().then((res) => {
      if (!ignore) setDashboard(res.data);
    }).catch(() => {
      if (!ignore) setDashboard(null);
    });
    return () => { ignore = true; };
  }, []);

  const psychoStats = dashboard?.stats || [
    { label: 'Total Pasien', value: '0', progress: '0%', color: 'bg-blue-500' },
    { label: 'Sesi Selesai', value: '0', progress: '0%', color: 'bg-emerald-500' },
    { label: 'Menunggu', value: '0', progress: '0%', color: 'bg-amber-500' },
  ];
  const bookings = dashboard?.bookings || [];
  const waitingCount = dashboard?.waiting_count ?? 0;
  const profileName = dashboard?.profile?.nama || 'Psikolog';
  const currentSession = dashboard?.current_session || { available: false };
  const recentActivities = dashboard?.recent_activities || [];

  const services = [
    { name: 'Jadwal', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', path: '/psychologist/schedule' },
    { name: 'Rekam', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/psychologist/patients' },
    { name: 'Asesmen', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/psychologist/assessments' },
    { name: 'Analitik', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', path: '/psychologist/analytics' },
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
                Selamat Sore, {profileName}! 👋
              </h1>
              <p className="text-sm font-medium text-on-primary-container/80 mt-1 max-w-md">
                Ada {waitingCount} antrean menunggu perhatian Anda hari ini.
              </p>
              <div className="mt-4 flex gap-3">
                <button onClick={() => navigate('/psychologist/bookings')} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition-all">
                  Lihat Hari Ini
                </button>
                <button onClick={() => navigate('/psychologist/patients')} className="bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-white/30 transition-all">
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
                    <h4 className="font-bold text-primary text-sm">{currentSession.available ? currentSession.name : 'Tidak ada sesi aktif'}</h4>
                    <p className="text-on-secondary-container text-[10px] font-medium">{currentSession.available ? currentSession.issue : 'Jadwal hari ini kosong'}</p>
                  </div>
                </div>
                <button onClick={() => currentSession.available && navigate(`/psychologist/patients/${currentSession.mahasiswa_id}/medical-record`)} className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm">
                  Buka Rekam Medis
                </button>
              </div>
            </div>

            {/* Right Content (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Compact Quick Access */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {services.map((item, i) => (
                  <button key={i} onClick={() => navigate(item.path)} className="group flex flex-col items-center justify-center p-4 bg-surface-container-low rounded-[1.5rem] border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-md transition-all">
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
                  <button onClick={() => navigate('/psychologist/bookings')} className="text-primary text-[10px] font-bold hover:underline">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                  {bookings.slice(0, 2).map((booking) => (
                    <button key={booking.id} onClick={() => navigate(`/psychologist/bookings/${booking.id}`)} className="w-full text-left bg-surface-container-low p-3 rounded-xl flex items-center gap-3 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-xs">{booking.name}</h5>
                        <p className="text-[10px] text-on-surface-variant truncate italic">"{booking.note || booking.issue}"</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                    </button>
                  ))}
                  {bookings.length === 0 && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum ada booking baru</p>}
                </div>
              </div>

              <div className={UI.card.base + " p-5"}>
                <h3 className="font-bold text-primary text-sm mb-4">Aktivitas Database Terbaru</h3>
                <div className="space-y-3">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-surface-container-low">
                      <div className="size-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center"><Clock size={14} /></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{activity.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{activity.description}</p>
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">{activity.time}</span>
                    </div>
                  ))}
                  {recentActivities.length === 0 && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum ada aktivitas</p>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
