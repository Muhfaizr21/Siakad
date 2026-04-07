import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AdminPerformance = () => {
    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body font-sans select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase tracking-widest ">Institutional Staff Analytics</h1>
                  <p className="text-secondary mt-1">Cross-faculty performance evaluation and response metrics for all administrative nodes.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <section className="bg-white p-12 rounded-[3.5rem] border border-outline-variant/30 space-y-10 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <span className="material-symbols-outlined text-[150px] text-primary">assessment</span>
                    </div>
                    <h3 className="text-xl font-black text-primary uppercase tracking-widest font-headline">Faculty Efficiency Ranking</h3>
                    <div className="space-y-10">
                        {[ 
                            { fac: "Fakultas Teknik", rate: 94, avgTime: "2.4h", tickets: 124 },
                            { fac: "Fakultas Ekonomi", rate: 86, avgTime: "4.1h", tickets: 88 },
                            { fac: "Fakultas MIPA", rate: 72, avgTime: "12.5h", tickets: 45 }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="space-y-3 flex-1 px-4">
                                    <div className="flex justify-between items-end">
                                        <p className="font-extrabold text-primary tracking-tight leading-tight uppercase tracking-widest text-sm">{item.fac}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-secondary/40 font-black tracking-widest uppercase">Efficiency Index:</span>
                                            <span className="text-xl font-black text-primary">{item.rate}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                        <div className={`h-full transition-all duration-1000 bg-primary group-hover:shadow-[0_0_12px_rgba(0,35,111,0.3)]`} style={{width: `${item.rate}%`}}></div>
                                    </div>
                                    <div className="flex gap-6 text-[10px] font-black uppercase text-secondary/40 tracking-widest ">
                                        <span>Avg Response: {item.avgTime}</span>
                                        <span>Total Tickets: {item.tickets}</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-secondary opacity-20 group-hover:opacity-100 transition-opacity">trending_up</span>
                            </div>
                        ))}
                    </div>
                 </section>

                 <section className="bg-primary-container p-12 rounded-[3.5rem] text-white space-y-12 shadow-xl shadow-primary-container/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <span className="material-symbols-outlined text-[180px] text-white">person_search</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-widest  leading-tight">Admin Performance <br/> Spotlight</h3>
                        <p className="text-xs text-white/60 font-medium font-body leading-relaxed max-w-sm mt-4">Identify top-performing nodes and potential bottlenecks in the institutional workflow.</p>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between hover:bg-white/10 transition-all border-dashed">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <p className="font-bold text-white tracking-tight">John Doe (FT Admin)</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest ">Resolved: 45 | Average: 1.2h</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black text-emerald-400">98%</span>
                                    <span className="text-[10px] font-black uppercase text-secondary/50 tracking-widest">SLA Score</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-secondary  font-body opacity-80">This analysis is for institutional intelligence and workflow optimization purposes.</p>
                    </div>
                 </section>
              </div>
            </div>
          </main>
        </div>
    )
}

export default AdminPerformance;
