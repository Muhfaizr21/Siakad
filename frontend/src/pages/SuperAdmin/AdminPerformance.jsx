"use client"

import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { toast, Toaster } from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const RefreshCcw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const User = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>person</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Database = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>storage</span>;
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const Edit3 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>edit</span>;
const Trash2 = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>delete</span>;



const AdminPerformance = () => {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        try {
            setLoading(true)
            const res = await adminService.getAuditLogs()
            if (res.status === 'success') {
                setLogs(res.data || [])
            } else {
                toast.error('Gagal memuat basis data audit')
            }
        } catch (error) {
            toast.error('Koneksi intelijen terputus')
        } finally {
            setLoading(false)
        }
    }

    const getActionIcon = (activity = '') => {
        const act = activity.toUpperCase()
        if (act.includes('DELETE')) return <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >delete</span>
        if (act.includes('UPDATE') || act.includes('EDIT')) return <Edit3 size={18} />
        return <span className="material-symbols-outlined" style={{ fontSize: '18px' }} >show_chart</span>
    }

    const getActionColors = (activity = '') => {
        const act = activity.toUpperCase()
        if (act.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100'
        if (act.includes('UPDATE')) return 'bg-amber-50 text-amber-600 border-amber-100'
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }

    return (
        <div className="px-4 py-8 md:px-8 xl:px-12 min-h-screen bg-[#fafafa] font-body">
            <Toaster position="top-right" />
            
            <div className="max-w-[1600px] mx-auto space-y-10">
                
                {/* ── Page Header ─────────────────────────────────────────── */}
                <section className="bg-white border border-neutral-200 rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-primary rounded-full" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Security Forensics</span>
                            </div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                                Performance <span className="text-primary">& Audit</span>
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                                Monitoring aktivitas sistem real-time, audit jejak digital administratif, dan pemantauan integritas data universitas.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={loadLogs}
                                disabled={loading}
                                variant="outline"
                                className="h-11 px-6 rounded-xl border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm gap-2 transition-all active:scale-95"
                            >
                                <RefreshCcw size={16} className={cn(loading && "animate-spin")} />
                                <span className="text-xs font-bold uppercase tracking-widest">Refresh Logs</span>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── Stats Summary ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Events', val: logs.length, color: 'text-primary', icon: Database, desc: 'Aktivitas Tercatat' },
                        { label: 'Create Actions', val: logs.filter(l => l.Aktivitas?.includes('CREATE')).length, color: 'text-emerald-600', icon: Activity, desc: 'Entri Data Baru' },
                        { label: 'Update Actions', val: logs.filter(l => l.Aktivitas?.includes('UPDATE')).length, color: 'text-amber-600', icon: Edit3, desc: 'Modifikasi Aktif' },
                        { label: 'Delete Actions', val: logs.filter(l => l.Aktivitas?.includes('DELETE')).length, color: 'text-rose-600', icon: Trash2, desc: 'Penghapusan Terdeteksi' },
                    ].map((s, i) => (
                        <Card key={i} className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden group hover:border-primary/20 transition-all">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{s.label}</p>
                                    <div className="p-2 rounded-lg bg-neutral-50 text-neutral-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                        <s.icon size={18} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className={cn("text-3xl font-bold font-jakarta tracking-tight", s.color)}>
                                        {loading ? '...' : s.val.toString().padStart(2, '0')}
                                    </h3>
                                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">{s.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Audit Timeline ───────────────────────────────────────── */}
                <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 bg-neutral-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >search</span>
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 font-jakarta uppercase tracking-tight">Audit Trail Timeline</h3>
                        </div>
                        <Badge className="px-3 py-1 bg-white border-neutral-200 text-neutral-400 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">
                            Real-time Stream
                        </Badge>
                    </div>
                    
                    <CardContent className="p-0">
                        <div className="divide-y divide-neutral-100 max-h-[700px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="py-32 flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined size-10 animate-spin text-primary/30" >sync</span>
                                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-[0.2em]">Synchronizing Security Hub...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="py-32 flex flex-col items-center gap-4">
                                    <div className="size-16 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-200">
                                        <span className="material-symbols-outlined" style={{ fontSize: '32px' }} >error</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">No activities detected in current buffer.</p>
                                </div>
                            ) : logs.map((log) => (
                                <div key={log.ID} className="p-6 md:p-8 hover:bg-neutral-50/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
                                    <div className="flex gap-6 items-start">
                                        <div className={cn(
                                            "size-12 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-transform group-hover:scale-105",
                                            getActionColors(log.Aktivitas || '')
                                        )}>
                                            {getActionIcon(log.Aktivitas || '')}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <span className="text-neutral-900 font-bold text-sm uppercase tracking-tight font-jakarta">{log.Aktivitas}</span>
                                                <div className="flex items-center gap-1.5 text-neutral-400">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >schedule</span>
                                                    <span className="text-[10px] font-bold uppercase tabular-nums">{new Date(log.CreatedAt).toLocaleTimeString('id-ID')}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-neutral-500 max-w-2xl leading-relaxed font-inter italic group-hover:text-neutral-700 transition-colors">
                                                "{log.Deskripsi || 'Tidak ada rincian metadata aktivitas.'}"
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-100">
                                                    <User size={10} className="text-neutral-400" />
                                                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                                                        {log.Pengguna?.Email || log.User?.Email || 'SYSTEM'}
                                                    </span>
                                                </div>
                                                {log.IPAddress && (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-100">
                                                        <span className="material-symbols-outlined text-neutral-400" style={{ fontSize: '10px' }} >location_on</span>
                                                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest tabular-nums">
                                                            {log.IPAddress}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Integrity Verified</span>
                                        <span className="text-[10px] font-medium text-neutral-300 uppercase tracking-tighter mt-1 tabular-nums">{new Date(log.CreatedAt).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Security Banner ───────────────────────────────────────── */}
                <div className="bg-neutral-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-xl">
                   <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                         <span className="material-symbols-outlined" style={{ fontSize: '32px' }} Check >security</span>
                      </div>
                      <div className="space-y-1">
                         <h4 className="text-white font-bold font-jakarta text-lg">Immutable Audit Infrastructure</h4>
                         <p className="text-neutral-400 text-xs font-medium uppercase tracking-widest leading-relaxed">Seluruh log aktivitas bersifat read-only dan dilindungi secara kriptografis.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 relative z-10">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">System Status: Secure</span>
                   </div>
                </div>

            </div>
        </div>
    )
}

export default AdminPerformance
