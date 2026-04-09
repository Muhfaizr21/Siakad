import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast, { Toaster } from 'react-hot-toast';

const KelolaBeasiswa = () => {
    const [scholarships, setScholarships] = useState([]);
    const [applications, setApplications] = useState([]);
    const [summary, setSummary] = useState({ totalPrograms: 0, totalApplicants: 0, totalAccepted: 0, totalQuota: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('programs'); // 'programs' or 'applications'
    const [showModal, setShowModal] = useState(false);
    const [showAppModal, setShowAppModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form, setForm] = useState({
        name: '', provider: '', description: '', minGpa: 3.0, quota: 0, deadline: '', status: 'buka'
    });
    const [appForm, setAppForm] = useState({
        status: '', notes: ''
    });

    useEffect(() => {
        fetchData();
        fetchSummary();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'programs') {
                const res = await api.get('/admin/super/scholarships');
                setScholarships(res.data.data || []);
            } else {
                const res = await api.get('/admin/super/scholarships/applications');
                setApplications(res.data.data || []);
            }
        } catch (error) {
            toast.error('Gagal memuat data dari database');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await api.get('/admin/super/scholarships/summary');
            setSummary(res.data.data || { totalPrograms: 0, totalApplicants: 0, totalAccepted: 0, totalQuota: 0 });
        } catch (error) {
            console.error('Failed to fetch summary');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedItem) {
                await api.put(`/admin/super/scholarships/${selectedItem.id}`, form);
                toast.success('Beasiswa berhasil diperbarui');
            } else {
                await api.post('/admin/super/scholarships', form);
                toast.success('Program beasiswa baru berhasil dibuat');
            }
            setShowModal(false);
            fetchData();
            fetchSummary();
        } catch (error) {
            toast.error('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus program ini?')) return;
        try {
            await api.delete(`/admin/super/scholarships/${id}`);
            toast.success('Program beasiswa berhasil dihapus');
            fetchData();
            fetchSummary();
        } catch (error) {
            toast.error('Gagal menghapus program');
        }
    };

    const handleAppUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/super/scholarships/applications/${selectedItem.id}`, appForm);
            toast.success('Status pendaftaran telah diperbarui');
            setShowAppModal(false);
            fetchData();
            fetchSummary();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui status');
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Toaster position="top-right" />
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Manajemen Beasiswa Institusi</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk mengelola skema bantuan pendidikan dan pemantauan distribusi dana.</p>
                </div>
                {activeTab === 'programs' && (
                    <button 
                        onClick={() => {
                            setSelectedItem(null);
                            setForm({ name: '', provider: '', description: '', minGpa: 3.0, quota: 0, deadline: '', status: 'buka' });
                            setShowModal(true);
                        }}
                        className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all text-center"
                    >
                        Buat Program Beasiswa
                    </button>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-secondary/50">Total Program</p>
                      <h3 className="text-2xl font-black text-primary font-headline uppercase">{summary.totalPrograms}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-secondary/50 font-headline">Total Pendaftar</p>
                      <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">{summary.totalApplicants}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-secondary/50 font-headline">Total Penerima (ACC)</p>
                      <h3 className="text-2xl font-black text-emerald-600 uppercase tracking-tighter">{summary.totalAccepted}</h3>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-widest text-secondary/50 font-headline">Total Kuota Tersedia</p>
                      <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">{summary.totalQuota}</h3>
                  </div>
              </div>

              <div className="flex gap-4 border-b border-outline-variant/30">
                  <button 
                    onClick={() => setActiveTab('programs')}
                    className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'programs' ? 'border-primary text-primary' : 'border-transparent text-secondary/50'}`}
                  >
                      Daftar Program
                  </button>
                  <button 
                    onClick={() => setActiveTab('applications')}
                    className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'applications' ? 'border-primary text-primary' : 'border-transparent text-secondary/50'}`}
                  >
                      Pendaftar Mahasiswa
                  </button>
              </div>

              {activeTab === 'programs' ? (
                  <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                  <div className="p-10 border-b border-outline-variant/30 bg-surface-container-low/50">
                     <h3 className="text-sm font-black text-primary uppercase tracking-widest">Daftar Program Beasiswa Aktif</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70  leading-tight">
                        <th className="px-10 py-6">Nama Program</th>
                        <th className="px-10 py-6">Penyelenggara</th>
                        <th className="px-10 py-6 text-center">Kuota</th>
                        <th className="px-10 py-6">Deadline</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                        {loading ? (
                            <tr><td colSpan="6" className="p-20 text-center font-black text-secondary/30 uppercase tracking-[0.3em] animate-pulse">Sinkronisasi Data...</td></tr>
                        ) : scholarships.length === 0 ? (
                            <tr><td colSpan="6" className="p-20 text-center font-black text-secondary/30 uppercase tracking-[0.3em]">Belum ada program beasiswa</td></tr>
                        ) : scholarships.map((s, idx) => (
                        <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                            <td className="px-10 py-6">
                                <span className="font-extrabold text-primary uppercase tracking-tight  group-hover:text-blue-700 transition-colors">{s.nama}</span>
                            </td>
                            <td className="px-10 py-6 text-sm font-bold text-secondary uppercase tracking-tighter opacity-80">{s.penyelenggara}</td>
                            <td className="px-10 py-6 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="font-black text-primary tracking-tighter">{s.acceptedCount} / {s.kuota}</span>
                                    <span className="text-[8px] font-black text-secondary/40 uppercase tracking-widest">Terdaftar</span>
                                </div>
                            </td>
                            <td className="px-10 py-6 text-xs font-black text-rose-500 uppercase tracking-tight">
                                {new Date(s.deadline).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-10 py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    s.status === 'buka' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                    {s.status}
                                </span>
                            </td>
                            <td className="px-10 py-6 text-right space-x-2">
                                <button 
                                    onClick={() => {
                                        setSelectedItem(s);
                                        setForm({ 
                                            name: s.nama, 
                                            provider: s.penyelenggara, 
                                            description: s.deskripsi, 
                                            minGpa: s.syarat_ipk_min, 
                                            quota: s.kuota, 
                                            deadline: s.deadline?.split('T')[0], 
                                            status: s.status 
                                        });
                                        setShowModal(true);
                                    }}
                                    className="p-2.5 hover:bg-primary/5 rounded-xl text-primary transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button 
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2.5 hover:bg-rose-50 rounded-xl text-rose-500 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                  </div>
                </section>
              ) : (
                <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-outline-variant/30 bg-surface-container-low/50">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest">Antrean Seleksi Pendaftar</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70  leading-tight">
                            <th className="px-10 py-6">Mahasiswa</th>
                            <th className="px-10 py-6">Program Beasiswa</th>
                            <th className="px-10 py-6 text-center">Berkas</th>
                            <th className="px-10 py-6">Status</th>
                            <th className="px-10 py-6 text-right">Kelola</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 font-body select-text">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center font-black text-secondary/30 uppercase tracking-[0.3em] animate-pulse">Menghubungkan Database...</td></tr>
                            ) : applications.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center font-black text-secondary/30 uppercase tracking-[0.3em]">Belum ada pendaftar</td></tr>
                            ) : applications.map((app, idx) => (
                                <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-primary uppercase tracking-tight">{app.student?.name}</span>
                                            <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{app.student?.nim} • {app.student?.major?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="text-sm font-bold text-secondary uppercase tracking-tighter italic">{app.beasiswa?.nama}</span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <a href={app.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined">description</span>
                                        </a>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            app.status === 'diterima' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                            app.status === 'ditolak' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button 
                                            onClick={() => {
                                                setSelectedItem(app);
                                                setAppForm({ status: app.status, notes: app.catatan_admin });
                                                setShowAppModal(true);
                                            }}
                                            className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                        >
                                            Seleksi
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </section>
              )}
            </div>

            {/* Modal Program */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl space-y-8 animate-in fade-in zoom-in duration-300">
                        <header>
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tight font-headline">Detail Program Beasiswa</h2>
                            <p className="text-secondary text-sm font-medium mt-1">Konfigurasi parameter bantuan pendidikan institusi.</p>
                        </header>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Nama Beasiswa</label>
                                <input 
                                    required
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none focus:border-primary transition-all" 
                                    placeholder="Contoh: Beasiswa Unggulan 2024"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Penyelenggara</label>
                                <input 
                                    required
                                    value={form.provider} 
                                    onChange={e => setForm({...form, provider: e.target.value})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Minimal IPK</label>
                                <input 
                                    required
                                    type="number" step="0.1"
                                    value={form.minGpa} 
                                    onChange={e => setForm({...form, minGpa: parseFloat(e.target.value)})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Kuota (Mahasiswa)</label>
                                <input 
                                    required
                                    type="number"
                                    value={form.quota} 
                                    onChange={e => setForm({...form, quota: parseInt(e.target.value)})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Batas Pendaftaran</label>
                                <input 
                                    required
                                    type="date"
                                    value={form.deadline} 
                                    onChange={e => setForm({...form, deadline: e.target.value})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none focus:border-primary transition-all" 
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Status Publikasi</label>
                                <select 
                                    value={form.status} 
                                    onChange={e => setForm({...form, status: e.target.value})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none focus:border-primary transition-all"
                                >
                                    <option value="buka">BUKA (Dapat Didaftar)</option>
                                    <option value="tutup">TUTUP (Arsip)</option>
                                </select>
                            </div>
                            <div className="col-span-2 flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-secondary hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {selectedItem ? 'Simpan Perubahan' : 'Terbitkan Program'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Seleksi */}
            {showAppModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 shadow-2xl space-y-8">
                        <header>
                            <h2 className="text-2xl font-black text-primary uppercase tracking-tight font-headline">Evaluasi Pendaftar</h2>
                            <div className="mt-2 p-4 bg-primary/[0.03] rounded-2xl border border-primary/5">
                                <p className="text-primary font-black uppercase text-xs tracking-tight">{selectedItem?.student?.name}</p>
                                <p className="text-secondary text-[10px] font-bold uppercase tracking-widest opacity-60 leading-tight">Beasiswa: {selectedItem?.scholarship?.name}</p>
                            </div>
                        </header>
                        <form onSubmit={handleAppUpdate} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Keputusan Seleksi</label>
                                <select 
                                    required
                                    value={appForm.status} 
                                    onChange={e => setAppForm({...appForm, status: e.target.value})}
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none"
                                >
                                    <option value="proses">PROSES REVIEW</option>
                                    <option value="wawancara">TAHAP WAWANCARA</option>
                                    <option value="diterima">DITERIMA (ACC)</option>
                                    <option value="ditolak">DITOLAK</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 mb-2 block px-1">Catatan Verifikator</label>
                                <textarea 
                                    value={appForm.notes} 
                                    onChange={e => setAppForm({...appForm, notes: e.target.value})}
                                    placeholder="Berikan alasan keputusan..."
                                    className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl font-bold text-primary outline-none h-32 resize-none"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                                    Simpan Keputusan
                                </button>
                                <button type="button" onClick={() => setShowAppModal(false)} className="px-8 py-4 font-black text-secondary text-xs uppercase tracking-widest">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
          </main>
        </div>
    )
}

export default KelolaBeasiswa;
