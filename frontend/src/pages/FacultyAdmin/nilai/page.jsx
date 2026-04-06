"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { StatCard } from "@/components/siakad/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { Progress } from "../components/progress"
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
} from "lucide-react"

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
  Selesai: "bg-success/20 text-success border-success/30",
  Proses: "bg-warning/20 text-warning border-warning/30",
  Belum: "bg-secondary text-muted-foreground",
}

const gradeColors = {
  A: "text-success",
  "A-": "text-success",
  "B+": "text-info",
  B: "text-info",
  "B-": "text-foreground",
  "C+": "text-warning",
  C: "text-warning",
  D: "text-destructive",
  E: "text-destructive",
}

export default function NilaiPage() {
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [isInputOpen, setIsInputOpen] = useState(false)

  const handleInputNilai = (kelas) => {
    setSelectedKelas(kelas)
    setIsInputOpen(true)
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nilai & Transkrip</h1>
            <p className="text-muted-foreground">Kelola nilai mahasiswa semester berjalan</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Nilai
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import Nilai
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            title="Total Kelas"
            value="156"
            subtitle="Semester ini"
            icon={BookOpen}
            variant="primary"
          />
          <StatCard
            title="Selesai Input"
            value="98"
            subtitle="62.8% kelas"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Sedang Proses"
            value="35"
            subtitle="22.4% kelas"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Belum Input"
            value="23"
            subtitle="14.7% kelas"
            icon={AlertCircle}
            variant="default"
          />
        </div>

        {/* Deadline Warning */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-warning/20 p-3">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Batas Waktu Input Nilai</h3>
              <p className="text-sm text-muted-foreground">
                Deadline input nilai untuk semester ini adalah <strong>25 Januari 2025</strong>. 
                Masih ada 23 kelas yang belum menginput nilai.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Lihat Detail
            </Button>
          </CardContent>
        </Card>

        {/* Class List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Kelas</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Cari mata kuliah..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="belum">Belum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Mata Kuliah</TableHead>
                    <TableHead>Dosen</TableHead>
                    <TableHead className="text-center">Progress</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kelasData.map((kelas) => (
                    <TableRow key={kelas.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{kelas.mataKuliah}</p>
                          <p className="text-xs text-muted-foreground">
                            {kelas.kode} - {kelas.kelas}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{kelas.dosen}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{kelas.sudahDinilai}/{kelas.peserta}</span>
                            <span className="text-muted-foreground">
                              {Math.round((kelas.sudahDinilai / kelas.peserta) * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={(kelas.sudahDinilai / kelas.peserta) * 100}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {kelas.deadline}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={statusColors[kelas.status]}>
                          {kelas.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputNilai(kelas)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Input Nilai
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Input Nilai Dialog */}
        <Dialog open={isInputOpen} onOpenChange={setIsInputOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Input Nilai</DialogTitle>
              <DialogDescription>
                {selectedKelas && `${selectedKelas.mataKuliah} - ${selectedKelas.kelas}`}
              </DialogDescription>
            </DialogHeader>
            {selectedKelas && (
              <div className="space-y-4">
                {/* Class Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Kode MK</p>
                    <p className="font-medium">{selectedKelas.kode}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Dosen</p>
                    <p className="font-medium text-sm">{selectedKelas.dosen}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Peserta</p>
                    <p className="font-medium">{selectedKelas.peserta}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="font-medium">
                      {selectedKelas.sudahDinilai}/{selectedKelas.peserta}
                    </p>
                  </div>
                </div>

                {/* Grade Table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead>NIM</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-center w-20">Tugas</TableHead>
                        <TableHead className="text-center w-20">UTS</TableHead>
                        <TableHead className="text-center w-20">UAS</TableHead>
                        <TableHead className="text-center w-20">Nilai</TableHead>
                        <TableHead className="text-center w-20">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {nilaiMahasiswa.map((mhs) => (
                        <TableRow key={mhs.nim}>
                          <TableCell className="font-mono text-sm">{mhs.nim}</TableCell>
                          <TableCell className="font-medium">{mhs.nama}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              defaultValue={mhs.tugas}
                              className="h-8 w-16 text-center"
                              min={0}
                              max={100}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              defaultValue={mhs.uts}
                              className="h-8 w-16 text-center"
                              min={0}
                              max={100}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              defaultValue={mhs.uas}
                              className="h-8 w-16 text-center"
                              min={0}
                              max={100}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`font-bold ${gradeColors[mhs.nilai]}`}
                            >
                              {mhs.nilai}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {mhs.grade.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInputOpen(false)}>
                Batal
              </Button>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Simpan Nilai
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
            </div>
      </main>
    </div>
  )
}
