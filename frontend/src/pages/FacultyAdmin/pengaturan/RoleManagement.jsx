import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

const modulePermissions = [
  { 
    id: 'pmb', name: 'Penerimaan (PMB)', 
    actions: [
      { id: 'view', label: 'Lihat Pendaftar' },
      { id: 'create', label: 'Input Manual' },
      { id: 'edit', label: 'Edit Data' },
      { id: 'delete', label: 'Hapus Data' },
      { id: 'verify', label: 'Verifikasi Lulus' }
    ]
  },
  { 
    id: 'akademik', name: 'Akademik & Nilai', 
    actions: [
      { id: 'view', label: 'Lihat Jadwal/Nilai' },
      { id: 'create', label: 'Buat Jadwal' },
      { id: 'edit', label: 'Ubah Jadwal/Nilai' },
      { id: 'delete', label: 'Hapus Data' },
      { id: 'validate', label: 'Validasi KRS' }
    ]
  },
  { 
    id: 'mahasiswa', name: 'Data Mahasiswa', 
    actions: [
      { id: 'view', label: 'Lihat Biodata' },
      { id: 'create', label: 'Tambah Mhs' },
      { id: 'edit', label: 'Update Status' },
      { id: 'delete', label: 'DO / Hapus' }
    ]
  },
  { 
    id: 'dosen', name: 'Data Dosen', 
    actions: [
      { id: 'view', label: 'Lihat Profil' },
      { id: 'create', label: 'Tambah Dosen' },
      { id: 'edit', label: 'Update Jabatan' },
      { id: 'delete', label: 'Hapus Dosen' }
    ]
  },
  { 
    id: 'konten', name: 'Website & Konten', 
    actions: [
      { id: 'view', label: 'Lihat Artikel' },
      { id: 'create', label: 'Tulis Artikel' },
      { id: 'edit', label: 'Edit Konten' },
      { id: 'delete', label: 'Hapus Konten' },
      { id: 'publish', label: 'Publish / Unpublish' }
    ]
  },
  { 
    id: 'kemahasiswaan', name: 'Layanan Mhs', 
    actions: [
      { id: 'view', label: 'Lihat Ajuan' },
      { id: 'response', label: 'Beri Tanggapan' },
      { id: 'verify', label: 'Verifikasi Beasiswa' },
      { id: 'proposal_verify', label: 'Approve ORMAWA' }
    ]
  },
  { 
    id: 'persuratan', name: 'E-Persuratan', 
    actions: [
      { id: 'view', label: 'Lihat Request' },
      { id: 'process', label: 'Proses & Cetak' }
    ]
  },
  { 
    id: 'pengaturan', name: 'Sistem & RBAC', 
    actions: [
      { id: 'view', label: 'Akses Settings' },
      { id: 'rbac_manage', label: 'Atur Hak Akses' }
    ]
  }
];

export default function RoleManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchRoles = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/faculty/roles');
      if (res.data.status === 'success') {
        const fetchedRoles = res.data.data.map(r => ({
          ...r,
          permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions || '{}') : (r.permissions || {})
        }));
        setRoles(fetchedRoles);
        if (fetchedRoles.length > 0 && !activeTab) setActiveTab(fetchedRoles[0].id);
      }
    } catch (error) {
      toast.error("Gagal mengambil data role");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = () => {
    setSelectedRole({
      name: '',
      description: '',
      isCustom: true,
      permissions: {}
    });
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(JSON.parse(JSON.stringify(role)));
    setIsModalOpen(true);
  };

  const togglePermission = (moduleId, actionId) => {
    const newRole = { ...selectedRole };
    if (!newRole.permissions[moduleId]) newRole.permissions[moduleId] = [];
    
    if (newRole.permissions[moduleId].includes(actionId)) {
      newRole.permissions[moduleId] = newRole.permissions[moduleId].filter(id => id !== actionId);
    } else {
      newRole.permissions[moduleId].push(actionId);
    }
    setSelectedRole(newRole);
  };

  const checkAllModule = (moduleId, actions) => {
    const newRole = { ...selectedRole };
    const allIds = actions.map(a => a.id);
    const current = newRole.permissions[moduleId] || [];
    
    if (allIds.every(id => current.includes(id))) {
      newRole.permissions[moduleId] = [];
    } else {
      newRole.permissions[moduleId] = allIds;
    }
    setSelectedRole(newRole);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedRole.name) return toast.error("Nama role wajib diisi");
    
    try {
      const payload = {
        ...selectedRole,
        permissions: JSON.stringify(selectedRole.permissions)
      };

      if (selectedRole.id) {
        await axios.put(`http://localhost:8000/api/faculty/roles/${selectedRole.id}`, payload);
        toast.success("Role diperbarui");
      } else {
        await axios.post('http://localhost:8000/api/faculty/roles', payload);
        toast.success("Role baru dibuat");
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error("Gagal menyimpan role");
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Hapus role ini?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/faculty/roles/${id}`);
      toast.success("Role dihapus");
      fetchRoles();
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  const currentRoleDetails = roles.find(r => r.id === activeTab);

  return (
    <div className="bg-[#fcfdfe] text-slate-900 min-h-screen font-sans">
      <Toaster />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />

        <div className="pt-24 pb-12 px-4 lg:px-12 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 font-headline">Manajemen Hak Akses</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">Delegasikan otorisasi modul kepada staff administrasi fakultas.</p>
            </div>
            <button 
              onClick={handleCreateRole}
              className="rounded-2xl px-8 py-4 gap-3 bg-primary hover:bg-primary-fixed text-white shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center font-bold text-xs uppercase tracking-widest"
            >
               <span className="material-symbols-outlined text-[20px]">add_moderator</span>
               Buat Role Kustom
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* List Role */}
            <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Daftar Jabatan</p>
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setActiveTab(role.id)}
                  className={`w-full text-left px-6 py-5 rounded-2xl transition-all border ${
                    activeTab === role.id 
                    ? 'bg-primary/5 border-primary/20 text-primary scale-[1.02] shadow-sm shadow-primary/5' 
                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-[14px]">{role.name}</p>
                  <p className="text-[10px] mt-1 opacity-60 font-medium">Klik untuk lihat akses</p>
                </button>
              ))}
            </div>

            {/* Detail Module Permissions */}
            {currentRoleDetails && (
              <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentRoleDetails.name}</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">{currentRoleDetails.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleDeleteRole(currentRoleDetails.id)} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <button onClick={() => handleEditRole(currentRoleDetails)} className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all">
                      Ubah Konfigurasi
                    </button>
                  </div>
                </div>
                
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {modulePermissions.map(mod => {
                    const activePerms = currentRoleDetails.permissions[mod.id] || [];
                    if (activePerms.length === 0) return null;
                    return (
                      <div key={mod.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {mod.name}
                        </h4>
                        <div className="space-y-2">
                          {mod.actions.map(action => (
                            <div key={action.id} className="flex items-center gap-2">
                               {activePerms.includes(action.id) ? (
                                 <span className="material-symbols-outlined text-[16px] text-emerald-500 font-black">check_circle</span>
                               ) : (
                                 <span className="material-symbols-outlined text-[16px] text-slate-300">cancel</span>
                               )}
                               <span className={`text-[12px] font-bold ${activePerms.includes(action.id) ? 'text-slate-700' : 'text-slate-400'}`}>
                                 {action.label}
                               </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Editor */}
        {isModalOpen && selectedRole && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
              <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedRole.id ? 'Edit Role' : 'Role Kustom Baru'}</h2>
                  <p className="text-slate-500 text-sm font-medium">Tentukan hak akses secara mendetail untuk setiap modul.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white text-slate-400 rounded-full hover:bg-slate-100 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                 <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Jabatan / Role</label>
                       <input value={selectedRole.name} onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Contoh: Admin Akademik TI" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
                       <input value={selectedRole.description} onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Misal: Staff khusus manajemen KRS & Nilai" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    {modulePermissions.map(mod => {
                      const current = selectedRole.permissions[mod.id] || [];
                      const isAll = mod.actions.every(a => current.includes(a.id));
                      return (
                        <div key={mod.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:border-primary/20 transition-all group">
                           <div className="flex justify-between items-center mb-6">
                              <h4 className="font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-primary" />
                                 {mod.name}
                              </h4>
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isAll ? 'Unselect All' : 'Select All'}</span>
                                 <input type="checkbox" checked={isAll} onChange={() => checkAllModule(mod.id, mod.actions)} className="rounded border-slate-200 text-primary focus:ring-primary" />
                              </label>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              {mod.actions.map(action => (
                                <label key={action.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${current.includes(action.id) ? 'bg-primary/5 border-primary/20' : 'bg-slate-50/50 border-transparent hover:bg-slate-100'}`}>
                                   <input type="checkbox" checked={current.includes(action.id)} onChange={() => togglePermission(mod.id, action.id)} className="rounded border-slate-300 text-primary focus:ring-primary" />
                                   <div className="flex flex-col">
                                      <span className={`text-[12px] font-bold ${current.includes(action.id) ? 'text-primary' : 'text-slate-600'}`}>{action.label}</span>
                                      <span className="text-[9px] opacity-40 uppercase font-mono tracking-tighter">[{action.id}]</span>
                                   </div>
                                </label>
                              ))}
                           </div>
                        </div>
                      )
                    })}
                 </div>
              </div>

              <div className="p-10 border-t border-slate-50 bg-white flex justify-end gap-4">
                 <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Batal</button>
                 <button onClick={handleSaveRole} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:bg-primary hover:shadow-primary/20 transition-all">Simpan Konfigurasi</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
