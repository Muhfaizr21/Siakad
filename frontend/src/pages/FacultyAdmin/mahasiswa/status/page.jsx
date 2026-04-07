"use client"

import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { StatCard } from "../../components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import { Avatar, AvatarFallback } from "../../components/avatar"
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Clock,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"

const statusData = [
  { id: 1, nim: "20230001", nama: "Ahmad Fauzi", prodi: "Teknik Informatika", statusLama: "Aktif", statusBaru: "Cuti", tanggal: "15 Jan 2025", keterangan: "Cuti karena sakit" },
  { id: 2, nim: "20220089", nama: "Siti Rahayu", prodi: "Sistem Informasi", statusLama: "Aktif", statusBaru: "Non-Aktif", tanggal: "10 Jan 2025", keterangan: "Tidak mendaftar ulang" },
  { id: 3, nim: "20200156", nama: "Budi Santoso", prodi: "Teknik Informatika", statusLama: "Aktif", statusBaru: "Lulus", tanggal: "20 Des 2024", keterangan: "Wisuda periode I 2025" },
  { id: 4, nim: "20210042", nama: "Dewi Lestari", prodi: "Sistem Informasi", statusLama: "Cuti", statusBaru: "Aktif", tanggal: "05 Jan 2025", keterangan: "Kembali dari cuti" },
  { id: 5, nim: "20230102", nama: "Rizki Pratama", prodi: "Teknik Informatika", statusLama: "Aktif", statusBaru: "Cuti", tanggal: "02 Jan 2025", keterangan: "Cuti akademik" },
]

const statusColors = {
  Aktif: "bg-success/20 text-success",
  Cuti: "bg-warning/20 text-warning",
  "Non-Aktif": "bg-destructive/20 text-destructive",
  Lulus: "bg-info/20 text-info",
}

export default function StatusMahasiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Status Mahasiswa</h1>
          <p className="text-on-surface-variant">Kelola dan pantau perubahan status mahasiswa</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Mahasiswa Aktif"
            value="856"
            subtitle="Terdaftar semester ini"
            icon={UserCheck}
            variant="success"
          />
          <StatCard
            title="Mahasiswa Cuti"
            value="45"
            subtitle="Sedang mengambil cuti"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Non-Aktif"
            value="23"
            subtitle="Tidak terdaftar"
            icon={UserX}
            variant="default"
          />
          <StatCard
            title="Lulus"
            value="312"
            subtitle="Total kelulusan"
            icon={GraduationCap}
            variant="info"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-success/20 p-3">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Aktivasi Mahasiswa</h3>
                <p className="text-sm text-on-surface-variant">Aktifkan kembali mahasiswa cuti</p>
              </div>
              <Button size="sm">Proses</Button>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-warning/20 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Pengajuan Cuti</h3>
                <p className="text-sm text-on-surface-variant">3 pengajuan menunggu</p>
              </div>
              <Button size="sm" variant="outline">Lihat</Button>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-info/20 p-3">
                <GraduationCap className="h-6 w-6 text-info" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Kelulusan</h3>
                <p className="text-sm text-on-surface-variant">Update status kelulusan</p>
              </div>
              <Button size="sm" variant="outline">Kelola</Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Changes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Riwayat Perubahan Status</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <Input placeholder="Cari NIM atau nama..." className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="cuti">Cuti</SelectItem>
                    <SelectItem value="non-aktif">Non-Aktif</SelectItem>
                    <SelectItem value="lulus">Lulus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Mahasiswa</TableHead>
                    <TableHead>Program Studi</TableHead>
                    <TableHead>Status Lama</TableHead>
                    <TableHead>Status Baru</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {item.nama.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.nama}</p>
                            <p className="text-xs text-on-surface-variant">{item.nim}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.prodi}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[item.statusLama]}>
                          {item.statusLama}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[item.statusBaru]}>
                          {item.statusBaru}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-on-surface-variant">{item.tanggal}</TableCell>
                      <TableCell className="text-sm">{item.keterangan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
            </div>
      </main>
    </div>
  )
}
