"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Users, CheckCircle, Clock, Activity } from 'lucide-react'
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

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
      const response = await fetch('http://localhost:8000/api/faculty/ringkasan')
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
      const response = await fetch('http://localhost:8000/api/faculty/peserta')
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
          <span className="font-black text-slate-800 font-headline tracking-tighter uppercase text-[13px] leading-tight">{value}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Sertifikasi Internal</span>
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
          <span className="font-black text-slate-700 font-headline text-[13px] tracking-tighter uppercase">{Math.round(value)}%</span>
          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${value}%` }} />
          </div>
        </div>
      )
    },
    {
      key: "nilai",
      label: "Rata Nilai",
      className: "text-center",
      cellClassName: "text-center font-black text-slate-600 font-headline text-sm tracking-tighter uppercase",
      render: (value) => value.toFixed(1)
    },
    {
      key: "status",
      label: "Status",
      className: "text-right",
      cellClassName: "text-right",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase tracking-widest",
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
      key: "Mahasiswa",
      label: "Mahasiswa",
      render: (v) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 font-headline tracking-tighter text-[13px] uppercase">{v?.Nama}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{v?.NIM}</span>
        </div>
      )
    },
    {
      key: "MahasiswaProdi",
      label: "Prodi",
      render: (_, row) => <span className="text-[10px] font-bold text-slate-500 uppercase">{row.Mahasiswa?.ProgramStudi?.Nama || '-'}</span>
    },
    {
      key: "attendanceRate",
      label: "Kehadiran",
      className: "text-center",
      cellClassName: "text-center font-black text-slate-700 font-headline text-xs",
      render: (v) => `${v || 0}%`
    },
    {
      key: "Nilai",
      label: "Nilai",
      className: "text-center",
      cellClassName: "text-center font-black text-primary font-headline text-xs",
      render: (v) => v || 0
    },
    {
      key: "StatusKelulusan",
      label: "Status Akhir",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase tracking-widest",
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
    <PageContainer>
      <PageHeader
        icon={Users}
        title="Monitoring PKKMB"
        description="Portal Orientasi & Kelulusan Mahasiswa Baru"
      />

      <ResponsiveGrid cols={3}>
        {stats.map((stat, i) => (
          <ResponsiveCard key={i} className="relative group p-0 min-h-[140px]">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <div className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="size-5" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                  <Activity className="size-2.5" />
                  Live
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <div className="flex p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm w-fit gap-1 my-6 overflow-x-auto no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab('prodi')}
          className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === 'prodi' ? 'bg-primary text-white shadow-xl shadow-primary/25' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          Breakdown Prodi
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === 'students' ? 'bg-primary text-white shadow-xl shadow-primary/25' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          Detail Peserta
        </button>
      </div>

      <ResponsiveCard noPadding>
        <DataTable
          columns={activeTab === 'prodi' ? prodiColumns : studentColumns}
          data={activeTab === 'prodi' ? data : students}
          loading={loading}
          onSync={() => { fetchSummary(); fetchStudents(); }}
          onExport={() => alert("Ekspor Data PKKMB...")}
          exportLabel="Ekspor Rekap"
          filters={activeTab === 'prodi' ? [] : [
            {
              key: 'StatusKelulusan',
              placeholder: 'Filter Status',
              options: [
                { label: 'Lulus', value: 'Lulus' },
                { label: 'Proses', value: 'Proses' },
                { label: 'Gagal', value: 'Gagal' },
              ]
            }
          ]}
        />
      </ResponsiveCard>

    </PageContainer>
  )
}
