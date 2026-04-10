import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const KelolaBeasiswa = () => {
    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSch, setEditingSch] = useState(null);
    const [formData, setFormData] = useState({ 
        Nama: '', Penyelenggara: '', Deskripsi: '', 
        Deadline: '', Kuota: 0, IPKMin: 0 
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllScholarships();
            if (res.status === 'success') {
                setScholarships(res.data || []);
            }
        } catch (error) {
            console.error('Gagal memuat data beasiswa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                Kuota: parseInt(formData.Kuota),
                IPKMin: parseFloat(formData.IPKMin),
                Deadline: new Date(formData.Deadline).toISOString()
            };

            if (editingSch) {
                await adminService.updateScholarship(editingSch.ID, data);
            } else {
                await adminService.createScholarship(data);
            }
            setIsModalOpen(false);
            setEditingSch(null);
            setFormData({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0 });
            loadData();
        } catch (error) {
            alert('Gagal menyimpan data: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus program beasiswa ini?')) return;
        try {
            await adminService.deleteScholarship(id);
            loadData();
        } catch (error) {
            alert('Gagal menghapus: ' + error.message);
        }
    };

    const openEditModal = (sch) => {
        setEditingSch(sch);
        setFormData({ 
            Nama: sch.Nama, 
            Penyelenggara: sch.Penyelenggara, 
            Deskripsi: sch.Deskripsi, 
            Deadline: sch.Deadline ? new Date(sch.Deadline).toISOString().split('T')[0] : '', 
            Kuota: sch.Kuota, 
            IPKMin: sch.IPKMin 
        });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Manajemen Beasiswa Institusi</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90">Otoritas pusat untuk mengelola skema bantuan pendidikan dan pemantauan distribusi dana.</p>
                </div>
                <button 
                  onClick={() => { setEditingSch(null); setFormData({ Nama: '', Penyelenggara: '', Deskripsi: '', Deadline: '', Kuota: 0, IPKMin: 0 }); setIsModalOpen(true); }}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all font-body"
                >
                    Buat Program Beasiswa
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-body">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 space-y-2 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Program Aktif</p>
                      <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">{loading ? '...' : scholarships.length.toString().padStart(2, '0')} Unit</h3>
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm font-body">
                 <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Daftar Program Beasiswa Aktif</h3>
                 </div>
                 <table className="w-full text-left font-body">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <tr>
                      <th className="px-10 py-6">Nama Program</th>
                      <th className="px-10 py-6">Penyelenggara</th>
                      <th className="px-10 py-6 text-center">Kuota</th>
                      <th className="px-10 py-6 text-center">Sisa Waktu</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 select-text">
                    {loading ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Memuat data beasiswa...</td></tr>
                    ) : scholarships.length === 0 ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Belum ada program beasiswa.</td></tr>
                    ) : scholarships.map((s) => (
                      <tr key={s.ID} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                        <td className="px-10 py-6">
                            <span className="font-extrabold text-primary uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-tight">{s.Nama}</span>
                        </td>
                        <td className="px-10 py-6 text-xs font-bold text-slate-600 uppercase italic opacity-70">{s.Penyelenggara}</td>
                        <td className="px-10 py-6 text-center font-black text-primary opacity-60">{s.Kuota} Slot</td>
                        <td className="px-10 py-6 text-center">
                             <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-black uppercase text-slate-400">Deadline</span>
                                 <span className="text-xs font-bold text-slate-700">{new Date(s.Deadline).toLocaleDateString('id-ID')}</span>
                             </div>
                        </td>
                        <td className="px-10 py-6 text-right font-body">
                             <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => openEditModal(s)}
                                    className="p-3 hover:bg-amber-50 rounded-xl text-amber-600 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(s.ID)}
                                    className="p-3 hover:bg-rose-50 rounded-xl text-rose-500 transition-all font-body"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                             </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>

          {/* Modal Form */}
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-body">
                  <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 flex flex-col gap-8 animate-in zoom-in duration-300">
                      <header>
                          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{editingSch ? 'Edit' : 'Buka'} Beasiswa</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Program Bantuan Pendidikan</p>
                      </header>

                      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-body">Nama Program Beasiswa</label>
                              <input 
                                required
                                value={formData.Nama}
                                onChange={(e) => setFormData({...formData, Nama: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                                placeholder="E.g. Beasiswa PPA 2024"
                              />
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-body">Penyelenggara</label>
                              <input 
                                required
                                value={formData.Penyelenggara}
                                onChange={(e) => setFormData({...formData, Penyelenggara: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                                placeholder="E.g. Kemendikbud"
                              />
                          </div>
                          <div className="flex flex-col gap-1.5 font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Deadline Pendaftaran</label>
                              <input 
                                required
                                type="date"
                                value={formData.Deadline}
                                onChange={(e) => setFormData({...formData, Deadline: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                              />
                          </div>
                          <div className="flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kuota Penerima</label>
                              <input 
                                type="number"
                                value={formData.Kuota}
                                onChange={(e) => setFormData({...formData, Kuota: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                              />
                          </div>
                          <div className="flex flex-col gap-1.5 font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Syarat IPK Minimal</label>
                              <input 
                                type="number"
                                step="0.1"
                                value={formData.IPKMin}
                                onChange={(e) => setFormData({...formData, IPKMin: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                              />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1.5 font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Deskripsi Singkat</label>
                              <textarea 
                                value={formData.Deskripsi}
                                onChange={(e) => setFormData({...formData, Deskripsi: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none min-h-[80px]" 
                                placeholder="Jelaskan kriteria dan manfaat beasiswa..."
                              />
                          </div>
                          <div className="col-span-2 flex gap-4 pt-4 font-body">
                            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                {editingSch ? 'Simpan Perubahan' : 'Buka Program'}
                            </button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-slate-100 text-slate-500 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em]">Batal</button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default KelolaBeasiswa;
