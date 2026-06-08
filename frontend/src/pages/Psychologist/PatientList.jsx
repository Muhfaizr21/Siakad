import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';
import { DataTable } from '@/components/ui/DataTable';

export default function PatientList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [fakultasList, setFakultasList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    psychologistService.getPatients()
      .then((res) => {
        if (!ignore) {
          const sanitized = (res.data || []).map(p => ({
            ...p,
            sessions: Number(p.sessions || 0)
          }));
          setPatients(sanitized);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    psychologistService.getFakultasList().then((res) => {
      if (!ignore) setFakultasList(res.data || []);
    });
    psychologistService.getProdiList().then((res) => {
      if (!ignore) setProdiList(res.data || []);
    });
    return () => { ignore = true; };
  }, []);

  const filteredProdis = useMemo(() => {
    if (selectedFakultas === 'Semua Fakultas') return [];
    const selectedFak = fakultasList.find(f => f.nama === selectedFakultas);
    if (!selectedFak) return [];
    return prodiList.filter(p => p.fakultas_id === selectedFak.id);
  }, [selectedFakultas, prodiList, fakultasList]);

  const handleFakultasChange = (val) => {
    setSelectedFakultas(val);
    setSelectedProdi('Semua Prodi');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stabil': return { bg: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', text: 'var(--theme-success)', border: 'color-mix(in srgb, var(--theme-success) 20%, transparent)', dot: 'var(--theme-success)', dotAnim: '' };
      case 'Perlu Perhatian': return { bg: 'color-mix(in srgb, var(--theme-error) 10%, transparent)', text: 'var(--theme-error)', border: 'color-mix(in srgb, var(--theme-error) 20%, transparent)', dot: 'var(--theme-error)', dotAnim: 'animate-pulse' };
      case 'Pemulihan': return { bg: 'color-mix(in srgb, var(--theme-info) 10%, transparent)', text: 'var(--theme-info)', border: 'color-mix(in srgb, var(--theme-info) 20%, transparent)', dot: 'var(--theme-info)', dotAnim: '' };
      default: return { bg: 'color-mix(in srgb, var(--theme-text-muted) 10%, transparent)', text: 'var(--theme-text-muted)', border: 'color-mix(in srgb, var(--theme-text-muted) 20%, transparent)', dot: 'var(--theme-text-muted)', dotAnim: '' };
    }
  };

  const filteredPatients = useMemo(() => {
    let result = [...patients];
    if (filterStatus !== 'Semua Status') {
      result = result.filter(p => p.status === filterStatus);
    }
    if (selectedFakultas !== 'Semua Fakultas') {
      result = result.filter(p => p.faculty === selectedFakultas);
    }
    if (selectedProdi !== 'Semua Prodi') {
      result = result.filter(p => p.program_studi === selectedProdi);
    }
    if (startDate) {
      result = result.filter(p => p.raw_last_visit && p.raw_last_visit >= startDate);
    }
    if (endDate) {
      result = result.filter(p => p.raw_last_visit && p.raw_last_visit <= endDate);
    }
    return result;
  }, [patients, filterStatus, selectedFakultas, selectedProdi, startDate, endDate]);

  const handleTableSearch = (data, searchVal) => {
    const query = searchVal.trim().toLowerCase();
    if (!query) return data;
    return data.filter((p) => {
      const searchableStr = [
        p.name,
        p.nim,
        p.faculty,
        p.program_studi,
        p.status,
      ].filter(Boolean).join(' ').toLowerCase();
      return searchableStr.includes(query);
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Identitas Pasien',
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${row.color || 'bg-primary'} text-white flex items-center justify-center font-black text-xs shadow-sm bg-primary border border-primary/20 shrink-0 overflow-hidden relative`}>
            {row.foto_url || row.foto ? (
              <img src={row.foto_url || row.foto} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              row.name?.charAt(0) || 'P'
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors max-w-[200px] truncate">{row.name}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{row.nim} &bull; {row.faculty}</p>
          </div>
        </div>
      )
    },
    {
      key: 'sessions',
      label: 'Aktivitas Sesi',
      sortable: true,
      render: (v, row) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-primary/10 text-primary">
              <span className="material-symbols-outlined !text-[12px]">show_chart</span>
            </span>
            <div>
              <p className="text-[11px] font-black text-slate-700">{row.sessions} Kali</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
              <span className="material-symbols-outlined !text-[12px]">calendar_month</span>
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-500">{row.lastVisit}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status Klinis',
      sortable: true,
      render: (v, row) => {
        const statusStyle = getStatusColor(row.status);
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotAnim}`} style={{ backgroundColor: statusStyle.dot }} />
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
          
          {/* ── Welcome Banner ─────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col xl:flex-row xl:items-center gap-6 group shadow-sm border border-slate-200/60 bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-slate-50/80" />
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, black 1px, transparent 1px), radial-gradient(circle at 80% 20%, black 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 left-20 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm relative overflow-hidden">
                    <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>medical_information</span>
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                        Rekam Medis Klinis
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                      Daftar Pasien
                    </h1>
                    <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                      Pantau riwayat sesi, rekam medis klinis, dan status psikologis mahasiswa secara terpusat dan aman.
                    </p>
                 </div>
              </div>
            </div>
            
            <div className="relative z-10 shrink-0 mt-2 xl:mt-0">
              <button 
                onClick={async () => {
                  try {
                    await psychologistService.downloadRecapMedicalRecordPDF({
                      fakultas: selectedFakultas,
                      prodi: selectedProdi,
                      status: filterStatus,
                      start_date: startDate,
                      end_date: endDate
                    });
                  } catch (err) {
                    alert(err.message || 'Gagal mengunduh Rekap PDF');
                  }
                }}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                title="Download Rekap Rekam Medis PDF"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">download</span>
              </button>
            </div>
          </section>

          {/* ── Filter Bar Card ──────────────────────────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5 relative overflow-hidden group">
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-50 bg-primary/5 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-[20px] text-primary">filter_list</span>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 font-headline">Filter Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {/* Status */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">vital_signs</span>
                    Status Klinis
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer"
                  >
                    <option value="Semua Status">Semua Status</option>
                    <option value="Stabil">Stabil</option>
                    <option value="Perlu Perhatian">Perlu Perhatian</option>
                    <option value="Pemulihan">Pemulihan</option>
                  </select>
                </div>

                {/* Fakultas */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">domain</span>
                    Fakultas
                  </label>
                  <select
                    value={selectedFakultas}
                    onChange={(e) => handleFakultasChange(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer"
                  >
                    <option value="Semua Fakultas">Semua Fakultas</option>
                    {fakultasList.map((f) => (
                      <option key={f.id} value={f.nama}>{f.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Prodi */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">school</span>
                    Program Studi
                  </label>
                  <select
                    value={selectedProdi}
                    onChange={(e) => setSelectedProdi(e.target.value)}
                    disabled={selectedFakultas === 'Semua Fakultas'}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Semua Prodi">Semua Prodi</option>
                    {filteredProdis.map((p) => (
                      <option key={p.id} value={p.nama}>{p.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Dari Tanggal */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">event</span>
                    Dari Tanggal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* Sampai Tanggal */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">event</span>
                    Sampai Tanggal
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                  {/* Empty space for tabs if needed in the future */}
                  <span className="text-[10px] font-bold text-slate-400">Pilih kriteria untuk menyaring data</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFakultas('Semua Fakultas');
                    setSelectedProdi('Semua Prodi');
                    setFilterStatus('Semua Status');
                    setStartDate('');
                    setEndDate('');
                  }}
                  disabled={!(selectedFakultas !== 'Semua Fakultas' || selectedProdi !== 'Semua Prodi' || filterStatus !== 'Semua Status' || startDate || endDate)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Reset Filter
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 w-full">
            
            {/* Main Patient List (Col 9) */}
            <div className="lg:col-span-9 space-y-4">
              <div className="rounded-2xl border shadow-sm p-5 space-y-5 relative overflow-hidden bg-white" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 font-headline">Daftar Pasien Terdaftar</h2>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">Total {filteredPatients.length} pasien ditemukan</p>
                  </div>
                </div>

                <DataTable
                  columns={columns}
                  data={filteredPatients}
                  loading={loading}
                  searchable={true}
                  onSearch={handleTableSearch}
                  searchPlaceholder="Cari nama, NIM, fakultas..."
                  pagination={true}
                  pageSize={10}
                  onRowClick={(row) => navigate(`/psychologist/patients/${row.id}/medical-record`)}
                  emptyMessage="Tidak ada pasien. Coba ubah filter atau kata kunci pencarian."
                  emptyIcon="group_off"
                />
              </div>
            </div>

            {/* Statistics Sidebar (Col 3) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Ringkasan Data Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <span className="material-symbols-outlined text-base shrink-0" style={{ color: 'color-mix(in srgb, var(--theme-primary) 60%, transparent)' }}>analytics</span>
                  <h3 className="text-[10px] font-black font-headline uppercase tracking-widest" style={{ color: 'var(--theme-h3)' }}>Ringkasan Data</h3>
                </div>
                
                {/* Premium Card 1: Total Pasien Unik */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="absolute -right-8 -top-5 w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)' }} />
                  
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', color: 'var(--theme-primary)' }}>
                      <span className="material-symbols-outlined text-base shrink-0">group</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-blue-50/80 border border-blue-100 px-2.5 py-0.5 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                      AKTIF
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">Pasien Unik</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{patients.length} Orang</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">mahasiswa terdaftar</p>
                </div>

                {/* Premium Card 2: Sesi Bulan Ini */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="absolute -right-8 -top-5 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <span className="material-symbols-outlined text-base shrink-0">show_chart</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-emerald-50/80 border border-emerald-100 px-2.5 py-0.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE
                    </div>
                  </div>
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5">Sesi Bulan Ini</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {patients.reduce((sum, item) => sum + Number(item.sessions || 0), 0)} Sesi
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">konseling terselesaikan</p>
                </div>
              </div>

              {/* Data Security Info Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bku-primary via-[#0b338f] to-[#003B95] p-5 text-white shadow-xl shadow-blue-900/10 border border-white/5">
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-base shrink-0">security</span>
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Keamanan Data</h4>
                  <p className="mt-2 text-xs font-semibold text-slate-100/90 leading-relaxed uppercase tracking-wider">
                    Hanya Anda dan mahasiswa bersangkutan yang memiliki akses ke detail rekam medis ini.
                  </p>
                </div>
                
                <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-9xl text-white/5 rotate-12 pointer-events-none font-thin" >shield</span>
              </div>
              
            </div>

          </div>

        </div>
    </>
  );
}

