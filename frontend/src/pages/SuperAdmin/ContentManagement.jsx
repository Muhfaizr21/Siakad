"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { adminService } from '../../services/api'
import { toast, Toaster } from 'react-hot-toast'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent } from './components/ui/card'
import { DataTable } from './components/ui/data-table'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Newspaper = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>newspaper</span>;



export default function ContentManagement() {
    const [news, setNews] = useState([])
    const [faculties, setFaculties] = useState([])
    const [ormawas, setOrmawas] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCrudOpen, setIsCrudOpen] = useState(false)
    const [isDelOpen, setIsDelOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState({ 
        Judul: '', 
        Isi: '', 
        Status: 'Published',
        target_audience: 'semua',
        target_fakultas_id: '',
        target_ormawa_id: '',
        target_mahasiswa_ids: '',
        target_ormawa_ids: ''
    })

    // Detailed Checklist states
    const [studentSearch, setStudentSearch] = useState('')
    const [ormawaSearch, setOrmawaSearch] = useState('')
    const [mahasiswaSubtype, setMahasiswaSubtype] = useState('global') // 'global', 'fakultas', 'spesifik'
    const [ormawaSubtype, setOrmawaSubtype] = useState('all') // 'all', 'spesifik'

    const filteredStudents = useMemo(() => {
        if (!studentSearch) return students
        const term = studentSearch.toLowerCase()
        return students.filter(s =>
            (s.Nama || s.nama || '').toLowerCase().includes(term) ||
            (s.NIM || s.nim || '').toLowerCase().includes(term)
        )
    }, [students, studentSearch])

    const filteredOrmawas = useMemo(() => {
        if (!ormawaSearch) return ormawas
        const term = ormawaSearch.toLowerCase()
        return ormawas.filter(o =>
            (o.Nama || o.nama || '').toLowerCase().includes(term)
        )
    }, [ormawas, ormawaSearch])

    const fetchNews = async () => {
        setLoading(true)
        try {
            const data = await adminService.getAllNews()
            if (data.status === 'success') setNews(data.data || [])
            else toast.error('Gagal memuat database berita')
        } catch {
            toast.error('Koneksi sistem terputus')
        } finally {
            setLoading(false)
        }
    }

    const fetchMasterData = async () => {
        try {
            const [facRes, ormawaRes, studentRes] = await Promise.all([
                adminService.getAllFaculties(),
                adminService.getAllOrmawa(),
                adminService.getAllStudents()
            ])
            if (facRes?.status === 'success') setFaculties(facRes.data || [])
            if (ormawaRes?.status === 'success') setOrmawas(ormawaRes.data || [])
            if (studentRes?.status === 'success') setStudents(studentRes.data || [])
        } catch (e) {
            console.error("Gagal memuat data master untuk target berita", e)
        }
    }

    useEffect(() => { 
        fetchNews()
        fetchMasterData()
    }, [])

    const handleOpenAdd = () => {
        setIsEditMode(false)
        setSelected(null)
        setForm({ 
            Judul: '', 
            Isi: '', 
            Status: 'Published',
            target_audience: 'semua',
            target_fakultas_id: '',
            target_ormawa_id: '',
            target_mahasiswa_ids: '',
            target_ormawa_ids: ''
        })
        setMahasiswaSubtype('global')
        setOrmawaSubtype('all')
        setStudentSearch('')
        setOrmawaSearch('')
        setIsCrudOpen(true)
    }

    const handleOpenEdit = (row) => {
        setIsEditMode(true)
        setSelected(row)
        const mhsIds = row.target_mahasiswa_ids || row.TargetMahasiswaIDs || ''
        const ormIds = row.target_ormawa_ids || row.TargetOrmawaIDs || ''
        setForm({ 
            Judul: row.Judul || '', 
            Isi: row.Isi || '', 
            Status: row.Status || 'Published',
            target_audience: row.target_audience || row.TargetAudience || 'semua',
            target_fakultas_id: row.target_fakultas_id || row.TargetFakultasID || '',
            target_ormawa_id: row.target_ormawa_id || row.TargetOrmawaID || '',
            target_mahasiswa_ids: mhsIds,
            target_ormawa_ids: ormIds
        })
        
        const mSub = mhsIds ? 'spesifik' : (row.target_fakultas_id || row.TargetFakultasID ? 'fakultas' : 'global')
        setMahasiswaSubtype(mSub)

        const oSub = ormIds ? 'spesifik' : 'all'
        setOrmawaSubtype(oSub)

        setStudentSearch('')
        setOrmawaSearch('')
        setIsCrudOpen(true)
    }

    const handleAudienceChange = (aud) => {
        setForm(prev => ({
            ...prev,
            target_audience: aud,
            target_fakultas_id: '',
            target_ormawa_id: '',
            target_mahasiswa_ids: '',
            target_ormawa_ids: ''
        }))
        setMahasiswaSubtype('global')
        setOrmawaSubtype('all')
    }

    const handleMahasiswaSubtypeChange = (subtype) => {
        setMahasiswaSubtype(subtype)
        setForm(prev => ({
            ...prev,
            target_fakultas_id: '',
            target_mahasiswa_ids: ''
        }))
    }

    const handleOrmawaSubtypeChange = (subtype) => {
        setOrmawaSubtype(subtype)
        setForm(prev => ({
            ...prev,
            target_ormawa_id: '',
            target_ormawa_ids: ''
        }))
    }

    const handleSave = async (e) => {
        if (e) e.preventDefault()
        setIsSubmitting(true)
        try {
            const targetId = selected?.id || selected?.ID
            const payload = {
                ...form,
                target_fakultas_id: form.target_fakultas_id ? Number(form.target_fakultas_id) : null,
                target_ormawa_id: form.target_ormawa_id ? Number(form.target_ormawa_id) : null,
                target_mahasiswa_ids: form.target_mahasiswa_ids || "",
                target_ormawa_ids: form.target_ormawa_ids || ""
            }
            const res = isEditMode
                ? await adminService.updateNews(targetId, payload)
                : await adminService.createNews(payload)
            if (res.status === 'success') {
                toast.success(isEditMode ? 'Konten diperbarui' : 'Berita berhasil diterbitkan')
                setIsCrudOpen(false)
                fetchNews()
            } else {
                toast.error(res.message || 'Gagal menyimpan konten')
            }
        } catch {
            toast.error('Terjadi kesalahan sistem')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setIsSubmitting(true)
        try {
            await adminService.deleteNews(selected?.id || selected?.ID)
            toast.success('Konten berhasil dihapus')
            setIsDelOpen(false)
            fetchNews()
        } catch {
            toast.error('Gagal menghapus konten')
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = [
        {
            key: 'Judul', 
            label: 'Informasi & Pratinjau', 
            className: 'min-w-[350px]',
            render: (v, row) => (
                <div className="flex flex-col gap-1 py-2">
                    <span className="font-bold text-slate-800 font-headline tracking-tight text-[14px] leading-tight uppercase">{v || '—'}</span>
                    <span className="text-[11px] text-slate-500 font-medium line-clamp-1 max-w-sm">{row.Isi || 'Tidak ada deskripsi konten.'}</span>
                </div>
            )
        },
        {
            key: 'TanggalPublish', 
            label: 'Tgl Publikasi', 
            className: 'w-[200px]',
            render: v => (
                <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined text-bku-primary" style={{ fontSize: '12px' }} >schedule</span>
                    <span className="text-[11px] font-bold font-headline uppercase tabular-nums">
                        {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'target_audience', 
            label: 'Target Penerima', 
            className: 'w-[180px]',
            render: (v, row) => {
                const aud = v || row.TargetAudience || 'semua'
                let label = 'Semua Sivitas'
                let details = ''

                if (aud === 'fakultas') {
                    label = 'Fakultas'
                    const facId = row.target_fakultas_id || row.TargetFakultasID
                    const fac = faculties.find(f => (f.ID || f.id) === facId)
                    details = fac ? fac.Nama || fac.nama : `Fakultas ID: ${facId}`
                } else if (aud === 'ormawa') {
                    label = 'Ormawa'
                    const ormIdsStr = row.target_ormawa_ids || row.TargetOrmawaIDs || ''
                    if (ormIdsStr) {
                        const count = ormIdsStr.split(',').filter(Boolean).length
                        details = `${count} Ormawa Terpilih`
                    } else {
                        const ormId = row.target_ormawa_id || row.TargetOrmawaID
                        if (ormId) {
                            const orm = ormawas.find(o => (o.id || o.ID) === ormId)
                            details = orm ? orm.Nama || orm.nama : `Ormawa ID: ${ormId}`
                        } else {
                            details = 'Semua Ormawa'
                        }
                    }
                } else if (aud === 'mahasiswa') {
                    label = 'Mahasiswa'
                    const mhsIdsStr = row.target_mahasiswa_ids || row.TargetMahasiswaIDs || ''
                    if (mhsIdsStr) {
                        const count = mhsIdsStr.split(',').filter(Boolean).length
                        details = `${count} Mahasiswa Terpilih`
                    } else {
                        const facId = row.target_fakultas_id || row.TargetFakultasID
                        if (facId) {
                            const fac = faculties.find(f => (f.ID || f.id) === facId)
                            details = fac ? `Fakultas ${fac.Singkatan || fac.Nama || fac.nama}` : `Fakultas ID: ${facId}`
                        } else {
                            details = 'Global'
                        }
                    }
                }

                return (
                    <div className="flex flex-col gap-0.5">
                        <Badge className="px-2 py-0.5 rounded-lg border-none shadow-none bg-bku-primary/10 text-bku-primary text-[9px] font-black uppercase tracking-widest w-fit font-headline">
                            {label}
                        </Badge>
                        {details && <span className="text-[10px] font-bold text-slate-400 mt-1 max-w-[160px] truncate leading-tight uppercase tracking-widest">{details}</span>}
                    </div>
                )
            }
        },
        {
            key: 'Status', 
            label: 'Status Rilis', 
            className: 'w-[140px] text-center', 
            cellClassName: 'text-center',
            render: v => (
                <Badge className={cn('px-3 py-0.5 rounded-lg border-none shadow-none text-[9px] font-black uppercase tracking-widest font-headline',
                    v === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {v || 'Draft'}
                </Badge>
            )
        }
    ]

    return (
        <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
            <Toaster position="top-right" />
            
            <div className="max-w-[1600px] mx-auto space-y-8 select-none">
                
                {/* ── Page Header ─────────────────────────────────────────── */}
                <section className="glass-card rounded-2xl border border-slate-200/60 p-6 md:p-8 relative overflow-hidden shadow-none">
                    <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Public Relations</span>
                            </div>
                            <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                                Kelola <span className="text-bku-primary">Konten</span>
                            </h1>
                            <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                                Manajemen publikasi berita, pengumuman akademik, dan informasi resmi universitas untuk seluruh sivitas akademika.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={handleOpenAdd}
                                className="h-11 px-6 rounded-xl bg-slate-800 text-white font-black font-headline text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-900 transition-all active:scale-95 shadow-none border-none cursor-pointer"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                                Tulis Berita
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── Table Section ────────────────────────────────────────── */}
                <Card className="glass-card border border-slate-200/60 shadow-none rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <DataTable
                            columns={columns} 
                            data={news} 
                            loading={loading}
                            searchPlaceholder="Cari judul atau topik berita..."
                            onAdd={handleOpenAdd} 
                            addLabel="Tambah Konten"
                            filters={[
                                { key: 'Status', placeholder: 'Semua Status', options: [{ label: 'Published', value: 'Published' }, { label: 'Draft', value: 'Draft' }] }
                            ]}
                            actions={(row) => (
                                <div className="flex items-center gap-1.5">
                                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* ── Editorial Banner ──────────────────────────────────────── */}
                <div className="glass-card border border-slate-200/60 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-none">
                   <div className="flex items-center gap-5">
                      <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-none">
                         <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >language</span>
                      </div>
                      <div>
                         <p className="text-[12px] font-black text-slate-800 font-headline uppercase tracking-tight leading-tight">Live Public Broadcasting</p>
                         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Konten yang diterbitkan akan langsung tampil di portal mahasiswa & dosen.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black font-headline text-slate-400 uppercase tracking-widest">Broadcaster Status: Online</span>
                   </div>
                </div>

            </div>

            {/* ── CRUD Dialog ───────────────────────────────────────────── */}
            <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl glass-card bg-white/95">
                    <DialogHeader className="p-8 pb-6 border-b border-slate-200/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-bku-primary"><Newspaper size={100} /></div>
                        <div className="relative z-10 space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-6 rounded-lg bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                                    {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-bku-primary font-headline">Content Registry</span>
                            </div>
                            <DialogTitle className="text-2xl font-black font-headline tracking-tight text-slate-800 uppercase">
                                {isEditMode ? 'Update Konten' : 'Publikasi Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">Editor publikasi berita dan pengumuman resmi universitas.</DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
                        <div className="max-h-[50vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-5 px-1">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Judul Utama Berita</Label>
                                <Input required value={form.Judul} onChange={e => setForm({ ...form, Judul: e.target.value })} placeholder="Tulis judul yang informatif..." className="h-11 rounded-xl border-slate-200 bg-white/60 focus:bg-white font-bold text-sm font-headline focus:ring-bku-primary/20" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Isi Konten & Informasi</Label>
                                <Textarea required value={form.Isi} onChange={e => setForm({ ...form, Isi: e.target.value })} placeholder="Tulis narasi berita secara lengkap..." className="min-h-[150px] rounded-2xl border-slate-200 bg-white/60 focus:bg-white p-4 font-medium text-sm font-inter leading-relaxed focus:ring-bku-primary/20" />
                            </div>

                            <div className="space-y-2">
<Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Target Penerima Berita (Audience)</Label>
                                <Select value={form.target_audience} onValueChange={handleAudienceChange}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/60 font-bold text-sm font-headline focus:ring-bku-primary/20"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl border-slate-200">
                                        <SelectItem value="semua" className="text-[11px] font-bold uppercase tracking-widest font-headline">Semua Sivitas</SelectItem>
                                        <SelectItem value="fakultas" className="text-[11px] font-bold uppercase tracking-widest font-headline">Spesifik Fakultas</SelectItem>
                                        <SelectItem value="ormawa" className="text-[11px] font-bold uppercase tracking-widest font-headline">Spesifik Ormawa</SelectItem>
                                        <SelectItem value="mahasiswa" className="text-[11px] font-bold uppercase tracking-widest font-headline">Mahasiswa (Global / Fakultas)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {form.target_audience === 'fakultas' && (
                                <div className="space-y-2 animate-in fade-in duration-200">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Pilih Fakultas Penerima</Label>
                                    <Select 
                                        value={form.target_fakultas_id ? String(form.target_fakultas_id) : undefined} 
                                        onValueChange={v => setForm({ ...form, target_fakultas_id: Number(v) })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/60 font-bold text-sm font-headline focus:ring-bku-primary/20">
                                            <SelectValue placeholder="PILIH FAKULTAS" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl border-slate-200 max-h-[200px] overflow-y-auto">
                                            {faculties.map(f => (
                                                <SelectItem key={f.ID || f.id} value={String(f.ID || f.id)} className="text-[11px] font-bold uppercase tracking-widest font-headline">
                                                    {f.Nama || f.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {form.target_audience === 'ormawa' && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Tipe Pengiriman Ormawa</Label>
                                        <Select value={ormawaSubtype} onValueChange={handleOrmawaSubtypeChange}>
                                            <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl">
                                                <SelectItem value="all" className="text-xs font-medium uppercase">Kirim ke Satu Ormawa Tertentu</SelectItem>
                                                <SelectItem value="spesifik" className="text-xs font-medium uppercase text-primary">Kirim ke Beberapa Ormawa (Pilih/Ceklis)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {ormawaSubtype === 'all' && (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Pilih Ormawa Penerima</Label>
                                            <Select
                                                value={form.target_ormawa_id ? String(form.target_ormawa_id) : undefined}
                                                onValueChange={v => setForm({ ...form, target_ormawa_id: Number(v) })}
                                            >
                                                <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm">
                                                    <SelectValue placeholder="PILIH ORMAWA" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                                                    {ormawas.map(o => (
                                                        <SelectItem key={o.id || o.ID} value={String(o.id || o.ID)} className="text-xs font-bold uppercase">
                                                            {o.nama || o.Nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {ormawaSubtype === 'spesifik' && (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between text-xs font-bold text-neutral-500 font-jakarta ml-1">
                                                <span>Pilih Daftar Ormawa (Ceklis)</span>
                                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px]">
                                                    {(form.target_ormawa_ids || '').split(',').filter(Boolean).length} Terpilih
                                                </Badge>
                                            </div>
                                            <Input
                                                placeholder="Cari nama ormawa..."
                                                value={ormawaSearch}
                                                onChange={e => setOrmawaSearch(e.target.value)}
                                                className="h-10 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm font-jakarta"
                                            />
                                            <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                                                    <input
                                                        type="checkbox"
                                                        id="select-all-ormawas"
                                                        checked={filteredOrmawas.length > 0 && filteredOrmawas.every(o => (form.target_ormawa_ids || '').split(',').includes(String(o.id || o.ID)))}
                                                        onChange={e => {
                                                            const checked = e.target.checked
                                                            const currentIds = (form.target_ormawa_ids || '').split(',').filter(Boolean)
                                                            let nextIds
                                                            if (checked) {
                                                                nextIds = Array.from(new Set([...currentIds, ...filteredOrmawas.map(o => String(o.id || o.ID))]))
                                                            } else {
                                                                const filteredSet = new Set(filteredOrmawas.map(o => String(o.id || o.ID)))
                                                                nextIds = currentIds.filter(id => !filteredSet.has(id))
                                                            }
                                                            setForm({ ...form, target_ormawa_ids: nextIds.join(',') })
                                                        }}
                                                        className="rounded border-neutral-300 text-primary focus:ring-primary size-4"
                                                    />
                                                    <Label htmlFor="select-all-ormawas" className="text-xs font-bold text-neutral-600 cursor-pointer">Pilih Semua Hasil Pencarian</Label>
                                                </div>

                                                {filteredOrmawas.length === 0 ? (
                                                    <p className="text-xs text-neutral-400 italic text-center py-4">Ormawa tidak ditemukan.</p>
                                                ) : (
                                                    filteredOrmawas.map(o => {
                                                        const oid = String(o.id || o.ID)
                                                        const selectedIds = (form.target_ormawa_ids || '').split(',').filter(Boolean)
                                                        const isChecked = selectedIds.includes(oid)
                                                        return (
                                                            <div key={oid} className="flex items-center gap-2 py-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`orm-chk-${oid}`}
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        let nextIds
                                                                        if (isChecked) {
                                                                            nextIds = selectedIds.filter(id => id !== oid)
                                                                        } else {
                                                                            nextIds = [...selectedIds, oid]
                                                                        }
                                                                        setForm({ ...form, target_ormawa_ids: nextIds.join(',') })
                                                                    }}
                                                                    className="rounded border-neutral-300 text-primary focus:ring-primary size-4"
                                                                />
                                                                <Label htmlFor={`orm-chk-${oid}`} className="text-xs font-medium text-neutral-700 cursor-pointer flex flex-1 justify-between items-center">
                                                                    <span>{o.nama || o.Nama}</span>
                                                                </Label>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {form.target_audience === 'mahasiswa' && (
                                <div className="space-y-3 animate-in fade-in duration-200">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Tipe Pengiriman Mahasiswa</Label>
                                        <Select value={mahasiswaSubtype} onValueChange={handleMahasiswaSubtypeChange}>
                                            <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl">
                                                <SelectItem value="global" className="text-xs font-medium uppercase">Kirim ke Semua Mahasiswa (Global)</SelectItem>
                                                <SelectItem value="fakultas" className="text-xs font-medium uppercase">Kirim ke Mahasiswa Fakultas Tertentu</SelectItem>
                                                <SelectItem value="spesifik" className="text-xs font-medium uppercase text-primary">Kirim ke Mahasiswa Spesifik (Pilih/Ceklis)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {mahasiswaSubtype === 'fakultas' && (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Pilih Fakultas Mahasiswa</Label>
                                            <Select
                                                value={form.target_fakultas_id ? String(form.target_fakultas_id) : undefined}
                                                onValueChange={v => setForm({ ...form, target_fakultas_id: Number(v) })}
                                            >
                                                <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm">
                                                    <SelectValue placeholder="PILIH FAKULTAS" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                                                    {faculties.map(f => (
                                                        <SelectItem key={f.ID || f.id} value={String(f.ID || f.id)} className="text-xs font-bold uppercase">
                                                            {f.Nama || f.nama}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {mahasiswaSubtype === 'spesifik' && (
                                        <div className="space-y-2 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between text-xs font-bold text-neutral-500 font-jakarta ml-1">
                                                <span>Pilih Daftar Mahasiswa (Ceklis)</span>
                                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-[10px]">
                                                    {(form.target_mahasiswa_ids || '').split(',').filter(Boolean).length} Terpilih
                                                </Badge>
                                            </div>
                                            <Input
                                                placeholder="Cari nama atau NIM mahasiswa..."
                                                value={studentSearch}
                                                onChange={e => setStudentSearch(e.target.value)}
                                                className="h-10 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm font-jakarta"
                                            />
                                            <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                                                    <input
                                                        type="checkbox"
                                                        id="select-all-students"
                                                        checked={filteredStudents.length > 0 && filteredStudents.every(s => (form.target_mahasiswa_ids || '').split(',').includes(String(s.ID || s.id)))}
                                                        onChange={e => {
                                                            const checked = e.target.checked
                                                            const currentIds = (form.target_mahasiswa_ids || '').split(',').filter(Boolean)
                                                            let nextIds
                                                            if (checked) {
                                                                nextIds = Array.from(new Set([...currentIds, ...filteredStudents.map(s => String(s.ID || s.id))]))
                                                            } else {
                                                                const filteredSet = new Set(filteredStudents.map(s => String(s.ID || s.id)))
                                                                nextIds = currentIds.filter(id => !filteredSet.has(id))
                                                            }
                                                            setForm({ ...form, target_mahasiswa_ids: nextIds.join(',') })
                                                        }}
                                                        className="rounded border-neutral-300 text-primary focus:ring-primary size-4"
                                                    />
                                                    <Label htmlFor="select-all-students" className="text-xs font-bold text-neutral-600 cursor-pointer">Pilih Semua Hasil Pencarian</Label>
                                                </div>

                                                {filteredStudents.length === 0 ? (
                                                    <p className="text-xs text-neutral-400 italic text-center py-4">Mahasiswa tidak ditemukan.</p>
                                                ) : (
                                                    filteredStudents.map(s => {
                                                        const sid = String(s.ID || s.id)
                                                        const selectedIds = (form.target_mahasiswa_ids || '').split(',').filter(Boolean)
                                                        const isChecked = selectedIds.includes(sid)
                                                        return (
                                                            <div key={sid} className="flex items-center gap-2 py-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`mhs-chk-${sid}`}
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        let nextIds
                                                                        if (isChecked) {
                                                                            nextIds = selectedIds.filter(id => id !== sid)
                                                                        } else {
                                                                            nextIds = [...selectedIds, sid]
                                                                        }
                                                                        setForm({ ...form, target_mahasiswa_ids: nextIds.join(',') })
                                                                    }}
                                                                    className="rounded border-neutral-300 text-primary focus:ring-primary size-4"
                                                                />
                                                                <Label htmlFor={`mhs-chk-${sid}`} className="text-xs font-medium text-neutral-700 cursor-pointer flex flex-1 justify-between items-center">
                                                                    <span>{s.Nama || s.nama}</span>
                                                                    <span className="text-[10px] text-neutral-400 font-mono">NIM: {s.NIM || s.nim}</span>
                                                                </Label>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Visibilitas Publikasi</Label>
                                <Select value={form.Status} onValueChange={v => setForm({ ...form, Status: v })}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/60 font-bold text-sm font-headline focus:ring-bku-primary/20"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl border-slate-200">
                                        <SelectItem value="Published" className="text-[11px] font-bold uppercase tracking-widest font-headline text-emerald-600">Terbitkan Sekarang</SelectItem>
                                        <SelectItem value="Draft" className="text-[11px] font-bold uppercase tracking-widest font-headline">Simpan Sebagai Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                        <div className="pt-6 flex flex-row gap-3 border-t border-slate-200/40">
                             <Button type="button" variant="outline" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border-slate-200 hover:bg-slate-100 font-headline cursor-pointer">Batal</Button>
                             <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-slate-800 text-white hover:bg-slate-900 shadow-none transition-all active:scale-95 font-headline text-[10px] font-black uppercase tracking-widest cursor-pointer border-none">
                                {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                                {isEditMode ? 'Update Konten' : 'Terbitkan Berita'}
                             </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmModal 
                isOpen={isDelOpen} 
                onClose={() => setIsDelOpen(false)} 
                onConfirm={handleDelete}
                title="Hapus Konten Publikasi?" 
                description="Berita ini akan dihapus secara permanen dari portal mahasiswa dan dosen." 
                loading={isSubmitting} 
            />
        </div>
    )
}
