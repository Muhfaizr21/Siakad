import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService, fakultasService } from '../../services/api';

const StudentDirectory = () => {
    const [students, setStudents] = useState([]);
    const [fakultas, setFakultas] = useState([]);
    const [prodi, setProdi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [filterFakultas, setFilterFakultas] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [filterAngkatan, setFilterAngkatan] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [formData, setFormData] = useState({
        NIM: '', Nama: '', FakultasID: '', ProgramStudiID: '', TahunMasuk: new Date().getFullYear(), IPK: 0.0, StatusAkademik: 'Aktif'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mhsRes, fakRes, prodiRes] = await Promise.all([
                adminService.getAllStudents(),
                fakultasService.getAll(),
                adminService.getAllProdi()
            ]);
            
            if (mhsRes.status === 'success') setStudents(mhsRes.data || []);
            if (fakRes.status === 'success') setFakultas(fakRes.data || []);
            if (prodiRes.status === 'success') setProdi(prodiRes.data || []);
        } catch (error) {
            console.error('Gagal memuat data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Advanced Filtering Logic
    const filteredStudents = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return students.filter(s => {
            const matchSearch = s.Nama.toLowerCase().includes(query) || s.NIM.toLowerCase().includes(query);
            const matchFakultas = filterFakultas === '' || s.FakultasID === parseInt(filterFakultas);
            const matchProdi = filterProdi === '' || s.ProgramStudiID === parseInt(filterProdi);
            const matchAngkatan = filterAngkatan === '' || s.TahunMasuk === parseInt(filterAngkatan);
            
            return matchSearch && matchFakultas && matchProdi && matchAngkatan;
        });
    }, [students, searchQuery, filterFakultas, filterProdi, filterAngkatan]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStudents, currentPage, itemsPerPage]);

    // Derived Data for Filters
    const availableAngkatan = useMemo(() => {
        const years = students.map(s => s.TahunMasuk);
        return [...new Set(years)].sort((a, b) => b - a);
    }, [students]);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters or density change
    }, [searchQuery, filterFakultas, filterProdi, filterAngkatan, itemsPerPage]);

    const handleOpenModal = (student = null) => {
        if (student) {
            setCurrentStudent(student);
            setFormData({
                NIM: student.NIM, Nama: student.Nama, FakultasID: student.FakultasID, ProgramStudiID: student.ProgramStudiID,
                TahunMasuk: student.TahunMasuk, IPK: student.IPK, StatusAkademik: student.StatusAkademik
            });
        } else {
            setCurrentStudent(null);
            setFormData({ NIM: '', Nama: '', FakultasID: '', ProgramStudiID: '', TahunMasuk: new Date().getFullYear(), IPK: 0.0, StatusAkademik: 'Aktif' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData, FakultasID: parseInt(formData.FakultasID), ProgramStudiID: parseInt(formData.ProgramStudiID),
                TahunMasuk: parseInt(formData.TahunMasuk), IPK: parseFloat(formData.IPK) };

            if (currentStudent) await adminService.updateStudent(currentStudent.ID, data);
            else await adminService.createStudent(data);
            
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert('Gagal menyimpan data: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus data mahasiswa ini?')) {
            try { await adminService.deleteStudent(id); loadData(); }
            catch (error) { alert('Gagal menghapus: ' + error.message); }
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-6 font-body">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none italic">Student Registry</h1>
                  <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-[0.3em] opacity-80">Database Pusat: {students.length} Mahasiswa Terdaftar</p>
                </div>
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-body"
                >
                  Tambah Mahasiswa
                </button>
              </header>

              {/* Advanced Filtering Suite */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm font-body">
                  <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                          <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 pl-16 pr-6 py-4 rounded-2xl text-sm font-bold text-primary placeholder:text-slate-400 outline-none border border-transparent focus:border-primary/30 transition-all font-body" 
                            placeholder="Cari NIM atau Nama..." 
                          />
                      </div>
                      <div className="flex gap-3 font-body">
                          <select 
                            value={filterFakultas}
                            onChange={(e) => { setFilterFakultas(e.target.value); setFilterProdi(''); }}
                            className="bg-slate-50 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none border border-transparent focus:border-primary/30 min-w-[180px] font-body"
                          >
                              <option value="">Semua Fakultas</option>
                              {fakultas.map(f => <option key={f.ID} value={f.ID}>{f.Nama}</option>)}
                          </select>
                          <select 
                            value={filterProdi}
                            onChange={(e) => setFilterProdi(e.target.value)}
                            className="bg-slate-50 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none border border-transparent focus:border-primary/30 min-w-[180px] font-body"
                            disabled={!filterFakultas}
                          >
                              <option value="">Semua Prodi</option>
                              {prodi.filter(p => !filterFakultas || p.FakultasID === parseInt(filterFakultas)).map(p => (
                                  <option key={p.ID} value={p.ID}>{p.Nama}</option>
                              ))}
                          </select>
                          <select 
                            value={filterAngkatan}
                            onChange={(e) => setFilterAngkatan(e.target.value)}
                            className="bg-slate-50 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none border border-transparent focus:border-primary/30 font-body"
                          >
                              <option value="">Angkatan</option>
                              {availableAngkatan.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                      </div>
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm flex flex-col min-h-[600px] font-body relative">
                <table className="w-full text-left font-body">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100 leading-tight">
                      <th className="px-10 py-6">Profil Mahasiswa</th>
                      <th className="px-10 py-6">Unit / Program Studi</th>
                      <th className="px-10 py-6 text-center">Angkatan</th>
                      <th className="px-10 py-6 text-center">IPK</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-body select-text text-sm">
                    {loading ? (
                        <tr><td colSpan="6" className="px-10 py-32 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Mensinkronkan Database Pusat...</td></tr>
                    ) : paginatedStudents.length === 0 ? (
                        <tr><td colSpan="6" className="px-10 py-32 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px]">Data Tidak Ditemukan</td></tr>
                    ) : paginatedStudents.map((s) => (
                      <tr key={s.ID} className="hover:bg-slate-50/30 transition-all group font-body">
                        <td className="px-10 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner text-xs">
                                  {s.Nama[0]}
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="font-extrabold text-primary uppercase text-sm">{s.Nama}</span>
                                    <p className="text-[10px] text-slate-400 font-black tracking-widest mt-0.5">{s.NIM}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-5 leading-tight uppercase">
                            <p className="text-[9px] font-black text-slate-400 tracking-tight leading-tight truncate w-48">{s.Fakultas?.Nama || '-'}</p>
                            <p className="text-[11px] font-bold text-slate-600 leading-tight truncate w-48 mt-0.5">{s.ProgramStudi?.Nama || '-'}</p>
                        </td>
                        <td className="px-10 py-5 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200/50">
                                {s.TahunMasuk}
                            </span>
                        </td>
                        <td className="px-10 py-5 text-center font-black text-primary text-base">{s.IPK.toFixed(2)}</td>
                        <td className="px-10 py-5">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${s.StatusAkademik === 'Aktif' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${s.StatusAkademik === 'Aktif' ? 'text-emerald-700' : 'text-slate-400'}`}>{s.StatusAkademik}</span>
                            </div>
                        </td>
                        <td className="px-10 py-5 text-right">
                            <div className="flex justify-end gap-1 font-body">
                                <button onClick={() => handleOpenModal(s)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all font-body"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={() => handleDelete(s.ID)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all font-body"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                {!loading && (
                    <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center font-body">
                        <div className="flex items-center gap-6">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Halaman {currentPage} dari {totalPages || 1}</p>
                            <div className="h-4 w-[1px] bg-slate-200"></div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tampilkan:</span>
                                {[25, 50, 100].map(size => (
                                    <button 
                                      key={size}
                                      onClick={() => setItemsPerPage(size)}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${itemsPerPage === size ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-primary/30'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button 
                                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                  disabled={currentPage === 1}
                                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all font-body"
                                >
                                    Sebelumnya
                                </button>
                                <button 
                                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                  disabled={currentPage === totalPages}
                                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all font-body"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </div>
                )}
              </section>
            </div>
          </main>

          {/* Modal Components */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 font-body">
                <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20 font-body">
                    <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center font-body">
                        <div>
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic font-body">{currentStudent ? 'Edit Profil' : 'Daftar Baru'}</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic font-body">Registry Core v2.4</p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-white hover:shadow-lg flex items-center justify-center transition-all group font-body">
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-rose-500 transition-colors font-body">close</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-10 space-y-6 font-body">
                        <div className="grid grid-cols-2 gap-6 font-body">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-body">NIM / ID Mahasiswa</label>
                                <input required value={formData.NIM} onChange={(e) => setFormData({...formData, NIM: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body" placeholder="Contoh: 240001002" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 font-body">Nama Mahasiswa</label>
                                <input required value={formData.Nama} onChange={(e) => setFormData({...formData, Nama: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body" placeholder="Nama lengkap..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 font-body">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Fakultas Homebase</label>
                                <select required value={formData.FakultasID} onChange={(e) => setFormData({...formData, FakultasID: e.target.value, ProgramStudiID: ''})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body">
                                    <option value="">Pilih Fakultas</option>
                                    {fakultas.map(f => <option key={f.ID} value={f.ID}>{f.Nama}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Program Studi</label>
                                <select required value={formData.ProgramStudiID} onChange={(e) => setFormData({...formData, ProgramStudiID: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body">
                                    <option value="">Pilih Prodi</option>
                                    {prodi.filter(p => !formData.FakultasID || p.FakultasID == formData.FakultasID).map(p => ( <option key={p.ID} value={p.ID}>{p.Nama}</option> ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 font-body">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Angkatan</label>
                                <input type="number" required value={formData.TahunMasuk} onChange={(e) => setFormData({...formData, TahunMasuk: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">IPK Kumulatif</label>
                                <input type="number" step="0.01" min="0" max="4" required value={formData.IPK} onChange={(e) => setFormData({...formData, IPK: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status Akademik</label>
                                <select value={formData.StatusAkademik} onChange={(e) => setFormData({...formData, StatusAkademik: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-primary focus:bg-white focus:border-primary/30 outline-none transition-all font-body">
                                    <option value="Aktif">Aktif</option>
                                    <option value="Cuti">Cuti</option>
                                    <option value="Drop Out">Drop Out</option>
                                    <option value="Lulus">Lulus</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4 font-body">
                            <button type="submit" className="flex-1 bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all">
                                {currentStudent ? 'Simpan Perubahan' : 'Finalisasi Registrasi'}
                            </button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-slate-100 text-slate-500 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-body">Batal</button>
                        </div>
                    </form>
                </div>
            </div>
          )}
        </div>
    )
}

export default StudentDirectory;
