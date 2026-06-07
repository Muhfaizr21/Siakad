import React from 'react';
import { Link } from 'react-router-dom';
import { usePeriodsQuery, useParticipantsQuery, useScoresQuery, useMentorsQuery } from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';

const Dashboard = () => {
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const { data: participants, isLoading: loadingParticipants } = useParticipantsQuery();
  const { data: scores, isLoading: loadingScores } = useScoresQuery();
  const { data: mentors, isLoading: loadingMentors } = useMentorsQuery();
  const isLoading = loadingPeriods || loadingParticipants || loadingScores || loadingMentors;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-64 bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[var(--theme-primary)]"></div>
      </div>
    );
  }

  // Active period
  const activePeriod = (periods || []).find(p => p.is_active) || periods?.[0] || null;

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <PageHeader
          icon="shield_person"
          title={
            <>
              <span className="text-[var(--theme-text)]">Super Admin </span>
              <span className="text-[var(--theme-primary)]">Kencana</span>
            </>
          }
          subtitle="Kelola seluruh tahapan PKKMB, atur penugasan mentor, dan awasi perkembangan nilai mahasiswa dari satu dashboard terpusat."
          breadcrumbs={[
            { label: 'Kencana Admin', path: '#' },
            { label: 'Dashboard' }
          ]}
          action={
            <div className="flex gap-2 w-full md:w-auto items-center">
              <div className="bg-[var(--theme-bg)] border border-[var(--theme-border)] px-4 py-2 rounded-xl text-center min-w-[140px] shrink-0">
                <p className="text-[9px] font-bold text-[var(--theme-secondary)] uppercase tracking-wider">Periode Aktif</p>
                <p className="text-xs font-semibold truncate max-w-[120px]" style={{ color: 'var(--theme-text)' }}>
                  {activePeriod ? activePeriod.name : 'Belum Ada'}
                </p>
              </div>
            </div>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Periode */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">calendar_today</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Total Periode</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{periods?.length || 0}</span>
            </div>
          </div>

          {/* Card 2: Peserta */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-info-light)] text-[var(--theme-info)] border border-[var(--theme-info-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Total Peserta</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{participants?.meta?.total_data || participants?.data?.length || 0}</span>
            </div>
          </div>

          {/* Card 3: Mentors */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">groups</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Total Mentor</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{mentors?.length || 0}</span>
            </div>
          </div>

          {/* Card 4: Nilai */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-error-light)] text-[var(--theme-error)] border border-[var(--theme-error-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Data Nilai</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{scores?.meta?.total_data || scores?.data?.length || 0}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-muted)] mb-0.5">Entri</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-[var(--theme-surface)] rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--theme-border)] bg-[var(--theme-bg)]">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--theme-primary)] font-headline">Akses Cepat Pengelolaan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--theme-border)]">
            <Link to="/kencana-admin/periods" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-primary)] transition-colors">Periode PKKMB</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Buka atau tutup periode Kencana.</p>
            </Link>

            <Link to="/kencana-admin/stages" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-info-light)] text-[var(--theme-info)] border border-[var(--theme-info-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">menu_book</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-info)] transition-colors">Tahapan & Materi</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Kelola modul, quiz, dan materi untuk mahasiswa.</p>
            </Link>

            <Link to="/kencana-admin/mentors" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">assignment_ind</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-warning)] transition-colors">Akun Mentor</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Buat dan kelola akun Dewan Pembimbing Kencana.</p>
            </Link>

            <Link to="/kencana-admin/scores" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-error-light)] text-[var(--theme-error)] border border-[var(--theme-error-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-error)] transition-colors">Rekap Penilaian</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Lihat dan ekspor hasil penilaian akhir mahasiswa.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
