import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const mockProposals = [
  { 
    id: 'PROP/2023/042', 
    nama_kegiatan: 'Pekan Olahraga Fakultas', 
    tujuan: 'Meningkatkan solidaritas dan kebugaran mahasiswa antar jurusan.', 
    tanggal_pelaksanaan: '2023-11-15', 
    lokasi: 'Gor Kampus Timur', 
    anggaran: 25000000, 
    penanggung_jawab: 'Budi Santoso', 
    status: 'pending',
    histori: [
      { id: 1, tanggal: '2023-10-20', status: 'diajukan', catatan: 'Proposal pertama kali diajukan oleh divisi minat bakat.' }
    ]
  },
  { 
    id: 'PROP/2023/040', 
    nama_kegiatan: 'Diskusi Publik Teknologi AI', 
    tujuan: 'Membuka wawasan tentang kecerdasan buatan pada industri 4.0.', 
    tanggal_pelaksanaan: '2023-10-25', 
    lokasi: 'Auditorium Gd. A', 
    anggaran: 8500000, 
    penanggung_jawab: 'Andi Pratama', 
    status: 'revisi',
    histori: [
      { id: 1, tanggal: '2023-10-15', status: 'diajukan', catatan: 'Proposal diajukan oleh divisi Akademik.' },
      { id: 2, tanggal: '2023-10-18', status: 'revisi', catatan: 'Estimasi dana konsumsi terlalu tinggi. Tolong sesuaikan dengan standar RAB universitas.' }
    ]
  },
  { 
    id: 'PROP/2023/038', 
    nama_kegiatan: 'Bakti Sosial Desa Mekar', 
    tujuan: 'Pengabdian masyarakat dan pembagian sembako ke panti asuhan.', 
    tanggal_pelaksanaan: '2023-12-05', 
    lokasi: 'Desa Mekar Jaya', 
    anggaran: 15400000, 
    penanggung_jawab: 'Siti Aminah', 
    status: 'disetujui',
    histori: [
      { id: 1, tanggal: '2023-10-01', status: 'diajukan', catatan: 'Draft diajukan oleh divisi sosial masyarakat.' },
      { id: 2, tanggal: '2023-10-05', status: 'disetujui', catatan: 'Sangat baik. Lanjutkan proses pencairan dana ke bendahara.' }
    ]
  }
];

const ProposalManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [history, setHistory] = useState([]);
  const [komentar, setKomentar] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    tujuan: '',
    tanggal_pelaksanaan: '',
    anggaran: '',
    file_url: ''
  });
  const { user, hasPermission } = useAuth();
  
  const ormawaId = user?.ormawaId || 1;

  useEffect(() => {
    if (ormawaId) {
      fetchProposals();
      checkLpjLock();
    }
  }, [ormawaId]);

  const checkLpjLock = async () => {
    try {
      const data = await ormawaService.getProposals(ormawaId);
      if (data.status === 'success') {
        const now = new Date();
        const pending = (data.data || []).filter(p => 
          p.status === 'disetujui_univ' && 
          new Date(p.dateEvent) < now &&
          (!p.lpj || p.lpj.status !== 'disetujui')
        );
        
        if (pending.length > 0) {
          setIsLocked(true);
          setLockMessage(`Attention: Anda memiliki ${pending.length} kegiatan yang belum menyelesaikan LPJ.`);
        } else {
          setIsLocked(false);
        }
      }
    } catch (e) { console.error("Lock check error:", e); }
  };

  const fetchProposals = async () => {
    try {
      const data = await ormawaService.getProposals(ormawaId);
      if (data.status === 'success') {
        const formatted = (data.data || []).map(p => ({
          id: `PROP-${p.id}`,
          realId: p.id,
          nama_kegiatan: p.title,
          tujuan: p.notes || 'Tujuan operasional atau deskripsi tidak tersedia',
          tanggal_iso: p.dateEvent ? p.dateEvent.split('T')[0] : '',
          tanggal_pelaksanaan: p.dateEvent ? new Date(p.dateEvent).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
          status: p.status || 'diajukan',
          anggaran: p.budget || 0,
          penanggung_jawab: p.ormawa ? p.ormawa.name : 'Ormawa',
          file: p.fileUrl || 'tidak ada lampiran',
          ormawaId: p.ormawaId
        }));
        setProposals(formatted);
      }
    } catch (err) { 
      console.error("Gagal memuat proposal:", err);
      alert("⚠️ Eror: Gagal memuat data proposal.");
    }
  };

  const fetchHistory = async (proposalId) => {
    try {
      const data = await ormawaService.getProposalHistory(proposalId);
      if (data.status === 'success') setHistory(data.data || []);
    } catch (e) { console.error(e); }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      'diajukan': { label: 'Diajukan', class: 'bg-blue-100 text-blue-700' },
      'disetujui_dosen': { label: 'ACC Dosen', class: 'bg-indigo-100 text-indigo-700' },
      'disetujui_fakultas': { label: 'ACC Fakultas', class: 'bg-purple-100 text-purple-700' },
      'disetujui_univ': { label: 'Disetujui Univ', class: 'bg-emerald-100 text-emerald-700' },
      'revisi': { label: 'Butuh Revisi', class: 'bg-amber-100 text-amber-700' },
      'ditolak': { label: 'Ditolak', class: 'bg-rose-100 text-rose-700' }
    };
    const b = badges[status] || { label: status, class: 'bg-slate-100 text-slate-700' };
    return <span className={`${b.class} border px-3 py-1 rounded-full text-xs font-bold uppercase`}>{b.label}</span>;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const data = await ormawaService.uploadFile(fd);
      if (data.status === 'success') {
        setFormData({ ...formData, file_url: data.url });
      }
    } catch (e) {
      alert("⚠️ Gagal mengunggah file.");
    } finally {
      setUploading(false);
    }
  };

  const handleAction = async (newStatus) => {
    if (!selectedProposal || (!komentar.trim() && (newStatus === 'revisi' || newStatus === 'ditolak'))) {
      alert("Komentar/Alasan wajib diisi untuk revisi atau penolakan!");
      return;
    }

    try {
      const data = await ormawaService.updateProposal(selectedProposal.realId, { 
        status: newStatus, 
        notes: komentar,
        userId: user?.id || 0
      });
      if (data.status === 'success') {
        fetchProposals();
        setSelectedProposal(null);
        setKomentar('');
      }
    } catch (error) {
       alert(`⚠️ Gagal memperbarui status: ${error.message}`);
    }
  };

  const handleDelete = async (realId) => {
    if (!window.confirm("Yakin ingin menghapus proposal ini secara permanen?")) return;
    try {
      await ormawaService.deleteProposal(realId);
      fetchProposals();
    } catch (err) {
      alert("⚠️ Gagal menghapus proposal.");
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.nama_kegiatan,
      notes: formData.tujuan,
      dateEvent: formData.tanggal_pelaksanaan ? new Date(formData.tanggal_pelaksanaan).toISOString() : new Date().toISOString(),
      budget: Number(formData.anggaran),
      ormawaId: ormawaId,
      status: 'diajukan',
      fileUrl: formData.file_url
    };

    try {
      const data = editingId 
        ? await ormawaService.updateProposal(editingId, payload)
        : await ormawaService.createProposal(payload);
      
      if (data.status === 'success') {
        setIsFormOpen(false);
        fetchProposals();
      }
    } catch (err) {
      alert(`⚠️ Eror saat menyimpan: ${err.message}`);
    }
  };

  const openReviewModal = (proposal) => {
    setSelectedProposal(proposal);
    setHistory([]);
    fetchHistory(proposal.realId);
    setKomentar('');
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-20 px-4 lg:px-6">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
            <div>
              <h1 className="text-2xl font-extrabold font-headline mb-1 text-on-surface">Manajemen Proposal</h1>
              <p className="text-on-surface-variant text-xs font-medium leading-relaxed max-w-2xl">
                Ajukan dan pantau status persetujuan: Dosen ➔ Fakultas ➔ Universitas.
              </p>
            </div>
            {hasPermission('proposal', 'create') && (
              <button 
                onClick={() => { setEditingId(null); setFormData({ nama_kegiatan: '', tujuan: '', tanggal_pelaksanaan: '', anggaran: '', file_url: '' }); setIsFormOpen(true); }}
                className="bg-primary hover:bg-primary-fixed text-white px-5 py-2.5 rounded-xl font-black font-headline shadow-md hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap text-sm uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Buat Proposal
              </button>
            )}
          </div>

          {/* Proposal List Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {proposals.map(proposal => (
              <div key={proposal.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="p-5 border-b border-outline-variant/10">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="text-[10px] font-black text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md tracking-wider font-label uppercase">{proposal.id}</span>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <h3 className="text-lg font-bold font-headline leading-tight text-primary mb-1.5 line-clamp-1 group-hover:text-primary-container transition-colors">{proposal.nama_kegiatan}</h3>
                  <p className="text-[12px] font-medium text-on-surface-variant line-clamp-2 leading-relaxed">{proposal.tujuan}</p>
                </div>
                <div className="p-5 flex-grow grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1 opacity-70">Tanggal</p>
                    <p className="font-bold text-on-surface">{proposal.tanggal_pelaksanaan}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-secondary font-black uppercase tracking-widest mb-1 opacity-70">Anggaran</p>
                    <p className="font-black text-emerald-600">{formatRupiah(proposal.anggaran)}</p>
                  </div>
                </div>
                <div className="p-3.5 border-t border-outline-variant/10 flex gap-3">
                  <button 
                    onClick={() => openReviewModal(proposal)}
                    className="flex-1 py-2.5 bg-primary/10 text-primary rounded-xl font-black font-headline hover:bg-primary hover:text-white transition-all flex justify-center items-center gap-2 text-[11px] uppercase tracking-wider"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span>
                    Detail & History
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Review & Detail */}
          {selectedProposal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
              <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 border border-outline-variant/10">
                <div className="w-full md:w-3/5 border-r border-outline-variant/20 flex flex-col h-full bg-surface">
                  <div className="p-5 border-b flex justify-between items-center bg-surface-container-low/50">
                    <div>
                      <h2 className="text-lg font-black font-headline text-primary uppercase tracking-tight">{selectedProposal.nama_kegiatan}</h2>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{selectedProposal.id}</span>
                    </div>
                    {getStatusBadge(selectedProposal.status)}
                  </div>
                  
                  <div className="p-6 overflow-y-auto flex-grow space-y-6">
                    <div className="bg-surface-container-highest/20 p-5 rounded-2xl border border-outline-variant/10">
                       <p className="text-xs text-secondary font-label uppercase mb-1">Status Alur Persetujuan</p>
                       <div className="flex gap-2 mb-4">
                          <span className={`w-3 h-3 rounded-full ${['disetujui_dosen','disetujui_fakultas','disetujui_univ'].includes(selectedProposal.status) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className={`w-3 h-3 rounded-full ${['disetujui_fakultas','disetujui_univ'].includes(selectedProposal.status) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className={`w-3 h-3 rounded-full ${['disetujui_univ'].includes(selectedProposal.status) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          <span className="text-[10px] text-on-surface-variant ">(Dosen ➔ Fakultas ➔ Universitas)</span>
                       </div>
                       <p className="text-sm font-body text-on-surface-variant leading-relaxed">{selectedProposal.tujuan}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold font-headline mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span> Riwayat Status (Audit)
                      </h3>
                      <div className="space-y-4 pl-4 relative before:absolute before:left-5 before:top-2 before:bottom-0 before:w-px before:bg-outline-variant/30">
                        {history.map((log) => (
                          <div key={log.id} className="relative z-10 flex gap-4 bg-surface rounded-xl p-4 shadow-sm border border-outline-variant/10">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-surface-container border-2 border-primary-container flex items-center justify-center -ml-8">
                               <span className="material-symbols-outlined text-[14px] text-primary">done</span>
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                 {getStatusBadge(log.status)}
                                 <span className="text-xs text-on-surface-variant font-label">{new Date(log.createdAt).toLocaleString()}</span>
                               </div>
                               <p className="text-sm text-on-surface font-medium leading-relaxed bg-surface-container-low p-2 rounded-lg mt-1">{log.notes || 'Tanpa catatan'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/5 p-6 bg-surface-container-lowest flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-headline mb-4">Panel Kendali Status</h3>
                    <textarea 
                       rows="4"
                       placeholder="Tambahkan catatan/feedback..."
                       className="w-full bg-surface-container-low border border-outline-variant/30 p-4 rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 outline-none mb-6"
                       value={komentar}
                       onChange={(e) => setKomentar(e.target.value)}
                    ></textarea>
                    
                    <div className="space-y-2">
                       {hasPermission('proposal', 'approve') && (
                         <>
                           {selectedProposal.status === 'diajukan' && (
                             <button onClick={() => handleAction('disetujui_dosen')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">ACC Tahap 1 (Dosen)</button>
                           )}
                           {selectedProposal.status === 'disetujui_dosen' && (
                             <button onClick={() => handleAction('disetujui_fakultas')} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm">ACC Tahap 2 (Fakultas)</button>
                           )}
                           {selectedProposal.status === 'disetujui_fakultas' && (
                             <button onClick={() => handleAction('disetujui_univ')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm">ACC Final (Univ & Cair)</button>
                           )}
                         </>
                       )}
                       <button onClick={() => handleAction('revisi')} className="w-full py-3 bg-amber-100 text-amber-800 rounded-xl font-bold text-sm">Minta Revisi</button>
                       <button onClick={() => handleAction('ditolak')} className="w-full py-3 bg-rose-100 text-rose-800 rounded-xl font-bold text-sm">Tolak Permanen</button>
                    </div>
                  </div>
                  <button onClick={() => setSelectedProposal(null)} className="mt-8 text-on-surface-variant font-medium underline text-sm">Tutup Panel</button>
                </div>
              </div>
            </div>
          )}

          {/* Form Modal (Create / Edit) */}
          {isFormOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
              <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 animate-in fade-in zoom-in-95 border border-outline-variant/10">
                <h2 className="text-2xl font-bold font-headline text-primary mb-6">Buat Proposal Baru</h2>
                <form onSubmit={handleSaveForm} className="space-y-4">
                  <input required placeholder="Nama Kegiatan" className="w-full bg-surface-container p-3.5 rounded-xl border border-outline-variant/30" value={formData.nama_kegiatan} onChange={e => setFormData({...formData, nama_kegiatan: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="date" className="w-full bg-surface-container p-3.5 rounded-xl border border-outline-variant/30" value={formData.tanggal_pelaksanaan} onChange={e => setFormData({...formData, tanggal_pelaksanaan: e.target.value})} />
                    <input required type="number" placeholder="Anggaran (Rp)" className="w-full bg-surface-container p-3.5 rounded-xl border border-outline-variant/30" value={formData.anggaran} onChange={e => setFormData({...formData, anggaran: e.target.value})} />
                  </div>
                  <textarea required rows="4" placeholder="Tujuan / Deskripsi" className="w-full bg-surface-container p-3.5 rounded-xl border border-outline-variant/30" value={formData.tujuan} onChange={e => setFormData({...formData, tujuan: e.target.value})}></textarea>
                  
                  <div className="bg-surface-container-low p-4 rounded-xl border border-dashed border-outline-variant/50">
                    <p className="text-xs font-bold mb-2">Lampiran File (PDF/DOC)</p>
                    <input type="file" onChange={handleFileUpload} className="text-xs" />
                    {uploading && <p className="text-[10px] text-blue-500 mt-1">Mengunggah...</p>}
                    {formData.file_url && <p className="text-[10px] text-emerald-500 mt-1">✓ File siap: {formData.file_url}</p>}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="w-full py-3.5 text-on-surface-variant font-bold">Batal</button>
                    <button type="submit" className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl">Ajukan Proposal</button>
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


export default ProposalManagement;
