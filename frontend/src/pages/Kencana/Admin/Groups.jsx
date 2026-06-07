import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateGroupMutation,
  useDeleteGroupMutation,
  useFakultasListQuery,
  useGroupsQuery,
  useMentorsQuery,
  usePeriodsQuery,
  useUpdateGroupMutation,
} from '../../../queries/useKencanaAdminQuery';
import useAuthStore from '../../../store/useAuthStore';

const emptyForm = { group_number: '', name: '', code: '', description: '', scope_type: 'university', fakultas_id: '', mentor_id: '', capacity: 30, status: 'active' };

const Groups = ({ portal: propPortal, facultyId: propFacultyId }) => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const role = String(user?.role || '').toLowerCase();
  const isFacultyScoped = propPortal === 'fakultas' || role === 'kencana_fakultas';
  const portal = propPortal || (isFacultyScoped ? 'fakultas' : 'admin');
  const isSuperAdmin = role === 'super_admin' || role === 'kencana_admin';
  const userFacultyId = user?.fakultas_id || user?.FakultasID || '';
  const basePath = window.location.pathname.startsWith('/admin/kencana-univ') ? '/admin/kencana-univ' : window.location.pathname.startsWith('/admin/kencana-fakultas-admin') ? '/admin/kencana-fakultas-admin' : window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';

  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [autoForm, setAutoForm] = useState({ group_number: 1, group_name: 'Praja', student_count: 30, scope_type: 'university', fakultas_id: '', mentor_id: '' });

  const { data: periods } = usePeriodsQuery();
  const { data: faculties } = useFakultasListQuery();
  const { data: mentors } = useMentorsQuery(portal);
  const { data: groups, isLoading } = useGroupsQuery({ period_id: selectedPeriodId, search, scope_type: isFacultyScoped ? 'faculty' : scopeFilter }, portal);
  const createGroup = useCreateGroupMutation(portal);
  const updateGroup = useUpdateGroupMutation(portal);
  const deleteGroup = useDeleteGroupMutation(portal);

  useEffect(() => {
    if (!selectedPeriodId && periods?.length) {
      const active = periods.find(p => p.status === 'active' || p.status === 'published') || periods[0];
      setSelectedPeriodId(String(active.id));
    }
  }, [periods, selectedPeriodId]);

  useEffect(() => {
    if (propFacultyId && String(selectedFacultyFilter) !== String(propFacultyId)) {
      setSelectedFacultyFilter(propFacultyId);
    } else if (!selectedFacultyFilter && userFacultyId) {
      setSelectedFacultyFilter(userFacultyId);
    }
  }, [propFacultyId, userFacultyId]);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (isFacultyScoped) {
       const activeId = isSuperAdmin ? selectedFacultyFilter : userFacultyId;
       if (activeId) {
         return groups.filter(g => String(g.fakultas_id) === String(activeId));
       }
       return [];
    }
    return groups;
  }, [groups, isFacultyScoped, isSuperAdmin, selectedFacultyFilter, userFacultyId]);

  const mentorOptions = useMemo(() => {
    const scope = isFacultyScoped ? 'faculty' : form.scope_type;
    return (mentors || []).filter(m => {
      if (scope && m.scope_type !== scope && m.scope_type) return false;
      if (scope === 'faculty') {
         const activeId = isSuperAdmin ? selectedFacultyFilter : userFacultyId;
         if (activeId && String(m.fakultas_id) !== String(activeId)) return false;
      }
      return true;
    });
  }, [mentors, form.scope_type, isFacultyScoped, isSuperAdmin, selectedFacultyFilter, userFacultyId]);

  const openCreate = () => {
    if (!selectedPeriodId) {
      alert("Silakan pilih/buat periode Kencana terlebih dahulu di bagian atas halaman!");
      return;
    }
    setEditingGroup(null);
    setForm({ ...emptyForm, scope_type: isFacultyScoped ? 'faculty' : 'university', fakultas_id: isFacultyScoped ? (selectedFacultyFilter || '') : '' });
    setShowForm(true);
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setForm({
      group_number: group.group_number || '', name: group.name || '', code: group.code || '', description: group.description || '', scope_type: group.scope_type || 'university',
      fakultas_id: group.fakultas_id || '', mentor_id: group.mentor_id || '', capacity: group.capacity || 30, status: group.status || 'active',
    });
    setShowForm(true);
  };

  const saveGroup = (e) => {
    e.preventDefault();
    const payload = { ...form, period_id: Number(selectedPeriodId), group_number: form.group_number ? Number(form.group_number) : 0, capacity: Number(form.capacity), mentor_id: form.mentor_id ? Number(form.mentor_id) : null, fakultas_id: form.fakultas_id ? Number(form.fakultas_id) : null };
    if (payload.scope_type === 'university') payload.fakultas_id = null;
    const mutation = editingGroup ? updateGroup : createGroup;
    mutation.mutate(editingGroup ? { id: editingGroup.id, ...payload } : payload, { onSuccess: () => setShowForm(false) });
  };

  const runQuickGroup = (e) => {
    e.preventDefault();
    const number = Number(autoForm.group_number);
    const name = autoForm.group_name.trim();
    const codeName = name.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '') || 'KENCANA';
    const payload = {
      period_id: Number(selectedPeriodId),
      group_number: number,
      name: `Kelompok ${number} - ${name}`,
      code: `KEL-${String(number).padStart(2, '0')}-${codeName}`,
      capacity: Number(autoForm.student_count),
      scope_type: isFacultyScoped ? 'faculty' : autoForm.scope_type,
      fakultas_id: autoForm.fakultas_id ? Number(autoForm.fakultas_id) : null,
      mentor_id: autoForm.mentor_id ? Number(autoForm.mentor_id) : null,
      status: 'active',
    };
    if (payload.scope_type === 'university') payload.fakultas_id = null;
    createGroup.mutate(payload);
  };

  return (
    <div className="space-y-5">
      {/* Header: toolbar for fakultas, full hero for admin */}
      {propPortal === 'fakultas' ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800">Kelola Kelompok & DP</h2>
            <p className="text-sm text-slate-500 mt-1">Buat kelompok, assign mentor/DP, dan masukkan mahasiswa.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={selectedPeriodId} onChange={e => setSelectedPeriodId(e.target.value)} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
              <option value="">Pilih Periode</option>
              {periods?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {isSuperAdmin && (
              <select value={selectedFacultyFilter} onChange={e => setSelectedFacultyFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                <option value="">Pilih Fakultas</option>
                {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
              </select>
            )}
            <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span> Buat Kelompok
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary via-[#152F58] to-[#0D1C36] shadow-xl rounded-[2rem] p-6 md:p-8 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-[0.05] blur-2xl rounded-full" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Kelompok Kencana</p>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-2">Kelola Kelompok & DP</h1>
              <p className="text-sm text-white/70 mt-2 max-w-2xl font-medium leading-relaxed">Buat kelompok seperti Praja, assign 1 mentor/DP, lalu masukkan banyak mahasiswa ke dalam kelompok.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={selectedPeriodId} onChange={e => setSelectedPeriodId(e.target.value)} className="px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold outline-none">
                <option value="" className="text-slate-800">Pilih Periode</option>
                {periods?.map(p => <option key={p.id} value={p.id} className="text-slate-800">{p.name}</option>)}
              </select>
              <button onClick={openCreate} className="px-7 py-3.5 rounded-xl bg-white text-primary text-sm font-black transition-all flex items-center gap-2 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[18px]">add_circle</span> Buat Kelompok
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${propPortal === 'fakultas' ? '' : 'lg:grid-cols-[1fr_360px]'} gap-6`}>
        <div className={`bg-white overflow-hidden ${propPortal === 'fakultas' ? 'rounded-2xl border border-slate-200' : 'rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20'}`}>
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/kode kelompok..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
            </div>
            {!isFacultyScoped && <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-primary transition-all"><option value="all">Semua Scope</option><option value="university">University</option><option value="faculty">Fakultas</option></select>}
            {isFacultyScoped && isSuperAdmin && !propPortal && (
              <select value={selectedFacultyFilter} onChange={e => setSelectedFacultyFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:border-primary transition-all">
                <option value="">Pilih Fakultas</option>
                {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
              </select>
            )}
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? <div className="col-span-full py-16 text-center font-bold text-slate-400">Memuat kelompok...</div> : filteredGroups?.length ? filteredGroups.map(group => (
              <div key={group.id} className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-primary/30 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">KELOMPOK {group.group_number || '-'} • {group.code || 'Tanpa Kode'}</p>
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{group.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">person</span> {group.mentor_name || 'Tanpa Mentor'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${group.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>{group.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 my-5 text-center">
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-primary/5 transition-colors"><p className="text-xl font-black text-slate-800">{group.members_count || 0}</p><p className="text-[10px] font-bold text-slate-400">Anggota</p></div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-primary/5 transition-colors"><p className="text-xl font-black text-slate-800">{group.capacity || 0}</p><p className="text-[10px] font-bold text-slate-400">Kapasitas</p></div>
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-primary/5 transition-colors"><p className="text-sm font-black text-slate-800 capitalize mt-1.5">{group.scope_type}</p><p className="text-[10px] font-bold text-slate-400">Scope</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(propPortal === 'fakultas' ? `${basePath}/${basePath.includes('fakult') ? 'stages' : 'faculty-stages'}/${selectedFacultyFilter || group.fakultas_id}/groups/${group.id}` : `${basePath}/groups/${group.id}`)} className="flex-1 py-2.5 rounded-xl bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white text-xs font-black transition-colors flex justify-center items-center gap-2">Kelola Anggota <span className="material-symbols-outlined text-[14px]">arrow_forward</span></button>
                  <button onClick={() => openEdit(group)} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-black text-slate-600 transition-colors"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                  <button onClick={() => window.confirm('Hapus kelompok ini?') && deleteGroup.mutate(group.id)} className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center">
                <div className="w-24 h-24 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <span className="material-symbols-outlined text-[48px] text-primary">groups</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800">Belum Ada Kelompok</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">{isFacultyScoped && isSuperAdmin && !selectedFacultyFilter ? 'Silakan pilih fakultas terlebih dahulu di form atas untuk melihat daftar kelompok.' : 'Daftar kelompok akan muncul di sini setelah Anda membuatnya.'}</p>
                <button onClick={openCreate} className="mt-8 px-8 py-4 rounded-full bg-primary text-white text-sm font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 mx-auto">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span> Buat Kelompok Baru
                </button>
              </div>
            )}
          </div>
        </div>

        {propPortal !== 'fakultas' && (
        <form onSubmit={runQuickGroup} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 p-8 h-fit space-y-5">
          <div><h2 className="text-xl font-black text-slate-800">Buat Cepat Kelompok</h2><p className="text-xs font-semibold text-slate-500 mt-1.5 leading-relaxed">Isi nomor, nama, dan jumlah mahasiswa. Contoh: Kelompok 1 - Praja, 30 mahasiswa.</p></div>
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-primary">Kelompok Berapa?</label>
            <input type="number" min="1" value={autoForm.group_number} onChange={e => setAutoForm({ ...autoForm, group_number: e.target.value })} className="w-full pb-2 pt-1 bg-transparent border-b-2 border-slate-200 focus:border-primary text-sm font-bold text-slate-800 transition-all outline-none" />
          </div>
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-primary">Nama Kelompok Apa?</label>
            <input required value={autoForm.group_name} onChange={e => setAutoForm({ ...autoForm, group_name: e.target.value })} placeholder="Contoh: Praja" className="w-full pb-2 pt-1 bg-transparent border-b-2 border-slate-200 focus:border-primary text-sm font-bold text-slate-800 transition-all outline-none placeholder:text-slate-300" />
          </div>
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-primary">Jumlah Mahasiswa Berapa?</label>
            <input type="number" min="1" value={autoForm.student_count} onChange={e => setAutoForm({ ...autoForm, student_count: e.target.value })} className="w-full pb-2 pt-1 bg-transparent border-b-2 border-slate-200 focus:border-primary text-sm font-bold text-slate-800 transition-all outline-none" />
          </div>
          {!isFacultyScoped && (
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-primary">Scope</label>
              <select value={autoForm.scope_type} onChange={e => setAutoForm({ ...autoForm, scope_type: e.target.value, mentor_id: '' })} className="w-full pb-2 pt-1 bg-transparent border-b-2 border-slate-200 focus:border-primary text-sm font-bold text-slate-800 transition-all outline-none"><option value="university">University</option><option value="faculty">Fakultas</option></select>
            </div>
          )}
          {!isFacultyScoped && autoForm.scope_type === 'faculty' && (
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-primary">Pilih Fakultas</label>
              <select value={autoForm.fakultas_id} onChange={e => setAutoForm({ ...autoForm, fakultas_id: e.target.value })} className="w-full pb-2 pt-1 bg-transparent border-b-2 border-slate-200 focus:border-primary text-sm font-bold text-slate-800 transition-all outline-none"><option value="">Pilih Fakultas</option>{faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}</select>
            </div>
          )}
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 transition-colors group-focus-within:text-primary">Pilih Mentor/DP (opsional)</label>
            <select value={autoForm.mentor_id} onChange={e => setAutoForm({ ...autoForm, mentor_id: e.target.value })} className="w-full pb-2 pt-1 bg-transparent border-b-2 border-slate-200 focus:border-primary text-sm font-bold text-slate-800 transition-all outline-none"><option value="">Tanpa Mentor</option>{mentorOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          </div>
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-xs font-bold text-primary leading-relaxed">Preview: Kelompok {autoForm.group_number || 1} - {autoForm.group_name || 'Nama'} dengan kapasitas {autoForm.student_count || 0} mahasiswa.</div>
          <button disabled={!selectedPeriodId || createGroup.isPending} className="w-full px-5 py-4 rounded-full bg-primary text-white text-sm font-black disabled:opacity-50 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mt-4">Buat Kelompok Secara Cepat</button>
        </form>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="relative w-full max-w-2xl glass-card rounded-2xl shadow-2xl border border-slate-200/60 flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#00236F] via-[#00308F] to-[#003db5] pt-6 pb-6 px-6 overflow-hidden flex-shrink-0 text-left">
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute -bottom-6 right-16 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
              <button type="button" onClick={() => setShowForm(false)}
                className="absolute z-50 top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '15px' }}>close</span>
              </button>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
                  <span className="material-symbols-outlined">{editingGroup ? 'edit_square' : 'group_add'}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.25em] mb-1">
                    {editingGroup ? 'Edit Kelompok Kencana' : 'Buat Kelompok Baru'}
                  </p>
                  <h2 className="text-base font-extrabold font-headline leading-tight text-white">
                    {editingGroup ? 'Edit Kelompok' : 'Buat Kelompok Baru'}
                  </h2>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">
                    {editingGroup ? 'Ubah informasi kelompok Kencana' : 'Tambahkan kelompok mahasiswa Kencana'}
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={saveGroup} className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1 font-inter text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. Kelompok</label>
                  <input required type="number" min="1" value={form.group_number} onChange={e => setForm({ ...form, group_number: e.target.value })} placeholder="Cth: 1" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kelompok</label>
                  <input required value={form.name} onChange={e => {
                    const newName = e.target.value;
                    const newCode = newName.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
                    setForm({ ...form, name: newName, code: newCode });
                  }} placeholder="Contoh: Praja" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kode Kelompok</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="KODE OTOMATIS (Bisa diubah)" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tuliskan deskripsi singkat kelompok ini..." rows="2" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isFacultyScoped && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</label>
                    <select value={form.scope_type} onChange={e => setForm({ ...form, scope_type: e.target.value, mentor_id: '' })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all">
                      <option value="university">University</option>
                      <option value="faculty">Fakultas</option>
                    </select>
                  </div>
                )}
                {(!isFacultyScoped && form.scope_type === 'faculty') || isFacultyScoped ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pilih Fakultas</label>
                    <select value={form.fakultas_id} onChange={e => setForm({ ...form, fakultas_id: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all">
                      <option value="">Pilih Fakultas</option>
                      {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mentor / DP</label>
                  <select value={form.mentor_id} onChange={e => setForm({ ...form, mentor_id: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all">
                    <option value="">Tanpa Mentor</option>
                    {mentorOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kapasitas</label>
                  <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold transition-all">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                  <option value="completed">Selesai</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 flex-shrink-0">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/95 text-white shadow-md active:scale-95 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">save</span> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
