import React, { useMemo, useState, useEffect } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import { useCreateMentorMutation, useMentorsQuery, useFakultasListQuery } from '../../../queries/useKencanaAdminQuery';

const emptyForm = { name: '', email: '', password: '', phone: '', scope_type: 'faculty', fakultas_id: '' };

const Mentors = ({ portal = 'admin', facultyId: propFacultyId }) => {
  const user = useAuthStore((state) => state.user);
  const role = String(user?.role || '').toLowerCase();
  const isFakultasPortal = portal === 'fakultas' || role === 'kencana_fakultas';
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

  const hasPermission = role === 'super_admin' || user?.permissions?.includes('*') ||
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
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Dewan Pembimbing</h1>
          <p className="text-sm font-medium text-slate-500">
            {isFakultasPortal ? 'Admin fakultas hanya membuat mentor untuk fakultasnya.' : 'Admin universitas hanya membuat mentor lingkup universitas.'}
          </p>
        </div>
      </div>

      {hasPermission ? (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Nama">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Nama pembimbing" />
            </Field>
            <Field label="Email">
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="mentor@bku.ac.id" />
            </Field>
            <Field label="Password">
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" placeholder="Minimal 6 karakter" />
            </Field>
            <Field label="Telepon">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Opsional" />
            </Field>
            {!isFakultasPortal && (
              <Field label="Scope Mentor">
                <input disabled value="Universitas" className="input bg-slate-100 text-slate-500" />
              </Field>
            )}
            {isFakultasPortal && (
              <Field label="Scope Fakultas">
                {isSuperAdmin ? (
                  <select
                    required
                    value={form.fakultas_id}
                    onChange={(e) => setForm({ ...form, fakultas_id: e.target.value })}
                    className="input bg-white text-slate-800 border border-slate-200"
                  >
                    <option value="">Pilih Fakultas</option>
                    {faculties?.map(f => <option key={f.id} value={f.id}>{f.nama || f.Nama}</option>)}
                  </select>
                ) : (
                  <input
                    disabled
                    value={userFacultyId ? (faculties?.find(f => String(f.id) === String(userFacultyId))?.nama || faculties?.find(f => String(f.id) === String(userFacultyId))?.Nama || `Fakultas ID ${userFacultyId}`) : 'Fakultas akun belum tersedia'}
                    className="input bg-slate-100 text-slate-500"
                  />
                )}
              </Field>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button disabled={createMentor.isPending || (isFakultasPortal && (!form.fakultas_id && !userFacultyId))} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
              {createMentor.isPending ? 'Membuat...' : 'Buat Akun Mentor'}
            </button>
            {message && <p className="text-sm font-bold text-slate-600">{message}</p>}
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-amber-800 mb-2">Akses Dibatasi (Hanya Lihat)</h2>
          <p className="text-sm text-amber-700">
            Anda tidak memiliki izin (permission) untuk membuat atau mengelola mentor baru. Anda hanya dapat melihat daftar mentor yang sudah ada. 
            Jika Anda memerlukan akses ini, silakan hubungi Super Admin untuk mengaktifkannya di panel RBAC.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">Nama Pembimbing</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Lingkup</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMentors?.map((m) => (
                <tr key={m.id || m.ID} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 font-medium text-slate-900">{m.name || m.Name || `User ID: ${m.user_id}`}</td>
                  <td className="py-4 text-slate-600">{m.email || m.Email || '-'}</td>
                  <td className="py-4 text-slate-600 capitalize">
                    {m.scope_type === 'university' ? 'Universitas' : `Fakultas${m.fakultas_id ? ` ID ${m.fakultas_id}` : ''}`}
                  </td>
                  <td className="py-4 text-slate-600 capitalize">{m.status || 'active'}</td>
                </tr>
              ))}
              {!filteredMentors?.length && (
                <tr><td colSpan="4" className="py-4 text-center text-slate-500">
                  {isFakultasPortal && isSuperAdmin && !form.fakultas_id ? 'Pilih fakultas di form atas untuk melihat mentor' : 'Belum ada dewan pembimbing terdaftar.'}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <style>{`.input{height:44px;width:100%;border-radius:12px;border:1px solid #cbd5e1;padding:0 14px;font-size:14px;font-weight:700;outline:none}.input:focus{border-color:#0f172a;box-shadow:0 0 0 3px rgba(15,23,42,.08)}`}</style>
    </div>
  );
};

function Field({ label, children }) {
  return <label className="space-y-2"><span className="block text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>{children}</label>;
}

export default Mentors;
