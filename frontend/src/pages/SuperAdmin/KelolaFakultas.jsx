import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Plus, Edit2, Trash2, X } from 'lucide-react';

const KelolaFakultas = () => {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        deanName: ''
    });

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/super/faculties');
            setFaculties(response.data.data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            toast.error('Gagal mengambil data fakultas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (faculty = null) => {
        if (faculty) {
            setCurrentFaculty(faculty);
            setFormData({
                name: faculty.name,
                code: faculty.code,
                deanName: faculty.deanName || ''
            });
        } else {
            setCurrentFaculty(null);
            setFormData({
                name: '',
                code: '',
                deanName: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentFaculty) {
                await api.put(`/admin/super/faculties/${currentFaculty.id}`, formData);
                toast.success('Fakultas berhasil diperbarui');
            } else {
                await api.post('/admin/super/faculties', formData);
                toast.success('Fakultas berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchFaculties();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus fakultas ini?')) {
            try {
                await api.delete(`/admin/super/faculties/${id}`);
                toast.success('Fakultas berhasil dihapus');
                fetchFaculties();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal menghapus fakultas');
            }
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
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
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    Tambah Fakultas Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {/* Ringkasan Cepat */}
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Total Node Fakultas</p>
                    <h3 className="text-4xl font-black text-primary ">{faculties.length.toString().padStart(2, '0')}</h3>
                 </div>
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Dekan Terdaftar</p>
                    <h3 className="text-4xl font-black text-primary ">
                        {faculties.filter(f => f.deanName).length.toString().padStart(2, '0')}
                    </h3>
                 </div>
                 <div className="md:col-span-1 bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Total Program Studi</p>
                    <h3 className="text-4xl font-black text-primary ">
                        {faculties.reduce((acc, f) => acc + (f.totalProdi || 0), 0).toString().padStart(2, '0')}
                    </h3>
                 </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                ) : (
                    <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                        <th className="px-10 py-6">Nama Fakultas</th>
                        <th className="px-10 py-6 text-center">Kode</th>
                        <th className="px-10 py-6">Pimpinan (Dekan)</th>
                        <th className="px-10 py-6 text-center">Prodi</th>
                        <th className="px-10 py-6 text-center">Populasi Mhs</th>
                        <th className="px-10 py-6">Status Node</th>
                        <th className="px-10 py-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                        {faculties.map((fac) => (
                        <tr key={fac.id} className="hover:bg-primary/[0.01] transition-all group">
                            <td className="px-10 py-6">
                                <span className="font-extrabold text-primary uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-tight">{fac.name}</span>
                            </td>
                            <td className="px-10 py-6 text-center">
                                <span className="px-3 py-1 bg-slate-100 text-secondary text-xs font-black rounded-lg border border-outline-variant/10">
                                    {fac.code || '-'}
                                </span>
                            </td>
                            <td className="px-10 py-6 text-sm font-bold text-secondary">{fac.deanName || 'Belum Ditunjuk'}</td>
                             <td className="px-10 py-6 text-center">
                                <span className="font-extrabold text-secondary">{fac.totalProdi || 0}</span>
                            </td>
                            <td className="px-10 py-6 text-center font-black text-primary">{fac.totalStudents.toLocaleString()}</td>
                            <td className="px-10 py-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{fac.status || 'Aktif'}</span>
                                </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(fac)}
                                        className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all group/edit"
                                    >
                                        <Edit2 size={18} className="group-hover/edit:scale-110 transition-transform" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(fac.id)}
                                        className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-all group/delete"
                                    >
                                        <Trash2 size={18} className="group-hover/delete:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
              </section>
            </div>
          </main>

          {/* Modal CRUD */}
          {isModalOpen && (
              <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center">
                          <h2 className="text-xl font-black text-primary uppercase tracking-tight">
                              {currentFaculty ? 'Edit Entitas Fakultas' : 'Tambah Fakultas Baru'}
                          </h2>
                          <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="p-8 space-y-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Nama Lengkap Fakultas</label>
                              <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Contoh: Fakultas Ilmu Komputer"
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                              />
                          </div>

                          <div className="grid grid-cols-3 gap-6">
                              <div className="col-span-1 space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Kode SIngkat</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    placeholder="FT"
                                    maxLength={5}
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary text-center"
                                  />
                              </div>
                              <div className="col-span-2 space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Nama Dekan (Opsional)</label>
                                  <input 
                                    type="text" 
                                    value={formData.deanName}
                                    onChange={(e) => setFormData({...formData, deanName: e.target.value})}
                                    placeholder="Gelar & Nama Lengkap"
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                                  />
                              </div>
                          </div>

                          <div className="pt-4 flex gap-4">
                              <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-secondary font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                              >
                                Batal
                              </button>
                              <button 
                                type="submit"
                                className="flex-2 px-10 py-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all"
                              >
                                {currentFaculty ? 'Simpan Perubahan' : 'Daftarkan Fakultas'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default KelolaFakultas;
