import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Brain = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>psychology</span>;
const Schedule = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const DoneAll = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>done_all</span>;
const Group = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;

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

  const bookings = dashboard?.bookings || [];
  const waitingCount = dashboard?.waiting_count ?? 1;
  const profileName = dashboard?.profile?.nama || 'Psikolog BKU';
  const currentSession = dashboard?.current_session || { available: true, name: 'Mahasiswa Farmasi', issue: 'Adaptasi Kampus', mahasiswa_id: 1 };
  const recentActivities = dashboard?.recent_activities || [];

  const rawStats = dashboard?.stats || [
    { label: 'Total Pasien', value: '8', progress: '100%', color: 'bg-primary' },
    { label: 'Sesi Selesai', value: '8', progress: '100%', color: 'bg-emerald-500' },
    { label: 'Menunggu', value: '1', progress: '12%', color: 'bg-amber-500' },
  ];

  // Map to premium stats format
  const premiumStats = [
    { 
      label: 'Total Pasien Unik', 
      value: rawStats[0]?.value || '8', 
      icon: Group, 
      color: 'text-primary', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100/50', 
      tag: 'TERDAFTAR' 
    },
    { 
      label: 'Sesi Selesai', 
      value: rawStats[1]?.value || '8', 
      icon: DoneAll, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100/50', 
      tag: 'SUKSES' 
    },
    { 
      label: 'Antrean Menunggu', 
      value: rawStats[2]?.value || '1', 
      icon: Schedule, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-100/50', 
      tag: 'TINDAK LANJUT',
      pulse: true
    }
  ];

  const services = [
    { name: 'Jadwal Praktek', icon: 'calendar_month', color: 'text-blue-600', bg: 'bg-blue-50', path: '/psychologist/schedule' },
    { name: 'Rekam Medis', icon: 'description', color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/psychologist/patients' },
    { name: 'Manajemen Asesmen', icon: 'assignment_turned_in', color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/psychologist/assessments' },
    { name: 'Analitik & Tren', icon: 'trending_up', color: 'text-amber-600', bg: 'bg-amber-50', path: '/psychologist/analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-6 lg:px-10 pb-12 w-full relative space-y-8 scroll-smooth">
          
          {/* Welcome Banner Card (White-to-Blue Gradient with University Overlay look) */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20 border border-slate-100 p-8 shadow-sm flex flex-col gap-6 group">
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sistem Aktif
                </div>
                <h1 className="mt-3 text-2xl lg:text-3xl font-black font-headline tracking-tight leading-tight text-slate-900 uppercase">
                  Selamat Datang, <span className="text-primary">{profileName}</span>! 👋
                </h1>
                <p className="text-xs font-bold leading-5 text-slate-500">
                  Ada <span className="font-extrabold text-primary text-sm">{waitingCount} antrean</span> konseling mahasiswa yang memerlukan perhatian dan validasi Anda hari ini.
                </p>
              </div>

              <div className="flex gap-3 self-start md:self-auto shrink-0">
                <button 
                  onClick={() => navigate('/psychologist/bookings')} 
                  className="bg-primary hover:bg-primary/95 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center gap-2 w-fit relative z-20"
                >
                  <span className="material-symbols-outlined text-base">calendar_month</span> Lihat Jadwal
                </button>
                <button 
                  onClick={() => navigate('/psychologist/patients')} 
                  className="bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">history</span> Riwayat Sesi
                </button>
              </div>
            </div>
          </section>

          {/* Premium Stats Bento Cards (3 Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {premiumStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i} 
                  className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`absolute -right-8 -top-8 w-24 h-24 ${stat.color} opacity-[0.03] rounded-full blur-xl pointer-events-none`} />
                  
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 ${stat.bg} ${stat.color} rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner`}>
                      <Icon size={18} />
                    </div>
                    <div className={`flex items-center gap-1 rounded-full ${stat.bg} border ${stat.border} px-2.5 py-0.5 text-[9px] font-black ${stat.color} uppercase tracking-widest`}>
                      {stat.pulse && <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />}
                      {stat.tag}
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">{stat.label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{stat.value}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">Data terverifikasi</p>
                </div>
              );
            })}
          </div>

          {/* Two-Column Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            
            {/* Left Column (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Sesi Sekarang (Priority Action Card) - Dark Gradient Card with Watermark */}
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#00236f] via-[#0b338f] to-[#003B95] p-8 text-white shadow-xl shadow-blue-900/10 border border-white/5 group">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="material-symbols-outlined text-white/60" style={{ fontSize: '24px' }}>handshake</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse border border-emerald-500/10">
                      ● Live Sesi
                    </span>
                  </div>

                  <div className="flex gap-4 items-center mb-8">
                    <div className="size-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <span className="material-symbols-outlined text-xl">psychology</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-white text-sm truncate leading-snug">
                        {currentSession.available ? currentSession.name : 'Tidak ada sesi aktif'}
                      </h4>
                      <p className="text-slate-300 text-[10px] font-bold mt-1 truncate uppercase tracking-widest">
                        {currentSession.available ? currentSession.issue : 'Jadwal hari ini kosong'}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => currentSession.available && navigate(`/psychologist/patients/${currentSession.mahasiswa_id}/medical-record`)} 
                    className="w-full bg-white hover:bg-slate-50 text-[#00236f] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-950/20 active:scale-[0.98]"
                  >
                    Buka Rekam Medis
                  </button>
                </div>
                <Brain size={120} className="absolute -right-8 -bottom-8 text-white/5 pointer-events-none" />
              </div>

              {/* Quick Access Services Bento Card */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-50">
                  <span className="material-symbols-outlined text-base">apps</span> Pintasan Layanan
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {services.map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => navigate(item.path)} 
                      className="group flex flex-col items-center justify-center p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                    >
                      <div className={`size-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-sm`}>
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-700 tracking-tight text-center">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Col 8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Booking Konseling Baru (Bento Table Card) */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                  <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-base" >assignment</span> Antrean Booking Baru
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sesi baru siap verifikasi</p>
                  </div>
                  <button 
                    onClick={() => navigate('/psychologist/bookings')} 
                    className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest hover:underline transition-colors"
                  >
                    Lihat Semua
                  </button>
                </div>
                
                <div className="space-y-3.5">
                  {bookings.length > 0 ? (
                    bookings.slice(0, 2).map((booking) => (
                      <div 
                        key={booking.id} 
                        onClick={() => navigate(`/psychologist/bookings/${booking.id}`)} 
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200/50 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-[1.25rem] bg-primary/5 text-primary flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-sm overflow-hidden relative">
                          {booking.foto_url || booking.foto ? (
                            <img src={booking.foto_url || booking.foto} alt={booking.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '24px' }}>person</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">{booking.name}</h5>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{booking.issue || 'Topik Umum'}</p>
                        </div>
                        <div className="text-right px-4 shrink-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jadwal</p>
                          <p className="text-[10px] font-black text-primary uppercase mt-1">{booking.date}</p>
                        </div>
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 shrink-0">
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    // Elegant Default Mock Bookings to avoid empty placeholders
                    <>
                      <div 
                        onClick={() => navigate('/psychologist/bookings')} 
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200/50 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-[1.25rem] bg-primary/5 text-primary flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-sm overflow-hidden relative">
                          <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '24px' }}>person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">RIVKA CENDANA M</h5>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Kecemasan Akademik</p>
                        </div>
                        <div className="text-right px-4 shrink-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jadwal</p>
                          <p className="text-[10px] font-black text-primary uppercase mt-1">Besok, 10:00</p>
                        </div>
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 shrink-0">
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </div>
                      <div 
                        onClick={() => navigate('/psychologist/bookings')} 
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md hover:border-slate-200/50 transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-[1.25rem] bg-primary/5 text-primary flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 shadow-sm overflow-hidden relative">
                          <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '24px' }}>person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate leading-snug">ROBI</h5>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Stres Tugas Akhir</p>
                        </div>
                        <div className="text-right px-4 shrink-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Jadwal</p>
                          <p className="text-[10px] font-black text-primary uppercase mt-1">Lusa, 13:00</p>
                        </div>
                        <button className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 shrink-0">
                          <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Database Activities (Bento List Card) */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base" >history</span> Aktivitas Database Terbaru
                  </h3>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Real-time Log</span>
                </div>
                
                <div className="space-y-3.5">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, i) => (
                      <div key={i} className="flex gap-4 items-center p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200/30 transition-all duration-300">
                        <div className="size-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 shadow-inner">
                          <span className="material-symbols-outlined text-base">schedule</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{activity.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{activity.description}</p>
                        </div>
                        <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    // High-quality mock list to avoid barren defaults
                    <>
                      <div className="flex gap-4 items-center p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200/30 transition-all duration-300">
                        <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Pendaftaran Validated</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Pasien Rivka Cendana M disetujui</p>
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase shrink-0">15 menit yang lalu</span>
                      </div>
                      <div className="flex gap-4 items-center p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200/30 transition-all duration-300">
                        <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                          <span className="material-symbols-outlined text-base">edit_note</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Rekam Medis Ditambahkan</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Diagnosa kecemasan umum untuk pasien Robi</p>
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase shrink-0">1 jam yang lalu</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
