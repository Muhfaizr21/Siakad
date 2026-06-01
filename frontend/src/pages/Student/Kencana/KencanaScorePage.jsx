import React from 'react';
import { useKencanaScoreQuery } from '../../../queries/useKencanaQuery';
import { ErrorPanel, KencanaShell, LoadingPanel, MetricCard, StatusBadge } from './components';

export default function KencanaScorePage() {
  const { data, isLoading, isError } = useKencanaScoreQuery();
  if (isLoading) return <KencanaShell title="Nilai Kencana"><LoadingPanel /></KencanaShell>;
  if (isError) return <KencanaShell title="Nilai Kencana"><ErrorPanel message="Gagal memuat nilai." /></KencanaShell>;
  const score = data?.score || {};
  return (
    <KencanaShell title="Nilai dan Kelulusan" subtitle="Nilai akhir = Kognitif 25% + Psikomotor 35% + Afektif 40%. Kehadiran dan handbook tetap menjadi syarat wajib.">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Kognitif" value={Number(score.cognitive_average || 0).toFixed(1)} hint="Bobot 25%" icon="quiz" />
        <MetricCard label="Psikomotor" value={Number(score.psychomotor_average || 0).toFixed(1)} hint="Bobot 35%" icon="construction" />
        <MetricCard label="Afektif" value={Number(score.affective_average || 0).toFixed(1)} hint="Bobot 40%" icon="volunteer_activism" />
        <MetricCard label="Nilai Akhir" value={Number(score.final_score || 0).toFixed(1)} hint="Minimal 75" icon="workspace_premium" />
      </section>
      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">Status Kelulusan</h2><StatusBadge status={score.graduation_status} /></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Weighted label="Kognitif" value={score.cognitive_weighted} />
            <Weighted label="Psikomotor" value={score.psychomotor_weighted} />
            <Weighted label="Afektif" value={score.affective_weighted} />
          </div>
        </div>
        <div className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
          <h2 className="text-2xl font-black">Komponen Belum Lengkap</h2>
          <div className="mt-4 space-y-3">
            {(data?.blockers || []).length === 0 ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Semua syarat terpenuhi.</p> : data.blockers.map((b) => <p key={b} className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{b}</p>)}
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-[#e8dfcf] bg-white/85 p-6 shadow-sm">
        <h2 className="text-2xl font-black">Detail Item Nilai</h2>
        <div className="mt-4 divide-y divide-[#e8dfcf]">
          {(data?.items || []).map((item) => <div key={item.id} className="flex items-center justify-between py-3"><div><p className="font-black">{item.item_name}</p><p className="text-xs font-bold uppercase tracking-widest text-[#9b8f7a]">{item.component}</p></div><p className="text-xl font-black">{Number(item.score || 0).toFixed(1)}</p></div>)}
        </div>
      </section>
    </KencanaShell>
  );
}

function Weighted({ label, value }) { return <div className="rounded-2xl bg-[#f7f1e5] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[#9b8f7a]">{label} Weighted</p><p className="mt-1 text-2xl font-black">{Number(value || 0).toFixed(2)}</p></div>; }
