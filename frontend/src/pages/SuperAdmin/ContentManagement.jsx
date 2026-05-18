"use client"

import React, { useState, useEffect } from 'react'
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
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCrudOpen, setIsCrudOpen] = useState(false)
    const [isDelOpen, setIsDelOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [selected, setSelected] = useState(null)
    const [form, setForm] = useState({ Judul: '', Isi: '', Status: 'Published' })

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

    useEffect(() => { fetchNews() }, [])

    const handleOpenAdd = () => {
        setIsEditMode(false)
        setSelected(null)
        setForm({ Judul: '', Isi: '', Status: 'Published' })
        setIsCrudOpen(true)
    }

    const handleOpenEdit = (row) => {
        setIsEditMode(true)
        setSelected(row)
        setForm({ Judul: row.Judul || '', Isi: row.Isi || '', Status: row.Status || 'Published' })
        setIsCrudOpen(true)
    }

    const handleSave = async (e) => {
        if (e) e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = isEditMode
                ? await adminService.updateNews(selected.ID, form)
                : await adminService.createNews(form)
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
            await adminService.deleteNews(selected.ID)
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
                    <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight uppercase">{v || '—'}</span>
                    <span className="text-[11px] text-neutral-400 font-medium line-clamp-1 max-w-sm">{row.Isi || 'Tidak ada deskripsi konten.'}</span>
                </div>
            )
        },
        {
            key: 'TanggalPublish', 
            label: 'Tgl Publikasi', 
            className: 'w-[200px]',
            render: v => (
                <div className="flex items-center gap-2 text-neutral-500">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }} >schedule</span>
                    <span className="text-[11px] font-bold font-jakarta uppercase tabular-nums">
                        {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'Status', 
            label: 'Status Rilis', 
            className: 'w-[140px] text-center', 
            cellClassName: 'text-center',
            render: v => (
                <Badge className={cn('px-3 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest',
                    v === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                    {v || 'Draft'}
                </Badge>
            )
        }
    ]

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
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Public Relations</span>
                            </div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-jakarta tracking-tight leading-tight">
                                Kelola <span className="text-primary">Konten</span>
                            </h1>
                            <p className="text-neutral-500 font-medium text-sm max-w-2xl leading-relaxed">
                                Manajemen publikasi berita, pengumuman akademik, dan informasi resmi universitas untuk seluruh sivitas akademika.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                onClick={handleOpenAdd}
                                className="h-11 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md gap-2 transition-all active:scale-95 border-none"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}  strokeWidth={3}>add</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Tulis Berita</span>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ── Table Section ────────────────────────────────────────── */}
                <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
                    <CardContent className="p-0">
                        <DataTable
                            columns={columns} 
                            data={news} 
                            loading={loading}
                            searchPlaceholder="Cari judul atau topik berita..."
                            onAdd={handleOpenAdd} 
                            addLabel="Tambah Unit"
                            filters={[
                                { key: 'Status', placeholder: 'Semua Status', options: [{ label: 'Published', value: 'Published' }, { label: 'Draft', value: 'Draft' }] }
                            ]}
                            actions={(row) => (
                                <div className="flex items-center gap-1.5">
                                    <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >edit</span></Button>
                                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><span className="material-symbols-outlined" style={{ fontSize: '16px' }} >delete</span></Button>
                                </div>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* ── Editorial Banner ──────────────────────────────────────── */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                   <div className="flex items-center gap-5">
                      <div className="size-12 rounded-xl bg-neutral-900 flex items-center justify-center text-white shadow-lg">
                         <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >language</span>
                      </div>
                      <div>
                         <p className="text-sm font-bold text-neutral-900 font-jakarta leading-tight">Live Public Broadcasting</p>
                         <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mt-1">Konten yang diterbitkan akan langsung tampil di portal mahasiswa & dosen.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Broadcaster Status: Online</span>
                   </div>
                </div>

            </div>

            {/* ── CRUD Dialog ───────────────────────────────────────────── */}
            <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-white">
                    <DialogHeader className="p-8 pb-6 border-b border-neutral-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-primary"><Newspaper size={100} /></div>
                        <div className="relative z-10 space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                                    {isEditMode ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }}  strokeWidth={3}>add</span>}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Content Registry</span>
                            </div>
                            <DialogTitle className="text-2xl font-bold font-jakarta tracking-tight text-neutral-900 uppercase">
                                {isEditMode ? 'Update Konten' : 'Publikasi Baru'}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-neutral-400">Editor publikasi berita dan pengumuman resmi universitas.</DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Judul Utama Berita</Label>
                            <Input required value={form.Judul} onChange={e => setForm({ ...form, Judul: e.target.value })} placeholder="Tulis judul yang informatif..." className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 focus:bg-white font-medium text-sm font-jakarta" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Isi Konten & Informasi</Label>
                            <Textarea required value={form.Isi} onChange={e => setForm({ ...form, Isi: e.target.value })} placeholder="Tulis narasi berita secara lengkap..." className="min-h-[200px] rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white p-4 font-medium text-sm font-jakarta leading-relaxed" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-neutral-500 font-jakarta ml-1">Visibilitas Publikasi</Label>
                            <Select value={form.Status} onValueChange={v => setForm({ ...form, Status: v })}>
                                <SelectTrigger className="h-11 rounded-lg border-neutral-200 bg-neutral-50/30 font-medium text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl">
                                    <SelectItem value="Published" className="text-xs font-medium uppercase text-emerald-600">Terbitkan Sekarang</SelectItem>
                                    <SelectItem value="Draft" className="text-xs font-medium uppercase">Simpan Sebagai Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-6 flex flex-row gap-3 border-t border-neutral-100">
                             <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-neutral-400">Batal</Button>
                             <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-xl bg-neutral-900 text-white hover:bg-primary shadow-md transition-all active:scale-95">
                                {isSubmitting ? <span className="material-symbols-outlined animate-spin mr-2" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined mr-2" style={{ fontSize: '14px' }} >save</span>}
                                <span className="text-xs font-bold uppercase tracking-widest">{isEditMode ? 'Update Konten' : 'Terbitkan Berita'}</span>
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
