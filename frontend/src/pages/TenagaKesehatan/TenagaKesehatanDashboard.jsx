import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenagaKesehatanService } from '../../services/api';

const Favorite = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>favorite</span>;
const Schedule = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>schedule</span>;
const DoneAll = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>done_all</span>;
const Group = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;

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

  const premiumStats = [
    { 
      label: 'Diperiksa Hari Ini', 
      value: totalDiperiksa, 
      icon: DoneAll, 
      color: 'text-success', 
      bg: 'bg-success/10 border border-success/20', 
      tag: 'SELESAI' 
    },
    { 
      label: 'Belum Screening', 
      value: belumScreening, 
      icon: Group, 
      color: 'text-primary', 
      bg: 'bg-primary/10 border border-primary/20', 
      tag: 'MAHASISWA' 
    },
    { 
      label: 'Perlu Perhatian', 
      value: perluPerhatian, 
      icon: Favorite, 
      color: 'text-danger', 
      bg: 'bg-danger/10 border border-danger/20', 
      tag: 'KRITIS',
      pulse: perluPerhatian > 0
    }
  ];

  const services = [
    { name: 'Jadwal Praktik', icon: 'schedule', color: 'text-primary', bg: 'bg-primary/10 border border-primary/20', path: '/tenagakes/schedule' },
    { name: 'Booking Masuk', icon: 'calendar_month', color: 'text-success', bg: 'bg-success/10 border border-success/20', path: '/tenagakes/bookings' },
    { name: 'Daftar Pasien', icon: 'people', color: 'text-info', bg: 'bg-info/10 border border-info/20', path: '/tenagakes/patients' },
    { name: 'Pengaturan', icon: 'settings', color: 'text-warning', bg: 'bg-warning/10 border border-warning/20', path: '/tenagakes/settings' },
  ];

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <section
          className="rounded-xl p-5 border border-border glass-card"
          style={{ backgroundColor: 'var(--theme-surface)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
              >
                <span className="material-symbols-outlined text-xl">medical_services</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  Selamat Datang, <span style={{ color: 'var(--theme-secondary)' }}>{profileName}</span>! 👋
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Hari ini Anda memiliki <span className="font-extrabold text-primary">{bookingCount} booking harian</span> aktif.
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => navigate('/tenagakes/bookings')}
                className="flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs transition-all text-white hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <span className="material-symbols-outlined text-sm">calendar_month</span> Lihat Booking
              </button>
              <button
                onClick={() => navigate('/tenagakes/patients')}
                className="flex-1 md:flex-initial border px-4 py-2 rounded-lg font-bold text-xs transition-all hover:bg-black/[0.02] flex items-center justify-center gap-1.5"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                  backgroundColor: 'var(--theme-surface)'
                }}
              >
                <span className="material-symbols-outlined text-sm">history</span> Riwayat Pasien
              </button>
            </div>
          </div>
        </section>

        {/* Premium Stats Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {premiumStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="group relative overflow-hidden rounded-xl bg-surface border border-border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md glass-card"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-inner`}>
                    <Icon size={18} />
                  </div>
                  <div className={`flex items-center gap-1 rounded-full ${stat.bg} px-2 py-0.5 text-xs font-semibold ${stat.color} uppercase tracking-wider`}>
                    {stat.pulse && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
                    {stat.tag}
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-5">{stat.label}</p>
                <p className="mt-1 text-xl font-bold tracking-tight leading-none" style={{ color: 'var(--theme-text)' }}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Two-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          {/* Left Column (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Access Services */}
            <div className="bg-surface border border-border p-5 rounded-xl shadow-sm space-y-4 glass-card">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-border-muted font-headline">
                <span className="material-symbols-outlined text-base">apps</span> Pintasan Layanan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {services.map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => navigate(item.path)} 
                    className="group flex flex-col items-center justify-center p-4 bg-background hover:bg-surface rounded-xl border border-border-muted hover:border-primary transition-all duration-300"
                  >
                    <div className={`size-10 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                      <span className="material-symbols-outlined text-base">{item.icon}</span>
                    </div>
                    <span className="text-xs font-semibold tracking-tight text-center font-headline" style={{ color: 'var(--theme-text)' }}>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Booking Kesehatan Baru */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-5 h-fit glass-card">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-muted">
                <div>
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2 font-headline">
                    <span className="material-symbols-outlined text-base" >assignment</span> Antrean Booking Hari Ini
                  </h3>
                  <p className="text-xs text-muted mt-1">Daftar mahasiswa yang dijadwalkan hari ini</p>
                </div>
                <button 
                  onClick={() => navigate('/tenagakes/bookings')} 
                  className="text-xs font-bold text-primary hover:underline transition-colors tracking-wider"
                >
                  Lihat Semua
                </button>
              </div>
              
              <div className="space-y-3">
                {bookings.length > 0 ? (
                  bookings.slice(0, 3).map((booking) => (
                    <div 
                      key={booking.id} 
                      onClick={() => navigate(`/tenagakes/bookings`)} 
                      className="flex items-center justify-between p-3 rounded-xl bg-background border border-border-muted hover:bg-surface hover:shadow-sm hover:border-border transition-all duration-300 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform duration-300 shrink-0 border border-primary/20 overflow-hidden relative">
                          <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '20px' }}>person</span>
                        </div>
                        <div className="min-w-0 flex flex-col justify-center gap-0.5">
                          <div className="text-[12px] font-bold text-slate-900 truncate" style={{ color: 'var(--theme-text)' }}>{booking.name}</div>
                          <div className="text-[10px] text-muted/80 font-semibold uppercase tracking-wider truncate">{booking.tipe_layanan} - {booking.note || 'Pemeriksaan Umum'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right flex flex-col justify-center">
                          <p className="text-[9px] font-bold text-muted/80 uppercase tracking-wider">Jam</p>
                          <p className="text-[11px] font-bold text-primary uppercase">{booking.time}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          booking.status === 'Dikonfirmasi' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Tidak ada antrean booking hari ini.
                  </div>
                )}
              </div>
            </div>

            {/* Alert Mahasiswa Perlu Perhatian */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-5 h-fit glass-card">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-muted">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-2 font-headline">
                  <span className="material-symbols-outlined text-base" >warning</span> Mahasiswa Perlu Perhatian Khusus
                </h3>
                <span className="text-xs text-muted">Kondisi Kritis / Pantauan</span>
              </div>
              
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex gap-4 items-center p-3 rounded-xl bg-background border border-border-muted hover:bg-slate-50 transition-all duration-300">
                      <div className="size-8 rounded-lg bg-red-100 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-base">emergency</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 uppercase tracking-tight" style={{ color: 'var(--theme-text)' }}>{alert.nama} ({alert.nim})</p>
                        <p className="text-xs text-muted/80 font-medium mt-0.5">{alert.event} - Status: <span className="text-red-500 font-bold">{alert.status}</span></p>
                      </div>
                      <button 
                        onClick={() => navigate(`/tenagakes/patients/${alert.mahasiswa_id}/medical-record`)}
                        className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Tidak ada mahasiswa dalam pantauan kritis.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
