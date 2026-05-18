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
        <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
            
            <div className="max-w-[1600px] mx-auto space-y-10">
                
                {/* ── Page Header ─────────────────────────────────────────── */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-rose-50/50 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-rose-500 rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Security Hub</span>
                            </div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                                Security <span className="text-rose-500 italic">Protocols</span>
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                                Konfigurasi tingkat tinggi untuk keamanan institusional, manajemen akses IP, dan otorisasi sesi administratif global.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                className="h-11 px-6 rounded-xl bg-neutral-900 text-white hover:bg-rose-600 shadow-xl shadow-rose-900/10 gap-2 transition-all active:scale-95 border-none"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Save Protocols</span>
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* ── Identity & Access Control ────────────────────────── */}
                    <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden group">
                        <CardContent className="p-8 md:p-10 space-y-8 relative">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Lock size={120} /></div>
                            
                            <div className="space-y-1 relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >language</span>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Access Policy</span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Identity Guard</h3>
                                <p className="text-xs font-medium text-neutral-400">Konfigurasi IP Whitelist & Session Lifecycle</p>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Authorized IP Whitelist</Label>
                                    <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 space-y-4">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {['103.212.xx (HOME)', '127.0.0.1 (LOCAL)'].map((ip, idx) => (
                                                <Badge key={idx} className="px-3 py-1.5 bg-neutral-900 text-white border-none rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                                    {ip}
                                                </Badge>
                                            ))}
                                            <Button variant="outline" className="h-9 w-9 rounded-lg border-neutral-200 text-neutral-400 hover:text-primary hover:border-primary transition-all p-0">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                                            </Button>
                                        </div>
                                        <p className="text-[11px] font-medium text-neutral-400 leading-relaxed italic border-t border-neutral-200/50 pt-4">
                                            Peringatan: Akses ke panel Super Admin akan diblokir total dari alamat IP yang tidak terdaftar di atas.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Session Expiration Lifecycle</Label>
                                    <div className="relative group/select">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400 group-focus-within/select:text-primary transition-colors" >schedule</span>
                                        <select className="w-full h-12 bg-neutral-50 border border-neutral-200 pl-11 pr-6 rounded-xl text-xs font-bold text-neutral-900 uppercase tracking-widest focus:ring-2 ring-primary/10 transition-all outline-none appearance-none cursor-pointer">
                                            <option>30 Menit (STANDAR KEAMANAN)</option>
                                            <option>1 Jam (MODERAT)</option>
                                            <option>Revoke Instan saat Idle</option>
                                        </select>
                                        <RefreshCcw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 relative z-10">
                               <Button className="w-full h-12 rounded-xl bg-neutral-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary shadow-xl shadow-primary/10 transition-all active:scale-95">
                                  Simpan Konfigurasi <Zap size={14} className="ml-2" />
                               </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Active Sessions Monitoring ───────────────────────── */}
                    <Card className="bg-neutral-900 text-white border-neutral-800 shadow-2xl rounded-xl overflow-hidden relative group">
                        <CardContent className="p-8 md:p-10 space-y-8 relative">
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><KeyRound size={120} /></div>
                            
                            <div className="space-y-1 relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Monitor size={14} className="text-primary" />
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Monitoring</span>
                                </div>
                                <h3 className="text-lg font-bold text-white font-jakarta tracking-tight">Active Administrative Sessions</h3>
                                <p className="text-xs font-medium text-neutral-500">Sesi operasional yang sedang aktif secara real-time.</p>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {[
                                    { user: "Super Admin (Self)", ip: "127.0.0.1", device: "Chrome · macOS", status: "Active Now", active: true },
                                    { user: "Siti (Faculty Admin)", ip: "103.xxx.xxx.xxx", device: "Firefox · Windows", status: "2 menit lalu", active: false },
                                ].map((session, i) => (
                                    <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between group/session hover:bg-white/[0.06] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-11 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shadow-lg">
                                                {session.user[0]}
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    {session.active && <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                                                    <p className="font-bold text-white text-[13px] tracking-tight uppercase font-jakarta">{session.user}</p>
                                                </div>
                                                <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">{session.device} · {session.ip}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <Button variant="ghost" className="h-8 px-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[9px] font-bold uppercase tracking-widest transition-all gap-1.5">
                                                <UserX size={12} /> Terminate
                                            </Button>
                                            <span className="text-[9px] text-neutral-600 font-bold tracking-widest uppercase">{session.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Emergency Shutdown Section */}
                            <div className="pt-6 relative z-10">
                                <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-4 group/emergency">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                                          <span className="material-symbols-outlined group-hover/emergency:animate-bounce" style={{ fontSize: '18px' }} Alert >security</span>
                                       </div>
                                       <div className="space-y-0.5">
                                          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest font-jakarta">Global Emergency Lockdown</p>
                                          <p className="text-[10px] text-rose-500/50 font-medium">Matikan seluruh sesi administratif secara instan.</p>
                                       </div>
                                    </div>
                                    <Button className="w-full h-11 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-rose-900/40 hover:bg-rose-500 transition-all border-none">
                                        Execute Lockdown ⚡
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* ── Security Status Footer ────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 py-6 grayscale opacity-40">
                   <span className="material-symbols-outlined text-neutral-400" style={{ fontSize: '20px' }} Check >security</span>
                   <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.4em]">Military Grade Encryption Active</span>
                </div>

            </div>
        </div>
    )
}

export default SecuritySettings
