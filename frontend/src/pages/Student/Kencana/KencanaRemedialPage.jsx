import React from 'react';
import { useKencanaRemedialQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, StatusBadge } from './components';

export default function KencanaRemedialPage() {
  const { data, isLoading, isError } = useKencanaRemedialQuery();
  if (isLoading) return <KencanaShell title="Remedial"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Remedial"><ErrorPanel message="Gagal memuat remedial." /></KencanaShell>;
  return (
    <KencanaShell title="Remedial Kencana" subtitle="Perbaiki komponen yang belum memenuhi syarat ketika admin membuka remedial.">
      <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
        <h2 className="text-2xl font-black">Alasan Remedial / Perbaikan</h2>
        <div className="mt-4 space-y-3">
          {(data?.reasons || []).length === 0 ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Tidak ada alasan remedial saat ini.</p> : data.reasons.map((r) => <p key={r} className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{r}</p>)}
        </div>
      </section>
      <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
        <h2 className="text-2xl font-black">Daftar Remedial Dibuka</h2>
        <div className="mt-4 grid gap-3">
          {(data?.remedials || []).map((r) => <div key={r.id} className="rounded-2xl bg-[#f7f1e5] p-4"><div className="flex justify-between gap-3"><p className="font-black">{r.component}</p><StatusBadge status={r.status} /></div><p className="mt-2 text-sm font-semibold text-[#756b5a]">{r.reason}</p></div>)}
        </div>
      </section>
    </KencanaShell>
  );
}
