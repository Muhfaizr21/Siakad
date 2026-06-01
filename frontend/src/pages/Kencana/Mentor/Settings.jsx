import React, { useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import { useMentorProfileQuery, useUpdateMentorProfileMutation } from '../../../queries/useKencanaMentorQuery';

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading } = useMentorProfileQuery();
  const updateProfile = useUpdateMentorProfileMutation();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  const email = profile?.email || user?.email || user?.Email || '-';
  const scope = profile?.scope_type === 'university' ? 'Kencana Universitas' : `Kencana Fakultas${profile?.fakultas?.nama ? ` - ${profile.fakultas.nama}` : ''}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await updateProfile.mutateAsync(form);
      setMessage('Profil berhasil disimpan.');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Gagal menyimpan profil.');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-500">Dewan Pembimbing</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">Pengaturan Profil</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">Perbarui identitas yang tampil di portal Kencana.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-2xl font-black text-white shadow-lg">
              {(profile?.name || email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-slate-900">{profile?.name || 'Nama belum diatur'}</h2>
              <p className="truncate text-sm font-bold text-slate-500">{email}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <Info label="Scope" value={scope} />
            <Info label="Status" value={profile?.status || 'active'} />
            <Info label="Telepon" value={profile?.phone || '-'} />
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <p className="text-sm font-bold text-slate-500">Memuat profil...</p>
          ) : (
            <div className="space-y-5">
              <Field label="Nama Pembimbing">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Nama lengkap" />
              </Field>
              <Field label="Email Login">
                <input disabled value={email} className="input bg-slate-100 text-slate-500" />
              </Field>
              <Field label="Nomor Telepon">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Nomor telepon aktif" />
              </Field>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button disabled={updateProfile.isPending} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 disabled:bg-slate-300">
                  {updateProfile.isPending ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
                {message && <p className="text-sm font-bold text-slate-600">{message}</p>}
              </div>
            </div>
          )}
        </form>
      </div>
      <style>{`.input{height:46px;width:100%;border-radius:14px;border:1px solid #cbd5e1;padding:0 14px;font-size:14px;font-weight:700;outline:none}.input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1)}`}</style>
    </div>
  );
};

function Field({ label, children }) {
  return <label className="block space-y-2"><span className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</span>{children}</label>;
}

function Info({ label, value }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-800">{value}</p></div>;
}

export default Settings;
