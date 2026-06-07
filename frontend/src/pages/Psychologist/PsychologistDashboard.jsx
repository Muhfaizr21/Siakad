import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function PsychologistDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    psychologistService.getDashboard().then((res) => {
      if (!ignore) {
        setDashboard(res.data);
        setLoading(false);
      }
    }).catch(() => {
      if (!ignore) {
        setDashboard(null);
        setLoading(false);
      }
    });
    return () => { ignore = true; };
  }, []);

  const bookings = dashboard?.bookings || [];
  const waitingCount = dashboard?.waiting_count ?? 1;
  const profileName = dashboard?.profile?.nama || 'Psikolog BKU';
  const currentSession = dashboard?.current_session || {
    available: true,
    name: 'Robi Anugrah',
    issue: 'Kecemasan Akademik',
    mahasiswa_id: 1,
  };
  const recentActivities = dashboard?.recent_activities || [];

  const rawStats = dashboard?.stats || [
    { label: 'Total Pasien', value: '12', progress: '100%', color: 'bg-primary' },
    { label: 'Sesi Selesai', value: '8', progress: '100%', color: 'bg-emerald-500' },
    { label: 'Menunggu', value: '4', progress: '12%', color: 'bg-amber-500' },
  ];

  // Mockup data for Area chart
  const weeklyData = [
    { name: 'Sen', online: 2, offline: 1 },
    { name: 'Sel', online: 3, offline: 2 },
    { name: 'Rab', online: 1, offline: 4 },
    { name: 'Kam', online: 4, offline: 1 },
    { name: 'Jum', online: 2, offline: 3 },
    { name: 'Sab', online: 5, offline: 0 },
    { name: 'Min', online: 1, offline: 1 },
  ];

  // Mockup data for Pie chart (Faculty distribution)
  const facultyData = [
    { name: 'Farmasi', value: 45 },
    { name: 'Keperawatan', value: 30 },
    { name: 'Kesmas', value: 15 },
    { name: 'Lainnya', value: 10 },
  ];
  const PIE_COLORS = ['#0B4FAE', '#34d399', '#f59e0b', '#8b5cf6'];

  const statCards = [
    {
      title: 'Total Pasien',
      value: rawStats[0]?.value || '12',
      icon: 'group',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      trend: '+2 dari minggu lalu',
      trendUp: true
    },
    {
      title: 'Sesi Selesai',
      value: rawStats[1]?.value || '8',
      icon: 'task_alt',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      trend: '+5 dari minggu lalu',
      trendUp: true
    },
    {
      title: 'Antrean Booking',
      value: rawStats[2]?.value || '4',
      icon: 'pending_actions',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      trend: 'Perlu ditindaklanjuti',
      trendUp: false
    }
  ];

  const quickActions = [
    { label: 'Jadwal Praktek', icon: 'calendar_month', path: '/psychologist/schedule', color: 'text-blue-600 bg-blue-50' },
    { label: 'Rekam Medis', icon: 'medical_information', path: '/psychologist/patients', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Analitik', icon: 'analytics', path: '/psychologist/analytics', color: 'text-amber-600 bg-amber-50' },
  ];

  const fallbackBookings = [
    {
      id: '1',
      name: 'Rivka Cendana M',
      issue: 'Kecemasan Skripsi',
      date: 'Hari ini, 10:00 WIB',
      type: 'Online',
      status: 'Menunggu'
    },
    {
      id: '2',
      name: 'Robi Anugrah',
      issue: 'Manajemen Waktu',
      date: 'Besok, 13:00 WIB',
      type: 'Offline',
      status: 'Terkonfirmasi'
    },
    {
      id: '3',
      name: 'Siti Aminah',
      issue: 'Stres Akademik',
      date: 'Lusa, 09:00 WIB',
      type: 'Online',
      status: 'Menunggu'
    }
  ];

  const displayedBookings = bookings.length > 0 ? bookings : fallbackBookings;

  const fallbackActivities = [
    { title: 'Sesi Selesai', desc: 'Konseling dengan Rivka Cendana M', time: '1 jam lalu', icon: 'check_circle', color: 'text-emerald-500 bg-emerald-50' },
    { title: 'Booking Baru', desc: 'Robi Anugrah menjadwalkan sesi', time: '3 jam lalu', icon: 'event_available', color: 'text-blue-500 bg-blue-50' },
    { title: 'Rekam Medis Diperbarui', desc: 'Menambahkan catatan untuk sesi sebelumnya', time: 'Kemarin', icon: 'edit_document', color: 'text-violet-500 bg-violet-50' },
  ];

  const displayedActivities = recentActivities.length > 0
    ? recentActivities.map((activity, idx) => ({
      title: activity.title || 'Aktivitas',
      desc: activity.description || 'Tidak ada deskripsi',
      time: 'Baru saja',
      icon: 'history',
      color: 'text-slate-500 bg-slate-50'
    }))
    : fallbackActivities;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative space-y-6 min-h-screen bg-transparent font-inter pb-8">

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-20 w-72 h-72 bg-emerald-400/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>psychology</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                        Portal Psikolog
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                      Halo, {profileName}
                    </h1>
                    <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                      Selamat datang kembali. Anda memiliki <span className="font-bold text-primary">{waitingCount} antrean</span> sesi konseling mahasiswa yang perlu ditindaklanjuti hari ini.
                    </p>
                 </div>
              </div>
            </div>

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 pt-4 xl:pt-0 xl:pl-6 w-full xl:w-auto">
          <button onClick={() => navigate('/psychologist/bookings')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50">
            <span className="material-symbols-outlined text-base shrink-0">calendar_month</span>
            Jadwal Hari Ini
          </button>
          <button onClick={() => navigate('/psychologist/patients')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90">
            <span className="material-symbols-outlined text-base shrink-0">history_edu</span>
            Rekam Medis
          </button>
        </div>
      </section>

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full blur-xl group-hover:bg-slate-100 transition-colors duration-500 -z-10" />
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.color} ${stat.border}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <span className="material-symbols-outlined text-[12px]">{stat.trendUp ? 'trending_up' : 'trending_flat'}</span>
                {stat.trendUp ? 'Naik' : 'Tetap'}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-extrabold text-slate-800 font-headline mb-3 tabular-nums tracking-tight">{stat.value}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3">
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* LEFT COLUMN (8/12) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Chart Section */}
          <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 bg-white/50 px-5 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-800 font-headline">Statistik Sesi Konseling</CardTitle>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Distribusi sesi online dan offline minggu ini</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-[10px] font-bold text-slate-500 uppercase">Online</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span className="text-[10px] font-bold text-slate-500 uppercase">Offline</span></div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B4FAE" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#0B4FAE" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="online" name="Sesi Online" stroke="#0B4FAE" strokeWidth={3} fillOpacity={1} fill="url(#colorOnline)" activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="offline" name="Sesi Offline" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorOffline)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 bg-white/50 px-5 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-800 font-headline">Antrean Konseling</CardTitle>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Daftar mahasiswa yang menunggu konfirmasi</p>
              </div>
              <button onClick={() => navigate('/psychologist/bookings')} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider bg-primary/5 px-3 py-1.5 rounded-lg">
                Lihat Semua
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {displayedBookings.map((booking) => (
                  <div key={booking.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-primary transition-colors">{booking.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{booking.issue}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{booking.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-800">{booking.date}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${booking.status === 'Menunggu' ? 'text-amber-500' : 'text-emerald-500'}`}>{booking.status}</p>
                      </div>
                      <button onClick={() => navigate(`/psychologist/bookings/${booking.id}`)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN (4/12) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Live Session Widget */}
          <div className="bg-gradient-to-br from-primary via-primary to-[#003db5] rounded-2xl p-5 relative overflow-hidden shadow-md shadow-primary/20">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <span className="material-symbols-outlined text-white/80" style={{ fontSize: '24px' }}>record_voice_over</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sesi Aktif
                </span>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Pasien Saat Ini</p>
                <h4 className="font-extrabold text-white text-lg tracking-tight truncate">
                  {currentSession.available ? currentSession.name : 'Tidak ada sesi'}
                </h4>
                <p className="text-blue-100/80 text-sm font-medium mt-1 truncate">
                  {currentSession.available ? currentSession.issue : 'Jadwal Anda kosong saat ini'}
                </p>
              </div>

              <button
                onClick={() => currentSession.available ? navigate(`/psychologist/patients/${currentSession.mahasiswa_id}/medical-record`) : navigate('/psychologist/schedule')}
                className="w-full bg-white hover:bg-slate-50 text-primary py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                {currentSession.available ? 'Buka Rekam Medis' : 'Lihat Jadwal'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 bg-slate-50/50 px-5 py-4">
              <CardTitle className="text-[11px] font-black text-slate-800 font-headline uppercase tracking-widest">Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center p-3 rounded-[1.25rem] bg-white border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${action.color} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{action.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart: Pasien per Fakultas */}
          <Card className="border-slate-200/60 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 bg-slate-50/50 px-6 py-4">
              <CardTitle className="text-sm font-bold text-slate-800 font-headline uppercase tracking-wider">Demografi Fakultas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={facultyData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {facultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-slate-200/60 shadow-sm rounded-[1.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-100/80 bg-slate-50/50 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 font-headline uppercase tracking-wider">Aktivitas Terbaru</CardTitle>
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '18px' }}>history</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {displayedActivities.map((act, i) => (
                  <div key={i} className="p-5 flex gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{act.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{act.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{act.desc}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
