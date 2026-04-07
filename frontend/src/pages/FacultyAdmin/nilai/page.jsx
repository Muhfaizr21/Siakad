"use client"

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNavBar from '../components/TopNavBar';
import { Card, CardContent, CardHeader, CardTitle } from "../components/card";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Progress } from "../components/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/dialog";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Edit,
  Save,
  Upload,
  Download,
  BookOpen,
} from "lucide-react";

const kelasData = [
  {
    id: 1,
    kode: "TI301",
    mataKuliah: "Basis Data",
    kelas: "TI-A",
    dosen: "Prof. Dr. Budi Hartono",
    peserta: 42,
    sudahDinilai: 42,
    deadline: "25 Jan 2025",
    status: "Selesai",
  },
  {
    id: 2,
    kode: "TI302",
    mataKuliah: "Pemrograman Berorientasi Objek",
    kelas: "TI-A",
    dosen: "Dr. Citra Dewi",
    peserta: 40,
    sudahDinilai: 35,
    deadline: "25 Jan 2025",
    status: "Proses",
  },
  {
    id: 3,
    kode: "TI303",
    mataKuliah: "Statistika",
    kelas: "TI-B",
    dosen: "Dr. Eko Prasetyo",
    peserta: 38,
    sudahDinilai: 0,
    deadline: "25 Jan 2025",
    status: "Belum",
  },
  {
    id: 4,
    kode: "SI301",
    mataKuliah: "Sistem Informasi Manajemen",
    kelas: "SI-A",
    dosen: "Dr. Eko Prasetyo",
    peserta: 45,
    sudahDinilai: 45,
    deadline: "25 Jan 2025",
    status: "Selesai",
  },
  {
    id: 5,
    kode: "TI501",
    mataKuliah: "Kecerdasan Buatan",
    kelas: "TI-A",
    dosen: "Dr. Ir. Andi Wijaya",
    peserta: 32,
    sudahDinilai: 20,
    deadline: "25 Jan 2025",
    status: "Proses",
  },
  {
    id: 6,
    kode: "TI502",
    mataKuliah: "Jaringan Komputer",
    kelas: "TI-B",
    dosen: "Dr. Citra Dewi",
    peserta: 40,
    sudahDinilai: 0,
    deadline: "25 Jan 2025",
    status: "Belum",
  },
]

const nilaiMahasiswa = [
  { nim: "20230001", nama: "Ahmad Fauzi Rahman", tugas: 85, uts: 78, uas: 82, nilai: "A", grade: 3.75 },
  { nim: "20230002", nama: "Budi Santoso", tugas: 75, uts: 70, uas: 72, nilai: "B+", grade: 3.25 },
  { nim: "20230003", nama: "Citra Dewi", tugas: 90, uts: 88, uas: 92, nilai: "A", grade: 4.00 },
  { nim: "20230004", nama: "Dewi Lestari", tugas: 65, uts: 60, uas: 68, nilai: "B", grade: 3.00 },
  { nim: "20230005", nama: "Eko Prasetyo", tugas: 80, uts: 82, uas: 85, nilai: "A-", grade: 3.75 },
  { nim: "20230006", nama: "Farah Amalia", tugas: 55, uts: 50, uas: 58, nilai: "C+", grade: 2.25 },
  { nim: "20230007", nama: "Gunawan Setiawan", tugas: 70, uts: 75, uas: 72, nilai: "B", grade: 3.00 },
  { nim: "20230008", nama: "Hendra Kusuma", tugas: 88, uts: 85, uas: 90, nilai: "A", grade: 4.00 },
]

const statusColors = {
  Selesai: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Proses: "bg-amber-50 text-amber-600 border border-amber-100",
  Belum: "bg-slate-100 text-on-surface-variant",
}

const gradeColors = {
  A: "text-emerald-600",
  "A-": "text-emerald-600",
  "B+": "text-blue-600",
  B: "text-blue-600",
  "B-": "text-on-surface",
  "C+": "text-amber-600",
  C: "text-amber-600",
  D: "text-rose-600",
  E: "text-rose-600",
}

export default function NilaiPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [isInputOpen, setIsInputOpen] = useState(false)

  const handleInputNilai = (kelas) => {
    setSelectedKelas(kelas)
    setIsInputOpen(true)
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        
        <div className="pt-24 pb-12 px-4 lg:px-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-on-surface font-headline uppercase leading-tight">Nilai & Transkrip</h1>
              <p className="text-on-surface-variant text-sm mt-1 font-medium">Monitoring input nilai dan verifikasi KHS Semester Ganjil 2024/2025.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full px-6 h-11 border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest hover:bg-slate-50">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button className="rounded-full px-6 h-11 bg-primary text-white shadow-lg shadow-primary/20 font-medium text-[11px] uppercase tracking-widest hover:bg-primary-fixed">
                <Upload className="mr-2 h-4 w-4" />
                Import Nilai
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                   <BookOpen className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">156</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Total Kelas</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                   <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">98</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Selesai Input</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                   <Clock className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">35</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Sedang Proses</p>
                </div>
             </Card>
             <Card className="rounded-[1.5rem] border border-outline-variant/10 shadow-sm bg-white/50 backdrop-blur-sm px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-on-surface-variant flex items-center justify-center">
                   <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                   <p className="text-2xl font-medium text-on-surface">23</p>
                   <p className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant/60">Belum Input</p>
                </div>
             </Card>
          </div>

          {/* Deadline Warning - Premium Look */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-6 flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
                <AlertCircle className="h-8 w-8" />
             </div>
             <div className="flex-1">
                <h3 className="font-medium text-on-surface uppercase tracking-tight">Peringatan Batas Waktu</h3>
                <p className="text-sm text-on-surface-variant font-medium">
                  Deadline input nilai untuk semester ini adalah <span className="text-amber-700 font-medium underline decoration-amber-200 decoration-2 underline-offset-4">25 Januari 2025</span>. 
                  Pastikan seluruh dosen sudah mengunggah nilai sebelum portal ditutup.
                </p>
             </div>
             <Button variant="outline" className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-100 font-medium text-[10px] uppercase tracking-widest px-6 h-10 hidden md:flex">
                Kirim Blast Email
             </Button>
          </div>

          {/* Main Table Section */}
          <div className="bg-white rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="font-medium text-lg font-headline text-on-surface uppercase tracking-tight">Daftar Mata Kuliah</h3>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/50" />
                      <Input placeholder="Cari Mata Kuliah atau Dosen..." className="pl-10 h-10 rounded-xl border-outline-variant/20 focus:ring-primary/20" />
                   </div>
                   <Select defaultValue="all">
                      <SelectTrigger className="w-40 h-10 rounded-xl border-outline-variant/20 font-medium text-[11px] uppercase tracking-widest">
                         <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                         <SelectItem value="all">SEMUA STATUS</SelectItem>
                         <SelectItem value="selesai">SELESAI</SelectItem>
                         <SelectItem value="proses">PROSES</SelectItem>
                         <SelectItem value="belum">BELUM INPUT</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>

             <Table>
                <TableHeader>
                   <TableRow className="bg-[#fcfcfd] hover:bg-[#fcfcfd] border-b border-outline-variant/5">
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Mata Kuliah & Kode</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant">Dosen Pengampu</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Progress Input</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-center">Status</TableHead>
                      <TableHead className="px-8 py-5 font-semibold text-[11px] uppercase tracking-[0.15em] text-on-surface-variant text-right">Aksi</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {kelasData.map((kelas) => (
                      <TableRow key={kelas.id} className="hover:bg-slate-50/50 transition-colors border-b border-outline-variant/5">
                         <TableCell className="px-8 py-6">
                            <div>
                               <p className="font-medium text-[14px] text-on-surface mb-1">{kelas.mataKuliah}</p>
                               <span className="text-[10px] font-medium text-on-surface-variant opacity-60 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded w-fit">
                                  {kelas.kode} • {kelas.kelas}
                               </span>
                            </div>
                         </TableCell>
                         <TableCell className="px-8 py-6">
                            <span className="font-medium text-[13px] text-on-surface-variant">{kelas.dosen}</span>
                         </TableCell>
                         <TableCell className="px-8 py-6">
                            <div className="w-48 mx-auto">
                               <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-2">
                                  <span>{kelas.sudahDinilai}/{kelas.peserta} Mahasiswa</span>
                                  <span className="text-primary">
                                     {Math.round((kelas.sudahDinilai / kelas.peserta) * 100)}%
                                  </span>
                               </div>
                               <Progress
                                  value={(kelas.sudahDinilai / kelas.peserta) * 100}
                                  className="h-1.5 bg-slate-100 [&>div]:bg-primary"
                               />
                            </div>
                         </TableCell>
                         <TableCell className="px-8 py-6 text-center">
                            <span className={`px-3.5 py-1.5 rounded-md text-[10px] font-medium uppercase tracking-[0.1em] whitespace-nowrap ${statusColors[kelas.status]}`}>
                               {kelas.status}
                            </span>
                         </TableCell>
                         <TableCell className="px-8 py-6 text-right">
                            <Button
                               variant="outline"
                               size="sm"
                               className="rounded-xl border-outline-variant/20 hover:bg-primary hover:text-white hover:border-primary transition-all font-medium text-[10px] uppercase tracking-widest px-4 h-9"
                               onClick={() => handleInputNilai(kelas)}
                            >
                               <Edit className="mr-2 h-3.5 w-3.5" />
                               Input Nilai
                            </Button>
                         </TableCell>
                      </TableRow>
                   ))}
                </TableBody>
             </Table>
          </div>
        </div>

        {/* Input Nilai Dialog - Premium Styling */}
        <Dialog open={isInputOpen} onOpenChange={setIsInputOpen}>
          <DialogContent className="max-w-5xl bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-8 text-white relative">
               <div className="relative z-10">
                  <DialogHeader className="mb-0">
                    <DialogTitle className="text-2xl font-medium uppercase tracking-tight">Validasi & Input Nilai</DialogTitle>
                    <DialogDescription className="text-white/70 font-medium uppercase tracking-widest text-[11px] mt-1 border-white/20">
                      {selectedKelas && `${selectedKelas.mataKuliah} • ${selectedKelas.kelas} • ${selectedKelas.dosen}`}
                    </DialogDescription>
                  </DialogHeader>
               </div>
               {/* Aesthetic Background Shapes */}
               <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 -translate-x-16 pointer-events-none"></div>
            </div>

            <div className="p-10 space-y-8">
               {/* Class Info Tiles */}
               {selectedKelas && (
                 <div className="grid grid-cols-4 gap-6">
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest mb-1">Mata Kuliah</p>
                     <p className="font-medium text-on-surface text-sm">{selectedKelas.kode}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <p className="text-[10px] font-medium text-on-surface-variant/50 uppercase tracking-widest mb-1">Total Peserta</p>
                     <p className="font-medium text-on-surface text-sm">{selectedKelas.peserta} Orang</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                     <p className="text-[10px] font-medium text-emerald-600/60 uppercase tracking-widest mb-1">Sudah Dinilai</p>
                     <p className="font-medium text-emerald-700 text-sm">{selectedKelas.sudahDinilai} Mahasiswa</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                     <p className="text-[10px] font-medium text-amber-600/60 uppercase tracking-widest mb-1">Batas Input</p>
                     <p className="font-medium text-amber-700 text-sm">{selectedKelas.deadline}</p>
                   </div>
                 </div>
               )}

               {/* Grade Table */}
               <div className="rounded-[1.5rem] bg-[#fcfcfd] border border-outline-variant/10 overflow-hidden max-h-[400px] overflow-y-auto">
                 <Table>
                   <TableHeader className="sticky top-0 z-10 bg-[#fcfcfd]">
                     <TableRow className="border-b border-outline-variant/5">
                       <TableHead className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60">Mahasiswa</TableHead>
                       <TableHead className="px-4 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60 text-center w-24">Tugas (20%)</TableHead>
                       <TableHead className="px-4 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60 text-center w-24">UTS (30%)</TableHead>
                       <TableHead className="px-4 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60 text-center w-24">UAS (50%)</TableHead>
                       <TableHead className="px-4 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60 text-center w-20">NA</TableHead>
                       <TableHead className="px-6 py-4 font-medium text-[10px] uppercase tracking-widest text-on-surface-variant/60 text-center w-20">Huruf</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {nilaiMahasiswa.map((mhs) => (
                       <TableRow key={mhs.nim} className="hover:bg-white transition-colors border-b border-outline-variant/5">
                         <TableCell className="px-6 py-4">
                            <div>
                               <p className="text-sm font-medium text-on-surface leading-tight">{mhs.nama}</p>
                               <p className="text-[10px] font-medium text-on-surface-variant opacity-60 font-mono mt-0.5">{mhs.nim}</p>
                            </div>
                         </TableCell>
                         <TableCell className="px-4 py-4 text-center">
                           <Input
                             type="number"
                             defaultValue={mhs.tugas}
                             className="h-10 w-16 text-center rounded-xl border-slate-200 font-medium mx-auto focus:ring-primary/20"
                             min={0}
                             max={100}
                           />
                         </TableCell>
                         <TableCell className="px-4 py-4 text-center">
                           <Input
                             type="number"
                             defaultValue={mhs.uts}
                             className="h-10 w-16 text-center rounded-xl border-slate-200 font-medium mx-auto focus:ring-primary/20"
                             min={0}
                             max={100}
                           />
                         </TableCell>
                         <TableCell className="px-4 py-4 text-center">
                           <Input
                             type="number"
                             defaultValue={mhs.uas}
                             className="h-10 w-16 text-center rounded-xl border-slate-200 font-medium mx-auto focus:ring-primary/20"
                             min={0}
                             max={100}
                           />
                         </TableCell>
                         <TableCell className="px-4 py-4 text-center">
                            <span className="font-medium text-on-surface">
                               {(mhs.tugas * 0.2 + mhs.uts * 0.3 + mhs.uas * 0.5).toFixed(1)}
                            </span>
                         </TableCell>
                         <TableCell className="px-6 py-4 text-center">
                            <span className={`font-medium text-sm ${gradeColors[mhs.nilai]}`}>
                               {mhs.nilai}
                            </span>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>

               <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/10">
                  <Button variant="outline" className="rounded-2xl px-8 h-12 font-medium text-[11px] uppercase tracking-widest border-outline-variant/20 hover:bg-slate-50" onClick={() => setIsInputOpen(false)}>
                    Batal
                  </Button>
                  <Button className="rounded-2xl px-10 h-12 bg-primary text-white shadow-xl shadow-primary/30 font-medium text-[11px] uppercase tracking-widest flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Simpan Nilai
                  </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
