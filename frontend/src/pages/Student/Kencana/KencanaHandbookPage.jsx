import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useKencanaHandbookQuery, useSaveHandbookDraftMutation, useSubmitHandbookMutation } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, PrimaryButton, StatusBadge } from './components';

export default function KencanaHandbookPage() {
  const { data, isLoading, isError } = useKencanaHandbookQuery();
  const saveDraft = useSaveHandbookDraftMutation();
  const submit = useSubmitHandbookMutation();
  const [form, setForm] = useState({ refleksi: '', komitmen: '', rencana: '' });
  useEffect(() => {
    if (data?.content_json) {
      let content = {};
      try {
        content = typeof data.content_json === 'string' ? JSON.parse(data.content_json || '{}') : data.content_json;
      } catch {
        content = {};
      }
      setForm({ refleksi: content.refleksi || '', komitmen: content.komitmen || '', rencana: content.rencana || '' });
    }
  }, [data]);
  if (isLoading) return <KencanaShell title="Handbook"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Handbook"><ErrorPanel message="Gagal memuat handbook." /></KencanaShell>;
  const action = (mutation, msg) => mutation.mutate(form, { onSuccess: () => toast.success(msg) });
  return (
    <KencanaShell title="Handbook Mahasiswa" subtitle="Handbook wajib diisi dan disetujui agar bisa lulus penuh.">
      <section className="grid gap-5 lg:grid-cols-[1fr_0.45fr]">
        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm space-y-4">
          <Field label="Refleksi Kencana" value={form.refleksi} onChange={(v) => setForm({ ...form, refleksi: v })} />
          <Field label="Komitmen Mahasiswa" value={form.komitmen} onChange={(v) => setForm({ ...form, komitmen: v })} />
          <Field label="Rencana Pengembangan Diri" value={form.rencana} onChange={(v) => setForm({ ...form, rencana: v })} />
          <div className="flex flex-wrap gap-3"><PrimaryButton onClick={() => action(saveDraft, 'Draft handbook disimpan')}>Simpan Draft</PrimaryButton><PrimaryButton onClick={() => action(submit, 'Handbook dikirim')}>Submit Handbook</PrimaryButton></div>
        </div>
        <aside className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h2 className="text-2xl font-black">Status Handbook</h2>
          <div className="mt-4"><StatusBadge status={data?.status} /></div>
          {data?.feedback && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{data.feedback}</p>}
        </aside>
      </section>
    </KencanaShell>
  );
}

function Field({ label, value, onChange }) { return <label className="block"><span className="text-xs font-black uppercase tracking-widest text-[#9b8f7a]">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-[#e8dfcf] bg-[#fffaf0] p-4 text-sm font-medium outline-none focus:border-[#0f4c5c]" /></label>; }
