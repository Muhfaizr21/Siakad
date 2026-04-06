import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { useAuth } from '../../context/AuthContext';
import { ormawaService } from '../../services/api';

const modulePermissions = [
  { 
    id: 'anggota', name: 'Manajemen Anggota', 
    actions: [
      { id: 'view', label: 'Lihat Daftar Data' },
      { id: 'create', label: 'Tambah Anggota' },
      { id: 'edit', label: 'Edit Profil Anggota' },
      { id: 'delete', label: 'Hapus/Nonaktifkan' },
      { id: 'export', label: 'Export/Import Data' }
    ]
  },
  { 
    id: 'proposal', name: 'Proposal Kegiatan', 
    actions: [
      { id: 'view', label: 'Lihat Proposal' },
      { id: 'create', label: 'Buat Draft Baru' },
      { id: 'edit', label: 'Edit Draft Proposal' },
      { id: 'delete', label: 'Hapus Draft' },
      { id: 'submit', label: 'Ajukan ke Fakultas' }
    ]
  },
  { 
    id: 'jadwal', name: 'Jadwal & Kalender', 
    actions: [
      { id: 'view', label: 'Lihat Kalender' },
      { id: 'create', label: 'Buat Event' },
      { id: 'edit', label: 'Edit Event' },
      { id: 'delete', label: 'Batal/Hapus Event' }
    ]
  },
  { 
    id: 'absensi', name: 'Sistem Absensi (QR)', 
    actions: [
      { id: 'view', label: 'Lihat Rekap Absen' },
      { id: 'create', label: 'Generate QR Code' },
      { id: 'scan', label: 'Akses Scanner' },
      { id: 'edit', label: 'Ubah Data Manual' },
      { id: 'export', label: 'Cetak Laporan' }
    ]
  },
  { 
    id: 'keuangan', name: 'Buku Kas & Keuangan', 
    actions: [
      { id: 'view', label: 'Lihat Dashbord Kas' },
      { id: 'create', label: 'Input Pemasukan/Pengeluaran' },
      { id: 'edit', label: 'Edit Transaksi' },
      { id: 'delete', label: 'Hapus Transaksi' },
      { id: 'export', label: 'Cetak Buku Kas' }
    ]
  },
  { 
    id: 'lpj', name: 'Laporan & LPJ', 
    actions: [
      { id: 'view', label: 'Lihat Riwayat LPJ' },
      { id: 'create', label: 'Buat Laporan Baru' },
      { id: 'edit', label: 'Ubah Draft LPJ' },
      { id: 'delete', label: 'Hapus LPJ' },
      { id: 'submit', label: 'Submit Evaluasi' }
    ]
  },
  { 
    id: 'pengumuman', name: 'Siaran & Pengumuman', 
    actions: [
      { id: 'view', label: 'Baca Pengumuman Internal' },
      { id: 'create', label: 'Buat Pengumuman' },
      { id: 'edit', label: 'Edit Pengumuman' },
      { id: 'delete', label: 'Hapus Pengumuman' },
      { id: 'publish', label: 'Broadcast Pesan Massal' }
    ]
  },
  { 
    id: 'struktur', name: 'Struktur Pengurus', 
    actions: [
      { id: 'view', label: 'Lihat Hierarki' },
      { id: 'edit', label: 'Reshuffle / Ubah Posisi' }
    ]
  }
];

const RoleBasedAccess = () => {
  const { user } = useAuth();
  const ormawaId = user?.ormawaId || 1;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: {} });

  useEffect(() => {
    if (ormawaId) {
      loadInitialData();
    }
  }, [ormawaId]);

  const loadInitialData = async () => {
    try {
      const [roleData, memberData] = await Promise.all([
        ormawaService.getRoles(ormawaId),
        ormawaService.getMembers(ormawaId)
      ]);
      if (roleData.status === 'success') {
        const fetchedRoles = (roleData.data || []).map(r => ({
          ...r,
          userCount: r.userCount || 0,
          permissions: typeof r.permissions === 'string' ? (JSON.parse(r.permissions || '{}') || {}) : (r.permissions || {})
        }));
        setRoles(fetchedRoles);
        if (fetchedRoles.length > 0 && !activeTab) {
          setActiveTab(fetchedRoles[0].id);
        }
      }
    } catch (error) {
        console.error("Error fetching roles:", error);
    } finally {
        setLoading(false);
    }
  };

  const currentRoleDetails = roles.find(r => r.id === activeTab);

  const handleEditRole = () => {
    // Deep copy for editing to avoid mutating state directly before saving
    setSelectedRole(JSON.parse(JSON.stringify(currentRoleDetails)));
    setIsModalOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole({
      name: 'Role Baru',
      description: 'Deskripsi role baru...',
      userCount: 0,
      isCustom: true,
      permissions: {}
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const togglePermission = (moduleId, actionId) => {
    if (!selectedRole) return;
    
    const newRoleObj = { ...selectedRole };
    if (!newRoleObj.permissions[moduleId]) {
      newRoleObj.permissions[moduleId] = [];
    }

    const set = new Set(newRoleObj.permissions[moduleId]);
    if (set.has(actionId)) {
      set.delete(actionId);
    } else {
      set.add(actionId);
    }
    newRoleObj.permissions[moduleId] = Array.from(set);

    setSelectedRole(newRoleObj);
  };

  const checkAllModule = (moduleId, actions) => {
    if (!selectedRole) return;
    
    const newRoleObj = { ...selectedRole };
    const allActionIds = actions.map(a => a.id);
    
    const currentPerms = newRoleObj.permissions[moduleId] || [];
    const isAllChecked = allActionIds.every(id => currentPerms.includes(id));

    if (isAllChecked) {
      newRoleObj.permissions[moduleId] = []; // Clear all
    } else {
      newRoleObj.permissions[moduleId] = allActionIds; // Select all
    }

    setSelectedRole(newRoleObj);
  };

  const handleSaveRole = async () => {
    try {
      const isEdit = !!selectedRole.id;
      const url = isEdit 
        ? `http://localhost:8000/api/ormawa/roles/${selectedRole.id}` 
        : 'http://localhost:8000/api/ormawa/roles';
      
      const payload = {
        name: selectedRole.name,
        description: selectedRole.description,
        isCustom: selectedRole.isCustom,
        permissions: selectedRole.permissions,
        userCount: selectedRole.userCount || 0
      };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (json.status === 'success') {
        fetchRoles(); // Refresh the list
        if (!isEdit) setActiveTab(json.data.id);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleDeleteRole = async () => {
    if (!currentRoleDetails) return;
    if (window.confirm(`Yakin ingin menghapus role ${currentRoleDetails.name}?`)) {
      try {
        const res = await fetch(`http://localhost:8000/api/ormawa/roles/${currentRoleDetails.id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.status === 'success') {
          setActiveTab(null);
          fetchRoles();
        }
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 min-h-screen pb-12 transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 bg-gradient-to-r from-primary to-primary/80 p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20">
              <div>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block font-headline tracking-wider uppercase">Master Controller</span>
                <h1 className="text-4xl font-black font-headline leading-tight mt-2 mb-2">Delegasi Akses & Role Pengurus</h1>
                <p className="text-primary-50 max-w-2xl text-sm font-medium">
                  Sebagai Admin Ormawa (Pemilik Kendali Penuh), Anda dapat mendelegasikan sebagian hak akses secara terperinci (View, Edit, Buat, Hapus) 
                  kepada anggota pengurus (Sekretaris, Bendahara, Kadiv) sesuai fungsi dan tanggung jawabnya.
                </p>
              </div>
              <button 
                onClick={handleCreateRole}
                className="bg-white text-primary hover:bg-surface-container px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all font-bold group whitespace-nowrap"
              >
                <span className="material-symbols-outlined transition-transform group-hover:rotate-90">add</span>
                Buat Role Pengurus Baru
              </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Role Navigation Sidebar */}
              <div className="lg:col-span-1 bg-white border border-outline-variant/30 rounded-3xl p-4 shadow-xl shadow-slate-200/40">
                <h2 className="px-4 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2 font-headline">Daftar Role</h2>
                <div className="space-y-2">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setActiveTab(role.id)}
                      className={`w-full text-left px-5 py-5 rounded-2xl flex items-center justify-between transition-all outline-none ${
                        activeTab === role.id 
                          ? 'bg-primary/10 text-primary border border-primary/20 scale-[1.02]' 
                          : 'hover:bg-surface-container text-on-surface border border-transparent hover:border-outline-variant/40'
                      }`}
                    >
                      <div>
                        <div className="font-bold font-headline text-sm">{role.name}</div>
                        <div className={`text-xs mt-1 transition-colors ${activeTab === role.id ? 'text-primary/60' : 'text-on-surface-variant'}`}>
                          {role.userCount} Anggota Pengurus
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-xl opacity-80">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed View Panel */}
              {currentRoleDetails && (
                <div className="lg:col-span-3 bg-white border border-outline-variant/30 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 flex flex-col">
                  {/* Panel Header */}
                  <div className="p-8 border-b border-outline-variant/20 flex justify-between items-start bg-surface-container-low/30">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                          <span className="material-symbols-outlined text-2xl">shield_person</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-on-surface font-headline">{currentRoleDetails.name}</h2>
                          <div className="flex gap-2 items-center mt-1">
                            {currentRoleDetails.isCustom ? (
                              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-amber-200">Custom Role</span>
                            ) : (
                              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-200">Default Role</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-sm mt-4 max-w-2xl leading-relaxed">{currentRoleDetails.description}</p>
                    </div>
                    {user?.role?.id === 1 ? (
                      <div className="flex items-center gap-3">
                        {currentRoleDetails.isCustom && (
                          <button 
                            onClick={handleDeleteRole}
                            className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Hapus
                          </button>
                        )}
                        <button 
                          onClick={handleEditRole}
                          className="bg-primary text-white hover:bg-primary/90 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit_square</span>
                          Ubah Akses
                        </button>
                      </div>
                    ) : (
                      <div className="text-on-surface-variant bg-surface-container-high px-5 py-2.5 rounded-xl font-semibold text-[11px] uppercase tracking-wider flex items-center gap-2 border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[16px]">lock</span> Hanya Master Controller
                      </div>
                    )}
                  </div>
                  {/* Panel Body - Full Width Access Grid */}
                  <div className="flex-1 overflow-auto bg-white p-8">
                     <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest font-headline mb-6 flex items-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">verified_user</span>
                       Peta Kewenangan Modul
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {modulePermissions.map(mod => {
                        const hasAnyAccess = (currentRoleDetails.permissions[mod.id] || []).length > 0;
                        if (!hasAnyAccess) return null;

                        return (
                          <div key={mod.id} className="border border-outline-variant/20 rounded-2xl p-5 bg-surface-container-low/10 group">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/10">
                              <h4 className="font-bold text-on-surface font-headline group-hover:text-primary transition-colors">{mod.name}</h4>
                            </div>
                            <div className="space-y-3">
                              {mod.actions.map(action => {
                                const hasAccess = (currentRoleDetails.permissions[mod.id] || []).includes(action.id);
                                return (
                                  <div key={action.id} className="flex items-center gap-3">
                                    {hasAccess ? (
                                      <div className="w-5 h-5 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 bg-surface-container/50 border border-outline-variant/30 rounded-md flex items-center justify-center text-outline-variant/50">
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                      </div>
                                    )}
                                    <span className={`text-sm ${hasAccess ? 'text-on-surface font-medium' : 'text-on-surface-variant/50'}`}>
                                      {action.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Editor Modal */}
      {isModalOpen && selectedRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-full flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 border border-outline-variant/20">
            
            <div className="px-8 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest rounded-t-[2rem]">
              <div className="flex items-start gap-4 flex-1 mr-8">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20 mt-1">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <div className="flex-1 space-y-2">
                  {selectedRole.isCustom ? (
                    <>
                      <input 
                        type="text" 
                        value={selectedRole.name} 
                        onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
                        className="text-xl font-bold text-on-surface font-headline bg-transparent border-b border-primary/30 focus:border-primary outline-none px-0 py-1 w-full max-w-sm"
                        placeholder="Nama Role (Misal: Koordinator Divisi)"
                        autoFocus
                      />
                      <input 
                        type="text" 
                        value={selectedRole.description} 
                        onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
                        className="text-on-surface-variant text-xs mt-0.5 bg-transparent border-b border-outline-variant/30 focus:border-primary/50 outline-none px-0 py-1 w-full"
                        placeholder="Deskripsi singkat tentang hak akses ini"
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-on-surface font-headline">Konfigurasi Terperinci: {selectedRole.name}</h2>
                      <p className="text-on-surface-variant text-xs mt-0.5">Tentukan secara granular (View, Create, Edit, dll) untuk tiap modul di bawah ini.</p>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors active:scale-95"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-surface-container-lowest">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                {modulePermissions.map((mod) => {
                  const modulePerms = selectedRole.permissions[mod.id] || [];
                  const allActionIds = mod.actions.map(a => a.id);
                  const isAllChecked = allActionIds.length > 0 && allActionIds.every(id => modulePerms.includes(id));
                  const isIndeterminate = modulePerms.length > 0 && modulePerms.length < allActionIds.length;

                  return (
                    <div key={mod.id} className="border border-outline-variant/30 rounded-3xl overflow-hidden hover:border-primary/50 transition-colors focus-within:border-primary bg-white shadow-sm">
                      <div className="px-6 py-4 bg-surface-container-lowest border-b border-outline-variant/20 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-on-surface text-lg font-headline">{mod.name}</h3>
                          <p className="text-xs text-on-surface-variant mt-1">Kendalikan operasi data pada modul ini</p>
                        </div>
                        {/* Master Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isAllChecked}
                            onChange={() => checkAllModule(mod.id, mod.actions)}
                            ref={input => {
                              if (input) input.indeterminate = isIndeterminate;
                            }}
                          />
                          <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-all shadow-inner"></div>
                        </label>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {mod.actions.map(action => (
                            <label 
                              key={action.id} 
                              className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                                modulePerms.includes(action.id) 
                                  ? 'border-primary bg-primary/5 shadow-sm' 
                                  : 'border-transparent hover:bg-surface-container'
                              }`}
                            >
                              <div className="relative flex items-center justify-center mt-0.5">
                                <input 
                                  type="checkbox" 
                                  className="peer sr-only"
                                  checked={modulePerms.includes(action.id)}
                                  onChange={() => togglePermission(mod.id, action.id)}
                                />
                                <div className="w-5 h-5 border-2 border-on-surface-variant rounded flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-all">
                                  <span className="material-symbols-outlined text-white text-[14px] opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all font-bold">check</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className={`text-sm font-semibold transition-colors ${modulePerms.includes(action.id) ? 'text-primary' : 'text-on-surface'}`}>
                                  {action.label}
                                </div>
                                <div className="text-[10px] text-on-surface-variant uppercase mt-0.5 font-mono tracking-wider opacity-60">
                                  [{action.id}]
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-outline-variant/30 flex justify-end gap-4 bg-white rounded-b-[2rem]">
              <button 
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all outline-none"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveRole}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Simpan Konfigurasi Akses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedAccess;
