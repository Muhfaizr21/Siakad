"use client"

import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { adminService } from '../../services/api'
import { toast, Toaster } from 'react-hot-toast'
import { Pencil, Trash2, Plus, Save, Loader2, Newspaper, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent } from './components/ui/card'
import { DataTable } from './components/ui/data-table'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { cn } from '@/lib/utils'

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
            else toast.error('Gagal memuat berita')
        } catch {
            toast.error('Gagal terhubung ke server')
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
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = isEditMode
                ? await adminService.updateNews(selected.ID, form)
                : await adminService.createNews(form)
            if (res.status === 'success') {
                toast.success(isEditMode ? 'Berita diperbarui' : 'Berita diterbitkan')
                setIsCrudOpen(false)
                fetchNews()
            } else {
                toast.error(res.message || 'Gagal menyimpan')
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
            toast.success('Berita dihapus')
            setIsDelOpen(false)
            fetchNews()
        } catch {
            toast.error('Gagal menghapus')
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = [
        {
            key: 'Judul', label: 'Judul Berita', className: 'min-w-[320px]',
            render: (v, row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v || '—'}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-sm">{row.Isi?.substring(0, 80)}...</span>
                </div>
            )
        },
        {
            key: 'TanggalPublish', label: 'Tanggal Rilis', className: 'w-[200px]',
            render: v => (
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-tighter">
                    <Clock className="size-3.5" />
                    {v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </div>
            )
        },
        {
            key: 'Status', label: 'Status', className: 'w-[140px] text-center', cellClassName: 'text-center',
            render: v => (
                <Badge className={cn('font-black text-[9px] px-3 py-1 border-none',
                    v === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {v || 'Draft'}
                </Badge>
            )
        }
    ]

    return (
        <div className="bg-slate-50 min-h-screen flex font-sans">
            <Toaster position="top-right" />
            <Sidebar />
            <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">
                <TopNavBar />
                <div className="p-8 space-y-6">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary"><Newspaper className="size-6" /></div>
                            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Kelola Berita & Konten</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Publikasi Informasi Resmi Universitas</p>
                        </div>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
                        <CardContent className="p-0">
                            <DataTable
                                columns={columns} data={news} loading={loading}
                                searchPlaceholder="Cari judul berita..."
                                onAdd={handleOpenAdd} addLabel="Tulis Berita Baru"
                                filters={[{ key: 'Status', placeholder: 'Filter Status', options: [{ label: 'Published', value: 'Published' }, { label: 'Draft', value: 'Draft' }] }]}
                                actions={(row) => (
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl"><Pencil className="size-4" /></Button>
                                        <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="size-4" /></Button>
                                    </div>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* CRUD Dialog */}
            <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
                    <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Newspaper className="size-24 rotate-12" /></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}</div>
                                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Content Registry</Badge>
                            </div>
                            <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">{isEditMode ? 'Edit Berita' : 'Tulis Berita Baru'}</DialogTitle>
                        </div>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="p-8 pt-6 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Judul Berita</Label>
                            <Input required value={form.Judul} onChange={e => setForm({ ...form, Judul: e.target.value })} placeholder="Masukkan judul berita yang menarik..." className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-bold text-sm font-headline" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Isi Konten / Berita</Label>
                            <Textarea required value={form.Isi} onChange={e => setForm({ ...form, Isi: e.target.value })} placeholder="Tulis rincian berita di sini..." className="min-h-[160px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Publikasi</Label>
                            <select value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })}
                                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <option value="Published">PUBLISHED — Langsung Tampil</option>
                                <option value="Draft">DRAFT — Simpan Dulu</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-4 flex flex-row gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
                            <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12 rounded-2xl">Batalkan</Button>
                            <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isEditMode ? 'Update Berita' : 'Terbitkan'}</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
                title="Hapus Berita?" description="Artikel berita ini akan dihapus permanen dari sistem." loading={isSubmitting} />
        </div>
    )
}
