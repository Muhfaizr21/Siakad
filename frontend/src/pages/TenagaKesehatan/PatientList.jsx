import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenagaKesehatanService } from '../../services/api';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';

const SearchIcon = () => <span className="material-symbols-outlined text-base">search</span>;
const HistoryIcon = () => <span className="material-symbols-outlined text-sm">history</span>;
const AddIcon = () => <span className="material-symbols-outlined text-sm">medical_services</span>;
const UserIcon = () => <span className="material-symbols-outlined text-slate-400 text-lg">person</span>;

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFakultas, setSelectedFakultas] = useState('Semua Fakultas');
  const [selectedProdi, setSelectedProdi] = useState('Semua Prodi');
  const [selectedGender, setSelectedGender] = useState('Semua Gender');
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'asc' });

  const navigate = useNavigate();

  const loadPatients = () => {
    setLoading(true);
    tenagaKesehatanService.getPatients()
      .then((res) => {
        setPatients(res.data || []);
        setError('');
      })
      .catch((err) => {
        setError(err.message || 'Gagal memuat data mahasiswa.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Debounced global lookup effect
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 3) {
      setGlobalResults([]);
      return;
    }

    const handler = setTimeout(() => {
      setIsSearchingGlobal(true);
      tenagaKesehatanService.lookupStudent(query)
        .then((res) => {
          // Exclude students that are already in the local patients array
          const localNims = new Set(patients.map((p) => p.nim));
          const newGlobals = (res.data || []).filter((s) => s.nim && !localNims.has(s.nim));
          setGlobalResults(newGlobals);
        })
        .catch(() => {
          setGlobalResults([]);
        })
        .finally(() => {
          setIsSearchingGlobal(false);
        });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery, patients]);

  // Extract unique Fakultas and Program Studi from patients list
  const fakultasList = useMemo(() => {
    const list = patients.map((p) => p.Fakultas?.nama).filter(Boolean);
    return ['Semua Fakultas', ...Array.from(new Set(list))];
  }, [patients]);

  const prodiList = useMemo(() => {
    const list = patients
      .filter((p) => selectedFakultas === 'Semua Fakultas' || p.Fakultas?.nama === selectedFakultas)
      .map((p) => p.ProgramStudi?.nama)
      .filter(Boolean);
    return ['Semua Prodi', ...Array.from(new Set(list))];
  }, [patients, selectedFakultas]);

  // Combine and filter lists
  const combinedList = useMemo(() => {
    const locals = patients.map((p) => ({ ...p, isLocal: true }));
    const globals = globalResults.map((g) => ({ ...g, isLocal: false }));
    return [...locals, ...globals];
  }, [patients, globalResults]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFakultas, selectedProdi, selectedGender]);

  const filteredPatients = useMemo(() => {
    return combinedList.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
        (p.nama || '').toLowerCase().includes(query) ||
        (p.nim || '').toLowerCase().includes(query);

      const matchesFakultas = selectedFakultas === 'Semua Fakultas' ||
        (p.Fakultas?.nama || '') === selectedFakultas;

      const matchesProdi = selectedProdi === 'Semua Prodi' ||
        (p.ProgramStudi?.nama || '') === selectedProdi;

      const matchesGender = selectedGender === 'Semua Gender' ||
        (p.jenis_kelamin || 'Laki-Laki') === selectedGender;

      return matchesSearch && matchesFakultas && matchesProdi && matchesGender;
    });
  }, [combinedList, searchQuery, selectedFakultas, selectedProdi, selectedGender]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPatients = useMemo(() => {
    const sortableItems = [...filteredPatients];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = '';
        let bValue = '';
        
        switch (sortConfig.key) {
          case 'nama':
            aValue = (a.nama || '').toLowerCase();
            bValue = (b.nama || '').toLowerCase();
            break;
          case 'nim':
            aValue = (a.nim || '').toLowerCase();
            bValue = (b.nim || '').toLowerCase();
            break;
          case 'prodi':
            aValue = (a.ProgramStudi?.nama || '').toLowerCase();
            bValue = (b.ProgramStudi?.nama || '').toLowerCase();
            break;
          case 'fakultas':
            aValue = (a.Fakultas?.nama || '').toLowerCase();
            bValue = (b.Fakultas?.nama || '').toLowerCase();
            break;
          case 'kontak':
            aValue = (a.no_hp || a.email_personal || '').toLowerCase();
            bValue = (b.no_hp || b.email_personal || '').toLowerCase();
            break;
          default:
            break;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPatients, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedPatients.length / itemsPerPage));
  const paginatedPatients = sortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="material-symbols-outlined text-sm ml-1 opacity-30">unfold_more</span>;
    return sortConfig.direction === 'asc' 
      ? <span className="material-symbols-outlined text-sm ml-1 text-bku-primary">keyboard_arrow_up</span>
      : <span className="material-symbols-outlined text-sm ml-1 text-bku-primary">keyboard_arrow_down</span>;
  };

  return (
    <PageContent>
      <DashboardHero
        title="Daftar"
        highlightedTitle="Mahasiswa"
        subtitle="Pencarian cepat rekam medis, input screening fisik baru secara langsung, atau rujuk kondisi medis mahasiswa ke unit eskalasi."
        icon="people"
        badges={[
          { label: 'Rekam Medis Mahasiswa', active: true },
        ]}
        actions={
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                try {
                  await tenagaKesehatanService.exportExcel();
                } catch (err) {
                  alert(err.message || 'Gagal export Excel.');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm">download</span> Export Excel
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await tenagaKesehatanService.exportPDF();
                } catch (err) {
                  alert(err.message || 'Gagal export PDF.');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bku-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-bku-primary/10 transition-all hover:bg-bku-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">download</span> Export PDF
            </button>
          </div>
        }
      />

        {/* Filter Bar Card */}
        <section className="bg-white/70 border border-slate-200/60 p-5 rounded-2xl shadow-sm glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-bku-primary text-base">filter_alt</span>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider font-headline">Saring & Cari Mahasiswa</h3>
            </div>
            {(selectedFakultas !== 'Semua Fakultas' || selectedProdi !== 'Semua Prodi' || selectedGender !== 'Semua Gender' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFakultas('Semua Fakultas');
                  setSelectedProdi('Semua Prodi');
                  setSelectedGender('Semua Gender');
                  setSearchQuery('');
                }}
                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span> Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Pencarian</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                <input
                  type="text"
                  placeholder="Ketik NIM atau Nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-xs font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-bku-primary focus:bg-white"
                />
                {isSearchingGlobal && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-base animate-spin text-bku-primary">sync</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fakultas Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Fakultas</label>
              <select
                value={selectedFakultas}
                onChange={(e) => {
                  setSelectedFakultas(e.target.value);
                  setSelectedProdi('Semua Prodi');
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white cursor-pointer"
              >
                {fakultasList.map((fak) => (
                  <option key={fak} value={fak}>{fak}</option>
                ))}
              </select>
            </div>

            {/* Program Studi Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Program Studi</label>
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white cursor-pointer"
              >
                {prodiList.map((prod) => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Jenis Kelamin</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-bku-primary focus:bg-white cursor-pointer"
              >
                <option value="Semua Gender">Semua Gender</option>
                <option value="Laki-Laki">Laki-Laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
        </section>

        {/* Patient Table Card */}
        <section className="bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4 glass-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-bku-primary font-headline">Daftar Mahasiswa Terdaftar</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Daftar pasien mahasiswa reguler dan kunjungan klinik</p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-slate-400">
              <span className="material-symbols-outlined text-3xl animate-spin text-bku-primary/50">sync</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Memuat daftar mahasiswa...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-xs text-rose-500 font-bold">{error}</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center text-center p-6">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-300">
                <span className="material-symbols-outlined text-xl">person_off</span>
              </div>
              <h3 className="mt-4 text-xs font-black uppercase tracking-tight text-slate-700">Tidak Ada Mahasiswa Ditemukan</h3>
              <p className="mt-1 max-w-sm text-xs font-semibold text-slate-500">Coba gunakan fitur pencarian global di sebelah kiri untuk mencari langsung.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('nama')}>
                      <div className="flex items-center">Nama Mahasiswa <SortIcon columnKey="nama" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('nim')}>
                      <div className="flex items-center">NIM <SortIcon columnKey="nim" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('prodi')}>
                      <div className="flex items-center">Program Studi <SortIcon columnKey="prodi" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('fakultas')}>
                      <div className="flex items-center">Fakultas <SortIcon columnKey="fakultas" /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('kontak')}>
                      <div className="flex items-center">Kontak <SortIcon columnKey="kontak" /></div>
                    </th>
                    <th className="py-3 px-4 text-right">Tindakan Medis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {paginatedPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-bku-primary/5 transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs uppercase text-slate-500">
                            {p.nama ? p.nama.slice(0, 2) : 'MH'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                              {p.nama}
                              {!p.isLocal && (
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-black text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase">
                                  Pusat
                                </span>
                              )}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{p.jenis_kelamin || 'Laki-Laki'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">{p.nim}</td>
                      <td className="py-4 px-4 text-slate-500 font-medium">{p.ProgramStudi?.nama || '-'}</td>
                      <td className="py-4 px-4 text-slate-400 font-semibold">{p.Fakultas?.nama || '-'}</td>
                      <td className="py-4 px-4 text-slate-500">
                        <p>{p.no_hp || '-'}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{p.email_personal || '-'}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => navigate(`/tenagakes/patients/${p.id}/medical-record`)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-colors"
                          >
                            <HistoryIcon /> History
                          </button>
                          <button
                            onClick={() => navigate(`/tenagakes/patients/${p.id}/medical-record?new_screening=true`)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-bku-primary hover:bg-bku-hover text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] shadow-sm shadow-bku-primary/5"
                          >
                            <AddIcon /> Screening
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPatients.length)} dari {filteredPatients.length} Data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-bku-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1)
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-slate-400 text-xs font-bold px-1">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${
                            currentPage === page
                              ? 'bg-bku-primary text-white shadow-md shadow-bku-primary/20'
                              : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-white hover:text-bku-primary'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:text-bku-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </section>

    </PageContent>
  );
}
