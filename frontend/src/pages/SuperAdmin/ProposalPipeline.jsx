import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const ProposalPipeline = () => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProp, setSelectedProp] = useState(null);
    const [rejectionNote, setRejectionNote] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const propRes = await adminService.getGlobalProposals();
            if (propRes.status === 'success') {
                setProposals(propRes.data || []);
            }
        } catch (error) {
            console.error('Gagal memuat pipeline proposal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (window.confirm('Apakah Anda setuju untuk menyetujui anggaran proposal ini secara institusional?')) {
            try {
                await adminService.approveProposal(id);
                loadData();
                setIsActionModalOpen(false);
            } catch (error) {
                alert('Gagal menyetujui: ' + error.message);
            }
        }
    };

    const handleReject = async (id) => {
        if (!rejectionNote) return alert('Sertakan alasan penolakan untuk transparansi unit.');
        try {
            await adminService.rejectProposal(id, rejectionNote);
            loadData();
            setIsActionModalOpen(false);
            setRejectionNote('');
        } catch (error) {
            alert('Gagal menolak: ' + error.message);
        }
    };

    const reviewCount = proposals.length;
    
    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Monitoring Proposal Global</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90">Otoritas verifikasi tahap akhir untuk seluruh kegiatan dan anggaran ORMAWA universitas.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all group font-body">
                    <div className="flex justify-between items-start mb-6 uppercase tracking-widest leading-tight">
                        <span className="text-[10px] font-black text-slate-400">Antrean Verifikasi Univ</span>
                    </div>
                    <div className="flex items-end justify-between">
                         <h3 className="text-5xl font-black text-primary tracking-tighter">{loading ? '...' : reviewCount}</h3>
                         <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-sm font-black">pending_actions</span>
                         </div>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-sm">
                 <div className="p-10 border-b border-slate-100 bg-slate-50/50 uppercase leading-tight font-black tracking-widest flex justify-between items-end ">
                    <div>
                        <h3 className="text-sm text-primary font-black uppercase tracking-widest">Feed Persetujuan Global</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase leading-relaxed tracking-widest ">{loading ? '...' : reviewCount} Proposal Butuh Review</span>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Mensinkronkan pipeline proposal...</div>
                    ) : proposals.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Tidak ada proposal yang ditemukan di antrean universitas.</div>
                    ) : proposals.map((prop) => (
                        <div key={prop.ID} 
                             onClick={() => { setSelectedProp(prop); setIsActionModalOpen(true); }}
                             className="p-10 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer border-l-4 border-transparent hover:border-primary select-text font-body">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-lg">ID: PROP-{prop.ID.toString().padStart(4, '0')}</span>
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border bg-blue-50 text-blue-600 border-blue-100">TERVERIFIKASI FAKULTAS</span>
                                </div>
                                <h4 className="font-extrabold text-primary text-xl tracking-tight max-w-xl group-hover:text-blue-700 transition-colors uppercase leading-tight ">{prop.Judul}</h4>
                                <div className="flex gap-8 text-xs font-bold text-slate-500 tracking-tight font-body">
                                    <span className="flex items-center gap-2 font-black uppercase"><span className="material-symbols-outlined text-sm opacity-70">groups</span> {prop.Ormawa?.Nama || 'Organisasi'}</span>
                                    <span className="flex items-center gap-2 font-black uppercase"><span className="material-symbols-outlined text-sm opacity-70">payments</span> Anggaran: <span className="font-black text-primary">Rp {prop.Anggaran.toLocaleString('id-ID')}</span></span>
                                    <span className="flex items-center gap-2 font-black uppercase"><span className="material-symbols-outlined text-sm opacity-70">history</span> {new Date(prop.CreatedAt).toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-100`}>Review Univ</span>
                                <span className="material-symbols-outlined text-slate-300 opacity-20 transform translate-x-4 group-hover:translate-x-6 transition-all duration-300">double_arrow</span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          </main>

          {/* Action Modal */}
          {isActionModalOpen && selectedProp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl p-12 flex flex-col gap-8 animate-in zoom-in duration-300 overflow-hidden font-body">
                      <header className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg uppercase tracking-widest">Review Tahap Akhir</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {selectedProp.ID}</span>
                              </div>
                              <h2 className="text-2xl font-black text-primary uppercase tracking-tighter leading-tight">{selectedProp.Judul}</h2>
                              <p className="text-sm font-bold text-slate-600 mt-2">Diusulkan oleh: <span className="text-primary uppercase">{selectedProp.Ormawa?.Nama}</span></p>
                          </div>
                      </header>

                      <article className="grid grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                          <div className="space-y-4">
                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Permohonan Anggaran</p>
                                  <p className="text-2xl font-black text-primary">Rp {selectedProp.Anggaran.toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tanggal Kegiatan</p>
                                  <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{new Date(selectedProp.TanggalKegiatan).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Verifikator Fakultas</p>
                                  <p className="text-sm font-bold text-slate-700 uppercase tracking-tight ">{selectedProp.Fakultas?.Nama || 'Unit Fakultas'}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Deskripsi Kegiatan</p>
                                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic">"{selectedProp.Deskripsi || 'Ringkasan kegiatan untuk audit universitas.'}"</p>
                              </div>
                          </div>
                      </article>

                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Catatan Verifikator Univ (Opsional untuk reject)</label>
                          <textarea 
                            value={rejectionNote}
                            onChange={(e) => setRejectionNote(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary transition-all min-h-[100px]"
                            placeholder="Masukan catatan revisi atau alasan penolakan anggaran..."
                          />
                      </div>

                      <footer className="flex gap-4 pt-4">
                          <button 
                            onClick={() => handleApprove(selectedProp.ID)}
                            className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                          >
                              <span className="material-symbols-outlined text-lg">verified_user</span>
                              SETUJUI ANGGARAN
                          </button>
                          <button 
                            onClick={() => handleReject(selectedProp.ID)}
                            className="flex-1 bg-rose-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                          >
                               <span className="material-symbols-outlined text-lg">cancel</span>
                              TOLAK PROPOSAL
                          </button>
                          <button 
                            onClick={() => setIsActionModalOpen(false)}
                            className="px-10 bg-slate-100 text-slate-500 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all focus:outline-none"
                          >
                              BATAL
                          </button>
                      </footer>
                  </div>
              </div>
          )}
        </div>
    )
}

export default ProposalPipeline;
