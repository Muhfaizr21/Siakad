import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({ email: '', password: '', role: 'mahasiswa' });
    const [editingUser, setEditingUser] = useState(null);
    const [newRole, setNewRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllUsers();
            if (res.status === 'success') {
                setUsers(res.data || []);
            }
        } catch (e) {
            console.error("Gagal load users:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await adminService.createUser(formData);
            if (res.status === 'success') {
                setIsCreateModalOpen(false);
                setFormData({ email: '', password: '', role: 'mahasiswa' });
                fetchUsers();
            } else {
                alert("Gagal: " + res.message);
            }
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Hapus akun ini secara permanen?')) return;
        try {
            await adminService.deleteUser(id);
            fetchUsers();
        } catch (e) {
            alert("Gagal menghapus: " + e.message);
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setNewRole(user.Role);
        setIsEditModalOpen(true);
    };

    const handleUpdateRole = async (e) => {
        e.preventDefault();
        if (!newRole || newRole === editingUser.Role) {
            setIsEditModalOpen(false);
            return;
        }

        try {
            const res = await adminService.updateUserRole({ userId: editingUser.ID, role: newRole });
            if (res.status === 'success') {
                setIsEditModalOpen(false);
                fetchUsers();
            } else {
                alert("Gagal: " + res.message);
            }
        } catch (e) {
            alert("Terjadi kesalahan sistem: " + e.message);
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Mesin RBAC & Kontrol Akses</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90 font-body">Pusat otoritas global untuk penetapan peran dan manajemen keamanan akun institusi.</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all font-body"
                >
                    Registrasi Akun Baru
                </button>
              </header>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm font-body">
                 <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-end font-body ">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Otoritas Pengguna Terdaftar</h3>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{loading ? '...' : users.length} Entitas Aktif</span>
                 </div>
                 <table className="w-full text-left font-body">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 leading-tight">
                      <th className="px-10 py-6">Nama Pengguna</th>
                      <th className="px-10 py-6">Peran Utama (Role)</th>
                      <th className="px-10 py-6">Status Keamanan</th>
                      <th className="px-10 py-6 text-right">Modifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body select-text text-sm">
                    {loading ? (
                        <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest leading-loose">Mensinkronkan basis data keamanan...</td></tr>
                    ) : users.length === 0 ? (
                        <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest leading-loose">Tidak ada record pengguna ditemukan.</td></tr>
                    ) : users.map((u) => (
                      <tr key={u.ID} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50 font-body">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center font-black text-primary shadow-inner uppercase text-xs">
                                    {u.Email ? u.Email[0] : 'U'}
                                </div>
                                <div className="font-body">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                                        {u.Mahasiswa?.Nama || u.Dosen?.Nama || u.Email}
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase italic">
                                        {u.Email}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                             <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                 u.Role === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                 u.Role === 'admin_fakultas' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                 u.Role === 'admin_ormawa' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                 'bg-slate-50 text-slate-500 border-slate-100'
                             }`}>
                                {u.Role}
                             </span>
                        </td>
                        <td className="px-10 py-6 font-body">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Aktif</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right font-body">
                           <div className="flex justify-end gap-2 font-body">
                                <button 
                                    onClick={() => openEditModal(u)}
                                    className="p-3 hover:bg-primary/5 rounded-xl text-primary transition-all font-black flex items-center justify-center"
                                    title="Ubah Peran"
                                >
                                    <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                                </button>
                                <button 
                                    onClick={() => handleDeleteUser(u.ID)}
                                    className="p-3 hover:bg-rose-50 rounded-xl text-rose-500 transition-all font-body flex items-center justify-center"
                                    title="Hapus Akun"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
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

          {/* Modal Create User */}
          {isCreateModalOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-12 flex flex-col gap-8 animate-in zoom-in duration-300 font-body">
                      <header>
                          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Registrasi Otoritas</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic font-body">Pembuatan Akun Institusi Baru</p>
                      </header>

                      <form onSubmit={handleCreateUser} className="space-y-6 font-body">
                          <div className="flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-body font-black">Email Pengguna</label>
                              <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none" 
                                placeholder="E.g. administrator@bku.ac.id"
                              />
                          </div>
                          <div className="flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-body font-black">Kata Sandi</label>
                              <input 
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none font-body" 
                                placeholder="••••••••"
                              />
                          </div>
                          <div className="flex flex-col gap-1.5 label-input font-body">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-black">Tingkat Otoritas (Role)</label>
                              <select 
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none font-body"
                              >
                                  <option value="mahasiswa">Mahasiswa (Standard)</option>
                                  <option value="dosen">Dosen (Academic)</option>
                                  <option value="admin_fakultas">Admin Fakultas (Faculty Hub)</option>
                                  <option value="admin_ormawa">Admin Ormawa (Student Org)</option>
                                  <option value="super_admin">Super Admin (Global Authority)</option>
                              </select>
                          </div>
                          <div className="flex gap-4 pt-4 font-body">
                            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Konfirmasi Akun
                            </button>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-10 bg-slate-100 text-slate-500 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em]">Batal</button>
                          </div>
                      </form>
                  </div>
              </div>
          )}

          {/* Modal Edit Role (Dropdown, not prompt) */}
          {isEditModalOpen && editingUser && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                  <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-12 flex flex-col gap-8 animate-in zoom-in duration-300 font-body">
                      <header>
                          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter leading-none">Modifikasi Otoritas</h2>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic font-body">ID Pengguna: {editingUser.ID}</p>
                      </header>

                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 font-body">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Target Pengguna</p>
                          <p className="font-extrabold text-primary uppercase tracking-tight">{editingUser.Mahasiswa?.Nama || editingUser.Dosen?.Nama || editingUser.Email}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 italic">{editingUser.Email}</p>
                      </div>

                      <form onSubmit={handleUpdateRole} className="space-y-6 font-body">
                          <div className="flex flex-col gap-1.5 label-input">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 font-body font-black">Tetapkan Role Baru</label>
                              <select 
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-primary focus:border-primary transition-all outline-none font-body"
                              >
                                  <option value="mahasiswa">Mahasiswa</option>
                                  <option value="dosen">Dosen</option>
                                  <option value="admin_fakultas">Admin Fakultas</option>
                                  <option value="admin_ormawa">Admin Ormawa</option>
                                  <option value="super_admin">Super Admin</option>
                              </select>
                          </div>
                          <div className="flex gap-4 pt-4 font-body">
                            <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                Simpan Perubahan
                            </button>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-10 bg-slate-100 text-slate-500 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em]">Batal</button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default UserManagement;
