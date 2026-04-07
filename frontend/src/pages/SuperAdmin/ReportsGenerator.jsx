import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const ReportsGenerator = () => {
    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline">Institutional Intelligence</h1>
                  <p className="text-secondary mt-1">Global report generation and accreditation data export hub.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[ 
                    { label: "Faculty Accuracy", value: "98.2%", trend: "+2.1%", icon: "fact_check", color: "text-emerald-500" },
                    { label: "Data Integrity", value: "100%", trend: "Synced", icon: "security", color: "text-primary" },
                    { label: "Export Load", value: "Low", trend: "0.2s Avg", icon: "speed", color: "text-blue-500" },
                    { label: "Active Admins", value: "45", trend: "4 Online Now", icon: "supervised_user_circle", color: "text-secondary" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm group hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`material-symbols-outlined ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</span>
                            <span className="text-[10px] font-black uppercase text-secondary tracking-widest">{stat.label}</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-primary">{stat.value}</h3>
                            <p className="text-xs text-secondary mt-1 font-bold group-hover:text-primary transition-colors">{stat.trend}</p>
                        </div>
                    </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-8 shadow-sm">
                        <h3 className="text-xl font-black text-primary uppercase tracking-widest font-headline">Export Templates (BAN-PT)</h3>
                        <div className="space-y-4">
                            {[ 
                                { name: "Laporan Bulanan Layanan Kemahasiswaan", lastRun: "Today, 10:00 UTC", size: "1.2 MB", type: "PDF/XLS" },
                                { name: "Data Prestasi Mahasiswa Nasional & Internasional", lastRun: "2 days ago", size: "4.5 MB", type: "XLS" },
                                { name: "Rekapitulasi Konseling Global Hub", lastRun: "1 week ago", size: "850 KB", type: "PDF" }
                            ].map((report, i) => (
                                <div key={i} className="flex items-center justify-between p-8 bg-surface-container-low/50 rounded-[2.5rem] border border-outline-variant/10 group hover:bg-white transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm ring-1 ring-outline-variant/20">
                                            <span className="material-symbols-outlined text-2xl">description</span>
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-primary tracking-tight leading-tight mb-0.5">{report.name}</p>
                                            <p className="text-[10px] text-secondary font-black uppercase tracking-widest opacity-80">Last sync: {report.lastRun} • {report.size}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-3 bg-primary text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:scale-105 transition-all">DOWNLOAD {report.type.split('/')[0]}</button>
                                        <button className="p-3 hover:bg-surface-container rounded-xl text-secondary"><span className="material-symbols-outlined">schedule_send</span></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="bg-tertiary-container p-10 rounded-[3.5rem] text-white space-y-10 shadow-xl shadow-tertiary-container/20">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest font-headline ">Custom Aggregate</h3>
                        <p className="text-xs text-white/70 font-medium font-body leading-relaxed">
                            Generate a non-standard report by combining global institutional datasets.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-white/50 tracking-widest px-2">Primary Target</label>
                            <select className="bg-white/10 border border-white/20 px-6 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-4 focus:ring-white/10 transition-all">
                                <option className="text-primary">Fakultas Teknik</option>
                                <option className="text-primary">Fakultas Ekonomi</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-white/50 tracking-widest px-2">Date Range</label>
                            <input className="bg-white/10 border border-white/20 px-6 py-4 rounded-2xl text-sm font-bold text-white placeholder:text-white/30" placeholder="YYYY/MM/DD - YYYY/MM/DD" />
                        </div>
                    </div>

                    <button className="w-full py-4 bg-white text-primary rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5 hover:scale-[1.03] active:scale-95 transition-all">
                        Initiate Global Process
                    </button>

                    <p className="text-[10px] text-white/50  text-center font-body">This operation triggers global JOIN queries in the infrastructure layer. Expect 5-10s delay.</p>
                </aside>
              </div>
            </div>
          </main>
        </div>
    )
}

export default ReportsGenerator;
