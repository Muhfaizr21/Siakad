import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Search, Plus, Edit2, Trash2, X, UserCheck } from 'lucide-react';

const LecturerDirectory = () => {
    const [lecturers, setLecturers] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLecturer, setCurrentLecturer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nidn: '',
        facultyId: '',
        majorId: '',
        jabatan: 'Dosen',
        email: '' // Required for new lecturer user account
    });

    useEffect(() => {
        fetchLecturers();
        fetchFaculties();
        fetchMajors();
    }, []);

    const fetchLecturers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/super/lecturers');
            setLecturers(response.data.data);
        } catch (error) {
            console.error('Error fetching lecturers:', error);
            toast.error('Gagal mengambil data dosen');
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

    const fetchMajors = async () => {
        try {
            const response = await api.get('/admin/super/majors');
            setMajors(response.data.data);
        } catch (error) {
            console.error('Error fetching majors:', error);
        }
    };

    const handleOpenModal = (lecturer = null) => {
        if (lecturer) {
            setCurrentLecturer(lecturer);
            setFormData({
                name: lecturer.name,
                nidn: lecturer.nidn,
                facultyId: lecturer.facultyId,
                majorId: lecturer.majorId,
                jabatan: lecturer.jabatan || 'Dosen',
                email: lecturer.user?.email || ''
            });
        } else {
            setCurrentLecturer(null);
            setFormData({
                name: '',
                nidn: '',
                facultyId: faculties.length > 0 ? faculties[0].id : '',
                majorId: '',
                jabatan: 'Dosen',
                email: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                facultyId: parseInt(formData.facultyId),
                majorId: formData.majorId ? parseInt(formData.majorId) : null
            };

            if (currentLecturer) {
                await api.put(`/admin/super/lecturers/${currentLecturer.id}`, payload);
                toast.success('Data dosen diperbarui');
            } else {
                if (!payload.email) {
                    toast.error('Email wajib diisi untuk pendaftaran dosen baru');
                    return;
                }
                await api.post('/admin/super/lecturers', payload);
                toast.success('Dosen berhasil didaftarkan');
            }
            setIsModalOpen(false);
            fetchLecturers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus data dosen ini secara permanen?')) {
            try {
                await api.delete(`/admin/super/lecturers/${id}`);
                toast.success('Data dosen dihapus');
                fetchLecturers();
            } catch (error) {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const filteredLecturers = lecturers.filter(l => 
        (l.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (l.nidn || '').includes(searchTerm) ||
        (l.faculty?.name && l.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="lg:ml-80 ml-0 flex flex-col min-h-screen w-full transition-all duration-300">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase tracking-widest leading-none">Database Induk Dosen</h1>
                  <p className="text-[11px] text-secondary mt-1 font-bold uppercase tracking-widest opacity-70">Otoritas Pusat Tenaga Pendidik & Peneliti</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={fetchLecturers}
                        className="p-3 bg-white border border-outline-variant/30 text-primary rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                        title="Segarkan Data"
                    >
                        <Loader2 size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Daftarkan Dosen
                    </button>
                </div>
              </header>

              <div className="bg-white p-2 rounded-[2.5rem] border border-outline-variant/30 flex shadow-lg hover:border-primary/50 transition-all">
                  <div className="relative flex-1">
                      <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-primary" size={24} />
                      <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white pl-20 pr-10 py-6 rounded-[2rem] text-xl font-bold text-primary placeholder:text-secondary/30 outline-none" 
                        placeholder="Cari berdasarkan NIDN, Nama, atau Unit Fakultas..." 
                      />
                  </div>
              </div>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                )}
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 border-b border-outline-variant/10">
                      <th className="px-10 py-6">Profil Pendidik</th>
                      <th className="px-10 py-6 text-center">NIDN</th>
                      <th className="px-10 py-6">Unit Homebase</th>
                      <th className="px-10 py-6">Jabatan Akademik</th>
                      <th className="px-10 py-6 text-right">Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text text-sm">
                    {!loading && filteredLecturers.length === 0 ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center font-bold text-slate-400">Tidak ada data dosen ditemukan.</td></tr>
                    ) : filteredLecturers.map((lecturer) => (
                      <tr key={lecturer.id} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-black shadow-sm ring-1 ring-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                  {lecturer.name ? lecturer.name[0] : '?'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors tracking-tight uppercase leading-tight">{lecturer.name}</span>
                                    <span className="text-[10px] text-secondary/60 font-black tracking-widest uppercase ">{lecturer.faculty?.name || 'UMUM'}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <span className="px-4 py-1.5 bg-slate-50 text-secondary text-xs font-black rounded-lg border border-outline-variant/10">
                                {lecturer.nidn || '-'}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-sm text-secondary font-bold font-headline uppercase tracking-tight">
                            {lecturer.major?.name || 'FAKULTAS'}
                        </td>
                        <td className="px-10 py-6">
                            <span className="text-xs font-bold text-primary uppercase tracking-widest ">{lecturer.jabatan || 'Dosen'}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                               <button 
                                onClick={() => handleOpenModal(lecturer)}
                                className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                    <Edit2 size={18} />
                                </button>
                               <button 
                                onClick={() => handleDelete(lecturer.id)}
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

          {/* Modal CRUD Dosen */}
          {isModalOpen && (
              <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
                          <h2 className="text-xl font-black text-primary uppercase tracking-tight font-headline">
                              {currentLecturer ? 'Perbarui Data Dosen' : 'Registrasi Dosen Baru'}
                          </h2>
                          <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="p-8 space-y-6">
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Nama Lengkap & Gelar</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Contoh: Dr. John Doe, M.T."
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">NIDN</label>
                                      <input 
                                        required
                                        type="text" 
                                        value={formData.nidn}
                                        onChange={(e) => setFormData({...formData, nidn: e.target.value})}
                                        placeholder="0011223344"
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Jabatan</label>
                                      <select 
                                        value={formData.jabatan}
                                        onChange={(e) => setFormData({...formData, jabatan: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      >
                                          <option value="Dosen">Dosen</option>
                                          <option value="Asisten Ahli">Asisten Ahli</option>
                                          <option value="Lektor">Lektor</option>
                                          <option value="Lektor Kepala">Lektor Kepala</option>
                                          <option value="Guru Besar">Guru Besar</option>
                                      </select>
                                  </div>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Email Institusi (Login)</label>
                                  <input 
                                    required={!currentLecturer}
                                    disabled={!!currentLecturer}
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="nama@bku.ac.id"
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary disabled:opacity-50"
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Fakultas</label>
                                    <select 
                                        required
                                        value={formData.facultyId}
                                        onChange={(e) => setFormData({...formData, facultyId: e.target.value, majorId: ''})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                    >
                                        <option value="">Pilih Fakultas</option>
                                        {faculties.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Program Studi</label>
                                    <select 
                                        value={formData.majorId}
                                        onChange={(e) => setFormData({...formData, majorId: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                    >
                                        <option value="">Pilih Prodi (Opsional)</option>
                                        {majors.filter(m => m.facultyId == formData.facultyId).map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
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
                                className="flex-2 px-10 py-4 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all font-headline"
                              >
                                {currentLecturer ? 'Simpan Perubahan' : 'Daftarkan Dosen'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default LecturerDirectory;
