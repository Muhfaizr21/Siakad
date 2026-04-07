import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const CounselingAchievement = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline">Global Welfare & Achievement</h1>
              <p className="text-secondary mt-1">Cross-faculty monitoring of student mental health and academic excellence.</p>
            </div>
            <button className="bg-surface border border-outline-variant/30 px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-primary hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined text-sm">download</span>
                Export BAN-PT Data
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Achievement Verification Queue */}
            <section className="bg-white p-10 rounded-[3rem] border border-outline-variant/30 space-y-8 shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-primary uppercase tracking-widest font-headline">Verification Pipeline</h3>
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black tracking-widest">12 PENDING</span>
                </div>
                <div className="space-y-4">
                  {[ 
                      { student: "Ahmad Dani", fac: "Teknik", prize: "Gold Medal - LKTIN Nasional", date: "2 mins ago" },
                      { student: "Siska Putri", fac: "MIPA", prize: "Honorable Mention - IMC", date: "1 hour ago" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-surface-container-low/50 rounded-[2rem] border border-outline-variant/10 group hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-outline-variant/10">
                                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                            </div>
                            <div>
                                <p className="font-black text-primary leading-tight">{item.prize}</p>
                                <p className="text-xs text-secondary font-bold font-body">{item.student} • {item.fac}</p>
                                <p className="text-[10px] text-secondary/50 font-medium  mt-1">{item.date}</p>
                            </div>
                        </div>
                        <button className="text-primary font-black text-[10px] tracking-widest uppercase hover:underline">Verify Identity</button>
                    </div>
                  ))}
                </div>
            </section>

            {/* Counseling Activity Stats */}
            <section className="bg-white p-10 rounded-[3rem] border border-outline-variant/30 space-y-8 shadow-sm">
                <h3 className="text-lg font-black text-primary uppercase tracking-widest font-headline">Institutional Counseling Load</h3>
                <div className="space-y-10">
                    {[
                        { fac: 'Fakultas Teknik', load: 88, sessions: 42, status: 'Critically High' },
                        { fac: 'Fakultas Ekonomi', load: 54, sessions: 18, status: 'Normal' },
                        { fac: 'Fakultas Hukum', load: 12, sessions: 4, status: 'Optimal' }
                    ].map((item, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-black text-secondary uppercase tracking-[0.15em] mb-1">{item.fac}</p>
                                    <p className="text-lg font-black text-primary">{item.sessions} Active Sessions</p>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${item.load > 70 ? 'text-error' : 'text-emerald-600'}`}>{item.status}</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                <div 
                                  className={`h-full transition-all duration-1000 ${item.load > 70 ? 'bg-error shadow-[0_0_12px_rgba(186,26,26,0.3)]' : 'bg-primary'}`} 
                                  style={{width: `${item.load}%`}}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary opacity-40">clinical_notes</span>
                    <p className="text-xs text-secondary font-medium font-body leading-relaxed">
                        Last system aggregate update: 12:45 UTC. All counseling data is anonymized per UU PDP No. 27/2022.
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
