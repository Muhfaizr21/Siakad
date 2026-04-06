import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';

const ContentManagement = () => {
    return (
        <div className="bg-surface text-on-surface min-h-screen flex font-headline font-body select-none">
          <Sidebar />
          <main className="pl-80 flex flex-col min-h-screen w-full">
            <TopNavBar />
            <div className="p-8 space-y-8">
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-primary tracking-tight font-headline uppercase tracking-widest italic">Institutional Broadcast Hub</h1>
                  <p className="text-secondary mt-1 font-medium font-body leading-relaxed">Executive portal for mass communication and official announcements.</p>
                </div>
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  Draft New Broadcast
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Announcement List */}
                <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-outline-variant/30 overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-outline-variant/30 bg-surface-container-low/50 flex justify-between items-end">
                        <div>
                            <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Live Announcements</h3>
                            <p className="text-xs text-secondary mt-1 font-body">Current active content visible on the student portal.</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-secondary/40 tracking-widest">3 Records Active</span>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-10 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer border-l-4 border-transparent hover:border-primary">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black tracking-widest uppercase">LIVE</span>
                                        <span className="text-[10px] text-secondary font-black tracking-widest uppercase italic opacity-60">Posted: Today, 10:00 UTC</span>
                                    </div>
                                    <h4 className="font-extrabold text-primary text-xl tracking-tight max-w-xl group-hover:text-blue-700 transition-colors leading-tight">Global Institutional Update: Semester Academic Year 2024 Registration Guidelines.</h4>
                                    <div className="flex gap-8 text-xs font-bold text-secondary tracking-tight font-body">
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm opacity-50">visibility</span> 12.4K Global Views</span>
                                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm opacity-50">groups</span> Target: All Users</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-3 bg-white border border-outline-variant/20 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-sm">edit_square</span>
                                    </button>
                                    <button className="p-3 bg-white border border-outline-variant/20 rounded-xl text-error hover:bg-error hover:text-white transition-all shadow-sm">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: Quick Actions */}
                <aside className="space-y-6">
                    <div className="bg-surface-container-low p-10 rounded-[3.5rem] border border-outline-variant/30 space-y-8 shadow-sm">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest font-headline">Mass Broadcast Presets</h3>
                        <div className="space-y-4 font-body">
                            <button className="w-full text-left p-6 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary transition-all">
                                <p className="font-bold text-primary group-hover:text-blue-700 transition-colors">Emergency Protocol</p>
                                <p className="text-xs text-secondary mt-1 font-medium leading-relaxed opacity-60 italic">Immediate global lock and system notification.</p>
                            </button>
                            <button className="w-full text-left p-6 bg-white border border-outline-variant/20 rounded-2xl group hover:border-primary transition-all">
                                <p className="font-bold text-primary group-hover:text-blue-700 transition-colors">Academic Cycle Start</p>
                                <p className="text-xs text-secondary mt-1 font-medium leading-relaxed opacity-60 italic">KRS reminder and semester initialization.</p>
                            </button>
                        </div>
                    </div>

                    <div className="bg-primary-container p-10 rounded-[3.5rem] text-white space-y-6 shadow-xl shadow-primary-container/20 overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                             <span className="material-symbols-outlined text-[150px]">mail</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-widest italic opacity-80 leading-tight">Identity-Based Targeting</h3>
                        <p className="text-xs text-white/70 font-medium font-body leading-relaxed">
                            SA can precisely target announcements to specific faculties, ormawas, or admin tiers only.
                        </p>
                        <ul className="space-y-3 text-[10px] font-black tracking-widest uppercase text-white/50">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div> All Admins</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div> Specific Faculty Node</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div> Global Institutional</li>
                        </ul>
                    </div>
                </aside>
              </div>
            </div>
          </main>
        </div>
    )
}

export default ContentManagement;
