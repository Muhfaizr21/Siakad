import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const SystemHealth = () => {
    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body font-sans select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline italic uppercase tracking-widest">Kabin Pilot: Infrastructure Center</h1>
                  <p className="text-secondary mt-1">Real-time health monitoring of the BKU Student Hub ecosystem.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[ 
                    { label: "Uptime Server", value: "99.99%", trend: "Optimal", color: "text-emerald-500", icon: "cloud_done" },
                    { label: "API Latency", value: "142ms", trend: "+12ms vs Avg", color: "text-primary", icon: "speed" },
                    { label: "PostgreSQL Load", value: "12%", trend: "Synced", color: "text-blue-500", icon: "database" },
                    { label: "Email Delivery", value: "Healthy", trend: "0 Queued", color: "text-secondary", icon: "mail" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/30 flex flex-col justify-between shadow-sm group hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <span className={`material-symbols-outlined ${stat.color} group-hover:scale-110 transition-transform`}>{stat.icon}</span>
                            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-primary">{stat.value}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1 group-hover:text-primary transition-colors">{stat.label}</p>
                        </div>
                    </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                     <section className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-8 shadow-sm">
                        <h3 className="text-lg font-black text-primary uppercase tracking-widest font-headline">Server Resource Utilization</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {[ 
                                { label: "CPU Usage", value: 42, color: "bg-primary" },
                                { label: "Memory Memory (RAM)", value: 78, color: "bg-error" },
                                { label: "Storage (PostgreSQL Cloud)", value: 15, color: "bg-emerald-500" },
                                { label: "Redis Session Cache", value: 5, color: "bg-secondary" }
                            ].map((res, i) => (
                                <div key={i} className="space-y-4">
                                    <div className="flex justify-between text-xs font-bold text-secondary tracking-widest uppercase">
                                        <span>{res.label}</span>
                                        <span>{res.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                        <div className={`h-full transition-all duration-1000 ${res.color}`} style={{width: `${res.value}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </section>

                     <section className="bg-primary-container p-10 rounded-[3.5rem] text-white space-y-8 shadow-xl shadow-primary-container/20">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                            <h3 className="text-xl font-bold uppercase tracking-widest italic">Security Firewall: Active Handler</h3>
                        </div>
                        <div className="divide-y divide-white/10 font-body">
                            {[ 
                                { log: "Brute force attempt blocked on /login (IP: 103.xxx.xxx.xxx)", status: "SECURE", time: "2 mins ago" },
                                { log: "Unauthorized role change attempt blocked on #USER-882", status: "BLOCKED", time: "1 hour ago" },
                                { log: "Global session sync successful with Redis DB #3", status: "HEALTHY", time: "4 hours ago" }
                            ].map((log, i) => (
                                <div key={i} className="py-6 flex justify-between items-center group">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium tracking-tight text-white/90">{log.log}</p>
                                        <p className="text-[10px] text-white/50 font-black tracking-widest italic">{log.time}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black tracking-widest border border-white/20">{log.status}</span>
                                </div>
                            ))}
                        </div>
                     </section>
                  </div>

                  <aside className="bg-white p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-10 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-45 transition-transform duration-700">
                        <span className="material-symbols-outlined text-[120px] text-primary">analytics</span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Infrastructure Overview</h3>
                        <p className="text-xs text-secondary font-medium leading-relaxed">The system is operating at 100% capacity with no critical issues detected.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">cloud_download</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Backups</p>
                                    <p className="text-[10px] text-emerald-600 font-black tracking-widest uppercase">LAST: 15 MINS AGO</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">vpn_key</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Authorization Engine</p>
                                    <p className="text-[10px] text-blue-600 font-black tracking-widest uppercase">IDP: ONLINE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-3xl space-y-4">
                        <h4 className="text-xs font-black text-primary uppercase tracking-widest">Network Traffic Trace</h4>
                        <div className="h-32 w-full flex items-end gap-1 px-2">
                            {[ 40, 60, 20, 90, 30, 70, 50, 80, 20, 50, 30, 90, 60, 40 ].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary transition-all duration-1000" style={{height: `${h}%`}}></div>
                            ))}
                        </div>
                    </div>
                    
                    <button className="w-full py-4 border border-outline-variant/30 text-primary rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-surface-container-low hover:bg-primary hover:text-white transition-all">
                        Flush Redis Cache (Emergency Only)
                    </button>
                  </aside>
              </div>
            </div>
          </main>
        </div>
    )
}

export default SystemHealth;
