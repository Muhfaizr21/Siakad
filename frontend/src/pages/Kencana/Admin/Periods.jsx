import React from 'react';
import { usePeriodsQuery } from '../../../queries/useKencanaAdminQuery';

const Periods = () => {
  const { data: periods, isLoading } = usePeriodsQuery();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Kelola Periode Orientasi</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">Tahun</th>
                <th className="pb-3 font-medium">Nama Periode</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {periods?.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 font-medium text-slate-900">{p.year}</td>
                  <td className="py-4 text-slate-600">{p.name}</td>
                  <td className="py-4 text-slate-600 capitalize">{p.status}</td>
                </tr>
              ))}
              {!periods?.length && (
                <tr><td colSpan="3" className="py-4 text-center text-slate-500">Belum ada periode.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Periods;
