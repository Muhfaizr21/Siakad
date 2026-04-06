import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const ProposalPipeline = () => {
    const proposals = [
        { id: "PROP-BKU-01", org: "BEM Fakultas Teknik", event: "Industrial Tech Expo 2024", budget: "Rp 25.400.000", status: "PENDING SA", date: "12 Nov 2024", lastAction: "Approved by Dean (FT)" },
        { id: "PROP-BKU-02", org: "UKM MAPALA", event: "Ekspedisi Merapi", budget: "Rp 8.200.000", status: "PENDING SA", date: "15 Nov 2024", lastAction: "Approved by Pembina" },
    ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-headline">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Multi-Stage Approval Pipeline</h1>
              <p className="text-secondary mt-1">Executive oversight and treasury distribution for institutional activities.</p>
            </div>
            <div className="flex gap-3">
                <button className="px-6 py-3 bg-white border border-outline-variant/30 rounded-2xl font-bold flex items-center gap-3 text-sm hover:bg-surface-container transition-all">
                    <span className="material-symbols-outlined text-sm">history</span>
                    All Archives
                </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             {/* Pending Proposals Feed (2/3) */}
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase text-secondary/60 tracking-widest">Incoming Final Decisions</h3>
                    <div className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                </div>

                {proposals.map((prop, idx) => (
                    <div key={idx} className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex items-start justify-between group hover:border-primary/50 transition-all shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-500/20"></div>
                        <div className="space-y-6 flex-1">
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/10 rounded-full text-[10px] font-black tracking-widest uppercase">
                                    {prop.status}
                                </span>
                                <span className="text-xs font-bold font-body text-secondary opacity-60">Serial: {prop.id}</span>
                            </div>
                            
                            <div className="space-y-1">
                                <h4 className="text-2xl font-black text-primary tracking-tight group-hover:text-blue-700 transition-colors">{prop.event}</h4>
                                <div className="flex items-center gap-2 text-sm font-bold text-secondary">
                                    <span className="material-symbols-outlined text-sm">hub</span>
                                    {prop.org}
                                </div>
                            </div>

                            <div className="flex gap-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-secondary/50 tracking-widest">Requested Fund</span>
                                    <span className="text-xl font-black text-emerald-600">{prop.budget}</span>
                                </div>
                                <div className="flex flex-col border-l border-outline-variant/30 pl-10">
                                    <span className="text-[10px] font-black uppercase text-secondary/50 tracking-widest">Timeline</span>
                                    <span className="text-base font-bold text-primary">{prop.date}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 text-xs text-secondary font-medium">
                                <span className="material-symbols-outlined text-sm text-emerald-500">task_alt</span>
                                Last Action: {prop.lastAction}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pl-10">
                            <button className="bg-primary text-white w-40 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all">
                                Release Treasury
                            </button>
                            <button className="bg-white border border-outline-variant/30 text-primary w-40 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">
                                Revise Document
                            </button>
                            <button className="text-error font-black text-[10px] uppercase tracking-widest mt-4 opacity-50 hover:opacity-100 transition-opacity">
                                Permanent Reject
                            </button>
                        </div>
                    </div>
                ))}
             </div>

             {/* Right Sidebar Inspector (1/3) */}
             <div className="space-y-6">
                <div className="bg-primary-container p-10 rounded-[3.5rem] text-white space-y-8 shadow-xl shadow-primary/10">
                    <h3 className="text-lg font-black uppercase tracking-widest opacity-80 italic">Global Stats</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/10 pb-6">
                            <span className="text-sm opacity-80">Approval Rate</span>
                            <span className="text-2xl font-black">92.4%</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/10 pb-6">
                            <span className="text-sm opacity-80">Total Distributed</span>
                            <span className="text-lg font-black">Rp 2.45B</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span className="text-sm opacity-80">Cycle Time</span>
                            <span className="text-base font-bold">~4.2 Days</span>
                        </div>
                    </div>
                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        View Detailed Distribution
                    </button>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-8 shadow-sm">
                    <h3 className="text-sm font-black uppercase text-secondary/60 tracking-widest">Workflow Inspector</h3>
                    <div className="space-y-10 relative">
                        <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-outline-variant/30"></div>
                        
                        <div className="relative pl-12">
                            <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
                                <span className="material-symbols-outlined text-[10px] text-white">check</span>
                            </div>
                            <p className="font-black text-primary leading-tight text-sm uppercase tracking-tight">Level 1: Faculty Admin</p>
                            <p className="text-xs text-emerald-600 font-bold mt-1">Verified & Verified</p>
                        </div>

                        <div className="relative pl-12">
                            <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-primary animate-pulse ring-8 ring-primary/10 shadow-[0_0_15px_rgba(0,35,111,0.3)]"></div>
                            <p className="font-black text-primary leading-tight text-sm uppercase tracking-tight">Level 2: Super Admin</p>
                            <p className="text-xs text-secondary font-medium mt-1 italic">Waiting for Executive Action...</p>
                        </div>

                        <div className="relative pl-12 opacity-30">
                            <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-slate-300"></div>
                            <p className="font-bold text-secondary leading-tight text-sm uppercase tracking-tight">Level 3: Treasury Release</p>
                            <p className="text-[10px] text-secondary/50 font-normal mt-1 italic">Scheduled for Batch Payment</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProposalPipeline;
