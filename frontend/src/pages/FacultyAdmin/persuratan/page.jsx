import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyPersuratan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({
    status: 'diproses',
    adminNotes: '',
    fileUrl: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/faculty/surat');
      if (response.data.status === 'success') {
        setRequests(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pengajuan surat');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/surat/${selectedItem.id}`, adminData);
      if (response.data.status === 'success') {
        toast.success('Status surat diperbarui');
        setShowModal(false);
        fetchRequests();
      }
    } catch (error) {
      toast.error('Gagal memperbarui data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pengajuan ini?')) return;
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/surat/${id}`);
      if (response.data.status === 'success') {
        toast.success('Pengajuan dihapus');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  const filteredRequests = activeTab === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeTab);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight uppercase">E-Persuratan</h1>
              <p className="text-on-surface-variant font-medium">Kelola pengajuan surat menyurat akademik mahasiswa secara digital.</p>
            </div>
            <button 
              onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-outline-variant/10 pb-4">
             {['all', 'diajukan', 'diproses', 'siap_ambil', 'selesai', 'ditolak'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest whitespace-nowrap'}`}
                >
                   {tab === 'all' ? 'Semua' : tab === 'diajukan' ? 'Pengajuan' : tab}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">ID & Tanggal</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Mahasiswa</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant w-[30%]">Jenis Surat & Keperluan</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Status</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest animate-pulse italic">Sedang memuat data...</TableCell></TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow><TableCell colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest italic">Tidak ada pengajuan surat</TableCell></TableRow>
                ) : filteredRequests.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5 text-[13px]">
                    <TableCell className="px-8 py-6 font-medium">
                      <span className="block font-mono text-primary font-bold mb-1">#SRT-{item.id}</span>
                      <span className="text-[11px] text-on-surface-variant/70 font-bold">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs uppercase border border-outline-variant/10">
                          {item.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <span className="block font-bold text-on-surface leading-tight mb-1">{item.student?.name || 'Anonim'}</span>
                          <span className="text-[11px] font-bold text-on-surface-variant/60 font-mono italic">{item.student?.nim || '-'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="block font-bold text-on-surface mb-1">{item.type}</span>
                      <p className="text-[11px] text-on-surface-variant italic leading-relaxed line-clamp-1">"{item.purpose}"</p>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                        item.status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'diproses' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        item.status === 'ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedItem(item); setAdminData({status: item.status, adminNotes: item.adminNotes || '', fileUrl: item.fileUrl || ''}); setShowModal(true); }}
                          className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary-fixed hover:text-white transition-all flex items-center justify-center text-on-surface"
                        >
                           <span className="material-symbols-outlined text-[20px]">task</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-10 h-10 rounded-xl bg-surface-container hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-on-surface"
                        >
                           <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modal Kelola Surat */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300 font-medium">
             <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface uppercase tracking-tight">Keluarkan Surat</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Update status pengajuan & lampirkan berkas digital.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">DATA PENGAJUAN</p>
                  <h4 className="font-bold text-on-surface mb-1">{selectedItem?.type}</h4>
                  <p className="text-[11px] text-on-surface-variant italic">"{selectedItem?.purpose}"</p>
                </div>
                
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Status Progres</label>
                    <select 
                      value={adminData.status}
                      onChange={(e) => setAdminData({...adminData, status: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold bg-surface"
                    >
                      <option value="diajukan">Diterima (Antrean)</option>
                      <option value="diproses">Sedang Diproses</option>
                      <option value="siap_ambil">Siap Diambil (Hardcopy)</option>
                      <option value="selesai">Selesai (Softcopy dikirim)</option>
                      <option value="ditolak">Ditolak (Ada Berkas Kurang)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">URL File Digital (Opsional)</label>
                    <input 
                      value={adminData.fileUrl}
                      onChange={(e) => setAdminData({...adminData, fileUrl: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-[11px] font-mono text-primary bg-surface"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Catatan Ke Mahasiswa</label>
                    <textarea 
                      value={adminData.adminNotes}
                      onChange={(e) => setAdminData({...adminData, adminNotes: e.target.value})}
                      className="w-full h-24 p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-medium resize-none bg-surface"
                      placeholder="Sebutkan alasan jika ditolak, atau berikan instruksi pengambilan..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border-outline-variant/20" onClick={() => setShowModal(false)}>BATAL</Button>
                  <Button className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/25" onClick={handleUpdate}>SIMPAN</Button>
                </div>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
}
