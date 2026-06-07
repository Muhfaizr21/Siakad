import React from 'react';
import { Link } from 'react-router-dom';
import { usePeriodsQuery, useParticipantsQuery, useScoresQuery, useMentorsQuery } from '../../../queries/useKencanaAdminQuery';

const Dashboard = () => {
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const { data: participants, isLoading: loadingParticipants } = useParticipantsQuery();
  const { data: scores, isLoading: loadingScores } = useScoresQuery();
  const { data: mentors, isLoading: loadingMentors } = useMentorsQuery();
  const isLoading = loadingPeriods || loadingParticipants || loadingScores || loadingMentors;

  const basePath = window.location.pathname.startsWith('/admin/kencana-univ') ? '/admin/kencana-univ' : window.location.pathname.startsWith('/admin/kencana-fakultas-admin') ? '/admin/kencana-fakultas-admin' : window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Active period
  const activePeriod = (periods || []).find(p => p.is_active) || periods?.[0] || null;

  return (
    <div className="bg-transparent font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <section
          className="rounded-xl p-5 border border-border"
          style={{ backgroundColor: 'var(--theme-surface)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
              >
                <span className="material-symbols-outlined text-xl">shield_person</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  Super Admin Kencana
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Kelola seluruh tahapan PKKMB, atur penugasan mentor, dan awasi perkembangan nilai mahasiswa dari satu dashboard terpusat.
                </p>
              </div>
            </div>

            {/* Right: Active Period Info */}
            <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="bg-background border border-border px-4 py-2 rounded-lg text-center min-w-[140px] shrink-0">
                <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">Periode Aktif</p>
                <p className="text-xs font-black text-primary truncate max-w-[120px]" style={{ color: 'var(--theme-text)' }}>
                  {activePeriod ? activePeriod.name : 'Belum Ada'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Periode */}
          <div className="bg-surface rounded-xl p-5 border border-border shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">calendar_today</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Periode</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-on-surface" style={{ color: 'var(--theme-text)' }}>{periods?.length || 0}</span>
            </div>
          </div>

          {/* Card 2: Peserta */}
          <div className="bg-surface rounded-xl p-5 border border-border shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info border border-info/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Peserta</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-on-surface" style={{ color: 'var(--theme-text)' }}>{participants?.length || 0}</span>
            </div>
          </div>

          {/* Card 3: Mentors */}
          <div className="bg-surface rounded-xl p-5 border border-border shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning border border-warning/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">groups</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Total Mentor</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-on-surface" style={{ color: 'var(--theme-text)' }}>{mentors?.length || 0}</span>
            </div>
          </div>

          {/* Card 4: Nilai */}
          <div className="bg-surface rounded-xl p-5 border border-border shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error border border-error/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Data Nilai</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-on-surface" style={{ color: 'var(--theme-text)' }}>{scores?.length || 0}</span>
              <span className="text-xs font-semibold text-muted mb-0.5">Entri</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-slate-50/50">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary font-headline">Akses Cepat Pengelolaan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-muted">
            <Link to={`${basePath}/periods`} className="p-6 hover:bg-slate-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1 group-hover:text-primary transition-colors" style={{ color: 'var(--theme-text)' }}>Periode PKKMB</h3>
              <p className="text-xs text-muted font-medium">Buka atau tutup periode Kencana.</p>
            </Link>

            <Link to={`${basePath}/stages`} className="p-6 hover:bg-slate-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-info/10 text-info border border-info/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">menu_book</span>
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1 group-hover:text-info transition-colors" style={{ color: 'var(--theme-text)' }}>Tahapan & Materi</h3>
              <p className="text-xs text-muted font-medium">Kelola modul, quiz, dan materi untuk mahasiswa.</p>
            </Link>

            <Link to={`${basePath}/mentors`} className="p-6 hover:bg-slate-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning border border-warning/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">assignment_ind</span>
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1 group-hover:text-warning transition-colors" style={{ color: 'var(--theme-text)' }}>Akun Mentor</h3>
              <p className="text-xs text-muted font-medium">Buat dan kelola akun Dewan Pembimbing Kencana.</p>
            </Link>

            <Link to={`${basePath}/scores`} className="p-6 hover:bg-slate-50/50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-error/10 text-error border border-error/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <h3 className="font-bold text-on-surface text-sm mb-1 group-hover:text-error transition-colors" style={{ color: 'var(--theme-text)' }}>Rekap Penilaian</h3>
              <p className="text-xs text-muted font-medium">Lihat dan ekspor hasil penilaian akhir mahasiswa.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
