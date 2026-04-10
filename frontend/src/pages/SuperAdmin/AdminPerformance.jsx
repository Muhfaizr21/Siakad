import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';

const AdminPerformance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAuditLogs();
            if (res.status === 'success') {
                setLogs(res.data || []);
            }
        } catch (error) {
            console.error('Gagal memuat audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full font-body">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight uppercase leading-none">Security Intelligence & Audit</h1>
                  <p className="text-slate-600 mt-2 font-medium opacity-90">Pemantauan aktivitas sistem real-time dan audit jejak digital seluruh entitas administratif.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-body">
                  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 space-y-2 shadow-sm font-body">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Event Terpantau</p>
                      <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">{loading ? '...' : logs.length.toString().padStart(2, '0')} Aktivitas</h3>
                  </div>
              </div>

              <section className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm font-body">
                 <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center font-body">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Jejak Digital (Audit Logs)</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sistem Operasional Normal</span>
                 </div>
                 <div className="divide-y divide-slate-100 select-text font-body">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest leading-loose">Mensinkronkan log keamanan...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest leading-loose">Tidak ada aktivitas terdeteksi dalam 24 jam terakhir.</div>
                    ) : logs.map((log) => (
                      <div key={log.ID} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group border-b border-slate-50 font-body">
                        <div className="flex gap-6 items-start font-body">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${
                                log.Aktivitas.includes('DELETE') ? 'bg-rose-50 text-rose-600' :
                                log.Aktivitas.includes('UPDATE') ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                            }`}>
                                <span className="material-symbols-outlined text-[20px]">
                                    {log.Aktivitas.includes('DELETE') ? 'delete_forever' : 
                                     log.Aktivitas.includes('UPDATE') ? 'edit_square' : 'history'}
                                </span>
                            </div>
                            <div className="font-body">
                                <div className="flex items-center gap-4">
                                    <span className="text-primary font-black text-sm uppercase tracking-tight ">{log.Aktivitas}</span>
                                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{new Date(log.CreatedAt).toLocaleTimeString('id-ID')}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-500 mt-1 max-w-xl group-hover:text-slate-900 transition-colors uppercase italic leading-relaxed tracking-tighter">
                                    {log.Deskripsi}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-slate-500">OPERATOR: {log.User?.Email || 'SYSTEM'}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-slate-500">IP: {log.IPAddress || '0.0.0.0'}</span>
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verified Log</span>
                      </div>
                    ))}
                 </div>
              </section>
            </div>
          </main>
        </div>
    )
}

export default AdminPerformance;
