import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { adminService } from '../../services/api';
import { toast, Toaster } from 'react-hot-toast';
import { Trash2, Edit3, ShieldCheck, Activity, Loader2 } from 'lucide-react';

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
            } else {
                toast.error('Gagal memuat audit logs');
            }
        } catch (error) {
            toast.error('Gagal terhubung ke server');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (activity = '') => {
        if (activity.includes('DELETE')) return <Trash2 className="size-5" />;
        if (activity.includes('UPDATE') || activity.includes('EDIT')) return <Edit3 className="size-5" />;
        return <Activity className="size-5" />;
    };

    const getActionColors = (activity = '') => {
        if (activity.includes('DELETE')) return 'bg-rose-50 text-rose-600';
        if (activity.includes('UPDATE')) return 'bg-amber-50 text-amber-600';
        return 'bg-emerald-50 text-emerald-600';
    };

    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-sans select-none">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">

                <TopNavBar />
                <div className="p-8 space-y-8">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="size-6" /></div>
                            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Security Intelligence & Audit</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pemantauan aktivitas sistem real-time dan audit jejak digital seluruh entitas administratif.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-2 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Event Terpantau</p>
                            <h3 className="text-3xl font-black text-primary uppercase tracking-tighter font-headline">
                                {loading ? '...' : logs.length.toString().padStart(2, '0')}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Aktivitas Tercatat</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-2 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">CREATE Events</p>
                            <h3 className="text-3xl font-black text-emerald-600 uppercase tracking-tighter font-headline">
                                {loading ? '...' : logs.filter(l => l.Aktivitas?.includes('CREATE')).length}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Data baru masuk sistem</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-2 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">UPDATE Events</p>
                            <h3 className="text-3xl font-black text-amber-600 uppercase tracking-tighter font-headline">
                                {loading ? '...' : logs.filter(l => l.Aktivitas?.includes('UPDATE')).length}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Perubahan data aktif</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-2 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">DELETE Events</p>
                            <h3 className="text-3xl font-black text-rose-600 uppercase tracking-tighter font-headline">
                                {loading ? '...' : logs.filter(l => l.Aktivitas?.includes('DELETE')).length}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Penghapusan terdeteksi</p>
                        </div>
                    </div>

                    <section className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Jejak Digital (Audit Logs)</h3>
                            <button onClick={loadLogs} className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                Refresh
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="p-20 text-center flex flex-col items-center gap-4">
                                    <Loader2 className="size-8 animate-spin text-primary/40" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mensinkronkan log keamanan...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="p-20 text-center text-slate-400 uppercase font-black text-[10px] tracking-widest">
                                    Tidak ada aktivitas terdeteksi.
                                </div>
                            ) : logs.map((log) => (
                                <div key={log.ID} className="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                                    <div className="flex gap-6 items-start">
                                        <div className={`size-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm shrink-0 ${getActionColors(log.Aktivitas)}`}>
                                            {getActionIcon(log.Aktivitas)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-4">
                                                <span className="text-primary font-black text-sm uppercase tracking-tight font-headline">{log.Aktivitas}</span>
                                                <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{new Date(log.CreatedAt).toLocaleTimeString('id-ID')}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 max-w-xl uppercase italic leading-relaxed tracking-tighter">{log.Deskripsi}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-slate-500">
                                                    OPERATOR: {log.Pengguna?.Email || log.User?.Email || 'SYSTEM'}
                                                </span>
                                                {log.IPAddress && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg text-slate-500">
                                                        IP: {log.IPAddress}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest shrink-0">Verified Log</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminPerformance;
