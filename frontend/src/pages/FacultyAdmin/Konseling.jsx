"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { Avatar, AvatarFallback } from "./components/avatar"
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"

import {
  Calendar,
  Clock,
  Headphones,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  Check,
  Eye,
  LayoutDashboard,
  FileText,
  UserCheck,
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

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
      label: "Identitas",
      render: (val) => (
        <div className="flex items-center gap-4 text-left">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase font-headline">
              {val?.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-black text-slate-900 font-headline uppercase text-[13px] tracking-tighter">
                {val?.Nama || "Mahasiswa Teknik"}
            </span>
            <span className="text-[10px] font-black text-slate-400 font-headline uppercase tracking-widest mt-1">
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
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase font-headline leading-none">
             <Calendar className="size-3 text-primary" />
             {val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline leading-none">
             <Clock className="size-3" />
             {row.jam || "00:00"}
          </div>
        </div>
      )
    },
    {
      key: "Status",
      label: "Validasi",
      render: (val) => {
        const config = {
          pending: { color: "bg-amber-100 text-amber-700", icon: AlertCircle, label: "Review" },
          approved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Terjadwal" },
          finished: { color: "bg-slate-100 text-slate-600", icon: Check, label: "Selesai" },
        }[val] || { color: "bg-slate-50 text-slate-400", icon: AlertCircle, label: val };

        return (
          <div className={cn("flex items-center gap-2 px-3 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest w-fit border border-current/10 shadow-sm font-headline", config.color)}>
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
    <PageContainer>
      <Toaster position="top-right" />
      
      <PageHeader
        icon={Headphones}
        title="Manajemen Konseling"
        description="Monitoring Bimbingan Akademik & Personal"
      />

      <ResponsiveGrid cols={3}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
              <span className="text-xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          <ResponsiveCard noPadding>
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
                <div className="flex items-center justify-end pr-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all" onClick={() => openShow(row)}>
                    <Eye className="size-4" />
                  </Button>
                </div>
              )}
            />
          </ResponsiveCard>
        </div>

        <div className="space-y-6">
          <ResponsiveCard className="overflow-hidden p-0">
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
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">{item.label}</span>
                      </div>
                      <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm font-headline",
                          item.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                      )}>{item.status}</Badge>
                  </div>
                ))}
            </div>
          </ResponsiveCard>

          <div className="p-8 rounded-[2rem] bg-indigo-50 border border-indigo-100 text-indigo-900 relative overflow-hidden group shadow-sm transition-all hover:shadow-xl">
               <Headphones className="absolute right-[-10px] bottom-[-10px] size-24 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
               <h5 className="text-xl font-black font-headline uppercase leading-none">Support IT</h5>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2 font-headline leading-none">BANTUAN TEKNIS 24/7</p>
               <Button className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase mt-8 hover:bg-indigo-700 shadow-xl border-none font-headline tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95">HUBUNGI KAMI</Button>
          </div>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <Modal
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedSession?.Mahasiswa?.Nama || 'Mahasiswa'}
        subtitle={`Topik: ${selectedSession?.Topik || 'Konseling'} • NIM: ${selectedSession?.Mahasiswa?.NIM || '-'}`}
        icon={<Headphones size={18} />}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col font-headline">
          {/* Header Hero Banner (Optional, keep for style) */}
          <div className="h-24 bg-slate-900 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent transition-transform duration-700" />
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
              <Headphones className="size-32 rotate-12 text-white" />
            </div>
            <div className="absolute inset-y-0 right-8 flex items-center">
              <Badge className={cn(
                "capitalize text-[10px] font-black px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-xl",
                selectedSession?.Status === 'pending' ? "bg-amber-500/20 text-amber-400" :
                  selectedSession?.Status === 'approved' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-300"
              )}>
                <span className="size-2 rounded-full bg-current mr-2 animate-pulse" />
                {selectedSession?.Status || 'Pending'}
              </Badge>
            </div>
          </div>

          <ModalBody>
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Sesi */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Calendar className="size-4" />
                    </div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Info Sesi</h3>
                  </div>
                  <div className="space-y-4 px-1">
                    <KonselingDetailItem label="NIM" value={selectedSession?.Mahasiswa?.NIM} />
                    <KonselingDetailItem label="Topik / Kategori" value={selectedSession?.Topik} />
                    <KonselingDetailItem label="Tanggal" value={selectedSession?.Tanggal ? new Date(selectedSession.Tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                    <KonselingDetailItem label="Waktu" value={selectedSession?.jam || '-'} />
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
                    <KonselingDetailItem label="Nama Konselor" value={selectedSession?.counselor || 'Dosen PA'} />
                    <KonselingDetailItem label="Prodi" value={selectedSession?.Mahasiswa?.ProgramStudi?.Nama || '-'} />
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
                  "{selectedSession?.notes || 'Sesi ini belum memiliki catatan resume detail dari konselor. Data akan sinkron secara otomatis setelah sesi dinyatakan selesai.'}"
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
              <ModalBtn variant="ghost" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </ModalBtn>
              <ModalBtn onClick={() => setIsDetailOpen(false)}>
                Tandai Selesai
              </ModalBtn>
          </ModalFooter>
        </div>
      </Modal>

    </PageContainer>
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
