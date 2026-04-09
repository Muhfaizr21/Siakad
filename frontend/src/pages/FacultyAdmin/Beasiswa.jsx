"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent } from "./components/card"
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { toast, Toaster } from 'react-hot-toast'
import { Plus, Pencil, ExternalLink, Loader2, Save, GraduationCap as CapIcon, Users, UserCheck, Clock, Building2, CalendarDays, FileText, Download, Filter } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/dialog"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"
import { Avatar, AvatarFallback } from "./components/avatar"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"

export default function FacultyScholarship() {
  const [activeTab, setActiveTab] = useState('programs')
  const [scholarships, setScholarships] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProgModal, setShowProgModal] = useState(false)
  const [showAppModal, setShowAppModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [progForm, setProgForm] = useState({
    id: null, name: '', provider: '', description: '', minGpa: 3.5, quota: 10, deadline: '', status: 'buka'
  })

  const [appForm, setAppForm] = useState({
    status: 'proses', notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'programs') {
        const res = await axios.get('http://localhost:8000/api/faculty/scholarships')
        setScholarships(res.data.data)
      } else {
        const res = await axios.get('http://localhost:8000/api/faculty/scholarships/applications')
        setApplications(res.data.data)
      }
    } catch {
      toast.error('Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleProgSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    try {
      const url = progForm.id
        ? `http://localhost:8000/api/faculty/scholarships/${progForm.id}`
        : 'http://localhost:8000/api/faculty/scholarships'

      const method = progForm.id ? 'put' : 'post'
      await axios[method](url, progForm)
      toast.success(progForm.id ? 'Beasiswa diperbarui' : 'Beasiswa dibuat')
      setShowProgModal(false)
      fetchData()
    } catch {
      toast.error('Gagal menyimpan beasiswa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAppUpdate = async () => {
    if (!selectedItem?.id) return
    setIsSubmitting(true)
    try {
      await axios.put(`http://localhost:8000/api/faculty/scholarships/applications/${selectedItem.id}`, appForm)
      toast.success('Status diperbarui')
      setShowAppModal(false)
      fetchData()
    } catch {
      toast.error('Gagal update')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditProg = (row) => {
    setProgForm({
        ...row,
        deadline: row.deadline ? new Date(row.deadline).toISOString().split('T')[0] : ""
    })
    setShowProgModal(true)
  }

  const progColumns = [
    {
      key: "nama",
      label: "Program Beasiswa",
      render: (v) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px] uppercase">{v}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
             <CapIcon className="size-2.5 opacity-60" />
             Faculty Academic Scholarship
          </span>
        </div>
      )
    },
    {
      key: "penyelenggara",
      label: "Penyelenggara",
      render: (v) => <span className="text-xs text-slate-600 font-black font-headline uppercase">{v}</span>
    },
    {
      key: "quota",
      label: "Slot / Kuota",
      className: "text-center",
      cellClassName: "text-center",
      render: (v, r) => (
        <span className="font-bold text-slate-900 font-headline text-sm tracking-tighter">
            {r.acceptedCount || 0} / {v}
        </span>
      )
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (v) => (
        <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-md shadow-sm">
           {new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Badge>
      )
    },
    {
      key: "status",
      label: "Status",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => {
        const isBuka = val?.toLowerCase() === 'buka';
        return (
          <Badge 
            className={cn(
              "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
              isBuka ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20"
            )}
          >
            {isBuka ? "Aktif" : "Selesai"}
          </Badge>
        )
      }
    }
  ]

  const appColumns = [
    {
      key: "student",
      label: "Identitas Mahasiswa",
      render: (v) => (
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
                <AvatarFallback className="bg-slate-100 text-[10px] font-black uppercase">
                    {v?.name?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-900 font-headline uppercase text-[13px] tracking-tighter">{v?.nama_mahasiswa || 'Unknown'}</span>
                <span className="text-[10px] font-bold text-slate-400 font-headline uppercase tracking-widest mt-0.5">{v?.nim || '-'}</span>
            </div>
        </div>
      )
    },
    {
      key: "beasiswa",
      label: "Nama Program",
      render: (v) => <span className="text-xs text-slate-600 font-black font-headline uppercase">{v?.nama}</span>
    },
    {
      key: "file_url",
      label: "Berkas",
      render: (v) => (
        <a href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-primary hover:underline">
          <FileText className="size-3" /> Lihat Berkas
        </a>
      )
    },
    {
      key: "status",
      label: "Status Review",
      className: "text-center",
      cellClassName: "text-center",
      render: (val) => {
        const status = val?.toLowerCase();
        return (
          <Badge 
            className={cn(
              "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
              status === 'diterima' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              status === 'ditolak' ? "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20" :
              "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20"
            )}
          >
            {status}
          </Badge>
        )
      }
    }
  ]

  const statusOptions = activeTab === 'programs'
    ? [{ label: 'Aktif', value: 'buka' }, { label: 'Selesai', value: 'tutup' }]
    : [{ label: 'Proses', value: 'proses' }, { label: 'Diterima', value: 'diterima' }, { label: 'Ditolak', value: 'ditolak' }]

  const statsData = [
    { label: 'Total Beasiswa', value: (scholarships || []).length, icon: CapIcon, color: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Pendaftar Baru', value: (applications || []).filter(a => a.status === 'proses').length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-500/10 to-emerald-500/5' },
    { label: 'Daftar Diterima', value: (applications || []).filter(a => a.status === 'diterima').length, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-500/5' },
    { label: 'Kuota Aktif', value: (scholarships || []).filter(s => s.status === 'buka').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-500/10 to-amber-500/5' },
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <CapIcon className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">Manajemen Beasiswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Bantuan Dana & Seleksi Fakultas Teknik</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {statsData.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm flex flex-col overflow-hidden bg-white relative group transition-all duration-300 rounded-[1.5rem] hover:shadow-xl">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 font-headline">{stat.label}</p>
                <h3 className={cn("text-3xl font-black font-headline tracking-tighter text-slate-900")}>
                    {loading ? "..." : stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex p-1.5 bg-white border border-slate-200/60 rounded-2xl shadow-sm w-fit gap-1">
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'programs' ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <CapIcon className="size-4" />
            Program Beasiswa
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 ${activeTab === 'applications' ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <Users className="size-4" />
            Review Pendaftar
          </button>
        </div>
      </div>

      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={activeTab === 'programs' ? progColumns : appColumns}
            data={activeTab === 'programs' ? scholarships : applications}
            loading={loading}
            searchPlaceholder={activeTab === 'programs' ? "Cari nama beasiswa..." : "Cari mahasiswa atau NIM..."}
            onAdd={activeTab === 'programs' ? () => { setProgForm({ id: null, name: '', provider: '', description: '', minGpa: 3.5, quota: 10, deadline: '', status: 'buka' }); setShowProgModal(true); } : null}
            addLabel="Program Baru"
            onExport={() => alert("Ekspor Data Beasiswa...")}
            exportLabel="Master Data"
            filters={[
              {
                key: 'status',
                placeholder: 'Filter Status',
                options: statusOptions
              }
            ]}
            actions={(row) => (
              activeTab === 'programs' ? (
                <div className="flex items-center gap-2">
                    <Button onClick={() => openEditProg(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
                    <Pencil className="size-4" />
                    </Button>
                </div>
              ) : (
                <Button onClick={() => { setSelectedItem(row); setShowAppModal(true) }} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
                  <ExternalLink className="size-4" />
                </Button>
              )
            )}
          />
        </CardContent>
      </Card>

      {/* Program Modal (Exact Mahasiswa Copy Style) */}
      <Dialog open={showProgModal} onOpenChange={setShowProgModal}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CapIcon className="size-24 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {progForm.id ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none font-headline">
                   Scholarship Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {progForm.id ? 'Update Parameter' : 'Inisialisasi Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 font-headline">
                Konfigurasi parameter dana & kriteria seleksi mahasiswa akademik.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleProgSubmit} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap Program Beasiswa</Label>
                <Input
                  value={progForm.name}
                  onChange={e => setProgForm({ ...progForm, name: e.target.value })}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase"
                  placeholder="Entry Nama Program..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Instansi Provider</Label>
                  <Input
                    value={progForm.provider}
                    onChange={e => setProgForm({ ...progForm, provider: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    placeholder="Nama Yayasan / Mitra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Deadline Registrasi</Label>
                  <Input
                    type="date"
                    value={progForm.deadline}
                    onChange={e => setProgForm({ ...progForm, deadline: e.target.value })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-center font-headline">Min. IPK</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={progForm.minGpa}
                    onChange={e => setProgForm({ ...progForm, minGpa: parseFloat(e.target.value) })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-black text-center text-sm font-headline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-center font-headline">Kuota Slot</Label>
                  <Input
                    type="number"
                    value={progForm.quota}
                    onChange={e => setProgForm({ ...progForm, quota: parseInt(e.target.value) })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white font-black text-center text-sm font-headline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-center font-headline">Status Beasiswa</Label>
                  <Select value={progForm.status} onValueChange={v => setProgForm({ ...progForm, status: v })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                        <SelectItem value="buka" className="rounded-xl font-bold text-[11px] p-3 uppercase text-emerald-600 font-headline">DIBUKA (AKTIF)</SelectItem>
                        <SelectItem value="tutup" className="rounded-xl font-bold text-[11px] p-3 uppercase text-rose-600 font-headline">DITUTUP (OFF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Alamat Domisili / Deskripsi Program</Label>
                <Textarea
                  value={progForm.description}
                  onChange={e => setProgForm({ ...progForm, description: e.target.value })}
                  placeholder="Entry deskripsi & regulasi lengkap..."
                  className="min-h-[100px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline uppercase"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
              <Button type="button" variant="ghost" onClick={() => setShowProgModal(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline border-none">
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4 mr-3" />
                ) : (
                  <Save className="size-4 mr-3 stroke-[3px]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">{progForm.id ? 'Update Record' : 'Create Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Application Modal */}
      <Dialog open={showAppModal} onOpenChange={setShowAppModal}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden flex-shrink-0 text-left">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserCheck className="size-24 rotate-12" />
            </div>
            <div className="relative z-10 flex flex-col items-start">
               <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                   <UserCheck className="size-4" />
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none font-headline">
                   Scholarship Review
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                 Validasi Seleksi
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1 font-headline">
                 Verifikasi histori akademik dan kelayakan berkas mahasiswa.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-8 pt-6 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-white shadow-xl">
                        <AvatarFallback className="bg-white text-slate-900 font-black">
                            {selectedItem?.student?.name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student Applicant</p>
                        <h4 className="font-bold text-slate-900 font-headline text-lg tracking-tight uppercase leading-none">{selectedItem?.student?.nama_mahasiswa}</h4>
                        <p className="text-[10px] font-black text-primary font-headline tracking-tighter uppercase">{selectedItem?.beasiswa?.nama}</p>
                    </div>
                </div>
                {selectedItem?.documentUrl && (
                  <a href={selectedItem.documentUrl} target="_blank" rel="noreferrer" className="size-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95 group border border-slate-50">
                    <ExternalLink className="size-5 group-hover:rotate-12 transition-transform" />
                  </a>
                )}
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Keputusan Seleksi</Label>
                 <div className="grid grid-cols-3 gap-3">
                  {['proses', 'diterima', 'ditolak'].map((s) => (
                    <div
                      key={s}
                      onClick={() => setAppForm({ ...appForm, status: s })}
                      className={`flex items-center justify-center h-12 rounded-2xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all font-headline ${appForm.status === s
                        ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      {s}
                    </div>
                  ))}
                 </div>
               </div>

               <div className="space-y-2">
                 <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Catatan Reviewer Internal</Label>
                 <Textarea
                    value={appForm.notes}
                    onChange={e => setAppForm({ ...appForm, notes: e.target.value })}
                    className="min-h-[100px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-xs p-4 leading-relaxed uppercase"
                    placeholder="Berikan alasan keputusan atau perbaikan..."
                 />
               </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30 rounded-b-[2rem]">
               <Button onClick={() => setShowAppModal(false)} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                  Tutup
               </Button>
               <Button onClick={handleAppUpdate} disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline border-none">
                  {isSubmitting ? <Loader2 className="animate-spin size-4 mr-3" /> : <Save className="size-4 mr-3 stroke-[3px]" />}
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">Simpan Keputusan</span>
               </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}