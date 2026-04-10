import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService, fakultasService } from '../../services/api';

const KelolaProdi = () => {
    const [prodis, setProdis] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProdi, setEditingProdi] = useState(null);
    const [formData, setFormData] = useState({ 
        Nama: '', Kode: '', Jenjang: 'S1', Akreditasi: 'B', 
        Kapasitas: 0, KepalaProdi: '', FakultasID: '' 
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [prodiRes, fakRes] = await Promise.all([
                adminService.getAllProdi(),
                fakultasService.getAll()
            ]);
            if (prodiRes.status === 'success') setProdis(prodiRes.data || []);
            if (fakRes.status === 'success') setFaculties(fakRes.data || []);
        } catch (error) {
            console.error('Audit Error Prodi:', error);
            // alert(`Sistem Audit: Gagal memuat data prodi. ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                FakultasID: parseInt(formData.FakultasID),
                Kapasitas: parseInt(formData.Kapasitas)
            };

            if (editingProdi) {
                await adminService.updateProdi(editingProdi.ID, data);
                // alert('Program Studi berhasil diperbarui');
            } else {
                await adminService.createProdi(data);
                // alert('Program Studi berhasil ditambahkan');
            }
            setIsModalOpen(false);
            setEditingProdi(null);
            setFormData({ Nama: '', Kode: '', Jenjang: 'S1', Akreditasi: 'B', Kapasitas: 0, KepalaProdi: '', FakultasID: '' });
            loadData();
        } catch (error) {
            alert('Gagal menyimpan data: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus prodi ini?')) return;
        try {
            await adminService.deleteProdi(id);
            // alert('Program Studi berhasil dihapus');
            loadData();
        } catch (error) {
            alert('Gagal menghapus data: ' + error.message);
        }
    };

    const openEditModal = (prodi) => {
        setEditingProdi(prodi);
        setFormData({ 
            Nama: prodi.Nama, 
            Kode: prodi.Kode, 
            Jenjang: prodi.Jenjang, 
            Akreditasi: prodi.Akreditasi, 
            Kapasitas: prodi.Kapasitas, 
            KepalaProdi: prodi.KepalaProdi,
            FakultasID: prodi.FakultasID 
        });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none ">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Manajemen Progam Studi</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90">Otoritas akademik untuk mengelola departemen dan kurikulum spesifik prodi.</p>
                </div>
                <button 
                    onClick={() => { setEditingProdi(null); setFormData({ Nama: '', Kode: '', Jenjang: 'S1', Akreditasi: 'B', Kapasitas: 0, KepalaProdi: '', FakultasID: '' }); setIsModalOpen(true); }}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all font-body"
                >
                    Tambah Prodi Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-2 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Program Studi</p>
                    <h3 className="text-4xl font-black text-primary ">{prodis.length.toString().padStart(2, '0')}</h3>
                 </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left font-body">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 border-b border-slate-100">
                      <th className="px-10 py-6">Nama Prodi</th>
                      <th className="px-10 py-6">Fakultas</th>
                      <th className="px-10 py-6 text-center">Jenjang</th>
                      <th className="px-10 py-6 text-center">Kapasitas</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body select-text text-sm">
                    {loading ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Memproses database...</td></tr>
                    ) : prodis.length === 0 ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Belum ada data prodi.</td></tr>
                    ) : prodis.map((p) => (
                      <tr key={p.ID} className="hover:bg-slate-50 transition-all group border-b border-slate-50">
                        <td className="px-10 py-6">
                           <div className="leading-tight">
                                <span className="font-extrabold text-primary uppercase tracking-tight group-hover:text-blue-700 transition-colors">{p.Nama}</span>
                                <p className="text-[10px] text-slate-400 font-black tracking-widest">KODE: {p.Kode}</p>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                            <span className="text-xs font-bold text-slate-600 uppercase italic opacity-70">
                                {p.Fakultas?.Nama || '-'}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                            <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-lg border border-primary/10 uppercase">
                                {p.Jenjang} - {p.Akreditasi}
                            </span>
                        </td>
                        <td className="px-10 py-6 text-center font-black text-primary opacity-60">{p.Kapasitas} Mhs</td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => openEditModal(p)}
                                    className="p-3 hover:bg-amber-50 rounded-xl text-amber-600 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.ID)}
                                    className="p-3 hover:bg-rose-50 rounded-xl text-rose-500 transition-all"
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 flex flex-col gap-8 animate-in zoom-in duration-300">
                      <header className="flex justify-between items-center">
                          <div>
                              <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{editingProdi ? 'Edit' : 'Tambah'} Program Studi</h2>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Struktur Akademik Terintegrasi</p>
                          </div>
                      </header>

                      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                          <div className="flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Fakultas Induk</label>
                              <select 
                                required
                                value={formData.FakultasID}
                                onChange={(e) => setFormData({...formData, FakultasID: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none"
                              >
                                  <option value="">Pilih Fakultas</option>
                                  {faculties.map(f => <option key={f.ID} value={f.ID}>{f.Nama}</option>)}
                              </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kode Prodi</label>
                              <input required value={formData.Kode} onChange={(e) => setFormData({...formData, Kode: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1.5 focus-within:ring-2 ring-primary/5 rounded-2xl transition-all">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Program Studi</label>
                              <input required value={formData.Nama} onChange={(e) => setFormData({...formData, Nama: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jenjang</label>
                              <select value={formData.Jenjang} onChange={(e) => setFormData({...formData, Jenjang: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold">
                                  <option value="D3">Diploma III</option>
                                  <option value="D4">Diploma IV</option>
                                  <option value="S1">Sarjana (S1)</option>
                                  <option value="S2">Magister (S2)</option>
                              </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Akreditasi</label>
                              <select value={formData.Akreditasi} onChange={(e) => setFormData({...formData, Akreditasi: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold">
                                  <option value="Unggul">Unggul</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                              </select>
                          </div>
                          <div className="col-span-2 flex gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                {editingProdi ? 'Simpan Perubahan' : 'Daftarkan Prodi'}
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

export default KelolaProdi;
