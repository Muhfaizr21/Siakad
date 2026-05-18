"use client"

import React, { useState, useEffect } from 'react'

import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Info = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>info</span>;
const ToggleRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>toggle_on</span>;
const ToggleLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>toggle_off</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>bolt</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Activity = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>show_chart</span>;
const LayoutGrid = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>grid_view</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>verified_user</span>;
const Server = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>dns</span>;



const AcademicPortal = () => {
    const [activeTab, setActiveTab] = useState('akademik')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [settings, setSettings] = useState({
        TahunAkademik: '2024 / 2025',
        Semester: 'Ganjil',
        IsKRSOpen: false,
        IsNilaiOpen: false,
        IsMBKMOpen: false
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/academic-settings')
            if (res.data.status === 'success') {
                setSettings(res.data.data)
            }
        } catch (err) {
            toast.error('Gagal memuat konfigurasi akademik')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        setSubmitting(true)
        try {
            const res = await api.put('/admin/academic-settings', settings)
            if (res.data.status === 'success') {
                toast.success('Konfigurasi Engine berhasil disimpan')
            }
        } catch (err) {
            toast.error('Gagal menyimpan konfigurasi')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const tabs = [
        { id: 'akademik', label: 'Engine Control', icon: Activity },
        { id: 'profil', label: 'Identity & Brand', icon: LayoutGrid },
        { id: 'keamanan', label: 'Security Node', icon: ShieldCheck },
        { id: 'integrasi', label: 'API Integrations', icon: Server },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined size-10 text-primary animate-spin" >sync</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Initializing Core Engine...</span>
                </div>
            </div>
        )
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
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Global Configuration</span>
                            </div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                                Academic <span className="text-primary">Engine</span>
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                                Pusat kendali sistem akademik (SIAKAD Engine), otorisasi fase belajar, dan manajemen identitas institusi tingkat universitas.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={handleUpdate}
                                disabled={submitting}
                                className="h-12 px-8 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-xl shadow-primary/10 gap-3 transition-all active:scale-95 border-none"
                            >
                                {submitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '16px' }} >save</span>}
                                <span className="text-xs font-bold uppercase tracking-widest">Commit Changes</span>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── Sub-Navigation ──────────────────────────────────────── */}
                <div className="flex justify-center md:justify-start">
                    <div className="bg-white border border-neutral-200 p-1.5 rounded-xl h-auto shadow-sm flex flex-wrap gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-6 py-2.5 rounded-lg flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                                    activeTab === tab.id
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                                )}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content: Akademik ─────────────────────────────── */}
                {activeTab === 'akademik' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden group">
                            <CardContent className="p-8 md:p-10 space-y-8 relative">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined" style={{ fontSize: '120px' }} >show_chart</span></div>
                                
                                <div className="space-y-1 relative z-10">
                                    <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Fase Akademik</h3>
                                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Kontrol Periode Belajar Aktif</p>
                                </div>

                                <div className="space-y-5 relative z-10">
                                    <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center group/item hover:bg-white hover:border-primary/20 transition-all">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">Tahun Ajaran Target</Label>
                                            <input 
                                                value={settings.TahunAkademik}
                                                onChange={(e) => setSettings({...settings, TahunAkademik: e.target.value})}
                                                className="text-xl font-bold text-neutral-900 font-jakarta bg-transparent border-none outline-none p-0 w-full"
                                            />
                                        </div>
                                        <div className="size-12 bg-white rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover/item:text-primary group-hover/item:border-primary/20 transition-all shadow-sm">
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }} >calendar_month</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center group/item hover:bg-white hover:border-primary/20 transition-all">
                                        <div className="space-y-1.5 w-full">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">Semester Aktif</Label>
                                            <select 
                                                value={settings.Semester}
                                                onChange={(e) => setSettings({...settings, Semester: e.target.value})}
                                                className="text-xl font-bold text-neutral-900 font-jakarta bg-transparent border-none outline-none p-0 w-full cursor-pointer appearance-none"
                                            >
                                                <option value="Ganjil">GANJIL (ODD)</option>
                                                <option value="Genap">GENAP (EVEN)</option>
                                                <option value="Antara">ANTARA (SUMMER)</option>
                                            </select>
                                        </div>
                                        <div className="size-12 bg-white rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-300 group-hover/item:text-primary group-hover/item:border-primary/20 transition-all shadow-sm">
                                            <Zap size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 relative z-10">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Info size={16} /></div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Governance Notice</p>
                                        <p className="text-[11px] font-medium text-blue-600/80 leading-relaxed">Pembaruan fase akan memicu sinkronisasi global pada data pengajaran, KRS, dan evaluasi hasil belajar secara otomatis.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden group">
                            <CardContent className="p-8 md:p-10 space-y-8 relative">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined" style={{ fontSize: '120px' }} Check >security</span></div>
                                
                                <div className="space-y-1 relative z-10">
                                    <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Otoritas Sistem</h3>
                                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Manajemen Izin Akses Publik</p>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {[
                                        { id: 'IsKRSOpen', label: 'Pendaftaran KRS', desc: 'Buka akses pengisian rencana studi bagi mahasiswa.' },
                                        { id: 'IsNilaiOpen', label: 'Input Evaluasi Dosen', desc: 'Izinkan dosen koordinator melakukan pengisian nilai.' },
                                        { id: 'IsMBKMOpen', label: 'Program MBKM', desc: 'Aktifkan sinkronisasi pendaftaran program MBKM.' }
                                    ].map((s) => (
                                        <div key={s.id} 
                                            onClick={() => toggleSetting(s.id)}
                                            className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 transition-all cursor-pointer group/item">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-neutral-900 font-jakarta uppercase tracking-tight">{s.label}</p>
                                                <p className="text-[11px] font-medium text-neutral-400">{s.desc}</p>
                                            </div>
                                            {settings[s.id] ? 
                                                <div className="size-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm"><ToggleRight size={28} /></div> : 
                                                <div className="size-11 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-300"><ToggleLeft size={28} /></div>
                                            }
                                        </div>
                                    ))}

                                    <div className="pt-6 mt-6 border-t border-neutral-100">
                                        <div className="p-5 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between group/emergency">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-rose-700 uppercase tracking-widest">Emergency Shutdown</p>
                                                <p className="text-[10px] font-medium text-rose-400 uppercase tracking-tight">Matikan seluruh akses SI-Engine secara instan.</p>
                                            </div>
                                            <Button variant="outline" className="h-10 px-6 rounded-lg border-rose-200 text-rose-600 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                                                EKSEKUSI
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ── Tab Content: Profil ────────────────────────────────── */}
                {activeTab === 'profil' && (
                    <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden group">
                        <CardContent className="p-10 md:p-12 space-y-12 relative">
                            <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform"><LayoutGrid size={200} /></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-10">
                                    <div className="space-y-1 border-l-2 border-primary pl-4">
                                        <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Identitas Institusi</h3>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Corporate Branding Data</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Universitas Handle</Label>
                                            <Input defaultValue="Universitas Bhakti Kencana" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Primary Color Identity</Label>
                                            <div className="flex gap-4">
                                                <div className="size-14 bg-primary rounded-xl border-4 border-white shadow-xl shadow-primary/20 shrink-0" />
                                                <Input defaultValue="#0056B3" className="flex-1 h-14 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10 border-l border-neutral-100 pl-0 md:pl-12">
                                    <div className="space-y-1 border-l-2 border-indigo-400 pl-4">
                                        <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight">Digital Assets</h3>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Logo & Iconography</p>
                                    </div>

                                    <div className="w-full h-64 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-neutral-400 hover:border-primary hover:bg-primary/[0.02] transition-all cursor-pointer group/upload shadow-inner">
                                        <div className="size-16 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center mb-4 shadow-sm group-hover/upload:text-primary group-hover/upload:border-primary/20 transition-all group-hover/upload:-translate-y-2">
                                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >upload</span>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 group-hover/upload:text-primary">Update Brandmark (.PNG)</p>
                                        <p className="text-[9px] font-medium opacity-50 uppercase mt-1">Max: 2MB | Recommended: 1024x1024 px</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Maintenance Tabs ───────────────────────────────────── */}
                {(activeTab === 'keamanan' || activeTab === 'integrasi') && (
                    <Card className="bg-white border-neutral-200 shadow-sm rounded-xl overflow-hidden">
                        <CardContent className="p-20 flex flex-col items-center justify-center text-center space-y-8">
                            <div className={cn(
                                "size-24 rounded-2xl flex items-center justify-center border shadow-inner transition-all duration-700",
                                activeTab === 'keamanan' ? "bg-rose-50 border-rose-100 text-rose-300" : "bg-indigo-50 border-indigo-100 text-indigo-300"
                            )}>
                                {activeTab === 'keamanan' ? <span className="material-symbols-outlined animate-pulse" style={{ fontSize: '40px' }} Check >security</span> : <RefreshCw size={40} className="animate-spin" />}
                            </div>
                            
                            <div className="space-y-3">
                                <h2 className="text-2xl font-bold text-neutral-900 font-jakarta tracking-tight">
                                    {activeTab === 'keamanan' ? 'Security Node Maintenance' : 'Integrations Hub Gateway'}
                                </h2>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-300 max-w-sm leading-relaxed mx-auto">
                                    {activeTab === 'keamanan' 
                                        ? 'Core encryption algorithms are currently being updated to Next-Gen protocols.' 
                                        : 'Upstream API endpoints are being synchronized for secure data transmission.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-48 bg-neutral-100 rounded-full overflow-hidden">
                                    <div className={cn(
                                        "h-full rounded-full animate-progress",
                                        activeTab === 'keamanan' ? "bg-rose-500" : "bg-indigo-500"
                                    )} style={{ width: '60%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-neutral-300">60%</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}

export default AcademicPortal
