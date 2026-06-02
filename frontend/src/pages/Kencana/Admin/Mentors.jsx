import React, { useMemo, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import { useCreateMentorMutation, useMentorsQuery } from '../../../queries/useKencanaAdminQuery';

const emptyForm = { name: '', email: '', password: '', phone: '', scope_type: 'faculty', fakultas_id: '' };

const Mentors = ({ portal = 'admin' }) => {
  const user = useAuthStore((state) => state.user);
  const isFakultasPortal = portal === 'fakultas';
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const { data: mentors, isLoading } = useMentorsQuery(portal);
  const createMentor = useCreateMentorMutation(portal);

  const facultyId = user?.fakultas_id || user?.FakultasID || '';
  const effectiveForm = useMemo(() => ({
    ...form,
    scope_type: isFakultasPortal ? 'faculty' : 'university',
    fakultas_id: isFakultasPortal ? Number(facultyId) || 0 : Number(form.fakultas_id) || 0,
  }), [facultyId, form, isFakultasPortal]);

  const r = String(user?.role || '').toLowerCase();
  const hasPermission = r === 'super_admin' || user?.permissions?.includes('*') ||
    (isFakultasPortal ? user?.permissions?.includes('kencana.faculty.mentor.manage')
                      : user?.permissions?.includes('kencana.mentor.university.manage'));

  console.log("Mentors DEBUG: ", { role: user?.role, permissions: user?.permissions, hasPermission, portal, isFakultasPortal });

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
                <input disabled value={facultyId ? `Fakultas ID ${facultyId}` : 'Fakultas akun belum tersedia'} className="input bg-slate-100 text-slate-500" />
              </Field>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button disabled={createMentor.isPending || (isFakultasPortal && !facultyId)} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
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
              {mentors?.map((m) => (
                <tr key={m.id || m.ID} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 font-medium text-slate-900">{m.name || m.Name || `User ID: ${m.user_id}`}</td>
                  <td className="py-4 text-slate-600">{m.email || m.Email || '-'}</td>
                  <td className="py-4 text-slate-600 capitalize">
                    {m.scope_type === 'university' ? 'Universitas' : `Fakultas${m.fakultas_id ? ` ID ${m.fakultas_id}` : ''}`}
                  </td>
                  <td className="py-4 text-slate-600 capitalize">{m.status || 'active'}</td>
                </tr>
              ))}
              {!mentors?.length && (
                <tr><td colSpan="4" className="py-4 text-center text-slate-500">Belum ada dewan pembimbing terdaftar.</td></tr>
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
