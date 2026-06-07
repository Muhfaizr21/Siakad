import React from 'react';
import { useFakultasParticipantsQuery, useFakultasScoresQuery, useFakultasMentorsQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PageHeader } from '../../../components/ui/page/PageHeader';

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  
  // Ambil semua data dengan limit besar agar rekap fakultas akurat untuk super admin
  const { data: participants, isLoading: isParticipantsLoading } = useFakultasParticipantsQuery({ fakultas_id: fakultasId, limit: 10000 });
  const { data: mentors, isLoading: isMentorsLoading } = useFakultasMentorsQuery();

  const totalParticipants = participants?.length || 0;
  const facultyMentors = mentors?.filter(m => m.scope_type === 'faculty') || [];
  const totalMentors = facultyMentors.length;
  
  // Breakdown per fakultas
  const fakultasMap = {};
  participants?.forEach(p => {
    const fname = p.fakultas_name || 'Tanpa Fakultas';
    if (!fakultasMap[fname]) {
      fakultasMap[fname] = { count: 0 };
    }
    fakultasMap[fname].count += 1;
  });

  const uniqueFakultasCount = Object.keys(fakultasMap).filter(k => k !== 'Tanpa Fakultas').length;
  const fakultasBreakdown = Object.entries(fakultasMap)
    .map(([name, data]) => ({ name, count: data.count }))
    .sort((a, b) => b.count - a.count);

  // Data untuk chart
  const chartData = fakultasBreakdown.map(f => ({
    name: f.name.replace(/^Fakultas\s+/i, '').substring(0, 20) + (f.name.length > 30 ? '...' : ''),
    'Total Peserta': f.count,
    percentage: totalParticipants > 0 ? Math.round((f.count / totalParticipants) * 100) : 0
  }));

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--theme-surface)] p-3 rounded-xl shadow-lg border border-[var(--theme-border)]">
          <p className="font-semibold text-[var(--theme-text)] text-sm mb-1">{label}</p>
          <p className="text-[var(--theme-primary)] font-bold text-sm">
            {payload[0].value} <span className="text-[var(--theme-text-muted)] font-normal">Peserta</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Header */}
      <PageHeader
        icon="domain"
        title={
          <>
            <span className="text-[var(--theme-text)]">Dashboard Kencana </span>
            <span className="text-[var(--theme-primary)]">Fakultas</span>
          </>
        }
        subtitle="Ringkasan data peserta, sebaran fakultas, dan jumlah pembimbing secara real-time."
        breadcrumbs={[
          { label: 'Kencana', path: '#' },
          { label: 'Dashboard Fakultas' }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card: Total Peserta */}
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">Total Peserta</h3>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary-light)] text-[var(--theme-primary)] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">groups</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--theme-text)]">{isParticipantsLoading ? '...' : totalParticipants}</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">Mahasiswa terdaftar</p>
          </div>
        </div>

        {/* Card: Total Fakultas */}
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">Total Fakultas</h3>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">domain</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--theme-text)]">{isParticipantsLoading ? '...' : uniqueFakultasCount}</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">Fakultas berpartisipasi</p>
          </div>
        </div>

        {/* Card: Total Mentor */}
        <div className="bg-[var(--theme-surface)] p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col justify-between group hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--theme-text-muted)]">Total Mentor</h3>
            <div className="w-10 h-10 rounded-xl bg-[var(--theme-success-light)] text-[var(--theme-success)] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">supervisor_account</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[var(--theme-text)]">{isMentorsLoading ? '...' : totalMentors}</p>
            <p className="text-[var(--theme-text-muted)] text-xs mt-1">Pembimbing aktif</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[var(--theme-surface)] p-5 md:p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] rounded-xl">
              <span className="material-symbols-outlined text-xl">bar_chart</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--theme-text)]">Grafik Sebaran Peserta</h2>
              <p className="text-xs text-[var(--theme-text-muted)] font-medium mt-0.5">Distribusi peserta Kencana di setiap fakultas</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 30, right: 20, left: -20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorBar0" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--theme-primary-hover)" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-secondary)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--theme-secondary-hover)" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorBar2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-info)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--theme-info)" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorBar3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-success)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--theme-success)" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorBar4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--theme-warning)" stopOpacity={1}/>
                      <stop offset="100%" stopColor="var(--theme-warning)" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--theme-border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--theme-text-muted)', fontWeight: 500 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: 'var(--theme-text-muted)', fontWeight: 500 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--theme-bg)', opacity: 0.4 }} />
                  <Bar 
                    dataKey="Total Peserta" 
                    radius={[8, 8, 0, 0]} 
                    barSize={40}
                    animationDuration={1500}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#colorBar${index % 5})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-50">analytics</span>
                <p>{isParticipantsLoading ? 'Menyiapkan grafik...' : 'Belum ada data untuk ditampilkan'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed List Section */}
        <div className="bg-[var(--theme-surface)] p-5 md:p-6 rounded-2xl border border-[var(--theme-border)] shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-[var(--theme-secondary-light)] text-[var(--theme-secondary)] rounded-xl">
              <span className="material-symbols-outlined text-xl">list_alt</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--theme-text)]">Rincian Fakultas</h2>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 -mr-2 custom-scrollbar">
            {chartData.length > 0 ? (
              <ul className="space-y-4">
                {chartData.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-muted)] group-hover:bg-[var(--theme-primary-light)] group-hover:text-[var(--theme-primary)] transition-colors">
                      <span className="material-symbols-outlined text-xl">domain</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-1">
                        <p className="font-semibold text-[var(--theme-text)] text-sm truncate pr-4">{f.name}</p>
                        <span className="text-xs font-bold text-[var(--theme-text-muted)] whitespace-nowrap">{f['Total Peserta']} <span className="font-normal">Peserta</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--theme-bg)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--theme-primary)] rounded-full" 
                          style={{ width: `${f.percentage}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--theme-text-muted)]">
                <p>{isParticipantsLoading ? 'Memuat rincian...' : 'Data tidak tersedia'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
