import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { Card } from './components/card';
import { Button } from './components/button';
import { toast, Toaster } from 'react-hot-toast';

const FacultyAspirationManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aspirations, setAspirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchAspirations();
  }, []);

  const fetchAspirations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/faculty/aspirasi');
      if (response.data.status === 'success') {
        setAspirations(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data aspirasi');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/aspirasi/${selectedItem.id}`, {
        status,
        response: adminResponse
      });
      if (response.data.status === 'success') {
        toast.success('Aspirasi berhasil diperbarui');
        setShowModal(false);
        setAdminResponse('');
        fetchAspirations();
      }
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus aspirasi ini?')) return;
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/aspirasi/${id}`);
      if (response.data.status === 'success') {
        toast.success('Aspirasi dihapus');
        fetchAspirations();
      }
    } catch (error) {
      toast.error('Gagal menghapus aspirasi');
    }
  };

  const filteredAspirations = activeTab === 'all' 
    ? aspirations 
    : aspirations.filter(a => a.status === activeTab);

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h1 className="text-3xl font-bold font-headline uppercase">Kelola Tiket Aspirasi</h1>
              <p className="text-on-surface-variant font-medium">Monitoring dan tindak lanjut aspirasi mahasiswa fakultas.</p>
            </div>

            <div className="flex bg-surface-container-high p-1.5 rounded-[1.5rem] border border-outline-variant/10 shadow-sm overflow-x-auto no-scrollbar">
              {['all', 'proses', 'klarifikasi', 'selesai', 'ditolak'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-2.5 rounded-[1.2rem] text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {t === 'all' ? 'Semua' : t === 'proses' ? 'Diproses' : t === 'klarifikasi' ? 'Klarifikasi' : t === 'selesai' ? 'Selesai' : 'Ditolak'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="p-8 border-b border-outline-variant/5 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-xl font-headline text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[28px]">record_voice_over</span>
                  Antrian Tiket Aspirasi
                </h3>
                <p className="text-sm font-medium text-on-surface-variant mt-1">Daftar keluhan dan masukan dari mahasiswa</p>
              </div>
              <button 
                onClick={fetchAspirations}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-[11px] font-bold uppercase tracking-widest"
              >
                <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-on-surface">
                <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[10px] uppercase text-on-surface-variant font-bold tracking-[0.15em]">
                  <tr>
                    <th className="px-8 py-5">Tiket & Tanggal</th>
                    <th className="px-8 py-5">Mahasiswa</th>
                    <th className="px-8 py-5 w-[30%]">Topik & Detail</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right w-[150px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5 font-medium bg-white text-[13px]">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">Memuat Data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAspirations.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest">Tidak ada data aspirasi</p>
                      </td>
                    </tr>
                  ) : filteredAspirations.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest">#{item.id}</div>
                        <div className="text-[11px] font-bold text-on-surface-variant/60 mt-1">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {item.student?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{item.student?.name || 'Anonim'}</div>
                            <div className="text-[10px] text-on-surface-variant/70">{item.student?.nim || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="mb-2">
                           <span className="text-[9px] font-bold tracking-widest text-[#00236f] bg-[#00236f]/10 px-2.5 py-1 rounded-sm uppercase inline-block mb-1">{item.category || 'Umum'}</span>
                           <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{item.title}</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-1">{item.description}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                          item.status === 'proses' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          item.status === 'klarifikasi' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          item.status === 'selesai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {item.status === 'proses' ? 'DIPROSES' : item.status === 'klarifikasi' ? 'KLARIFIKASI' : item.status === 'selesai' ? 'SELESAI' : 'DITOLAK'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 text-on-surface-variant">
                          <button onClick={() => { setSelectedItem(item); setAdminResponse(item.response || ''); setShowModal(true); }} className="w-8 h-8 rounded-xl bg-surface-container hover:bg-primary hover:text-white transition-all flex items-center justify-center" title="Tanggapi">
                            <span className="material-symbols-outlined text-[16px]">reply</span>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-xl bg-surface-container hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center" title="Hapus">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
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

        {/* Modal Status Update & Response */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
             <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface uppercase tracking-tight">Tanggapi Aspirasi</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Berikan respon dan update status tiket.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{selectedItem?.category || 'Umum'}</p>
                  <h4 className="font-bold text-on-surface mb-2">{selectedItem?.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed italic">"{selectedItem?.description}"</p>
                </div>
                
                <div className="mb-6">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Tanggapan Admin (Publik ke Mahasiswa)</label>
                  <textarea 
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full h-32 p-4 rounded-2xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium resize-none"
                    placeholder="Tuliskan tanggapan atau instruksi untuk mahasiswa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                   {[
                      { id: 'proses', label: 'DIPROSES', icon: 'sync', color: 'bg-blue-50 text-blue-600' },
                      { id: 'klarifikasi', label: 'KLARIFIKASI', icon: 'help', color: 'bg-amber-50 text-amber-600' },
                      { id: 'selesai', label: 'SELESAI', icon: 'check_circle', color: 'bg-emerald-50 text-emerald-600' },
                      { id: 'ditolak', label: 'DITOLAK', icon: 'cancel', color: 'bg-rose-50 text-rose-600' },
                   ].map(s => (
                      <button 
                         key={s.id}
                         onClick={() => handleUpdateStatus(s.id)}
                         className={`p-4 rounded-xl border border-outline-variant/10 hover:shadow-md transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${s.color}`}
                      >
                         <span className="material-symbols-outlined text-[20px] mb-1">{s.icon}</span>
                         <span className="text-[9px] font-bold tracking-widest">{s.label}</span>
                      </button>
                   ))}
                </div>
                
                <Button variant="outline" className="w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest border-outline-variant/20" onClick={() => setShowModal(false)}>BATAL</Button>
             </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyAspirationManagement;
