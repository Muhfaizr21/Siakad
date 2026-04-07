import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const SecuritySettings = () => {
    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body font-sans select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase tracking-widest ">Security Node & Protocol</h1>
                  <p className="text-secondary mt-1">Institutional security configuration and global session management.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <section className="bg-white p-12 rounded-[3.5rem] border border-outline-variant/30 space-y-12 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <span className="material-symbols-outlined text-[150px] text-primary">security</span>
                        </div>
                        <h3 className="text-xl font-black text-primary uppercase tracking-widest font-headline ">Global Identity Protocol</h3>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase text-secondary/50 tracking-widest px-2">Authorized IP Whitelist</label>
                                <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <span className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg shadow-primary/20">103.212.xx (Home)</span>
                                        <span className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg shadow-primary/20">127.0.0.1 (Local)</span>
                                        <button className="p-2 hover:bg-primary/5 rounded-full text-primary"><span className="material-symbols-outlined">add_circle</span></button>
                                    </div>
                                    <p className="text-xs text-secondary/60 font-medium font-body leading-relaxed  opacity-80 border-t border-outline-variant/10 pt-4 mt-2">Access to the Super Admin panel is strictly prohibited from non-whitelisted IP addresses.</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase text-secondary/50 tracking-widest px-2">Global Session Timeout</label>
                                <select className="bg-white border border-outline-variant/30 px-6 py-4 rounded-2xl text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none">
                                    <option>30 Minutes (Recommended)</option>
                                    <option>1 Hour</option>
                                    <option>Immediate Revoke on Idle</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="bg-secondary-container p-12 rounded-[3.5rem] border border-secondary/20 space-y-12 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 transition-transform duration-700">
                            <span className="material-symbols-outlined text-[150px] text-primary">key_visualizer</span>
                        </div>
                        <h3 className="text-xl font-black text-primary uppercase tracking-widest font-headline ">Active Administrative Sessions</h3>
                        <div className="space-y-6">
                            {[ 
                                { user: "Dr. Vance (Self)", ip: "127.0.0.1", device: "Chrome / macOS", status: "Active Now" },
                                { user: "Siti (Faculty)", ip: "103.xxx.xxx.xxx", device: "Firefox / Windows", status: "2 mins ago" }
                            ].map((session, i) => (
                                <div key={i} className="p-8 bg-white/40 border border-white/20 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/60 transition-all border-dashed shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold">
                                            SA
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary tracking-tight">{session.user}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-secondary/60 tracking-widest ">{session.device} • {session.ip}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest group-hover:underline cursor-pointer">Terminate Session</span>
                                        <span className="text-[10px] text-secondary/40 font-black tracking-widest  mt-1">{session.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
              </div>
            </div>
          </main>
        </div>
    )
}

export default SecuritySettings;
