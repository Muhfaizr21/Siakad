import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const LpjManagement = () => {
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [laporan, setLaporan] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    proposalId: '',
    realizedBudget: '',
    notes: '',
    fileUrl: ''
  });

  useEffect(() => {
    fetchLpjs();
    fetchProposals();
  }, [ormawaId]);

  const fetchLpjs = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/lpjs?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setLaporan(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchProposals = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/proposals?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') {
        // Only show approved ones for LPJ
        setProposals((data.data || []).filter(p => p.status === 'disetujui_univ'));
      }
    } catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('http://localhost:8000/api/ormawa/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.status === 'success') setFormData({ ...formData, fileUrl: data.url });
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const submitLpj = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/ormawa/lpjs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          proposalId: Number(formData.proposalId),
          realizedBudget: Number(formData.realizedBudget),
          submittedBy: user?.id || 1,
          status: 'pending'
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ proposalId: '', realizedBudget: '', notes: '', fileUrl: '' });
        fetchLpjs();
      }
    } catch (e) { console.error(e); }
  };

  const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { label: 'Menunggu Review', class: 'bg-orange-100 text-orange-700' },
      'disetujui': { label: 'Selesai / Arsip', class: 'bg-emerald-100 text-emerald-700' },
      'revisi': { label: 'Butuh Revisi', class: 'bg-amber-100 text-amber-700' }
    };
    const b = badges[status?.toLowerCase()] || { label: status, class: 'bg-slate-100' };
    return <span className={`${b.class} px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-outline-variant/20`}>{b.label}</span>;
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen pb-12">
        <TopNavBar />
        
        <div className="pt-24 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Laporan Pertanggungjawaban (LPJ)</h1>
              <p className="text-on-surface-variant text-sm font-medium">Buku besar rekapitulasi ringkasan kegiatan, penyerapan anggaran, dan dokumentasi eksekutorial event.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-fixed text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">publish</span>
                Submit LPJ Baru
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(laporan || []).map((lpj) => {
              const isOpen = formData.activeId === lpj.id;
              return (
              <div key={lpj.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm group hover:border-primary/30 transition-colors">
                <div className="p-6 bg-surface-container-low/30 border-b border-outline-variant/10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined font-bold">description</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-headline text-on-surface">{lpj.proposal?.title || 'Kegiatan'}</h3>
                      <div className="text-xs text-on-surface-variant font-mono mt-1 flex items-center gap-3">
                        <span className="bg-surface-container-high px-2 py-0.5 rounded font-bold text-on-surface">LPJ-{lpj.id}</span>
                        <span className="font-semibold font-body tracking-wide">{lpj.createdAt ? new Date(lpj.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(lpj.status)}
                    <button 
                      onClick={() => setFormData({ ...formData, activeId: isOpen ? null : lpj.id })}
                      className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined">{isOpen ? 'expand_less' : 'expand_more'}</span>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="p-8 bg-surface grid grid-cols-1 lg:grid-cols-4 gap-8 border-t border-outline-variant/10 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="lg:col-span-2 space-y-6">
                       <div>
                         <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">summarize</span> Ringkasan Eksekutif</h4>
                         <p className="text-sm text-on-surface-variant leading-relaxed p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl">
                           {lpj.notes || 'Tidak ada catatan tambahan.'}
                         </p>
                       </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                       <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">pie_chart</span> Realisasi Anggaran</h4>
                       <div className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl">
                         <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                             <span className="text-on-surface-variant">Pagu Awal</span>
                             <span className="font-bold">{formatRp(lpj.proposal?.budget || 0)}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-on-surface-variant">Realisasi</span>
                             <span className="font-bold text-emerald-700">{formatRp(lpj.realizedBudget)}</span>
                           </div>
                         </div>
                       </div>
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                       <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">folder_open</span> Dokumen</h4>
                       <a href={lpj.fileUrl} target="_blank" rel="noreferrer" className="block w-full py-3 text-sm font-bold border border-primary/30 text-primary rounded-xl text-center hover:bg-primary/5 transition-colors">
                          Lihat Berkas LPJ
                       </a>
                    </div>
                  </div>
                )}
              </div>
            )})}
            {(laporan || []).length === 0 && <p className="text-center py-20 text-on-surface-variant italic">Belum ada LPJ yang masuk untuk periode ini</p>}
          </div>

          {/* SUBMIT LPJ MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
              <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 border border-outline-variant/10">
                <h2 className="text-2xl font-bold font-headline text-primary mb-6">Submit Laporan Pertanggungjawaban</h2>
                <form onSubmit={submitLpj} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Pilih Kegiatan (Sudah Disetujui Univ)</label>
                    <select required className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 font-bold" value={formData.proposalId} onChange={e => setFormData({...formData, proposalId: e.target.value})}>
                      <option value="">-- Pilih Proposal --</option>
                      {proposals.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Realisasi Anggaran Terpakai (Rp)</label>
                    <input required type="number" placeholder="Ex: 8500000" className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30" value={formData.realizedBudget} onChange={e => setFormData({...formData, realizedBudget: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase mb-1 tracking-widest">Catatan / Ringkasan Pelaksanaan</label>
                    <textarea rows="4" className="w-full bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 text-sm focus:ring-1 focus:ring-primary outline-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Ceritakan secara singkat jalannya kegiatan..."></textarea>
                  </div>
                  <div className="bg-surface-container-low/50 p-6 rounded-2xl border-2 border-dashed border-outline-variant/50 relative group hover:border-primary/50 transition-colors">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Lampiran Berkas LPJ (PDF/ZIP)</p>
                    
                    {!formData.fileUrl && !uploading ? (
                      <div className="relative">
                        <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="flex flex-col items-center justify-center py-4 gap-2">
                           <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">upload_file</span>
                           <p className="text-sm font-bold text-on-surface-variant">Klik atau Taruh Berkas di Sini</p>
                           <p className="text-[10px] text-on-surface-variant/60 font-medium">Maksimal 10MB (PDF/ZIP)</p>
                        </div>
                      </div>
                    ) : uploading ? (
                      <div className="flex flex-col items-center justify-center py-4 gap-3">
                         <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                         <p className="text-xs font-bold text-primary tracking-widest uppercase">Sedang Mengunggah...</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-xl animate-in zoom-in-95">
                         <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                            <div className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                               <p className="text-xs font-black text-emerald-800 uppercase tracking-tight">Berkas Berhasil Terunggah</p>
                               <p className="text-[10px] text-emerald-600 font-bold truncate">{formData.fileUrl.split('/').pop()}</p>
                            </div>
                         </div>
                         <button 
                           type="button"
                           onClick={() => setFormData({...formData, fileUrl: ''})}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-black hover:bg-rose-600 transition-colors shadow-sm"
                         >
                           <span className="material-symbols-outlined text-[14px]">delete</span>
                           HAPUS & GANTI
                         </button>
                      </div>
                    )}
                  </div>
                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-4 text-on-surface-variant font-bold">Batal</button>
                    <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg">Kirim Laporan</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LpjManagement;
