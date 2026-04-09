import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, Search, Plus, Edit2, Trash2, X } from 'lucide-react';

const StudentDirectory = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [majors, setMajors] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        nim: '',
        majorId: '',
        entryYear: new Date().getFullYear(),
        gpa: 0.0,
        status: 'Aktif'
    });

    useEffect(() => {
        fetchStudents();
        fetchMajors();
        fetchFaculties();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/super/students');
            if (response.data.status === 'success') {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Gagal mengambil data mahasiswa');
        } finally {
            setLoading(false);
        }
    };

    const fetchMajors = async () => {
        try {
            const response = await api.get('/admin/super/majors');
            if (response.data.status === 'success') {
                setMajors(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching majors:', error);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/admin/super/faculties');
            if (response.data.status === 'success') {
                setFaculties(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching faculties:', error);
        }
    };

    const handleOpenModal = (student = null) => {
        if (student) {
            setCurrentStudent(student);
            // Pre-select faculty based on student's major
            const facultyId = student.major?.facultyId || '';
            setSelectedFacultyId(facultyId);
            
            setFormData({
                name: student.name,
                nim: student.nim,
                majorId: student.majorId || '',
                entryYear: student.entryYear || 2024,
                gpa: student.gpa || 0.0,
                status: student.status || 'Aktif'
            });
        } else {
            setCurrentStudent(null);
            setSelectedFacultyId('');
            setFormData({
                name: '',
                nim: '',
                majorId: '',
                entryYear: 2024,
                gpa: 0.0,
                status: 'Aktif'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.majorId) {
                toast.error('Pilih Program Studi terlebih dahulu');
                return;
            }

            const payload = {
                ...formData,
                majorId: parseInt(formData.majorId),
                entryYear: parseInt(formData.entryYear),
                gpa: parseFloat(formData.gpa)
            };

            if (currentStudent) {
                await api.put(`/admin/super/students/${currentStudent.id}`, payload);
                toast.success('Data mahasiswa diperbarui');
            } else {
                await api.post('/admin/super/students', payload);
                toast.success('Mahasiswa berhasil didaftarkan');
            }
            setIsModalOpen(false);
            fetchStudents();
        } catch (error) {
            const msg = error.response?.data?.message || 'Gagal menyimpan data';
            toast.error(msg);
            console.error('Save error:', error.response?.data);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus data mahasiswa ini secara permanen?')) {
            try {
                await api.delete(`/admin/super/students/${id}`);
                toast.success('Data dihapus');
                fetchStudents();
            } catch (error) {
                toast.error('Gagal menghapus data');
            }
        }
    };

    const filteredStudents = students.filter(s => 
        (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.nim || '').includes(searchTerm) ||
        (s.major?.name && s.major.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none ">
          <Sidebar />
          <main className="lg:ml-80 ml-0 flex flex-col min-h-screen w-full transition-all duration-300">
            <TopNavBar />
            <div className="p-8 space-y-8 ">
              <header className="flex justify-between items-center ">
                <div className=" leading-tight">
                  <h1 className="text-3xl font-extrabold text-primary tracking-tighter uppercase tracking-widest leading-none ">Database Mahasiswa</h1>
                  <p className="text-[10px] text-slate-600 mt-1 font-bold uppercase tracking-widest leading-tight opacity-90">Otoritas {students.length} Catatan Terpusat</p>
                </div>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <Plus size={16} />
                    Tambah Mahasiswa
                </button>
              </header>

              <div className="bg-white p-1.5 rounded-[2.5rem] border border-slate-200 flex shadow-sm font-body transition-all focus-within:border-primary/50">
                  <div className="relative flex-1 ">
                      <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                      <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white pl-20 pr-10 py-6 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-500 outline-none font-body" 
                        placeholder="Cari berdasarkan NIM, Nama, atau Angkatan Mahasiswa..." 
                      />
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm font-body min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                )}
                <table className="w-full text-left font-body">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-slate-100 leading-tight">
                      <th className="px-10 py-6">Profil Mahasiswa</th>
                      <th className="px-10 py-6">Unit / Prodi</th>
                      <th className="px-10 py-6 text-center">Angkatan</th>
                      <th className="px-10 py-6 text-center">IPK</th>
                      <th className="px-10 py-6 text-center">Status</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body select-text text-sm">
                    {!loading && filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-all group font-body">
                        <td className="px-10 py-6 ">
                            <div className="flex items-center gap-5 leading-tight">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary/10 transition-colors shadow-inner ">
                                  {s.name ? s.name[0] : '?'}
                                </div>
                                <div className=" leading-tight">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase leading-tight">{s.name}</span>
                                    <p className="text-[10px] text-slate-600 font-black tracking-widest ">{s.nim}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6  leading-tight uppercase ">
                            <p className="text-[10px] font-black text-slate-600 opacity-80 tracking-tight leading-tight">{s.major?.faculty?.name || 'UNIVERSITAS'}</p>
                            <p className="text-sm font-bold text-primary leading-tight ">{s.major?.name || 'N/A'}</p>
                        </td>
                        <td className="px-10 py-6 text-center ">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-black rounded-lg border border-slate-200">
                                {s.entryYear || '-'}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-center font-black text-[#0056B3] text-lg leading-none ">{s.gpa?.toFixed(2) || '0.00'}</td>
                        <td className="px-10 py-6">
                            <div className="flex items-center justify-center gap-2.5 ">
                                <div className={`w-2 h-2 rounded-full ${s.status === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${s.status === 'Aktif' ? 'text-emerald-700' : 'text-slate-600'}`}>{s.status}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleOpenModal(s)}
                                    className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-all"
                                >
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
                              {currentStudent ? 'Perbarui Profil Mahasiswa' : 'Registrasi Mahasiswa Baru'}
                          </h2>
                          <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="p-8 space-y-6">
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Nama Mahasiswa</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">NIM</label>
                                      <input 
                                        required
                                        type="text" 
                                        value={formData.nim}
                                        onChange={(e) => setFormData({...formData, nim: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Angkatan</label>
                                      <input 
                                        required
                                        type="number" 
                                        value={formData.entryYear}
                                        onChange={(e) => setFormData({...formData, entryYear: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      />
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Fakultas</label>
                                      <select 
                                        required
                                        value={selectedFacultyId}
                                        onChange={(e) => {
                                            setSelectedFacultyId(e.target.value);
                                            setFormData({...formData, majorId: ''}); // Reset major selection
                                        }}
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
                                        required
                                        disabled={!selectedFacultyId}
                                        value={formData.majorId}
                                        onChange={(e) => setFormData({...formData, majorId: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary disabled:opacity-50"
                                      >
                                          <option value="">Pilih Program Studi</option>
                                          {majors
                                            .filter(m => !selectedFacultyId || m.facultyId === parseInt(selectedFacultyId))
                                            .map(m => (
                                              <option key={m.id} value={m.id}>
                                                  {m.name}
                                              </option>
                                          ))}
                                      </select>
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">GPA / IPK</label>
                                      <input 
                                        required
                                        type="number" 
                                        step="0.01"
                                        value={formData.gpa}
                                        onChange={(e) => setFormData({...formData, gpa: e.target.value})}
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
                                          <option value="Lulus">Lulus</option>
                                          <option value="Drop Out">Drop Out</option>
                                          <option value="Cuti">Cuti</option>
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
                                {currentStudent ? 'Simpan Perubahan' : 'Daftarkan Mahasiswa'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default StudentDirectory;
