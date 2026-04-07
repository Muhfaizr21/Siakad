"use client"
import React, { useState } from "react"

import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card"
import { Badge } from "../../components/badge"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { Switch } from "../../components/switch"
import { Separator } from "../../components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/table"
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Settings,
  Save,
} from "lucide-react"

const tahunAkademikData = [
  {
    id: 1,
    tahun: "2024/2025",
    semester: "Ganjil",
    mulai: "1 Sep 2024",
    selesai: "31 Jan 2025",
    status: "Aktif",
    krs: { mulai: "1 Sep 2024", selesai: "15 Sep 2024" },
    perkuliahan: { mulai: "16 Sep 2024", selesai: "20 Des 2024" },
    uts: { mulai: "28 Okt 2024", selesai: "8 Nov 2024" },
    uas: { mulai: "6 Jan 2025", selesai: "20 Jan 2025" },
    inputNilai: { mulai: "21 Jan 2025", selesai: "31 Jan 2025" },
  },
  {
    id: 2,
    tahun: "2023/2024",
    semester: "Genap",
    mulai: "1 Feb 2024",
    selesai: "31 Jul 2024",
    status: "Selesai",
    krs: { mulai: "1 Feb 2024", selesai: "14 Feb 2024" },
    perkuliahan: { mulai: "15 Feb 2024", selesai: "31 Mei 2024" },
    uts: { mulai: "1 Apr 2024", selesai: "12 Apr 2024" },
    uas: { mulai: "10 Jun 2024", selesai: "24 Jun 2024" },
    inputNilai: { mulai: "25 Jun 2024", selesai: "15 Jul 2024" },
  },
  {
    id: 3,
    tahun: "2023/2024",
    semester: "Ganjil",
    mulai: "1 Sep 2023",
    selesai: "31 Jan 2024",
    status: "Selesai",
    krs: { mulai: "1 Sep 2023", selesai: "14 Sep 2023" },
    perkuliahan: { mulai: "15 Sep 2023", selesai: "20 Des 2023" },
    uts: { mulai: "30 Okt 2023", selesai: "10 Nov 2023" },
    uas: { mulai: "8 Jan 2024", selesai: "22 Jan 2024" },
    inputNilai: { mulai: "23 Jan 2024", selesai: "31 Jan 2024" },
  },
]

const statusColors = {
  Aktif: "bg-success/20 text-success border-success/30",
  Selesai: "bg-secondary text-on-surface-variant",
  Mendatang: "bg-info/20 text-info border-info/30",
}

export default function TahunAkademikPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">Tahun Akademik</h1>
            <p className="text-on-surface-variant">Kelola periode akademik dan kalender</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Periode
          </Button>
        </div>

        {/* Active Period */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary p-2">
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Periode Aktif</CardTitle>
                  <CardDescription>2024/2025 Semester Ganjil</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className={statusColors.Aktif}>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Aktif
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-on-surface-variant">Pengisian KRS</p>
                <p className="text-sm font-medium">1 - 15 Sep 2024</p>
                <Badge variant="secondary" className="mt-1 text-xs">Selesai</Badge>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-on-surface-variant">Perkuliahan</p>
                <p className="text-sm font-medium">16 Sep - 20 Des 2024</p>
                <Badge variant="outline" className="mt-1 text-xs bg-success/20 text-success">Berlangsung</Badge>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-on-surface-variant">UTS</p>
                <p className="text-sm font-medium">28 Okt - 8 Nov 2024</p>
                <Badge variant="secondary" className="mt-1 text-xs">Selesai</Badge>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-on-surface-variant">UAS</p>
                <p className="text-sm font-medium">6 - 20 Jan 2025</p>
                <Badge variant="outline" className="mt-1 text-xs bg-warning/20 text-warning">Mendatang</Badge>
              </div>
              <div className="rounded-lg bg-background p-3">
                <p className="text-xs text-on-surface-variant">Input Nilai</p>
                <p className="text-sm font-medium">21 - 31 Jan 2025</p>
                <Badge variant="outline" className="mt-1 text-xs bg-warning/20 text-warning">Mendatang</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tahun Akademik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Tahun Akademik</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tahunAkademikData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.tahun}</TableCell>
                      <TableCell>{item.semester}</TableCell>
                      <TableCell className="text-sm text-on-surface-variant">
                        {item.mulai} - {item.selesai}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={statusColors[item.status]}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={item.status === "Aktif"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* KRS Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Pengaturan KRS</CardTitle>
              </div>
              <CardDescription>Konfigurasi batas SKS dan perwalian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sks-min">SKS Minimum</Label>
                  <Input id="sks-min" type="number" defaultValue={12} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sks-max">SKS Maksimum</Label>
                  <Input id="sks-max" type="number" defaultValue={24} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Persetujuan Dosen Wali</p>
                    <p className="text-sm text-on-surface-variant">KRS memerlukan persetujuan dosen wali</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Validasi Prasyarat</p>
                    <p className="text-sm text-on-surface-variant">Cek mata kuliah prasyarat saat KRS</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>

          {/* Grading Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Pengaturan Nilai</CardTitle>
              </div>
              <CardDescription>Konfigurasi sistem penilaian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bobot-tugas">Bobot Tugas (%)</Label>
                  <Input id="bobot-tugas" type="number" defaultValue={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bobot-uts">Bobot UTS (%)</Label>
                  <Input id="bobot-uts" type="number" defaultValue={30} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bobot-uas">Bobot UAS (%)</Label>
                  <Input id="bobot-uas" type="number" defaultValue={40} />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nilai Otomatis</p>
                    <p className="text-sm text-on-surface-variant">Hitung nilai akhir otomatis</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lock Nilai</p>
                    <p className="text-sm text-on-surface-variant">Kunci nilai setelah deadline</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </main>
    </div>
  )
}
