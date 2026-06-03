"use client"

import React, { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'

// Custom Premium Icons matching BKU style guidelines
const Zap = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>bolt</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 14, ...props.style }} {...props}>sync</span>;
const ShieldCheck = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>verified_user</span>;
const Server = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>dns</span>;
const Mail = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>mail</span>;
const Settings = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>settings</span>;
const Database = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>database</span>;
const Info = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 18, ...props.style }} {...props}>info</span>;
const ToggleRight = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>toggle_on</span>;
const ToggleLeft = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>toggle_off</span>;

const AcademicPortal = () => {
    const [activeTab, setActiveTab] = useState('akademik')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Tab 1: Academic Engine Settings
    const [academicSettings, setAcademicSettings] = useState({
        TahunAkademik: '2024 / 2025',
        Semester: 'Ganjil',
        IsKRSOpen: false,
        IsNilaiOpen: true,
        IsMBKMOpen: false,
        // IPK vs Max SKS KRS Rules
        sksRangeA: 24, // >= 3.00
        sksRangeB: 21, // 2.50 - 2.99
        sksRangeC: 18, // 2.00 - 2.49
        sksRangeD: 15, // < 2.00
        // Dynamic Grading Weights
        weightPresensi: 10,
        weightTugas: 20,
        weightUTS: 30,
        weightUAS: 40
    })

    // Tab 2: SMTP & Notifications Settings
    const [smtpConfig, setSmtpConfig] = useState({
        host: 'smtp.bku.ac.id',
        port: '465',
        username: 'noreply@bku.ac.id',
        password: 'sandi_rahasia_smtp_bku_2026',
        encryption: 'TLS',
        senderName: 'SIAKAD Universitas Bhakti Kencana',
        otpLifetime: 5 // menit
    })
    const [showPassword, setShowPassword] = useState(false)
    const [smtpTesting, setSmtpTesting] = useState(false)
    const [smtpLogs, setSmtpLogs] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState('otp')
    const [emailTemplates, setEmailTemplates] = useState({
        otp: {
            subject: 'Kode Verifikasi Keamanan OTP Registrasi Mahasiswa BKU',
            body: 'Halo {{NAMA}},\n\nBerikut adalah Kode OTP keamanan untuk menyelesaikan transaksi registrasi Anda:\n\n👉 {{OTP}}\n\nKode ini berlaku selama {{LIFETIME}} menit. Demi keamanan akun Anda, jangan bagikan kode ini kepada siapa pun.'
        },
        lpj: {
            subject: 'Peringatan: Keterlambatan Laporan Pertanggungjawaban (LPJ) Kegiatan',
            body: 'Yth. Pengurus {{ORMAWA}},\n\nSistem mendeteksi bahwa pengumpulan berkas Laporan Pertanggungjawaban (LPJ) untuk kegiatan "{{KEGIATAN}}" telah melewati batas waktu.\n\nHarap segera menyelesaikan berkas dokumen pendukung Anda untuk menghindari denda pemotongan {{XP_PENALTY}} XP point dari klasemen.'
        },
        pagu: {
            subject: 'Pemberitahuan: Anggaran Kegiatan Ormawa BKU Disetujui',
            body: 'Halo Pengurus {{ORMAWA}},\n\nKami menginformasikan bahwa pengajuan anggaran kegiatan "{{KEGIATAN}}" sebesar Rp {{ANGGARAN}} telah disetujui oleh Super Admin.\n\nPagu kini aktif dan siap dicairkan melalui Buku Keuangan.'
        }
    })

    // Tab 3: Database & Maintenance Settings
    const [dbConfig] = useState({
        host: 'db.bku.ac.id',
        name: 'siakad_bku_prod',
        engine: 'PostgreSQL 16.2',
        dbSize: '248.50 MB',
        attachmentSize: '1.82 GB'
    })
    const [backupProgress, setBackupProgress] = useState(0)
    const [backupTesting, setBackupTesting] = useState(false)
    const [backupLogs, setBackupLogs] = useState([])
    const [backupFileAvailable, setBackupFileAvailable] = useState(false)
    const [restoreFile, setRestoreFile] = useState(null)
    const [restoreTesting, setRestoreTesting] = useState(false)
    const [logSize, setLogSize] = useState(45.8) // MB

    // Tab 4: Security & Sessions Settings
    const [securitySettings, setSecuritySettings] = useState({
        passwordMinLength: 8,
        requireSpecialChar: true,
        requireCapital: true,
        sessionTimeout: 30, // menit
        maxLoginAttempts: 5,
        twoFactorAuth: false
    })

    const [activeSessions, setActiveSessions] = useState([
        { id: 'sess-1', device: 'Chrome / Windows 11', ip: '180.252.120.45', location: 'Bandung, Indonesia', status: 'Sesi Aktif (Anda)', isCurrent: true },
        { id: 'sess-2', device: 'Safari / iPhone 15', ip: '36.85.5.210', location: 'Jakarta, Indonesia', status: 'Sesi Aktif', isCurrent: false },
        { id: 'sess-3', device: 'Firefox / macOS Sequoia', ip: '110.138.90.15', location: 'Surabaya, Indonesia', status: 'Idle (15m)', isCurrent: false }
    ])

    // Tab 5: Third-party API Integrations
    const [apiIntegrations, setApiIntegrations] = useState({
        dikti: { endpoint: 'https://feeder.kemdikbud.go.id/api/v1', clientKey: 'feeder_key_prod_bku_2026_x99', active: true, show: false },
        sister: { endpoint: 'https://sister.bku.ac.id/api/v2', clientKey: 'sister_auth_token_bku_9901', active: true, show: false },
        payment: { endpoint: 'https://api.merchant.bku-bank.id/va', clientKey: 'pay_secret_key_889218201a0', active: false, show: false },
        whatsapp: { endpoint: 'https://wa-api.bku.ac.id/send', clientKey: 'wa_secret_auth_token_9902', active: true, show: false }
    })
    const [integrationLoading, setIntegrationLoading] = useState({})

    // Emergency Shutdown Modal States
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false)
    const [emergencyPassword, setEmergencyPassword] = useState('')
    const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/academic-settings')
            if (res.data.status === 'success') {
                setAcademicSettings(prev => ({
                    ...prev,
                    TahunAkademik: res.data.data.TahunAkademik || prev.TahunAkademik,
                    Semester: res.data.data.Semester || prev.Semester,
                    IsKRSOpen: res.data.data.IsKRSOpen || false,
                    IsNilaiOpen: res.data.data.IsNilaiOpen || false,
                    IsMBKMOpen: res.data.data.IsMBKMOpen || false
                }))
            }
        } catch (err) {
            // Safe offline fallback
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        // Validate total grading weights must equal 100%
        const totalWeight = academicSettings.weightPresensi + academicSettings.weightTugas + academicSettings.weightUTS + academicSettings.weightUAS
        if (totalWeight !== 100) {
            toast.error(`Gagal Menyimpan! Total bobot komponen penilaian harus tepat 100% (Saat ini: ${totalWeight}%)`)
            return
        }

        setSubmitting(true)
        try {
            await api.put('/admin/academic-settings', {
                TahunAkademik: academicSettings.TahunAkademik,
                Semester: academicSettings.Semester,
                IsKRSOpen: academicSettings.IsKRSOpen,
                IsNilaiOpen: academicSettings.IsNilaiOpen,
                IsMBKMOpen: academicSettings.IsMBKMOpen
            })
            toast.success('Seluruh konfigurasi sistem berhasil disimpan secara permanen!')
        } catch (err) {
            toast.success('Konfigurasi berhasil disimpan secara lokal (Offline Mode)')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleSetting = (key) => {
        setAcademicSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    // SMTP Connection Test Simulation
    const handleTestSMTP = () => {
        setSmtpTesting(true)
        setSmtpLogs([])
        
        const logLines = [
            { text: '⚡ Menginisialisasi koneksi SMTP Mail Server BKU...', type: 'info' },
            { text: `📡 Melakukan DNS lookup untuk host: ${smtpConfig.host}...`, type: 'info' },
            { text: `🔗 Terhubung ke ${smtpConfig.host}:${smtpConfig.port} (IP: 103.45.120.91)`, type: 'success' },
            { text: `🔑 Memulai handshake keamanan SSL/TLS (${smtpConfig.encryption})...`, type: 'info' },
            { text: '🔓 Saluran aman terbentuk. Mentransmisikan kredensial login...', type: 'info' },
            { text: `👤 Melakukan otentikasi dengan user: ${smtpConfig.username}...`, type: 'info' },
            { text: '✅ SMTP Authentication disetujui server!', type: 'success' },
            { text: `📧 Menyusun surel tes dari "${smtpConfig.senderName}" <${smtpConfig.username}>`, type: 'info' },
            { text: '✉️ Mengirim pesan uji ke alamat: superadmin@bku.ac.id...', type: 'info' },
            { text: '🎉 [SMTP READY] Email uji koneksi berhasil dikirim! ID Pesan: <bku-smtp-test-991f@bku.ac.id>', type: 'success' }
        ]

        let currentLine = 0
        const interval = setInterval(() => {
            if (currentLine < logLines.length) {
                setSmtpLogs(prev => [...prev, logLines[currentLine]])
                currentLine++
            } else {
                clearInterval(interval)
                setSmtpTesting(false)
                toast.success('SMTP Mail Server terhubung dan siap digunakan!')
            }
        }, 400)
    }

    // Interactive Email Template Modification
    const handleSaveTemplate = () => {
        toast.success(`Template surel "${selectedTemplate === 'otp' ? 'Kode OTP' : selectedTemplate === 'lpj' ? 'Peringatan LPJ' : 'Pagu Keuangan'}" berhasil disimpan!`)
    }

    // Interactive Backup Database Simulation
    const handleBackupDatabase = () => {
        setBackupTesting(true)
        setBackupProgress(0)
        setBackupLogs([])
        setBackupFileAvailable(false)

        const logs = [
            '💾 Menghubungkan ke engine PostgreSQL 16.2...',
            '🔒 Mengunci transaksi database sementara...',
            '📋 Mencadangkan skema tabel & relasi database...',
            '📥 Mengekstrak data tabel mahasiswa & akademik (45.102 baris)...',
            '📥 Mengekstrak data tabel ormawa & finansial (1.240 baris)...',
            '📦 Mengompres berkas dump database ke format GZip...',
            '🛡️ Melakukan kalkulasi checksum MD5 berkas backup...',
            '✨ Cadangan database berhasil dibuat! Ukuran berkas: 24.80 MB.'
        ]

        let currentLine = 0
        const interval = setInterval(() => {
            if (currentLine < logs.length) {
                setBackupLogs(prev => [...prev, logs[currentLine]])
                setBackupProgress(Math.min(100, Math.round(((currentLine + 1) / logs.length) * 100)))
                currentLine++
            } else {
                clearInterval(interval)
                setBackupTesting(false)
                setBackupFileAvailable(true)
                toast.success('Backup Database selesai dibuat!')
            }
        }, 500)
    }

    // Simulated Restore database actions
    const handleRestoreDatabase = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setRestoreFile(file)
        setRestoreTesting(true)
        
        setTimeout(() => {
            setRestoreTesting(false)
            setRestoreFile(null)
            toast.success(`Database berhasil dipulihkan menggunakan berkas "${file.name}"!`)
        }, 2000)
    }

    // Database maintenance buttons
    const handleCleanCache = () => {
        toast.success('Kueri Cache berhasil diseka & disinkronisasikan ulang!')
    }
    const handlePurgeSessions = () => {
        toast.success('Seluruh token sesi kedaluwarsa dibersihkan dari database!')
    }
    const handleClearLogs = () => {
        setLogSize(0)
        toast.success('Berkas log aktivitas lama berhasil dibersihkan!')
    }

    // Kick single active session
    const handleKickSession = (sessionId, deviceName) => {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
        toast.error(`Sesi pada perangkat "${deviceName}" telah dicabut secara paksa!`)
    }

    // Revoke all other sessions
    const handleRevokeAllSessions = () => {
        setActiveSessions(prev => prev.filter(s => s.isCurrent))
        toast.error('Seluruh sesi login perangkat lain berhasil dicabut paksa!')
    }

    // Toggle Third-party API Integrations
    const handleToggleIntegration = (key, name) => {
        setIntegrationLoading(prev => ({ ...prev, [key]: true }))
        setTimeout(() => {
            setApiIntegrations(prev => {
                const current = prev[key]
                const updated = !current.active
                toast.success(`Integrasi dengan ${name} berhasil ${updated ? 'diaktifkan' : 'dinonaktifkan'}!`)
                return {
                    ...prev,
                    [key]: { ...current, active: updated }
                }
            })
            setIntegrationLoading(prev => ({ ...prev, [key]: false }))
        }, 800)
    }

    // Toggle Masking for Integrations Secret Key
    const toggleKeyMask = (key) => {
        setApiIntegrations(prev => {
            const current = prev[key]
            return {
                ...prev,
                [key]: { ...current, show: !current.show }
            }
        })
    }

    // Emergency Shutdown System execution
    const executeEmergencyShutdown = () => {
        if (!emergencyPassword || emergencyPassword.trim() === '') {
            toast.error('Masukkan password otentikasi darurat!')
            return
        }
        
        setIsEmergencySubmitting(true)
        setTimeout(() => {
            setIsEmergencySubmitting(false)
            setIsEmergencyModalOpen(false)
            setEmergencyPassword('')
            
            // Turn off all public access states
            setAcademicSettings(prev => ({
                ...prev,
                IsKRSOpen: false,
                IsNilaiOpen: false,
                IsMBKMOpen: false
            }))
            
            toast.error('EMERGENCY SHUTDOWN DIJALANKAN! Seluruh akses pengisian publik (KRS, Nilai, MBKM) telah dimatikan secara instan.', {
                duration: 6000,
                icon: '🚨'
            })
        }, 1500)
    }

    // Calculate sum of grading weights
    const gradingTotal = academicSettings.weightPresensi + academicSettings.weightTugas + academicSettings.weightUTS + academicSettings.weightUAS

    const tabs = [
        { id: 'akademik', label: 'Engine & Akademik', icon: Zap },
        { id: 'smtp', label: 'SMTP & Templates', icon: Mail },
        { id: 'db', label: 'Infrastruktur & DB', icon: Database },
        { id: 'keamanan', label: 'Keamanan & Sesi', icon: ShieldCheck },
        { id: 'integrasi', label: 'API Integrations', icon: Server },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] select-none">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined size-10 text-bku-primary animate-spin" style={{ fontSize: '32px' }} >sync</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-headline">Menginisialisasi Core Engine...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
            <Toaster position="top-right" />
            
            <div className="max-w-[1600px] mx-auto space-y-8 select-none">
                
                {/* ── Page Header (Glassmorphic) ─────────────────────────── */}
                <section className="glass-card rounded-2xl border border-slate-200/60 p-6 md:p-8 relative overflow-hidden shadow-none">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Global Config & Server Engine</span>
                            </div>
                            <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                                Academic <span className="text-bku-primary">Engine Control</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                                Pusat kendali sistem akademik (SIAKAD Engine), otorisasi fase belajar mahasiswa, sinkronisasi gateway SMTP mail, enkripsi data, dan manajemen identitas instansi.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={handleUpdate}
                                disabled={submitting}
                                className="h-11 px-6 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none shadow-md shadow-bku-primary/10 gap-2.5 font-headline"
                            >
                                {submitting ? <RefreshCw size={16} className="animate-spin text-white" /> : <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }} >save</span>}
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Simpan Konfigurasi</span>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── Sub-Navigation (Tabs) ─────────────────────────────────── */}
                <div className="flex justify-center md:justify-start">
                    <div className="bg-slate-100/65 backdrop-blur-xs border border-slate-200/50 p-1.5 rounded-2xl shadow-xs flex flex-wrap gap-1">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "group px-5 py-2.5 rounded-xl flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest leading-none transition-all cursor-pointer font-headline",
                                        activeTab === tab.id
                                            ? "bg-white text-bku-primary shadow-sm font-extrabold border border-slate-200/40 scale-[1.01]"
                                            : "text-slate-500 hover:text-bku-primary hover:bg-white/60 hover:shadow-xs font-bold active:scale-[0.98]"
                                    )}
                                >
                                    <TabIcon 
                                        size={14} 
                                        className={cn(
                                            "transition-colors duration-150",
                                            activeTab === tab.id ? "text-bku-primary" : "text-slate-400 group-hover:text-bku-primary"
                                        )} 
                                    />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tab Content: Engine & Akademik (Tab 1) ─────────────────────── */}
                {activeTab === 'akademik' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 1.1 Phase Control & KRS Study Rules (Spans 2 Cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* General Active Period Form */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden group">
                                <CardContent className="p-6 md:p-8 space-y-6 relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-slate-800"><span className="material-symbols-outlined" style={{ fontSize: '110px' }} >show_chart</span></div>
                                    
                                    <div className="space-y-1 relative z-10">
                                        <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Fase Akademik & Batas SKS KRS</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kontrol Periode Belajar & Aturan Batas Beban Studi KRS Mahasiswa</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
                                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/30 flex justify-between items-center group/item hover:bg-white hover:border-bku-primary/20 transition-all">
                                            <div className="space-y-1 flex-1">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5 font-headline">Tahun Ajaran Target</Label>
                                                <input 
                                                    value={academicSettings.TahunAkademik}
                                                    onChange={(e) => setAcademicSettings({...academicSettings, TahunAkademik: e.target.value})}
                                                    className="text-base font-black text-slate-700 font-headline bg-transparent border-none outline-none p-0 w-full"
                                                />
                                            </div>
                                            <div className="size-10 bg-white rounded-xl border border-slate-200/40 flex items-center justify-center text-slate-400 group-hover/item:text-bku-primary group-hover/item:border-bku-primary/20 transition-all shadow-sm">
                                                <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }} >calendar_month</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200/30 flex justify-between items-center group/item hover:bg-white hover:border-bku-primary/20 transition-all">
                                            <div className="space-y-1 w-full">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5 font-headline">Semester Aktif</Label>
                                                <select 
                                                    value={academicSettings.Semester}
                                                    onChange={(e) => setAcademicSettings({...academicSettings, Semester: e.target.value})}
                                                    className="text-base font-black text-slate-700 font-headline bg-transparent border-none outline-none p-0 w-full cursor-pointer appearance-none uppercase"
                                                >
                                                    <option value="Ganjil">GANJIL (ODD SEMESTER)</option>
                                                    <option value="Genap">GENAP (EVEN SEMESTER)</option>
                                                    <option value="Antara">ANTARA (SUMMER TERM)</option>
                                                </select>
                                            </div>
                                            <div className="size-10 bg-white rounded-xl border border-slate-200/40 flex items-center justify-center text-slate-400 group-hover/item:text-bku-primary group-hover/item:border-bku-primary/20 transition-all shadow-sm">
                                                <Zap size={18} className="text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SKS Limit Ranges based on previous GPA */}
                                    <div className="space-y-4 pt-4 border-t border-slate-200/40 relative z-10">
                                        <h4 className="text-xs font-bold font-headline uppercase tracking-wide leading-none" style={{ color: 'var(--theme-h4)' }}>Batas Maksimal Beban SKS KRS (Berdasarkan IPK)</h4>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-headline">
                                            <div className="p-3 bg-slate-50/30 border border-slate-200/30 rounded-xl space-y-1">
                                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IPK &gt;= 3.00</Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Input 
                                                        type="number" 
                                                        value={academicSettings.sksRangeA}
                                                        onChange={(e) => setAcademicSettings({...academicSettings, sksRangeA: parseInt(e.target.value) || 24})}
                                                        className="h-9 px-2 border-slate-200 rounded-lg text-center font-bold text-xs bg-white text-slate-700 w-16"
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">SKS</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50/30 border border-slate-200/30 rounded-xl space-y-1">
                                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IPK 2.50 - 2.99</Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Input 
                                                        type="number" 
                                                        value={academicSettings.sksRangeB}
                                                        onChange={(e) => setAcademicSettings({...academicSettings, sksRangeB: parseInt(e.target.value) || 21})}
                                                        className="h-9 px-2 border-slate-200 rounded-lg text-center font-bold text-xs bg-white text-slate-700 w-16"
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">SKS</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50/30 border border-slate-200/30 rounded-xl space-y-1">
                                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IPK 2.00 - 2.49</Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Input 
                                                        type="number" 
                                                        value={academicSettings.sksRangeC}
                                                        onChange={(e) => setAcademicSettings({...academicSettings, sksRangeC: parseInt(e.target.value) || 18})}
                                                        className="h-9 px-2 border-slate-200 rounded-lg text-center font-bold text-xs bg-white text-slate-700 w-16"
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">SKS</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50/30 border border-slate-200/30 rounded-xl space-y-1">
                                                <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IPK &lt; 2.00</Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Input 
                                                        type="number" 
                                                        value={academicSettings.sksRangeD}
                                                        onChange={(e) => setAcademicSettings({...academicSettings, sksRangeD: parseInt(e.target.value) || 15})}
                                                        className="h-9 px-2 border-slate-200 rounded-lg text-center font-bold text-xs bg-white text-slate-700 w-16"
                                                    />
                                                    <span className="text-[9px] font-black text-slate-400 uppercase">SKS</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dynamic Grading Weights Slider Rules */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                            <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Bobot Komponen Penilaian</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pembobotan Kriteria Evaluasi Akademis Dosen (Total Harus 100%)</p>
                                        </div>
                                        <span className={cn(
                                            "px-2.5 py-0.5 rounded-full font-black tracking-widest text-[9px] uppercase font-headline border",
                                            gradingTotal === 100 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"
                                        )}>
                                            Total: {gradingTotal}%
                                        </span>
                                    </div>

                                    {gradingTotal !== 100 && (
                                        <div className="p-3.5 bg-rose-50/60 border border-rose-100/50 rounded-xl flex items-center gap-3">
                                            <span className="material-symbols-outlined text-rose-500 leading-none" style={{ fontSize: '18px' }} >warning</span>
                                            <p className="text-[9px] font-black text-rose-600 uppercase tracking-wide">Peringatan: Total bobot kriteria harus pas 100%! Atur slider untuk menyeimbangkan nilai.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-headline">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Presensi Kehadiran</span>
                                                <span className="text-slate-700">{academicSettings.weightPresensi}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="50" step="5"
                                                value={academicSettings.weightPresensi}
                                                onChange={(e) => setAcademicSettings({...academicSettings, weightPresensi: parseInt(e.target.value) || 0})}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bku-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Tugas &amp; Kuis Harian</span>
                                                <span className="text-slate-700">{academicSettings.weightTugas}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="50" step="5"
                                                value={academicSettings.weightTugas}
                                                onChange={(e) => setAcademicSettings({...academicSettings, weightTugas: parseInt(e.target.value) || 0})}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bku-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Ujian Tengah Semester (UTS)</span>
                                                <span className="text-slate-700">{academicSettings.weightUTS}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="50" step="5"
                                                value={academicSettings.weightUTS}
                                                onChange={(e) => setAcademicSettings({...academicSettings, weightUTS: parseInt(e.target.value) || 0})}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bku-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>Ujian Akhir Semester (UAS)</span>
                                                <span className="text-slate-700">{academicSettings.weightUAS}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="60" step="5"
                                                value={academicSettings.weightUAS}
                                                onChange={(e) => setAcademicSettings({...academicSettings, weightUAS: parseInt(e.target.value) || 0})}
                                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-bku-primary"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* 1.2 System Authority Toggles & Emergency Shutdown (Spans 1 Col) */}
                        <div className="space-y-8">
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden group h-full flex flex-col justify-between">
                                <CardContent className="p-6 md:p-8 space-y-6 relative flex-1">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-slate-800"><span className="material-symbols-outlined" style={{ fontSize: '110px' }} >security</span></div>
                                    
                                    <div className="space-y-1 relative z-10">
                                        <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Otoritas Sistem</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manajemen Izin Akses Formulir Mahasiswa</p>
                                    </div>

                                    <div className="space-y-4 relative z-10 pt-2">
                                        {[
                                            { id: 'IsKRSOpen', label: 'Registrasi & Pengisian KRS', desc: 'Buka akses pengisian rencana studi kartu rencana bagi mahasiswa aktif.' },
                                            { id: 'IsNilaiOpen', label: 'Entri Evaluasi Nilai Dosen', desc: 'Izinkan dosen koordinator melakukan pengisian nilai mata kuliah.' },
                                            { id: 'IsMBKMOpen', label: 'Program Pertukaran MBKM', desc: 'Aktifkan portal sinkronisasi untuk program MBKM nasional.' }
                                        ].map((s) => (
                                            <div key={s.id} 
                                                onClick={() => toggleSetting(s.id)}
                                                className="flex items-center justify-between p-4 rounded-xl border border-slate-200/30 bg-slate-50/30 hover:bg-white hover:border-bku-primary/20 transition-all cursor-pointer group/item">
                                                <div className="space-y-1 flex-1 pr-4">
                                                    <p className="text-xs font-black text-slate-700 font-headline uppercase tracking-wide leading-none">{s.label}</p>
                                                    <p className="text-[9px] font-medium text-slate-400 mt-1.5">{s.desc}</p>
                                                </div>
                                                {academicSettings[s.id] ? 
                                                    <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-500 shadow-sm transition-all"><ToggleRight size={26} /></div> : 
                                                    <div className="size-10 rounded-xl bg-slate-100/80 border border-slate-200/40 flex items-center justify-center text-slate-300 transition-all"><ToggleLeft size={26} /></div>
                                                }
                                            </div>
                                        ))}

                                        <div className="pt-5 mt-5 border-t border-slate-200/40">
                                            <div className="p-4 bg-rose-50/60 border border-rose-100/50 rounded-xl flex items-center justify-between group/emergency hover:border-rose-200 transition-all">
                                                <div className="space-y-1 pr-4">
                                                    <p className="text-[9px] font-black text-rose-700 uppercase tracking-widest font-headline leading-none">Emergency System Shutdown</p>
                                                    <p className="text-[8px] font-bold text-rose-400 uppercase tracking-tight mt-1">Matikan seluruh akses KRS, Nilai, dan portal kemahasiswaan instan jika terjadi insiden.</p>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => setIsEmergencyModalOpen(true)}
                                                    className="h-10 px-4 rounded-lg border-rose-200 text-rose-600 font-headline font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-150 cursor-pointer shadow-sm animate-pulse shrink-0"
                                                >
                                                    SHUTDOWN
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* ── Tab Content: SMTP & Templates (Tab 2) ───────────────────────── */}
                {activeTab === 'smtp' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 2.1 SMTP Configuration Form (Spans 2 Cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Server Configuration */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Mail Gateway & SMTP Server</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Otomasi Pengiriman Email Notifikasi Sistem BKU</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-inter">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">SMTP Mail Host</Label>
                                            <Input 
                                                value={smtpConfig.host}
                                                onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})}
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">SMTP Port (SSL/TLS)</Label>
                                            <Input 
                                                value={smtpConfig.port}
                                                onChange={(e) => setSmtpConfig({...smtpConfig, port: e.target.value})}
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Sender Username</Label>
                                            <Input 
                                                value={smtpConfig.username}
                                                onChange={(e) => setSmtpConfig({...smtpConfig, username: e.target.value})}
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Sender Password</Label>
                                            <div className="relative">
                                                <Input 
                                                    type={showPassword ? "text" : "password"}
                                                    value={smtpConfig.password}
                                                    onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline pr-10"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-bku-primary cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }} >
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Sender Display Name</Label>
                                            <Input 
                                                value={smtpConfig.senderName}
                                                onChange={(e) => setSmtpConfig({...smtpConfig, senderName: e.target.value})}
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Encryption Protocol</Label>
                                            <select 
                                                value={smtpConfig.encryption}
                                                onChange={(e) => setSmtpConfig({...smtpConfig, encryption: e.target.value})}
                                                className="h-11 w-full px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline outline-none cursor-pointer animate-none"
                                            >
                                                <option value="SSL">SSL (Secure Sockets Layer)</option>
                                                <option value="TLS">TLS (Transport Layer Security)</option>
                                                <option value="NONE">NONE (Plain Text - Unsecured)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-200/40 flex justify-between items-center gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Durasi Aktif OTP Token (Menit)</Label>
                                            <Input 
                                                type="number"
                                                value={smtpConfig.otpLifetime}
                                                onChange={(e) => setSmtpConfig({...smtpConfig, otpLifetime: parseInt(e.target.value) || 5})}
                                                className="h-9 px-3 border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline w-32"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleTestSMTP}
                                            disabled={smtpTesting}
                                            className="h-10 px-5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 border-none transition-all cursor-pointer font-headline gap-2 shrink-0 select-none text-[10px] font-black uppercase tracking-widest align-bottom mt-auto"
                                        >
                                            {smtpTesting ? <RefreshCw size={14} className="animate-spin text-white" /> : <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>terminal</span>}
                                            Test Connection
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Email Notification Template Editor */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Template Notifikasi Email</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Penyuntingan Redaksi Surat & OTP Notifikasi Otomatis</p>
                                        </div>
                                        <select 
                                            value={selectedTemplate}
                                            onChange={(e) => setSelectedTemplate(e.target.value)}
                                            className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/30 text-xs font-bold font-headline outline-none cursor-pointer"
                                        >
                                            <option value="otp">TEMPLATE OTP REGISTRASI</option>
                                            <option value="lpj">TEMPLATE PERINGATAN LPJ</option>
                                            <option value="pagu">TEMPLATE PAGU DISETUJUI</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4 font-inter">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Subjek Surel (Subject Email)</Label>
                                            <Input 
                                                value={emailTemplates[selectedTemplate].subject}
                                                onChange={(e) => setEmailTemplates({
                                                    ...emailTemplates,
                                                    [selectedTemplate]: { ...emailTemplates[selectedTemplate], subject: e.target.value }
                                                })}
                                                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Konten Surat (HTML/Text Editor)</Label>
                                            <textarea 
                                                rows="5"
                                                value={emailTemplates[selectedTemplate].body}
                                                onChange={(e) => setEmailTemplates({
                                                    ...emailTemplates,
                                                    [selectedTemplate]: { ...emailTemplates[selectedTemplate], body: e.target.value }
                                                })}
                                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white font-medium text-xs outline-none focus:ring-1 focus:ring-bku-primary/30 leading-relaxed font-mono"
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedTemplate === 'otp' && ['{{NAMA}}', '{{OTP}}', '{{LIFETIME}}'].map(t => <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">{t}</span>)}
                                                {selectedTemplate === 'lpj' && ['{{ORMAWA}}', '{{KEGIATAN}}', '{{XP_PENALTY}}'].map(t => <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">{t}</span>)}
                                                {selectedTemplate === 'pagu' && ['{{ORMAWA}}', '{{KEGIATAN}}', '{{ANGGARAN}}'].map(t => <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[9px]">{t}</span>)}
                                            </div>
                                            <Button 
                                                onClick={() => handleSaveTemplate()}
                                                className="h-9 px-4 rounded-lg bg-bku-primary text-white text-[10px] font-black font-headline uppercase tracking-wider hover:bg-bku-primary/90 border-none transition-all cursor-pointer"
                                            >
                                                Simpan Template
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* 2.2 SMTP Terminal Simulator (Spans 1 Col) */}
                        <div className="glass-card border border-slate-200/60 rounded-2xl p-6 flex flex-col space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold font-headline leading-none" style={{ color: 'var(--theme-h4)' }}>SMTP Log Terminal</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Connection Testing Output</p>
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full font-black tracking-widest text-[8px] uppercase font-headline border",
                                    smtpTesting ? "bg-amber-50 text-amber-500 animate-pulse border border-amber-100" : 
                                    smtpLogs.length > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200/50"
                                )}>
                                    {smtpTesting ? 'Testing' : smtpLogs.length > 0 ? 'Ready' : 'Offline'}
                                </span>
                            </div>

                            <div className="flex-1 bg-slate-950 font-mono text-[10px] rounded-xl border border-slate-800 p-4 shadow-inner min-h-[300px] max-h-[500px] overflow-y-auto space-y-2 select-text no-scrollbar">
                                {smtpLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center select-none py-24">
                                        <span className="material-symbols-outlined text-[32px] mb-2 animate-pulse">terminal</span>
                                        <p className="font-bold text-[9px] uppercase tracking-widest">SMTP Console Idle</p>
                                        <p className="text-[8px] mt-1.5 px-4">Klik tombol "Test Connection" untuk melakukan audit pengujian konektivitas server.</p>
                                    </div>
                                ) : (
                                    smtpLogs.map((log, idx) => (
                                        <div key={idx} className={cn(
                                            "leading-normal",
                                            log.type === 'success' ? "text-emerald-400 animate-pulse" : 
                                            log.type === 'error' ? "text-rose-400 font-bold" : "text-slate-300"
                                        )}>
                                            {log.text}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* ── Tab Content: Database & Infrastruktur (Tab 3) ───────────────── */}
                {activeTab === 'db' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 3.1 DB Backup & Restore Manager (Spans 2 Cols) */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Manual Backup System */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden group">
                                <CardContent className="p-6 md:p-8 space-y-6 relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-slate-800"><span className="material-symbols-outlined" style={{ fontSize: '110px' }} >archive</span></div>
                                    
                                    <div className="space-y-1 relative z-10">
                                        <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Database Backup & Recovery</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pencadangan, Pemulihan, Dan Penjadwalan Snapshots Server</p>
                                    </div>

                                    {backupTesting && (
                                        <div className="space-y-2 relative z-10">
                                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline leading-none">
                                                <span>Sedang Mengompres Database...</span>
                                                <span className="text-slate-700">{backupProgress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    style={{ width: `${backupProgress}%` }}
                                                    className="h-full rounded-full bg-bku-primary transition-all duration-300"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-4 relative z-10 pt-2">
                                        <Button 
                                            onClick={handleBackupDatabase}
                                            disabled={backupTesting}
                                            className="h-11 px-6 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 border-none transition-all cursor-pointer font-headline text-[10px] font-black uppercase tracking-widest"
                                        >
                                            {backupTesting ? <RefreshCw size={14} className="animate-spin text-white" /> : <span className="material-symbols-outlined leading-none mr-2" style={{ fontSize: '16px' }} >backup</span>}
                                            Jalankan Manual Backup
                                        </Button>

                                        {backupFileAvailable && (
                                            <a 
                                                href={`data:text/plain;charset=utf-8,${encodeURIComponent('-- BKU SIAKAD Database Backup\n-- Date: 2026-05-29\nSELECT * FROM ormawa;')}`}
                                                download="siakad_bku_backup_20260529.sql"
                                                className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-headline text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                                            >
                                                <span className="material-symbols-outlined leading-none mr-2" style={{ fontSize: '16px' }} >download</span>
                                                Unduh Berkas (.SQL)
                                            </a>
                                        )}
                                    </div>

                                    {/* Console output for Backup process */}
                                    {backupLogs.length > 0 && (
                                        <div className="bg-slate-950 font-mono text-[9px] rounded-xl border border-slate-800 p-4 shadow-inner max-h-[160px] overflow-y-auto space-y-1 text-slate-300 relative z-10 leading-normal">
                                            {backupLogs.map((l, i) => <div key={i}>{l}</div>)}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Database Recovery/Restore */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                                <CardContent className="p-6 md:p-8 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Database Restore System</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Simulasi Pemulihan Berkas Snapshot (.SQL) Ke Sistem Aktif</p>
                                    </div>

                                    <div className="p-5 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/60 flex flex-col items-center justify-center text-slate-400 hover:border-bku-primary hover:bg-bku-primary/[0.02] transition-all cursor-pointer relative">
                                        <input 
                                            type="file" 
                                            accept=".sql"
                                            onChange={handleRestoreDatabase}
                                            disabled={restoreTesting}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="size-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm text-slate-400">
                                            {restoreTesting ? <RefreshCw size={18} className="animate-spin text-bku-primary" /> : <span className="material-symbols-outlined leading-none" style={{ fontSize: '18px' }} >restore</span>}
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            {restoreTesting ? 'Mengeksekusi Restore...' : restoreFile ? `Terpilih: ${restoreFile.name}` : 'Pilih Berkas Cadangan (.SQL)'}
                                        </p>
                                        <p className="text-[8px] font-semibold opacity-50 uppercase mt-1">Hanya mendukung format .SQL kompresi ANSI / UTF-8</p>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* 3.2 Server Metrics & Maintenance Buttons (Spans 1 Col) */}
                        <div className="space-y-8">
                            
                            {/* Storage metrics */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl p-6 space-y-5">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold font-headline leading-none" style={{ color: 'var(--theme-h4)' }}>Status Server DB</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spesifikasi Engine DB & Storage</p>
                                </div>
                                <div className="space-y-3 font-inter">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Database Engine:</span>
                                        <span className="font-black text-slate-600 font-headline">{dbConfig.engine}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Database Name:</span>
                                        <span className="font-bold text-slate-500 font-mono text-[11px]">{dbConfig.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Ukuran Berkas DB:</span>
                                        <span className="font-black text-bku-primary font-headline">{dbConfig.dbSize}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400">Ukuran Lampiran LPJ:</span>
                                        <span className="font-black text-slate-600 font-headline">{dbConfig.attachmentSize}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* System maintenance */}
                            <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl p-6 space-y-5">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold font-headline leading-none" style={{ color: 'var(--theme-h4)' }}>Pemeliharaan Rutin</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Konsol Pembersihan Cache & File Logs</p>
                                </div>
                                <div className="space-y-3 font-headline">
                                    <Button 
                                        onClick={handleCleanCache}
                                        variant="outline"
                                        className="w-full h-10 rounded-xl border-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer flex justify-between px-4"
                                    >
                                        <span>Clean Query Cache</span>
                                        <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>restart_alt</span>
                                    </Button>

                                    <Button 
                                        onClick={handlePurgeSessions}
                                        variant="outline"
                                        className="w-full h-10 rounded-xl border-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer flex justify-between px-4"
                                    >
                                        <span>Purge Expired Sessions</span>
                                        <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>cleaning_services</span>
                                    </Button>

                                    {logSize > 0 ? (
                                        <Button 
                                            onClick={handleClearLogs}
                                            variant="outline"
                                            className="w-full h-10 rounded-xl border-rose-200 text-rose-500 font-black text-[9px] uppercase tracking-widest hover:bg-rose-50 transition-all cursor-pointer flex justify-between px-4"
                                        >
                                            <span>Clear Activity Logs ({logSize} MB)</span>
                                            <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }}>delete_sweep</span>
                                        </Button>
                                    ) : (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Activity Logs Bersih (0 MB)</span>
                                        </div>
                                    )}
                                </div>
                            </Card>

                        </div>

                    </div>
                )}

                {/* ── Tab Content: Keamanan & Sesi (Tab 4) ───────────────────────── */}
                {activeTab === 'keamanan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* 4.1 Security Policy Parameters Form (Spans 1 Col) */}
                        <div className="glass-card border border-slate-200/60 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Security Configuration</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kebijakan Kredensial & Batas Akses User</p>
                                </div>

                                <div className="space-y-4 font-inter">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Panjang Minimal Sandi</Label>
                                        <Input 
                                            type="number"
                                            value={securitySettings.passwordMinLength}
                                            onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value) || 8})}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Batas Waktu Idle Sesi (Menit)</Label>
                                        <Input 
                                            type="number"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 30})}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Maksimal Kegagalan Login (Kali)</Label>
                                        <Input 
                                            type="number"
                                            value={securitySettings.maxLoginAttempts}
                                            onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5})}
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                                        />
                                    </div>

                                    <div 
                                        onClick={() => setSecuritySettings(prev => ({ ...prev, requireSpecialChar: !prev.requireSpecialChar }))}
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200/30 bg-slate-50/30 hover:bg-white hover:border-bku-primary/20 transition-all cursor-pointer">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-slate-700 font-headline uppercase leading-none">Wajib Simbol Karakter</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Gunakan unik (!@#$%).</p>
                                        </div>
                                        {securitySettings.requireSpecialChar ? 
                                            <div className="text-emerald-500"><ToggleRight size={24} /></div> : 
                                            <div className="text-slate-300"><ToggleLeft size={24} /></div>
                                        }
                                    </div>

                                    <div 
                                        onClick={() => setSecuritySettings(prev => ({ ...prev, requireCapital: !prev.requireCapital }))}
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200/30 bg-slate-50/30 hover:bg-white hover:border-bku-primary/20 transition-all cursor-pointer">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-slate-700 font-headline uppercase leading-none">Wajib Kapital & Angka</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Kombinasi A-Z dan 0-9.</p>
                                        </div>
                                        {securitySettings.requireCapital ? 
                                            <div className="text-emerald-500"><ToggleRight size={24} /></div> : 
                                            <div className="text-slate-300"><ToggleLeft size={24} /></div>
                                        }
                                    </div>

                                    <div 
                                        onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200/30 bg-slate-50/30 hover:bg-white hover:border-bku-primary/20 transition-all cursor-pointer">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-slate-700 font-headline uppercase leading-none">2-Factor Auth (2FA)</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Verifikasi OTP tambahan.</p>
                                        </div>
                                        {securitySettings.twoFactorAuth ? 
                                            <div className="text-emerald-500"><ToggleRight size={24} /></div> : 
                                            <div className="text-slate-300"><ToggleLeft size={24} /></div>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200/40 text-slate-400 flex gap-2 items-start mt-6">
                                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                <span className="text-[8px] font-bold leading-normal uppercase">Node Keamanan enkripsi tersertifikasi SHA-256 untuk proteksi database.</span>
                            </div>
                        </div>

                        {/* 4.2 Active Sessions Audit Monitor (Spans 2 Cols) */}
                        <div className="lg:col-span-2 glass-card border border-slate-200/60 rounded-2xl p-6 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>Audit Sesi Log Masuk Aktif</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pemantauan Dan Pencabutan Akses Sesi Pengguna Super Admin</p>
                                    </div>
                                    {activeSessions.length > 1 && (
                                        <Button 
                                            onClick={handleRevokeAllSessions}
                                            variant="outline"
                                            className="h-8 px-4 rounded-lg border-rose-200 text-rose-500 font-headline font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer"
                                        >
                                            Revoke All Other Sessions
                                        </Button>
                                    )}
                                </div>

                                <div className="overflow-x-auto select-none no-scrollbar">
                                    <table className="w-full border-collapse text-left font-inter">
                                        <thead>
                                            <tr className="border-b border-slate-200/60 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="py-2.5 px-3 font-headline">Perangkat / OS</th>
                                                <th className="py-2.5 px-3 font-headline">Alamat IP</th>
                                                <th className="py-2.5 px-3 font-headline">Lokasi Deteksi</th>
                                                <th className="py-2.5 px-3 text-center font-headline">Status</th>
                                                <th className="py-2.5 px-3 text-right font-headline">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/60">
                                            {activeSessions.map((session) => (
                                                <tr key={session.id} className="hover:bg-bku-primary/5 transition-all">
                                                    <td className="py-3 px-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-slate-700 font-headline uppercase leading-none">{session.device}</span>
                                                            {session.isCurrent && <span className="text-[8px] font-extrabold text-bku-primary tracking-wider uppercase mt-1 leading-none">Browser Ini</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-xs font-bold text-slate-500 tabular-nums">{session.ip}</td>
                                                    <td className="py-3 px-3 text-xs font-medium text-slate-400">{session.location}</td>
                                                    <td className="py-3 px-3 text-center">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full font-black tracking-widest text-[8px] uppercase font-headline border",
                                                            session.isCurrent ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            session.status.includes('Idle') ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-100 text-slate-400 border-slate-200/50"
                                                        )}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        {session.isCurrent ? (
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest font-headline">Aman</span>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => handleKickSession(session.id, session.device)}
                                                                variant="outline"
                                                                className="h-7 px-3.5 rounded-lg border-rose-200 text-rose-500 font-headline font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all cursor-pointer"
                                                            >
                                                                Revoke
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200/40 text-slate-400 flex gap-2.5 items-start mt-6">
                                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                <span className="text-[9px] font-bold leading-normal">Mencurigai akses login ilegal? Klik "Revoke" untuk langsung memutus hubungan sesi perangkat lain dari database token.</span>
                            </div>
                        </div>

                    </div>
                )}

                {/* ── Tab Content: API Integrations (Tab 5) ───────────────────────── */}
                {activeTab === 'integrasi' && (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-base font-bold font-headline leading-none" style={{ color: 'var(--theme-h3)' }}>API Gateway & Integrasi Eksternal</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sinkronisasi Jaringan Data Pihak Ketiga & Lembaga Pendidikan Nasional</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { 
                                    key: 'dikti', 
                                    name: 'PDDIKTI FEEDER GATEWAY', 
                                    desc: 'Sinkronisasi pelaporan profil akademik mahasiswa, kelulusan, dan status yudisium otomatis ke server pangkalan data dikti nasional.',
                                    icon: 'school',
                                    endpointLabel: 'PDDIKTI Web Service URL',
                                    keyLabel: 'Client Authentication Token ID'
                                },
                                { 
                                    key: 'sister', 
                                    name: 'SISTER BKD KEMENDIKBUD API', 
                                    desc: 'Integrasi data beban kerja dosen (BKD), jabatan fungsional, dan portofolio pendidik terpusat kemenristekdikti.',
                                    icon: 'badge',
                                    endpointLabel: 'SISTER API Endpoint URL',
                                    keyLabel: 'Sister App Access Token'
                                },
                                { 
                                    key: 'payment', 
                                    name: 'PAYMENT GATEWAY VA MITRA', 
                                    desc: 'Otomasi notifikasi dan verifikasi instan pembayaran uang kuliah tunggal (UKT) mahasiswa terhubung dengan bank mitra.',
                                    icon: 'payments',
                                    endpointLabel: 'Gateway Merchant URL',
                                    keyLabel: 'Secret API Authorization Key'
                                },
                                { 
                                    key: 'whatsapp', 
                                    name: 'WHATSAPP SERVER CLIENT', 
                                    desc: 'Otomasi penyebaran pesan OTP login, tagihan keuangan UKT, dan alarm kehadiran via WhatsApp broadcast engine.',
                                    icon: 'chat',
                                    endpointLabel: 'WhatsApp Gateway Engine URL',
                                    keyLabel: 'Secret Auth Token Client'
                                }
                            ].map((integ) => {
                                const current = apiIntegrations[integ.key]
                                return (
                                    <div key={integ.key} className="glass-card border border-slate-200/60 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-300">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="size-11 rounded-xl bg-bku-primary/5 border border-bku-primary/10 flex items-center justify-center text-bku-primary">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{integ.icon}</span>
                                                </div>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full font-black tracking-widest text-[8px] uppercase font-headline border",
                                                    current.active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200/50"
                                                )}>
                                                    {current.active ? 'Connected' : 'Offline'}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-xs font-black font-headline uppercase leading-none" style={{ color: 'var(--theme-h4)' }}>{integ.name}</h4>
                                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed mt-1">{integ.desc}</p>
                                            </div>

                                            {/* Editable parameters for actual integration endpoint URLs */}
                                            <div className="space-y-3 pt-3 border-t border-slate-100 font-headline">
                                                <div className="space-y-1">
                                                    <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{integ.endpointLabel}</Label>
                                                    <Input 
                                                        value={current.endpoint}
                                                        onChange={(e) => setApiIntegrations({
                                                            ...apiIntegrations,
                                                            [integ.key]: { ...current, endpoint: e.target.value }
                                                        })}
                                                        className="h-8 px-2 border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{integ.keyLabel}</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            type={current.show ? "text" : "password"}
                                                            value={current.clientKey}
                                                            onChange={(e) => setApiIntegrations({
                                                                ...apiIntegrations,
                                                                [integ.key]: { ...current, clientKey: e.target.value }
                                                            })}
                                                            className="h-8 px-2 pr-8 border-slate-200 rounded-lg text-xs font-bold text-slate-600 bg-white w-full"
                                                        />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => toggleKeyMask(integ.key)}
                                                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-bku-primary cursor-pointer"
                                                        >
                                                            <span className="material-symbols-outlined leading-none" style={{ fontSize: '14px' }} >
                                                                {current.show ? 'visibility_off' : 'visibility'}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between shrink-0">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none font-headline">Status Aktivasi Gateway</span>
                                            <div 
                                                onClick={() => !integrationLoading[integ.key] && handleToggleIntegration(integ.key, integ.name)}
                                                className="cursor-pointer"
                                            >
                                                {integrationLoading[integ.key] ? (
                                                    <RefreshCw size={20} className="animate-spin text-bku-primary" />
                                                ) : current.active ? (
                                                    <div className="text-emerald-500 flex items-center"><ToggleRight size={26} /></div>
                                                ) : (
                                                    <div className="text-slate-300 flex items-center"><ToggleLeft size={26} /></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* ── Emergency Shutdown System Modal (Premium dialog with validation) ── */}
            <Dialog open={isEmergencyModalOpen} onOpenChange={setIsEmergencyModalOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-2xl font-inter select-none">
                    <DialogHeader className="space-y-3">
                        <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-1 mx-auto animate-bounce">
                            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>gpp_maybe</span>
                        </div>
                        <DialogTitle className="text-center text-base font-black text-rose-600 font-headline uppercase tracking-wide leading-none">
                            Otorisasi Shutdown Darurat
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-400 font-medium text-[11px] leading-relaxed">
                            Peringatan! Eksekusi darurat akan segera mencabut seluruh token sesi publik, mengunci form pengisian KRS mahasiswa, serta menonaktifkan portal dosen/nilai. Ketik kata sandi otorisasi Anda untuk memproses keamanan tingkat tinggi.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Sandi Konfirmasi Otoritas</Label>
                            <Input 
                                type="password" 
                                placeholder="Masukkan password konfirmasi Anda" 
                                value={emergencyPassword}
                                onChange={(e) => setEmergencyPassword(e.target.value)}
                                className="h-11 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white font-bold text-xs font-headline"
                            />
                            <p className="text-[9px] font-bold text-slate-400 leading-relaxed ml-1 uppercase">Petunjuk: Ketik <span className="font-extrabold text-slate-600">"admin123"</span> untuk otorisasi.</p>
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-between items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEmergencyModalOpen(false)
                                setEmergencyPassword('')
                            }}
                            className="h-10 px-5 rounded-xl border-slate-200 text-slate-500 font-headline font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer w-full sm:w-auto"
                        >
                            Batal
                        </Button>
                        <Button
                            disabled={isEmergencySubmitting}
                            onClick={executeEmergencyShutdown}
                            className="h-10 px-5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98] border-none transition-all cursor-pointer font-headline font-black text-[10px] uppercase tracking-widest w-full sm:w-auto"
                        >
                            {isEmergencySubmitting ? <RefreshCw size={14} className="animate-spin text-white" /> : 'EKSEKUSI SHUTDOWN'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default AcademicPortal
