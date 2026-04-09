import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Plus, Edit2, Trash2, X, School, Search, Filter } from 'lucide-react';

const KelolaProdi = () => {
    const [majors, setMajors] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMajor, setCurrentMajor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFaculty, setFilterFaculty] = useState('all');
    
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        facultyId: '',
        degree: 'S1',
        is_active: true
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [majorsRes, facultiesRes] = await Promise.all([
                api.get('/admin/super/majors'),
                api.get('/admin/super/faculties')
            ]);
            setMajors(majorsRes.data.data);
            setFaculties(facultiesRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal mengambil data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (major = null) => {
        if (major) {
            setCurrentMajor(major);
            setFormData({
                name: major.nama_prodi || major.name,
                code: major.kode_prodi || major.code,
                facultyId: major.fakultas_id || major.facultyId,
                degree: major.jenjang || major.degreeLevel || 'S1',
                active: major.is_active !== false
            });
        } else {
            setCurrentMajor(null);
            setFormData({
                name: '',
                code: '',
                facultyId: '',
                degree: 'S1',
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                facultyId: parseInt(formData.facultyId),
                degreeLevel: formData.degree,
                is_active: formData.active
            };

            if (currentMajor) {
                await api.put(`/admin/super/majors/${currentMajor.id}`, payload);
                toast.success('Program studi berhasil diperbarui');
            } else {
                await api.post('/admin/super/majors', payload);
                toast.success('Program studi berhasil ditambahkan');
            }
            setIsModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus program studi ini?')) {
            try {
                await api.delete(`/admin/super/majors/${id}`);
                toast.success('Program studi berhasil dihapus');
                fetchInitialData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Gagal menghapus');
            }
        }
    };

    const filteredMajors = majors.filter(m => {
        const matchesSearch = (m.nama_prodi || m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (m.kode_prodi || m.code || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFaculty = filterFaculty === 'all' || (m.fakultas_id || m.facultyId).toString() === filterFaculty;
        return matchesSearch && matchesFaculty;
    });

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
            <Sidebar />
            <main className="pl-80 flex flex-col min-h-screen w-full">
                <TopNavBar />
                <div className="p-8 space-y-8">
                    <header className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase leading-none">Manajemen Program Studi</h1>
                            <p className="text-secondary mt-2 font-medium">Otoritas pusat untuk mengelola kurikulum dan unit program studi di seluruh fakultas.</p>
                        </div>
                        <button 
                            onClick={() => handleOpenModal()}
                            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Tambah Prodi Baru
                        </button>
                    </header>

                    {/* Stats summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Total Unit Prodi</p>
                            <h3 className="text-4xl font-black text-primary">{majors.length.toString().padStart(2, '0')}</h3>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-70">Rata-rata per Fakultas</p>
                            <h3 className="text-4xl font-black text-primary">
                                {faculties.length > 0 ? (majors.length / faculties.length).toFixed(1) : '0'}
                            </h3>
                        </div>
                    </div>

                    {/* Controls & Filter */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-outline-variant/30 flex flex-wrap gap-4 items-center">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
                            <input 
                                type="text"
                                placeholder="Cari nama atau kode prodi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant/10">
                            <Filter size={18} className="text-secondary/40" />
                            <select 
                                value={filterFaculty}
                                onChange={(e) => setFilterFaculty(e.target.value)}
                                className="bg-transparent border-none outline-none font-black text-xs uppercase tracking-widest text-primary cursor-pointer"
                            >
                                <option value="all">Semua Fakultas</option>
                                {faculties.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
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
                                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70">
                                        <th className="px-10 py-6">Program Studi</th>
                                        <th className="px-10 py-6 text-center">Jenjang</th>
                                        <th className="px-10 py-6">Afiliasi Fakultas</th>
                                        <th className="px-10 py-6 text-center">Status</th>
                                        <th className="px-10 py-6 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                                    {filteredMajors.map((m) => (
                                        <tr key={m.id} className="hover:bg-primary/[0.01] transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-primary uppercase tracking-tight leading-tight">{m.nama_prodi || m.name}</span>
                                                    <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mt-1">{m.kode_prodi || m.code || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <span className="px-3 py-1 bg-slate-100 text-secondary text-xs font-black rounded-lg border border-outline-variant/10">
                                                    {m.jenjang || 'S1'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-sm font-bold text-secondary uppercase tracking-tighter">
                                                {m.Faculty?.name || m.fakultas_name || 'Non-Fakultas'}
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex items-center justify-center gap-2.5">
                                                    <div className={`w-2 h-2 rounded-full ${m.is_active !== false ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${m.is_active !== false ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                        {m.is_active !== false ? 'Aktif' : 'Non-Aktif'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleOpenModal(m)}
                                                        className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all group/edit"
                                                    >
                                                        <Edit2 size={18} className="group-hover/edit:scale-110 transition-transform" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(m.id)}
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
                                {currentMajor ? 'Edit Program Studi' : 'Tambah Prodi Baru'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Nama Program Studi</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Contoh: Teknik Informatika"
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Kode Prodi</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Jenjang</label>
                                    <select 
                                        value={formData.degree}
                                        onChange={(e) => setFormData({...formData, degree: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                                    >
                                        <option value="D3">D3</option>
                                        <option value="S1">S1</option>
                                        <option value="S2">S2</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Fakultas Naungan</label>
                                <select 
                                    required
                                    value={formData.facultyId}
                                    onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-bold text-primary"
                                >
                                    <option value="">Pilih Fakultas...</option>
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
                                    {currentMajor ? 'Simpan Perubahan' : 'Daftarkan Prodi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KelolaProdi;
