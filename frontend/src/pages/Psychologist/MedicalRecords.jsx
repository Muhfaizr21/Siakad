import React, { useEffect, useMemo, useState } from 'react';
import { psychologistService } from '../../services/api';

export default function MedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [fakultasList, setFakultasList] = useState([]);
  const [prodiList, setProdiList] = useState([]);

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let ignore = false;
    loadMedicalRecords();
    psychologistService.getFakultasList().then((res) => {
      if (!ignore) setFakultasList(res.data || []);
    });
    psychologistService.getProdiList().then((res) => {
      if (!ignore) setProdiList(res.data || []);
    });
    return () => { ignore = true; };
  }, []);

  const loadMedicalRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await psychologistService.getMedicalRecords();
      if (res.status === 'success') {
        const flattened = (res.data || []).map(item => {
          const m = item.mahasiswa || {};
          return {
            ...item,
            _fakultas: item.mahasiswa_fakultas ?? m.Fakultas?.Nama ?? '',
            _prodi: item.mahasiswa_prodi ?? m.ProgramStudi?.Nama ?? '',
            _name: item.mahasiswa_name ?? m.Nama ?? '',
            _nim: item.mahasiswa_nim ?? m.NIM ?? ''
          };
        });
        setMedicalRecords(flattened);
      } else {
        setError('Gagal memuat rekam medis');
      }
    } catch (err) {
      console.error('Error loading medical records:', err);
      setError('Koneksi sistem terputus / Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...medicalRecords];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r._name.toLowerCase().includes(query) || 
        r._nim.includes(searchQuery) ||
        (r.complaint && r.complaint.toLowerCase().includes(query)) ||
        (r.observation && r.observation.toLowerCase().includes(query))
      );
    }
    if (filterStatus !== 'Semua Status') {
      result = result.filter(r => r.status_pasien === filterStatus);
    }
    if (selectedFakultas !== 'Semua Fakultas') {
      result = result.filter(r => r._fakultas === selectedFakultas);
    }
    if (selectedProdi !== 'Semua Prodi') {
      result = result.filter(r => r._prodi === selectedProdi);
    }
    if (startDate) {
      result = result.filter(r => {
        if (!r.date) return false;
        // Parsing "07 Jun 2026" or raw format is needed. Let's compare via time or raw string if we add raw_date, but since we parsed to date, let's convert record.date string back to YYYY-MM-DD
        const parsedRecordDate = new Date(r.date);
        const start = new Date(startDate);
        return parsedRecordDate >= start;
      });
    }
    if (endDate) {
      result = result.filter(r => {
        if (!r.date) return false;
        const parsedRecordDate = new Date(r.date);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return parsedRecordDate <= end;
      });
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (sortConfig.key === 'date') {
          valA = new Date(a.date);
          valB = new Date(b.date);
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [medicalRecords, searchQuery, filterStatus, selectedFakultas, selectedProdi, startDate, endDate, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / pageSize);
  const paginatedRecords = filteredAndSortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stabil': return { bg: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', text: 'var(--theme-success)', border: 'color-mix(in srgb, var(--theme-success) 20%, transparent)', dot: 'var(--theme-success)', dotAnim: '' };
      case 'Perlu Perhatian': return { bg: 'color-mix(in srgb, var(--theme-error) 10%, transparent)', text: 'var(--theme-error)', border: 'color-mix(in srgb, var(--theme-error) 20%, transparent)', dot: 'var(--theme-error)', dotAnim: 'animate-pulse' };
      case 'Pemulihan': return { bg: 'color-mix(in srgb, var(--theme-info) 10%, transparent)', text: 'var(--theme-info)', border: 'color-mix(in srgb, var(--theme-info) 20%, transparent)', dot: 'var(--theme-info)', dotAnim: '' };
      default: return { bg: 'color-mix(in srgb, var(--theme-text-muted) 10%, transparent)', text: 'var(--theme-text-muted)', border: 'color-mix(in srgb, var(--theme-text-muted) 20%, transparent)', dot: 'var(--theme-text-muted)', dotAnim: '' };
    }
  };

  const handleOpenDetail = (item) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return '-';
    const parts = name.trim().split(/\s+/);
    return parts.map(p => p[0]).slice(0, 3).join('').toUpperCase();
  };

  return (
    <>
      <div className="w-full relative space-y-6 scroll-smooth">
        
        {/* Welcome Banner Card */}
        <section className="relative overflow-hidden rounded-2xl border p-5 shadow-sm flex flex-col gap-5 group"
          style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)' }} />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--theme-secondary) 5%, transparent)' }} />
          
          <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between w-full">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                style={{ backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)', color: 'var(--theme-primary)' }}
              >
                <span className="material-symbols-outlined text-base shrink-0">medical_services</span>
                Rekam Medis Klinis
              </div>
              <h1 className="mt-3 text-2xl font-black uppercase tracking-tight font-headline" style={{ color: 'var(--theme-primary)' }}>Rekam Medis</h1>
              <p className="mt-1 max-w-2xl text-xs font-bold leading-5 text-slate-500">
                Pantau riwayat sesi klinis mahasiswa, mood logger, observasi psikolog, dan rekomendasi tindak lanjut secara aman dan konfidensial.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Bar Card */}
        <section className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0" style={{ color: 'color-mix(in srgb, var(--theme-primary) 60%, transparent)' }}>filter_alt</span>
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
                <span className="material-symbols-outlined text-sm shrink-0">restart_alt</span> Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pencarian</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base shrink-0">search</span>
                <input 
                  type="text" 
                  placeholder="Nama, NIM, keluhan..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-[var(--theme-primary)] transition-all"
                  style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Klinis</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none focus:border-[var(--theme-primary)] transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
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
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none focus:border-[var(--theme-primary)] transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
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
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none focus:border-[var(--theme-primary)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
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
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none focus:border-[var(--theme-primary)] transition-all"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              />
            </div>

            {/* Sampai Tanggal */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none focus:border-[var(--theme-primary)] transition-all"
                style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              />
            </div>
          </div>
        </section>

        {/* Medical Records List Card */}
        <section className="rounded-2xl border shadow-sm p-5" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
              <span className="material-symbols-outlined text-base shrink-0">list</span> Daftar Sesi Rekam Medis
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Total: {filteredAndSortedRecords.length}
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-rose-400 text-4xl mb-3 shrink-0">error</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{error}</p>
            </div>
          ) : filteredAndSortedRecords.length === 0 ? (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-3 shrink-0">inbox</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada rekam medis ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mahasiswa</th>
                    <th onClick={() => handleSort('date')} className="cursor-pointer hover:text-[var(--theme-primary)] pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        Tanggal Pemeriksaan <span className="text-[10px] opacity-50">{sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                      </div>
                    </th>
                    <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Jenis Sesi</th>
                    <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mood</th>
                    <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Pasien</th>
                    <th className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedRecords.map((record) => {
                    const statusStyle = getStatusColor(record.status_pasien);
                    return (
                      <tr key={record.id} className="group hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-[1.25rem] bg-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0 overflow-hidden">
                              {getInitials(record._name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-snug">{record._name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{record._nim} • {record._fakultas}</p>
                              <p className="text-[9px] text-slate-500 italic mt-0.5">{record._prodi}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col font-body">
                            <span className="font-bold text-xs text-neutral-800">{record.date}</span>
                            <span className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">{record.time} WIB</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold text-slate-700">{record.type || 'Sesi Umum'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold text-slate-800">{record.mood || '—'}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotAnim}`} style={{ backgroundColor: statusStyle.dot }}></span>
                            {record.status_pasien || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleOpenDetail(record)}
                            className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all shadow-sm"
                            title="Lihat Detail Sesi"
                          >
                            <span className="material-symbols-outlined text-base shrink-0">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Halaman {currentPage} Dari {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setIsDetailOpen(false)}
          ></div>
          
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-5 text-white flex justify-between items-center relative overflow-hidden shrink-0" style={{ backgroundColor: 'var(--theme-primary)' }}>
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-sm font-black uppercase tracking-tight font-headline">Detail Rekam Medis</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5">Catatan Sesi & Diagnosis Pasien</p>
              </div>
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors relative z-10"
              >
                <span className="material-symbols-outlined text-base shrink-0">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Patient Identitas */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm shrink-0">person</span> Identitas Mahasiswa
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nama Lengkap</span>
                    <span className="text-xs font-bold text-slate-800">{detailItem._name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">NIM (Nomor Induk Mahasiswa)</span>
                    <span className="text-xs font-bold text-slate-800">{detailItem._nim || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Fakultas</span>
                    <span className="text-xs font-semibold text-slate-700">{detailItem._fakultas || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Program Studi</span>
                    <span className="text-xs font-semibold text-slate-700">{detailItem._prodi || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Sesi Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tanggal Pemeriksaan</span>
                  <span className="text-xs font-bold text-slate-800">{detailItem.date} {detailItem.time} WIB</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Mood Pasien</span>
                  <span className="text-xs font-bold text-indigo-600">{detailItem.mood || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Status Pasien</span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mt-1"
                    style={(() => {
                      const style = getStatusColor(detailItem.status_pasien);
                      return { backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` };
                    })()}
                  >
                    {detailItem.status_pasien || '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Keluhan */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Keluhan Sesi Konseling</span>
                  <div className="bg-slate-50/50 border border-slate-200/50 p-3.5 rounded-xl text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {detailItem.complaint || '—'}
                  </div>
                </div>

                {/* Observasi */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Hasil Observasi Psikolog</span>
                  <div className="bg-slate-50/50 border border-slate-200/50 p-3.5 rounded-xl text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {detailItem.observation || '—'}
                  </div>
                </div>

                {/* Rekomendasi */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Rekomendasi Penanganan & Tindak Lanjut</span>
                  <div className="bg-indigo-50/10 border border-indigo-100 p-3.5 rounded-xl text-xs text-indigo-900 font-bold whitespace-pre-wrap leading-relaxed">
                    {detailItem.recommendation || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
