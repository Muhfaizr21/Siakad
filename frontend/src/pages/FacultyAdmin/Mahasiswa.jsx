"use client"

import React, { useState, useEffect } from "react"
import api from "../../lib/axios"
import { DataTable } from "./components/data-table"
import { Badge } from "./components/badge"
import { Button } from "./components/button"
import { Avatar, AvatarFallback } from "./components/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./components/dialog"
import { Card, CardContent } from "./components/card"
import { Eye, Mail, BookOpen, GraduationCap, Users, UserCheck, ShieldCheck, MapPin, Phone, Heart } from "lucide-react"
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
      const res = await api.get("/faculty/students")
      if (res.data.status === 'success') {
        setStudentData(res.data.data)
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
          <h1 className="text-2xl font-black text-slate-900 font-headline tracking-tighter uppercase">Database Mahasiswa</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-10 bg-primary rounded-full shadow-sm shadow-primary/30" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Portal Arsip & Monitoring Akademik Fakultas</p>
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
            <div className="flex flex-col max-h-[90vh]">
               <DialogHeader className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <GraduationCap className="size-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                      <ShieldCheck className="size-4" />
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-primary/5 text-primary border-none">
                      Integrated Student Profile
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-black font-headline tracking-tighter text-slate-900 uppercase leading-none">
                    Profil Lengkap Mahasiswa
                  </DialogTitle>
                </div>
              </DialogHeader>

              <div className="overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Identity Header */}
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-200/50 shadow-inner">
                  <Avatar className="h-28 w-28 rounded-[1.8rem] border-4 border-white shadow-xl flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 text-4xl font-black uppercase">
                      {selectedMahasiswa.Nama?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-4xl font-black text-slate-900 font-headline tracking-tighter uppercase leading-none">{selectedMahasiswa.Nama}</h3>
                    <div className="flex items-center gap-3 mt-3">
                       <span className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[12px] font-headline">{selectedMahasiswa.NIM}</span>
                       <Badge className={cn(
                          "uppercase text-[10px] font-black px-4 py-1 border-none shadow-sm",
                          selectedMahasiswa.StatusAkun === 'Aktif' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                       )}>
                          {selectedMahasiswa.StatusAkun || 'Aktif'}
                       </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2 text-primary">
                        <BookOpen className="size-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Akademik</span>
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        <InfoItem label="Program Studi" value={selectedMahasiswa.ProgramStudi?.Nama} />
                        <div className="grid grid-cols-2 gap-4">
                           <InfoItem label="Semester" value={selectedMahasiswa.SemesterSekarang} />
                           <InfoItem label="Tahun Masuk" value={selectedMahasiswa.TahunMasuk || selectedMahasiswa.NIM?.substring(3, 7)} />
                        </div>
                        <InfoItem label="Dosen Wali (DPA)" value={selectedMahasiswa.DosenPA?.Nama || 'Belum Ditentukan'} highlight />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-2 text-rose-500">
                        <Heart className="size-3" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Keluarga</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                         <div className="p-4 rounded-2xl bg-white border border-slate-100 group hover:border-rose-200 transition-colors">
                            <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Nama Ayah</span>
                            <span className="text-[11px] font-black text-slate-800 uppercase font-headline">{selectedMahasiswa.NamaAyah || '—'}</span>
                         </div>
                         <div className="p-4 rounded-2xl bg-white border border-slate-100 group hover:border-rose-200 transition-colors">
                            <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Nama Ibu Kandung</span>
                            <span className="text-[11px] font-black text-slate-800 uppercase font-headline">{selectedMahasiswa.NamaIbuKandung || '—'}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-2 px-1 border-b border-slate-200/50 pb-2 text-blue-500">
                      <UserCheck className="size-3" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Biodata & Kontak Resmi</span>
                   </div>
                   <div className="grid grid-cols-3 gap-8 px-1">
                      <InfoItem label="Tempat, Tgl Lahir" value={`${selectedMahasiswa.TempatLahir || '—'}, ${selectedMahasiswa.TanggalLahir ? new Date(selectedMahasiswa.TanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}`} />
                      <InfoItem label="NIK" value={selectedMahasiswa.NIK} />
                      <InfoItem label="Jenis Kelamin" value={selectedMahasiswa.JenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                   </div>
                   
                   {/* Prominent Contact Info */}
                   <div className="grid grid-cols-2 gap-4 mt-2">
                       <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-blue-300 transition-all">
                          <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                             <Mail className="size-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Email Institusi</span>
                             <span className="text-[11px] font-black text-slate-900 truncate font-headline">{selectedMahasiswa.EmailKampus || selectedMahasiswa.Pengguna?.Email || '—'}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-emerald-300 transition-all">
                          <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                             <Phone className="size-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Nomor Whatsapp/HP</span>
                             <span className="text-[12px] font-black text-slate-900 font-headline tracking-tight">{selectedMahasiswa.NoHP || '—'}</span>
                          </div>
                       </div>
                   </div>

                   <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <MapPin className="size-4 text-slate-300 mt-1 shrink-0" />
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alamat Domisili</span>
                         <span className="text-[11px] font-bold text-slate-700 leading-relaxed uppercase">{selectedMahasiswa.Alamat || '—'}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 px-10 flex items-center justify-end border-t border-slate-100 bg-white shrink-0">
                <Button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest h-12 px-12 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 active:scale-95 transition-all font-headline"
                >
                  Selesai
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoItem({ label, value, highlight = false }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={cn(
        "text-[11px] font-black uppercase font-headline truncate",
        highlight ? "text-primary tracking-tight font-black" : "text-slate-800"
      )}>
        {value || '—'}
      </span>
    </div>
  )
}
