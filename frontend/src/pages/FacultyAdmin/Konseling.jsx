"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "./components/dialog"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"
import {
  Calendar,
  Clock,
  User,
  Headphones,
  CheckCircle2,
  Trash2,
  AlertCircle,
  CalendarCheck,
  Search,
  Check,
  X,
  Plus,
  Eye,
  Edit2,
  LayoutDashboard,
  Save,
  Loader2,
  UserPlus,
  FileText,
  BadgeInfo,
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
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  
  const [modalMode, setModalMode] = useState('create') 
  const [selectedSession, setSelectedSession] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    studentId: "",
    jenis: "",
    tanggal: "",
    jam: "",
    konselor: "",
    catatan: "",
    status: "pending"
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [cRes, sRes] = await Promise.all([
        axios.get('/api/faculty/counseling'),
        axios.get('/api/faculty/students')
      ])
      
      if (cRes.data.status === 'success') setSessions(cRes.data.data)
      if (sRes.data.status === 'success') setStudents(sRes.data.data)
    } catch {
      toast.error("Gagal sinkronisasi data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setFormData({
        studentId: "",
        jenis: "Akademik",
        tanggal: new Date().toISOString().split('T')[0],
        jam: "10:00",
        konselor: "",
        catatan: "",
        status: "pending"
    })
  }

  const openCreate = () => {
    setModalMode('create')
    resetForm()
    setIsModalOpen(true)
  }

  const openEdit = (session) => {
    setModalMode('edit')
    setSelectedSession(session)
    setFormData({
      studentId: session.studentId?.toString() || "",
      jenis: session.type || "",
      tanggal: session.date ? new Date(session.date).toISOString().split('T')[0] : "",
      jam: session.time || "",
      konselor: session.counselor || "",
      catatan: session.notes || "",
      status: session.status || "pending"
    })
    setIsModalOpen(true)
  }

  const openShow = (session) => {
    setSelectedSession(session)
    setIsDetailOpen(true)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    try {
      setIsSubmitting(true)
      if (modalMode === 'create') {
        const res = await axios.post(`/api/faculty/counseling`, {
          studentId: parseInt(formData.studentId),
          type: formData.jenis,
          date: new Date(formData.tanggal),
          time: formData.jam,
          counselor: formData.konselor,
          notes: formData.catatan,
          status: formData.status
        })
        if (res.data.status === 'success') toast.success("Sesi baru dijadwalkan")
      } else {
        const res = await axios.put(`/api/faculty/counseling/${selectedSession.id}`, {
          ...selectedSession,
          studentId: parseInt(formData.studentId),
          type: formData.jenis,
          date: new Date(formData.tanggal),
          time: formData.jam,
          counselor: formData.konselor,
          notes: formData.catatan,
          status: formData.status
        })
        if (res.data.status === 'success') toast.success("Perubahan disimpan")
      }
      setIsModalOpen(false)
      fetchData()
    } catch {
      toast.error("Gagal memproses permintaan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/api/faculty/counseling/${selectedSession.id}`)
      if (res.data.status === 'success') {
        toast.success("Sesi berhasil dihapus")
        setIsDelOpen(false)
        fetchData()
      }
    } catch {
      toast.error("Gagal menghapus data")
    }
  }

  const columns = [
    {
      key: "Mahasiswa",
      label: "Identitas Mahasiswa",
      render: (val) => (
        <div className="flex items-center gap-4 text-left">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase font-headline">
              {val?.name?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline uppercase text-[13px] tracking-tighter">
                {val?.name || "Mahasiswa Teknik"}
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-headline uppercase tracking-widest mt-1">
                {val?.nim || "210001"}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "type",
      label: "Kategori",
      render: (val) => (
        <Badge className="bg-indigo-100/50 text-indigo-700 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
          {val || "Akademik"}
        </Badge>
      )
    },
    {
      key: "date",
      label: "Waktu & Sesi",
      render: (val, row) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase font-headline">
             <Calendar className="size-3 text-primary" />
             {val ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider font-headline font-bold">
             <Clock className="size-3" />
             {row.time || "00:00"} — {row.counselor || "Dosen PA"}
          </div>
        </div>
      )
    },
    {
      key: "status",
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
    { label: 'Antrean Baru', value: (sessions || []).filter(s => s.status === 'pending').length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Sesi Aktif', value: (sessions || []).filter(s => s.status === 'approved').length, icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Selesai', value: (sessions || []).filter(s => s.status === 'finished').length, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
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
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Bimbingan Akademik & Personal</p>
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
                            <h3 className={cn("text-3xl font-black font-headline tracking-tighter text-slate-900")}>{stat.val}</h3>
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
                onAdd={openCreate}
                addLabel="Booking Manual"
                filters={[
                  {
                    key: 'status',
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
                    <Button variant="ghost" size="sm" className="size-9 p-0 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all font-headline" onClick={() => openEdit(row)}>
                        <Edit2 className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="size-9 p-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-none font-headline" onClick={() => { setSelectedSession(row); setIsDelOpen(true); }}>
                        <Trash2 className="size-4" />
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

      {/* UNIQUE SHOW DIALOG (Match Mahasiswa Header) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white">
            {selectedSession && (
                <div className="flex flex-col font-headline">
                    <div className="bg-gradient-to-br from-slate-50 to-white px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                                <FileText className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Detail Sesi Konseling</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 leading-none">RESUME ID: #{selectedSession.id || "000"}</p>
                            </div>
                        </div>
                        <Badge className={cn(
                            "rounded-xl px-4 py-2 font-black text-[9px] uppercase tracking-widest border-none flex shadow-sm",
                            selectedSession.status === 'pending' ? "bg-amber-100 text-amber-700" :
                            selectedSession.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                            {selectedSession.status || 'Reviewing'}
                        </Badge>
                    </div>

                    <div className="p-8 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Profil Mahasiswa</p>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-xl ring-1 ring-slate-100">
                                        <AvatarFallback className="bg-white text-slate-900 font-black text-[12px] uppercase">
                                            {selectedSession.Mahasiswa?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{selectedSession.Mahasiswa?.name}</span>
                                        <span className="text-[10px] font-black text-primary font-headline mt-1.5">{selectedSession.Mahasiswa?.nim}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Konselor Bertugas</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 border-2 border-white shadow-xl flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100">
                                        <UserCheck className="size-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">{selectedSession.counselor || "Dosen Pengampu"}</span>
                                        <span className="text-[9px] font-black text-indigo-400 font-headline mt-1.5 uppercase tracking-widest leading-none">Staff Ahli FT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Kategori', val: selectedSession.type || "Akademik", icon: Tag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                { label: 'Jadwal', val: selectedSession.date ? new Date(selectedSession.date).toLocaleDateString() : "-", icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Waktu', val: selectedSession.time ? `${selectedSession.time} WIB` : "-", icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Fakultas', val: "FT", icon: Sticker, color: 'text-amber-600', bg: 'bg-amber-50' },
                            ].map((meta, i) => (
                                <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center transition-all hover:scale-105">
                                    <div className={cn("p-2 rounded-xl mb-2", meta.bg, meta.color)}>
                                        <meta.icon className="size-3.5" />
                                    </div>
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{meta.label}</p>
                                    <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{meta.val}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-50/30 rounded-3xl border border-slate-200/50 shadow-inner space-y-4">
                            <div className="flex items-center gap-3">
                                <History className="size-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Narasi Hasil Konsultasi</span>
                            </div>
                            <p className="text-[12px] font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                                {selectedSession.notes || "Sesi ini belum memiliki catatan resume detail dari konselor. Data akan sinkron secara otomatis setelah sesi dinyatakan selesai oleh sistem bimbingan online."}
                            </p>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-[2.5rem]">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDetailOpen(false)}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-8 rounded-2xl hover:bg-slate-100 hover:text-slate-900 font-headline"
                        >
                            Tutup
                        </Button>
                        <Button
                            onClick={() => { setIsDetailOpen(false); openEdit(selectedSession); }}
                            className="h-12 px-10 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] border-none shadow-xl shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all font-headline"
                        >
                            Rework Agenda
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>

      {/* CRUD DIALOG (Exact Mahasiswa Copy Style) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl flex flex-col max-h-[90vh]">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden flex-shrink-0 text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Headphones className="size-24 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col text-left items-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {modalMode === 'edit' ? <Edit2 className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none font-headline">
                  Counseling Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {modalMode === 'edit' ? 'Update Mahasiswa' : 'Registrasi Sesi'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 font-headline">
                Dokumentasi bimbingan akademik & personal terintegrasi.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nomor Induk / Identitas Siswa</Label>
                  {modalMode === 'create' ? (
                      <Select value={formData.studentId} onValueChange={val => setFormData({ ...formData, studentId: val })}>
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline">
                              <SelectValue placeholder="Pilih Mahasiswa..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                              {students.map(s => (
                                  <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">
                                      {s.nim} — {s.name}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  ) : (
                      <div className="h-12 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                           <Avatar className="size-6 rounded-lg bg-white border flex items-center justify-center font-black text-[9px] text-slate-400">
                               <AvatarFallback>{selectedSession?.Mahasiswa?.name?.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight font-headline">{selectedSession?.Mahasiswa?.name} ({selectedSession?.Mahasiswa?.nim})</span>
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kategori Sesi</Label>
                  <Input 
                      value={formData.jenis} 
                      onChange={e => setFormData({ ...formData, jenis: e.target.value })}
                      placeholder="Akademik / Pribadi"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Agenda</Label>
                  <Select value={formData.status} onValueChange={val => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs text-left">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                        <SelectItem value="pending" className="rounded-xl font-bold text-[11px] p-3 uppercase font-headline">REVIEW ANTIREAN</SelectItem>
                        <SelectItem value="approved" className="rounded-xl font-bold text-[11px] p-3 uppercase font-headline text-emerald-600 focus:bg-emerald-50">JADWALKAN SESI</SelectItem>
                        <SelectItem value="finished" className="rounded-xl font-bold text-[11px] p-3 uppercase font-headline">SESI SELESAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jadwal Tanggal</Label>
                  <Input 
                      type="date"
                      value={formData.tanggal} 
                      onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Waktu (WIB)</Label>
                  <Input 
                      placeholder="Contoh: 10:30"
                      value={formData.jam} 
                      onChange={e => setFormData({ ...formData, jam: e.target.value })}
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Konselor Bertugas</Label>
                <Input 
                    placeholder="Nama Lengkap Dosen / Konselor"
                    value={formData.konselor} 
                    onChange={e => setFormData({ ...formData, konselor: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Catatan & Histori Konsultasi</Label>
                <Textarea 
                    value={formData.catatan} 
                    onChange={e => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Entry resume hasil bimbingan..."
                    className="min-h-[100px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline uppercase"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 flex-shrink-0 rounded-b-[2rem]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} onClick={handleSubmit} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline border-none">
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4 mr-3" />
                ) : (
                  <Save className="size-4 mr-3 stroke-[3px]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">{modalMode === 'edit' ? 'Update Data' : 'Booking Now'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SHARED DELETE MODAL */}
      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Sesi?"
        description="Tindakan ini bersifat permanen. Data histori bimbingan mahasiswa akan dihapus dari sistem fakultas secara total."
        loading={isSubmitting}
      />
    </div>
  )
}
