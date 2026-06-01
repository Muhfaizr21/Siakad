import React from 'react';
import { useScoresQuery } from '../../../queries/useKencanaAdminQuery';

const Scores = () => {
  const { data: scores, isLoading } = useScoresQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Rekap Nilai Peserta</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">Mahasiswa</th>
                <th className="pb-3 font-medium">Cognitive (25%)</th>
                <th className="pb-3 font-medium">Psychomotor (35%)</th>
                <th className="pb-3 font-medium">Affective (40%)</th>
                <th className="pb-3 font-medium">Nilai Akhir</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {scores?.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 font-medium text-slate-900">{s.student?.nama}</td>
                  <td className="py-4 text-slate-600">{s.cognitive_score?.toFixed(1)}</td>
                  <td className="py-4 text-slate-600">{s.psychomotor_score?.toFixed(1)}</td>
                  <td className="py-4 text-slate-600">{s.affective_score?.toFixed(1)}</td>
                  <td className="py-4 font-bold text-slate-900">{s.final_score?.toFixed(1)}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      s.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {s.is_passed ? 'Lulus' : 'Belum Lulus'}
                    </span>
                  </td>
                </tr>
              ))}
              {!scores?.length && (
                <tr><td colSpan="6" className="py-4 text-center text-slate-500">Belum ada data nilai.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Scores;
