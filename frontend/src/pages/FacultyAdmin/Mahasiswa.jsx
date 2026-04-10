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
    ID: null,
    NIM: "",
    Nama: "",
    Email: "",
    FakultasID: "",
    ProgramStudiID: "",
    DosenPAID: "",
    SemesterSekarang: 1,
    StatusAkun: "Aktif",
    PhotoURL: "",
    Alamat: ""
  })

  // Dropdown Data
  const [majors, setMajors] = useState([])
  const [lecturers, setLecturers] = useState([])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/faculty/students')
      const json = await res.json()
      if (json.status === 'success') {
        setStudentData(json.data)
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
        fetch('http://localhost:8000/api/faculty/courses'),
        fetch('http://localhost:8000/api/faculty/lecturers')
      ])

      const majorsJson = await majorsRes.json()
      const lectJson = await lecturersRes.json()

      if (majorsJson.status === 'success') setMajors(majorsJson.data)
      if (lectJson.status === 'success') setLecturers(lectJson.data)
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
      ID: null, NIM: "", Nama: "", Email: "", FakultasID: "", ProgramStudiID: "", DosenPAID: "", SemesterSekarang: 1, StatusAkun: "Aktif", PhotoURL: "", Alamat: ""
    })
    setIsCrudOpen(true)
  }

  const handleOpenEdit = (student) => {
    setIsEditMode(true)
    setFormData({
      ID: student.ID,
      NIM: student.NIM,
      Nama: student.Nama,
      Email: student.Pengguna?.Email || "",
      FakultasID: student.FakultasID?.toString() || "",
      ProgramStudiID: student.ProgramStudiID?.toString() || "",
      DosenPAID: student.DosenPAID?.toString() || "",
      SemesterSekarang: student.SemesterSekarang || 1,
      StatusAkun: student.StatusAkun || "Aktif",
      PhotoURL: student.PhotoURL || "",
      Alamat: student.Alamat || ""
    })
    setIsCrudOpen(true)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `http://localhost:8000/api/faculty/students/${formData.ID}` : 'http://localhost:8000/api/faculty/students'
    const method = isEditMode ? 'PUT' : 'POST'

    const payload = {
      ...formData,
      FakultasID: parseInt(formData.FakultasID) || 0,
      ProgramStudiID: parseInt(formData.ProgramStudiID) || 0,
      DosenPAID: parseInt(formData.DosenPAID) || 0,
      SemesterSekarang: parseInt(formData.SemesterSekarang) || 1,
      email: formData.Email
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      
      if (res.ok && json.status === 'success') {
        toast.success(isEditMode ? "Data diperbarui" : "Mahasiswa ditambahkan")
        setIsCrudOpen(false)
        fetchStudents()
      } else {
        // Bersihkan dan format pesan error agar ramah pengguna
        let errorMsg = json.message || ""
        if (errorMsg.includes("Duplicate entry") || errorMsg.includes("unique constraint")) {
          errorMsg = "Data (Email/NIM) sudah terdaftar di sistem."
        } else if (errorMsg.includes("foreign key constraint")) {
          errorMsg = "Data terkait tidak ditemukan atau masih digunakan."
        }

        const actionName = isEditMode ? "memperbarui data" : "menambah mahasiswa"
        toast.error(`Gagal ${actionName}: ${errorMsg}`)
      }
    } catch (err) {
      const actionName = isEditMode ? "perbarui data" : "tambah mahasiswa"
      toast.error(`Terjadi kesalahan sistem saat ${actionName}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedMahasiswa?.ID) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/students/${selectedMahasiswa.ID}`, { method: 'DELETE' })
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
      key: "NIM",
      label: "NIM / ID",
      className: "w-[150px]",
      render: (value) => <span className="font-bold text-slate-400 font-headline uppercase text-[10px] tracking-widest">{value}</span>
    },
    {
      key: "Nama",
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
              {row.Pengguna?.Email || '-'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "ProgramStudi",
      label: "Program Studi",
      className: "w-[250px]",
      render: (value) => <span className="text-xs text-slate-600 font-black font-headline uppercase">{value?.Nama || "-"}</span>
    },
    {
      key: "SemesterSekarang",
      label: "Semester",
      className: "w-[100px] text-center",
      cellClassName: "text-center",
      render: (value) => <span className="font-bold text-slate-900 font-headline text-sm tracking-tighter">{value || 1}</span>
    },
    {
      key: "StatusAkun",
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
                key: 'StatusAkun',
                placeholder: 'Filter Status',
                options: [
                  { label: 'Aktif', value: 'Aktif' },
                  { label: 'Cuti', value: 'Cuti' },
                  { label: 'Lulus', value: 'Lulus' },
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
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-xl">
          {selectedMahasiswa && (
            <div className="relative flex flex-col max-h-[90vh]">
              {/* Header Profile Section */}
              <div className="h-44 bg-slate-900 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent transition-transform duration-700" />
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                  <GraduationCap className="size-48 rotate-12 text-white" />
                </div>

                <div className="absolute top-8 right-8 z-20">
                  <Badge
                    className={cn(
                      "capitalize text-[10px] font-black px-4 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-xl",
                      selectedMahasiswa.StatusAkun === 'Aktif'
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    )}
                  >
                    <span className="size-2 rounded-full bg-current mr-2 animate-pulse" />
                    {selectedMahasiswa.StatusAkun || 'Aktif'}
                  </Badge>
                </div>

                <div className="absolute -bottom-12 left-10 z-20 p-2 bg-white rounded-[2.2rem] shadow-2xl shadow-slate-900/10">
                  <Avatar className="h-32 w-32 rounded-[1.8rem] border-4 border-slate-50">
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 text-4xl font-black font-headline">
                      {selectedMahasiswa.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-10 pt-16 space-y-10 custom-scrollbar">
                <div className="flex flex-col gap-1">
                  <h2 className="text-4xl font-black text-slate-900 font-headline tracking-tighter leading-none uppercase">{selectedMahasiswa.Nama}</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-[10px] font-black bg-primary/5 text-primary border-none px-3 py-1 rounded-md tracking-wider">
                      STUDENT ARCHIVE
                    </Badge>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] font-headline">{selectedMahasiswa.NIM}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  {/* Academic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="size-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <BookOpen className="size-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Record Akademik</h3>
                    </div>
                    <div className="space-y-4 px-1">
                      <DetailItem label="Program Studi" value={selectedMahasiswa.ProgramStudi?.Nama} />
                      <DetailItem label="Fakultas" value={selectedMahasiswa.ProgramStudi?.Fakultas?.Nama} />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Semester" value={selectedMahasiswa.SemesterSekarang} />
                        <DetailItem label="Tahun Masuk" value={selectedMahasiswa.TahunMasuk || selectedMahasiswa.NIM?.substring(3, 7)} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <StatItem label="IPK" value={selectedMahasiswa.IPK?.toFixed(2) || '0.00'} color="text-emerald-600" />
                        <StatItem label="SKS" value={selectedMahasiswa.TotalSKS || '0'} color="text-blue-600" />
                        <StatItem label="LIMIT" value={selectedMahasiswa.CreditLimit || '24'} color="text-indigo-600" />
                      </div>
                      <DetailItem label="Dosen Wali (DPA)" value={selectedMahasiswa.DosenPA?.Nama || 'Belum Ditentukan'} isHighlight />
                      <DetailItem label="Jalur Masuk" value={selectedMahasiswa.JalurMasuk} />
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="size-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                        <Users className="size-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Data Pribadi</h3>
                    </div>
                    <div className="space-y-4 px-1">
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="NIK" value={selectedMahasiswa.NIK} />
                        <DetailItem label="NISN" value={selectedMahasiswa.NISN} />
                      </div>
                      <DetailItem label="TTL" value={`${selectedMahasiswa.TempatLahir || '—'}, ${selectedMahasiswa.TanggalLahir ? new Date(selectedMahasiswa.TanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}`} />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Jenis Kelamin" value={selectedMahasiswa.JenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                        <DetailItem label="Agama" value={selectedMahasiswa.Agama} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Goldar" value={selectedMahasiswa.GolonganDarah} />
                        <DetailItem label="Status" value={selectedMahasiswa.StatusPernikahan} />
                      </div>
                      <DetailItem label="Kewarganegaraan" value={selectedMahasiswa.Kewarganegaraan} />
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="size-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Mail className="size-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Kontak & Domisili</h3>
                    </div>
                    <div className="space-y-4 px-1">
                      <DetailItem label="Email Kampus" value={selectedMahasiswa.EmailKampus || selectedMahasiswa.Pengguna?.Email} />
                      <DetailItem label="No. Handphone" value={selectedMahasiswa.NoHP} />
                      <DetailItem label="Alamat" value={selectedMahasiswa.Alamat} />
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Kota" value={selectedMahasiswa.Kota} />
                        <DetailItem label="Kode Pos" value={selectedMahasiswa.KodePos} />
                      </div>
                      <DetailItem label="Kontak Darurat" value={selectedMahasiswa.KontakDarurat} />
                    </div>
                  </div>

                  {/* Family Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <UserCheck className="size-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 font-headline">Data Orang Tua</h3>
                    </div>
                    <div className="space-y-4 px-1">
                      <DetailItem label="Nama Ayah" value={selectedMahasiswa.NamaAyah} />
                      <DetailItem label="Pekerjaan Ayah" value={selectedMahasiswa.PekerjaanAyah} />
                      <DetailItem label="Nama Ibu" value={selectedMahasiswa.NamaIbuKandung} />
                      <DetailItem label="Pekerjaan Ibu" value={selectedMahasiswa.PekerjaanIbu} />
                      <DetailItem label="Penghasilan Ortu" value={selectedMahasiswa.PenghasilanOrtu ? `Rp ${selectedMahasiswa.PenghasilanOrtu.toLocaleString('id-ID')}` : '—'} />
                      <DetailItem label="Asal Sekolah" value={selectedMahasiswa.AsalSekolah} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 px-10 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <Button
                  variant="ghost"
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-8 h-12 rounded-2xl font-headline"
                >
                  Close Archive
                </Button>
                <Button
                  onClick={() => { setIsDetailOpen(false); handleOpenEdit(selectedMahasiswa); }}
                  className="text-[10px] font-black uppercase tracking-widest h-12 px-10 rounded-2xl shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 font-headline"
                >
                  Edit Records
                </Button>
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

          <form onSubmit={handleSave} className="p-8 pt-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nomor Induk (NIM)</Label>
                  <Input
                    value={formData.NIM}
                    onChange={(e) => setFormData({ ...formData, NIM: e.target.value })}
                    placeholder="Entry NIM..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Lengkap</Label>
                  <Input
                    value={formData.Nama}
                    onChange={(e) => setFormData({ ...formData, Nama: e.target.value })}
                    placeholder="Entry Nama Siswa..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Alamat Email</Label>
                  <Input
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                    placeholder="Entry Email..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Program Studi</Label>
                  <Select 
                    value={formData.ProgramStudiID} 
                    onValueChange={(val) => {
                      const selectedProdi = majors.find(m => String(m.ID) === val);
                      setFormData({ 
                        ...formData, 
                        ProgramStudiID: val, 
                        FakultasID: selectedProdi?.FakultasID?.toString() || "" 
                      });
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs">
                      <SelectValue placeholder="Pilih Prodi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      {majors.map(m => (
                        (m.ID !== undefined && m.ID !== null && m.ID !== "") && (
                          <SelectItem key={m.ID} value={String(m.ID)} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">{m.Nama}</SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Dosen Wali (DPA)</Label>
                  <Select value={formData.DosenPAID} onValueChange={(val) => setFormData({ ...formData, DosenPAID: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-bold font-headline text-xs">
                      <SelectValue placeholder="Penanggung Jawab" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="0" className="rounded-xl font-bold text-[11px] p-3 focus:bg-slate-100 uppercase opacity-50 font-headline">- KOSONGKAN -</SelectItem>
                      {lecturers.map(l => (
                        (l.ID !== undefined && l.ID !== null && l.ID !== "") && (
                          <SelectItem key={l.ID} value={String(l.ID)} className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 focus:text-primary uppercase font-headline">{l.Nama}</SelectItem>
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
                      value={formData.SemesterSekarang}
                      onChange={(e) => setFormData({ ...formData, SemesterSekarang: e.target.value })}
                      className="h-12 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-black font-headline text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Alamat Domisili</Label>
                <Textarea
                  value={formData.Alamat}
                  onChange={(e) => setFormData({ ...formData, Alamat: e.target.value })}
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

// Helper Components for Details
function DetailItem({ label, value, isHighlight = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">{label}</span>
      <span className={cn(
        "text-[12px] font-bold font-headline uppercase truncate",
        isHighlight ? "text-primary tracking-tight" : "text-slate-700"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}

function StatItem({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/50 border border-slate-100/50 shadow-sm">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</span>
      <span className={cn("text-sm font-black font-headline tracking-tighter", color)}>{value}</span>
    </div>
  )
}
