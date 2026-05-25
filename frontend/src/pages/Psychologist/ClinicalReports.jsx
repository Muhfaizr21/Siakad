import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

import { UI } from '../../constants/designSystem';
import { psychologistService } from '../../services/api';

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const FilePlus = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>note_add</span>;
const Share2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>share</span>;
const FileDown = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;



export default function ClinicalReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua Tipe');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const [reports, setReports] = useState([]);

  const loadReports = () => psychologistService.getReports().then((res) => setReports(res.data || []));

  useEffect(() => {
    let ignore = false;
    psychologistService.getReports().then((res) => {
      if (!ignore) setReports(res.data || []);
    });
    return () => { ignore = true; };
  }, []);

  const createReport = async () => {
    await psychologistService.createReport();
    await loadReports();
  };

  const filteredAndSortedReports = React.useMemo(() => {
    let result = [...reports];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(query));
    }
    if (filterType !== 'Semua Tipe') {
      result = result.filter(r => r.type === filterType);
    }
    if (filterStatus !== 'Semua Status') {
      result = result.filter(r => r.status === filterStatus);
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [reports, searchQuery, filterType, filterStatus, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedReports.length / pageSize);
  const paginatedReports = filteredAndSortedReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
             <div>
                <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Laporan Klinis</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Arsip dan manajemen dokumen laporan konseling</p>
             </div>
              <button onClick={createReport} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                <FilePlus size={16} /> Generate Laporan Baru
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* Main Content: Reports List (Col 9) */}
             <div className="lg:col-span-9 space-y-6">
                
                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1 relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" >search</span>
                      <input 
                        type="text" 
                        placeholder="Cari nama laporan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm"
                      />
                   </div>
                   <div className="flex items-center gap-2">
                     <select
                       value={filterType}
                       onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                       className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 outline-none transition-all focus:border-primary shadow-sm appearance-none pr-8 cursor-pointer"
                     >
                       <option value="Semua Tipe">Semua Tipe</option>
                       <option value="PDF">PDF</option>
                       <option value="Excel">Excel</option>
                     </select>
                     <select
                       value={filterStatus}
                       onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                       className="px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 outline-none transition-all focus:border-primary shadow-sm appearance-none pr-8 cursor-pointer"
                     >
                       <option value="Semua Status">Semua Status</option>
                       <option value="Selesai">Selesai</option>
                       <option value="Proses">Proses</option>
                     </select>
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b border-slate-50">
                            <th onClick={() => handleSort('title')} className="cursor-pointer hover:text-primary px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Laporan <span className="text-[10px] opacity-50">{sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                            <th onClick={() => handleSort('type')} className="cursor-pointer hover:text-primary px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Tipe <span className="text-[10px] opacity-50">{sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                            <th onClick={() => handleSort('date')} className="cursor-pointer hover:text-primary px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Tanggal <span className="text-[10px] opacity-50">{sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                            <th onClick={() => handleSort('status')} className="cursor-pointer hover:text-primary px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-1">Status <span className="text-[10px] opacity-50">{sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div></th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {paginatedReports.map((report) => (
                           <tr key={report.id} className="group hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-4">
                                     <div className={`size-10 rounded-xl ${report.type === 'PDF' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'} flex items-center justify-center shadow-sm`}>
                                       {report.type === 'PDF' ? <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >description</span> : <span className="material-symbols-outlined" style={{ fontSize: 18 }}>table_view</span>}
                                    </div>
                                    <div>
                                       <h5 className="text-xs font-bold text-slate-900 leading-tight">{report.title}</h5>
                                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{report.size}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{report.type}</span>
                              </td>
                              <td className="px-6 py-5">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</span>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-2">
                                    <div className={`size-1.5 rounded-full ${report.status === 'Selesai' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${report.status === 'Selesai' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                       {report.status}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-slate-300 hover:text-primary transition-all rounded-lg hover:bg-primary/5">
                                       <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                                    </button>
                                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-all rounded-lg hover:bg-slate-100">
                                       <Share2 size={18} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-[2.5rem]">
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
                    <span>Total: {filteredAndSortedReports.length} Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all">Prev</button>
                    <span className="text-xs font-bold text-slate-600 px-2">Hal {currentPage} / {totalPages || 1}</span>
                    <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all">Next</button>
                  </div>
                </div>
             </div>

             {/* Sidebar: Quick Actions & Help (Col 3) */}
             <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
                   <div className="relative z-10">
                      <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                         <FileDown size={24} className="text-primary" />
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight mb-2">Export Cepat</h4>
                      <p className="text-[10px] text-white/50 font-medium leading-relaxed mb-6">Unduh ringkasan aktivitas bulan ini dalam format Excel.</p>
                      <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Download .XLSX</button>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                   <h3 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >schedule</span> Jadwal Laporan
                   </h3>
                   <div className="space-y-4">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">Laporan Semesteran</p>
                         <p className="text-[8px] text-rose-500 font-black uppercase mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >error</span> 3 Hari Lagi
                         </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                         <p className="text-[9px] font-black text-slate-700 uppercase tracking-tight">Laporan Sertifikasi</p>
                         <p className="text-[8px] text-slate-400 font-black uppercase mt-1">15 Juni 2026</p>
                      </div>
                   </div>
                </div>
             </div>

          </div>

        </div>
      </main>
    </div>
  );
}
