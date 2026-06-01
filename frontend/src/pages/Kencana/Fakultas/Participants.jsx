import React from 'react';
import { useFakultasParticipantsQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';

const Participants = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  const { data: participants, isLoading } = useFakultasParticipantsQuery({ fakultas_id: fakultasId });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Data Peserta Fakultas</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-medium">NIM</th>
                <th className="pb-3 font-medium">Nama</th>
                <th className="pb-3 font-medium">Fakultas</th>
              </tr>
            </thead>
            <tbody>
              {participants?.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 font-medium text-slate-900">{p.nim}</td>
                  <td className="py-4 text-slate-600">{p.nama}</td>
                  <td className="py-4 text-slate-600">{p.fakultas_name || '-'}</td>
                </tr>
              ))}
              {!participants?.length && (
                <tr><td colSpan="3" className="py-4 text-center text-slate-500">Belum ada data peserta dari fakultas ini.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Participants;
