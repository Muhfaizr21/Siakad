import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { fakultasService } from '../../services/api';

const KelolaFakultas = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFac, setEditingFac] = useState(null);
    const [formData, setFormData] = useState({ Nama: '', Kode: '', Dekan: '', Email: '', NoHP: '' });

    useEffect(() => {
        loadFaculties();
    }, []);

    const loadFaculties = async () => {
        try {
            setLoading(true);
            const res = await fakultasService.getAll();
            if (res.status === 'success') {
                setFaculties(res.data || []);
            } else {
                alert(`Gagal: ${res.message}`);
            }
        } catch (error) {
            console.error('Audit Error Fakultas:', error);
            alert(`Sistem Audit: Gagal memuat data fakultas. ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFac) {
                await fakultasService.update(editingFac.ID, formData);
                alert('Fakultas berhasil diperbarui');
            } else {
                await fakultasService.create(formData);
                alert('Fakultas berhasil ditambahkan');
            }
            setIsModalOpen(false);
            setEditingFac(null);
            setFormData({ Nama: '', Kode: '', Dekan: '', Email: '', NoHP: '' });
            loadFaculties();
        } catch (error) {
            alert('Gagal menyimpan data: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus fakultas ini?')) return;
        try {
            await fakultasService.delete(id);
            alert('Fakultas berhasil dihapus');
            loadFaculties();
        } catch (error) {
            alert('Gagal menghapus data: ' + error.message);
        }
    };

    const openEditModal = (fac) => {
        setEditingFac(fac);
        setFormData({ Nama: fac.Nama, Kode: fac.Kode, Dekan: fac.Dekan, Email: fac.Email, NoHP: fac.NoHP });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none relative">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Manajemen Entitas Fakultas</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk mengelola struktur dekanat dan unit akademik universitas.</p>
                </div>
                <button 
                    onClick={() => { setEditingFac(null); setFormData({ Nama: '', Kode: '', Dekan: '', Email: '', NoHP: '' }); setIsModalOpen(true); }}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                    Tambah Fakultas Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Total Node Fakultas</p>
                    <h3 className="text-4xl font-black text-primary ">{faculties.length.toString().padStart(2, '0')}</h3>
                 </div>
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Dekan Terdaftar</p>
                    <h3 className="text-4xl font-black text-primary ">{faculties.filter(f => f.Dekan).length.toString().padStart(2, '0')}</h3>
                 </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                      <th className="px-10 py-6">Nama Fakultas</th>
                      <th className="px-10 py-6 text-center">Kode</th>
                      <th className="px-10 py-6">Pimpinan (Dekan)</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {loading ? (
                        <tr><td colSpan="4" className="px-10 py-6 text-center">Memuat data...</td></tr>
                    ) : faculties.length === 0 ? (
                        <tr><td colSpan="4" className="px-10 py-6 text-center text-secondary opacity-50">Belum ada data fakultas.</td></tr>
                    ) : faculties.map((fac) => (
                      <tr key={fac.ID} className="hover:bg-primary/[0.01] transition-all group border-b border-outline-variant/5">
                        <td className="px-10 py-6">
                            <span className="font-extrabold text-primary uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-tight">{fac.Nama}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-secondary text-xs font-black rounded-lg border border-outline-variant/10">
                                {fac.Kode}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-secondary">{fac.Dekan || '-'}</td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => openEditModal(fac)}
                                    className="p-3 hover:bg-amber-50 rounded-xl text-amber-600 transition-all border border-transparent hover:border-amber-100"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(fac.ID)}
                                    className="p-3 hover:bg-error/5 rounded-xl text-error transition-all border border-transparent hover:border-error/10"
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
              <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md h-full rounded-[3rem] shadow-2xl p-10 flex flex-col gap-8 animate-in slide-in-from-right duration-500 overflow-y-auto">
                      <header className="flex justify-between items-center">
                          <div>
                              <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{editingFac ? 'Edit' : 'Tambah'} Fakultas</h2>
                              <p className="text-xs text-secondary font-bold opacity-60">Lengkapi parameter entitas universitas.</p>
                          </div>
                          <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors">
                              <span className="material-symbols-outlined">close</span>
                          </button>
                      </header>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                          {[
                              { label: 'Nama Fakultas', name: 'Nama', type: 'text', placeholder: 'Kesehatan Masyarakat...' },
                              { label: 'Kode', name: 'Kode', type: 'text', placeholder: 'FKM' },
                              { label: 'Pimpinan (Dekan)', name: 'Dekan', type: 'text', placeholder: 'Dr. Jane Doe' },
                              { label: 'Official Email', name: 'Email', type: 'email', placeholder: 'fakultas@univ.ac.id' },
                              { label: 'Kontak (No HP)', name: 'NoHP', type: 'text', placeholder: '0812...' },
                          ].map(field => (
                              <div key={field.name} className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">{field.label}</label>
                                  <input 
                                      required
                                      type={field.type}
                                      value={formData[field.name]}
                                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                                      className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-5 py-3.5 text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none" 
                                      placeholder={field.placeholder}
                                  />
                              </div>
                          ))}
                          <button type="submit" className="mt-4 bg-primary text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                              {editingFac ? 'Simpan Perubahan' : 'Daftarkan Fakultas'}
                          </button>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default KelolaFakultas;
