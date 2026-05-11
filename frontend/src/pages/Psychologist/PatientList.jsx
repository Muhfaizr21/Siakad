import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { 
  Search, Filter, User, Users, Calendar, 
  ExternalLink, FileText, Activity,
  ChevronRight, MoreVertical, ShieldCheck,
  TrendingUp, Download
} from 'lucide-react';
import { UI } from '../../constants/designSystem';

export default function PatientList() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const patients = [
    { id: 1, name: 'Ahmad Rizki Pratama', nim: '2021310001', faculty: 'Farmasi', sessions: 4, lastVisit: '10 Mei 2026', status: 'Stabil', color: 'bg-blue-500' },
    { id: 2, name: 'Siti Rahayu Putri', nim: '2022310042', faculty: 'Farmasi', sessions: 2, lastVisit: '08 Mei 2026', status: 'Perlu Perhatian', color: 'bg-amber-500' },
    { id: 3, name: 'Budi Santoso', nim: '2020310087', faculty: 'TI', sessions: 8, lastVisit: '05 Mei 2026', status: 'Pemulihan', color: 'bg-emerald-500' },
    { id: 4, name: 'Dewi Lestari', nim: '2021310055', faculty: 'Psikologi', sessions: 1, lastVisit: '02 Mei 2026', status: 'Baru', color: 'bg-indigo-500' },
    { id: 5, name: 'Fajar Nugroho', nim: '2022310019', faculty: 'Hukum', sessions: 5, lastVisit: '28 Apr 2026', status: 'Stabil', color: 'bg-blue-500' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stabil': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Perlu Perhatian': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Pemulihan': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <main className={UI.layout.main}>
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className={UI.layout.canvas}>
          
          {/* Compact Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-black text-primary uppercase tracking-tight font-headline">Daftar Pasien</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manajemen Rekam Medis Mahasiswa</p>
            </div>
            
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari nama / NIM..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 w-full md:w-64 transition-all"
                  />
               </div>
               <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary shadow-sm">
                  <Download className="size-4" />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Patient List (Col 9) */}
            <div className="lg:col-span-9 space-y-4">
               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50 text-left">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mahasiswa</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sesi</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kunjungan Terakhir</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {patients.map((patient) => (
                          <tr key={patient.id} className="group hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-xl ${patient.color} text-white flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform`}>
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{patient.name}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{patient.nim} • {patient.faculty}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Activity size={12} className="text-slate-300" />
                                <span className="text-xs font-bold text-slate-700">{patient.sessions} Kali</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Calendar size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{patient.lastVisit}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(patient.status)}`}>
                                {patient.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 onClick={() => navigate(`/psychologist/patients/${patient.id}/medical-record`)}
                                 className="p-2.5 text-slate-300 hover:text-primary transition-all rounded-xl hover:bg-primary/5 group/btn"
                               >
                                  <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>

            {/* Statistics Sidebar (Col 3) */}
            <div className="lg:col-span-3 space-y-6">
               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="size-1.5 bg-primary rounded-full"></div>
                     <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Ringkasan Data</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                           <Users size={16} className="text-blue-600" />
                           <TrendingUp size={12} className="text-blue-400" />
                        </div>
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Total Pasien Unik</p>
                        <p className="text-lg font-black text-blue-700">128 Orang</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                        <div className="flex items-center justify-between mb-2">
                           <Activity size={16} className="text-amber-600" />
                        </div>
                        <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Sesi Bulan Ini</p>
                        <p className="text-lg font-black text-amber-700">42 Sesi</p>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                     <ShieldCheck size={24} className="text-emerald-400 mb-4" />
                     <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Keamanan Data</h4>
                     <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase">
                        Hanya Anda dan mahasiswa bersangkutan yang memiliki akses ke detail rekam medis ini.
                     </p>
                  </div>
                  <Activity className="absolute -right-6 -bottom-6 size-32 text-white/5 rotate-12" />
               </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

