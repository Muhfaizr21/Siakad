"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { PageContent, PageHeader } from '@/components/ui/page';
import { DataTable } from '@/components/ui/DataTable'



import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { SelectField, SelectOption } from '@/components/ui/SelectField'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

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

  const ormawaId = getOrmawaId()

  const [sortConfig, setSortConfig] = useState({ key: 'Tanggal', direction: 'desc' })
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const [form, setForm] = useState({
    Deskripsi: '',
    Nominal: '',
    Tipe: 'pemasukan',
    Tanggal: '',
    OrmawaID: ormawaId,
    Sumber: 'organisasi',
    Kategori: ''
  })

  // Filters
  const [filterSumber, setFilterSumber] = useState('all')
  const [filterTipe, setFilterTipe] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterSumber !== 'all' && (t.Sumber || t.sumber || 'organisasi') !== filterSumber) return false
      if (filterTipe !== 'all' && (t.Tipe || '').toLowerCase() !== filterTipe) return false
      if (startDate && t.Tanggal && new Date(t.Tanggal) < new Date(startDate)) return false
      if (endDate && t.Tanggal) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(t.Tanggal) > end) return false
      }
      return true
    })
  }, [transactions, filterSumber, filterTipe, startDate, endDate])

  // Calculate totals from filtered
  const saldo = transactions.reduce((acc, t) => t.Tipe === 'pemasukan' ? acc + (t.Nominal || 0) : acc - (t.Nominal || 0), 0)
  const totalIn = transactions.filter(t => t.Tipe === 'pemasukan').reduce((a, t) => a + (t.Nominal || 0), 0)
  const totalOut = transactions.filter(t => t.Tipe === 'pengeluaran').reduce((a, t) => a + (t.Nominal || 0), 0)

  // Filtered totals for display
  const filteredIn = filteredTransactions.filter(t => t.Tipe === 'pemasukan').reduce((a, t) => a + (t.Nominal || 0), 0)
  const filteredOut = filteredTransactions.filter(t => t.Tipe === 'pengeluaran').reduce((a, t) => a + (t.Nominal || 0), 0)
  const filteredBalance = filteredIn - filteredOut

  // Isolated Campus vs Organisasi calculations
  const campusIn = transactions.filter(t => t.Tipe === 'pemasukan' && (t.Sumber === 'kampus' || t.sumber === 'kampus')).reduce((a, t) => a + (t.Nominal || 0), 0)
  const campusOut = transactions.filter(t => t.Tipe === 'pengeluaran' && (t.Sumber === 'kampus' || t.sumber === 'kampus')).reduce((a, t) => a + (t.Nominal || 0), 0)
  const campusSaldo = campusIn - campusOut

  const orgIn = transactions.filter(t => t.Tipe === 'pemasukan' && (t.Sumber === 'organisasi' || t.sumber === 'organisasi' || !t.sumber)).reduce((a, t) => a + (t.Nominal || 0), 0)
  const orgOut = transactions.filter(t => t.Tipe === 'pengeluaran' && (t.Sumber === 'organisasi' || t.sumber === 'organisasi' || !t.sumber)).reduce((a, t) => a + (t.Nominal || 0), 0)
  const orgSaldo = orgIn - orgOut

  const sortedTransactions = useMemo(() => {
    const items = [...filteredTransactions]
    items.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]
      if (sortConfig.key === 'Nominal') {
        aVal = Number(a.Nominal || 0)
        bVal = Number(b.Nominal || 0)
      } else if (sortConfig.key === 'Tanggal') {
        aVal = a.Tanggal ? new Date(a.Tanggal).getTime() : 0
        bVal = b.Tanggal ? new Date(b.Tanggal).getTime() : 0
      } else {
        aVal = String(aVal || '').toLowerCase()
        bVal = String(bVal || '').toLowerCase()
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return items
  }, [filteredTransactions, sortConfig])

  // Chart data
  const tipeDistData = useMemo(() => [
    { name: 'Pemasukan', value: totalIn },
    { name: 'Pengeluaran', value: totalOut }
  ].filter(d => d.value > 0), [totalIn, totalOut])

  const sumberDistData = useMemo(() => [
    { name: 'Pagu Kampus', value: campusIn + campusOut },
    { name: 'Kas Mandiri', value: orgIn + orgOut }
  ].filter(d => d.value > 0), [campusIn, campusOut, orgIn, orgOut])

  const monthlyTrendData = useMemo(() => {
    const byMonth = {}
    transactions.forEach(t => {
      const d = t.Tanggal
      if (!d) return
      const date = new Date(d)
      if (isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
      if (!byMonth[key]) byMonth[key] = { pemasukan: 0, pengeluaran: 0 }
      if (t.Tipe === 'pemasukan') byMonth[key].pemasukan += t.Nominal || 0
      else byMonth[key].pengeluaran += t.Nominal || 0
    })
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    return Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).map(([m, v]) => {
      const [y, mo] = m.split('-')
      return { month: `${months[parseInt(mo)-1]} ${y}`, pemasukan: v.pemasukan, pengeluaran: v.pengeluaran }
    })
  }, [transactions])

  const prokerSpendData = useMemo(() => {
    const byProker = {}
    transactions.filter(t => t.Tipe === 'pengeluaran').forEach(t => {
      const proker = t.Kategori || t.kategori || t.Deskripsi || 'Tanpa Kategori'
      byProker[proker] = (byProker[proker] || 0) + (t.Nominal || 0)
    })
    return Object.entries(byProker).sort(([,a],[,b]) => b - a).slice(0, 8).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const PIE_COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6']

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
  }, [ormawaId])

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      ...form,
      Nominal: Number(form.Nominal),
      OrmawaID: Number(form.OrmawaID),
      Sumber: form.Sumber || 'organisasi',
      Kategori: form.Kategori || form.Deskripsi,
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
      sortable: true,
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
      sortable: true,
      className: 'min-w-[280px]',
      render: (v, row) => {
        const isCampus = row.Sumber === 'kampus' || row.sumber === 'kampus'
        return (
          <div className="flex flex-col gap-1.5 py-1">
            <span className="font-bold text-slate-900 text-[13px] font-headline leading-tight">
              {v || '—'}
            </span>
            <div className="flex items-center">
              <span className={cn(
                "text-[8.5px] font-black tracking-widest px-2.5 py-0.5 rounded-md border",
                isCampus
                  ? "bg-blue-50 text-blue-600 border-blue-100/50"
                  : "bg-slate-50 text-slate-500 border-border"
              )}>
                {isCampus ? "🏛️ PAGU KAMPUS" : "💼 KAS MANDIRI"}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'Tipe',
      label: 'Jenis Mutasi',
      sortable: true,
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
      sortable: true,
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
    <PageContent className="font-body">
      <Toaster position="top-right" />

            {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <PageHeader 
        title="Buku Kas & Keuangan"
        subtitle="Pantau dan kelola seluruh pemasukan serta pengeluaran kas ormawa secara akuntabel."
        icon="account_balance_wallet"
        action={
          <Button
            onClick={() => {
              setForm({ Deskripsi: '', Nominal: '', Tipe: 'pemasukan', Tanggal: '', OrmawaID: ormawaId, Sumber: 'organisasi' })
              setIsCrudOpen(true)
            }}
            className="h-10 px-5 rounded-xl text-white font-bold text-xs tracking-wider shadow-lg transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_box</span>
            <span>CATAT TRANSAKSI</span>
          </Button>
        }
       
        breadcrumbs={[ { label: 'Dashboard', path: '/ormawa' }, { label: 'Buku Kas & Keuangan', path: '#' } ]} 
      />

      {/* ── Financial Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Saldo Kas Gabungan */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)] shrink-0 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>account_balance</span>
            </div>
            <div className="space-y-1 w-full min-w-0">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Saldo Kas Gabungan</p>
              <p className="text-2xl lg:text-3xl font-black text-[var(--theme-primary)] tracking-tight font-headline truncate">
                {formatRp(saldo)}
              </p>
              <p className="text-[9px] font-bold text-[var(--theme-text-muted)] truncate">
                Pemasukan: {formatRp(totalIn)} | Pengeluaran: {formatRp(totalOut)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Pagu Kampus (🏛️ Duit Kampus) */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>assured_workload</span>
            </div>
            <div className="space-y-1 w-full min-w-0">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Sisa Pagu (Duit Kampus)</p>
              <p className="text-2xl lg:text-3xl font-black text-sky-600 tracking-tight font-headline truncate">
                {formatRp(campusSaldo)}
              </p>
              <p className="text-[9px] font-bold text-sky-500 truncate">
                Hibah Masuk: {formatRp(campusIn)} | Penggunaan LPJ: {formatRp(campusOut)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Saldo Kas Organisasi (💼 Kas Mandiri) */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>payments</span>
            </div>
            <div className="space-y-1 w-full min-w-0">
              <p className="text-[10px] font-black text-[var(--theme-text-muted)] tracking-wider uppercase font-headline">Kas Mandiri Organisasi</p>
              <p className="text-2xl lg:text-3xl font-black text-emerald-600 tracking-tight font-headline truncate">
                {formatRp(orgSaldo)}
              </p>
              <p className="text-[9px] font-bold text-emerald-500 truncate">
                Iuran/Sponsor: {formatRp(orgIn)} | Pengeluaran Mandiri: {formatRp(orgOut)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter Bar ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <span className="text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest mr-1">Filter</span>
        <SelectField value={filterTipe} onValueChange={setFilterTipe}>
          <SelectOption value="all">Semua Mutasi</SelectOption>
          <SelectOption value="pemasukan">▲ Pemasukan</SelectOption>
          <SelectOption value="pengeluaran">▼ Pengeluaran</SelectOption>
        </SelectField>
        <SelectField value={filterSumber} onValueChange={setFilterSumber}>
          <SelectOption value="all">Semua Sumber</SelectOption>
          <SelectOption value="kampus">🏛️ Pagu Kampus</SelectOption>
          <SelectOption value="organisasi">💼 Kas Mandiri</SelectOption>
        </SelectField>
        <div className="h-6 w-px bg-slate-200" />
        <span className="text-[10px] font-bold text-slate-400">Dari</span>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="h-9 px-3 rounded-xl border border-border text-xs font-bold bg-white focus:outline-none focus:border-primary" />
        <span className="text-[10px] font-bold text-slate-400">Sampai</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="h-9 px-3 rounded-xl border border-border text-xs font-bold bg-white focus:outline-none focus:border-primary" />
        {(filterTipe !== 'all' || filterSumber !== 'all' || startDate || endDate) && (
          <button onClick={() => { setFilterTipe('all'); setFilterSumber('all'); setStartDate(''); setEndDate('') }}
            className="h-9 px-4 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl border border-rose-200 hover:bg-rose-100">
            Reset
          </button>
        )}
        <div className="ml-auto text-[10px] font-bold text-slate-500">
          {filteredTransactions.length} / {transactions.length} transaksi
        </div>
      </div>

      {/* ── 5W1H Charts ─────────────────────────────────────────────── */}
      {!loading && (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* WHAT → Distribusi Tipe */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribusi Mutasi</h3>
                <p className="text-[9px] text-slate-400">Rasio pemasukan vs pengeluaran</p>
              </div>
            </div>
            <div className="h-[160px] w-full flex items-center justify-center">
              {tipeDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={tipeDistData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                      {tipeDistData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatRp(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
            </div>
            <div className="flex justify-center gap-3 mt-1">
              {tipeDistData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[10px] font-bold text-slate-500">{item.name}: {formatRp(item.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WHERE → Sumber Dana */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance</span>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sumber Dana</h3>
                <p className="text-[9px] text-slate-400">Pagu Kampus vs Kas Mandiri</p>
              </div>
            </div>
            <div className="h-[160px] w-full flex items-center justify-center">
              {sumberDistData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={sumberDistData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                      {sumberDistData.map((_, i) => <Cell key={i} fill={['#3b82f6', '#10b981'][i % 2]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatRp(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <span className="text-xs text-slate-400 italic">Tidak ada data</span>}
            </div>
            <div className="flex justify-center gap-3 mt-1">
              {sumberDistData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981'][i % 2] }} />
                  <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WHEN → Trend Bulanan */}
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend Bulanan</h3>
                <p className="text-[9px] text-slate-400">Pemasukan & pengeluaran per bulan</p>
              </div>
            </div>
            <div className="h-[160px] w-full">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => formatRp(v)} />
                    <Line type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-full flex items-center justify-center"><span className="text-xs text-slate-400 italic">Tidak ada data</span></div>}
            </div>
          </div>
        </div>
        {/* HOW → Pengeluaran per Proker (full width) */}
        {!loading && prokerSpendData.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengeluaran per Proker</h3>
                <p className="text-[9px] text-slate-400">Program kerja dengan pengeluaran terbesar</p>
              </div>
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={prokerSpendData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 8.5, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip formatter={(v) => formatRp(v)} />
                  <Bar dataKey="value" name="Pengeluaran" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </>
      )}

      {/* ── Transaction Table Card ──────────────────────────────────── */}
      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-[var(--theme-surface)]/70 backdrop-blur-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={sortedTransactions}
            loading={loading}
            sortConfig={sortConfig}
            onSort={handleSort}
            searchPlaceholder="Cari berdasarkan keterangan transaksi..."
            onAdd={() => {
              setForm({ Deskripsi: '', Nominal: '', Tipe: 'pemasukan', Tanggal: '', OrmawaID: ormawaId, Sumber: 'organisasi' })
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
        <DialogContent className="max-w-lg p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-surface animate-in zoom-in-95 duration-200">
          <DialogHeader className="p-8 pb-6 bg-[var(--theme-bg)] border-b border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-[var(--theme-primary)]">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-[var(--theme-primary-light)] flex items-center justify-center text-[var(--theme-primary)]">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>payments</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] border-none rounded-md">MUTASI KAS</Badge>
              </div>
              <DialogTitle className="text-xl font-black font-headline tracking-tighter text-[var(--theme-text)]">Catat Transaksi Baru</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-[var(--theme-text-muted)] mt-1">Dokumentasikan arus masuk atau keluar kas dengan akurat.</DialogDescription>
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
                placeholder="Misal: Pembelian ATK / Sponsor Kegiatan"
                className="h-12 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
              />
            </div>

            {/* Kategori / Proker */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Kategori / Program Kerja</Label>
              <Input
                value={form.Kategori}
                onChange={e => setForm({ ...form, Kategori: e.target.value })}
                placeholder="Misal: PKKMB, Seminar, Lapangan, dll"
                className="h-12 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
              />
            </div>

            {/* Tipe & Sumber Dana Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Jenis Mutasi</Label>
                <SelectField
                  value={form.Tipe}
                  onValueChange={val => setForm({ ...form, Tipe: val })}
                >
                  <SelectOption value="pemasukan">▲ Pemasukan (Masuk)</SelectOption>
                  <SelectOption value="pengeluaran">▼ Pengeluaran (Keluar)</SelectOption>
                </SelectField>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Sumber Dana</Label>
                <SelectField
                  value={form.Sumber}
                  onValueChange={val => setForm({ ...form, Sumber: val })}
                >
                  <SelectOption value="organisasi">💼 Kas Mandiri Organisasi</SelectOption>
                  <SelectOption value="kampus">🏛️ Pagu Kampus (Duit Kampus)</SelectOption>
                </SelectField>
              </div>
            </div>

            {/* Nominal & Tanggal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="h-12 pl-10 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
                  />
                </div>

                {form.Nominal && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="material-symbols-outlined text-emerald-500" style={{ fontSize: '14px' }}>payments</span>
                    Format: <span className="underline decoration-dotted font-black tracking-tight">{formatRp(Number(form.Nominal))}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Tanggal Transaksi</Label>
                <Input
                  required
                  type="date"
                  value={form.Tanggal}
                  onChange={e => setForm({ ...form, Tanggal: e.target.value })}
                  className="h-12 rounded-2xl border-border bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-sm"
                />
              </div>
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
    </PageContent>
  )
}
