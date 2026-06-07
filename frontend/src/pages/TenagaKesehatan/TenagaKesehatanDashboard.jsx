import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenagaKesehatanService } from '../../services/api';
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page';
import { DashboardHero, DashboardStatGrid, DashboardStatCard } from '@/components/ui/dashboard';

export default function TenagaKesehatanDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    tenagaKesehatanService.getDashboard().then((res) => {
      if (!ignore) setDashboard(res.data);
    }).catch(() => {
      if (!ignore) setDashboard(null);
    });
    return () => { ignore = true; };
  }, []);

  const totalDiperiksa = dashboard?.total_diperiksa_hari_ini ?? 0;
  const belumScreening = dashboard?.belum_screening ?? 0;
  const perluPerhatian = dashboard?.perlu_perhatian ?? 0;
  const bookingCount = dashboard?.booking_hari_ini_count ?? 0;
  const bookings = dashboard?.bookings || [];
  const alerts = dashboard?.alerts || [];
  const profileName = dashboard?.profile?.nama || 'Tenaga Kesehatan';

  const statCards = [
    { 
      label: 'Diperiksa Hari Ini', 
      value: totalDiperiksa, 
      icon: 'done_all', 
      colorClass: 'text-success', 
      bgClass: 'bg-success/10 border border-success/20', 
      accentGradient: 'from-success/10',
      badge: { text: 'SELESAI' }
    },
    { 
      label: 'Belum Screening', 
      value: belumScreening, 
      icon: 'group', 
      colorClass: 'text-primary', 
      bgClass: 'bg-primary/10 border border-primary/20', 
      accentGradient: 'from-primary/10',
      badge: { text: 'MAHASISWA' }
    },
    { 
      label: 'Perlu Perhatian', 
      value: perluPerhatian, 
      icon: 'favorite', 
      colorClass: 'text-error', 
      bgClass: 'bg-error/10 border border-error/20', 
      accentGradient: 'from-error/10',
      badge: { text: perluPerhatian > 0 ? 'KRITIS' : 'AMAN', icon: perluPerhatian > 0 ? 'warning' : 'check' }
    }
  ];

  const services = [
    { 
      name: 'Jadwal Praktik', 
      icon: 'schedule', 
      path: '/tenagakes/schedule' 
    },
    { 
      name: 'Booking Masuk', 
      icon: 'calendar_month', 
      path: '/tenagakes/bookings' 
    },
    { 
      name: 'Daftar Pasien', 
      icon: 'people', 
      path: '/tenagakes/patients' 
    },
    { 
      name: 'Pengaturan', 
      icon: 'settings', 
      path: '/tenagakes/settings' 
    },
  ];

  return (
    <PageContent>
      {/* Page Header */}
      <DashboardHero
        title="Selamat Datang,"
        highlightedTitle={`${profileName}! 👋`}
        subtitle={`Hari ini Anda memiliki ${bookingCount} booking harian aktif.`}
        icon="medical_services"
        badges={[
          { label: 'Portal Kesehatan', active: false },
          { label: 'Sesi Aktif', active: true }
        ]}
        actions={
          <>
            <button
              onClick={() => navigate('/tenagakes/bookings')}
              className="flex-1 md:flex-initial px-4 py-2 h-10 rounded-xl font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span> Lihat Booking
            </button>
            <button
              onClick={() => navigate('/tenagakes/patients')}
              className="flex-1 md:flex-initial border border-border bg-surface px-4 py-2 h-10 rounded-xl font-bold text-xs transition-all hover:bg-muted/30 flex items-center justify-center gap-1.5 text-on-surface"
            >
              <span className="material-symbols-outlined text-sm">history</span> Riwayat Pasien
            </button>
          </>
        }
      />

      {/* Stats Cards */}
      <DashboardStatGrid>
        {statCards.map((card, i) => (
          <DashboardStatCard key={i} {...card} />
        ))}
      </DashboardStatGrid>

      {/* Two-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left Column (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Access Services */}
          <PageCard>
            <PageCardHeader title="Pintasan Layanan" icon="apps" />
            <div className="grid grid-cols-2 gap-4">
              {services.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => navigate(item.path)} 
                  className="group flex flex-col items-center justify-center p-4 bg-background hover:bg-surface rounded-xl border border-border-muted hover:border-primary transition-all duration-300 w-full"
                >
                  <div 
                    className="size-10 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm bg-primary/10 text-primary border border-primary/20"
                  >
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface tracking-tight text-center font-headline" style={{ color: 'var(--theme-text)' }}>{item.name}</span>
                </button>
              ))}
            </div>
          </PageCard>
        </div>

        {/* Right Column (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Booking Kesehatan Baru */}
          <PageCard>
            <PageCardHeader
              title="Antrean Booking Hari Ini"
              description="Daftar mahasiswa yang dijadwalkan hari ini"
              icon="assignment"
              action={
                <button 
                  onClick={() => navigate('/tenagakes/bookings')} 
                  className="text-xs font-bold hover:underline transition-colors tracking-wider font-headline"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Lihat Semua
                </button>
              }
            />
            
            <div className="space-y-3">
              {bookings.length > 0 ? (
                bookings.slice(0, 3).map((booking) => (
                  <div 
                    key={booking.id} 
                    onClick={() => navigate(`/tenagakes/bookings`)} 
                    className="flex items-center justify-between p-3 rounded-xl bg-background border border-border-muted hover:bg-surface hover:border-border transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 border border-primary/20 bg-primary/10 text-primary overflow-hidden relative"
                      >
                        <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '20px' }}>person</span>
                      </div>
                      <div className="min-w-0 flex flex-col justify-center gap-0.5">
                        <div className="text-[12px] font-bold truncate font-headline" style={{ color: 'var(--theme-text)' }}>{booking.name}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: 'var(--theme-text-muted)' }}>{booking.tipe_layanan} - {booking.note || 'Pemeriksaan Umum'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right flex flex-col justify-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Jam</p>
                        <p className="text-[11px] font-bold uppercase" style={{ color: 'var(--theme-primary)' }}>{booking.time}</p>
                      </div>
                      <span 
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10"
                        style={{
                          backgroundColor: booking.status === 'Dikonfirmasi' 
                            ? 'color-mix(in srgb, var(--theme-success) 10%, transparent)' 
                            : 'color-mix(in srgb, var(--theme-warning) 10%, transparent)',
                          color: booking.status === 'Dikonfirmasi' 
                            ? 'var(--theme-success)' 
                            : 'var(--theme-warning)',
                          border: `1px solid ${
                            booking.status === 'Dikonfirmasi' 
                              ? 'color-mix(in srgb, var(--theme-success) 20%, transparent)' 
                              : 'color-mix(in srgb, var(--theme-warning) 20%, transparent)'
                          }`
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Tidak ada antrean booking hari ini.
                </div>
              )}
            </div>
          </PageCard>

          {/* Alert Mahasiswa Perlu Perhatian */}
          <PageCard>
            <PageCardHeader
              title="Mahasiswa Perlu Perhatian Khusus"
              description="Kondisi kritis atau dalam pantauan tim medis"
              icon="warning"
              action={
                <span className="text-xs font-semibold uppercase tracking-wider text-error">Kondisi Kritis / Pantauan</span>
              }
            />
            
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex gap-4 items-center p-3 rounded-xl bg-background border border-border-muted hover:bg-surface hover:border-border transition-all duration-300"
                  >
                    <div 
                      className="size-8 rounded-lg flex items-center justify-center shrink-0 bg-error/10 text-error border border-error/20"
                    >
                      <span className="material-symbols-outlined text-base">emergency</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-tight font-headline" style={{ color: 'var(--theme-text)' }}>{alert.nama} ({alert.nim})</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                        {alert.event} - Status: <span style={{ color: 'var(--theme-error)', fontWeight: 'bold' }}>{alert.status}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/tenagakes/patients/${alert.mahasiswa_id}/medical-record`)}
                      className="px-3 py-1 border border-border bg-surface text-[10px] font-bold rounded-lg transition-all hover:bg-muted/30 font-headline text-on-surface"
                    >
                      Detail
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Tidak ada mahasiswa dalam pantauan kritis.
                </div>
              )}
            </div>
          </PageCard>
        </div>
      </div>
    </PageContent>
  );
}

