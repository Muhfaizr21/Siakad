import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const StaffManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ studentId: '', role: 'Staf', division: '' });

  useEffect(() => {
    if (ormawaId) {
      loadInitialData();
    }
  }, [ormawaId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [staffData, rolesData, divsData, studentsData] = await Promise.all([
        ormawaService.getMembers(ormawaId),
        ormawaService.getRoles(ormawaId),
        ormawaService.getDivisions(ormawaId),
        ormawaService.getAllStudents()
      ]);

      if (staffData.status === 'success') setStaff(staffData.data || []);
      if (rolesData.status === 'success') setRoles(rolesData.data || []);
      if (divsData.status === 'success') setDivisions(divsData.data || []);
      if (studentsData.status === 'success') setStudents(studentsData.data || []);
    } catch (e) {
      console.error("Gagal memuat data staf:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await ormawaService.getMembers(ormawaId);
      if (data.status === 'success') setStaff(data.data || []);
    } catch (e) { console.error(e); }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const data = await ormawaService.addMember({
        ormawaId: Number(ormawaId),
        studentId: Number(formData.studentId),
        role: formData.role,
        division: formData.division,
        status: 'aktif'
      });
      if (data.status === 'success') {
        setIsModalOpen(false);
        setFormData({ studentId: '', role: 'Staf', division: '' });
        fetchStaff();
      }
    } catch (e) { alert("⚠️ Gagal mendaftarkan fungsionaris."); }
  };

  const handleRemoveStaff = async (id) => {
    if (!window.confirm('Yakni ingin menghapus staf ini?')) return;
    try {
      await ormawaService.deleteMember(id);
      fetchStaff();
    } catch (e) { alert("⚠️ Gagal menghapus fungsionaris."); }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h1 className="text-4xl font-black font-headline text-on-surface flex items-center gap-3">
                   <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <span className="material-symbols-outlined text-2xl">groups</span>
                   </div>
                   Manajemen Staf & Pengurus
                </h1>
                <p className="text-on-surface-variant text-sm font-medium mt-2 max-w-2xl leading-relaxed">
                  Delegasikan tugas dan kelola identitas fungsionaris organisasi Anda. Berikan role yang tepat untuk akses yang aman.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary-fixed text-white px-8 py-4 rounded-[1.5rem] font-black font-headline shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-3 group"
              >
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:rotate-90">
                   <span className="material-symbols-outlined text-[18px]">add</span>
                </div>
                Tambah Staf Baru
              </button>
           </div>

           <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40">
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-on-surface">
                    <thead className="text-[10px] text-on-surface-variant uppercase bg-surface-container-low/30 border-b border-outline-variant/20 font-black tracking-[0.2em]">
                       <tr>
                          <th className="px-8 py-6">IDENTITAS PENGURUS</th>
                          <th className="px-8 py-6">JABATAN / ROLE</th>
                          <th className="px-8 py-6">DIVISI</th>
                          <th className="px-8 py-6 text-right">AKSI</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                       {staff.map(s => (
                         <tr key={s.id} className="hover:bg-surface-container-low/20 transition-all group">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-transform">
                                     {s.student?.name?.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="font-black text-on-surface text-base font-headline group-hover:text-primary transition-colors">{s.student?.name}</p>
                                     <p className="text-xs text-on-surface-variant font-mono mt-0.5">NIM: {s.student?.nim}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="inline-flex items-center gap-2 bg-primary/5 text-primary border border-primary/20 rounded-xl px-4 py-2 font-black text-xs uppercase tracking-wider shadow-sm">
                                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                                  {s.role}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="font-bold text-on-surface-variant text-xs uppercase tracking-widest bg-surface-container-high px-3 py-1.5 rounded-lg w-fit">
                                  {s.division || 'UTAMA'}
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button 
                                 onClick={() => handleRemoveStaff(s.id)}
                                 className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 transition-all flex items-center justify-center shadow-sm"
                               >
                                 <span className="material-symbols-outlined text-[20px]">delete</span>
                               </button>
                            </td>
                         </tr>
                       ))}
                       {staff.length === 0 && !loading && (
                         <tr>
                            <td colSpan="4" className="px-8 py-20 text-center text-on-surface-variant  font-medium">Buku daftar staf masih kosong.</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* MODAL ADD STAFF */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-outline-variant/10 animate-in zoom-in-95 duration-300">
                <div className="p-10 bg-primary/5 border-b border-outline-variant/10 flex justify-between items-start">
                   <div>
                      <h2 className="text-3xl font-black font-headline text-on-surface">Tambah Staf</h2>
                      <p className="text-xs text-on-surface-variant uppercase tracking-[0.2em] font-black mt-2">Portal Fungsionaris Organisasi</p>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-on-surface-variant hover:text-rose-500 shadow-sm"><span className="material-symbols-outlined">close</span></button>
                </div>
                <form onSubmit={handleAddStaff} className="p-10 space-y-6">
                   <div className="space-y-4">
                      <div>
                         <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-1">Cari Mahasiswa</label>
                         <select 
                           required
                           className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                           value={formData.studentId}
                           onChange={e => setFormData({...formData, studentId: e.target.value})}
                         >
                           <option value="">-- Nama atau NIM --</option>
                           {students.map(s => (
                             <option key={s.id} value={s.id}>{s.name} ({s.nim})</option>
                           ))}
                         </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-1">Pilih Jabatan (Role)</label>
                            <select 
                              required
                              className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                              value={formData.role}
                              onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                               <option value="">-- Role --</option>
                               {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 px-1">Divisi / Bidang</label>
                            <select 
                              required
                              className="w-full bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl text-sm font-bold outline-none ring-primary/20 focus:ring-4 transition-all"
                              value={formData.division}
                              onChange={e => setFormData({...formData, division: e.target.value})}
                            >
                               <option value="">-- Divisi --</option>
                               {divisions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                               <option value="INTI">UMUM / INTI</option>
                            </select>
                         </div>
                      </div>
                   </div>
                   <div className="pt-6 flex gap-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-sm font-black text-on-surface-variant">BATAL</button>
                      <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-primary/20 active:scale-95 transition-all">DAFTARKAN PENGURUS</button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffManagement;
