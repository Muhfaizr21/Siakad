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

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

// Premium Rupiah Formatter
const formatRp = (n) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(n || 0)
}

export default function KeuanganKas() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const ormawaId = useAuthStore.getState()?.mahasiswa?.ormawaId || useAuthStore.getState()?.mahasiswa?.OrmawaID || 1
  const [form, setForm] = useState({ 
    Deskripsi: '', 
    Nominal: '', 
    Tipe: 'pemasukan', 
    Tanggal: '', 
    OrmawaID: ormawaId 
  })

  // Calculate totals
  const saldo = transactions.reduce((acc, t) => t.Tipe === 'pemasukan' ? acc + (t.Nominal || 0) : acc - (t.Nominal || 0), 0)
  const totalIn = transactions.filter(t => t.Tipe === 'pemasukan').reduce((a, t) => a + (t.Nominal || 0), 0)
  const totalOut = transactions.filter(t => t.Tipe === 'pengeluaran').reduce((a, t) => a + (t.Nominal || 0), 0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await fetchWithAuth(`${API}/kas?ormawaId=${ormawaId}`)
      if (data.status === 'success') {
        setTransactions(data.data || [])
      } else {
        toast.error('Gagal memuat data keuangan')
      }
    } catch (err) {
      toast.error('Koneksi database backend gagal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const payload = { 
      ...form, 
      Nominal: Number(form.Nominal), 
      OrmawaID: Number(form.OrmawaID), 
      Tanggal: form.Tanggal ? new Date(form.Tanggal).toISOString() : new Date().toISOString() 
    }

    try {
      const data = await fetchWithAuth(`${API}/kas`, { 
        method: 'POST', 
        body: JSON.stringify(payload), 
        headers: { 'Content-Type': 'application/json' } 
      })
      if (data.status === 'success') {
        toast.success('Transaksi keuangan berhasil dicatat!')
        setIsCrudOpen(false)
        fetchData()
      } else {
        toast.error(data.message || 'Gagal menyimpan transaksi')
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
      const data = await fetchWithAuth(`${API}/kas/${selected?.id || selected?.ID}`, { 
        method: 'DELETE' 
      })
      if (data.status === 'success') {
        toast.success('Transaksi berhasil dihapus dari sistem')
        setIsDelOpen(false)
        fetchData()
      } else {
        toast.error('Gagal menghapus transaksi')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi backend')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'Tanggal', 
      label: 'Tanggal', 
      className: 'w-[150px]',
      render: v => (
        <span className="font-bold text-slate-500 text-[11px] font-headline">
          {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      )
    },
    {
      key: 'Deskripsi', 
      label: 'Keterangan Transaksi', 
      className: 'min-w-[280px]',
      render: v => (
        <span className="font-bold text-slate-900 text-[13px] font-headline leading-tight">
          {v || '—'}
        </span>
      )
    },
    {
      key: 'Tipe', 
      label: 'Jenis Mutasi', 
      className: 'w-[140px] text-center', 
      cellClassName: 'text-center',
      render: v => {
        const isIncome = v === 'pemasukan'
        return (
          <Badge className={cn(
            'font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 border rounded-full',
            isIncome 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          )}>
            {isIncome ? '▲ Masuk' : '▼ Keluar'}
          </Badge>
        )
      }
    },
    {
      key: 'Nominal', 
      label: 'Jumlah Nominal', 
      className: 'w-[200px] text-right', 
      cellClassName: 'text-right',
      render: (v, row) => {
        const isIncome = row.Tipe === 'pemasukan'
        return (
          <span className={cn(
            'font-black text-[13px] font-headline tracking-tight', 
            isIncome ? 'text-emerald-600' : 'text-rose-600'
          )}>
            {isIncome ? '+ ' : '- '}{formatRp(v)}
          </span>
        )
      }
    }
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#00236F] to-[#1e3a8a] text-white p-8 md:p-10 shadow-xl shadow-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-blue-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">Modul Keuangan</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>account_balance_wallet</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline">Buku Kas & Keuangan</h1>
                <p className="text-blue-100/80 text-sm font-medium mt-1">Pantau dan kelola seluruh pemasukan serta pengeluaran kas ormawa secara akuntabel.</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => { 
              setForm({ Deskripsi: '', Nominal: '', Tipe: 'pemasukan', Tanggal: '', OrmawaID: ormawaId })
              setIsCrudOpen(true) 
            }} 
            className="h-12 px-6 rounded-2xl bg-white hover:bg-white/95 text-[#00236F] hover:text-[#00236F] border-none font-bold text-xs tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_box</span>
            <span>CATAT TRANSAKSI</span>
          </Button>
        </div>
      </section>

      {/* ── Financial Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Saldo Kas (Navy tailored) */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#00236F] shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>monetization_on</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Saldo Kas Aktif</p>
              <p className="text-2xl lg:text-3xl font-black text-[#00236F] tracking-tight font-headline">
                {formatRp(saldo)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Pemasukan (Green tailored) */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>trending_up</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Pemasukan</p>
              <p className="text-2xl lg:text-3xl font-black text-emerald-600 tracking-tight font-headline">
                {formatRp(totalIn)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Pengeluaran (Rose tailored) */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>trending_down</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase font-headline">Total Pengeluaran</p>
              <p className="text-2xl lg:text-3xl font-black text-rose-600 tracking-tight font-headline">
                {formatRp(totalOut)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Transaction Table Card ──────────────────────────────────── */}
      <Card className="border border-slate-200/50 shadow-sm rounded-[2rem] overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns} 
            data={transactions} 
            loading={loading}
            searchPlaceholder="Cari berdasarkan keterangan transaksi..."
            onAdd={() => { 
              setForm({ Deskripsi: '', Nominal: '', Tipe: 'pemasukan', Tanggal: '', OrmawaID: ormawaId })
              setIsCrudOpen(true) 
            }}
            addLabel="Catat Transaksi"
            filters={[
              { 
                key: 'Tipe', 
                placeholder: 'Filter Mutasi', 
                options: [
                  { label: 'Pemasukan', value: 'pemasukan' }, 
                  { label: 'Pengeluaran', value: 'pengeluaran' }
                ] 
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => { 
                    setSelected(row)
                    setIsDelOpen(true) 
                  }} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl active:scale-95 transition-all"
                  title="Hapus Transaksi"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* ── CRUD Dialog Form ────────────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-[#00236F]">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>payments</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-[#00236F]/5 text-[#00236F] border-none rounded-md">MUTASI KAS</Badge>
              </div>
              <DialogTitle className="text-xl font-black font-headline tracking-tighter text-slate-900">Catat Transaksi Baru</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400 mt-1">Dokumentasikan arus masuk atau keluar kas dengan akurat.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-5">
            {/* Keterangan */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Keterangan Transaksi</Label>
              <Input 
                required 
                value={form.Deskripsi} 
                onChange={e => setForm({ ...form, Deskripsi: e.target.value })} 
                placeholder="Misal: Pembayaran konsumsi rapat kerja..."
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm" 
              />
            </div>

            {/* Tipe & Nominal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Jenis Mutasi</Label>
                <select 
                  value={form.Tipe} 
                  onChange={e => setForm({ ...form, Tipe: e.target.value })}
                  className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-primary transition-all shadow-sm"
                >
                  <option value="pemasukan">▲ Pemasukan (Masuk)</option>
                  <option value="pengeluaran">▼ Pengeluaran (Keluar)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Jumlah Nominal</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                  <Input 
                    required 
                    type="number" 
                    value={form.Nominal} 
                    onChange={e => setForm({ ...form, Nominal: e.target.value })} 
                    placeholder="0"
                    className="h-12 pl-10 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm" 
                  />
                </div>
                
                {/* 🌟 Dynamic dots and separator helper preview for large zeros! */}
                {form.Nominal && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '14px' }}>payments</span>
                    Format: <span className="underline decoration-dotted font-black tracking-tight">{formatRp(Number(form.Nominal))}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Tanggal Transaksi */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Tanggal Transaksi</Label>
              <Input 
                required 
                type="date" 
                value={form.Tanggal} 
                onChange={e => setForm({ ...form, Tanggal: e.target.value })}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm" 
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
                className="w-full md:w-auto h-12 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '16px' }}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>
                )}
                <span className="text-[10px] font-black tracking-widest uppercase">SIMPAN MUTASI</span>
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
        title="Hapus Transaksi?" 
        description="Apakah Anda yakin ingin menghapus data transaksi ini dari sistem? Tindakan ini bersifat permanen." 
        loading={isSubmitting} 
      />
    </div>
  )
}
