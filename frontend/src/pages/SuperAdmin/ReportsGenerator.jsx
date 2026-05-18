"use client"

import React, { useState } from 'react'

import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { cn } from '@/lib/utils'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Layers = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>layers</span>;
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;
const PieChart = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>pie_chart</span>;
const Database = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>storage</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const BarChart3 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bar_chart</span>;



const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;
const Users = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>group</span>;



const ReportsGenerator = () => {
    const stats = [
        { label: "Faculty Accuracy", value: "98.2%", trend: "+2.1%", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { label: "Data Integrity", value: "100%", trend: "Synced", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/5", border: "border-primary/10" },
        { label: "Export Latency", value: "0.2s", trend: "Optimized", icon: Zap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        { label: "Active Nodes", value: "45", trend: "All Online", icon: Users, color: "text-neutral-600", bg: "bg-neutral-50", border: "border-neutral-200" },
    ]

    const reports = [
        { name: "Laporan Bulanan Layanan Kemahasiswaan", lastRun: "Hari ini, 10:00", size: "1.2 MB", type: "PDF/XLS" },
        { name: "Data Prestasi Mahasiswa Nasional & Internasional", lastRun: "2 hari lalu", size: "4.5 MB", type: "XLS" },
        { name: "Rekapitulasi Konseling Global Hub", lastRun: "1 minggu lalu", size: "850 KB", type: "PDF" },
    ]

    return (
        <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
            
            <div className="max-w-[1600px] mx-auto space-y-10">
                
                {/* ── Page Header ─────────────────────────────────────────── */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-primary rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Institutional Intelligence</span>
                            </div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                                Reports <span className="text-primary">& Analytics</span>
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                                Pusat generasi laporan institusi, export data akreditasi BAN-PT, dan pemantauan statistik performa akademik global.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline"
                                className="h-11 px-6 rounded-xl border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm gap-2 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >show_chart</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Real-time Metrics</span>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── Stats Grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden group hover:border-primary/20 transition-all">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={cn("p-2.5 rounded-xl border transition-transform group-hover:scale-110", stat.bg, stat.border)}>
                                        <stat.icon className={cn("size-5", stat.color)} />
                                    </div>
                                    <Badge className="px-2 py-0.5 rounded-md bg-neutral-50 text-neutral-400 text-[8px] font-bold uppercase tracking-widest border-neutral-100">
                                        {stat.label}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className={cn("text-2xl font-bold font-jakarta tracking-tight", stat.color)}>{stat.value}</h3>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{stat.trend}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Report Templates ────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-neutral-100 bg-neutral-50/30 flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Layers size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-neutral-900 font-jakarta uppercase tracking-tight">Export Templates (BAN-PT / LAM)</h3>
                            </div>
                            
                            <CardContent className="p-6 space-y-4">
                                {reports.map((report, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 rounded-xl border border-neutral-100 group hover:bg-neutral-50 hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="size-12 bg-white rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover:text-primary group-hover:border-primary/20 transition-all shadow-sm">
                                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >description</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-neutral-900 tracking-tight text-[13px] uppercase font-jakarta">{report.name}</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 text-neutral-400">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '10px' }} >schedule</span>
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">{report.lastRun}</span>
                                                    </div>
                                                    <div className="size-1 rounded-full bg-neutral-200" />
                                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{report.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button className="h-9 px-4 rounded-lg bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-primary transition-all active:scale-95 shadow-sm">
                                                <Download size={14} /> {report.type.split('/')[0]}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* ── Intelligence Banner ────────────────────────────── */}
                        <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-5 shadow-sm relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-16 pointer-events-none" />
                           <div className="size-12 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors">
                              <PieChart size={24} />
                           </div>
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Data Analytics Status</p>
                              <p className="text-sm font-bold text-neutral-900 font-jakarta">Dataset sinkronisasi 100% lengkap untuk periode akreditasi 2024.</p>
                           </div>
                        </div>
                    </div>

                    {/* ── Custom Report Side Panel ───────────────────────── */}
                    <aside className="space-y-6">
                        <Card className="bg-neutral-900 text-white border-neutral-800 shadow-2xl rounded-xl overflow-hidden relative group h-full flex flex-col">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><BarChart3 size={150} /></div>
                            
                            <div className="p-8 space-y-6 relative z-10 flex-1">
                                <div className="space-y-2">
                                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-primary mb-2">
                                        <Database size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white font-jakarta tracking-tight uppercase">Custom Aggregate</h3>
                                    <p className="text-xs text-neutral-400 font-medium leading-relaxed font-inter">
                                        Bangun dataset kustom dengan menggabungkan parameter akademik lintas fakultas secara real-time.
                                    </p>
                                </div>

                                <div className="space-y-5 pt-4">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest ml-1">Target Analysis Unit</Label>
                                        <select className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                                            <option className="bg-neutral-900">SELURUH UNIVERSITAS</option>
                                            <option className="bg-neutral-900">FAKULTAS FARMASI</option>
                                            <option className="bg-neutral-900">FAKULTAS TEKNOLOGI</option>
                                            <option className="bg-neutral-900">FAKULTAS KESEHATAN</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest ml-1">Reporting Window</Label>
                                        <div className="relative">
                                            <Input 
                                                placeholder="PILIH RENTANG WAKTU" 
                                                className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest placeholder:text-neutral-600 focus:ring-primary/20"
                                            />
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" style={{ fontSize: '14px' }} >calendar_month</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-0 space-y-3 relative z-10">
                                <Button className="w-full h-14 bg-white text-neutral-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white shadow-xl transition-all active:scale-95 group/btn">
                                    Initiate Process <span className="material-symbols-outlined ml-2 group-hover/btn:animate-pulse" style={{ fontSize: '14px' }} >show_chart</span>
                                </Button>
                                <div className="flex items-center justify-center gap-2">
                                   <div className="size-1 rounded-full bg-primary animate-pulse" />
                                   <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Query engine standby</p>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default ReportsGenerator
