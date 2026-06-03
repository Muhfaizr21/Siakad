"use client"

import React from 'react'

import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { cn } from '@/lib/utils'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCcw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;
const Monitor = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>desktop_windows</span>;
const UserX = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person_off</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Lock = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>lock</span>;
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;
const KeyRound = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>vpn_key</span>;



const SecuritySettings = () => {
    return (
        <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
            
            <div className="max-w-[1600px] mx-auto space-y-8 select-none">
                
                {/* ── Page Header ─────────────────────────────────────────── */}
                <section className="glass-card border border-slate-200/60 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-none">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-rose-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Security Hub</span>
                            </div>
                            <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                                Security <span className="text-rose-500 italic">Protocols</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                                Konfigurasi tingkat tinggi untuk keamanan institusional, manajemen akses IP, dan otorisasi sesi administratif global.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                className="h-11 px-6 rounded-xl bg-slate-800 text-white hover:bg-rose-600 shadow-none gap-2 transition-all active:scale-95 border-none cursor-pointer font-headline"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Save Protocols</span>
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* ── Identity & Access Control ────────────────────────── */}
                    <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden group">
                        <CardContent className="p-8 md:p-10 space-y-8 relative">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Lock size={120} /></div>
                            
                            <div className="space-y-1 relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '14px' }} >language</span>
                                    <span className="text-[10px] font-black text-bku-primary uppercase tracking-widest font-headline">Access Policy</span>
                                </div>
                                <h3 className="text-lg font-black font-headline tracking-tight" style={{ color: 'var(--theme-h3)' }}>Identity Guard</h3>
                                <p className="text-[11px] font-medium text-slate-400 font-inter">Konfigurasi IP Whitelist & Session Lifecycle</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline ml-1">Authorized IP Whitelist</Label>
                                    <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/60 space-y-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {['103.212.xx (HOME)', '127.0.0.1 (LOCAL)'].map((ip, idx) => (
                                                <Badge key={idx} className="px-3 py-1.5 bg-slate-800 text-white border-none rounded-lg text-[10px] font-black font-headline uppercase tracking-widest shadow-none">
                                                    {ip}
                                                </Badge>
                                            ))}
                                            <Button variant="outline" className="h-9 w-9 rounded-lg border-slate-200 text-slate-400 hover:text-bku-primary hover:border-bku-primary transition-all p-0 shadow-none cursor-pointer">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                                            </Button>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic border-t border-slate-200/40 pt-4 font-inter">
                                            Peringatan: Akses ke panel Super Admin akan diblokir total dari alamat IP yang tidak terdaftar di atas.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline ml-1">Session Expiration Lifecycle</Label>
                                    <div className="relative group/select">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/select:text-bku-primary transition-colors" >schedule</span>
                                        <select className="w-full h-12 bg-white/50 border border-slate-200/60 pl-11 pr-6 rounded-xl text-xs font-black font-headline text-slate-800 uppercase tracking-widest focus:ring-2 ring-bku-primary/20 transition-all outline-none appearance-none cursor-pointer">
                                            <option>30 Menit (STANDAR KEAMANAN)</option>
                                            <option>1 Jam (MODERAT)</option>
                                            <option>Revoke Instan saat Idle</option>
                                        </select>
                                        <RefreshCcw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 relative z-10">
                               <Button className="w-full h-12 rounded-xl bg-slate-800 text-white font-black font-headline text-[10px] uppercase tracking-widest hover:bg-bku-primary shadow-none transition-all active:scale-95 cursor-pointer border-none">
                                  Simpan Konfigurasi <Zap size={14} className="ml-2" />
                               </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Active Sessions Monitoring ───────────────────────── */}
                    <Card className="glass-card bg-slate-900 text-white border-none shadow-none rounded-2xl overflow-hidden relative group">
                        <CardContent className="p-8 md:p-10 space-y-8 relative">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><KeyRound size={120} /></div>
                            
                            <div className="space-y-1 relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Monitor size={14} className="text-bku-primary" />
                                    <span className="text-[10px] font-black text-bku-primary uppercase tracking-widest font-headline">Live Monitoring</span>
                                </div>
                                <h3 className="text-lg font-black font-headline tracking-tight" style={{ color: 'var(--theme-h3)' }}>Active Administrative Sessions</h3>
                                <p className="text-[11px] font-medium text-slate-400 font-inter">Sesi operasional yang sedang aktif secara real-time.</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {[
                                    { user: "Super Admin (Self)", ip: "127.0.0.1", device: "Chrome · macOS", status: "Active Now", active: true },
                                    { user: "Siti (Faculty Admin)", ip: "103.xxx.xxx.xxx", device: "Firefox · Windows", status: "2 menit lalu", active: false },
                                ].map((session, i) => (
                                    <div key={i} className="p-5 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between group/session hover:bg-white/[0.06] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-11 bg-bku-primary/20 rounded-xl flex items-center justify-center text-bku-primary font-black font-headline text-sm border border-bku-primary/20 shadow-none">
                                                {session.user[0]}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    {session.active && <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                                                    <p className="font-black text-white text-[13px] tracking-tight uppercase font-headline">{session.user}</p>
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 font-headline tracking-widest">{session.device} · {session.ip}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <Button variant="ghost" className="h-8 px-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[9px] font-black font-headline uppercase tracking-widest transition-all gap-1.5 shadow-none cursor-pointer">
                                                <UserX size={12} /> Terminate
                                            </Button>
                                            <span className="text-[9px] text-slate-500 font-black font-headline tracking-widest uppercase">{session.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Emergency Shutdown Section */}
                            <div className="pt-6 relative z-10">
                                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-4 group/emergency">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                          <span className="material-symbols-outlined group-hover/emergency:animate-bounce" style={{ fontSize: '18px' }} Alert >security</span>
                                       </div>
                                       <div className="space-y-0.5">
                                          <p className="text-[11px] font-black font-headline text-rose-400 uppercase tracking-widest">Global Emergency Lockdown</p>
                                          <p className="text-[10px] text-rose-500/50 font-medium font-inter">Matikan seluruh sesi administratif secara instan.</p>
                                       </div>
                                    </div>
                                    <Button className="w-full h-11 bg-rose-600 text-white rounded-xl text-[10px] font-black font-headline uppercase tracking-widest shadow-none hover:bg-rose-500 transition-all border-none cursor-pointer">
                                        Execute Lockdown ⚡
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* ── Security Status Footer ────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 py-6 grayscale opacity-40">
                   <span className="material-symbols-outlined text-slate-400" style={{ fontSize: '20px' }} Check >security</span>
                   <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-[0.4em]">Military Grade Encryption Active</span>
                </div>

            </div>
        </div>
    )
}

export default SecuritySettings
