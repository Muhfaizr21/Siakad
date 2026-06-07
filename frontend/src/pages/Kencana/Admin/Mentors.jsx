import React, { useMemo, useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import { useCreateMentorMutation, useMentorsQuery, useFakultasListQuery } from '../../../queries/useKencanaAdminQuery';
import { PageHeader } from '../../../components/ui/page/PageHeader';
import { SelectField, SelectOption } from '../../../components/ui/SelectField';

const emptyForm = { name: '', email: '', password: '', phone: '', scope_type: 'faculty', fakultas_id: '' };

const Mentors = ({ portal = 'admin', facultyId: propFacultyId }) => {
  const user = useAuthStore((state) => state.user);
  const role = String(user?.role || '').toLowerCase();
  const isFakultasPortal = portal === 'fakultas' || portal === 'fakult' || role === 'kencana_fakultas';
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
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
    <div className="px-4 py-6 md:px-6 lg:px-8 min-h-screen bg-transparent font-body max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <PageHeader
        icon="supervised_user_circle"
        title={
          <>
            <span className="text-[var(--theme-text)]">Kelola Dewan </span>
            <span className="text-[var(--theme-primary)]">Pembimbing (DP)</span>
          </>
        }
        subtitle={isFakultasPortal ? 'Admin fakultas hanya membuat mentor untuk fakultasnya.' : 'Admin universitas hanya membuat mentor lingkup universitas.'}
        breadcrumbs={[
          { label: 'Kencana Admin', path: '#' },
          { label: 'Dewan Pembimbing' }
        ]}
      />

      {hasPermission ? (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--theme-border)] bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[var(--theme-text)] uppercase tracking-wider border-b border-[var(--theme-border-muted)] pb-2">Buat Akun Mentor Baru</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Nama Lengkap">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" placeholder="Nama pembimbing" />
            </Field>
            <Field label="Email Resmi">
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" placeholder="mentor@bku.ac.id" />
            </Field>
            <Field label="Password Akun">
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" placeholder="Minimal 6 karakter" />
            </Field>
            <Field label="Nomor Telepon">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm font-semibold outline-none focus:ring-2 focus:ring-[var(--theme-primary-light)] focus:border-[var(--theme-primary)]" placeholder="Contoh: 081234567890" />
            </Field>
            {!isFakultasPortal && (
              <Field label="Scope Mentor">
                <input disabled value="Universitas" className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] text-sm font-semibold" />
              </Field>
            )}
            {isFakultasPortal && (
              <Field label="Scope Fakultas">
                {isSuperAdmin ? (
                  <SelectField
                    value={form.fakultas_id}
                    onValueChange={(val) => setForm({ ...form, fakultas_id: val })}
                    placeholder="Pilih Fakultas"
                    className="w-full"
                  >
                    <SelectOption value="">Pilih Fakultas</SelectOption>
                    {faculties?.map(f => <SelectOption key={f.id} value={String(f.id)}>{f.nama || f.Nama}</SelectOption>)}
                  </SelectField>
                ) : (
                  <input
                    disabled
                    value={userFacultyId ? (faculties?.find(f => String(f.id) === String(userFacultyId))?.nama || faculties?.find(f => String(f.id) === String(userFacultyId))?.Nama || `Fakultas ID ${userFacultyId}`) : 'Fakultas akun belum tersedia'}
                    className="w-full h-10 px-4 rounded-xl bg-[var(--theme-bg)] text-[var(--theme-text-muted)] border border-[var(--theme-border)] text-sm font-semibold"
                  />
                )}
              </Field>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4 pt-3 border-t border-[var(--theme-border-muted)]">
            <button disabled={createMentor.isPending || (isFakultasPortal && (!form.fakultas_id && !userFacultyId))} className="h-10 px-6 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-hover)] text-xs font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 transition-colors">
              {createMentor.isPending ? 'Membuat...' : 'Buat Akun Mentor'}
            </button>
            {message && <p className="text-sm font-bold text-[var(--theme-text-muted)]">{message}</p>}
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-[var(--theme-warning-light)] bg-[var(--theme-warning-light)] p-5 shadow-sm">
          <h2 className="text-sm font-bold text-[var(--theme-warning)] mb-2">Akses Dibatasi (Hanya Lihat)</h2>
          <p className="text-xs font-semibold text-[var(--theme-warning)] opacity-90 leading-relaxed">
            Anda tidak memiliki izin (permission) untuk membuat atau mengelola mentor baru. Anda hanya dapat melihat daftar mentor yang sudah ada. 
            Jika Anda memerlukan akses ini, silakan hubungi Super Admin untuk mengaktifkannya di panel RBAC.
          </p>
        </div>
      )}

      {/* Mentor List Table Card */}
      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Daftar Dewan Pembimbing</h2>
          <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Daftar pembimbing aktif yang terdaftar dalam sistem orientasi.</p>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20 bg-[var(--theme-surface)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--theme-primary)]"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse bg-[var(--theme-surface)]">
              <thead>
                <tr className="border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Nama Pembimbing</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Email</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Lingkup / Scope</th>
                  <th className="py-3.5 px-6 text-[10px] font-bold text-[var(--theme-text-subtle)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)]">
                {filteredMentors?.map((m) => (
                  <tr key={m.id || m.ID} className="hover:bg-[var(--theme-bg)] transition-colors">
                    <td className="py-4 px-6 font-bold text-[var(--theme-text)] text-sm">{m.name || m.Name || `User ID: ${m.user_id}`}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)]">{m.email || m.Email || '-'}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-[var(--theme-text-muted)] capitalize">
                      {m.scope_type === 'university' ? 'Universitas' : `Fakultas${m.fakultas_id ? ` ID ${m.fakultas_id}` : ''}`}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-[var(--theme-success-light)] text-[var(--theme-success)] border border-[var(--theme-success-light)] text-[9px] font-bold uppercase tracking-wider">
                        {m.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filteredMentors?.length && (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-sm font-bold text-[var(--theme-text-subtle)]">
                      {isFakultasPortal && isSuperAdmin && !form.fakultas_id ? 'Pilih fakultas di form atas untuk melihat mentor' : 'Belum ada dewan pembimbing terdaftar.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

function Field({ label, children }) {
  return (
    <label className="space-y-1 block">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-muted)] pl-1">{label}</span>
      {children}
    </label>
  );
}

export default Mentors;
