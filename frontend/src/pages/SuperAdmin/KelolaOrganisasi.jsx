import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const KelolaOrganisasi = () => {
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [formData, setFormData] = useState({ 
        Nama: '', Jenis: 'UKM', Deskripsi: '', Email: '', 
        Visi: '', Misi: '', Logo: '' 
    });

    useEffect(() => {
        loadOrgs();
    }, []);

    const loadOrgs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllOrmawa();
            if (res.status === 'success') {
                setOrgs(res.data || []);
            }
        } catch (error) {
            console.error('Gagal memuat data ormawa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingOrg) {
                await adminService.updateOrmawa(editingOrg.ID, formData);
                // alert('Ormawa berhasil diperbarui');
            } else {
                await adminService.createOrmawa(formData);
                // alert('Ormawa berhasil didaftarkan');
            }
            setIsModalOpen(false);
            setEditingOrg(null);
            setFormData({ Nama: '', Jenis: 'UKM', Deskripsi: '', Email: '', Visi: '', Misi: '', Logo: '' });
            loadOrgs();
        } catch (error) {
            alert('Gagal menyimpan data: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus ormawa ini? Seluruh data terkait akan hilang.')) return;
        try {
            await adminService.deleteOrmawa(id);
            loadOrgs();
        } catch (error) {
            alert('Gagal menghapus data: ' + error.message);
        }
    };

    const openEditModal = (org) => {
        setEditingOrg(org);
        setFormData({ 
            Nama: org.Nama, 
            Jenis: org.Jenis, 
            Deskripsi: org.Deskripsi, 
            Email: org.Email, 
            Visi: org.Visi, 
            Misi: org.Misi, 
            Logo: org.Logo 
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
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Registri & Legalitas Ormawa</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90">Otoritas pusat untuk pendaftaran, pembekuan, dan monitoring kepengurusan ORMAWA.</p>
                </div>
                <button 
                    onClick={() => { setEditingOrg(null); setFormData({ Nama: '', Jenis: 'UKM', Deskripsi: '', Email: '', Visi: '', Misi: '', Logo: '' }); setIsModalOpen(true); }}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all font-body"
                >
                    Registrasi Ormawa Baru
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start font-body">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 space-y-2 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Total Ormawa Terdaftar</p>
                      <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">{loading ? '...' : orgs.length.toString().padStart(2, '0')} Unit</h3>
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left font-body">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 leading-tight border-b border-slate-100">
                      <th className="px-10 py-6">Nama Organisasi</th>
                      <th className="px-10 py-6">Tipe Unit</th>
                      <th className="px-10 py-6">Fokus Bidang</th>
                      <th className="px-10 py-6">Anggota</th>
                      <th className="px-10 py-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body select-text">
                    {loading ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Mensinkronkan registri...</td></tr>
                    ) : orgs.length === 0 ? (
                        <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Belum ada ormawa terdaftar.</td></tr>
                    ) : orgs.map((o) => (
                      <tr key={o.ID} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                                    {o.Logo ? <img src={o.Logo} alt="" className="w-full h-full object-cover rounded-xl" /> : o.Nama.charAt(0)}
                                </div>
                                <span className="font-extrabold text-primary uppercase tracking-tight group-hover:text-blue-700 transition-colors leading-tight">{o.Nama}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                             <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">
                                {o.Jenis}
                             </span>
                        </td>
                        <td className="px-10 py-6 text-sm font-bold text-slate-600 truncate max-w-xs">{o.Deskripsi || '-'}</td>
                        <td className="px-10 py-6 text-xs font-black text-slate-400 italic">
                            {o.Anggota?.length || 0} Mahasiswa
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => openEditModal(o)}
                                    className="p-3 hover:bg-amber-50 rounded-xl text-amber-600 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(o.ID)}
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-body">
                  <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-12 flex flex-col gap-8 animate-in zoom-in duration-300">
                      <header>
                          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{editingOrg ? 'Edit' : 'Registrasi'} ORMAWA</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Entitas Organisasi Terverifikasi</p>
                      </header>

                      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Organisasi Mahasiswa</label>
                              <input 
                                required
                                value={formData.Nama}
                                onChange={(e) => setFormData({...formData, Nama: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                                placeholder="Himpunan Mahasiswa..."
                              />
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tipe Organisasi</label>
                              <select 
                                value={formData.Jenis}
                                onChange={(e) => setFormData({...formData, Jenis: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none"
                              >
                                  <option value="UKM">Unit Kegiatan Mahasiswa (UKM)</option>
                                  <option value="Hima">Himpunan Mahasiswa (Hima)</option>
                                  <option value="BEM">Badan Eksekutif Mahasiswa (BEM)</option>
                              </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Official</label>
                              <input 
                                value={formData.Email}
                                onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                                placeholder="ormawa@univ.ac.id"
                              />
                          </div>
                          <div className="col-span-2 flex flex-col gap-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Deskripsi & Fokus</label>
                              <textarea 
                                value={formData.Deskripsi}
                                onChange={(e) => setFormData({...formData, Deskripsi: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none min-h-[80px]" 
                                placeholder="Jelaskan fokus dan kegiatan utama organisasi..."
                              />
                          </div>
                          <div className="col-span-2 flex gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                {editingOrg ? 'Simpan Perubahan' : 'Daftarkan Ormawa'}
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

export default KelolaOrganisasi;
