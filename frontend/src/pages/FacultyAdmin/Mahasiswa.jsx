"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
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
import { Eye, Pencil, Trash2, Mail, BookOpen, Loader2, Plus, Save, UserCheck, Clock, GraduationCap, Users } from "lucide-react"
import { Input } from "./components/input"
import { Label } from "./components/label"
import { Textarea } from "./components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/select"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

const normalizeStudent = (item = {}) => {
  const user = item.Pengguna || item.pengguna || {};
  const prodi = item.ProgramStudi || item.program_studi || {};
  const dpa = item.DosenPA || item.dosen_pa || {};

  return {
    id: item.ID || item.id || 0,
    nim: item.NIM || item.nim || '-',
    nama_mahasiswa: item.Nama || item.nama || '-',
    name: item.Nama || item.nama || '-',
    email: user.Email || user.email || '',
    user: {
      email: user.Email || user.email || '',
    },
    fakultas_id: item.FakultasID || item.fakultas_id || '',
    prodi_id: item.ProgramStudiID || item.program_studi_id || '',
    prodi: {
      id: prodi.ID || prodi.id || item.ProgramStudiID || item.program_studi_id || '',
      nama_prodi: prodi.Nama || prodi.nama || '-',
    },
    major: {
      id: prodi.ID || prodi.id || item.ProgramStudiID || item.program_studi_id || '',
      name: prodi.Nama || prodi.nama || '-',
    },
    currentSemester: item.Semester || item.semester || 1,
    status: item.StatusAkun || item.status_akun || 'Aktif',
    phone: item.NoHP || item.no_hp || '-',
    address: item.Alamat || item.alamat || '',
    dpaLecturerId: item.DosenPAID || item.dosen_pa_id || 0,
    dpaLecturer: {
      id: dpa.ID || dpa.id || 0,
      name: dpa.Nama || dpa.nama || 'BELUM DITENTUKAN',
    },
  };
};

const normalizeMajor = (item = {}) => ({
  id: item.ID || item.id || 0,
  name: item.Nama || item.nama || '-',
});

const normalizeLecturer = (item = {}) => ({
  id: item.ID || item.id || 0,
  name: item.Nama || item.nama || '-',
});

export default function MahasiswaPage() {
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)

  // CRUD Modal States
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)

  const [formData, setFormData] = useState({
    id: null,
    nim: "",
    nama_mahasiswa: "",
    name: "",
    email: "",
    fakultas_id: "",
    prodi_id: "",
    majorId: "",
    dpaLecturerId: "0",
    currentSemester: 1,
    status: "Aktif",
    photoUrl: "",
    address: "",
    phone: "",
  })

  // Dropdown Data
  const [majors, setMajors] = useState([])
  const [lecturers, setLecturers] = useState([])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/faculty/students')
      const json = await res.json()
      if (json.status === 'success') {
        const list = Array.isArray(json.data) ? json.data.map(normalizeStudent) : []
        setStudentData(list)
      }
    } catch (err) {
      toast.error("Gagal mengambil data mahasiswa")
    } finally {
      setLoading(false)
    }
  }

  const fetchDependencies = async () => {
    try {
      const [majorsRes, lecturersRes] = await Promise.all([
        fetch('/api/faculty/courses'),
        fetch('/api/faculty/lecturers')
      ])

      const majorsJson = await majorsRes.json()
      const lectJson = await lecturersRes.json()

      if (majorsJson.status === 'success') {
        const majorList = Array.isArray(majorsJson.data) ? majorsJson.data.map(normalizeMajor) : []
        setMajors(majorList)
      }
      if (lectJson.status === 'success') {
        const lecturerList = Array.isArray(lectJson.data) ? lectJson.data.map(normalizeLecturer) : []
        setLecturers(lecturerList)
      }
    } catch (err) {
      console.error("Failed to fetch dependencies")
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchDependencies()
  }, [])

  const handleOpenAdd = () => {
    setIsEditMode(false)
    setFormData({
      id: null,
      nim: "",
      nama_mahasiswa: "",
      name: "",
      email: "",
      fakultas_id: "",
      prodi_id: "",
      majorId: "",
      dpaLecturerId: "0",
      currentSemester: 1,
      status: "Aktif",
      photoUrl: "",
      address: "",
      phone: "",
    })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (student) => {
    setIsEditMode(true)
    setFormData({
      id: student.id,
      nim: student.nim,
      nama_mahasiswa: student.nama_mahasiswa,
      name: student.name || student.nama_mahasiswa,
      email: student.email || "",
      fakultas_id: student.fakultas_id?.toString() || "",
      prodi_id: student.prodi_id?.toString() || "",
      majorId: student.major?.id ? String(student.major.id) : (student.prodi_id?.toString() || ""),
      dpaLecturerId: student.dpaLecturer?.id ? String(student.dpaLecturer.id) : "0",
      currentSemester: student.currentSemester,
      status: student.status || "Aktif",
      photoUrl: student.photoUrl || "",
      address: student.address || "",
      phone: student.phone || "",
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `/api/faculty/students/${formData.id}` : '/api/faculty/students'
    const method = isEditMode ? 'PUT' : 'POST'

    const payload = {
      nim: formData.nim,
      nama: formData.name || formData.nama_mahasiswa,
      program_studi_id: parseInt(formData.majorId || formData.prodi_id) || 0,
      dosen_pa_id: parseInt(formData.dpaLecturerId) || 0,
      semester: parseInt(formData.currentSemester) || 1,
      status_akun: formData.status || 'Aktif',
      alamat: formData.address || '',
      no_hp: formData.phone || '',
      email: formData.email || '',
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (json.status === 'success') {
        toast.success(isEditMode ? "Data diperbarui" : "Mahasiswa ditambahkan")
        setIsCrudOpen(false)
        fetchStudents()
      } else {
        toast.error(json.message)
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMahasiswa?.id) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/faculty/students/${selectedMahasiswa.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.status === 'success') {
        toast.success("Mahasiswa dihapus")
        setIsDelOpen(false)
        fetchStudents()
      }
    } catch (err) {
      toast.error("Gagal menghapus")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa)
    setIsDetailOpen(true)
  }

  const columns = [
    {
      key: "nim",
      label: "NIM / ID",
      className: "w-[150px]",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value}</span>
    },
    {
      key: "nama_mahasiswa",
      label: "Profil Mahasiswa",
      className: "w-auto min-w-[300px]",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100 uppercase font-black text-slate-800">
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
      className: "w-[250px]",
      render: (value) => <span className="text-xs text-slate-600 font-black font-headline uppercase">{value?.nama_prodi || "-"}</span>
    },
    {
      key: "currentSemester",
      label: "Semester",
      className: "w-[100px] text-center",
      cellClassName: "text-center",
      render: (value) => <span className="font-bold text-slate-900 font-headline text-sm tracking-tighter">{value || 1}</span>
    },
    {
      key: "status",
      label: "Status",
      className: "w-[150px] text-center",
      cellClassName: "text-center",
      render: (val) => (
        <Badge
          className={cn(
            "capitalize font-black text-[10px] px-3 py-1 border-none shadow-sm font-headline",
            (val === 'active' || val === 'Aktif') ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20" :
              (val === 'leave' || val === 'Cuti') ? "bg-amber-100 text-amber-700 ring-1 ring-amber-500/20" :
                (val === 'graduated' || val === 'Lulus') ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500/20" :
                  "bg-slate-100 text-slate-700 ring-1 ring-slate-500/20"
          )}
        >
          {val || 'Aktif'}
        </Badge>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-col gap-1.5 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <GraduationCap className="size-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Manajemen Mahasiswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Akademik & Database Siswa</p>
        </div>
      </div>


      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={studentData}
            loading={loading}
            searchPlaceholder="Cari NIM atau Nama..."
            onAdd={handleOpenAdd}
            addLabel="Mahasiswa Baru"
            onExport={() => alert("Ekspor Seluruh Mahasiswa...")}
            exportLabel="Download Master"
            filters={[
              {
                key: 'status',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Aktif', value: 'active' },
                  { label: 'Cuti', value: 'leave' },
                  { label: 'Lulus', value: 'graduated' },
                  { label: 'DO', value: 'do' },
                ]
              }
            ]}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button onClick={() => handleView(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-xl">
                  <Eye className="size-4" />
                </Button>
                <Button onClick={() => handleOpenEdit(row)} variant="ghost" size="icon" className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50 rounded-xl">
                  <Pencil className="size-4" />
                </Button>
                <Button onClick={() => { setSelectedMahasiswa(row); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-8 w-8 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
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
          {selectedMahasiswa && (
            <div className="relative">
              {/* Header Profile Section */}
              <div className="h-40 bg-slate-900 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                  <GraduationCap className="size-40 rotate-12 text-white" />
                </div>

                <div className="absolute top-8 right-8 z-20">
                  <Badge
                    className={cn(
                      "capitalize text-[9px] font-black px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-xl",
                      selectedMahasiswa.status === 'active' || selectedMahasiswa.status === 'Aktif'
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current mr-2 animate-pulse" />
                    {selectedMahasiswa.status || 'Active'}
                  </Badge>
                </div>

                <div className="absolute -bottom-14 left-10 z-20 p-2 bg-white rounded-[2.2rem] shadow-2xl shadow-slate-900/10">
                  <Avatar className="h-28 w-28 rounded-[1.8rem] border-4 border-slate-50">
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-3xl font-black font-headline">
                      {selectedMahasiswa.name?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Content Section */}
              <div className="pt-18 pb-10 px-10 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{selectedMahasiswa.name}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] font-black bg-primary/5 text-primary border-none px-2 py-0.5 rounded-md">
                        STUDENT RECORD
                      </Badge>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-headline">{selectedMahasiswa.nim}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8 p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] font-headline">Program Studi</p>
                      <div className="flex items-start gap-2">
                        <div className="size-4 rounded-md bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                          <BookOpen className="size-2.5" />
                        </div>
                        <p className="text-[12px] font-bold text-slate-700 leading-tight font-headline uppercase">{selectedMahasiswa.major?.name || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] font-headline">Tahun Masuk / Semester</p>
                      <p className="text-[14px] font-black text-slate-800 font-headline tabular-nums">
                        {selectedMahasiswa.nim?.substring(0, 2) ? `20${selectedMahasiswa.nim.substring(0, 2)}` : '-'}
                        <span className="mx-2 text-slate-300 font-normal">/</span>
                        Semester {selectedMahasiswa.currentSemester || 1}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] font-headline">Data Kontak Pribadi</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3 text-slate-400" />
                          <p className="text-[12px] font-bold text-slate-600 truncate font-headline lower">{selectedMahasiswa.user?.email || '-'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="size-3 text-slate-400" />
                          <p className="text-[12px] font-bold text-slate-600 font-headline">{selectedMahasiswa.phone || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] font-headline">Dosen Wali (DPA)</p>
                      <p className="text-[12px] font-bold text-slate-700 font-headline uppercase">{selectedMahasiswa.dpaLecturer?.name || 'BELUM DITENTUKAN'}</p>
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
                    onClick={() => { setIsDetailOpen(false); handleOpenEdit(selectedMahasiswa); }}
                    className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 font-headline"
                  >
                    Edit Record
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CRUD MODAL */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white/95 backdrop-blur-xl max-h-[85vh]">
          <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <GraduationCap className="size-24 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                  {isEditMode ? <Pencil className="size-4" /> : <Plus className="size-4 stroke-[3px]" />}
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                  Student Registry
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase">
                {isEditMode ? 'Update Mahasiswa' : 'Registrasi Baru'}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-400 mt-1">
                Dokumentasi data akademik & personal mahasiswa terintegrasi.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-6 overflow-y-auto max-h-[68vh]">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nomor Induk (NIM)</Label>
                  <Input
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="Entry NIM..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Entry Nama Siswa..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Alamat Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Entry Email..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Program Studi</Label>
                  <Select value={formData.majorId} onValueChange={(val) => setFormData({ ...formData, majorId: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs">
                      <SelectValue placeholder="Pilih Prodi" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Dosen Wali (DPA)</Label>
                  <Select value={formData.dpaLecturerId} onValueChange={(val) => setFormData({ ...formData, dpaLecturerId: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs">
                      <SelectValue placeholder="Penanggung Jawab" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="0" className="rounded-xl font-bold text-[11px] p-3 focus:bg-slate-100 uppercase opacity-50 font-headline">- KOSONGKAN -</SelectItem>
                      {lecturers.map(l => (
                        (l.id !== undefined && l.id !== null && l.id !== "") && (
                          <SelectItem key={l.id} value={String(l.id)} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">{l.name}</SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Semester Aktif</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] font-headline">SMT</div>
                    <Input
                      type="number"
                      value={formData.currentSemester}
                      onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                      className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-black font-headline text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Alamat Domisili</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Entry Alamat Lengkap..."
                  className="min-h-[100px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white p-4 font-medium text-sm leading-relaxed font-headline"
                />
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-headline">{isEditMode ? 'Update Record' : 'Create Record'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Mahasiswa?"
        description="Data akademik dan histori mahasiswa ini akan dihapus secara permanen dari sistem."
        loading={isSubmitting}
      />
    </div>
  )
}
