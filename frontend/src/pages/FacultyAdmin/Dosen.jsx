"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback, AvatarImage } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/dialog"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/card"
import {
  Eye,
  Pencil,
  Trash2,
  Mail,
  BookOpen,
  Loader2,
  Plus,
  Save,
  UserCheck,
  GraduationCap,
  Users,
  Award,
  ShieldCheck
} from "lucide-react"
import { Input } from "./components/input"
import { Label } from "./components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function DosenPage() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDosen, setSelectedDosen] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // CRUD Modal States
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)

  const [formData, setFormData] = useState({
    id: null,
    nama_dosen: "",
    nidn: "",
    email: "",
    fakultas_id: "",
    prodi_id: "",
    jabatan: "Dosen Pengajar",
    isDpa: false,
    avatarUrl: ""
  })

  // Dropdown Data
  const [faculties, setFaculties] = useState([])
  const [majors, setMajors] = useState([])

  const fetchLecturers = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/faculty/lecturers')
      const json = await res.json()
      if (json.status === 'success') {
        setLecturers(json.data)
      }
    } catch (err) {
      toast.error("Gagal mengambil data dosen")
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const [facRes, majRes] = await Promise.all([
        fetch('http://localhost:8000/api/faculty/faculties'),
        fetch('http://localhost:8000/api/faculty/majors')
      ])
      const facJson = await facRes.json()
      const majJson = await majRes.json()
      if (facJson.status === 'success') setFaculties(facJson.data)
      if (majJson.status === 'success') setMajors(majJson.data)
    } catch (err) {
      console.error("Gagal mengambil data pendukung")
    }
  }

  useEffect(() => {
    fetchLecturers()
    fetchDependencies()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({
      id: null, name: "", nidn: "", email: "", facultyId: "", majorId: "", position: "Dosen Pengajar", isDpa: false, avatarUrl: ""
    })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (dosen) => {
    setIsEditMode(true)
    setFormData({
      id: dosen.id,
      nama_dosen: dosen.nama_dosen,
      nidn: dosen.nidn,
      email: dosen.user?.email || "",
      fakultas_id: dosen.fakultas_id?.toString() || "",
      prodi_id: dosen.prodi_id?.toString() || "",
      jabatan: dosen.jabatan || "Dosen Pengajar",
      isDpa: dosen.isDpa || false,
      avatarUrl: dosen.avatarUrl || ""
    })
    setIsCrudOpen(true)
  }

  const handleView = (dosen) => {
    setSelectedDosen(dosen)
    setIsDetailOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)

    const url = isEditMode
      ? `http://localhost:8000/api/faculty/lecturers/${formData.id}`
      : 'http://localhost:8000/api/faculty/lecturers'
    const method = isEditMode ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fakultas_id: parseInt(formData.fakultas_id),
          prodi_id: formData.prodi_id ? parseInt(formData.prodi_id) : 0,
        })
      })

      const json = await res.json()
      if (json.status === 'success') {
        toast.success(isEditMode ? "Data dosen diperbarui" : "Dosen berhasil ditambahkan")
        setIsCrudOpen(false)
        fetchLecturers()
      } else {
        toast.error(json.message || "Gagal menyimpan data")
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedDosen?.id) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/lecturers/${selectedDosen.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success("Dosen berhasil dihapus")
        setIsDelOpen(false)
        fetchLecturers()
      }
    } catch (err) {
      toast.error("Gagal menghapus data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: "nidn",
      label: "NIDN",
      className: "w-[150px]",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value || '-'}</span>
    },
    {
      key: "nama_dosen",
      label: "Profil Dosen",
      className: "w-auto min-w-[280px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
            <AvatarImage src={row.avatarUrl} />
            <AvatarFallback className="bg-slate-100 text-slate-800 text-[10px] font-black uppercase">
              {value?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-slate-900 font-headline tracking-tighter text-[13px]">{value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
              <Mail className="size-2.5 opacity-60" />
              {row.user?.email || '-'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "prodi",
      label: "Program Studi",
      className: "w-auto min-w-[200px]",
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-700">{value?.nama_prodi || '-'}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{value?.faculty?.nama_fakultas || '-'}</span>
        </div>
      )
    },
    {
      key: "jabatan",
      label: "Jabatan",
      className: "w-[180px]",
      render: (value) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg">
          {value}
        </Badge>
      )
    },
    {
      key: "isDpa",
      label: "DPA",
      className: "w-[120px] text-center",
      cellClassName: "text-center",
      render: (value) => (
        value ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-none shadow-none text-[9px] font-black px-2.5 py-1">TERDAFTAR</Badge>
        ) : (
          <Badge variant="ghost" className="text-slate-300 text-[9px] font-bold border-none">TIDAK</Badge>
        )
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 pt-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="size-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Manajemen Dosen</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Database Tenaga Pengajar & Pimpinan Fakultas</p>
          </div>
        </div>

      </div>

      {/* MAIN TABLE */}
      <Card className="border-none shadow-sm mt-4 overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={lecturers}
            loading={loading}
            searchPlaceholder="Cari Nama, NIDN atau Jabatan..."
            onAdd={handleOpenAdd}
            addLabel="Registrasi Dosen"
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleView(row)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  onClick={() => handleOpenEdit(row)}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  onClick={() => { setSelectedDosen(row); setIsDelOpen(true); }}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors text-slate-400"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selectedDosen && (
            <div className="relative">
              {/* Header Profile Section */}
              <div className="h-40 bg-slate-900 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                  <Award className="size-44 rotate-12 text-white" />
                </div>
                
                <div className="absolute top-8 right-8 z-20">
                  <Badge 
                    className="capitalize text-[10px] font-black px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-xl bg-primary/20 text-white font-headline tracking-tighter italic"
                  >
                    {selectedDosen.position || 'Academic Staff'}
                  </Badge>
                </div>

                <div className="absolute -bottom-14 left-10 z-20 p-2 bg-white rounded-[2.2rem] shadow-2xl shadow-slate-900/10">
                  <Avatar className="h-28 w-28 rounded-[1.8rem] border-4 border-slate-50">
                    <AvatarImage src={selectedDosen.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-3xl font-black font-headline">
                      {selectedDosen.name?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Content Section */}
              <div className="pt-18 pb-10 px-10 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{selectedDosen.name}</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-black bg-primary/5 text-primary border-none px-2 py-0.5 rounded-md">
                            FACULTY LECTURER
                        </Badge>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-headline">NIDN: {selectedDosen.nidn}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8 p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] font-headline">Distribusi Akademik</p>
                      <div className="flex items-start gap-2">
                        <div className="size-4 rounded-md bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                            <BookOpen className="size-2.5" />
                        </div>
                        <p className="text-[12px] font-bold text-slate-700 leading-tight font-headline uppercase">{selectedDosen.major?.name || '-'}</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 font-headline uppercase ml-6 tracking-tight leading-none">{selectedDosen.faculty?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] font-headline">Data Kontak Resmi</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                             <Mail className="size-3 text-slate-400" />
                             <p className="text-[12px] font-bold text-slate-600 truncate font-headline lower">{selectedDosen.user?.email || '-'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <ShieldCheck className={cn("size-3", selectedDosen.isDpa ? "text-emerald-500" : "text-slate-300")} />
                             <p className={cn("text-[10px] font-black uppercase font-headline tracking-tight", selectedDosen.isDpa ? "text-emerald-600" : "text-slate-400")}>
                                {selectedDosen.isDpa ? 'PROTOKOL DPA AKTIF' : 'NON-DPA STAFF'}
                             </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex items-center justify-end gap-3 border-t border-slate-100 -mx-10 px-10 bg-slate-50/30">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsDetailOpen(false)} 
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-xl transition-all font-headline"
                  >
                    Close Profile
                  </Button>
                  <Button 
                    onClick={() => { setIsDetailOpen(false); handleOpenEdit(selectedDosen); }} 
                    className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 font-headline"
                  >
                    Edit Records
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD MODAL */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Award className="size-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  Institutional Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {isEditMode ? 'Update Data Dosen' : 'Registrasi Pengajar'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Dokumentasi profil akademik & tenaga pengajar fakultas.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap & Gelar Akademik</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dr. Ir. Ahmad, M.T."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Universal ID (NIDN)</Label>
                  <Input
                    value={formData.nidn}
                    onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                    placeholder="00123xxx"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-black text-sm font-headline tracking-widest"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email Resmi Perpustakaan</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@univ.ac.id"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Divisi Fakultas</Label>
                  <Select value={formData.facultyId} onValueChange={(val) => setFormData({ ...formData, facultyId: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs px-4">
                      <SelectValue placeholder="Pilih Instansi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      {faculties.map(f => (
                        (f.id !== undefined && f.id !== null && f.id !== "") && (
                          <SelectItem key={f.id} value={String(f.id)} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">{f.name}</SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Program Studi</Label>
                  <Select value={formData.majorId} onValueChange={(val) => setFormData({ ...formData, majorId: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs px-4">
                      <SelectValue placeholder="Pilih Bidang" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      {majors.map(m => (
                        (m.id !== undefined && m.id !== null && m.id !== "") && (
                          <SelectItem key={m.id} value={String(m.id)} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">{m.name}</SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Posisi Jabatan Akademik</Label>
                  <Select value={formData.position} onValueChange={(val) => setFormData({ ...formData, position: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="Dosen Pengajar" className="rounded-xl font-bold text-[11px] p-3 font-headline uppercase">Dosen Pengajar</SelectItem>
                      <SelectItem value="Ketua Program Studi" className="rounded-xl font-bold text-[11px] p-3 font-black text-primary uppercase leading-tight tracking-tighter italic border-b border-primary/20 font-headline">Ketua Program Studi</SelectItem>
                      <SelectItem value="Sekretaris Prodi" className="rounded-xl font-bold text-[11px] p-3 font-black text-primary uppercase leading-tight tracking-tighter italic border-b border-primary/20 font-headline">Sekretaris Prodi</SelectItem>
                      <SelectItem value="Dekan" className="rounded-xl font-bold text-[11px] p-3 font-black text-primary uppercase leading-tight tracking-tighter italic border-b border-primary/20 font-headline">Dekan</SelectItem>
                      <SelectItem value="Wakil Dekan" className="rounded-xl font-bold text-[11px] p-3 font-black text-primary uppercase leading-tight tracking-tighter italic border-b border-primary/20 font-headline">Wakil Dekan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Pembimbing (DPA)</Label>
                  <div className="flex items-center space-x-3 bg-slate-50/50 p-3 h-12 rounded-2xl border border-slate-100 transition-all hover:bg-white cursor-pointer group">
                    <input
                      type="checkbox"
                      id="isDpa"
                      checked={formData.isDpa}
                      onChange={(e) => setFormData({ ...formData, isDpa: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary shadow-sm"
                    />
                    <Label htmlFor="isDpa" className="text-[10px] font-bold text-slate-500 cursor-pointer uppercase tracking-tight group-hover:text-primary transition-colors font-headline">Aktifkan Protokol DPA</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-8 px-8 bg-slate-50/30">
              <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline">
                Batalkan
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 font-headline">
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4 mr-3" />
                ) : (
                  <Save className="size-4 mr-3 stroke-[3px]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">{isEditMode ? 'Update Database' : 'Finalize Profile'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data Dosen?"
        description="Seluruh kredensial login dan riwayat penugasan dosen ini akan dihapus permanen dari sistem fakultas."
        loading={isSubmitting}
      />
    </div>
  )
}
