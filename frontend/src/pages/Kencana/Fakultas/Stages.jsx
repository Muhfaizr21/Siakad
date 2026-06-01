import React from 'react';
import { useFakultasStagesQuery } from '../../../queries/useKencanaFakultasQuery';

const Stages = () => {
  // Pass a dummy periodId for now to show the concept
  const { data: stages, isLoading } = useFakultasStagesQuery(); 

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Jadwal & Tahap Orientasi</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-slate-500">
        Melihat tahapan orientasi yang berlaku, terutama untuk tahap Kencana Fakultas.
      </div>
    </div>
  );
};

export default Stages;
