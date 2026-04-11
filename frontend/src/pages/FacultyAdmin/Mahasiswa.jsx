"use client"

import React, { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import { Eye, Mail, BookOpen, GraduationCap, Users, UserCheck } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function MahasiswaPage() {
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchStudents()
  }, [])

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
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Daftar Mahasiswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informasi Akademik & Database Mahasiswa Fakultas</p>
        </div>
      </div>


      <Card className="border-none shadow-sm flex flex-col overflow-hidden bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={studentData}
            loading={loading}
            searchPlaceholder="Cari NIM atau Nama..."
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
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
