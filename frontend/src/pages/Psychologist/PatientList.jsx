import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { psychologistService } from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

export default function PatientList() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [fakultasList, setFakultasList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let ignore = false;
    psychologistService.getPatients().then((res) => {
      if (!ignore) setPatients(res.data || []);
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
    setCurrentPage(1);
  };

  const filteredAndSortedPatients = useMemo(() => {
    let result = [...patients];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query) || p.nim.includes(searchQuery));
    }
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
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'sessions') { valA = Number(valA); valB = Number(valB); }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [patients, searchQuery, filterStatus, selectedFakultas, selectedProdi, startDate, endDate, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedPatients.length / pageSize);
  const paginatedPatients = filteredAndSortedPatients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stabil': return { bg: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', text: 'var(--theme-success)', border: 'color-mix(in srgb, var(--theme-success) 20%, transparent)', dot: 'var(--theme-success)', dotAnim: '' };
      case 'Perlu Perhatian': return { bg: 'color-mix(in srgb, var(--theme-error) 10%, transparent)', text: 'var(--theme-error)', border: 'color-mix(in srgb, var(--theme-error) 20%, transparent)', dot: 'var(--theme-error)', dotAnim: 'animate-pulse' };
      case 'Pemulihan': return { bg: 'color-mix(in srgb, var(--theme-info) 10%, transparent)', text: 'var(--theme-info)', border: 'color-mix(in srgb, var(--theme-info) 20%, transparent)', dot: 'var(--theme-info)', dotAnim: '' };
      default: return { bg: 'color-mix(in srgb, var(--theme-text-muted) 10%, transparent)', text: 'var(--theme-text-muted)', border: 'color-mix(in srgb, var(--theme-text-muted) 20%, transparent)', dot: 'var(--theme-text-muted)', dotAnim: '' };
    }
  };

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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
                {/* Search */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">search</span>
                    Pencarian
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nama atau NIM..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-800 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-base">vital_signs</span>
                    Status Klinis
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
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
                    onChange={(e) => { setSelectedProdi(e.target.value); setCurrentPage(1); }}
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
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
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
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
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
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  disabled={!(selectedFakultas !== 'Semua Fakultas' || selectedProdi !== 'Semua Prodi' || filterStatus !== 'Semua Status' || startDate || endDate || searchQuery)}
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
                    <p className="text-[10px] font-bold text-slate-500 mt-1">Total {filteredAndSortedPatients.length} pasien ditemukan</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 sm:mt-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Urutkan:</span>
                    <button onClick={() => handleSort('name')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                      Nama {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                    <button onClick={() => handleSort('sessions')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                      Sesi {sortConfig.key === 'sessions' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </button>
                  </div>
                </div>

                {paginatedPatients.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center">
                    <div className="flex w-20 h-20 items-center justify-center rounded-[1.5rem] bg-slate-50 border border-slate-100 text-slate-300">
                      <span className="material-symbols-outlined text-[40px]">group_off</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase tracking-tight text-slate-800 font-headline">Tidak ada pasien</h3>
                      <p className="mt-1.5 text-sm font-medium text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Identitas Pasien</TableHead>
                        <TableHead>Aktivitas Sesi</TableHead>
                        <TableHead>Status Klinis</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPatients.map((patient) => {
                        const statusStyle = getStatusColor(patient.status);
                        
                        return (
                          <TableRow 
                            key={patient.id} 
                            onClick={() => navigate(`/psychologist/patients/${patient.id}/medical-record`)}
                            className={`cursor-pointer group ${patient.status === 'Selesai' ? 'opacity-60 grayscale-[35%]' : ''}`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${patient.color || 'bg-primary'} text-white flex items-center justify-center font-black text-xs shadow-sm bg-primary border border-primary/20 shrink-0 overflow-hidden relative`}>
                                  {patient.foto_url || patient.foto ? (
                                    <img src={patient.foto_url || patient.foto} alt={patient.name} className="w-full h-full object-cover" />
                                  ) : (
                                    patient.name?.charAt(0) || 'P'
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors max-w-[200px] truncate">{patient.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{patient.nim} &bull; {patient.faculty}</p>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined !text-[12px]">show_chart</span>
                                  </span>
                                  <div>
                                    <p className="text-[11px] font-black text-slate-700">{patient.sessions} Kali</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-slate-100 text-slate-500">
                                    <span className="material-symbols-outlined !text-[12px]">calendar_month</span>
                                  </span>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-500">{patient.lastVisit}</p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotAnim}`} style={{ backgroundColor: statusStyle.dot }} />
                                {patient.status}
                              </span>
                            </TableCell>
                            
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end">
                                <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[2rem]">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Tampilkan:</span>
                      <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="p-1.5 rounded-lg bg-white border border-slate-200 outline-none">
                        <option value={5}>5 Data</option>
                        <option value={10}>10 Data</option>
                        <option value={20}>20 Data</option>
                      </select>
                    </div>
                    <span className="hidden sm:inline-block w-px h-4 bg-slate-300"></span>
                    <span>Total: {filteredAndSortedPatients.length} Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all">Prev</button>
                    <span className="text-xs font-bold text-slate-600 px-2">Hal {currentPage} / {totalPages || 1}</span>
                    <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all">Next</button>
                  </div>
                </div>
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

