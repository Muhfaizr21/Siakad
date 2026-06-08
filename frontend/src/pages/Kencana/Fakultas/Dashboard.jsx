import React from 'react';
import { useFakultasParticipantsQuery, useFakultasScoresQuery, useFakultasMentorsQuery } from '../../../queries/useKencanaFakultasQuery';
import { useGroupsQuery } from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardHero } from '@/components/ui/dashboard';

// SVG Icons
const Building2 = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>business</span>;
const Group = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>group</span>;
const Award = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>school</span>;
const GroupsIcon = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>diversity_3</span>;
const LeaderboardIcon = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>leaderboard</span>;
const CheckCircle = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>check_circle</span>;
const Warning = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>assignment_late</span>;
const Pending = ({ size = 24, className = "" }) => <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>pending</span>;

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  
  // Fetch data
  const { data: participants, isLoading: isParticipantsLoading } = useFakultasParticipantsQuery({ fakultas_id: fakultasId, limit: 10000 });
  const { data: mentors, isLoading: isMentorsLoading } = useFakultasMentorsQuery();
  const { data: groups, isLoading: isGroupsLoading } = useGroupsQuery({ limit: 10000 }, 'fakultas');
  const { data: scores, isLoading: isScoresLoading } = useFakultasScoresQuery({ limit: 10000 });

  const totalParticipants = participants?.length || 0;
  const facultyMentors = mentors?.filter(m => m.scope_type === 'faculty' || m.scopeType === 'faculty') || [];
  const totalMentors = facultyMentors.length;
  const totalGroups = groups?.length || 0;

  // Calculate scores and graduation analytics
  let passedCount = 0;
  let remedialCount = 0;
  let inProgressCount = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  let cogSum = 0, psySum = 0, affSum = 0;

  scores?.forEach(s => {
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

  // Breakdown per program studi (major)
  const prodiMap = {};
  participants?.forEach(p => {
    const pname = p.program_studi_name || 'Tanpa Prodi';
    if (!prodiMap[pname]) {
      prodiMap[pname] = { count: 0 };
    }
    prodiMap[pname].count += 1;
  });

  const uniqueProdiCount = Object.keys(prodiMap).filter(k => k !== 'Tanpa Prodi').length;
  const prodiBreakdown = Object.entries(prodiMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      percentage: totalParticipants > 0 ? Math.round((data.count / totalParticipants) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  const chartData = prodiBreakdown.map(f => ({
    name: f.name.replace(/^Program Studi\s+/i, '').replace(/^S1\s+/i, ''),
    jumlah: f.count,
    percentage: f.percentage
  }));

  return (
    <div className="bg-transparent font-body">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <DashboardHero 
          title="Selamat datang,"
          highlightedTitle={`${user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'}!`}
          subtitle="Ringkasan data peserta PKKMB, status kelulusan orientasi, dan data pendukung bimbingan fakultas secara real-time."
          icon="domain"
          badges={[
            { label: 'PORTAL ORIENTASI FAKULTAS', active: false },
            { label: `${isParticipantsLoading ? '...' : totalParticipants} PESERTA PKKMB`, active: true }
          ]}
          actions={
            <button 
              onClick={() => window.location.reload()} 
              className="h-10 px-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-bg)] text-xs font-bold text-[var(--theme-text)] flex items-center gap-2 transition-all shadow-sm shrink-0 uppercase tracking-wider"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sync</span>
              REFRESH DATA
            </button>
          }
        />

        {/* ── Enriched Stats Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Peserta */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border border-[var(--theme-primary-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Total Peserta</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{isParticipantsLoading ? '...' : totalParticipants}</span>
            </div>
          </div>

          {/* Card 2: Jumlah Kelompok */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-info-light)] text-[var(--theme-info)] border border-[var(--theme-info-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">diversity_3</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Jumlah Kelompok</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{isGroupsLoading ? '...' : totalGroups}</span>
            </div>
          </div>

          {/* Card 3: Mentor / DP */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border border-[var(--theme-warning-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Mentor / DP</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{isMentorsLoading ? '...' : totalMentors}</span>
            </div>
          </div>

          {/* Card 4: Rerata Nilai */}
          <div className="bg-[var(--theme-surface)] rounded-2xl p-5 border border-[var(--theme-border)] shadow-sm group hover:-translate-y-0.5 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-error-light)] text-[var(--theme-error)] border border-[var(--theme-error-light)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300">
              <span className="material-symbols-outlined text-xl">leaderboard</span>
            </div>
            <h3 className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Rerata Nilai</h3>
            <div className="flex items-end gap-2">
              <span className="text-xl font-bold text-[var(--theme-text)]">{isScoresLoading ? '...' : avgScore}</span>
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
              <span className="text-xl font-bold text-[var(--theme-text)]">{isScoresLoading ? '...' : passedCount}</span>
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
              <span className="text-xl font-bold text-[var(--theme-text)]">{isScoresLoading ? '...' : remedialCount}</span>
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
              <span className="text-xl font-bold text-[var(--theme-text)]">{isScoresLoading ? '...' : inProgressCount}</span>
              <span className="text-xs font-semibold text-[var(--theme-text-muted)] mb-0.5">Mahasiswa</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--theme-warning)] rounded-full transition-all duration-500" style={{ width: `${inProgressRate}%` }} />
            </div>
          </div>
        </div>

        {/* ── Enriched Visual Charts Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Prodi breakdown list */}
            <div className="lg:col-span-2 bg-[var(--theme-surface)] p-6 rounded-3xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[var(--theme-primary-light)] rounded-xl flex justify-center items-center text-[var(--theme-primary)]">
                       <span className="material-symbols-outlined text-[var(--theme-primary)]" style={{ fontSize: '20px' }}>bar_chart</span>
                    </div>
                    <div className="text-left">
                       <h2 className="text-lg font-black text-[var(--theme-text)] tracking-tight font-headline">Sebaran Maba per Program Studi</h2>
                       <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">Sebaran pendaftaran mahasiswa baru PKKMB di setiap jurusan</p>
                    </div>
                 </div>
                 
                 <div className="w-full mt-6">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="99%" height={240} debounce={50}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
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
                          <p className="text-sm font-bold">{isParticipantsLoading ? 'Memuat grafik...' : 'Belum ada data'}</p>
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
                        <h2 className="text-lg font-black text-[var(--theme-text)] tracking-tight font-headline">Kompilasi Kompetensi</h2>
                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-0.5">Rata-rata aspek penilaian PKKMB</p>
                     </div>
                  </div>

                  <div className="space-y-5 mt-6 text-left">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text-muted)]">Kognitif (Misi & Kuis)</span>
                        <span className="font-black text-[var(--theme-primary)]">{isScoresLoading ? '...' : `${avgCog}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--theme-primary)] rounded-full transition-all duration-500" style={{ width: `${avgCog}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text-muted)]">Psikomotorik (Tugas / Handbook)</span>
                        <span className="font-black text-[var(--theme-info)]">{isScoresLoading ? '...' : `${avgPsy}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--theme-border-muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--theme-info)] rounded-full transition-all duration-500" style={{ width: `${avgPsy}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text-muted)]">Afektif (DP / Mentor Review)</span>
                        <span className="font-black text-[var(--theme-success)]">{isScoresLoading ? '...' : `${avgAff}/100`}</span>
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
                    <span>Nilai dihitung berdasarkan data akumulasi tugas, kuis, kehadiran, dan penilaian kedisiplinan maba.</span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
