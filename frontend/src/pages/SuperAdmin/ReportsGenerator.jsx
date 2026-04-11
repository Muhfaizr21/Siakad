import React from 'react';
import { BarChart3, ShieldCheck, Zap, Users, FileText, Clock, Download } from 'lucide-react';

const ReportsGenerator = () => {
    const stats = [
        { label: "Faculty Accuracy", value: "98.2%", trend: "+2.1%", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "Data Integrity", value: "100%", trend: "Synced", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
        { label: "Export Speed", value: "Low", trend: "0.2s Avg", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Active Admins", value: "45", trend: "4 Online Now", icon: Users, color: "text-slate-600", bg: "bg-slate-100" },
    ];

    const reports = [
        { name: "Laporan Bulanan Layanan Kemahasiswaan", lastRun: "Hari ini, 10:00", size: "1.2 MB", type: "PDF/XLS" },
        { name: "Data Prestasi Mahasiswa Nasional & Internasional", lastRun: "2 hari lalu", size: "4.5 MB", type: "XLS" },
        { name: "Rekapitulasi Konseling Global Hub", lastRun: "1 minggu lalu", size: "850 KB", type: "PDF" },
    ];

    return (
        <div className="p-4 md:p-8 space-y-8">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><BarChart3 className="size-6" /></div>
                            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Institutional Intelligence</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pusat Generasi Laporan & Export Data Akreditasi Global</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between shadow-sm group hover:border-primary/50 transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl ${stat.bg} transition-transform group-hover:scale-110 duration-300`}>
                                        <stat.icon className={`size-5 ${stat.color}`} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-right leading-tight">{stat.label}</span>
                                </div>
                                <div>
                                    <h3 className={`text-3xl font-black font-headline tracking-tighter ${stat.color}`}>{stat.value}</h3>
                                    <p className="text-xs text-slate-400 mt-1 font-bold group-hover:text-primary transition-colors uppercase tracking-tighter">{stat.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Report Templates */}
                        <div className="lg:col-span-2">
                            <section className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-6 shadow-sm">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Export Templates (BAN-PT)</h3>
                                <div className="space-y-4">
                                    {reports.map((report, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <FileText className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-tight leading-tight text-sm">{report.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Clock className="size-3 text-slate-300" />
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{report.lastRun} · {report.size}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-primary transition-all flex items-center gap-1.5">
                                                    <Download className="size-3.5" /> {report.type.split('/')[0]}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Custom Report */}
                        <aside className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8 shadow-xl shadow-slate-900/20 relative overflow-hidden">
                            <div className="absolute -bottom-10 -right-10 opacity-10">
                                <BarChart3 className="size-48" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest font-headline">Custom Aggregate</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Buat laporan non-standar dengan menggabungkan dataset institusional global.
                                </p>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Primary Target</label>
                                    <select className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all">
                                        <option className="text-slate-900">Semua Fakultas</option>
                                        <option className="text-slate-900">Fakultas Teknik</option>
                                        <option className="text-slate-900">Fakultas Ekonomi</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Date Range</label>
                                    <input className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl text-xs font-bold text-white placeholder:text-slate-500 outline-none" placeholder="YYYY-MM-DD — YYYY-MM-DD" />
                                </div>
                            </div>

                            <div className="relative z-10 space-y-3">
                                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary hover:text-white transition-all">
                                    Initiate Global Process
                                </button>
                                <p className="text-[10px] text-slate-600 text-center">Proses ini membutuhkan 5-10 detik untuk query global JOIN.</p>
                            </div>
                        </aside>
                    </div>
        </div>
    );
};

export default ReportsGenerator;
