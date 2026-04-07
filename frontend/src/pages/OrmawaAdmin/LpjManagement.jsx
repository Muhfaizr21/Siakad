import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const LPJ_CATEGORIES = ["Dokumentasi", "Laporan Keuangan", "Presensi"];

const LpjManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [laporan, setLaporan] = useState([]);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    if (ormawaId) {
      fetchData();
    }
  }, [ormawaId]);

  const fetchData = async () => {
    try {
      const [lpjData, propData] = await Promise.all([
        ormawaService.getLpjs(ormawaId),
        ormawaService.getProposals(ormawaId)
      ]);
      
      if (lpjData.status === 'success') setLaporan(lpjData.data || []);
      
      if (propData.status === 'success') {
        const now = new Date();
        const pending = (propData.data || []).filter(p => 
          p.status === 'disetujui_univ' && 
          new Date(p.dateEvent) < now &&
          !(lpjData.data || []).some(l => l.proposalId === p.id)
        );
        setPendingActivities(pending);
      }
    } catch (e) { 
      console.error("Gagal sinkron data LPJ:", e);
    }
  };

  const handleCreateLPJSection = async (proposalId) => {
    try {
      const data = await ormawaService.createLpj({
        proposalId: proposalId,
        submittedBy: user?.id || 1,
        status: 'draft'
      });
      if (data.status === 'success') fetchData();
    } catch (e) { 
      alert("⚠️ Eror: Gagal membuka draft laporan.");
    }
  };

  const handleFolderUpload = async (lpjId, category, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCategory(`${lpjId}-${category}`);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);

    try {
      const data = await ormawaService.uploadLpjDocument(lpjId, fd);
      if (data.status === 'success') {
        await fetchData();
      }
    } catch (e) { 
      alert(`⚠️ Gagal Upload: ${e.message}`);
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Hapus dokumen ini secara permanen?")) return;
    try {
      await ormawaService.deleteLpjDocument(docId);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleFinalSubmit = async (lpjId) => {
    if (!window.confirm("Kirim LPJ ini sekarang? Perubahan tidak dapat dilakukan setelah dikirim.")) return;
    try {
      const data = await ormawaService.updateLpj(lpjId, { status: 'diajukan' });
      if (data.status === 'success') {
        fetchData();
        alert("✅ LPJ Berhasil dikirim ke Fakultas!");
      }
    } catch (e) { 
      alert(`❌ Gagal: ${e.message}`);
    }
  };

  const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen pb-12 transition-all duration-500">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-20 px-4 lg:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black font-headline text-on-surface tracking-tight mb-1 text-primary">Manajemen LPJ</h1>
            <p className="text-on-surface-variant text-xs font-medium">Sistem otomatisasi folder pertanggungjawaban kegiatan.</p>
          </div>

          {/* SECTION 1: ACTION REQUIRED (Pending LPJs) */}
          {pendingActivities.length > 0 && (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h2 className="text-[13px] font-black font-headline uppercase tracking-[0.2em] text-rose-600">Perlu Tindakan Segera ({pendingActivities.length})</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {pendingActivities.map(activity => (
                  <div key={activity.id} className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Belum Dilaporkan</p>
                      <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">{activity.title}</h3>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Selesai: {new Date(activity.dateEvent).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                    <button 
                      onClick={() => handleCreateLPJSection(activity.id)}
                      className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                    >
                      Buka Draft LPJ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: FOLDER-STYLE INTERFACE (Draft & Active LPJs) */}
          <div className="grid grid-cols-1 gap-6">
            <h2 className="text-[13px] font-black font-headline uppercase tracking-[0.2em] text-on-surface-variant mb-1">Folder Laporan Aktif</h2>
            
            {laporan.filter(l => l.status === 'draft' || l.status === 'revisi' || l.status === 'diajukan').map(lpj => {
              const isExpanded = activeItem === lpj.id;
              return (
              <div key={lpj.id} className={`bg-white rounded-2xl border-2 ${lpj.status === 'revisi' ? 'border-amber-200 bg-amber-50/20' : 'border-outline-variant/10'} overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}>
                {/* Header Card */}
                <div className="p-5 lg:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${lpj.status === 'revisi' ? 'bg-amber-100 text-amber-600' : 'bg-primary/5 text-primary'}`}>
                      <span className="material-symbols-outlined font-black text-[22px]">{lpj.status === 'revisi' ? 'priority_high' : 'folder_open'}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">{lpj.proposal?.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${lpj.status === 'revisi' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {lpj.status}
                        </span>
                        <span className="text-[10px] font-bold text-on-surface-variant opacity-60">Dibuat: {new Date(lpj.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {lpj.status !== 'diajukan' && (
                      <div className="flex flex-col items-end gap-1.5">
                        {/* VALIDATION: Check if all categories are fulfilled */}
                        {(() => {
                          const uploadedCount = (lpj.documents || []).length;
                          const isComplete = uploadedCount >= 3;
                          
                          return (
                            <>
                              <button 
                                onClick={() => isComplete && handleFinalSubmit(lpj.id)}
                                disabled={!isComplete}
                                className={`flex-1 md:flex-none px-5 py-2.5 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 ${
                                  isComplete 
                                    ? 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700 active:scale-95' 
                                    : 'bg-slate-200 text-slate-400 border border-slate-300/30 cursor-not-allowed'
                                }`}
                              >
                                {isComplete ? 'Kirim LPJ' : 'Belum Lengkap'}
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    <button 
                      onClick={() => setActiveItem(isExpanded ? null : lpj.id)}
                      className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
                    </button>
                  </div>
                </div>

                {/* FOLDERS SECTION */}
                {isExpanded && (
                  <div className="px-5 pb-5 lg:px-6 lg:pb-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-surface-container-lowest/50 rounded-2xl p-5 lg:p-6 border border-outline-variant/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {LPJ_CATEGORIES.map(cat => {
                          const doc = (lpj.documents || []).find(d => d.category === cat);
                          const isUp = uploadingCategory === `${lpj.id}-${cat}`;
                          
                          return (
                            <div key={cat} className={`relative group p-6 rounded-3xl border-2 transition-all ${doc ? 'border-emerald-100 bg-emerald-50/30' : 'border-dashed border-outline-variant/30 hover:border-primary/40 bg-surface-container-low'}`}>
                              <div className="flex flex-col items-center text-center gap-3">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${doc ? 'bg-emerald-100 text-emerald-600' : 'bg-surface-container-high text-on-surface-variant/40'}`}>
                                  <span className="material-symbols-outlined text-3xl">{doc ? 'check_circle' : 'upload_file'}</span>
                                </div>
                                <div className="max-w-full overflow-hidden">
                                  <h4 className="font-bold text-on-surface tracking-tight truncate">{cat}</h4>
                                  {doc ? (
                                    <p className="text-[10px] font-bold text-emerald-600 truncate mt-1">
                                      {doc.fileName || "File Terunggah"}
                                    </p>
                                  ) : (
                                    <p className="text-[10px] font-black uppercase text-on-surface-variant opacity-80 tracking-widest mt-1">
                                      Wajib Diisi
                                    </p>
                                  )}
                                </div>
                                
                                {isUp ? (
                                  <div className="w-full h-10 flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-bold text-primary">UPLOADING...</span>
                                  </div>
                                ) : doc ? (
                                  <div className="flex flex-col gap-2 w-full mt-2">
                                    <div className="flex gap-2">
                                      <a href={`http://localhost:8000${doc.fileUrl}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm">
                                        <span className="material-symbols-outlined text-[14px]">visibility</span> LIHAT
                                      </a>
                                      <button 
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="w-10 h-10 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                                        title="Hapus Dokumen"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                      </button>
                                    </div>
                                    <label className="w-full py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer">
                                      <span className="material-symbols-outlined text-[14px]">sync</span> GANTI
                                      <input type="file" className="hidden" onChange={(e) => handleFolderUpload(lpj.id, cat, e)} />
                                    </label>
                                  </div>
                                ) : (
                                  <label className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all mt-2">
                                    <span className="material-symbols-outlined text-[18px]">add</span> UPLOAD FILE
                                    <input type="file" className="hidden" onChange={(e) => handleFolderUpload(lpj.id, cat, e)} />
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary Textarea */}
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Realisasi Anggaran Terpakai</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant opacity-40">Rp</span>
                            <input 
                              type="number" 
                              className="w-full bg-surface p-4 pl-12 rounded-2xl border border-outline-variant/30 font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                              placeholder="0"
                              defaultValue={lpj.realizedBudget}
                              onBlur={async (e) => {
                                await fetch(`http://localhost:8000/api/ormawa/lpjs/${lpj.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ realizedBudget: Number(e.target.value) })
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Ringkasan Narasi Kegiatan</label>
                          <textarea 
                            className="w-full bg-surface p-4 rounded-2xl border border-outline-variant/30 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]" 
                            placeholder="Tuliskan ringkasan singkat hasil kegiatan..."
                            defaultValue={lpj.notes}
                            onBlur={async (e) => {
                              await fetch(`http://localhost:8000/api/ormawa/lpjs/${lpj.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ notes: e.target.value })
                              });
                            }}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )})}

            {/* SECTION 3: ARCHIVE (Approved LPJs) */}
            <h2 className="text-xl font-bold font-headline uppercase tracking-widest text-on-surface-variant mt-10 mb-2">Arsip Laporan Selesai</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {laporan.filter(l => l.status === 'disetujui').map(lpj => (
                <div key={lpj.id} className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex items-center justify-between group hover:bg-emerald-50/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface line-clamp-1">{lpj.proposal?.title}</h4>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Diterima: {formatRp(lpj.realizedBudget)}</p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-on-surface-variant group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LpjManagement;
