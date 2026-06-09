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
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';
import { DialogModal } from '../../../components/ui/DialogModal';

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
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <PageHeader
        icon="groups"
        title={
          <>
            <span className="text-[var(--theme-text)]">Kelola </span>
            <span className="text-[var(--theme-primary)]">Kelompok & DP</span>
          </>
        }
        subtitle="Buat kelompok orientasi, pasangkan mentor pendamping (DP), dan masukkan banyak mahasiswa ke dalam kelompok."
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Kelompok & Mentor' }
        ]}
        action={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
            <SelectField
              value={selectedPeriodId}
              onValueChange={setSelectedPeriodId}
              placeholder="Pilih Periode"
              className="min-w-[200px]"
            >
              {periods?.map(p => (
                <SelectOption key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectOption>
              ))}
            </SelectField>
            <button
              onClick={openCreate}
              disabled={!selectedPeriodId}
              className="h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold shadow-md disabled:opacity-50 transition-colors shrink-0"
            >
              + Buat Kelompok
            </button>
          </div>
        }
      />

      <div className={`grid grid-cols-1 ${propPortal === 'fakultas' ? '' : 'lg:grid-cols-[1fr_360px]'} gap-6`}>
        <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--theme-border-muted)] flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-[var(--theme-bg)]">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama/kode kelompok..."
                className="h-10 px-4 rounded-xl bg-white border border-[var(--theme-border)] text-sm font-semibold outline-none flex-1 focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]"
              />
              {!isFacultyScoped && (
                <SelectField
                  value={scopeFilter}
                  onValueChange={setScopeFilter}
                  placeholder="Semua Scope"
                  className="min-w-[150px]"
                >
                  <SelectOption value="all">Semua Scope</SelectOption>
                  <SelectOption value="university">University</SelectOption>
                  <SelectOption value="faculty">Fakultas</SelectOption>
                </SelectField>
              )}
              {isFacultyScoped && isSuperAdmin && (
                <SelectField
                  value={selectedFacultyFilter}
                  onValueChange={setSelectedFacultyFilter}
                  placeholder="Pilih Fakultas"
                  className="min-w-[180px]"
                >
                  <SelectOption value="">Pilih Fakultas</SelectOption>
                  {faculties?.map(f => (
                    <SelectOption key={f.id} value={String(f.id)}>
                      {f.nama || f.Nama}
                    </SelectOption>
                  ))}
                </SelectField>
              )}
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-[var(--theme-surface)]">
            {isLoading ? (
              <div className="col-span-full py-16 text-center font-bold text-[var(--theme-text-subtle)]">Memuat kelompok...</div>
            ) : filteredGroups?.length ? (
              filteredGroups.map(group => (
                <div key={group.id} className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] p-5 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black text-[var(--theme-text-subtle)] uppercase tracking-widest">KELOMPOK {group.group_number || '-'} • {group.code || 'Tanpa Kode'}</p>
                        <h3 className="text-base font-bold text-[var(--theme-text)] mt-1">{group.name}</h3>
                        <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Mentor/DP: <span className="text-[var(--theme-primary)] font-bold">{group.mentor_name || '-'}</span></p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--theme-success-light)] text-[var(--theme-success)] border border-[var(--theme-success-light)] text-[9px] font-bold uppercase">{group.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 my-4 text-center">
                      <div className="bg-white rounded-xl p-2.5 border border-[var(--theme-border)]"><p className="text-base font-bold text-[var(--theme-text)]">{group.members_count || 0}</p><p className="text-[9px] font-bold text-[var(--theme-text-subtle)] uppercase mt-0.5">Anggota</p></div>
                      <div className="bg-white rounded-xl p-2.5 border border-[var(--theme-border)]"><p className="text-base font-bold text-[var(--theme-text)]">{group.capacity || 0}</p><p className="text-[9px] font-bold text-[var(--theme-text-subtle)] uppercase mt-0.5">Kapasitas</p></div>
                      <div className="bg-white rounded-xl p-2.5 border border-[var(--theme-border)]"><p className="text-xs font-bold text-[var(--theme-text)] capitalize mt-1.5 truncate">{group.scope_type}</p><p className="text-[9px] font-bold text-[var(--theme-text-subtle)] uppercase">Scope</p></div>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-[var(--theme-border-muted)] pt-3 mt-2">
                    <button onClick={() => navigate(propPortal === 'fakultas' ? `${basePath}/${basePath.includes('fakult') ? 'stages' : 'faculty-stages'}/${selectedFacultyFilter || group.fakultas_id}/groups/${group.id}` : `${basePath}/groups/${group.id}`)} className="flex-1 h-9 rounded-lg bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold transition-colors">Anggota</button>
                    <button onClick={() => openEdit(group)} className="h-9 px-3 rounded-lg bg-white border border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors">Edit</button>
                    <button onClick={() => window.confirm('Hapus kelompok ini?') && deleteGroup.mutate(group.id)} className="h-9 px-3 rounded-lg bg-[var(--theme-error-light)] text-[var(--theme-error)] text-xs font-bold hover:bg-[var(--theme-error-light)]/80 transition-colors">Hapus</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center font-bold text-[var(--theme-text-subtle)]">
                {isFacultyScoped && isSuperAdmin && !selectedFacultyFilter ? 'Pilih fakultas di filter atas untuk melihat kelompok' : 'Belum ada kelompok.'}
              </div>
            )}
          </div>
        </div>

        {propPortal !== 'fakultas' && (
          <form onSubmit={runQuickGroup} className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm p-5 h-fit space-y-4 font-body">
            <div>
              <h2 className="text-base font-bold text-[var(--theme-text)]">Buat Cepat Kelompok</h2>
              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Isi nomor, nama, dan kuota mahasiswa untuk mempercepat pembentukan kelompok.</p>
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Kelompok Ke-</span>
              <input type="number" min="1" value={autoForm.group_number} onChange={e => setAutoForm({ ...autoForm, group_number: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold focus:outline-none focus:border-[var(--theme-primary)]" />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Nama Kelompok</span>
              <input required value={autoForm.group_name} onChange={e => setAutoForm({ ...autoForm, group_name: e.target.value })} placeholder="Contoh: Praja" className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold focus:outline-none focus:border-[var(--theme-primary)]" />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Jumlah Mahasiswa (Kuota)</span>
              <input type="number" min="1" value={autoForm.student_count} onChange={e => setAutoForm({ ...autoForm, student_count: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold focus:outline-none focus:border-[var(--theme-primary)]" />
            </label>
            {!isFacultyScoped && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Scope</span>
                <SelectField
                  value={autoForm.scope_type}
                  onValueChange={(val) => setAutoForm({ ...autoForm, scope_type: val, mentor_id: '' })}
                  className="w-full"
                >
                  <SelectOption value="university">University</SelectOption>
                  <SelectOption value="faculty">Fakultas</SelectOption>
                </SelectField>
              </div>
            )}
            {!isFacultyScoped && autoForm.scope_type === 'faculty' && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Fakultas</span>
                <SelectField
                  value={autoForm.fakultas_id}
                  onValueChange={(val) => setAutoForm({ ...autoForm, fakultas_id: val })}
                  className="w-full"
                >
                  <SelectOption value="">Pilih Fakultas</SelectOption>
                  {faculties?.map(f => (
                    <SelectOption key={f.id} value={String(f.id)}>{f.nama || f.Nama}</SelectOption>
                  ))}
                </SelectField>
              </div>
            )}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Mentor/DP</span>
              <SelectField
                value={autoForm.mentor_id}
                onValueChange={(val) => setAutoForm({ ...autoForm, mentor_id: val })}
                className="w-full"
              >
                <SelectOption value="">Pilih Mentor/DP (opsional)</SelectOption>
                {mentorOptions.map(m => (
                  <SelectOption key={m.id} value={String(m.id)}>{m.name}</SelectOption>
                ))}
              </SelectField>
            </div>
            <div className="rounded-xl bg-[var(--theme-success-light)] border border-[var(--theme-success-light)] p-4 text-xs font-semibold text-[var(--theme-success)]">
              Preview: Kelompok {autoForm.group_number || 1} - {autoForm.group_name || 'Nama'} dengan kapasitas {autoForm.student_count || 0} mahasiswa.
            </div>
            <button
              disabled={!selectedPeriodId || createGroup.isPending}
              className="w-full h-10 px-5 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white text-xs font-bold disabled:opacity-50 transition-colors"
            >
              Buat Kelompok
            </button>
          </form>
        )}
      </div>

      {/* Group Create/Edit Modal */}
      <DialogModal
        open={showForm}
        onOpenChange={setShowForm}
        title={editingGroup ? 'Edit Detail Kelompok' : 'Buat Kelompok Baru'}
        subtitle="Silakan tentukan nomor kelompok, nama kelompok, kuota, dan mentor pembimbing."
        icon={<span className="material-symbols-outlined">{editingGroup ? 'edit_square' : 'group_add'}</span>}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 h-10 rounded-xl border border-[var(--theme-border)] text-xs font-bold uppercase tracking-wider text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg)] transition-colors">
              Batal
            </button>
            <button type="submit" form="groupForm" className="px-6 h-10 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-white shadow-md active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span> Simpan
            </button>
          </>
        }
      >
        <form id="groupForm" onSubmit={saveGroup} className="space-y-4 font-body text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nomor Kelompok</span>
              <input required type="number" min="1" value={form.group_number} onChange={e => setForm({ ...form, group_number: e.target.value })} placeholder="No. Kel." className="w-full h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nama Kelompok</span>
              <input required value={form.name} onChange={e => {
                const newName = e.target.value;
                const newCode = newName.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '');
                setForm({ ...form, name: newName, code: newCode });
              }} placeholder="Contoh: Praja" className="w-full h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Kode Kelompok</span>
            <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Contoh: PRAJA-01" className="w-full h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Deskripsi</span>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi kelompok..." rows="2" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)] resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isFacultyScoped && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Scope</span>
                <SelectField
                  value={form.scope_type}
                  onValueChange={(val) => setForm({ ...form, scope_type: val, mentor_id: '' })}
                  className="w-full"
                >
                  <SelectOption value="university">University</SelectOption>
                  <SelectOption value="faculty">Fakultas</SelectOption>
                </SelectField>
              </div>
            )}
            {((!isFacultyScoped && form.scope_type === 'faculty') || isFacultyScoped) && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Fakultas</span>
                <SelectField
                  value={form.fakultas_id}
                  onValueChange={(val) => setForm({ ...form, fakultas_id: val })}
                  className="w-full"
                >
                  <SelectOption value="">Pilih Fakultas</SelectOption>
                  {faculties?.map(f => (
                    <SelectOption key={f.id} value={String(f.id)}>{f.nama || f.Nama}</SelectOption>
                  ))}
                </SelectField>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Mentor/DP</span>
              <SelectField
                value={form.mentor_id}
                onValueChange={(val) => setForm({ ...form, mentor_id: val })}
                className="w-full"
              >
                <SelectOption value="">Tanpa Mentor</SelectOption>
                {mentorOptions.map(m => (
                  <SelectOption key={m.id} value={String(m.id)}>{m.name}</SelectOption>
                ))}
              </SelectField>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Kuota</span>
              <input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Status Keaktifan</span>
            <SelectField
              value={form.status}
              onValueChange={(val) => setForm({ ...form, status: val })}
              className="w-full"
            >
              <SelectOption value="active">Aktif</SelectOption>
              <SelectOption value="inactive">Nonaktif</SelectOption>
              <SelectOption value="completed">Selesai</SelectOption>
            </SelectField>
          </div>
        </form>
      </DialogModal>
    </div>
  );
};

export default Groups;
