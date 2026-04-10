"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Users, CheckCircle, Clock, FileText, Search, TrendingUp, Activity } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function FacultyPkkmb() {
  const [activeTab, setActiveTab] = useState('prodi') // 'prodi' or 'students'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState({
    totalMaba: 0,
    totalLulus: 0,
    totalProses: 0
  })

  useEffect(() => {
    fetchSummary()
    fetchStudents()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/pkkmb/ringkasan')
      const result = await response.json()
      if (result.status === 'success') {
        setData(result.prodiBreakdown)
        setSummary(result.stats)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pkkmb/peserta')
      const result = await response.json()
      if (result.status === 'success') {
        setStudents(result.data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Registrasi Maba', value: summary.totalMaba.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Sertifikasi Lulus', value: summary.totalLulus.toLocaleString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Dalam Proses', value: summary.totalProses.toLocaleString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ]

  const prodiColumns = [
    {
      key: "prodi",
      label: "Program Studi",
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 font-headline tracking-tight">{value}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Fakultas Terdaftar</span>
        </div>
      )
    },
    {
      key: "partisipasi",
      label: "Partisipasi",
      className: "text-center",
      cellClassName: "text-center",
      render: (value) => (
        <div className="flex flex-col items-center">
          <span className="font-black text-slate-700 font-headline text-sm tracking-tight">{Math.round(value)}%</span>
          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${value}%` }} />
          </div>
        </div>
      )
    },
    {
      key: "nilai",
      label: "Rata-rata Nilai",
      className: "text-center",
      cellClassName: "text-center",
      render: (value) => <span className="font-black text-slate-600 font-headline text-sm tracking-tight">{value.toFixed(1)}</span>
    },
    {
      key: "status",
      label: "Status Kinerja",
      className: "text-right",
      cellClassName: "text-right",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            val === 'Optimal' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20"
          )}
        >
          {val}
        </Badge>
      )
    }
  ]

  const studentColumns = [
    {
      key: "student",
      label: "Mahasiswa",
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{v?.name}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{v?.nim}</span>
        </div>
      )
    },
    {
      key: "student",
      label: "Prodi",
      render: (v) => <span className="text-[10px] font-bold text-slate-500 uppercase">{v?.major?.name || '-'}</span>
    },
    {
      key: "attendanceRate",
      label: "Kehadiran",
      className: "text-center",
      cellClassName: "text-center",
      render: (v) => <span className="font-black text-slate-700 font-headline text-xs">{v || 0}%</span>
    },
    {
      key: "averageScore",
      label: "Nilai",
      className: "text-center",
      cellClassName: "text-center",
      render: (v) => <span className="font-black text-primary font-headline text-xs">{v || 0}</span>
    },
    {
      key: "status",
      label: "Status Akhir",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            val === 'Lulus' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              val === 'Gagal' ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" :
                "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20"
          )}
        >
          {val}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5 mb-8 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Users className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Monitoring PKKMB</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Orientasi & Kelulusan Mahasiswa Baru</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 rounded-2xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="size-5" />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                    <Activity className="size-2.5" />
                    Live
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-slate-400/80 uppercase tracking-tight">Capaian PKKMB 2024</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm w-fit gap-1 mb-4">
        <button
          onClick={() => setActiveTab('prodi')}
          className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'prodi' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          Breakdown Prodi
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'students' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          Detail Peserta
        </button>
      </div>

      <Card className="border border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md rounded-2xl">
        <CardContent className="p-0 font-headline">
          <DataTable
            columns={activeTab === 'prodi' ? prodiColumns : studentColumns}
            data={activeTab === 'prodi' ? data : students}
            loading={loading}
            onSync={() => { fetchSummary(); fetchStudents(); }}
            onExport={() => alert("Ekspor Data PKKMB...")}
            exportLabel="Ekspor Rekap"
            filters={activeTab === 'prodi' ? [] : [
              {
                key: 'status',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Lulus', value: 'Lulus' },
                  { label: 'Proses', value: 'Proses' },
                  { label: 'Gagal', value: 'Gagal' },
                ]
              }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}
