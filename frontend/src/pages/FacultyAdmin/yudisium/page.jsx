import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card } from '../components/card';
import { Button } from '../components/button';
import { toast, Toaster } from 'react-hot-toast';

export default function FacultyYudisium() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    status: 'verifikasi',
    notes: '',
    examDate: ''
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/faculty/yudisium');
      if (response.data.status === 'success') {
        setSubmissions(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data yudisium');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8000/api/faculty/yudisium/${selectedItem.id}`, formData);
      if (response.data.status === 'success') {
        toast.success('Status yudisium diperbarui');
        setShowModal(false);
        fetchSubmissions();
      }
    } catch (error) {
      toast.error('Gagal memperbarui data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pendaftaran ini?')) return;
    try {
      const response = await axios.delete(`http://localhost:8000/api/faculty/yudisium/${id}`);
      if (response.data.status === 'success') {
        toast.success('Pendaftaran dihapus');
        fetchSubmissions();
      }
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-medium text-left">
      <Toaster position="top-right" />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 text-left">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold font-headline tracking-tight uppercase mb-1">Pendaftaran Yudisium</h1>
              <p className="text-on-surface-variant font-medium italic">Validasi berkas prasyarat kelulusan mahasiswa sebelum diajukan ke SK Rektor.</p>
            </div>
            <button 
              onClick={fetchSubmissions}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-[11px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>

          <div className="bg-white border border-outline-variant/10 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="p-8 border-b border-outline-variant/5 bg-white">
                <h3 className="font-bold text-xl font-headline text-on-surface flex items-center gap-3">
                   <span className="material-symbols-outlined text-primary text-[28px]">school</span>
                   Antrian Pendaftaran Yudisium
                </h3>
             </div>
             
             <div className="overflow-x-auto text-[13px]">
                <table className="w-full text-left font-medium">
                   <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[10px] uppercase text-on-surface-variant font-bold tracking-[0.15em]">
                      <tr>
                         <th className="px-8 py-5">Mahasiswa</th>
                         <th className="px-8 py-5">Detail Skripsi</th>
                         <th className="px-8 py-5 text-center">IPK Akhir</th>
                         <th className="px-8 py-5">Status & Jadwal</th>
                         <th className="px-8 py-5 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-outline-variant/10 bg-white">
                      {loading ? (
                        <tr><td colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest animate-pulse italic">Memuat data pendaftar...</td></tr>
                      ) : submissions.length === 0 ? (
                        <tr><td colSpan="5" className="py-20 text-center font-bold text-on-surface-variant uppercase tracking-widest italic">Belum ada pendaftar yudisium</td></tr>
                      ) : submissions.map((item) => (
                         <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4 text-left">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/10">
                                     {item.student?.name?.charAt(0) || '?'}
                                  </div>
                                  <div className="text-left">
                                     <span className="block font-bold text-on-surface leading-tight mb-1">{item.student?.name || 'Anonim'}</span>
                                     <span className="text-[11px] font-bold text-on-surface-variant/60 font-mono italic">{item.student?.nim || '-'}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6 max-w-xs text-left">
                               <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-outline-variant/10 px-2 py-1 rounded inline-block mb-1">{item.student?.major?.name || 'Prodi'}</span>
                               <p className="font-bold text-on-surface leading-tight line-clamp-2 italic">"{item.thesisTitle}"</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <span className="font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-3 py-1 rounded-lg text-sm">{item.gpa?.toFixed(2)}</span>
                            </td>
                            <td className="px-8 py-6 text-left">
                               <span className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${
                                 item.status === 'lulus' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                 item.status === 'sidang' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                 item.status === 'ditolak' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                 'bg-amber-50 text-amber-600 border-amber-100'
                               }`}>
                                  {item.status}
                               </span>
                               {item.examDate && (
                                 <div className="mt-2 text-[10px] font-bold text-on-surface-variant/70 flex items-center gap-1.5 px-1">
                                   <span className="material-symbols-outlined text-[14px]">event_available</span>
                                   {new Date(item.examDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                 </div>
                               )}
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end gap-2 text-left">
                                  <button 
                                     onClick={() => { setSelectedItem(item); setFormData({status: item.status, notes: item.notes || '', examDate: item.examDate ? item.examDate.substring(0, 10) : ''}); setShowModal(true); }}
                                     className="w-10 h-10 rounded-xl bg-surface-container hover:bg-primary-fixed hover:text-white transition-all flex items-center justify-center text-on-surface"
                                  >
                                     <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                                  </button>
                                  <button 
                                     onClick={() => handleDelete(item.id)}
                                     className="w-10 h-10 rounded-xl bg-surface-container hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-on-surface"
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

        {/* Modal Kelola Yudisium */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-300">
             <Card className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface uppercase tracking-tight">Proses Kelulusan</h2>
                    <p className="text-sm text-on-surface-variant mt-1 italic">Update status verifikasi & jadwal sidang mahasiswa.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6 p-5 bg-slate-50 rounded-2xl border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">DATA SKRIPSI</p>
                  <h4 className="font-bold text-on-surface mb-1 leading-tight">"{selectedItem?.thesisTitle}"</h4>
                  <p className="text-[11px] text-on-surface-variant font-bold">IPK AKHIR: {selectedItem?.gpa?.toFixed(2)}</p>
                </div>
                
                <div className="mb-6 space-y-4 text-left">
                  <div className="text-left">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Status Yudisium</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold bg-surface"
                    >
                      <option value="pendaftaran">Baru (Pendaftaran)</option>
                      <option value="verifikasi">Verifikasi Berkas</option>
                      <option value="sidang">Penjadwalan Sidang</option>
                      <option value="revisi">Proses Revisi</option>
                      <option value="lulus">Lulus / Selesai</option>
                      <option value="ditolak">Ditolak / Bermasalah</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1">Jadwal Sidang (Jika relevan)</label>
                    <input 
                      type="date"
                      value={formData.examDate}
                      onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-bold bg-surface"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block px-1 text-left">Keterangan Tambahan</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full h-24 p-4 rounded-2xl border border-outline-variant/20 focus:border-primary outline-none text-sm font-medium resize-none bg-surface"
                      placeholder="Contoh: Berkas kurang pas foto, Siap sidang minggu depan..."
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
