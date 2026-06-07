import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page';
import { DashboardHero, DashboardStatGrid, DashboardStatCard } from '@/components/ui/dashboard';

export default function PsychologistDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    psychologistService.getDashboard().then((res) => {
      if (!ignore) setDashboard(res.data);
    }).catch(() => {
      if (!ignore) setDashboard(null);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const bookings = dashboard?.bookings || [];
  const waitingCount = dashboard?.waiting_count ?? 1;
  const profileName = dashboard?.profile?.nama || 'Psikolog BKU';
  const currentSession = dashboard?.current_session || {
    available: true,
    name: 'Mahasiswa Farmasi',
    issue: 'Adaptasi Kampus',
    mahasiswa_id: 1,
  };
  const recentActivities = dashboard?.recent_activities || [];

  const rawStats = dashboard?.stats || [
    { label: 'Total Pasien', value: '8', progress: '100%', color: 'bg-primary' },
    { label: 'Sesi Selesai', value: '8', progress: '100%', color: 'bg-emerald-500' },
    { label: 'Menunggu', value: '1', progress: '12%', color: 'bg-amber-500' },
  ];

  const statCards = [
    {
      label: 'Total Pasien Unik',
      value: rawStats[0]?.value || '8',
      icon: 'group',
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10 border border-primary/20',
      accentGradient: 'from-primary/10',
      badge: { text: 'TERDAFTAR' },
    },
    {
      label: 'Sesi Selesai',
      value: rawStats[1]?.value || '8',
      icon: 'done_all',
      colorClass: 'text-success',
      bgClass: 'bg-success/10 border border-success/20',
      accentGradient: 'from-success/10',
      badge: { text: 'SUKSES' },
    },
    {
      label: 'Antrean Menunggu',
      value: rawStats[2]?.value || '1',
      icon: 'schedule',
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10 border border-warning/20',
      accentGradient: 'from-warning/10',
      badge: { text: 'TINDAK LANJUT', icon: 'warning' },
    },
  ];

  const services = [
    { name: 'Jadwal Praktek', icon: 'calendar_month', path: '/psychologist/schedule' },
    { name: 'Rekam Medis', icon: 'description', path: '/psychologist/patients' },
    { name: 'Manajemen Asesmen', icon: 'assignment_turned_in', path: '/psychologist/assessments' },
    { name: 'Analitik & Tren', icon: 'trending_up', path: '/psychologist/analytics' },
  ];

  const fallbackBookings = [
    {
      id: 'fallback-rivka',
      name: 'RIVKA CENDANA M',
      issue: 'Kecemasan Akademik',
      date: 'Besok, 10:00',
    },
    {
      id: 'fallback-robi',
      name: 'ROBI',
      issue: 'Stres Tugas Akhir',
      date: 'Lusa, 13:00',
    },
  ];

  const displayedBookings = bookings.length > 0 ? bookings.slice(0, 2) : fallbackBookings;

  const fallbackActivities = [
    {
      title: 'Pendaftaran Validated',
      description: 'Pasien Rivka Cendana M disetujui',
      time: '15m lalu',
      icon: 'check_circle',
      className: 'bg-success/10 text-success border border-success/20',
    },
    {
      title: 'Rekam Medis Ditambahkan',
      description: 'Diagnosa kecemasan umum untuk pasien Robi',
      time: '1j lalu',
      icon: 'edit_note',
      className: 'bg-info/10 text-info border border-info/20',
    },
  ];

  const displayedActivities = recentActivities.length > 0
    ? recentActivities.map((activity) => ({
      ...activity,
      icon: 'schedule',
      className: 'bg-primary/10 text-primary border border-primary/20',
    }))
    : fallbackActivities;

  return (
    <PageContent>
      <DashboardHero
        title="Selamat Datang,"
        highlightedTitle={`${profileName}!`}
        subtitle={`Ada ${waitingCount} antrean konseling mahasiswa yang memerlukan perhatian dan validasi Anda hari ini.`}
        icon="psychology"
        badges={[
          { label: 'Portal Psikolog', active: false },
          { label: 'Sesi Aktif', active: true },
        ]}
        actions={
          <>
            <button
              onClick={() => navigate('/psychologist/bookings')}
              className="flex-1 md:flex-initial px-4 py-2 h-10 rounded-xl font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span> Lihat Jadwal
            </button>
            <button
              onClick={() => navigate('/psychologist/patients')}
              className="flex-1 md:flex-initial border border-border bg-surface px-4 py-2 h-10 rounded-xl font-bold text-xs transition-all hover:bg-muted/30 flex items-center justify-center gap-1.5 text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">history</span> Riwayat Sesi
            </button>
          </>
        }
      />

      <DashboardStatGrid>
        {statCards.map((card, i) => (
          <DashboardStatCard key={i} {...card} />
        ))}
      </DashboardStatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group shadow-md min-h-[180px]">
            <div className="absolute -right-8 -top-5 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 w-full">
              <div className="flex justify-between items-center mb-4">
                <span className="material-symbols-outlined text-white/60" style={{ fontSize: '20px' }}>handshake</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-bold uppercase tracking-wider border border-emerald-500/10">
                  Live Sesi
                </span>
              </div>
              <div className="flex gap-4 items-center mb-6">
                <div className="size-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-sm truncate leading-snug">
                    {currentSession.available ? currentSession.name : 'Tidak ada sesi aktif'}
                  </h4>
                  <p className="text-slate-200 text-xs font-medium mt-0.5 truncate uppercase tracking-wider">
                    {currentSession.available ? currentSession.issue : 'Jadwal hari ini kosong'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/psychologist/schedule')}
                className="w-full bg-surface hover:bg-black/[0.02] py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
                style={{ color: 'var(--theme-primary)' }}
              >
                Buka Rekam Medis
              </button>
            </div>
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-white/5 pointer-events-none" style={{ fontSize: '80px' }}>psychology</span>
          </div>

          <PageCard>
            <PageCardHeader title="Pintasan Layanan" icon="apps" />
            <div className="grid grid-cols-2 gap-4">
              {services.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="group flex flex-col items-center justify-center p-4 bg-background hover:bg-surface rounded-xl border border-border-muted hover:border-primary transition-all duration-300 w-full"
                >
                  <div className="size-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface tracking-tight text-center font-headline" style={{ color: 'var(--theme-text)' }}>{item.name}</span>
                </button>
              ))}
            </div>
          </PageCard>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <PageCard>
            <PageCardHeader
              title="Antrean Booking Baru"
              description="Sesi baru siap verifikasi"
              icon="assignment"
              action={
                <button
                  onClick={() => navigate('/psychologist/bookings')}
                  className="text-xs font-bold hover:underline transition-colors tracking-wider font-headline"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Lihat Semua
                </button>
              }
            />

            <div className="space-y-3">
              {displayedBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => navigate(bookings.length > 0 ? `/psychologist/bookings/${booking.id}` : '/psychologist/bookings')}
                  className="flex items-center justify-between p-3 rounded-xl bg-background border border-border-muted hover:bg-surface hover:border-border transition-all duration-300 group cursor-pointer h-[76px] min-h-[76px] max-h-[76px] overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0 h-full">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 border border-primary/20 bg-primary/10 text-primary overflow-hidden relative">
                      {booking.foto_url || booking.foto ? (
                        <img src={booking.foto_url || booking.foto} alt={booking.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '20px' }}>person</span>
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center gap-0.5 h-full">
                      <div className="text-[12px] font-bold text-slate-900 truncate leading-none m-0 p-0" style={{ color: 'var(--theme-text)' }}>{booking.name}</div>
                      <div className="text-[10px] text-muted/80 font-semibold uppercase tracking-wider truncate leading-none m-0 p-0">{booking.issue || 'Topik Umum'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 h-full">
                    <div className="text-right flex flex-col justify-center gap-1">
                      <p className="text-[9px] font-bold text-muted/80 uppercase tracking-wider leading-none m-0 p-0">Jadwal</p>
                      <p className="text-[11px] font-bold uppercase leading-none m-0 p-0" style={{ color: 'var(--theme-primary)' }}>{booking.date}</p>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-surface border border-border-muted flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 hover:border-primary transition-all duration-300 shrink-0 self-center">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PageCard>

          <PageCard>
            <PageCardHeader
              title="Aktivitas Database Terbaru"
              description="Log aktivitas sistem real-time"
              icon="history"
            />

            <div className="space-y-3">
              {displayedActivities.map((activity, i) => (
                <div key={`${activity.title}-${i}`} className="flex gap-4 items-center p-3 rounded-xl bg-background border border-border-muted hover:bg-surface hover:border-border transition-all duration-300">
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${activity.className}`}>
                    <span className="material-symbols-outlined text-base">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 uppercase tracking-tight" style={{ color: 'var(--theme-text)' }}>{activity.title}</p>
                    <p className="text-xs text-muted/80 font-medium mt-0.5">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          </PageCard>
        </div>
      </div>
    </PageContent>
  );
}
