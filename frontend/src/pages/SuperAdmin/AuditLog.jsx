import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAuditLogs();
            if (res.status === 'success') {
                setLogs(res.data || []);
            }
        } catch (e) {
            console.error("Gagal load logs:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none font-sans">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-8 font-body">
              <header className="flex justify-between items-end font-body">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Log Audit Absolut (Immutable)</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90 leading-relaxed font-body">Rekaman jejak forensik seluruh aksi administratif sistem yang tidak dapat diubah oleh siapapun.</p>
                </div>
                <div className="flex gap-4 font-body">
                    <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all font-body">
                        Cek Integritas
                    </button>
                    <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all font-body leading-none h-12 flex items-center">
                        Ekspor Log Forensik
                    </button>
                </div>
              </header>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm font-body">
                 <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-end font-body">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Registri Aktivitas Global</h3>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Verified by Institutional Node</span>
                 </div>
                 <table className="w-full text-left font-body">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 leading-tight">
                      <th className="px-10 py-6">Operator Admin</th>
                      <th className="px-10 py-6">Aksi & Deskripsi</th>
                      <th className="px-10 py-6 text-center">Jejak Waktu</th>
                      <th className="px-10 py-6 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body select-text text-sm">
                    {loading ? (
                        <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest leading-loose">Memverifikasi rekaman forensik...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest leading-loose">Tidak ada jejak aktivitas ditemukan.</td></tr>
                    ) : logs.map((log) => (
                      <tr key={log.ID} className="hover:bg-slate-50/50 transition-all group border-b border-slate-50">
                        <td className="px-10 py-6 font-body">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 bg-primary/5 rounded-xl flex items-center justify-center font-black text-primary shadow-inner uppercase text-[10px]">
                                    {log.User?.Email ? log.User.Email[0] : 'S'}
                                </div>
                                <div className="font-body">
                                    <span className="font-extrabold text-primary group-hover:text-blue-700 transition-colors uppercase tracking-tight leading-none truncate block max-w-[150px]">
                                        {log.User?.Email || 'SYSTEM'}
                                    </span>
                                    <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">Verified Node</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-10 py-6 font-body">
                             <div className="flex flex-col font-body">
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                    log.Aktivitas.includes('DELETE') ? 'text-rose-600' :
                                    log.Aktivitas.includes('UPDATE') ? 'text-amber-600' : 'text-emerald-600'
                                }`}>
                                    {log.Aktivitas.replace(/_/g, ' ')}
                                </span>
                                <p className="font-bold text-slate-500 tracking-tight leading-relaxed max-w-lg italic opacity-80 uppercase text-[11px]">{log.Deskripsi}</p>
                             </div>
                        </td>
                        <td className="px-10 py-6 text-center font-body">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{new Date(log.CreatedAt).toLocaleDateString('id-ID')}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(log.CreatedAt).toLocaleTimeString('id-ID')}</span>
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right font-body">
                            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black tracking-[0.1em]">IP: {log.IPAddress || '0.0.0.0'}</span>
                        </td>
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
