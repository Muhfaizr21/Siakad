import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';
import { 
  Search, Loader2, MessageSquare, AlertCircle, 
  CheckCircle2, ChevronRight, Filter, ShieldCheck, 
  Mail, Users, X, User, Tag, Calendar, Save, Send
} from 'lucide-react';
import { Badge } from './components/ui/badge';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'react-hot-toast';

const AspirationControl = () => {
  const [aspirations, setAspirations] = useState([]);
  const [stats, setStats] = useState({ active: 0, overdue: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedAsp, setSelectedAsp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    status: '',
    respon: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aspRes, statsRes] = await Promise.all([
        adminService.getGlobalAspirations(),
        adminService.getStats()
      ]);

      if (aspRes.status === 'success') {
        setAspirations(aspRes.data || []);
      }
      if (statsRes.status === 'success') {
        setStats({
          active: statsRes.data.aspirasi_aktif || 0,
          overdue: statsRes.data.sla_overdue || 0,
          resolved: statsRes.data.resolved_today || 0
        });
      }
    } catch (error) {
      toast.error('Gagal memuat pusat aspirasi');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAudit = (asp) => {
    setSelectedAsp(asp);
    setForm({
      status: asp.Status || 'proses',
      respon: asp.Respon || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await adminService.updateAspirationStatus(selectedAsp.ID, form);
      if (res.status === 'success') {
        toast.success('Status aspirasi berhasil diperbarui');
        setIsModalOpen(false);
        loadData();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memperbarui aspirasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAspirations = aspirations.filter(asp => 
    asp.Judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asp.Mahasiswa?.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asp.ID.toString().includes(searchTerm)
  );

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex font-sans select-none">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="pl-72 pt-20 flex flex-col min-h-screen w-full transition-all duration-300">

        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
             <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><MessageSquare className="size-6" /></div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter font-headline uppercase leading-none">Global Aspiration Hub</h1>
                </div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                    <div className="h-1 w-10 bg-primary rounded-full" />
                    Pusat Monitoring Aspirasi Mahasiswa Seluruh Fakultas
                </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ 
                { label: "Total Aktif", count: stats.active, color: "text-sky-600", bg: "bg-sky-50", icon: MessageSquare, trend: "Status Monitoring" },
                { label: "SLA Overdue", count: stats.overdue, color: "text-rose-600", bg: "bg-rose-50", icon: AlertCircle, trend: "Perlu Eskalasi" },
                { label: "Hari Ini Selesai", count: stats.resolved, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, trend: "Laporan Harian" },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 group hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-headline">{stat.label}</p>
                        <div className={cn("p-2 rounded-xl", stat.bg)}>
                            <stat.icon className={cn("size-4", stat.color)} />
                        </div>
                    </div>
                    <h3 className={`text-4xl font-black ${stat.color} font-headline tracking-tighter leading-none`}>{stat.count}</h3>
                    <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-tighter`}>{stat.trend}</p>
                </div>
            ))}
          </div>

          <section className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-8 bg-slate-50/30 border-b border-slate-100 flex items-center gap-6">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 size-4 stroke-[3px]" />
                    <input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-200 pl-16 pr-8 py-4 rounded-2xl text-[13px] font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-sm placeholder:text-slate-300 uppercase tracking-tight" 
                      placeholder="Cari ID tiket, nama mahasiswa atau fakultas..." 
                    />
                </div>
                <button className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-95 transition-all">
                    <Filter className="size-4" />
                    Filter Lanjutan
                </button>
            </div>
            
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">
                  <th className="px-10 py-6">Incident Ticket</th>
                  <th className="px-10 py-6">Faculty / Sub-Unit</th>
                  <th className="px-10 py-6 text-center">Priority</th>
                  <th className="px-10 py-6">SLA Status</th>
                  <th className="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr>
                        <td colSpan="5" className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="size-8 animate-spin text-primary" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Pusat Aspirasi Global...</p>
                            </div>
                        </td>
                    </tr>
                ) : filteredAspirations.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-10 py-24 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                                <MessageSquare className="size-16" />
                                <p className="text-sm font-black uppercase tracking-widest">Tidak ada tiket aspirasi aktif ditemukan</p>
                            </div>
                        </td>
                    </tr>
                ) : filteredAspirations.map((asp) => (
                    <tr key={asp.ID} className="hover:bg-slate-50/50 transition-all select-text group">
                        <td className="px-10 py-6">
                            <div className="space-y-1">
                                <p className="font-black text-slate-900 uppercase tracking-tighter text-sm font-headline group-hover:text-primary transition-colors">#ASP-{asp.ID.toString().padStart(4, '0')}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{asp.Subjek || asp.Judul || 'Tanpa Subjek'}</p>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter font-headline">
                                    {asp.Fakultas?.Nama || 'Institusional'}
                                </span>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                                    {asp.Mahasiswa?.Nama || 'System Identity'}
                                </span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                             <Badge className={cn('font-black text-[9px] px-3 py-1 border-none shadow-sm', 
                                asp.Priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 
                                asp.Priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                                {asp.Priority || 'NORMAL'}
                             </Badge>
                        </td>
                        <td className="px-10 py-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-10">
                                    <span className={cn('text-[9px] font-black uppercase tracking-widest', asp.Deadline && new Date(asp.Deadline) < new Date() ? 'text-rose-500' : 'text-slate-400')}>
                                        {asp.Deadline ? `Deadline: ${new Date(asp.Deadline).toLocaleDateString('id-ID', {day:'numeric', month:'SHORT'})}` : 'SLA NORMAL'}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tight">{asp.Status || 'OPEN'}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className={cn('h-full transition-all duration-1000', 
                                        asp.Status === 'Selesai' ? 'w-full bg-emerald-500' : 
                                        asp.Status === 'Proses' ? 'w-[60%] bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'w-[20%] bg-slate-300')} />
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                            <button 
                              onClick={() => handleOpenAudit(asp)}
                              className="h-10 px-5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-2 ml-auto shadow-sm"
                            >
                                Audit Detail
                                <ChevronRight className="size-3.5" />
                            </button>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* AUDIT MODAL */}
        {isModalOpen && selectedAsp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              <header className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Aspiration Audit Detail</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ticket ID: #ASP-{selectedAsp.ID.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 hover:rotate-90 transition-all duration-300"
                >
                  <X className="size-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Side: Summary */}
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <User className="size-3" />
                       Origin Reporter
                    </h3>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedAsp.Mahasiswa?.Nama || 'Anonymous'}</p>
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">Student</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NIM</p>
                          <p className="text-[11px] font-bold text-slate-600">{selectedAsp.Mahasiswa?.NIM || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Faculty</p>
                          <p className="text-[11px] font-bold text-slate-600">{selectedAsp.Mahasiswa?.Fakultas?.Nama || 'Institusional'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Tag className="size-3" />
                       Aspiration Data
                    </h3>
                    <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{selectedAsp.Judul || 'No Subject'}</h4>
                        <div className="flex gap-2">
                          <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase tracking-widest">{selectedAsp.Kategori || 'General'}</Badge>
                          <Badge className={cn('border-none text-[8px] font-black uppercase tracking-widest', 
                            selectedAsp.Priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700')}>
                            {selectedAsp.Priority || 'NORMAL'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                        <p className="text-[12px] text-slate-600 font-bold leading-relaxed italic whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                          "{selectedAsp.Isi || 'No description provided.'}"
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Side: Resolution Form */}
                <form onSubmit={handleSubmit} className="space-y-8 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                   <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle className="size-3" />
                        Incident Management
                      </h3>
                      
                      <div className="space-y-6 pt-4">
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Update Status</label>
                          <select 
                            value={form.status}
                            onChange={(e) => setForm({...form, status: e.target.value})}
                            className="w-full bg-white border border-slate-200 h-14 px-6 rounded-2xl font-bold text-sm text-slate-900 focus:border-primary outline-none transition-all shadow-sm"
                          >
                            <option value="proses">On Process</option>
                            <option value="Selesai">Resolved</option>
                            <option value="Ditinjau">Under Review</option>
                            <option value="Ditolak">Rejected</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest ml-4">Resolution Message</label>
                          <textarea 
                            required
                            value={form.respon}
                            onChange={(e) => setForm({...form, respon: e.target.value})}
                            placeholder="Type resolution or response message to student..."
                            className="w-full bg-white border border-slate-200 min-h-[200px] p-6 rounded-2xl font-bold text-sm text-slate-900 focus:border-primary outline-none transition-all shadow-sm placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                   </section>

                   <div className="pt-4 flex gap-4">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] h-14 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Persisted Update
                      </button>
                   </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AspirationControl;
