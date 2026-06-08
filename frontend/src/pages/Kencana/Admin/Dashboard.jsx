import React from 'react';
import { Link } from 'react-router-dom';
import { usePeriodsQuery, useParticipantsQuery, useScoresQuery, useMentorsQuery } from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { data: periods, isLoading: loadingPeriods } = usePeriodsQuery();
  const { data: participants, isLoading: loadingParticipants } = useParticipantsQuery({ limit: 10000 });
  const { data: scores, isLoading: loadingScores } = useScoresQuery({ limit: 10000 });
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

  // Extract data from participants
  const participantsList = participants?.data || [];
  const facultyMap = {};
  participantsList.forEach(p => {
    const fname = p.fakultas_name || 'Tanpa Fakultas';
    if (!facultyMap[fname]) {
      facultyMap[fname] = 0;
    }
    facultyMap[fname]++;
  });

  const facultyBreakdown = Object.entries(facultyMap)
    .map(([name, count]) => ({
      name: name.replace(/^Fakultas\s+/i, ''),
      jumlah: count,
      percentage: participantsList.length > 0 ? Math.round((count / participantsList.length) * 100) : 0
    }))
    .sort((a, b) => b.jumlah - a.jumlah);

  // Calculate scores and graduation analytics
  const scoresList = scores?.data || [];
  const totalParticipants = participants?.meta?.total_data || participantsList.length || 0;

  let passedCount = 0;
  let remedialCount = 0;
  let inProgressCount = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let cogSum = 0, psySum = 0, affSum = 0;

  scoresList.forEach(s => {
    const status = (s.graduation_status || s.GraduationStatus || '').toLowerCase();
    if (status === 'passed') passedCount++;
    else if (status === 'remedial') remedialCount++;
    else inProgressCount++;

    if (s.final_score > 0) {
      scoreSum += s.final_score;
      cogSum += s.cognitive_average || 0;
      psySum += s.psychomotor_average || 0;
      affSum += s.affective_average || 0;
      scoreCount++;
    }
  });

  const avgScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(1) : '0.0';
  const avgCog = scoreCount > 0 ? Math.round(cogSum / scoreCount) : 0;
  const avgPsy = scoreCount > 0 ? Math.round(psySum / scoreCount) : 0;
  const avgAff = scoreCount > 0 ? Math.round(affSum / scoreCount) : 0;

  const passRate = totalParticipants > 0 ? Math.round((passedCount / totalParticipants) * 100) : 0;
  const remedialRate = totalParticipants > 0 ? Math.round((remedialCount / totalParticipants) * 100) : 0;
  const inProgressRate = totalParticipants > 0 ? Math.round((inProgressCount / totalParticipants) * 100) : 0;

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-8">
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
              <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] px-4 py-2 rounded-xl text-center min-w-[140px] shrink-0">
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
              <span className="text-xl font-bold text-[var(--theme-text)]">{totalParticipants}</span>
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
              <span className="material-symbols-outlined text-xl">leaderboard</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Rerata Nilai</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{avgScore}</span>
            </div>
          </div>
        </div>

        {/* ── Academic Analytics Cards ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Lulus Orientasi */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-success-light)] text-[var(--theme-success)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                </div>
                <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Lulus Orientasi</h3>
              </div>
              <span className="text-xs font-bold text-[var(--theme-success)] bg-[var(--theme-success-light)] px-2 py-0.5 rounded-lg border border-[var(--theme-success-light)]">{passRate}%</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-xl font-bold text-[var(--theme-text)]">{passedCount}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-muted)] mb-0.5">Mahasiswa</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--theme-success)] rounded-full transition-all duration-500" style={{ width: `${passRate}%` }} />
            </div>
          </div>

          {/* Card Perlu Remedial */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-error-light)] text-[var(--theme-error)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">assignment_late</span>
                </div>
                <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Perlu Remedial</h3>
              </div>
              <span className="text-xs font-bold text-[var(--theme-error)] bg-[var(--theme-error-light)] px-2 py-0.5 rounded-lg border border-[var(--theme-error-light)]">{remedialRate}%</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-xl font-bold text-[var(--theme-text)]">{remedialCount}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-muted)] mb-0.5">Mahasiswa</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--theme-error)] rounded-full transition-all duration-500" style={{ width: `${remedialRate}%` }} />
            </div>
          </div>

          {/* Card Sedang Berjalan */}
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-warning-light)] text-[var(--theme-warning)] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">pending</span>
                </div>
                <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">Sedang Berjalan</h3>
              </div>
              <span className="text-xs font-bold text-[var(--theme-warning)] bg-[var(--theme-warning-light)] px-2 py-0.5 rounded-lg border border-[var(--theme-warning-light)]">{inProgressRate}%</span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-xl font-bold text-[var(--theme-text)]">{inProgressCount}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-muted)] mb-0.5">Mahasiswa</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--theme-warning)] rounded-full transition-all duration-500" style={{ width: `${inProgressRate}%` }} />
            </div>
          </div>
        </div>

        {/* ── Visual Charts Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Faculty breakdown */}
            <div className="lg:col-span-2 bg-[var(--theme-surface)] p-6 rounded-3xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[var(--theme-primary-light)] rounded-xl flex justify-center items-center text-[var(--theme-primary)]">
                       <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '20px' }}>bar_chart</span>
                    </div>
                    <div className="text-left">
                       <h2 className="text-lg font-black text-[var(--theme-text)] tracking-tight font-headline">Sebaran Mahasiswa per Fakultas</h2>
                       <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">Sebaran pendaftaran peserta PKKMB di setiap fakultas universitas</p>
                    </div>
                 </div>
                 
                 <div className="w-full mt-6">
                    {facultyBreakdown.length > 0 ? (
                      <ResponsiveContainer width="99%" height={240} debounce={50}>
                        <BarChart data={facultyBreakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--theme-border-muted)" />
                          <XAxis type="number" hide domain={[0, 'dataMax']} />
                          <YAxis dataKey="name" type="category" width={160}
                            tick={({ y, payload }) => (
                              <text x={0} y={y} dy={4} textAnchor="start" fill="var(--theme-text-muted)" fontSize={9.5} fontWeight={700} className="font-headline">
                                {payload.value?.length > 25 ? `${payload.value.substring(0, 25)}...` : payload.value}
                              </text>
                            )}
                            axisLine={false} tickLine={false}
                          />
                          <Tooltip cursor={{ fill: 'var(--theme-bg)' }}
                            contentStyle={{ backgroundColor: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold", color: "var(--theme-text)" }}
                          />
                          <Bar dataKey="jumlah" fill="var(--theme-primary)" radius={[0, 10, 10, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                       <div className="h-[200px] flex flex-col items-center justify-center text-[var(--theme-text-muted)] bg-[var(--theme-bg)] rounded-2xl border border-dashed border-[var(--theme-border)]">
                          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">analytics</span>
                          <p className="text-sm font-bold">{loadingParticipants ? 'Memuat grafik...' : 'Belum ada data'}</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Chart 2: Competency Breakdown */}
            <div className="lg:col-span-1 bg-[var(--theme-surface)] p-6 rounded-3xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-[var(--theme-warning-light)] rounded-xl flex justify-center items-center text-[var(--theme-warning)]">
                        <span className="material-symbols-outlined text-[var(--theme-warning)]" style={{ fontSize: '20px' }}>psychology</span>
                     </div>
                     <div className="text-left">
                        <h2 className="text-lg font-black text-[var(--theme-text)] tracking-tight font-headline">Akumulasi Kompetensi</h2>
                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">Rata-rata aspek penilaian seluruh universitas</p>
                     </div>
                  </div>

                  <div className="space-y-5 mt-6 text-left">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text-muted)]">Kognitif (Misi & Kuis)</span>
                        <span className="font-black text-[var(--theme-primary)]">{loadingScores ? '...' : `${avgCog}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--theme-primary)] rounded-full transition-all duration-500" style={{ width: `${avgCog}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text-muted)]">Psikomotorik (Tugas / Handbook)</span>
                        <span className="font-black text-[var(--theme-info)]">{loadingScores ? '...' : `${avgPsy}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--theme-info)] rounded-full transition-all duration-500" style={{ width: `${avgPsy}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text-muted)]">Afektif (DP / Mentor Review)</span>
                        <span className="font-black text-[var(--theme-success)]">{loadingScores ? '...' : `${avgAff}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--theme-success)] rounded-full transition-all duration-500" style={{ width: `${avgAff}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--theme-bg)] border border-[var(--theme-border-muted)] rounded-2xl p-4 mt-6 text-left shrink-0">
                  <div className="flex gap-2 items-start text-xs font-semibold text-[var(--theme-text-muted)] leading-relaxed">
                    <span className="material-symbols-outlined text-[var(--theme-primary)] shrink-0" style={{ fontSize: '16px' }}>info</span>
                    <span>Nilai dihitung berdasarkan total rata-rata kuis, penugasan, and review mentor universitas.</span>
                  </div>
                </div>
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
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-primary)] transition-colors font-headline">Periode PKKMB</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Buka atau tutup periode Kencana.</p>
            </Link>

            <Link to="/kencana-admin/stages" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-info-light)] text-[var(--theme-info)] border border-[var(--theme-info-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">menu_book</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-info)] transition-colors font-headline">Tahapan & Materi</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Kelola modul, quiz, dan materi untuk mahasiswa.</p>
            </Link>

            <Link to="/kencana-admin/mentors" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">assignment_ind</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-warning)] transition-colors font-headline">Akun Mentor</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Buat dan kelola akun Dewan Pembimbing Kencana.</p>
            </Link>

            <Link to="/kencana-admin/scores" className="p-6 hover:bg-[var(--theme-bg)] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-error-light)] text-[var(--theme-error)] border border-[var(--theme-error-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-xl">fact_check</span>
              </div>
              <h3 className="font-bold text-[var(--theme-text)] text-sm mb-1 group-hover:text-[var(--theme-error)] transition-colors font-headline">Rekap Penilaian</h3>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium">Lihat dan ekspor hasil penilaian akhir mahasiswa.</p>
            </Link>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
