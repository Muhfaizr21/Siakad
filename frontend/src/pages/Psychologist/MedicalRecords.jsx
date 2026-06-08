import React, { useEffect, useMemo, useState } from 'react';
import { psychologistService } from '../../services/api';
import { DataTable } from '@/components/ui/DataTable';

export default function MedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [fakultasList, setFakultasList] = useState([]);
  const [prodiList, setProdiList] = useState([]);

  // Detail Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

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
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stabil': return { bg: 'color-mix(in srgb, var(--theme-success) 10%, transparent)', text: 'var(--theme-success)', border: 'color-mix(in srgb, var(--theme-success) 20%, transparent)', dot: 'var(--theme-success)', dotAnim: '' };
      case 'Perlu Perhatian': return { bg: 'color-mix(in srgb, var(--theme-error) 10%, transparent)', text: 'var(--theme-error)', border: 'color-mix(in srgb, var(--theme-error) 20%, transparent)', dot: 'var(--theme-error)', dotAnim: 'animate-pulse' };
      case 'Pemulihan': return { bg: 'color-mix(in srgb, var(--theme-info) 10%, transparent)', text: 'var(--theme-info)', border: 'color-mix(in srgb, var(--theme-info) 20%, transparent)', dot: 'var(--theme-info)', dotAnim: '' };
      default: return { bg: 'color-mix(in srgb, var(--theme-text-muted) 10%, transparent)', text: 'var(--theme-text-muted)', border: 'color-mix(in srgb, var(--theme-text-muted) 20%, transparent)', dot: 'var(--theme-text-muted)', dotAnim: '' };
    }
  };

  const filteredRecords = useMemo(() => {
    let result = [...medicalRecords];
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
    return result;
  }, [medicalRecords, filterStatus, selectedFakultas, selectedProdi, startDate, endDate]);

  const handleTableSearch = (data, searchVal) => {
    const query = searchVal.trim().toLowerCase();
    if (!query) return data;
    return data.filter((r) => {
      const searchableStr = [
        r._name,
        r._nim,
        r._fakultas,
        r._prodi,
        r.complaint,
        r.observation,
        r.recommendation,
        r.status_pasien,
      ].filter(Boolean).join(' ').toLowerCase();
      return searchableStr.includes(query);
    });
  };

  const columns = [
    {
      key: '_name',
      label: 'Pasien',
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50/80 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black text-sm shrink-0">
            {getInitials(row._name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-slate-900">{row._name}</p>
            <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-slate-500">{row._nim} &bull; {row._fakultas}</p>
          </div>
        </div>
      )
    },
    {
      key: 'date',
      label: 'Jadwal Pemeriksaan',
      sortable: true,
      render: (v, row) => (
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-800">
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0">calendar_month</span>
            {row.date || '-'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mt-1">
            <span className="material-symbols-outlined text-[14px] shrink-0">schedule</span>
            {row.time || '-'} WIB
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Sesi & Mood',
      sortable: true,
      render: (v, row) => (
        <div>
          <p className="text-[11px] font-black text-slate-700">{row.type || 'Sesi Umum'}</p>
          <p className="text-[10px] font-bold text-indigo-600 mt-0.5">Mood: {row.mood || '—'}</p>
        </div>
      )
    },
    {
      key: 'status_pasien',
      label: 'Status Klinis',
      sortable: true,
      render: (v, row) => {
        const statusStyle = getStatusColor(row.status_pasien);
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotAnim}`} style={{ backgroundColor: statusStyle.dot }} />
            {row.status_pasien || '—'}
          </span>
        );
      }
    }
  ];

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
                  <span className="material-symbols-outlined text-primary relative z-10" style={{ fontSize: '26px' }}>medical_services</span>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
                      Rekam Medis Klinis
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-headline leading-none">
                    Rekam Medis
                  </h1>
                  <p className="mt-2 text-xs md:text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
                    Pantau riwayat sesi klinis mahasiswa, mood logger, observasi psikolog, dan rekomendasi tindak lanjut secara aman dan konfidensial.
                  </p>
               </div>
            </div>
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

        {/* Medical Records List Card */}
        <section className="rounded-2xl border shadow-sm p-5 space-y-5 bg-white" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-base shrink-0">list</span> Daftar Sesi Rekam Medis
              </h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                Total {filteredRecords.length} data
              </p>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            searchable={true}
            onSearch={handleTableSearch}
            searchPlaceholder="Cari nama, NIM, keluhan..."
            pagination={true}
            pageSize={10}
            onRowClick={(row) => handleOpenDetail(row)}
            emptyMessage="Tidak ada rekam medis. Coba ubah filter atau kata kunci pencarian."
            emptyIcon="inbox"
          />
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
