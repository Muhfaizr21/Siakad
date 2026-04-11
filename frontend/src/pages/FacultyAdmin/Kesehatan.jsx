"use client"

import React, { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { toast, Toaster } from 'react-hot-toast'
import { cn } from "@/lib/utils"
import { HeartPulse, Activity, AlertCircle, RefreshCw, FileText, Eye, User, Thermometer, Droplet, Scaling, Clock, GraduationCap, ShieldCheck, X } from 'lucide-react'

import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function FacultyKesehatan() {
  const [loading, setLoading] = useState(true)
  const [healthRecords, setHealthRecords] = useState([])
  const [statsData, setStatsData] = useState({
    total: 0,
    distribution: {},
    condition: { prima: 0, pantauan: 0 }
  })
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [progRes, summaryRes] = await Promise.all([
        api.get('/faculty/health-screening'),
        api.get('/faculty/health-screening/summary')
      ])

      if (progRes.data.status === 'success') {
        setHealthRecords(progRes.data.data || [])
      }
      if (summaryRes.data.status === 'success') {
        setStatsData(summaryRes.data.data || { total: 0, distribution: {}, condition: { prima: 0, pantauan: 0 } })
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
    { label: 'Total Screening', value: (statsData.total || 0).toLocaleString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Kondisi Prima', value: (statsData.condition?.prima || 0).toLocaleString(), icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Dalam Pantauan', value: (statsData.condition?.pantauan || 0).toLocaleString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ]

  const columns = [
    {
      key: "Mahasiswa",
      label: "Mahasiswa",
      render: (m) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 font-headline tracking-tighter text-[13px] uppercase">{m?.Nama || 'Mahasiswa'}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{m?.NIM || '-'}</span>
        </div>
      )
    },
    {
      key: "ProgramStudi",
      label: "Prodi",
      render: (_, record) => <span className="text-[10px] font-bold text-slate-500 uppercase">{record.Mahasiswa?.ProgramStudi?.Nama || '-'}</span>
    },
    {
      key: "Tanggal",
      label: "Tgl Periksa",
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 font-headline text-xs">{new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      key: "StatusKesehatan",
      label: "Status",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline uppercase tracking-wider",
            val === 'prima' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              val === 'stabil' ? "bg-blue-100 text-blue-700 ring-1 ring-blue-500/20" :
                val === 'pantauan' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
                  "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20"
          )}
        >
          {val || '—'}
        </Badge>
      )
    },
    {
      key: "GolonganDarah",
      label: "Gol. Darah",
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-rose-50 flex items-center justify-center text-[10px] font-black text-rose-600 border border-rose-100 uppercase">
            {value || '-'}
          </div>
        </div>
      )
    },
    {
      key: "ID",
      label: "Aksi",
      className: "text-right",
      cellClassName: "text-right",
      render: (_, record) => (
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-xl border-slate-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group shadow-sm bg-white"
          onClick={() => { setSelectedRecord(record); setIsDetailOpen(true); }}
        >
          <Eye className="size-3.5 transition-transform group-hover:scale-110" />
          Detail
        </Button>
      )
    }
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={HeartPulse}
        title="Pantau Kesehatan"
        description="Medical Monitoring & Student Screening System"
      />

      <ResponsiveGrid cols={3}>
        {stats.map((stat, i) => (
          <ResponsiveCard key={i} className="relative group p-0">
             <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
             <div className="p-7 relative">
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-sm group-hover:rotate-12 transition-transform duration-500`}>
                    <stat.icon className="size-6" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                    <Activity className="size-3" />
                    Live Feed
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-slate-900 font-headline tracking-tighter leading-none">
                      {loading ? "..." : stat.value}
                    </h3>
                  </div>
                </div>
             </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding>
          <DataTable
            columns={columns}
            data={healthRecords}
            loading={loading}
            onSync={fetchData}
            onExport={() => alert("Ekspor Laporan Kesehatan...")}
            exportLabel="Ekspor Rekap"
            filters={[
              {
                key: 'StatusKesehatan',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Prima', value: 'prima' },
                  { label: 'Stabil', value: 'stabil' },
                  { label: 'Pantauan', value: 'pantauan' },
                ]
              }
            ]}
          />
      </ResponsiveCard>
      {/* DETAIL MODAL (custom fixed overlay) */}
      {isDetailOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#e5e5e5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center text-[#16a34a]">
                  <HeartPulse size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#171717]">Detail Kesehatan</h2>
                  <p className="text-xs text-[#a3a3a3] font-medium">{selectedRecord.Mahasiswa?.Nama} · {selectedRecord.Mahasiswa?.NIM}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-[#a3a3a3] hover:text-[#171717] transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">

              {/* Vital Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f4f8ff] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-3">Data Fisik</p>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-[#e5e5e5]">
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Tinggi Badan</td>
                        <td className="py-2 font-bold text-[#171717] text-right">{parseFloat(selectedRecord.TinggiBadan || 0).toFixed(1)} cm</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Berat Badan</td>
                        <td className="py-2 font-bold text-[#171717] text-right">{parseFloat(selectedRecord.BeratBadan || 0).toFixed(1)} kg</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">BMI</td>
                        <td className="py-2 font-bold text-right">
                          <span className={`${selectedRecord.TinggiBadan > 0 && (selectedRecord.BeratBadan / Math.pow(selectedRecord.TinggiBadan/100,2)) >= 25 ? 'text-[#dc2626]' : 'text-[#171717]'}`}>
                            {selectedRecord.TinggiBadan > 0 ? (selectedRecord.BeratBadan / Math.pow(selectedRecord.TinggiBadan/100,2)).toFixed(1) : '0.0'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Tensi</td>
                        <td className="py-2 font-bold text-[#171717] text-right">{selectedRecord.Sistole || 0}/{selectedRecord.Diastole || 0} mmHg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#f4f8ff] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-3">Data Mahasiswa</p>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-[#e5e5e5]">
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Program Studi</td>
                        <td className="py-2 font-bold text-[#171717] text-right text-[11px]">{selectedRecord.Mahasiswa?.ProgramStudi?.Nama || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Gol. Darah</td>
                        <td className="py-2 font-bold text-[#171717] text-right">{selectedRecord.GolonganDarah || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Status</td>
                        <td className="py-2 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            selectedRecord.StatusKesehatan === 'prima' ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' :
                            selectedRecord.StatusKesehatan === 'pantauan' ? 'bg-[#fff7ed] text-[#ea580c] border-[#fed7aa]' :
                            'bg-[#eef4ff] text-[#00236F] border-[#c9d8ff]'
                          }`}>{selectedRecord.StatusKesehatan || '-'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold text-[#a3a3a3]">Tgl Periksa</td>
                        <td className="py-2 font-bold text-[#171717] text-right">{selectedRecord.Tanggal ? new Date(selectedRecord.Tanggal).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}) : '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Catatan */}
              {selectedRecord.Catatan && (
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#92400e] uppercase tracking-wider mb-2">Catatan Medis</p>
                  <p className="text-sm text-[#78350f] leading-relaxed">{selectedRecord.Catatan}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#e5e5e5] flex items-center justify-between bg-[#fafafa] rounded-b-2xl">
              <div className="flex items-center gap-2 text-xs text-[#a3a3a3] font-semibold">
                <ShieldCheck size={14} className="text-[#16a34a]" />
                <span>Institution Verified Record</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl font-bold text-sm border border-[#e5e5e5] text-[#525252] hover:bg-[#f5f5f5] transition-colors">
                  Cetak
                </button>
                <button onClick={() => setIsDetailOpen(false)}
                  className="px-5 py-2 rounded-xl font-bold text-sm bg-[#00236F] text-white hover:bg-[#0B4FAE] transition-colors">
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </PageContainer>
  )
}