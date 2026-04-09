import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { Loader2, UserPlus, Shield, Edit2, Trash2, X, User as UserIcon, Lock, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [ormawas, setOrmawas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        roleId: '',
        facultyId: '',
        ormawaId: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes, facultiesRes, ormawasRes] = await Promise.all([
                api.get('/admin/super/users'),
                api.get('/admin/super/roles'),
                api.get('/admin/super/faculties'),
                api.get('/admin/super/ormawas')
            ]);
            setUsers(usersRes.data.data);
            setRoles(rolesRes.data.data);
            setFaculties(facultiesRes.data.data);
            setOrmawas(ormawasRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Gagal memuat data RBAC');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                email: user.email,
                password: '', // Jangan tampilkan password lama
                roleId: user.roleId,
                facultyId: user.facultyId || '',
                isActive: user.isActive
            });
        } else {
            setCurrentUser(null);
            setFormData({
                email: '',
                password: '',
                roleId: roles.length > 0 ? roles[0].id : '',
                facultyId: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                roleId: parseInt(formData.roleId),
                facultyId: formData.facultyId ? parseInt(formData.facultyId) : null
            };

            if (currentUser) {
                // Update
                if (!payload.password) delete payload.password; // Jangan update password jika kosong
                await api.put(`/admin/super/users/${currentUser.id}`, payload);
                toast.success('User berhasil diperbarui');
            } else {
                // Create
                if (!payload.password) {
                    toast.error('Password wajib diisi untuk user baru');
                    return;
                }
                await api.post('/admin/super/users', payload);
                toast.success('User baru ditambahkan');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Hapus akses pengguna ini secara permanen?')) {
            try {
                await api.delete(`/admin/super/users/${id}`);
                toast.success('User dihapus');
                fetchData();
            } catch (error) {
                toast.error('Gagal menghapus user');
            }
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="lg:ml-80 ml-0 flex flex-col min-h-screen w-full transition-all duration-300">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase ">Mesin RBAC & Kontrol Akses</h1>
                  <p className="text-secondary mt-1 font-medium ">Otoritas pusat untuk penugasan peran (Role) dan pembatasan izin akses pengguna.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                    <UserPlus size={16} />
                    Buat User Admin Baru
                </button>
              </header>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                )}
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                      <th className="px-10 py-6">Nama Pengguna / Email</th>
                      <th className="px-10 py-6">Peran Utama (Role)</th>
                      <th className="px-10 py-6">Afiliasi Unit</th>
                      <th className="px-10 py-6 text-center">Status Akses</th>
                      <th className="px-10 py-6 text-right">Kelola Akses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text text-sm">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-surface-container p-2 rounded-xl flex items-center justify-center font-black text-primary shadow-inner">
                                    {user.email[0].toUpperCase()}
                                </div>
                                <div>
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase ">{user.email.split('@')[0]}</span>
                                    <p className="text-[10px] text-secondary/40 font-black tracking-widest uppercase">{user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                            <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                {user.role?.name || 'N/A'}
                            </span>
                        </td>
                        <td className="px-10 py-6 uppercase tracking-widest text-[10px] font-black text-primary/60">
                            {user.faculty?.name || 'FULL SYSTEM CONTROL'}
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex items-center justify-center">
                                {user.isActive ? (
                                    <CheckCircle className="text-emerald-500" size={20} />
                                ) : (
                                    <XCircle className="text-rose-400" size={20} />
                                )}
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex justify-end gap-2">
                               <button 
                                onClick={() => handleOpenModal(user)}
                                className="p-2 hover:bg-primary/5 rounded-xl text-primary transition-all">
                                    <Edit2 size={18} />
                                </button>
                               <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-all">
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

          {/* Modal RBAC */}
          {isModalOpen && (
              <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
                          <h2 className="text-xl font-black text-primary uppercase tracking-tight font-headline">
                              {currentUser ? 'Perbarui Akses Pengguna' : 'Buat User Akses Baru'}
                          </h2>
                          <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary transition-colors">
                              <X size={24} />
                          </button>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="p-8 space-y-6">
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Email / Login ID</label>
                                  <div className="relative">
                                      <UserIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                                      <input 
                                        required
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-14 pr-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      />
                                  </div>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">
                                      {currentUser ? 'Password Baru (Kosongkan jika tetap)' : 'Kata Sandi (Password)'}
                                  </label>
                                  <div className="relative">
                                      <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-40" />
                                      <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full pl-14 pr-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      />
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Peran (Role)</label>
                                      <select 
                                        required
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      >
                                          {roles.map(r => (
                                              <option key={r.id} value={r.id}>{r.name}</option>
                                          ))}
                                      </select>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Status Akun</label>
                                      <select 
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      >
                                          <option value="true">Aktif</option>
                                          <option value="false">Non-Aktif/Blokir</option>
                                      </select>
                                  </div>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">
                                      {roles.find(r => r.id == formData.roleId)?.name === 'OrmawaAdmin' ? 'Afiliasi Ormawa' : 'Afiliasi Fakultas'}
                                  </label>
                                  {roles.find(r => r.id == formData.roleId)?.name === 'OrmawaAdmin' ? (
                                      <select 
                                        value={formData.ormawaId}
                                        onChange={(e) => setFormData({...formData, ormawaId: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      >
                                          <option value="">PILIH UNIT ORMAWA</option>
                                          {ormawas.map(o => (
                                              <option key={o.id} value={o.id}>{o.name}</option>
                                          ))}
                                      </select>
                                  ) : (
                                      <select 
                                        value={formData.facultyId}
                                        onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                                        className="w-full px-6 py-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold text-primary"
                                      >
                                          <option value="">LINGKUP UNIVERSITAS (FULL CONTROL)</option>
                                          {faculties.map(f => (
                                              <option key={f.id} value={f.id}>{f.name}</option>
                                          ))}
                                      </select>
                                  )}
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
                                {currentUser ? 'Simpan Perubahan' : 'Aktifkan User'}
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
        </div>
    )
}

export default UserManagement;
