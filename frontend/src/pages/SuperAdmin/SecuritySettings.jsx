import React from 'react';
import Sidebar from './components/Sidebar';
import TopNavBar from './components/TopNavBar';
import { ShieldCheck, Lock, Globe, KeyRound, Clock, UserX, Plus, Settings } from 'lucide-react';

const SecuritySettings = () => {
    return (
        <div className="bg-slate-50 text-slate-900 min-h-screen flex font-sans select-none">
            <Sidebar />
            <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">
                <TopNavBar />
                <div className="p-8 space-y-8">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="size-6" /></div>
                            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Security Node & Protocol</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Konfigurasi Keamanan Institusional & Manajemen Sesi Global</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* IP Whitelist */}
                        <section className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                                <Lock className="size-36 text-primary" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Globe className="size-5 text-primary" />
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-headline">Global Identity Protocol</h3>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-8">Konfigurasi IP Whitelist & Session Policy</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Authorized IP Whitelist</label>
                                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4">
                                        <div className="flex flex-wrap gap-3 items-center">
                                            <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase shadow-sm">103.212.xx (Home)</span>
                                            <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase shadow-sm">127.0.0.1 (Local)</span>
                                            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all">
                                                <Plus className="size-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed border-t border-slate-100 pt-4">
                                            Akses ke panel Super Admin diblokir dari IP yang tidak terdaftar.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Global Session Timeout</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300" />
                                        <select className="w-full bg-slate-50 border border-slate-200 pl-10 pr-6 py-4 rounded-2xl text-xs font-black text-slate-900 uppercase tracking-widest focus:ring-2 ring-primary/10 transition-all outline-none appearance-none">
                                            <option>30 Menit (Direkomendasikan)</option>
                                            <option>1 Jam</option>
                                            <option>Revoke Instan saat Idle</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
                                    <Settings className="size-4" /> Simpan Konfigurasi
                                </button>
                            </div>
                        </section>

                        {/* Active Sessions */}
                        <section className="bg-slate-900 text-white p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-xl shadow-slate-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <KeyRound className="size-36 text-white" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <KeyRound className="size-5 text-primary" />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest font-headline">Active Administrative Sessions</h3>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-8">Sesi admin yang sedang aktif secara real-time</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { user: "Super Admin (Self)", ip: "127.0.0.1", device: "Chrome · macOS", status: "Active Now", active: true },
                                        { user: "Siti (Faculty Admin)", ip: "103.xxx.xxx.xxx", device: "Firefox · Windows", status: "2 menit lalu", active: false },
                                    ].map((session, i) => (
                                        <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="size-11 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-xs border border-primary/30">
                                                    {session.user[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {session.active && <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />}
                                                        <p className="font-black text-white text-sm tracking-tight">{session.user}</p>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{session.device} · {session.ip}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <button className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-[10px] font-black uppercase tracking-widest transition-all">
                                                    <UserX className="size-3.5" /> Terminate
                                                </button>
                                                <span className="text-[9px] text-slate-600 font-black tracking-widest uppercase">{session.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Emergency Lockdown */}
                                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem]">
                                    <p className="text-xs font-black text-rose-400 uppercase tracking-widest font-headline mb-1">⚡ Global Emergency Lockdown</p>
                                    <p className="text-[10px] text-rose-400/70 font-medium mb-4">Matikan seluruh sesi fakultas dan mahasiswa secara instan.</p>
                                    <button className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-500 transition-all">
                                        Eksekusi Lockdown
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SecuritySettings;
