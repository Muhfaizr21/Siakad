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
    <div className="bg-transparent font-inter">
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
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-2 transition-all shadow-sm shrink-0 uppercase tracking-wider"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sync</span>
              REFRESH DATA
            </button>
          }
        />

        {/* ── Enriched Stats Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex justify-center items-center text-indigo-600 shrink-0">
                <Group size={18} />
              </div>
              <div className="text-left">
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block">Total Peserta</span>
                 <p className="text-2xl font-black text-slate-800 mt-1">{isParticipantsLoading ? '...' : totalParticipants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex justify-center items-center text-blue-600 shrink-0">
                <GroupsIcon size={18} />
              </div>
              <div className="text-left">
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block">Jumlah Kelompok</span>
                 <p className="text-2xl font-black text-slate-800 mt-1">{isGroupsLoading ? '...' : totalGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex justify-center items-center text-emerald-600 shrink-0">
                <Award size={18} />
              </div>
              <div className="text-left">
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block">Mentor / DP</span>
                 <p className="text-2xl font-black text-slate-800 mt-1">{isMentorsLoading ? '...' : totalMentors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex justify-center items-center text-amber-600 shrink-0">
                <LeaderboardIcon size={18} />
              </div>
              <div className="text-left">
                 <span className="text-[10px] font-black text-[#a3a3a3] uppercase tracking-widest block">Rerata Nilai</span>
                 <p className="text-2xl font-black text-slate-800 mt-1">{isScoresLoading ? '...' : avgScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Academic Analytics Cards ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lulus Orientasi</span>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{passRate}%</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{isScoresLoading ? '...' : passedCount} <span className="text-xs text-slate-400 font-semibold">Mahasiswa</span></p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${passRate}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Warning size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perlu Remedial</span>
              </div>
              <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{remedialRate}%</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{isScoresLoading ? '...' : remedialCount} <span className="text-xs text-slate-400 font-semibold">Mahasiswa</span></p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${remedialRate}%` }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Pending size={18} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sedang Berjalan</span>
              </div>
              <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">{inProgressRate}%</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{isScoresLoading ? '...' : inProgressCount} <span className="text-xs text-slate-400 font-semibold">Mahasiswa</span></p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${inProgressRate}%` }} />
            </div>
          </div>
        </div>

        {/* ── Enriched Visual Charts Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            {/* Chart 1: Prodi breakdown list */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#eef4ff] rounded-xl flex justify-center items-center text-[#00236F]">
                       <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '20px' }}>bar_chart</span>
                    </div>
                    <div className="text-left">
                       <h2 className="text-lg font-black text-slate-900 tracking-tight font-jakarta">Sebaran Maba per Program Studi</h2>
                       <p className="text-xs font-semibold text-slate-400 mt-0.5">Sebaran pendaftaran mahasiswa baru PKKMB di setiap jurusan</p>
                    </div>
                 </div>
                 
                 <div className="w-full mt-6">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="99%" height={240} debounce={50}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide domain={[0, 'dataMax']} />
                          <YAxis dataKey="name" type="category" width={160}
                            tick={({ y, payload }) => (
                              <text x={0} y={y} dy={4} textAnchor="start" fill="#64748b" fontSize={9.5} fontWeight={700} className="font-jakarta">
                                {payload.value?.length > 25 ? `${payload.value.substring(0, 25)}...` : payload.value}
                              </text>
                            )}
                            axisLine={false} tickLine={false}
                          />
                          <Tooltip cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", fontSize: "11px", fontWeight: "bold", color: "#1e293b" }}
                          />
                          <Bar dataKey="jumlah" fill="var(--theme-primary, #3b82f6)" radius={[0, 10, 10, 0]} barSize={14} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                       <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                          <span className="material-symbols-outlined text-4xl mb-2 opacity-30">analytics</span>
                          <p className="text-sm font-bold">{isParticipantsLoading ? 'Memuat grafik...' : 'Belum ada data'}</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* Chart 2: Competency Breakdown */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 bg-purple-50 rounded-xl flex justify-center items-center text-purple-600">
                        <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '20px' }}>psychology</span>
                     </div>
                     <div className="text-left">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight font-jakarta">Kompilasi Kompetensi</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">Rata-rata aspek penilaian PKKMB</p>
                     </div>
                  </div>

                  <div className="space-y-5 mt-6 text-left">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">Kognitif (Misi & Kuis)</span>
                        <span className="font-black text-primary">{isScoresLoading ? '...' : `${avgCog}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${avgCog}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">Psikomotorik (Tugas / Handbook)</span>
                        <span className="font-black text-indigo-600">{isScoresLoading ? '...' : `${avgPsy}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${avgPsy}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">Afektif (DP / Mentor Review)</span>
                        <span className="font-black text-emerald-600">{isScoresLoading ? '...' : `${avgAff}/100`}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${avgAff}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-6 text-left shrink-0">
                  <div className="flex gap-2 items-start text-xs font-semibold text-slate-500 leading-relaxed">
                    <span className="material-symbols-outlined text-primary shrink-0" style={{ fontSize: '16px' }}>info</span>
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
