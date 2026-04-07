"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select"
import { Calendar, Clock, MapPin, Users, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

const jadwalData = [
  {
    id: 1,
    mataKuliah: "Algoritma & Pemrograman",
    kode: "TI101",
    kelas: "TI-A",
    dosen: "Dr. Ir. Andi Wijaya",
    ruang: "Lab 1",
    hari: "Senin",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    peserta: 40,
    color: "bg-primary/20 border-primary/30 text-primary",
  },
  {
    id: 2,
    mataKuliah: "Basis Data",
    kode: "TI301",
    kelas: "TI-B",
    dosen: "Prof. Dr. Budi Hartono",
    ruang: "R.301",
    hari: "Senin",
    jamMulai: "13:00",
    jamSelesai: "15:30",
    peserta: 38,
    color: "bg-info/20 border-info/30 text-info",
  },
  {
    id: 3,
    mataKuliah: "Struktur Data",
    kode: "TI201",
    kelas: "TI-A",
    dosen: "Dr. Citra Dewi",
    ruang: "R.302",
    hari: "Selasa",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    peserta: 42,
    color: "bg-success/20 border-success/30 text-success",
  },
  {
    id: 4,
    mataKuliah: "Pemrograman Web",
    kode: "TI401",
    kelas: "TI-C",
    dosen: "Farah Amalia, M.Kom.",
    ruang: "Lab 2",
    hari: "Selasa",
    jamMulai: "10:30",
    jamSelesai: "13:00",
    peserta: 35,
    color: "bg-warning/20 border-warning/30 text-warning",
  },
  {
    id: 5,
    mataKuliah: "Jaringan Komputer",
    kode: "TI502",
    kelas: "TI-A",
    dosen: "Dr. Citra Dewi",
    ruang: "Lab 3",
    hari: "Rabu",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    peserta: 40,
    color: "bg-primary/20 border-primary/30 text-primary",
  },
  {
    id: 6,
    mataKuliah: "Kecerdasan Buatan",
    kode: "TI501",
    kelas: "TI-B",
    dosen: "Dr. Ir. Andi Wijaya",
    ruang: "R.401",
    hari: "Rabu",
    jamMulai: "13:00",
    jamSelesai: "15:30",
    peserta: 32,
    color: "bg-info/20 border-info/30 text-info",
  },
  {
    id: 7,
    mataKuliah: "Sistem Informasi Manajemen",
    kode: "SI201",
    kelas: "SI-A",
    dosen: "Dr. Eko Prasetyo",
    ruang: "R.303",
    hari: "Kamis",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    peserta: 45,
    color: "bg-success/20 border-success/30 text-success",
  },
  {
    id: 8,
    mataKuliah: "Machine Learning",
    kode: "TI601",
    kelas: "TI-A",
    dosen: "Dr. Ir. Andi Wijaya",
    ruang: "Lab 1",
    hari: "Jumat",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    peserta: 28,
    color: "bg-warning/20 border-warning/30 text-warning",
  },
]

function getSchedulePosition(jamMulai) {
  const [hour] = jamMulai.split(":").map(Number)
  return hour - 7
}

function getScheduleSpan(jamMulai, jamSelesai) {
  const [startHour, startMin] = jamMulai.split(":").map(Number)
  const [endHour, endMin] = jamSelesai.split(":").map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return (endMinutes - startMinutes) / 60
}

export default function JadwalPage() {
  const [selectedProdi, setSelectedProdi] = useState("all")
  const [viewMode, setViewMode] = useState("week")

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar />
      <TopNavBar />
      <main className="ml-64 min-h-screen">
        <div className="pt-24 pb-12 px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
                <p className="text-muted-foreground">Kelola jadwal perkuliahan semester ini</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Jadwal
                </Button>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Program Studi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Prodi</SelectItem>
                    <SelectItem value="ti">Teknik Informatika</SelectItem>
                    <SelectItem value="si">Sistem Informasi</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="2024-1">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-1">2024/2025 Ganjil</SelectItem>
                    <SelectItem value="2023-2">2023/2024 Genap</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">Minggu ke-12</span>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Grid */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Jadwal Mingguan</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>6 - 11 Januari 2025</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-[1000px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border">
                      <div className="p-3 text-center text-sm font-medium text-muted-foreground">
                        Waktu
                      </div>
                      {days.map((day) => (
                        <div
                          key={day}
                          className="border-l border-border p-3 text-center text-sm font-medium"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Time Slots */}
                    <div className="relative">
                      {/* Time Labels */}
                      <div className="absolute left-0 top-0 w-20">
                        {timeSlots.map((time, index) => (
                          <div
                            key={time}
                            className="flex h-16 items-start justify-center border-b border-border px-2 pt-1 text-xs text-muted-foreground"
                          >
                            {time}
                          </div>
                        ))}
                      </div>

                      {/* Schedule Grid */}
                      <div className="ml-20 grid grid-cols-6">
                        {days.map((day) => (
                          <div key={day} className="relative border-l border-border">
                            {/* Grid Lines */}
                            {timeSlots.map((_, index) => (
                              <div
                                key={index}
                                className="h-16 border-b border-border/50"
                              />
                            ))}

                            {/* Schedule Items */}
                            {jadwalData
                              .filter((item) => item.hari === day)
                              .map((item) => {
                                const top = getSchedulePosition(item.jamMulai) * 64
                                const height = getScheduleSpan(item.jamMulai, item.jamSelesai) * 64

                                return (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      "absolute left-1 right-1 rounded-lg border p-2 cursor-pointer transition-all hover:shadow-md",
                                      item.color
                                    )}
                                    style={{ top: `${top}px`, height: `${height - 4}px` }}
                                  >
                                    <p className="text-xs font-semibold truncate">{item.mataKuliah}</p>
                                    <p className="text-xs opacity-80 truncate">{item.kode} - {item.kelas}</p>
                                    <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                                      <MapPin className="h-3 w-3" />
                                      <span>{item.ruang}</span>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daftar Jadwal Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jadwalData.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("rounded-lg p-3", item.color.split(" ")[0])}>
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{item.mataKuliah}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.kode} - {item.kelas} | {item.dosen}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.jamMulai} - {item.jamSelesai}</p>
                          <p className="text-xs text-muted-foreground">{item.hari}</p>
                        </div>
                        <Badge variant="outline">
                          <MapPin className="mr-1 h-3 w-3" />
                          {item.ruang}
                        </Badge>
                        <Badge variant="secondary">
                          <Users className="mr-1 h-3 w-3" />
                          {item.peserta}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
