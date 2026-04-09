"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { toast, Toaster } from 'react-hot-toast'
import { cn } from "@/lib/utils"
import { HeartPulse, Activity, AlertCircle, RefreshCw, FileText } from 'lucide-react'

export default function FacultyKesehatan() {
  const [loading, setLoading] = useState(true)
  const [screeningPrograms, setScreeningPrograms] = useState([])
  const [statsData, setStatsData] = useState({
    total: 0,
    prima: 0,
    pantauan: 0
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [progRes, summaryRes] = await Promise.all([
        axios.get('http://localhost:8000/api/faculty/health-screening'),
        axios.get('http://localhost:8000/api/faculty/health-screening/summary')
      ])

      if (progRes.data.status === 'success') {
        setScreeningPrograms(progRes.data.data || [])
      }
      if (summaryRes.data.status === 'success') {
        setStatsData(summaryRes.data.data || { total: 0, distribution: {} })
      }
    } catch (error) {
      toast.error("Gagal sinkronisasi data kesehatan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = [
    { label: 'Screening Selesai', value: (statsData.total || 0).toLocaleString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Golongan Darah O', value: (statsData.distribution?.bloodO || 0).toLocaleString(), icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Golongan Darah A', value: (statsData.distribution?.bloodA || 0).toLocaleString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ]

  const columns = [
    {
      key: "tanggal_periksa",
      label: "Tanggal Periksa",
      render: (value) => (
         <div className="flex flex-col">
            <span className="font-bold text-slate-800 font-headline tracking-tight">{new Date(value).toLocaleDateString('id-ID')}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Official Record</span>
         </div>
      )
    },
    {
      key: "status_kesehatan",
      label: "Status Review",
      render: (val) => (
        <Badge 
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            val === 'prima' || val === 'sehat' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
            val === 'pantauan' || val === 'perlu_perhatian' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
            "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20"
          )}
        >
          {val?.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: "golongan_darah",
      label: "Gol. Darah",
      render: (value) => <span className="font-bold text-slate-500 font-headline text-[13px] uppercase tracking-widest">{value || '-'}</span>
    },
    {
      key: "sumber",
      label: "Sumber Data",
      className: "text-right",
      cellClassName: "text-right",
      render: (val) => (
        <Badge 
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            val === 'kencana_screening' ? "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" :
            "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {val?.replace('_', ' ')}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
        <Toaster position="top-right" />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <HeartPulse className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Status Kesehatan</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pusat Screening & Monitoring Mahasiswa</p>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
             <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
             <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="size-5" />
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                      <HeartPulse className="size-2.5" />
                      Live Status
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                   <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none">
                         {loading ? "..." : stat.value}
                      </h3>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight">Kondisi Kumulatif</p>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-2xl">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={columns}
            data={screeningPrograms}
            loading={loading}
            onSync={fetchData}
            onExport={() => alert("Ekspor Data Kesehatan...")}
            exportLabel="Download Laporan"
          />
        </CardContent>
      </Card>
    </div>
  )
}
