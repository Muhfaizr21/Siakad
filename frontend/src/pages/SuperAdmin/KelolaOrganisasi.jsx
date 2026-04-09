import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Plus, Edit2, Trash2, X, Eye } from 'lucide-react';

const KelolaOrganisasi = () => {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrg, setCurrentOrg] = useState(null);
    const [faculties, setFaculties] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        orgCode: '',
        facultyId: '',
        status: 'Aktif'
    });

    useEffect(() => {
        fetchOrgs();
        fetchFaculties();
    }, []);

    const fetchOrgs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/super/ormawas');
            setOrgs(response.data.data);
        } catch (error) {
            console.error('Error fetching orgs:', error);
            toast.error('Gagal mengambil data organisasi');
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/admin/super/faculties');
            setFaculties(response.data.data);
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    const handleOpenModal = (org = null) => {
        if (org) {
            setCurrentOrg(org);
            setFormData({
                name: org.name,
                orgCode: org.orgCode || '',
                facultyId: org.facultyId || '',
                status: org.status || 'Aktif'
            });
        } else {
            setCurrentOrg(null);
            setFormData({
                name: '',
                orgCode: '',
                facultyId: '',
                status: 'Aktif'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                facultyId: formData.facultyId ? parseInt(formData.facultyId) : null
            };

            if (currentOrg) {
                await api.put(`/admin/super/ormawas/${currentOrg.id}`, payload);
                toast.success('Organisasi berhasil diperbarui');
            } else {
                await api.post('/admin/super/ormawas', payload);
                toast.success('Organisasi berhasil didaftarkan');
            }
            setIsModalOpen(false);
            fetchOrgs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus organisasi ini dari sistem?')) {
            try {
                await api.delete(`/admin/super/ormawas/${id}`);
                toast.success('Organisasi dihapus');
                fetchOrgs();
            } catch (error) {
                toast.error('Gagal menghapus organisasi');
            }
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="lg:ml-80 ml-0 flex flex-col min-h-screen w-full transition-all duration-300">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Registri & Legalitas Ormawa</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk pendaftaran, pembekuan, dan monitoring kepengurusan ORMAWA.</p>
                </div>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    Daftarkan Unit Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-2 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-tight">Total Ormawa Terdaftar</p>
                      <h3 className="text-3xl font-black text-primary font-headline uppercase">{orgs.length} Unit</h3>
                  </div>
                  <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-2 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-tight">Kepengurusan Aktif</p>
                      <h3 className="text-3xl font-black text-emerald-600 font-headline uppercase tracking-tighter ">{orgs.filter(o => o.status === 'Aktif').length} Unit</h3>
                  </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm min-h-[400px] relative">
                 {loading && (
                     <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={40} />
                     </div>
                 )}
                 <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 leading-tight">
                      <th className="px-10 py-6">Nama Organisasi</th>
                      <th className="px-10 py-6 text-center">Afiliasi Fakultas</th>
                      <th className="px-10 py-6 text-center">Kode Registri</th>
                      <th className="px-10 py-6">Status Legalitas</th>
                      <th className="px-10 py-6 text-right">Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                    {!loading && orgs.length === 0 ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center font-bold text-slate-400">Tidak ada organisasi ditemukan.</td></tr>
                    ) : orgs.map((o) => (
                      <tr key={o.id} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <span className="font-extrabold text-primary uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-tight">{o.name}</span>
                        </td>
                        <td className="px-10 py-6 text-center text-xs font-bold text-secondary uppercase tracking-tight">
                            {o.faculty?.name || 'UNIVERSITAS'}
                        </td>
                        <td className="px-10 py-6 text-center">
                             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 text-secondary px-3 py-1.5 rounded-lg border border-outline-variant/10">
                                {o.orgCode || 'N/A'}
                             </span>
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-2.5">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    o.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    'bg-rose-50 text-rose-500 border-rose-100'
                                }`}>
                                    {o.status}
                                </span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                               <button 
                                onClick={() => handleOpenModal(o)}
                                className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                    <Edit2 size={18} />
                                </button>
                               <button 
                                onClick={() => handleDelete(o.id)}
                                className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-all">
                                    <Trash2 size={18} />
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

          {/* Modal CRUD */}
          {isModalOpen && (
              <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
                          <h2 className="text-xl font-black text-primary uppercase tracking-tight font-headline">
                              {currentOrg ? 'Perbarui Data Ormawa' : 'Registrasi Ormawa Baru'}
                          </h2>
                          <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="p-8 space-y-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Nama Organisasi</label>
                              <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Contoh: BEM Fakultas Teknik"
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Kode SIngkat</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={formData.orgCode}
                                    onChange={(e) => setFormData({...formData, orgCode: e.target.value.toUpperCase()})}
                                    placeholder="ENG-BEM"
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Status</label>
                                  <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                  >
                                      <option value="Aktif">Aktif</option>
                                      <option value="Beku">Beku</option>
                                      <option value="Non-Aktif">Non-Aktif</option>
                                  </select>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Afiliasi Fakultas</label>
                              <select 
                                value={formData.facultyId}
                                onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                                className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                              >
                                  <option value="">LINGKUP UNIVERSITAS (PUSAT)</option>
                                  {faculties.map(f => (
                                      <option key={f.id} value={f.id}>{f.name}</option>
                                  ))}
                              </select>
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
                                className="flex-2 px-10 py-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all font-headline"
                              >
                                {currentOrg ? 'Simpan Perubahan' : 'Daftarkan Ormawa'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default KelolaOrganisasi;
