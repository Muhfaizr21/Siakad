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
  const basePath = window.location.pathname.startsWith('/kencana-fakultas') ? '/kencana-fakultas' : window.location.pathname.startsWith('/kencana-fakult') ? '/kencana-fakult' : '/kencana-admin';

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-56 h-56 bg-emerald-400/20 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.28em]">Kelompok Kencana</p>
            <h1 className="text-3xl md:text-4xl font-black text-white mt-2">Kelola Kelompok & DP</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">Buat kelompok seperti Praja, assign 1 mentor/DP, lalu masukkan banyak mahasiswa ke dalam kelompok.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedPeriodId} onChange={e => setSelectedPeriodId(e.target.value)} className="px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-sm font-bold outline-none">
              <option value="" className="text-slate-800">Pilih Periode</option>
              {periods?.map(p => <option key={p.id} value={p.id} className="text-slate-800">{p.name}</option>)}
            </select>
            <button onClick={openCreate} disabled={!selectedPeriodId} className="px-5 py-3 rounded-2xl bg-emerald-400 text-slate-950 text-sm font-black disabled:opacity-50">+ Buat Kelompok</button>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${propPortal === 'fakultas' ? '' : 'lg:grid-cols-[1fr_360px]'} gap-6`}>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/kode kelompok..." className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none flex-1" />
              {!isFacultyScoped && <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)} className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="all">Semua Scope</option><option value="university">University</option><option value="faculty">Fakultas</option></select>}
              {isFacultyScoped && isSuperAdmin && (
                <select value={selectedFacultyFilter} onChange={e => setSelectedFacultyFilter(e.target.value)} className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold">
                  <option value="">Pilih Fakultas</option>
                  {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? <div className="col-span-full py-16 text-center font-bold text-slate-400">Memuat kelompok...</div> : filteredGroups?.length ? filteredGroups.map(group => (
              <div key={group.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KELOMPOK {group.group_number || '-'} • {group.code || 'Tanpa Kode'}</p>
                    <h3 className="text-lg font-black text-slate-800 mt-1">{group.name}</h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1">Mentor: {group.mentor_name || '-'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">{group.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="bg-white rounded-2xl p-3 border border-slate-100"><p className="text-lg font-black text-slate-800">{group.members_count || 0}</p><p className="text-[10px] font-bold text-slate-400">Anggota</p></div>
                  <div className="bg-white rounded-2xl p-3 border border-slate-100"><p className="text-lg font-black text-slate-800">{group.capacity || 0}</p><p className="text-[10px] font-bold text-slate-400">Kapasitas</p></div>
                  <div className="bg-white rounded-2xl p-3 border border-slate-100"><p className="text-xs font-black text-slate-800 capitalize mt-1">{group.scope_type}</p><p className="text-[10px] font-bold text-slate-400">Scope</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(propPortal === 'fakultas' ? `${basePath}/${basePath.includes('fakult') ? 'stages' : 'faculty-stages'}/${selectedFacultyFilter || group.fakultas_id}/groups/${group.id}` : `${basePath}/groups/${group.id}`)} className="flex-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black">Kelola Anggota</button>
                  <button onClick={() => openEdit(group)} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-600">Edit</button>
                  <button onClick={() => window.confirm('Hapus kelompok ini?') && deleteGroup.mutate(group.id)} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-black">Hapus</button>
                </div>
              </div>
            )) : <div className="col-span-full py-16 text-center font-bold text-slate-400">
              {isFacultyScoped && isSuperAdmin && !selectedFacultyFilter ? 'Pilih fakultas di form atas untuk melihat kelompok' : 'Belum ada kelompok.'}
            </div>}
          </div>
        </div>

        {propPortal !== 'fakultas' && (
        <form onSubmit={runQuickGroup} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 h-fit space-y-4">
          <div><h2 className="text-lg font-black text-slate-800">Buat Cepat Kelompok</h2><p className="text-xs font-semibold text-slate-500 mt-1">Isi nomor, nama, dan jumlah mahasiswa. Contoh: Kelompok 1 - Praja, 30 mahasiswa.</p></div>
          <label className="block space-y-1.5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Kelompok Berapa?</span><input type="number" min="1" value={autoForm.group_number} onChange={e => setAutoForm({ ...autoForm, group_number: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" /></label>
          <label className="block space-y-1.5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Nama Kelompok Apa?</span><input required value={autoForm.group_name} onChange={e => setAutoForm({ ...autoForm, group_name: e.target.value })} placeholder="Contoh: Praja" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" /></label>
          <label className="block space-y-1.5"><span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Jumlah Mahasiswa Berapa?</span><input type="number" min="1" value={autoForm.student_count} onChange={e => setAutoForm({ ...autoForm, student_count: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" /></label>
          {!isFacultyScoped && <select value={autoForm.scope_type} onChange={e => setAutoForm({ ...autoForm, scope_type: e.target.value, mentor_id: '' })} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="university">University</option><option value="faculty">Fakultas</option></select>}
          {!isFacultyScoped && autoForm.scope_type === 'faculty' && <select value={autoForm.fakultas_id} onChange={e => setAutoForm({ ...autoForm, fakultas_id: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="">Pilih Fakultas</option>{faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}</select>}
          <select value={autoForm.mentor_id} onChange={e => setAutoForm({ ...autoForm, mentor_id: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="">Pilih Mentor/DP (opsional)</option>{mentorOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-800">Preview: Kelompok {autoForm.group_number || 1} - {autoForm.group_name || 'Nama'} dengan kapasitas {autoForm.student_count || 0} mahasiswa.</div>
          <button disabled={!selectedPeriodId || createGroup.isPending} className="w-full px-5 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black disabled:opacity-50">Buat Kelompok</button>
        </form>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 lg:left-72 z-[70] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between"><h2 className="text-xl font-black text-slate-800">{editingGroup ? 'Edit Kelompok' : 'Buat Kelompok'}</h2><button onClick={() => setShowForm(false)} className="font-black text-slate-400">x</button></div>
            <form onSubmit={saveGroup} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input required type="number" min="1" value={form.group_number} onChange={e => setForm({ ...form, group_number: e.target.value })} placeholder="No. Kel." className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" />
                <input required value={form.name} onChange={e => {
                  const newName = e.target.value;
                  const newCode = newName.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
                  setForm({ ...form, name: newName, code: newCode });
                }} placeholder="Nama kelompok, contoh Praja" className="md:col-span-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" />
              </div>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Kode, contoh PRAJA-01" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi kelompok" rows="3" className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isFacultyScoped && <select value={form.scope_type} onChange={e => setForm({ ...form, scope_type: e.target.value, mentor_id: '' })} className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="university">University</option><option value="faculty">Fakultas</option></select>}
                {(!isFacultyScoped && form.scope_type === 'faculty') || isFacultyScoped ? (
                  <select
                    value={form.fakultas_id}
                    onChange={e => setForm({ ...form, fakultas_id: e.target.value })}
                    className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"
                  >
                    <option value="">Pilih Fakultas</option>
                    {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
                  </select>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><select value={form.mentor_id} onChange={e => setForm({ ...form, mentor_id: e.target.value })} className="md:col-span-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="">Tanpa Mentor</option>{mentorOptions.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select><input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold" /></div>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold"><option value="active">Aktif</option><option value="inactive">Nonaktif</option><option value="completed">Selesai</option></select>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100"><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl font-bold text-slate-500">Batal</button><button className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-black">Simpan</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
