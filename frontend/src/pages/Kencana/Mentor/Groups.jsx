import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorGroupsQuery } from '../../../queries/useKencanaMentorQuery';

const Groups = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: groups, isLoading } = useMentorGroupsQuery({ search });

  return (
    <div className="md:max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-56 h-56 bg-violet-400/20 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black text-violet-300 uppercase tracking-[0.28em]">Kelompok Kencana</p>
            <h1 className="text-3xl md:text-4xl font-black mt-2">Kelompok Saya</h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl">Pilih kelompok yang Anda bimbing dan kelola anggota mahasiswanya.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Cari nama/kode kelompok..." 
              className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none flex-1 max-w-md" 
            />
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full py-16 text-center font-bold text-slate-400">Memuat kelompok...</div>
          ) : groups?.length ? (
            groups.map(group => (
              <div key={group.id} className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KELOMPOK {group.group_number || '-'} • {group.code || 'Tanpa Kode'}</p>
                    <h3 className="text-lg font-black text-slate-800 mt-1">{group.name}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase">{group.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 my-4 text-center">
                  <div className="bg-white rounded-2xl p-3 border border-slate-100">
                    <p className="text-lg font-black text-slate-800">{group.members_count || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400">Anggota</p>
                  </div>
                  <div className="bg-white rounded-2xl p-3 border border-slate-100">
                    <p className="text-lg font-black text-slate-800">{group.capacity || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400">Kapasitas</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => navigate(`/kencana-mentor/groups/${group.id}`)} 
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors"
                  >
                    Kelola Anggota
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center font-bold text-slate-400">Belum ada kelompok yang ditugaskan kepada Anda.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
