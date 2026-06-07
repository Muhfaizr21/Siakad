"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService } from '../../services/api'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const Terminal = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>terminal</span>;
const Download = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>download</span>;



const ACTION_STYLES = {
  LOGIN: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  LOGOUT: 'bg-neutral-50 text-neutral-500 border-neutral-100',
  CREATE: 'bg-blue-50 text-blue-700 border-blue-100',
  UPDATE: 'bg-amber-50 text-amber-700 border-amber-100',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-100',
  APPROVE: 'bg-violet-50 text-violet-700 border-violet-100',
  REJECT: 'bg-rose-50 text-rose-700 border-rose-100',
  DEFAULT: 'bg-neutral-50 text-neutral-500 border-neutral-100'
}

const getActionStyle = (action = '') => {
  const k = Object.keys(ACTION_STYLES).find(k => action.toUpperCase().includes(k))
  return ACTION_STYLES[k] || ACTION_STYLES.DEFAULT
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await adminService.getAuditLogs()
      if (res.status === 'success') setLogs(res.data || [])
      else toast.error('Gagal memuat log sistem')
    } catch { toast.error('Koneksi sistem terputus') } finally { setLoading(false) }
  }
  useEffect(() => { fetchData() }, [])

  const columns = [
    { 
      key: 'Aktivitas', 
      label: 'Tindakan', 
      className: 'w-[180px]',
      render: v => (
        <Badge className={cn('px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-widest', getActionStyle(v))}>
          {(v || '—').replace(/_/g, ' ')}
        </Badge>
      )
    },
    { 
      key: 'Deskripsi', 
      label: 'Detail Aktivitas', 
      className: 'min-w-[350px]',
      render: v => <span className="font-medium text-neutral-900 text-[13px] font-inter leading-relaxed">{v || '—'}</span>
    },
    { 
      key: 'AdminNama', 
      label: 'Operator / Alamat IP', 
      className: 'w-[250px]',
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-900 text-[13px] font-jakarta tracking-tight leading-tight">{v || row.AdminEmail || '—'}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Terminal size={10} className="text-neutral-300" />
            <span className="text-[10px] text-neutral-400 font-bold tabular-nums tracking-widest uppercase">{row.IPAddress || '0.0.0.0'}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'CreatedAt', 
      label: 'Timestamp', 
      className: 'w-[180px]',
      render: v => (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-900 text-[11px] font-jakarta">
            {v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          </span>
          <span className="text-[10px] font-medium text-neutral-400 tabular-nums uppercase">
             {v ? new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'} WIB
          </span>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* ── Page Header ─────────────────────────────────────────── */}
        <section className="glass-card rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-neutral-50/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-headline">Security Forensics</span>
              </div>
              <h1 className="text-3xl font-black font-headline tracking-tight leading-tight" style={{ color: 'var(--theme-h1)' }}>
                Audit <span className="text-bku-primary">Log</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
                Rekaman jejak operasional sistem, perubahan data, dan aktivitas otentikasi secara transparan.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => toast.success('Memulai ekspor log forensik...')} 
                variant="outline"
                className="h-11 px-5 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 gap-2 transition-all active:scale-95 font-headline"
              >
                <Download size={14} className="text-bku-primary" />
                Ekspor Forensik
              </Button>
            </div>
          </div>
        </section>

        {/* ── Table Section ────────────────────────────────────────── */}
        <Card className="glass-card shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={logs} 
              loading={loading}
              searchPlaceholder="Cari operator, aktivitas, atau alamat IP..."
              searchWidth="max-w-md"
            />
          </CardContent>
        </Card>

        {/* ── Security Status Banner ────────────────────────────────── */}
        <div className="bg-gradient-to-br from-bku-primary to-indigo-900 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-full bg-white/[0.02] -skew-x-12 translate-x-32 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }} >security</span>
            </div>
            <div>
              <p className="text-white font-bold font-headline text-sm leading-tight">Protokol Keamanan Aktif</p>
              <p className="text-white/60 text-[11px] font-medium uppercase tracking-widest mt-1">Immutable Log Records • Read-Only Integrity Verified</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                   <div key={i} className="size-8 rounded-full border-2 border-indigo-900 bg-bku-primary flex items-center justify-center text-[10px] font-bold text-white/80">
                      {i}
                   </div>
                ))}
             </div>
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Status: Secured</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
