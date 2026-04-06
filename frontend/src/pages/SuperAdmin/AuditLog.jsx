import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AuditLog = () => {
    const logs = [
        { id: "LOG-001", user: "Dr. Budi (Super Admin)", action: "UPDATE_KRS_TOGGLE", entity: "Academic_Config", timestamp: "2024-04-06 13:45:22", status: "Success", ip: "10.20.0.1" },
        { id: "LOG-002", user: "Siti (Faculty Admin)", action: "APPROVE_PROPOSAL", entity: "Proposal_441", timestamp: "2024-04-06 12:10:05", status: "Success", ip: "192.168.1.102" },
        { id: "LOG-003", user: "Admin (System)", action: "AUTO_REVOKE_EXPIRED_SESSION", entity: "Auth_Sessions", timestamp: "2024-04-06 10:00:01", status: "Success", ip: "127.0.0.1" },
    ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-headline">
      <Sidebar />
      <main className="pl-80 flex flex-col min-h-screen w-full">
        <TopNavBar />
        <div className="p-8 space-y-8">
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Immutable Institutional Guard</h1>
              <p className="text-secondary mt-1 tracking-tight font-body">Complete append-only audit logs of all critical system transactions and security events.</p>
            </div>
            <button className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Forensic (PDF)
            </button>
          </header>

          {/* Quick Filters */}
          <section className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 flex shadow-sm gap-10 items-center">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-secondary/50 tracking-widest px-1">Global Tracer</label>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40">fingerprint</span>
                    <input className="w-80 bg-surface border border-outline-variant/30 pl-14 pr-6 py-3 rounded-2xl text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all" placeholder="Search by Action, IP, or Identity..." />
                </div>
            </div>
            <div className="h-12 w-0.5 bg-outline-variant/20"></div>
            <div className="flex-1 grid grid-cols-3 gap-6">
                 {[ 
                    { label: "Critical Anomalies", count: "0", color: "text-emerald-500", icon: "security_update_good" },
                    { label: "Identity Redraws", count: "4", color: "text-amber-500", icon: "shield" },
                    { label: "Total Handlers", count: "450+", color: "text-primary", icon: "supervised_user_circle" }
                 ].map((metric, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-secondary/50 tracking-widest mb-1">{metric.label}</span>
                        <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined text-base ${metric.color} opacity-40`}>{metric.icon}</span>
                            <span className={`text-xl font-black ${metric.color}`}>{metric.count}</span>
                        </div>
                    </div>
                 ))}
            </div>
          </section>

          {/* Log Table */}
          <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70">
                  <th className="px-10 py-6">Timeline (UTC)</th>
                  <th className="px-10 py-6">Administrative Identity</th>
                  <th className="px-10 py-6">Executed Action</th>
                  <th className="px-10 py-6">Infrastructure Impact</th>
                  <th className="px-10 py-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-body">
                {logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <p className="text-xs font-bold text-primary opacity-80">{log.timestamp}</p>
                            <p className="text-[10px] text-secondary/60 mt-1 uppercase font-black font-headline">Trace ID: {log.id}</p>
                        </td>
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-lg text-secondary/40 font-headline">account_circle</span>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-primary group-hover:text-blue-700 transition-colors uppercase tracking-tight">{log.user}</span>
                                    <span className="text-[10px] text-secondary/60 font-medium">Source: {log.ip}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6">
                            <span className="px-3.5 py-1.5 bg-surface-container-low border border-outline-variant/10 rounded-lg text-[10px] font-black tracking-widest text-primary uppercase">
                                {log.action}
                            </span>
                        </td>
                        <td className="px-10 py-6">
                            <p className="text-sm font-bold text-secondary">{log.entity}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{log.status}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                            <button className="px-5 py-2.5 rounded-xl text-primary/40 hover:text-primary hover:bg-primary/5 transition-all text-sm font-headline">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-8 bg-surface-container-low/20 border-t border-outline-variant/30 flex justify-center">
                <button className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/40 hover:text-primary transition-all flex items-center gap-3">
                    Load Historical Data Beyond 7 Days
                    <span className="material-symbols-outlined text-xs">arrow_downward</span>
                </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AuditLog;
