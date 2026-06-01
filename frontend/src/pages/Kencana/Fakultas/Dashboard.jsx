import React from 'react';
import { useFakultasParticipantsQuery, useFakultasScoresQuery } from '../../../queries/useKencanaFakultasQuery';
import useAuthStore from '../../../store/useAuthStore';

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const fakultasId = user?.fakultas_id;
  
  const { data: participants } = useFakultasParticipantsQuery({ fakultas_id: fakultasId });
  const { data: scores } = useFakultasScoresQuery({ fakultas_id: fakultasId });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Kencana Fakultas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Peserta Fakultas</h3>
          <p className="text-3xl font-black text-blue-600">{participants?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Data Nilai Fakultas</h3>
          <p className="text-3xl font-black text-blue-600">{scores?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
