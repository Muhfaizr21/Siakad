import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const AuditLog = () => {
    const logs = [
        { id: "LOG-001", user: "Dr. Alistair Vance", action: "Perubahan Role Pengguna", target: "John Doe (FT Admin)", timestamp: "Hari ini, 10:45", ip: "192.168.1.1", status: "Sudah Diverifikasi" },
        { id: "LOG-002", user: "John Doe", action: "Pencetakan Raport Global", target: "Fakultas Teknik", timestamp: "Hari ini, 09:20", ip: "192.168.1.45", status: "Sistem Log" },
        { id: "LOG-003", user: "Jane Smith", action: "Persetujuan Proposal Ormawa", target: "HIMA Informatika", timestamp: "Kemarin, 16:00", ip: "172.16.0.4", status: "Sistem Log" },
    ];

    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase  tracking-widest">Log Audit Absolut (Immutable)</h1>
                  <p className="text-secondary mt-1 font-medium  leading-relaxed">Rekaman jejak forensik seluruh aksi administratif sistem yang tidak dapat diubah.</p>
                </div>
                <div className="flex gap-4">
                     <button className="bg-white border border-outline-variant/30 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">
                        Cek Integritas
                    </button>
                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        Ekspor Log Forensik
                    </button>
                </div>
              </header>

              <section className="bg-white border border-outline-variant/30 rounded-[3.5rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/30 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 ">
                      <th className="px-10 py-6">Operator Admin</th>
                      <th className="px-10 py-6">Aksi & Deskripsi</th>
                      <th className="px-10 py-6">Entitas Target</th>
                      <th className="px-10 py-6 text-center">Jejak Waktu</th>
                      <th className="px-10 py-6">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-body select-text text-sm">
                    {logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-primary/[0.01] transition-all group">
                        <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-secondary opacity-30">account_circle</span>
                                <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase  leading-tight">{log.user}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 font-bold text-secondary  tracking-tight">{log.action}</td>
                        <td className="px-10 py-6 uppercase tracking-widest text-[10px] font-black text-primary/60">{log.target}</td>
                        <td className="px-10 py-6 text-center text-xs font-black text-secondary/40 ">{log.timestamp}</td>
                        <td className="px-10 py-6 text-[10px] font-black text-secondary tracking-widest opacity-80 leading-tight ">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>
        </div>
    )
}

export default AuditLog;
