"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { StatCard } from "@/components/siakad/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { Avatar, AvatarFallback } from "../components/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/dialog"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Check,
  X,
  AlertCircle,
  BookOpen,
} from "lucide-react"

const krsData = [
  {
    id: 1,
    nim: "20230001",
    nama: "Ahmad Fauzi Rahman",
    prodi: "Teknik Informatika",
    semester: 3,
    ipkTerakhir: 3.75,
    batasSks: 24,
    sksDiambil: 21,
    status: "Menunggu",
    tanggalPengajuan: "15 Jan 2025, 08:30",
    mataKuliah: [
      { kode: "TI301", nama: "Basis Data", sks: 4 },
      { kode: "TI302", nama: "Pemrograman Berorientasi Objek", sks: 3 },
      { kode: "TI303", nama: "Statistika", sks: 3 },
      { kode: "TI304", nama: "Matematika Diskrit", sks: 3 },
      { kode: "TI305", nama: "Sistem Operasi", sks: 4 },
      { kode: "TI306", nama: "Bahasa Inggris III", sks: 2 },
      { kode: "TI307", nama: "Pancasila", sks: 2 },
    ],
  },
  {
    id: 2,
    nim: "20230015",
    nama: "Siti Rahayu Putri",
    prodi: "Sistem Informasi",
    semester: 3,
    ipkTerakhir: 3.82,
    batasSks: 24,
    sksDiambil: 24,
    status: "Menunggu",
    tanggalPengajuan: "15 Jan 2025, 09:15",
    mataKuliah: [
      { kode: "SI301", nama: "Sistem Informasi Manajemen", sks: 3 },
      { kode: "SI302", nama: "Basis Data", sks: 4 },
      { kode: "SI303", nama: "Analisis Sistem", sks: 3 },
      { kode: "SI304", nama: "Pemrograman Web", sks: 3 },
      { kode: "SI305", nama: "Statistika Bisnis", sks: 3 },
      { kode: "SI306", nama: "Manajemen Proyek TI", sks: 3 },
      { kode: "SI307", nama: "Etika Profesi", sks: 2 },
      { kode: "SI308", nama: "Kewirausahaan", sks: 3 },
    ],
  },
  {
    id: 3,
    nim: "20220042",
    nama: "Budi Santoso",
    prodi: "Teknik Informatika",
    semester: 5,
    ipkTerakhir: 3.45,
    batasSks: 22,
    sksDiambil: 18,
    status: "Disetujui",
    tanggalPengajuan: "14 Jan 2025, 14:00",
    mataKuliah: [
      { kode: "TI501", nama: "Kecerdasan Buatan", sks: 3 },
      { kode: "TI502", nama: "Jaringan Komputer", sks: 3 },
      { kode: "TI503", nama: "Rekayasa Perangkat Lunak", sks: 4 },
      { kode: "TI504", nama: "Keamanan Sistem", sks: 3 },
      { kode: "TI505", nama: "Pengolahan Citra Digital", sks: 3 },
      { kode: "TI506", nama: "Bahasa Indonesia", sks: 2 },
    ],
  },
  {
    id: 4,
    nim: "20230089",
    nama: "Dewi Lestari",
    prodi: "Sistem Informasi",
    semester: 3,
    ipkTerakhir: 2.85,
    batasSks: 20,
    sksDiambil: 22,
    status: "Ditolak",
    tanggalPengajuan: "14 Jan 2025, 10:30",
    keterangan: "Melebihi batas SKS",
    mataKuliah: [
      { kode: "SI301", nama: "Sistem Informasi Manajemen", sks: 3 },
      { kode: "SI302", nama: "Basis Data", sks: 4 },
      { kode: "SI303", nama: "Analisis Sistem", sks: 3 },
      { kode: "SI304", nama: "Pemrograman Web", sks: 3 },
      { kode: "SI305", nama: "Statistika Bisnis", sks: 3 },
      { kode: "SI306", nama: "Manajemen Proyek TI", sks: 3 },
      { kode: "SI307", nama: "Etika Profesi", sks: 3 },
    ],
  },
  {
    id: 5,
    nim: "20230102",
    nama: "Rizki Pratama",
    prodi: "Teknik Informatika",
    semester: 3,
    ipkTerakhir: 3.28,
    batasSks: 22,
    sksDiambil: 20,
    status: "Menunggu",
    tanggalPengajuan: "15 Jan 2025, 11:45",
    mataKuliah: [
      { kode: "TI301", nama: "Basis Data", sks: 4 },
      { kode: "TI302", nama: "Pemrograman Berorientasi Objek", sks: 3 },
      { kode: "TI303", nama: "Statistika", sks: 3 },
      { kode: "TI304", nama: "Matematika Diskrit", sks: 3 },
      { kode: "TI305", nama: "Sistem Operasi", sks: 4 },
      { kode: "TI306", nama: "Bahasa Inggris III", sks: 3 },
    ],
  },
]

const statusColors = {
  Menunggu: "bg-warning/20 text-warning border-warning/30",
  Disetujui: "bg-success/20 text-success border-success/30",
  Ditolak: "bg-destructive/20 text-destructive border-destructive/30",
}

const statusIcons = {
  Menunggu: Clock,
  Disetujui: CheckCircle2,
  Ditolak: XCircle,
}

export default function KRSPage() {
  const [selectedKRS, setSelectedKRS] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")

  const handleView = (krs) => {
    setSelectedKRS(krs)
    setIsDetailOpen(true)
  }

  const filteredData = krsData.filter(
    (item) => filterStatus === "all" || item.status.toLowerCase() === filterStatus
  )

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">KRS & Perwalian</h1>
          <p className="text-muted-foreground">Kelola Kartu Rencana Studi mahasiswa</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            title="Total Pengajuan"
            value="256"
            subtitle="Semester ini"
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Menunggu Persetujuan"
            value="45"
            subtitle="Perlu ditinjau"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Disetujui"
            value="198"
            subtitle="KRS telah aktif"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Ditolak"
            value="13"
            subtitle="Perlu revisi"
            icon={XCircle}
            variant="default"
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Pengajuan KRS</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari NIM atau nama..." className="pl-10" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="disetujui">Disetujui</SelectItem>
                  <SelectItem value="ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Mahasiswa</TableHead>
                    <TableHead>Program Studi</TableHead>
                    <TableHead className="text-center">Semester</TableHead>
                    <TableHead className="text-center">IPK</TableHead>
                    <TableHead className="text-center">SKS</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const StatusIcon = statusIcons[item.status]
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {item.nama.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{item.nama}</p>
                              <p className="text-xs text-muted-foreground">{item.nim}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.prodi}</TableCell>
                        <TableCell className="text-center">{item.semester}</TableCell>
                        <TableCell className="text-center">
                          <span className={item.ipkTerakhir >= 3.5 ? "text-success font-medium" : ""}>
                            {item.ipkTerakhir.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={item.sksDiambil > item.batasSks ? "text-destructive" : ""}>
                            {item.sksDiambil}/{item.batasSks}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={statusColors[item.status]}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.tanggalPengajuan}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {item.status === "Menunggu" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-success hover:text-success"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detail KRS</DialogTitle>
              <DialogDescription>Kartu Rencana Studi Mahasiswa</DialogDescription>
            </DialogHeader>
            {selectedKRS && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedKRS.nama.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedKRS.nama}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedKRS.nim} - {selectedKRS.prodi}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={statusColors[selectedKRS.status]}>
                      {selectedKRS.status}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{selectedKRS.tanggalPengajuan}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">Semester</p>
                    <p className="text-xl font-bold">{selectedKRS.semester}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">IPK Terakhir</p>
                    <p className="text-xl font-bold text-success">{selectedKRS.ipkTerakhir.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">Batas SKS</p>
                    <p className="text-xl font-bold">{selectedKRS.batasSks}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3 text-center">
                    <p className="text-sm text-muted-foreground">SKS Diambil</p>
                    <p className={`text-xl font-bold ${selectedKRS.sksDiambil > selectedKRS.batasSks ? "text-destructive" : ""}`}>
                      {selectedKRS.sksDiambil}
                    </p>
                  </div>
                </div>

                {/* Course List */}
                <div>
                  <h4 className="mb-3 font-medium">Mata Kuliah yang Diambil</h4>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/50">
                          <TableHead>Kode</TableHead>
                          <TableHead>Nama Mata Kuliah</TableHead>
                          <TableHead className="text-center">SKS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedKRS.mataKuliah.map((mk, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">{mk.kode}</TableCell>
                            <TableCell>{mk.nama}</TableCell>
                            <TableCell className="text-center">{mk.sks}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-secondary/30">
                          <TableCell colSpan={2} className="font-medium text-right">
                            Total SKS
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {selectedKRS.sksDiambil}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedKRS.keterangan && (
                  <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <div>
                      <p className="font-medium text-destructive">Alasan Penolakan</p>
                      <p className="text-sm text-muted-foreground">{selectedKRS.keterangan}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </Button>
              {selectedKRS?.status === "Menunggu" && (
                <>
                  <Button variant="destructive">
                    <X className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                  <Button>
                    <Check className="mr-2 h-4 w-4" />
                    Setujui
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
            </div>
      </main>
    </div>
  )
}
