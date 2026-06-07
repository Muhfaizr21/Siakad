import React from 'react';
import { useFakultasParticipantsQuery, useFakultasScoresQuery, useFakultasMentorsQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
          <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
          <p className="text-blue-600 font-bold text-sm">
            {payload[0].value} <span className="text-slate-500 font-normal">Peserta</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard Kencana Fakultas</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Ringkasan data peserta, sebaran fakultas, dan jumlah pembimbing secara real-time.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card: Total Peserta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Peserta</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-xl">groups</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800">{isParticipantsLoading ? '...' : totalParticipants}</p>
            <p className="text-slate-400 text-xs mt-1">Mahasiswa terdaftar</p>
          </div>
        </div>

        {/* Card: Total Fakultas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Fakultas</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600 text-xl">domain</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800">{isParticipantsLoading ? '...' : uniqueFakultasCount}</p>
            <p className="text-slate-400 text-xs mt-1">Fakultas berpartisipasi</p>
          </div>
        </div>

        {/* Card: Total Mentor */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Mentor</h3>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-xl">supervisor_account</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-800">{isMentorsLoading ? '...' : totalMentors}</p>
            <p className="text-slate-400 text-xs mt-1">Pembimbing aktif</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <span className="material-symbols-outlined text-xl">bar_chart</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Grafik Sebaran Peserta</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Distribusi peserta Kencana di setiap fakultas</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 30, right: 20, left: -20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="colorBar0" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="colorBar1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6D28D9" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="colorBar2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#BE185D" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="colorBar3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#047857" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="colorBar4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#D97706" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.4 }} />
                  <Bar 
                    dataKey="Total Peserta" 
                    radius={[8, 8, 8, 8]} 
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
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3 opacity-50">analytics</span>
                <p>{isParticipantsLoading ? 'Menyiapkan grafik...' : 'Belum ada data untuk ditampilkan'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed List Section */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[450px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <span className="material-symbols-outlined text-xl">list_alt</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Rincian Fakultas</h2>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-2 -mr-2 custom-scrollbar">
            {chartData.length > 0 ? (
              <ul className="space-y-4">
                {chartData.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <span className="material-symbols-outlined text-xl">domain</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-1">
                        <p className="font-semibold text-slate-700 text-sm truncate pr-4">{f.name}</p>
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{f['Total Peserta']} <span className="font-normal">Peserta</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-800 rounded-full" 
                          style={{ width: `${f.percentage}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
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
