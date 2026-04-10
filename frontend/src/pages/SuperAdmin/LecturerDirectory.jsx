import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const LecturerDirectory = () => {
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [filterFakultas, setFilterFakultas] = useState('');
    const [filterProdi, setFilterProdi] = useState('');

    // Form & Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLec, setEditingLec] = useState(null);
    const [formData, setFormData] = useState({
        Nama: '', NIDN: '', Jabatan: '', FakultasID: '', ProgramStudiID: ''
    });
    const [faculties, setFaculties] = useState([]);
    const [prodis, setProdis] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getAllLecturers();
            const rawData = res.data || (Array.isArray(res) ? res : []);
            
            if (rawData && Array.isArray(rawData)) {
                setLecturers(rawData);
            } else {
                setError("Format data dari server tidak didukung.");
            }

            const [fakRes, proRes] = await Promise.all([
                adminService.getAllFaculties(),
                adminService.getAllProdi()
            ]);
            
            if (fakRes.data) setFaculties(fakRes.data);
            if (proRes.data) setProdis(proRes.data);
        } catch (err) {
            setError(`Koneksi Gagal: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Advanced Filtering Logic
    const filteredLecturers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return lecturers.filter(l => {
            const matchSearch = (l.Nama || '').toLowerCase().includes(query) || (l.NIDN || '').toLowerCase().includes(query);
            const matchFakultas = filterFakultas === '' || l.FakultasID === parseInt(filterFakultas);
            const matchProdi = filterProdi === '' || l.ProgramStudiID === parseInt(filterProdi);
            return matchSearch && matchFakultas && matchProdi;
        });
    }, [lecturers, searchQuery, filterFakultas, filterProdi]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredLecturers.length / itemsPerPage);
    const paginatedLecturers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLecturers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLecturers, currentPage, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1); // Reset page on filter change
    }, [searchQuery, filterFakultas, filterProdi, itemsPerPage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...formData, FakultasID: parseInt(formData.FakultasID), ProgramStudiID: parseInt(formData.ProgramStudiID) };
            if (editingLec) await adminService.updateLecturer(editingLec.ID, data);
            else await adminService.createLecturer(data);
            setIsModalOpen(false);
            loadData();
        } catch (err) { alert('Gagal: ' + err.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus dosen ini?')) return;
        try { await adminService.deleteLecturer(id); loadData(); }
        catch (err) { alert('Gagal: ' + err.message); }
    };

    const openEditModal = (lec) => {
        setEditingLec(lec);
        setFormData({ Nama: lec.Nama || '', NIDN: lec.NIDN || '', Jabatan: lec.Jabatan || '', FakultasID: lec.FakultasID || '', ProgramStudiID: lec.ProgramStudiID || '' });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-6 font-body">
              <header className="flex justify-between items-end font-body">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none italic">Lecturer Registry</h1>
                  <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-[0.3em] opacity-80 italic">Otoritas Pendidik: {lecturers.length} Orang Terdaftar</p>
                </div>
                <button 
                  onClick={() => { setEditingLec(null); setFormData({ Nama: '', NIDN: '', Jabatan: '', FakultasID: '', ProgramStudiID: '' }); setIsModalOpen(true); }}
                  className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-body"
                >
                  Tambah Tenaga Pendidik
                </button>
              </header>

              {/* Filtering Controls */}
              <div className="flex flex-col gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm font-body">
                  <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary">search</span>
                          <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 pl-16 pr-6 py-4 rounded-2xl text-sm font-bold text-primary placeholder:text-slate-400 outline-none border border-transparent focus:border-primary/30 transition-all" 
                            placeholder="Cari NIDN atau Nama Dosen..." 
                          />
                      </div>
                      <div className="flex gap-3">
                          <select 
                            value={filterFakultas}
                            onChange={(e) => { setFilterFakultas(e.target.value); setFilterProdi(''); }}
                            className="bg-slate-50 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none border border-transparent focus:border-primary/30 min-w-[180px]"
                          >
                              <option value="">Semua Fakultas</option>
                              {faculties.map(f => <option key={f.ID} value={f.ID}>{f.Nama}</option>)}
                          </select>
                          <select 
                            value={filterProdi}
                            onChange={(e) => setFilterProdi(e.target.value)}
                            className="bg-slate-50 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none border border-transparent focus:border-primary/30 min-w-[180px]"
                            disabled={!filterFakultas}
                          >
                              <option value="">Semua Prodi</option>
                              {prodis.filter(p => !filterFakultas || p.FakultasID === parseInt(filterFakultas)).map(p => ( <option key={p.ID} value={p.ID}>{p.Nama}</option> ))}
                          </select>
                      </div>
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm font-body min-h-[500px] flex flex-col relative">
                 {error ? (
                     <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
                        <span className="material-symbols-outlined text-rose-300 text-6xl">cloud_off</span>
                        <p className="text-rose-500 font-bold uppercase text-[10px] tracking-widest">{error}</p>
                        <button onClick={loadData} className="px-6 py-2 bg-slate-100 text-primary font-black text-[10px] rounded-full uppercase hover:bg-primary hover:text-white transition-all">Retry</button>
                     </div>
                 ) : loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 gap-4">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Syncing Registry...</p>
                    </div>
                 ) : (
                    <>
                    <table className="w-full text-left font-body">
                      <thead>
                        <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-100 italic">
                          <th className="px-10 py-6">Profil Pendidik</th>
                          <th className="px-10 py-6 text-center">NIDN</th>
                          <th className="px-10 py-6">Unit Homebase</th>
                          <th className="px-10 py-6">Status Sistem</th>
                          <th className="px-10 py-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-body select-text">
                        {paginatedLecturers.map((l) => (
                          <tr key={l.ID} className="hover:bg-slate-50/30 transition-all group">
                            <td className="px-10 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner text-xs uppercase">
                                      {l.Nama ? l.Nama[0] : '?'}
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase text-sm">{l.Nama}</span>
                                        <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-0.5 italic">{l.Jabatan || 'Lecturer'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-10 py-5 text-center">
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200/50">
                                    {l.NIDN}
                                </span>
                            </td>
                            <td className="px-10 py-5 leading-tight uppercase font-body">
                                 <p className="text-[11px] font-bold text-slate-600 truncate w-48">{l.ProgramStudi?.Nama || '-'}</p>
                                 <p className="text-[9px] text-slate-400 font-black mt-0.5 truncate w-48 opacity-70 tracking-tight">{l.Fakultas?.Nama || '-'}</p>
                            </td>
                            <td className="px-10 py-5 font-body">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-emerald-700`}>Terverifikasi</span>
                                </div>
                            </td>
                            <td className="px-10 py-5 text-right font-body">
                               <div className="flex justify-end gap-1 font-body">
                                    <button onClick={() => openEditModal(l)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                    <button onClick={() => handleDelete(l.ID)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination Suite */}
                    <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center font-body">
                        <div className="flex items-center gap-6">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Halaman {currentPage} dari {totalPages || 1}</p>
                            <div className="h-4 w-[1px] bg-slate-200"></div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Baris:</span>
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
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-30 transition-all">Sebelumnya</button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary disabled:opacity-30 transition-all">Berikutnya</button>
                            </div>
                        )}
                    </div>
                    </>
                 )}
              </section>
            </div>
          </main>

          {/* Modal Form */}
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 flex flex-col gap-8 animate-in zoom-in duration-300 border border-white/20 font-body">
                      <header>
                          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter leading-none italic">{editingLec ? 'Update Profil' : 'Daftar Pendidik Baru'}</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Faculty Registry v2.4</p>
                      </header>

                      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 font-body">
                          <div className="col-span-2 flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Lengkap & Gelar</label>
                              <input required value={formData.Nama} onChange={(e) => setFormData({...formData, Nama: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:bg-white focus:border-primary/30 transition-all outline-none italic" placeholder="Contoh: Dr. Budi Santoso, M.Kom" />
                          </div>
                          <div className="flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">NIDN / ID Dosen</label>
                              <input required value={formData.NIDN} onChange={(e) => setFormData({...formData, NIDN: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:bg-white focus:border-primary/30 outline-none" placeholder="Nomor Induk Dosen..." />
                          </div>
                          <div className="flex flex-col gap-1.5 label-input font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jabatan Akademik</label>
                              <input value={formData.Jabatan} onChange={(e) => setFormData({...formData, Jabatan: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:bg-white focus:border-primary/30 outline-none" placeholder="Contoh: Lektor Kepala" />
                          </div>
                          <div className="flex flex-col gap-1.5 label-input font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fakultas Homebase</label>
                              <select required value={formData.FakultasID} onChange={(e) => setFormData({...formData, FakultasID: e.target.value, ProgramStudiID: ''})} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:bg-white focus:border-primary/30 outline-none">
                                  <option value="">Pilih Fakultas</option>
                                  {faculties.map(f => <option key={f.ID} value={f.ID}>{f.Nama}</option>)}
                              </select>
                          </div>
                          <div className="flex flex-col gap-1.5 label-input font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Program Studi</label>
                              <select required value={formData.ProgramStudiID} onChange={(e) => setFormData({...formData, ProgramStudiID: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:bg-white focus:border-primary/30 outline-none">
                                  <option value="">Pilih Program Studi</option>
                                  {prodis.filter(p => !formData.FakultasID || p.FakultasID == formData.FakultasID).map(p => ( <option key={p.ID} value={p.ID}>{p.Nama}</option> ))}
                              </select>
                          </div>
                          <div className="col-span-2 flex gap-4 pt-6 font-body">
                            <button type="submit" className="flex-1 bg-primary text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all">
                                {editingLec ? 'Simpan Perubahan' : 'Daftarkan Pendidik'}
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

export default LecturerDirectory;
