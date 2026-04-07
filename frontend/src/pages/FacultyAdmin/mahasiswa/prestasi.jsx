import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyPrestasi() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verificationData, setVerificationData] = useState({
    status: 'Terverifikasi',
    points: 0,
    notes: ''
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/faculty/prestasi');
      if (response.data.status === 'success') {
        setAchievements(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data prestasi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/prestasi/${selectedItem.id}`, verificationData);
      if (response.data.status === 'success') {
        toast.success('Pencapaian berhasil diverifikasi');
        setShowModal(false);
        fetchAchievements();
      }
    } catch (error) {
      toast.error('Gagal memverifikasi data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data prestasi ini?')) return;
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/prestasi/${id}`);
      if (response.data.status === 'success') {
        toast.success('Data berhasil dihapus');
        fetchAchievements();
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-medium">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 pb-12 px-4 lg:px-8">
           <div className="mb-8">
              <h1 className="text-3xl font-bold font-headline tracking-tight uppercase">Verifikasi Prestasi</h1>
              <p className="text-on-surface-variant font-medium">Review dan verifikasi pencapaian mahasiswa untuk database resmi universitas.</p>
           </div>

           <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="p-8 border-b border-outline-variant/5 flex justify-between items-center bg-white gap-4">
                 <h3 className="font-bold text-xl font-headline text-on-surface flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[28px]">workspace_premium</span>
                    Antrian Verifikasi Berkas Prestasi
                 </h3>
                 <button 
                   onClick={fetchAchievements}
                   className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
                 >
                   <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                   Refresh
                 </button>
              </div>
              
              <div className="overflow-x-auto text-[13px]">
                 <table className="w-full text-left font-medium">
                    <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[10px] uppercase text-on-surface-variant font-bold tracking-[0.15em]">
                       <tr>
                          <th className="px-8 py-5 text-nowrap">Mahasiswa</th>
                          <th className="px-8 py-5">Detail Prestasi</th>
                          <th className="px-8 py-5">Tingkat & Poin</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Aksi</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5 bg-white">
                       {loading ? (
                         <tr><td colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Memuat Data...</td></tr>
                       ) : achievements.length === 0 ? (
                         <tr><td colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest">Belum ada data prestasi</td></tr>
                       ) : achievements.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                                      {item.student?.name?.charAt(0) || '?'}
                                   </div>
                                   <div>
                                      <span className="font-bold text-on-surface block leading-tight">{item.student?.name || 'Anonim'}</span>
                                      <span className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{item.student?.nim || '-'}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <div className="mb-1.5 flex items-center gap-2">
                                   <span className="text-[9px] font-bold tracking-widest text-[#00236f] bg-[#00236f]/10 px-2.5 py-1 rounded-sm uppercase inline-block">{item.category}</span>
                                   <span className="text-[10px] text-on-surface-variant font-bold">{item.year}</span>
                                </div>
                                <h4 className="font-bold text-on-surface leading-tight">{item.title}</h4>
                             </td>
                             <td className="px-8 py-6">
                                <div className="font-bold text-on-surface-variant text-[11px] mb-1">{item.level}</div>
                                <div className="flex items-center gap-1.5 text-primary">
                                   <span className="material-symbols-outlined text-[16px]">stars</span>
                                   <span className="font-bold text-[11px]">{item.points} Poin SKPI</span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                  item.status === 'Menunggu' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                  item.status === 'Terverifikasi' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                  'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                   {item.status === 'Menunggu' ? 'MENUNGGU' : item.status === 'Terverifikasi' ? 'VERIFIED' : 'DITOLAK'}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                   <button 
                                      onClick={() => { setSelectedItem(item); setVerificationData({...verificationData, points: item.points || 0, notes: item.notes || ''}); setShowModal(true); }}
                                      className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary-fixed hover:text-white transition-all flex items-center justify-center text-on-surface"
                                      title="Verifikasi"
                                   >
                                      <span className="material-symbols-outlined text-[20px]">verified</span>
                                   </button>
                                   <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="w-10 h-10 rounded-xl bg-surface-container hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-on-surface"
                                      title="Hapus"
                                   >
                                      <span className="material-symbols-outlined text-[20px]">delete</span>
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Modal Verifikasi */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
             <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl">
                <h2 className="text-2xl font-bold text-on-surface mb-6 uppercase tracking-tight">Verifikasi Berkas</h2>
                
                <div className="mb-8 space-y-6 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Status Verifikasi</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Terverifikasi', 'Ditolak'].map(s => (
                        <button 
                          key={s}
                          onClick={() => setVerificationData({...verificationData, status: s})}
                          type="button"
                          className={`py-4 rounded-xl border font-bold text-[11px] uppercase tracking-widest transition-all ${verificationData.status === s ? 'bg-primary text-white border-primary shadow-lg' : 'bg-surface border-outline-variant/20 text-on-surface-variant hover:border-primary'}`}
                        >
                          {s === 'Terverifikasi' ? 'TERIMA' : 'TOLAK'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Alokasi Poin SKPI (0-100)</label>
                    <input 
                      type="number"
                      value={verificationData.points}
                      onChange={(e) => setVerificationData({...verificationData, points: parseInt(e.target.value) || 0})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold bg-surface"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1 text-left">Catatan Admin</label>
                    <textarea 
                      value={verificationData.notes}
                      onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                      className="w-full h-24 p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-medium resize-none shadow-inner bg-surface"
                      placeholder="Contoh: Berkas sesuai, Juara 1 Nasional..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border-outline-variant/20" onClick={() => setShowModal(false)}>BATAL</Button>
                  <Button className="flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/25 bg-primary text-white" onClick={handleVerify}>SIMPAN</Button>
                </div>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
}
