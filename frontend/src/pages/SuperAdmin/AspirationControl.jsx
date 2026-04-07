import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AspirationControl = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-headline">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Global Aspiration Center</h1>
              <p className="text-secondary mt-1">Unified monitoring and escalation hub for student grievances across all faculties.</p>
            </div>
          </header>

          {/* Heatmap Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[ 
                { label: "Total Active", count: "1,240", color: "bg-blue-600", trend: "+5% vs Last Week" },
                { label: "SLA Overdue", count: "12", color: "bg-error", trend: "Requires Immediate Action" },
                { label: "Resolved Today", count: "45", color: "bg-emerald-600", trend: "Average Response: 4h" },
                { label: "Escalated to SA", count: "3", color: "bg-amber-500", trend: "Takeover Requested" }
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-outline-variant/30 shadow-sm space-y-2">
                    <p className="text-[10px] uppercase font-black tracking-widest text-secondary/60">{stat.label}</p>
                    <h3 className="text-3xl font-black text-primary">{stat.count}</h3>
                    <p className={`text-[10px] font-bold ${stat.label === 'SLA Overdue' ? 'text-error' : 'text-emerald-600'}`}>{stat.trend}</p>
                </div>
            ))}
          </div>

          <section className="bg-white border border-outline-variant/30 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 bg-surface-container-low/50 border-b border-outline-variant/30 flex gap-4">
               <div className="flex flex-col gap-1 w-48">
                  <label className="text-[10px] font-black uppercase text-secondary/50 px-1 tracking-widest">Scope</label>
                  <select className="bg-white border border-outline-variant/30 px-5 py-3 rounded-xl text-xs font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all">
                    <option>All Faculties</option>
                    <option>FT - Teknik</option>
                    <option>FEB - Ekonomi</option>
                    <option>FH - Hukum</option>
                  </select>
               </div>
               <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[10px] font-black uppercase text-secondary/50 px-1 tracking-widest">Global Search</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40">search</span>
                    <input className="w-full bg-white border border-outline-variant/30 pl-14 pr-6 py-3 rounded-xl text-sm" placeholder="Search ticket ID or student name..." />
                  </div>
               </div>
            </div>
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/20 text-[10px] font-black uppercase tracking-widest text-secondary/60">
                <tr>
                  <th className="px-10 py-6">Incident Ticket</th>
                  <th className="px-10 py-6">Faculty Origin</th>
                  <th className="px-10 py-6">Priority Level</th>
                  <th className="px-10 py-6">SLA Status</th>
                  <th className="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-body">
                <tr className="hover:bg-primary/[0.01] transition-all">
                   <td className="px-10 py-6">
                      <p className="font-bold text-primary">#ASP-9901</p>
                      <p className="text-xs text-secondary truncate w-64 mt-0.5 font-normal">Fasilitas Laboratorium Cloud Menurun di jam sibuk...</p>
                   </td>
                   <td className="px-10 py-6 text-sm font-semibold tracking-tight">FT - Teknik Informatika</td>
                   <td className="px-10 py-6"><span className="px-3.5 py-1.5 bg-error/10 text-error rounded-full text-[10px] font-black tracking-widest border border-error/10 uppercase">CRITICAL</span></td>
                   <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-error">Remaining: 2h 15m</span>
                        <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="w-[80%] h-full bg-error"></div>
                        </div>
                      </div>
                   </td>
                   <td className="px-10 py-6 text-right cursor-pointer">
                      <div className="flex items-center justify-end gap-3 group">
                        <span className="text-primary font-black text-[11px] uppercase tracking-widest group-hover:underline">Take Over Access</span>
                        <span className="material-symbols-outlined text-primary text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                      </div>
                   </td>
                </tr>
                <tr className="hover:bg-primary/[0.01] transition-all">
                   <td className="px-10 py-6">
                      <p className="font-bold text-primary">#ASP-9872</p>
                      <p className="text-xs text-secondary truncate w-64 mt-0.5 font-normal">Keterlambatan Input Nilai Semester Antara...</p>
                   </td>
                   <td className="px-10 py-6 text-sm font-semibold tracking-tight">FEB - Akuntansi</td>
                   <td className="px-10 py-6"><span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black tracking-widest border border-amber-500/10 uppercase">MEDIUM</span></td>
                   <td className="px-10 py-6">
                      <div className="flex flex-col text-secondary opacity-80">
                        <span className="text-xs font-bold ">Delegated to Dept. Head</span>
                      </div>
                   </td>
                   <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 hover:opacity-100 transition-opacity">
                        <span className="text-secondary font-black text-[11px] uppercase tracking-widest">View Context</span>
                        <span className="material-symbols-outlined text-secondary text-sm">chevron_right</span>
                      </div>
                   </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AspirationControl;
