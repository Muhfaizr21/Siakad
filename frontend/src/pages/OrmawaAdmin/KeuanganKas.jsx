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
import { Pencil, Trash2, Loader2, Plus, Save, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'

import { fetchWithAuth } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = 'http://localhost:8000/api/ormawa'

const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export default function KeuanganKas() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1
  const [form, setForm] = useState({ Deskripsi: '', Nominal: '', Tipe: 'pemasukan', Tanggal: '', OrmawaID: ormawaId })

  const saldo = transactions.reduce((acc, t) => t.Tipe === 'pemasukan' ? acc + (t.Nominal || 0) : acc - (t.Nominal || 0), 0)
  const totalIn = transactions.filter(t => t.Tipe === 'pemasukan').reduce((a, t) => a + (t.Nominal || 0), 0)
  const totalOut = transactions.filter(t => t.Tipe === 'pengeluaran').reduce((a, t) => a + (t.Nominal || 0), 0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/kas?ormawaId=${ormawaId}`)
      if (data.status === 'success') setTransactions(data.data || [])
      else toast.error('Gagal memuat data keuangan')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    const payload = { ...form, Nominal: Number(form.Nominal), OrmawaID: Number(form.OrmawaID), Tanggal: form.Tanggal ? new Date(form.Tanggal).toISOString() : new Date().toISOString() }
    try {
      const data = await fetchWithAuth(`${API}/kas`, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      if (data.status === 'success') { toast.success('Transaksi dicatat'); setIsCrudOpen(false); fetchData() }
      else toast.error(data.message || 'Gagal menyimpan')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const data = await fetchWithAuth(`${API}/kas/${selected?.ID}`, { method: 'DELETE' })
      if (data.status === 'success') { toast.success('Transaksi dihapus'); setIsDelOpen(false); fetchData() }
      else toast.error('Gagal menghapus')
    } catch { toast.error('Terjadi kesalahan') } finally { setIsSubmitting(false) }
  }

  const columns = [
    {
      key: 'Tanggal', label: 'Tanggal', className: 'w-[150px]',
      render: v => <span className="font-bold text-slate-500 text-[11px] font-headline">{v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
    },
    {
      key: 'Deskripsi', label: 'Keterangan', className: 'min-w-[280px]',
      render: v => <span className="font-bold text-slate-900 text-[13px] font-headline">{v || '—'}</span>
    },
    {
      key: 'Tipe', label: 'Jenis', className: 'w-[140px] text-center', cellClassName: 'text-center',
      render: v => (
        <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm',
          v === 'pemasukan' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' : 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20')}>
          {v === 'pemasukan' ? '▲ Masuk' : '▼ Keluar'}
        </Badge>
      )
    },
    {
      key: 'Nominal', label: 'Jumlah', className: 'w-[180px] text-right', cellClassName: 'text-right',
      render: (v, row) => (
        <span className={cn('font-black text-[13px] font-headline', row.Tipe === 'pemasukan' ? 'text-emerald-600' : 'text-rose-600')}>
          {row.Tipe === 'pemasukan' ? '+' : '-'}{formatRp(v)}
        </span>
      )
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-60 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-20 px-6 pb-12">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary"><DollarSign className="size-6" /></div>
              <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Buku Kas & Keuangan</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Keuangan & Mutasi Kas Ormawa</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Saldo Kas', value: formatRp(saldo), color: 'text-primary', bg: 'bg-primary/5', icon: DollarSign },
              { label: 'Total Pemasukan', value: formatRp(totalIn), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
              { label: 'Total Pengeluaran', value: formatRp(totalOut), color: 'text-rose-600', bg: 'bg-rose-50', icon: TrendingDown },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className={cn('rounded-2xl p-5 border border-slate-100 shadow-sm', bg)}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={cn('text-xl font-black font-headline tracking-tighter', color)}>{value}</p>
              </div>
            ))}
          </div>

          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={transactions} loading={loading}
                searchPlaceholder="Cari keterangan transaksi..."
                onAdd={() => { setForm({ Deskripsi: '', Nominal: '', Tipe: 'pemasukan', Tanggal: '', OrmawaID: ormawaId }); setIsCrudOpen(true) }}
                addLabel="Catat Transaksi"
                filters={[{ key: 'Tipe', placeholder: 'Filter Jenis', options: [{ label: 'Pemasukan', value: 'pemasukan' }, { label: 'Pengeluaran', value: 'pengeluaran' }] }]}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl"><Trash2 className="size-4" /></Button>
                  </div>
                )}
              />

            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><DollarSign className="size-24 rotate-12" /></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Plus className="size-4 stroke-[3px]" /></div>
                <Badge className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">Kas Registry</Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">Catat Transaksi Baru</DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">Dokumentasikan pemasukan atau pengeluaran kas ormawa.</DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Keterangan</Label>
              <Input required value={form.Deskripsi} onChange={e => setForm({ ...form, Deskripsi: e.target.value })} placeholder="Misal: Iuran anggota bulan April..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jenis</Label>
                <select value={form.Tipe} onChange={e => setForm({ ...form, Tipe: e.target.value })}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white transition-all">
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jumlah (Rp)</Label>
                <Input required type="number" value={form.Nominal} onChange={e => setForm({ ...form, Nominal: e.target.value })} placeholder="0"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Tanggal Transaksi</Label>
              <Input required type="date" value={form.Tanggal} onChange={e => setForm({ ...form, Tanggal: e.target.value })}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline" />
            </div>
            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl">Batalkan</Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : <Save className="size-4 mr-2 stroke-[3px]" />}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Simpan Transaksi</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal isOpen={isDelOpen} onClose={() => setIsDelOpen(false)} onConfirm={handleDelete}
        title="Hapus Transaksi?" description="Data transaksi ini akan dihapus permanen dari buku kas." loading={isSubmitting} />
    </div>
  )
}
