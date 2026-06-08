import React, { useMemo, useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import { useCreateMentorMutation, useMentorsQuery, useFakultasListQuery } from '../../../queries/useKencanaAdminQuery';
import { DashboardHero } from '@/components/ui/dashboard';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const emptyForm = { name: '', email: '', password: '', phone: '', scope_type: 'faculty', fakultas_id: '' };

const Mentors = ({ portal = 'admin', facultyId: propFacultyId }) => {
  const user = useAuthStore((state) => state.user);
  const role = String(user?.role || '').toLowerCase();
  const isFakultasPortal = portal === 'fakultas' || portal === 'fakult' || role === 'kencana_fakultas';
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  
  // Table interactivity states
  const [search, setSearch] = useState('');
  const [filterScope, setFilterScope] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: mentors, isLoading } = useMentorsQuery(portal);
  const createMentor = useCreateMentorMutation(portal);

  const { data: faculties } = useFakultasListQuery();

  const userFacultyId = user?.fakultas_id || user?.FakultasID || '';
  const isSuperAdmin = role === 'super_admin' || role === 'kencana_admin';

  const effectiveForm = useMemo(() => ({
    ...form,
    scope_type: isFakultasPortal ? 'faculty' : 'university',
    fakultas_id: isFakultasPortal ? (isSuperAdmin ? Number(form.fakultas_id) : Number(userFacultyId)) : 0,
  }), [form, isFakultasPortal, isSuperAdmin, userFacultyId]);

  useEffect(() => {
    if (propFacultyId && String(form.fakultas_id) !== String(propFacultyId)) {
      setForm(prev => ({ ...prev, fakultas_id: propFacultyId }));
    }
  }, [propFacultyId]);

  const filteredMentors = useMemo(() => {
    if (!mentors) return [];
    if (isFakultasPortal) {
      const activeFacultyId = isSuperAdmin ? form.fakultas_id : userFacultyId;
      if (activeFacultyId) {
        return mentors.filter(m => String(m.fakultas_id) === String(activeFacultyId));
      }
      return []; // Return empty if no faculty selected in dropdown
    }
    return mentors;
  }, [mentors, isFakultasPortal, isSuperAdmin, form.fakultas_id, userFacultyId]);

  const processedMentors = useMemo(() => {
    let items = [...filteredMentors];

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(m => 
        (m.name || m.Name || '').toLowerCase().includes(q) || 
        (m.email || m.Email || '').toLowerCase().includes(q)
      );
    }

    if (filterScope !== 'all') {
      items = items.filter(m => (m.scope_type || '') === filterScope);
    }

    if (filterStatus !== 'all') {
      items = items.filter(m => (m.status || 'aktif').toLowerCase() === filterStatus.toLowerCase());
    }

    if (sortConfig.key) {
      items.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'name') {
          aVal = a.name || a.Name || '';
          bVal = b.name || b.Name || '';
        } else if (sortConfig.key === 'email') {
          aVal = a.email || a.Email || '';
          bVal = b.email || b.Email || '';
        }

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [filteredMentors, search, filterScope, filterStatus, sortConfig]);

  const paginatedMentors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedMentors.slice(start, start + pageSize);
  }, [processedMentors, currentPage, pageSize]);

  const totalItems = processedMentors.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const hasPermission = role === 'super_admin' ||
    (role === 'kencana_fakultas' && isFakultasPortal) ||
    (role === 'kencana_admin' && !isFakultasPortal) ||
    (isFakultasPortal ? user?.permissions?.includes('kencana.faculty.mentor.manage')
                       : user?.permissions?.includes('kencana.mentor.university.manage'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createMentor.mutateAsync(effectiveForm);
      setForm(emptyForm);
      setMessage('Akun Dewan Pembimbing berhasil dibuat.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Gagal membuat akun Dewan Pembimbing.');
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHero 
        title="Dewan"
        highlightedTitle="Pembimbing"
        subtitle={isFakultasPortal ? 'Admin fakultas hanya membuat mentor untuk fakultasnya.' : 'Admin universitas hanya membuat mentor lingkup universitas.'}
        icon="groups"
        badges={[
          { label: 'PORTAL ORIENTASI MAHASISWA BARU', active: false },
          { label: `${filteredMentors?.length || 0} TOTAL PEMBIMBING`, active: true }
        ]}
      />

      {hasPermission ? (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white shadow-sm relative overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-100">
            <h2 className="text-xl font-headline font-black text-slate-800 tracking-tight">Registrasi Pembimbing Baru</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Lengkapi form di bawah untuk menambahkan akun mentor.</p>
          </div>
          <div className="p-6 md:p-8 bg-slate-50/30">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Nama Lengkap">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400 placeholder:font-semibold" placeholder="Contoh: Budi Santoso" />
              </Field>
              <Field label="Email">
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400 placeholder:font-semibold" placeholder="mentor@bku.ac.id" />
              </Field>
              <Field label="Password">
                <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400 placeholder:font-semibold" placeholder="Minimal 6 karakter" />
              </Field>
              <Field label="Nomor Telepon">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400 placeholder:font-semibold" placeholder="Opsional (contoh: 0812...)" />
              </Field>
              {!isFakultasPortal && (
                <Field label="Lingkup Akses">
                  <input disabled value="Kencana Universitas" className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed" />
                </Field>
              )}
              {isFakultasPortal && (
                <Field label="Pilih Fakultas">
                  {isSuperAdmin ? (
                    <select
                      required
                      value={form.fakultas_id}
                      onChange={(e) => setForm({ ...form, fakultas_id: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none"
                    >
                      <option value="">Pilih Fakultas...</option>
                      {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
                    </select>
                  ) : (
                    <input
                      disabled
                      value={userFacultyId ? (faculties?.find(f => String(f.id) === String(userFacultyId))?.nama || faculties?.find(f => String(f.id) === String(userFacultyId))?.Nama || `Fakultas ID ${userFacultyId}`) : 'Fakultas akun belum tersedia'}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed"
                    />
                  )}
                </Field>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button disabled={createMentor.isPending || (isFakultasPortal && (!form.fakultas_id && !userFacultyId))} className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-xs tracking-wider font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-slate-300 transition-colors shadow-sm">
                {createMentor.isPending ? 'Mendaftarkan...' : '+ Daftarkan Pembimbing'}
              </button>
              {message && <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">{message}</p>}
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-headline font-black text-amber-800 mb-2">Akses Dibatasi (Hanya Lihat)</h2>
          <p className="text-sm font-medium text-amber-700 leading-relaxed">
            Anda tidak memiliki izin (permission) untuk membuat atau mengelola mentor baru. Anda hanya dapat melihat daftar mentor yang sudah ada. 
            Jika Anda memerlukan akses ini, silakan hubungi Super Admin untuk mengaktifkannya di panel RBAC.
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="font-bold text-base text-slate-900">Daftar Pembimbing Aktif</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan <span className="font-bold text-slate-900">{processedMentors.length}</span> dari <span className="font-bold text-slate-900">{filteredMentors.length}</span> pembimbing
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 gap-y-3 w-full sm:w-auto">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '14px' }}>search</span>
              <input type="text" placeholder="Cari nama atau email..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 h-9 w-52 rounded-xl border border-slate-200/60 focus:outline-none focus:border-cyan-500 text-sm bg-white" />
            </div>
            {!isFakultasPortal && (
              <div className="relative">
                <select value={filterScope} onChange={e => setFilterScope(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer">
                  <option value="all">Semua Lingkup</option>
                  <option value="university">Universitas</option>
                  <option value="faculty">Fakultas</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
              </div>
            )}
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-9 pl-3 pr-8 rounded-xl border border-slate-200/60 text-xs font-medium bg-white text-slate-600 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none select-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
            </div>
            {(search || filterScope !== 'all' || filterStatus !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterScope('all'); setFilterStatus('all'); }}
                className="h-9 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100">Reset</button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center gap-3 text-slate-500 font-bold">
              <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" /> Memuat Data...
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60">
                  {[
                    { label: 'No', key: null, sortable: false },
                    { label: 'Nama Pembimbing', key: 'name', sortable: true },
                    { label: 'Email', key: 'email', sortable: true },
                    { label: 'Lingkup', key: 'scope_type', sortable: true },
                    { label: 'Status', key: 'status', sortable: true },
                  ].map(h => (
                    <th
                      key={h.label}
                      onClick={() => h.sortable && handleSort(h.key)}
                      className={cn(
                        'px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap select-none',
                        h.sortable && 'cursor-pointer hover:text-slate-900 group'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {h.label}
                        {h.sortable && (
                          sortConfig.key === h.key ? (
                            <span className="material-symbols-outlined size-3.5 text-slate-800" style={{ fontSize: '14px' }}>
                              {sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more'}
                            </span>
                          ) : (
                            <span className="material-symbols-outlined size-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '14px' }}>
                              unfold_more
                            </span>
                          )
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedMentors?.map((m, i) => (
                  <tr key={m.id || m.ID} className="border-b border-[#f5f5f5] hover:bg-[#fafbff] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-400 font-medium">{(currentPage - 1) * pageSize + i + 1}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 text-sm">{m.name || m.Name || `User ID: ${m.user_id}`}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-500 text-sm">{m.email || m.Email || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-600">
                        {m.scope_type === 'university' ? 'Universitas' : `Fakultas${m.fakultas_id ? ` ID ${m.fakultas_id}` : ''}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-200 bg-emerald-50 text-emerald-600">
                        {m.status || 'Aktif'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!paginatedMentors?.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-2xl flex items-center justify-center text-blue-600"><span className="material-symbols-outlined">group_off</span></div>
                        <p className="font-bold text-sm text-slate-900">Tidak Ada Data</p>
                        <p className="text-xs text-slate-400">
                          {isFakultasPortal && isSuperAdmin && !form.fakultas_id ? 'Pilih fakultas di form atas untuk melihat daftar pembimbing.' : 'Tidak ada pembimbing yang sesuai dengan filter atau belum terdaftar.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Modern Pagination Footer */}
        {!isLoading && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
                Menampilkan <span className="font-semibold text-slate-800">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</span> dari <span className="font-semibold text-slate-800">{totalItems}</span> entri
              </p>

              <div className="hidden sm:block h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Baris per halaman:</span>
                <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
                  <SelectTrigger className="h-8 w-24 rounded-lg border-slate-200 bg-white font-semibold text-xs shadow-sm focus:ring-cyan-500/20 px-2.5 py-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1 font-body">
                    {[5, 10, 15, 25, 50].map((size) => (
                      <SelectItem key={size} value={String(size)} className="rounded-lg text-xs py-1.5 focus:bg-cyan-500/5 focus:text-cyan-600">
                        {size} Baris
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined mr-1" style={{ fontSize: '15px' }}>chevron_left</span>
                Sebelumnya
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200",
                        currentPage === pageNum
                          ? "bg-slate-800 text-white shadow-md scale-105"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading || totalPages === 0}
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-slate-600 font-semibold text-xs shadow-sm disabled:opacity-40 hover:bg-slate-50 transition-all active:scale-95"
              >
                Berikutnya
                <span className="material-symbols-outlined ml-1" style={{ fontSize: '15px' }}>chevron_right</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function Field({ label, children }) {
  return <label className="space-y-2.5"><span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>{children}</label>;
}

export default Mentors;
