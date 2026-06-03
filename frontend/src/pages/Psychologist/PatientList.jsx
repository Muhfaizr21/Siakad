import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

export default function PatientList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      case 'Stabil': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Perlu Perhatian': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Pemulihan': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className="lg:ml-64 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-6 lg:px-10 pb-12 w-full relative space-y-8 scroll-smooth">
          
          {/* Welcome Banner Card (Non-Dashboard -> White Gradient) */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20 border border-slate-100 p-8 shadow-sm flex flex-col gap-6 group">
            {/* Soft decorative blur nodes */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between w-full">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined size-3.5">stars</span>
                  Rekam Medis Klinis
                </div>
                <h1 className="mt-3 text-2xl font-black text-primary uppercase tracking-tight font-headline">Daftar Pasien</h1>
                <p className="mt-1 max-w-2xl text-xs font-bold leading-5 text-slate-500">
                  Pantau riwayat sesi, rekam medis klinis, dan status psikologis mahasiswa secara terpusat dan aman.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 relative z-20">
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
                  className="flex items-center justify-center p-3 bg-white border border-slate-200/80 rounded-2xl text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm shrink-0 hover:scale-105 active:scale-95"
                  title="Download Rekap Rekam Medis PDF"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            </div>
          </section>

          {/* Filter Bar Card */}
          <section className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary/60 text-lg">filter_alt</span>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filter Data</h3>
              </div>
              {(selectedFakultas !== 'Semua Fakultas' || selectedProdi !== 'Semua Prodi' || filterStatus !== 'Semua Status' || startDate || endDate || searchQuery) && (
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
                  className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span> Reset Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pencarian</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">search</span>
                  <input 
                    type="text" 
                    placeholder="Nama atau NIM..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Klinis</label>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Stabil">Stabil</option>
                  <option value="Perlu Perhatian">Perlu Perhatian</option>
                  <option value="Pemulihan">Pemulihan</option>
                </select>
              </div>

              {/* Fakultas */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fakultas</label>
                <select
                  value={selectedFakultas}
                  onChange={(e) => handleFakultasChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Semua Fakultas">Semua Fakultas</option>
                  {fakultasList.map((f) => (
                    <option key={f.id} value={f.nama}>{f.nama}</option>
                  ))}
                </select>
              </div>

              {/* Prodi */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Program Studi</label>
                <select
                  value={selectedProdi}
                  onChange={(e) => { setSelectedProdi(e.target.value); setCurrentPage(1); }}
                  disabled={selectedFakultas === 'Semua Fakultas'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="Semua Prodi">Semua Prodi</option>
                  {filteredProdis.map((p) => (
                    <option key={p.id} value={p.nama}>{p.nama}</option>
                  ))}
                </select>
              </div>

              {/* Dari Tanggal */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>

              {/* Sampai Tanggal */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
            
            {/* Main Patient List (Col 9) */}
            <div className="lg:col-span-9 space-y-4">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th onClick={() => handleSort('name')} className="cursor-pointer hover:text-primary pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Mahasiswa <span className="text-[10px] opacity-50">{sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                        <th onClick={() => handleSort('sessions')} className="cursor-pointer hover:text-primary pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Sesi <span className="text-[10px] opacity-50">{sortConfig.key === 'sessions' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kunjungan Terakhir</th>
                        <th onClick={() => handleSort('status')} className="cursor-pointer hover:text-primary pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Status <span className="text-[10px] opacity-50">{sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                        <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedPatients.map((patient) => (
                        <tr key={patient.id} className="group hover:bg-slate-50/40 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-[1.25rem] ${patient.color || 'bg-primary'} text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0 overflow-hidden relative`}>
                                {patient.foto_url || patient.foto ? (
                                  <img src={patient.foto_url || patient.foto} alt={patient.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-white/80" style={{ fontSize: '24px' }}>person</span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900 leading-snug">{patient.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{patient.nim} • {patient.faculty}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-primary/5 text-primary rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[13px]" >show_chart</span>
                              </span>
                              <span className="text-xs font-black text-slate-700">{patient.sessions} Kali</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="w-6 h-6 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[13px]" >calendar_month</span>
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{patient.lastVisit}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(patient.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${patient.status === 'Stabil' ? 'bg-emerald-500' : patient.status === 'Perlu Perhatian' ? 'bg-rose-500' : patient.status === 'Pemulihan' ? 'bg-blue-500' : 'bg-slate-400'} ${patient.status === 'Perlu Perhatian' ? 'animate-pulse' : ''}`} />
                              {patient.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button 
                              onClick={() => navigate(`/psychologist/patients/${patient.id}/medical-record`)}
                              className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center ml-auto group/btn border border-slate-100/50"
                            >
                              <span className="material-symbols-outlined group-hover/btn:translate-x-0.5 transition-transform text-lg" >chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  <span className="material-symbols-outlined text-primary/60 text-base">analytics</span>
                  <h3 className="text-[10px] font-black font-headline uppercase tracking-widest" style={{ color: 'var(--theme-h3)' }}>Ringkasan Data</h3>
                </div>
                
                {/* Premium Card 1: Total Pasien Unik */}
                <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 bg-primary/5 text-primary rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <span className="material-symbols-outlined text-lg">group</span>
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
                <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <span className="material-symbols-outlined text-lg">show_chart</span>
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
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-bku-primary via-[#0b338f] to-[#003B95] p-6 text-white shadow-xl shadow-blue-900/10 border border-white/5">
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-xl">security</span>
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
      </main>
    </div>
  );
}

