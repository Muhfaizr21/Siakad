"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'
import { Textarea } from '../FacultyAdmin/components/textarea'
import { Eye, Pencil, Trash2, Loader2, Plus, Save, MessageSquare, CheckCircle2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

export default function AspirationManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tanggapan, setTanggapan] = useState('')
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.ID || 1

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/aspirations?ormawaId=${ormawaId}`)
      if (data.status === 'success') setData(data.data || [])
      else toast.error('Gagal memuat aspirasi')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const handleTanggapi = async () => {
    if (!tanggapan.trim()) { toast.error('Isi tanggapan terlebih dahulu'); return }
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/aspirations/${selected?.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tanggapan: tanggapan, Status: 'ditanggapi' })
      })
      if (data.status === 'success') { toast.success('Tanggapan berhasil dikirim'); setIsDetailOpen(false); setTanggapan(''); fetchData() }
      else toast.error(data.message || 'Gagal mengirim tanggapan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const columns = [
    { key: 'Judul', label: 'Topik Aspirasi', className: 'min-w-[280px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[13px] font-headline tracking-tighter">{v || '—'}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{row.OrmawaNama || 'Ormawa'}</span>
        </div>
      )
    },
    { key: 'Status', label: 'Status', className: 'w-[150px] text-center', cellClassName: 'text-center',
      render: v => (
        <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm',
          v === 'ditanggapi' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' :
          v === 'pending' || !v ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' :
          'bg-slate-100 text-slate-600')}>{v === 'ditanggapi' ? 'Ditanggapi' : v === 'pending' || !v ? 'Menunggu' : v}</Badge>
      )
    },
    { key: 'CreatedAt', label: 'Dikirim', className: 'w-[160px]',
      render: v => <span className="font-bold text-slate-400 text-[11px] font-headline">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-4 lg:px-8 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><MessageSquare className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Aspirasi Organisasi</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tampung & Tanggapi Aspirasi Anggota</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={data} loading={loading}
                searchPlaceholder="Cari topik aspirasi..."
                filters={[{ key: 'Status', placeholder: 'Filter Status', options: [{ label: 'Menunggu', value: 'menunggu' }, { label: 'Ditanggapi', value: 'ditanggapi' }] }]}
                actions={(row) => (
                  <Button onClick={() => { setSelected(row); setTanggapan(''); setIsDetailOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
                    <Eye className="size-4" />
                  </Button>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl ">
          {selected && (
            <div>
              <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aspirasi #{selected.ID}</p>
                      <h2 className="text-xl font-black text-white font-headline tracking-tighter">{selected.Judul}</h2>
                    </div>
                    <Badge className={cn('font-black text-[9px] px-3 py-1 border-none shrink-0',
                      selected.Status === 'ditanggapi' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>
                      {selected.Status === 'ditanggapi' ? 'Ditanggapi' : 'Menunggu'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 font-headline">Isi Aspirasi</p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{selected.Isi || selected.Konten || '—'}</p>
                </div>
                {selected.Tanggapan && (
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 font-headline flex items-center gap-1.5"><CheckCircle2 className="size-3" /> Tanggapan Ormawa</p>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed bg-emerald-50 p-4 rounded-2xl border border-emerald-100">{selected.Tanggapan}</p>
                  </div>
                )}
                {selected.Status !== 'ditanggapi' && (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Tulis Tanggapan</Label>
                    <Textarea rows={3} value={tanggapan} onChange={e => setTanggapan(e.target.value)}
                      placeholder="Tulis balasan/tanggapan resmi ormawa..."
                      className="rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed resize-none" />
                    <Button disabled={isSubmitting} onClick={handleTanggapi} className="w-full h-12 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">
                      {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                      Kirim Tanggapan
                    </Button>
                  </div>
                )}
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 rounded-2xl">Tutup</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
