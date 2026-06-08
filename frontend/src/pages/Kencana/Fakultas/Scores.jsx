import React from 'react';
import { useFakultasScoresQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';
import { PageHeader } from '../../../components/ui/page/PageHeader';

const Scores = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  const { data: scores, isLoading } = useFakultasScoresQuery({ fakultas_id: fakultasId });

  return (
    <div className="bg-transparent font-body max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon="award"
        title={
          <>
            <span className="text-[var(--theme-text)]">Rekap Nilai </span>
            <span className="text-[var(--theme-primary)]">Fakultas</span>
          </>
        }
        subtitle="Evaluasi dan nilai akhir seluruh peserta Kencana di tingkat fakultas."
        breadcrumbs={[
          { label: 'Kencana Fakultas', path: '#' },
          { label: 'Rekap Nilai' }
        ]}
      />

      <div className="bg-white rounded-2xl border border-[var(--theme-border)] shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[var(--theme-border-muted)] bg-[var(--theme-bg)]">
          <h2 className="text-base font-bold text-[var(--theme-text)]">Evaluasi Peserta</h2>
          <p className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Daftar rekapitulasi nilai mahasiswa berdasarkan komponen kognitif, psikomotorik, dan afektif.</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-[var(--theme-text-muted)] font-bold">Memuat rekap nilai...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)] text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider bg-[var(--theme-bg)]/50">
                  <th className="px-6 py-3 font-semibold">Mahasiswa</th>
                  <th className="px-6 py-3 font-semibold">Cognitive (25%)</th>
                  <th className="px-6 py-3 font-semibold">Psychomotor (35%)</th>
                  <th className="px-6 py-3 font-semibold">Affective (40%)</th>
                  <th className="px-6 py-3 font-semibold">Nilai Akhir</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-border-muted)]">
                {scores?.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--theme-bg)]/40 transition-colors text-sm font-semibold text-[var(--theme-text)]">
                    <td className="px-6 py-4 font-bold text-[var(--theme-text)]">{s.student?.nama}</td>
                    <td className="px-6 py-4 text-[var(--theme-text-muted)]">{s.cognitive_score?.toFixed(1)}</td>
                    <td className="px-6 py-4 text-[var(--theme-text-muted)]">{s.psychomotor_score?.toFixed(1)}</td>
                    <td className="px-6 py-4 text-[var(--theme-text-muted)]">{s.affective_score?.toFixed(1)}</td>
                    <td className="px-6 py-4 font-bold text-[var(--theme-primary)]">{s.final_score?.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        s.is_passed 
                          ? 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]' 
                          : 'bg-[var(--theme-danger-light)] text-[var(--theme-danger)] border-[var(--theme-danger-light)]'
                      }`}>
                        {s.is_passed ? 'Lulus' : 'Belum Lulus'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!scores?.length && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-[var(--theme-text-muted)] font-semibold">
                      Belum ada data nilai dari fakultas ini.
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

export default Scores;
