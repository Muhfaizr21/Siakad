"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog"
import {
  Calendar,
  Clock,
  User,
  Headphones,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Check,
  Eye,
  LayoutDashboard,
  FileText,
  History,
  Tag,
  Sticker,
  UserCheck,
  GraduationCap
} from 'lucide-react'
import { cn } from "@/lib/utils"

export default function FacultyKonseling() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  


  const fetchData = async () => {
    try {
      setLoading(true)
      const cRes = await axios.get('http://localhost:8000/api/faculty/counseling')
      if (cRes.data.status === 'success') setSessions(cRes.data.data)
    } catch {
      toast.error("Gagal sinkronisasi data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openShow = (session) => {
    setSelectedSession(session)
    setIsDetailOpen(true)
  }

  const columns = [
    {
      key: "Mahasiswa",
      label: "Identitas Mahasiswa",
      render: (val) => (
        <div className="flex items-center gap-4 text-left">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase font-headline">
              {val?.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline uppercase text-[13px] tracking-tighter">
                {val?.Nama || "Mahasiswa Teknik"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-headline uppercase tracking-widest mt-1">
                {val?.NIM || "210001"}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "Topik",
      label: "Kategori",
      render: (val) => (
        <Badge className="bg-indigo-100/50 text-indigo-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
          {val || "Akademik"}
        </Badge>
      )
    },
    {
      key: "Tanggal",
      label: "Waktu & Sesi",
      render: (val, row) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase font-headline">
             <Calendar className="size-3 text-primary" />
             {val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider font-headline font-bold">
             <Clock className="size-3" />
             {row.jam || "00:00"} — {row.konselor || "Dosen PA"}
          </div>
        </div>
      )
    },
    {
      key: "Status",
      label: "Status",
      render: (val) => {
        const config = {
          pending: { color: "bg-amber-100 text-amber-700", icon: AlertCircle, label: "Review" },
          approved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Terjadwal" },
          finished: { color: "bg-slate-100 text-slate-600", icon: Check, label: "Selesai" },
        }[val] || { color: "bg-slate-50 text-slate-400", icon: AlertCircle, label: val };

        return (
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-2xl font-black text-[9px] uppercase tracking-[0.15em] w-fit border border-current/10 shadow-sm", config.color)}>
            <config.icon className="size-3.5" />
            {config.label}
          </div>
        )
      }
    }
  ]

  const statsData = [
    { label: 'Antrean Baru', value: (sessions || []).filter(s => s.Status === 'pending').length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sesi Aktif', value: (sessions || []).filter(s => s.Status === 'approved').length, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Selesai', value: (sessions || []).filter(s => s.Status === 'finished').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header Section (Mahasiswa Style) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pt-2">
        <div className="flex flex-col gap-1.5 font-headline">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Headphones className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Manajemen Konseling</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monitoring Bimbingan Akademik & Personal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {statsData.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-500 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-2.5 rounded-xl shadow-inner", stat.bg, stat.color)}>
                                <stat.icon className="size-5" />
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none font-headline">Laporan Real-time</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">{stat.label}</p>
                            <h3 className={cn("text-3xl font-black font-headline tracking-tighter text-slate-900")}>{stat.value}</h3>
                        </div>
                    </CardContent>
                </Card>
             ))}
          </div>

          <Card className="border-none shadow-sm overflow-hidden p-0 rounded-3xl bg-white">
            <CardContent className="p-0">
              <DataTable 
                columns={columns}
                data={sessions}
                loading={loading}
                searchPlaceholder="Cari Nama Mahasiswa..."
                filters={[
                  {
                    key: 'Status',
                    placeholder: 'Status Sesi',
                    options: [
                      { label: 'Antrean', value: 'pending' },
                      { label: 'Terjadwal', value: 'approved' },
                      { label: 'Selesai', value: 'finished' },
                    ]
                  }
                ]}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="size-9 p-0 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all font-headline" onClick={() => openShow(row)}>
                        <Eye className="size-4" />
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <div className="bg-gradient-to-br from-primary to-indigo-600 p-8 text-white relative h-28 flex flex-col justify-center">
                  <LayoutDashboard className="absolute right-[-10px] top-[-10px] size-24 opacity-10 rotate-12" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1 leading-none font-headline">Internal Board</p>
                  <h4 className="text-2xl font-black font-headline uppercase leading-none tracking-tighter">Monitoring <span className="text-white">Slot</span></h4>
              </div>
              <div className="p-6 space-y-3">
                  {[
                    { time: '09:00 WIB', label: 'Sesi S1 — Lab A', status: 'Booked' },
                    { time: '11:00 WIB', label: 'Sesi S2 — R. Dosen', status: 'Available' },
                    { time: '13:00 WIB', label: 'Sesi S3 — Hybrid', status: 'Booked' },
                    { time: '15:00 WIB', label: 'Sesi S4 — Konseling', status: 'Available' },
                  ].map((item, i) => (
                    <div key={i} className={cn(
                        "p-4 rounded-[1.8rem] border flex items-center justify-between transition-all duration-300 group hover:shadow-xl font-headline",
                        item.status === 'Available' ? 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200' : 'bg-slate-50 border-slate-100 opacity-60'
                    )}>
                        <div className="flex flex-col">
                            <span className={cn("text-[11px] font-black uppercase tracking-tight", item.status === 'Available' ? 'text-emerald-900' : 'text-slate-500')}>{item.time}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.label}</span>
                        </div>
                        <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm font-headline",
                            item.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                        )}>{item.status}</Badge>
                    </div>
                  ))}
              </div>
           </Card>

           <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-900 relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
                <Headphones className="absolute right-[-10px] bottom-[-10px] size-24 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                <h5 className="text-lg font-black font-headline uppercase leading-none">Support IT</h5>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2 font-headline">BANTUAN TEKNIS 24/7</p>
                <Button className="w-full h-11 rounded-xl bg-indigo-600 text-white font-black text-[10px] uppercase mt-8 hover:bg-indigo-700 shadow-xl border-none font-headline tracking-widest">HUBUNGI KAMI</Button>
           </div>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
            {selectedSession && (
                <div className="relative flex flex-col max-h-[90vh] font-headline">
                    {/* Header Hero Banner */}
                    <div className="h-44 bg-slate-900 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent transition-transform duration-700" />
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                            <Headphones className="size-48 rotate-12 text-white" />
                        </div>

                        <div className="absolute top-8 right-8 z-20">
                            <Badge className={cn(
                                "capitalize text-[10px] font-black px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-xl",
                                selectedSession.Status === 'pending' ? "bg-amber-500/20 text-amber-400" :
                                selectedSession.Status === 'approved' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-300"
                            )}>
                                <span className="size-2 rounded-full bg-current mr-2 animate-pulse" />
                                {selectedSession.Status || 'Pending'}
                            </Badge>
                        </div>

                        <div className="absolute -bottom-12 left-10 z-20 p-2 bg-white rounded-[2.2rem] shadow-2xl shadow-slate-900/10">
                            <Avatar className="h-32 w-32 rounded-[1.8rem] border-4 border-slate-50">
                                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-4xl font-black font-headline">
                                    {selectedSession.Mahasiswa?.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto p-10 pt-16 space-y-10 custom-scrollbar">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-4xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{selectedSession.Mahasiswa?.Nama || 'Mahasiswa'}</h2>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-[10px] font-black bg-primary/5 text-primary border-none px-3 py-1 rounded-md tracking-wider">
                                    SESI KONSELING
                                </Badge>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] font-headline">ID: #{selectedSession.ID || '000'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            {/* Info Sesi */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Calendar className="size-4" />
                                    </div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Info Sesi</h3>
                                </div>
                                <div className="space-y-4 px-1">
                                    <KonselingDetailItem label="NIM" value={selectedSession.Mahasiswa?.NIM} />
                                    <KonselingDetailItem label="Topik / Kategori" value={selectedSession.Topik} />
                                    <KonselingDetailItem label="Tanggal" value={selectedSession.Tanggal ? new Date(selectedSession.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                                    <KonselingDetailItem label="Waktu" value={selectedSession.jam || '-'} />
                                </div>
                            </div>

                            {/* Info Konselor */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                    <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <UserCheck className="size-4" />
                                    </div>
                                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Konselor</h3>
                                </div>
                                <div className="space-y-4 px-1">
                                    <KonselingDetailItem label="Nama Konselor" value={selectedSession.counselor || 'Dosen PA'} />
                                    <KonselingDetailItem label="Prodi" value={selectedSession.Mahasiswa?.ProgramStudi?.Nama || '-'} />
                                </div>
                            </div>
                        </div>

                        {/* Catatan / Resume */}
                        <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <FileText className="size-4" />
                                </div>
                                <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Narasi Hasil Konsultasi</h3>
                            </div>
                            <p className="text-[13px] font-bold text-slate-600 leading-relaxed italic px-2 uppercase">
                                "{selectedSession.notes || 'Sesi ini belum memiliki catatan resume detail dari konselor. Data akan sinkron secara otomatis setelah sesi dinyatakan selesai.'}"
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 px-10 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDetailOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline"
                        >
                            Tutup
                        </Button>
                        <Button
                            onClick={() => setIsDetailOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 font-headline"
                        >
                            Tandai Selesai
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

    </div>
  )
}

function KonselingDetailItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">{label}</span>
      <span className="text-[12px] font-bold font-headline uppercase truncate text-slate-700">
        {value || '—'}
      </span>
    </div>
  )
}
