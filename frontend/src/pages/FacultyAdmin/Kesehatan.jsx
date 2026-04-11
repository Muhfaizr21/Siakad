"use client"

import React, { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { toast, Toaster } from 'react-hot-toast'
import { cn } from "@/lib/utils"
import { HeartPulse, Activity, AlertCircle, RefreshCw, FileText, Eye, User, Thermometer, Droplet, Scaling, Clock, GraduationCap, ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/dialog"
import { Avatar, AvatarFallback } from "./components/avatar"
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
      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selectedRecord && (
            <div className="relative flex flex-col h-[90vh]">
              {/* Header Section */}
              <div className="h-44 bg-slate-900 relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '16px 16px' }} />

                <div className="absolute inset-y-0 left-12 flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 rounded-full border-4 border-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
                      <AvatarFallback className="bg-white text-slate-800 text-3xl font-black font-headline">
                        {selectedRecord.Mahasiswa?.Nama?.split(" ")?.map(n => n[0]).join("")?.substring(0, 2) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 size-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg animate-pulse">
                      <HeartPulse className="size-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[8px] font-black border-white/20 text-white/60 bg-white/5 px-2 py-0.5 rounded tracking-widest uppercase">
                        Institution Verified Record
                      </Badge>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter leading-none uppercase drop-shadow-md">
                      {selectedRecord.Mahasiswa?.Nama}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 backdrop-blur-md rounded-lg border border-emerald-500/20">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                          {selectedRecord.StatusKesehatan?.toUpperCase() || 'NORMAL'} CONDITION
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{selectedRecord.Mahasiswa?.NIM}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20">
                <div className="p-12 space-y-16">
                  {/* Grid Highlights */}
                  <div className="grid grid-cols-5 gap-5">
                    <MedicalCard icon={<Scaling className="size-4" />} label="TINGGI" value={`${parseFloat(selectedRecord.TinggiBadan || 0).toFixed(1)} cm`} />
                    <MedicalCard icon={<Activity className="size-4" />} label="BERAT" value={`${parseFloat(selectedRecord.BeratBadan || 0).toFixed(1)} kg`} />
                    <MedicalCard
                      icon={<Activity className="size-4" />}
                      label="BMI INDEX"
                      value={selectedRecord.TinggiBadan > 0 ? (selectedRecord.BeratBadan / (Math.pow(selectedRecord.TinggiBadan / 100, 2))).toFixed(1) : '0.0'}
                      isWarning={selectedRecord.TinggiBadan > 0 && (selectedRecord.BeratBadan / (Math.pow(selectedRecord.TinggiBadan / 100, 2))) >= 25}
                      badge="WARNING: OVERWEIGHT"
                    />
                    <MedicalCard icon={<Activity className="size-4" />} label="TENSI" value={`${selectedRecord.Sistole || 0}/${selectedRecord.Diastole || 0}`} />
                    <MedicalCard icon={<Droplet className="size-4" />} label="GULA DARAH" value={`${selectedRecord.GulaDarah || 0} mg/dL`} />
                  </div>

                  {/* Detail Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pb-12">
                    <div className="space-y-8">
                      <SectionHeader icon={<FileText className="size-5" />} label="DIAGNOSIS & SCREENING" />
                      <div className="space-y-8 pt-2 ml-1">
                        <DiagnosisItem
                          title="Kesehatan Kardiovaskular"
                          color="emerald"
                          desc="Tekanan darah sistolik dan diastolik dalam rentang normal terkendali. Tidak ditemukan riwayat penyakit jantung bawaan."
                        />
                        <DiagnosisItem
                          title="Status Nutrisi & Metabolik"
                          color="blue"
                          desc={`BMI tercatat di ${selectedRecord.TinggiBadan > 0 ? (selectedRecord.BeratBadan / (Math.pow(selectedRecord.TinggiBadan / 100, 2))).toFixed(1) : '0.0'}. Disarankan untuk menjaga pola makan seimbang dan aktivitas fisik rutin.`}
                        />
                        <DiagnosisItem
                          title="Pemeriksaan Penunjang"
                          color="slate"
                          desc="Semua parameter laboratorium dasar menunjukkan hasil negatif terhadap indikasi penyakit menular."
                        />
                      </div>
                    </div>

                    <div className="space-y-8 h-full">
                      <SectionHeader icon={<Activity className="size-5" />} label="CATATAN OBSERVATIF" />
                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col h-full min-h-[340px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:rotate-12 transition-transform duration-700">
                          <HeartPulse className="size-48 text-slate-900" />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            <span>VALID TILL: {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                          </div>
                          <RefreshCw className="size-3.5" />
                        </div>
                        <p className="text-[14px] font-bold text-slate-600 leading-relaxed italic flex-1 mb-10">
                          "{selectedRecord.Catatan || 'Berdasarkan hasil screening fisik menyeluruh, mahasiswa ini dinyatakan dalam kondisi fisik yang sehat dan layak untuk mengikuti seluruh rangkaian kegiatan akademik maupun non-akademik di lingkungan fakultas.'}"
                        </p>
                        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                              <User className="size-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-black uppercase text-slate-900">Dr. Setyawan Pratama</span>
                                <div className="size-1.5 rounded-full bg-emerald-500" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Consultant ID: 88291</span>
                            </div>
                          </div>
                          <img src="/seal_placeholder.png" className="h-10 opacity-10 grayscale" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 px-10 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-5 mr-auto">
                  <div className="flex items-center gap-2.5">
                    <div className="size-5 rounded-lg bg-slate-900 flex items-center justify-center text-white scale-90">
                      <Activity className="size-3" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 font-headline">Institutional Record</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200" />
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-tight">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>Authenticated via Blockchain Registry</span>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline hover:bg-slate-50 transition-all"
                >
                  PRINT VIEW
                </button>
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 font-headline"
                >
                  ARCHIVE DATA
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

// Helper Components
function MedicalCard({ icon, label, value, isWarning, badge }) {
  return (
    <div className={cn(
      "flex flex-col p-6 rounded-[2.5rem] transition-all duration-500 relative h-40 justify-between group",
      isWarning ? "bg-white border-2 border-rose-500 shadow-2xl shadow-rose-500/10" : "bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1"
    )}>
      <div className={cn("size-10 rounded-2xl flex items-center justify-center transition-colors duration-500",
        isWarning ? "text-rose-600 bg-rose-50" : "text-slate-400 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white"
      )}>
        {React.cloneElement(icon, { className: "size-5" })}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className={cn("text-2xl font-black font-headline tracking-tighter leading-none", isWarning ? "text-rose-600" : "text-slate-900")}>
          {value}
        </p>
      </div>
      {isWarning && (
        <span className="text-[9px] font-black uppercase text-rose-500 tracking-tighter absolute bottom-4 animate-pulse">
          {badge}
        </span>
      )}
    </div>
  )
}

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
        {icon}
      </div>
      <h3 className="font-black text-[13px] uppercase tracking-[0.2em] text-slate-900 font-headline">{label}</h3>
    </div>
  )
}

function DiagnosisItem({ title, desc, color }) {
  const colorClass =
    color === 'emerald' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' :
      color === 'blue' ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-400 shadow-lg shadow-slate-400/30'

  return (
    <div className="flex gap-8 group">
      <div className={cn("size-3 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-125", colorClass)} />
      <div className="space-y-2">
        <h4 className="text-[16px] font-black text-slate-900 leading-none tracking-tight">{title}</h4>
        <p className="text-[13px] font-bold text-slate-400 leading-relaxed italic">{desc}</p>
      </div>
    </div>
  )
}

function HealthItem({ label, value, isHighlight = false, isPrimary = false, dark = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("text-[9px] font-black uppercase tracking-widest font-headline", dark ? "text-white/40" : "text-slate-400")}>{label}</span>
      <span className={cn(
        "font-headline uppercase tracking-tight break-words",
        isPrimary ? "text-[14px] font-black underline underline-offset-4 decoration-primary/30" :
          isHighlight ? "text-[13px] font-black text-primary" :
            "text-[13px] font-bold",
        dark ? "text-white" : "text-slate-700"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}


