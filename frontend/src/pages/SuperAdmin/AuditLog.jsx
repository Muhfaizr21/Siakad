"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { ShieldCheck, Download } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Sidebar from './components/Sidebar'
import TopNavBar from './components/TopNavBar'
import { adminService } from '../../services/api'

const ACTION_COLORS = {
  LOGIN: 'bg-blue-100 text-blue-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-rose-100 text-rose-700',
  APPROVE: 'bg-indigo-100 text-indigo-700',
  REJECT: 'bg-rose-100 text-rose-700',
}

const getActionColor = (action = '') => {
  const k = Object.keys(ACTION_COLORS).find(k => action.toUpperCase().includes(k))
  return ACTION_COLORS[k] || 'bg-slate-100 text-slate-600'
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAuditLogs()
      if (res.status === 'success') setLogs(res.data || [])
      else toast.error('Gagal memuat audit log')
    } catch { toast.error('Koneksi gagal') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const columns = [
    { key: 'Aktivitas', label: 'Aktivitas', className: 'min-w-[220px]',
      render: v => (
        <Badge className={cn('font-black text-[10px] px-3 py-1 border-none shadow-sm uppercase', getActionColor(v))}>
          {(v || '—').replace(/_/g, ' ')}
        </Badge>
      )
    },
    { key: 'Deskripsi', label: 'Deskripsi', className: 'min-w-[300px]',
      render: v => <span className="font-bold text-slate-700 text-[12px] font-headline">{v || '—'}</span>
    },
    { key: 'AdminNama', label: 'Operator', className: 'w-[200px]',
      render: (v, row) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 text-[12px] font-headline tracking-tighter">{v || row.AdminEmail || '—'}</span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{row.IPAddress || '—'}</span>
        </div>
      )
    },
    { key: 'CreatedAt', label: 'Waktu', className: 'w-[200px]',
      render: v => (
        <span className="font-bold text-slate-400 text-[11px] font-headline">
          {v ? new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      )
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen flex font-sans">
      <Sidebar />
      <main className="pl-72 pt-20 flex flex-col min-h-screen w-full">

        <TopNavBar />
        <div className="p-8 space-y-6">
          <Toaster position="top-right" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="size-6" /></div>
                <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Audit Log Absolut</h1>
              </div>
              <Button onClick={() => alert('Ekspor log forensik...')} variant="outline" className="h-10 px-6 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 gap-2">
                <Download className="size-4" /> Ekspor Forensik
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rekaman Jejak Tindakan Administratif — Immutable Log</p>
            </div>
          </div>
          <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-0">
              <DataTable
                columns={columns} data={logs} loading={loading}
                searchPlaceholder="Cari aktivitas, operator, atau IP..."
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
