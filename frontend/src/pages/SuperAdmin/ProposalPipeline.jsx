import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProposalPipeline = () => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ pending: 0, revision: 0 });
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ status: '', notes: '' });

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/super/proposals');
            const data = response.data.data;
            setProposals(data);
            
            // Calculate basic stats for Super Admin context
            const pending = data.filter(p => p.status === 'disetujui_fakultas').length;
            const revision = data.filter(p => p.status === 'revisi').length;
            setSummary({ pending, revision });
        } catch (error) {
            console.error('Error fetching proposals:', error);
            toast.error('Gagal mengambil data proposal');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await api.put(`/admin/super/proposals/${id}`, {
                status: status,
                notes: form.notes
            });
            if (res.data.status === 'success') {
                toast.success(`Proposal berhasil di-update ke: ${status}`);
                setShowModal(false);
                fetchProposals();
            }
        } catch (error) {
            toast.error("Gagal memperbarui status proposal");
        }
    };

    const openActionModal = (proposal) => {
        setSelectedProposal(proposal);
        setForm({ status: proposal.status, notes: proposal.notes || '' });
        setShowModal(true);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'disetujui_univ': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'disetujui_fakultas': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'revisi': return 'bg-slate-50 text-slate-500 border-slate-100';
            default: return 'bg-rose-50 text-rose-700 border-rose-100';
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="lg:ml-80 ml-0 flex flex-col min-h-screen w-full transition-all duration-300">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Monitoring Proposal Global</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas verifikasi tahap akhir untuk seluruh kegiatan dan anggaran ORMAWA universitas.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats */}
                <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all group">
                    <div className="flex justify-between items-start mb-6 font-headline uppercase tracking-widest leading-tight">
                        <span className="text-[10px] font-black text-secondary/40">Total Menunggu Review</span>
                    </div>
                    <div className="flex items-end justify-between">
                         <h3 className="text-5xl font-black text-primary font-headline tracking-tighter">{summary.pending}</h3>
                         <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                            <Clock size={20} />
                         </div>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:border-amber-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-6 font-headline uppercase tracking-widest leading-tight">
                        <span className="text-[10px] font-black text-secondary/40 uppercase">Revisi Berjalan</span>
                    </div>
                    <div className="flex items-end justify-between">
                         <h3 className="text-5xl font-black text-amber-600 font-headline tracking-tighter">{summary.revision}</h3>
                         <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <AlertCircle size={20} />
                         </div>
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition-all group">
                    <div className="flex justify-between items-start mb-6 font-headline uppercase tracking-widest leading-tight">
                        <span className="text-[10px] font-black text-secondary/40 uppercase">Tuntas Universitas</span>
                    </div>
                    <div className="flex items-end justify-between">
                         <h3 className="text-5xl font-black text-emerald-600 font-headline tracking-tighter">
                            {proposals.filter(p => p.status === 'disetujui_univ').length}
                         </h3>
                         <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <CheckCircle size={20} />
                         </div>
                    </div>
                </div>
              </div>

              {/* Feed Proposal */}
              <div className="bg-white rounded-[3.5rem] border border-outline-variant/30 overflow-hidden shadow-sm min-h-[400px] relative">
                 {loading && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={40} />
                     </div>
                 )}
                 <div className="p-10 border-b border-outline-variant/30 bg-surface-container-low/50 font-headline uppercase leading-tight font-black tracking-widest flex justify-between items-end ">
                    <div>
                        <h3 className="text-sm text-primary">Feed Persetujuan Global</h3>
                    </div>
                    <span className="text-[10px] text-secondary opacity-70 uppercase leading-relaxed tracking-widest ">{proposals.length} Proposal Terdaftar</span>
                 </div>
                 <div className="divide-y divide-outline-variant/10">
                    {!loading && proposals.length === 0 ? (
                        <div className="p-20 text-center font-bold text-slate-400">Tidak ada proposal yang ditemukan.</div>
                    ) : proposals.map((prop) => (
                        <div key={prop.id} onClick={() => openActionModal(prop)} className="p-10 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer border-l-4 border-transparent hover:border-primary">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-secondary/60 font-black tracking-widest uppercase bg-surface-container px-3 py-1 rounded-lg">ID: {prop.id}</span>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border bg-slate-50 text-slate-500 border-slate-100">
                                        FAKULTAS: {prop.fakultas?.name || prop.fakultas?.nama_fakultas || 'UMUM'}
                                    </span>
                                </div>
                                <h4 className="font-extrabold text-primary text-xl tracking-tight max-w-xl group-hover:text-blue-700 transition-colors uppercase leading-tight ">{prop.title}</h4>
                                <div className="flex gap-8 text-xs font-bold text-secondary tracking-tight font-body">
                                    <span className="flex items-center gap-2">Organisasi: {prop.ormawa?.name}</span>
                                    <span className="flex items-center gap-2">
                                        Anggaran: <span className="font-black text-primary uppercase"> Rp {prop.budget?.toLocaleString('id-ID')}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        Oleh: {prop.student?.name || 'Mahasiswa'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(prop.status)}`}>
                                    {prop.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Action Modal */}
            {showModal && selectedProposal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20">
                  <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{selectedProposal.ormawa?.name}</span>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedProposal.title}</h2>
                      </div>
                      <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                        <AlertCircle className="w-5 h-5 text-slate-400 rotate-45" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 font-body">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dana Diajukan</span>
                        <p className="text-xl font-bold text-emerald-600">Rp {selectedProposal.budget?.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Berkas</span>
                        <a href={selectedProposal.fileUrl} target="_blank" rel="noreferrer" className="block text-primary font-bold text-sm underline">Download PDF</a>
                      </div>
                    </div>

                    <div className="space-y-4 font-body">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Catatan Universitas</label>
                      <textarea 
                        value={form.notes}
                        onChange={(e) => setForm({...form, notes: e.target.value})}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-5 text-sm outline-none h-32 resize-none"
                        placeholder="Masukkan instruksi atau catatan..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => handleUpdateStatus(selectedProposal.id, 'disetujui_univ')} 
                        className="flex-1 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                      >
                        Setujui Univ
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedProposal.id, 'revisi')} 
                        className="flex-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                      >
                        Beri Revisi
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedProposal.id, 'ditolak')} 
                        className="flex-1 bg-rose-600 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
    )
}

export default ProposalPipeline;
