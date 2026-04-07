import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyMbkm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({
    status: 'terdaftar',
    sks: 20
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/faculty/mbkm');
      if (response.data.status === 'success') {
        setPrograms(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data MBKM');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/mbkm/${selectedItem.id}`, {
        status: adminData.status,
        sks: parseInt(adminData.sks)
      });
      if (response.data.status === 'success') {
        toast.success('Informasi MBKM diperbarui');
        setShowModal(false);
        fetchPrograms();
      }
    } catch (error) {
      toast.error('Gagal memperbarui data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data program ini?')) return;
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/mbkm/${id}`);
      if (response.data.status === 'success') {
        toast.success('Data dihapus');
        fetchPrograms();
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  const filteredPrograms = activeTab === 'all' 
    ? programs 
    : programs.filter(p => p.status === activeTab);

  return (
    <div className="bg-surface text-on-surface min-h-screen text-left">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-left">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold font-headline tracking-tight uppercase">Manajemen MBKM</h1>
              <p className="text-on-surface-variant font-medium italic">Validasi program Merdeka Belajar Kampus Merdeka dan konversi SKS.</p>
            </div>
            <button 
              onClick={fetchPrograms}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-outline-variant/10 pb-4">
             {['all', 'terdaftar', 'berjalan', 'rekon_sks', 'selesai', 'ditolak'].map(tab => (
                <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest whitespace-nowrap'}`}
                >
                   {tab === 'all' ? 'Semua' : tab}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#fcfcfd] border-b border-outline-variant/5">
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Mahasiswa</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant w-[30%]">Program & Instansi</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Konversi SKS</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">Status</TableHead>
                  <TableHead className="px-8 py-5 font-bold text-[10px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest animate-pulse italic">Memuat data MBKM...</TableCell></TableRow>
                ) : filteredPrograms.length === 0 ? (
                  <TableRow><TableCell colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest italic">Tidak ada partisipan MBKM</TableCell></TableRow>
                ) : filteredPrograms.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5 text-[13px]">
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/10">
                          {item.student?.name?.charAt(0) || '?'}
                        </div>
                        <div className="text-left">
                          <span className="block font-bold text-on-surface leading-tight mb-1">{item.student?.name || 'Anonim'}</span>
                          <span className="text-[11px] font-bold text-on-surface-variant/60 font-mono italic">{item.student?.nim || '-'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-left">
                      <span className="block font-bold text-on-surface mb-1 uppercase tracking-tight">{item.type}</span>
                      <span className="text-[11px] font-bold text-primary flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">corporate_fare</span> {item.partner}</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-center">
                      <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs">{item.sks} SKS</span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-left">
                      <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                        item.status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'berjalan' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        item.status === 'ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                         {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 text-left">
                        <button 
                          onClick={() => { setSelectedItem(item); setAdminData({status: item.status, sks: item.sks}); setShowModal(true); }}
                          className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary-fixed hover:text-white transition-all flex items-center justify-center text-on-surface"
                        >
                           <span className="material-symbols-outlined text-[20px]">edit_note</span>
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

        {/* Modal Kelola MBKM */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
             <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-left">
                <div className="flex justify-between items-start mb-6 text-left">
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-on-surface uppercase tracking-tight">Kelola Program MBKM</h2>
                    <p className="text-sm text-on-surface-variant mt-1 italic">Update status partisipasi & konversi SKS mahasiswa.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-outline-variant/10 text-left">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">DATA PARTISIPAN</p>
                  <h4 className="font-bold text-on-surface mb-1">{selectedItem?.student?.name}</h4>
                  <p className="text-[11px] text-on-surface-variant font-bold italic">{selectedItem?.type} @ {selectedItem?.partner}</p>
                </div>
                
                <div className="mb-6 space-y-4 text-left">
                  <div className="text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Status Partisipasi</label>
                    <select 
                      value={adminData.status}
                      onChange={(e) => setAdminData({...adminData, status: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold bg-surface"
                    >
                      <option value="terdaftar">Daftar Baru</option>
                      <option value="berjalan">Sedang Berjalan</option>
                      <option value="rekon_sks">Proses Rekon SKS</option>
                      <option value="selesai">Selesai / Rekon Tuntas</option>
                      <option value="ditolak">Ditolak / Batal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Konversi SKS</label>
                    <input 
                      type="number"
                      value={adminData.sks}
                      onChange={(e) => setAdminData({...adminData, sks: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold bg-surface"
                      placeholder="Contoh: 20"
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
