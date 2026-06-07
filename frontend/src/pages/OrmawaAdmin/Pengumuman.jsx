"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

const KATEGORI_CFG = {
  umum: { label: 'Umum', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  kegiatan: { label: 'Kegiatan', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  penting: { label: 'Penting', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  prestasi: { label: 'Prestasi', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
}

export default function Pengumuman() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ormawaId = getOrmawaId()

  const [form, setForm] = useState({ Judul: '', Isi: '', Kategori: 'umum', OrmawaID: ormawaId })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth(`${API}/announcements?ormawaId=${ormawaId}`)
      if (res.status === 'success') {
        setData(res.data || [])
      } else {
        toast.error('Gagal memuat daftar pengumuman')
      }
    } catch (err) {
      toast.error('Koneksi database backend gagal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [ormawaId])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setForm({ Judul: '', Isi: '', Kategori: 'umum', OrmawaID: ormawaId })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (row) => {
    setIsEditMode(true)
    setForm({
      ID: row.id || row.ID,
      Judul: row.Judul || row.judul || '',
      Isi: row.Isi || row.isi || '',
      Kategori: row.Kategori || row.kategori || row.Target || 'umum',
      OrmawaID: ormawaId
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `${API}/announcements/${form.ID || form.id}` : `${API}/announcements`
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify({ ...form, Target: form.Kategori, OrmawaID: Number(form.OrmawaID) }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (res.status === 'success') {
        toast.success(isEditMode ? 'Pengumuman diperbarui!' : 'Pengumuman baru berhasil diterbitkan!')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan pengumuman')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi backend')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`${API}/announcements/${selected?.id || selected?.ID}`, {
        method: 'DELETE'
      })
      if (res.status === 'success') {
        toast.success('Pengumuman berhasil dihapus')
        setIsDelOpen(false)
        fetchData()
      } else {
        toast.error('Gagal menghapus pengumuman')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi backend')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'Judul',
      label: 'Judul Pengumuman',
      className: 'min-w-[300px]',
      render: (v, row) => <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{row.Judul || row.judul || v || '—'}</span>
    },
    {
      key: 'Kategori',
      label: 'Kategori',
      className: 'w-[140px] text-center',
      cellClassName: 'text-center',
      render: (v, row) => {
        const cat = row.Kategori || row.kategori || row.Target || 'umum'
        const cfg = KATEGORI_CFG[cat] || { label: cat || 'Umum', cls: 'bg-slate-50 text-slate-600 border-slate-200' }
        return (
          <Badge className={cn('font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border rounded-full', cfg.cls)}>
            {cfg.label}
          </Badge>
        )
      }
    },
    {
      key: 'CreatedAt',
      label: 'Diterbitkan',
      className: 'w-[180px]',
      render: (v, row) => {
        const dateVal = row.created_at || row.CreatedAt || row.TanggalMulai || v
        return (
          <span className="font-bold text-slate-400 text-[11px] font-headline">
            {dateVal ? new Date(dateVal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
        )
      }
    }
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />

      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white p-8 md:p-10 shadow-sm border border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--theme-secondary)' }} />
        <div className="absolute -bottom-10 right-40 w-60 h-60 rounded-full blur-2xl opacity-10" style={{ backgroundColor: 'var(--theme-surface)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--theme-primary)' }} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600">Siaran & Informasi</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner" style={{ color: 'var(--theme-primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>campaign</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline text-slate-900">Siaran & Pengumuman</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Publikasi pengumuman penting, agenda rapat, dan regulasi resmi bagi seluruh anggota.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleOpenAdd}
            className="h-12 px-6 rounded-2xl text-white font-bold text-xs tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>BUAT PENGUMUMAN</span>
          </Button>
        </div>
      </section>

      {/* ── Pengumuman DataTable Container ────────────────────────────── */}
      <Card className="border border-slate-200/50 shadow-sm rounded-[2rem] overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            searchPlaceholder="Cari judul pengumuman..."
            onAdd={handleOpenAdd}
            addLabel="Buat Pengumuman"
            filters={[
              {
                key: 'Kategori',
                placeholder: 'Filter Kategori',
                options: Object.entries(KATEGORI_CFG).map(([v, { label }]) => ({ label, value: v }))
              }
            ]}
            actions={(row) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  onClick={() => {
                    setSelected(row)
                    setIsDetailOpen(true)
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-bku-primary hover:bg-blue-50 rounded-xl active:scale-95 transition-all"
                  title="Lihat Detail Pengumuman"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                </Button>
                <Button
                  onClick={() => handleOpenEdit(row)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl active:scale-95 transition-all"
                  title="Edit Pengumuman"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                </Button>
                <Button
                  onClick={() => {
                    setSelected(row)
                    setIsDelOpen(true)
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl active:scale-95 transition-all"
                  title="Hapus Pengumuman"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* ── Detail View Dialog (Premium Double Column Academic Style) ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200">
          {selected && (
            <div>
              {/* Header block with Navy Academic Banner */}
              <div className="p-8 bg-gradient-to-r from-bku-primary to-[#1e3a8a] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06)_0%,transparent_50%)]" />
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined size-24 text-white">campaign</span>
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn('font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border shrink-0 rounded-full', KATEGORI_CFG[selected.Kategori || selected.kategori || selected.Target || 'umum']?.cls || 'bg-slate-50 text-slate-600 border-slate-200')}>
                      {KATEGORI_CFG[selected.Kategori || selected.kategori || selected.Target || 'umum']?.label || selected.Kategori || selected.kategori || selected.Target || 'Umum'}
                    </Badge>
                    <span className="text-[10px] text-blue-200 font-bold tracking-[0.2em] uppercase font-headline">SIARAN ANN-{selected.id || selected.ID}</span>
                  </div>
                  <h2 className="text-2xl font-black font-headline tracking-tighter leading-tight">{selected.Judul || selected.judul || '—'}</h2>
                  <div className="flex items-center gap-2 text-[10px] text-blue-200 font-bold pt-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_month</span>
                    <span>Diterbitkan pada {selected.created_at || selected.CreatedAt || selected.TanggalMulai ? new Date(selected.created_at || selected.CreatedAt || selected.TanggalMulai).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Premium Dual-Column Detail Grid */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Metadata Column */}
                  <div className="space-y-4 md:col-span-1 border-r border-slate-100 pr-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase font-headline block">Oleh Ormawa</span>
                      <span className="text-xs font-bold text-slate-700 block bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">Badan Pengurus Harian</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase font-headline block">Target Pembaca</span>
                      <span className="text-xs font-bold text-slate-700 block bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">Seluruh Anggota</span>
                    </div>
                  </div>

                  {/* Right Content Column */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Isi Pengumuman Resmi</Label>
                    <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 min-h-[120px] whitespace-pre-line">
                      {selected.Isi || selected.isi || '—'}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDetailOpen(false)}
                    className="text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl active:scale-95 transition-all"
                  >
                    TUTUP
                  </Button>
                  <Button
                    onClick={() => {
                      setIsDetailOpen(false)
                      handleOpenEdit(selected)
                    }}
                    className="text-[10px] font-black h-12 px-8 rounded-2xl bg-primary text-white hover:bg-primary/95 shadow-xl shadow-primary/20 active:scale-95 transition-all border-none"
                  >
                    EDIT PENGUMUMAN
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CRUD Dialog Form (Beautiful Selector Buttons Grid) ────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-bku-primary">campaign</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>campaign</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-bku-primary/5 text-bku-primary border-none rounded-md">ANNOUNCEMENT PORTAL</Badge>
              </div>
              <DialogTitle className="text-xl font-black font-headline tracking-tighter text-slate-900">
                {isEditMode ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400 mt-1">
                Tulis tajuk siaran, tentukan kategori, dan publikasikan informasi resmi ormawa.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            {/* Judul Pengumuman */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Judul Pengumuman</Label>
              <Input
                required
                value={form.Judul}
                onChange={e => setForm({ ...form, Judul: e.target.value })}
                placeholder="Masukkan judul atau tajuk utama pengumuman..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
              />
            </div>

            {/* Premium Selector Grid Buttons for Kategori (Lucide Card Parity) */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Pilih Kategori Siaran</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'umum', label: 'UMUM', icon: 'feed', cls: 'hover:bg-slate-50 text-slate-600', activeCls: 'bg-slate-900 text-white border-transparent shadow-md' },
                  { id: 'kegiatan', label: 'KEGIATAN', icon: 'event', cls: 'hover:bg-blue-50/50 text-blue-600', activeCls: 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-500/20' },
                  { id: 'penting', label: 'PENTING', icon: 'warning', cls: 'hover:bg-rose-50/50 text-rose-600', activeCls: 'bg-rose-600 text-white border-transparent shadow-md shadow-rose-500/20' },
                  { id: 'info', label: 'INFORMASI', icon: 'info', cls: 'hover:bg-violet-50/50 text-violet-600', activeCls: 'bg-violet-600 text-white border-transparent shadow-md shadow-violet-500/20' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, Kategori: cat.id })}
                    className={cn(
                      "h-12 rounded-2xl border text-xs font-bold tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2",
                      form.Kategori === cat.id
                        ? cat.activeCls
                        : cn("bg-slate-50 border-slate-200", cat.cls)
                    )}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Isi Pengumuman */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Isi Pengumuman</Label>
              <Textarea
                required
                value={form.Isi}
                onChange={e => setForm({ ...form, Isi: e.target.value })}
                placeholder="Tuliskan isi pengumuman secara lengkap, jelas, dan lugas di sini..."
                className="min-h-[140px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-semibold text-xs leading-relaxed p-4"
              />
            </div>

            {/* Dialog Footer Actions */}
            <DialogFooter className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 pb-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCrudOpen(false)}
                className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl active:scale-95 transition-all"
              >
                BATAL
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto h-12 px-8 rounded-2xl bg-bku-primary hover:bg-bku-primary/90 text-white shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '16px' }}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>campaign</span>
                )}
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {isEditMode ? 'SIMPAN PERUBAHAN' : 'PUBLIKASIKAN'}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman?"
        description="Apakah Anda yakin ingin menghapus siaran pengumuman ini? Tindakan ini bersifat permanen."
        loading={isSubmitting}
      />
    </div>
  )
}
