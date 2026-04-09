import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const CounselingAchievement = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllCounseling();
      if (res.status === 'success') {
        setSessions(res.data || []);
      }
    } catch (error) {
      console.error('Gagal memuat data konseling:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingSessions = sessions.filter(s => s.Status !== 'Selesai').length;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full font-body">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Global Welfare & Counseling</h1>
              <p className="text-slate-600 mt-2 font-medium opacity-90">Cross-faculty monitoring of student mental health and consultation sessions.</p>
            </div>
            <button className="bg-white border border-slate-200 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 text-primary hover:bg-slate-50 transition-all font-body">
                <span className="material-symbols-outlined text-sm font-black">download</span>
                Export Report
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start label-input">
            {/* Achievement Verification Queue */}
            <section className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-200 space-y-8 shadow-sm">
                <div className="flex justify-between items-center font-body">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest leading-tight">Consultation Pipeline</h3>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black tracking-widest uppercase">{loading ? '...' : pendingSessions} Active Sessions</span>
                </div>
                <div className="space-y-4 font-body">
                  {loading ? (
                      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Mensinkronkan sesi konseling...</div>
                  ) : sessions.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">Tidak ada record sesi ditemukan.</div>
                  ) : sessions.map((s) => (
                    <div key={s.ID} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 group hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-200">
                                <span className="material-symbols-outlined text-2xl font-black">psychology</span>
                            </div>
                            <div className="font-body">
                                <p className="font-black text-primary leading-tight uppercase tracking-tight">{s.Topik}</p>
                                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter italic">Pasien: {s.Mahasiswa?.Nama || 'Mahasiswa'}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">DPA: {s.Dosen?.Nama || 'Dosen Pembimbing'}</p>
                            </div>
                        </div>
                        <div className="text-right font-body">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                s.Status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                                {s.Status}
                            </span>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 italic">{new Date(s.Tanggal).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                  ))}
                </div>
            </section>

            {/* Counseling Activity Stats */}
            <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 space-y-8 shadow-sm font-body">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Record</p>
                    <h3 className="text-4xl font-black text-primary ">{sessions.length.toString().padStart(2, '0')}</h3>
                </div>
                
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] flex flex-col gap-4 font-body">
                    <span className="material-symbols-outlined text-primary opacity-40 text-3xl">clinical_notes</span>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed italic">
                        Data ini merupakan agregat sesi konseling tingkat universitas untuk memantau beban kerja bimbingan akademik dan kesehatan mental mahasiswa.
                    </p>
                </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounselingAchievement;
