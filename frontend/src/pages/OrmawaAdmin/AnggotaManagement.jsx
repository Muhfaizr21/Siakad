import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';

const AnggotaManagement = () => {
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [anggotaList, setAnggotaList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', role: 'Staf', division: '', status: 'pending' });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchMembers();
    fetchAllStudents();
  }, [ormawaId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members?ormawaId=${ormawaId}`);
      const data = await res.json();
      if (data.status === 'success') setAnggotaList(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/ormawa/students'); 
      const data = await res.json();
      if (data.status === 'success') setStudents(data.data || []);
    } catch (e) { console.error(e); }
  };

  const filteredData = (anggotaList || []).filter((item) => {
    const nama = item.student?.name || '';
    const nim = item.student?.nim || '';
    const matchSearch = nama.toLowerCase().includes(searchTerm.toLowerCase()) || nim.includes(searchTerm);
    return matchSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'aktif': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pending': 'bg-orange-100 text-orange-700 border-orange-200',
      'tidak_aktif': 'bg-rose-100 text-rose-700 border-rose-200',
      'alumni': 'bg-slate-200 text-slate-700 border-slate-300',
      'ditolak': 'bg-red-100 text-red-700 border-red-200'
    };
    const cls = badges[status] || 'bg-slate-100 text-slate-600';
    return <span className={`${cls} border px-3 py-1 rounded-full text-xs font-bold uppercase`}>{status}</span>;
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchMembers();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus anggota ini dari organisasi?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ormawa/members/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchMembers();
    } catch (e) { console.error(e); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/ormawa/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ormawaId: ormawaId,
          studentId: parseInt(formData.studentId),
          role: formData.role,
          division: formData.division,
          status: 'aktif'
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ studentId: '', role: 'Staf', division: '', status: 'pending' });
        fetchMembers();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen pb-12">
        <TopNavBar />
        
        <div className="pt-24 px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold font-headline mb-2 text-on-surface">Manajemen Anggota</h1>
              <p className="text-on-surface-variant text-sm font-medium">Kelola data keanggotaan, persetujuan pendaftar, dan status alumni organisasi Anda.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Tambah Anggota
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors border border-rose-200">
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                Export PDF
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                type="text" 
                placeholder="Cari berdasarkan NIM atau Nama..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-xl focus:ring-primary focus:border-primary block pl-12 p-3 font-medium transition-all"
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-on-surface">
                <thead className="text-xs text-on-surface-variant uppercase bg-surface-container-low/50 border-b border-outline-variant/20 font-label tracking-wider">
                  <tr>
                    <th className="px-6 py-5 font-bold">Profil Anggota</th>
                    <th className="px-6 py-5 font-bold">Jabatan & Divisi</th>
                    <th className="px-6 py-5 font-bold text-center">Status</th>
                    <th className="px-6 py-5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredData.map((anggota) => (
                    <tr key={anggota.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container text-primary flex justify-center items-center font-bold text-lg shadow-inner">
                            {anggota.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold font-headline text-base text-on-surface group-hover:text-primary transition-colors">{anggota.student?.name}</div>
                            <div className="text-xs font-medium text-on-surface-variant mt-0.5">NIM: {anggota.student?.nim}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-on-surface">{anggota.role}</div>
                        <div className="text-xs font-medium text-on-surface-variant mt-0.5">{anggota.division || 'Tanpa Divisi'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(anggota.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <div className="flex items-center justify-end gap-2">
                          <select 
                            value={anggota.status}
                            onChange={(e) => handleUpdateStatus(anggota.id, e.target.value)}
                            className="bg-surface-container-low border border-outline-variant/30 text-xs font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-primary transition-all"
                          >
                            <option value="pending">Pending</option>
                            <option value="aktif">Aktif</option>
                            <option value="tidak_aktif">Non-Aktif</option>
                            <option value="alumni">Alumni</option>
                            <option value="ditolak">Ditolak</option>
                          </select>
                          <button 
                            onClick={() => handleDelete(anggota.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-on-surface-variant font-medium">
                        Tidak ada data anggota.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Modal Add Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant/10">
            <div className="px-8 py-8 flex justify-between items-center bg-primary/5">
              <div>
                <h2 className="text-2xl font-bold font-headline text-on-surface">Tambah Anggota</h2>
                <p className="text-xs text-on-surface-variant font-medium mt-1 uppercase tracking-widest">Portal Fungsionaris</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddMember} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-2 px-1">Pilih Mahasiswa</label>
                <select 
                  required
                  value={formData.studentId} 
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                  className="w-full p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">-- Cari Nama atau NIM --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nim})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Role/Jabatan</label>
                  <input 
                    required type="text" placeholder="Staf, Sekretaris..."
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full p-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-widest mb-2">Divisi</label>
                  <input 
                    type="text" placeholder="Medkom, PSDA..."
                    value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})}
                    className="w-full p-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-primary text-on-primary font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-[20px]">person_check</span>
                Daftarkan Anggota Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnggotaManagement;
