"use client"

import { useState, useEffect } from "react"
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
import { Calendar, Clock, MapPin, Users, Plus, Filter, ChevronLeft, ChevronRight, Loader2, Save, X, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "../components/input"
import { Label } from "../components/label"

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

const colors = [
  "bg-primary/20 border-primary/30 text-primary",
  "bg-info/20 border-info/30 text-info",
  "bg-success/20 border-success/30 text-success",
  "bg-warning/20 border-warning/30 text-warning",
  "bg-rose-500/20 border-rose-500/30 text-rose-500",
  "bg-purple-500/20 border-purple-500/30 text-purple-500",
]

function getSchedulePosition(jamMulai) {
  if (!jamMulai) return 0
  const [hour] = jamMulai.split(":").map(Number)
  return hour - 7
}

function getScheduleSpan(jamMulai, jamSelesai) {
  if (!jamMulai || !jamSelesai) return 1
  const [startHour, startMin] = jamMulai.split(":").map(Number)
  const [endHour, endMin] = jamSelesai.split(":").map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return (endMinutes - startMinutes) / 60
}

export default function JadwalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProdi, setSelectedProdi] = useState("all")
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form resources
  const [courses, setCourses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [rooms, setRooms] = useState([])

  const [formData, setFormData] = useState({
    matakuliah_id: "",
    dosen_id: "",
    ruangan_id: "",
    hari: "Senin",
    jam_mulai: "08:00",
    jam_selesai: "10:00",
    kelas: "A",
    tahun_akademik: "2024/2025",
    semester_tipe: "Ganjil"
  })

  useEffect(() => {
    fetchSchedules()
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const [resC, resL, resR] = await Promise.all([
        fetch('http://localhost:8000/api/faculty/courses'),
        fetch('http://localhost:8000/api/faculty/lecturers'),
        fetch('http://localhost:8000/api/faculty/rooms')
      ])
      const [jsonC, jsonL, jsonR] = await Promise.all([resC.json(), resL.json(), resR.json()])
      
      if (jsonC.status === 'success') setCourses(jsonC.data)
      if (jsonL.status === 'success') setLecturers(jsonL.data)
      if (jsonR.status === 'success') setRooms(jsonR.data)
    } catch (err) {
      console.error("Failed to fetch resources:", err)
    }
  }

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/faculty/schedules')
      const json = await response.json()
      if (json.status === 'success') {
        const mappedData = json.data.map((item, index) => ({
          id: item.id,
          matakuliah_id: item.matakuliah_id,
          dosen_id: item.dosen_id,
          ruangan_id: item.ruangan_id,
          mataKuliah: item.matakuliah?.nama_mk || "N/A",
          kode: item.matakuliah?.kode_mk || "-",
          kelas: item.kelas,
          dosen: item.dosen?.name || "N/A",
          ruang: item.ruangan?.nama_ruangan || "-",
          hari: item.hari,
          jamMulai: item.jam_mulai,
          jamSelesai: item.jam_selesai,
          peserta: 0,
          color: colors[index % colors.length]
        }))
        setSchedules(mappedData)
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const url = editingSchedule 
      ? `http://localhost:8000/api/faculty/schedules/${editingSchedule.id}`
      : 'http://localhost:8000/api/faculty/schedules'
    
    const method = editingSchedule ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          matakuliah_id: parseInt(formData.matakuliah_id),
          dosen_id: parseInt(formData.dosen_id),
          ruangan_id: parseInt(formData.ruangan_id)
        })
      })

      const result = await response.json()
      if (result.status === 'success') {
        alert(editingSchedule ? "Jadwal berhasil diperbarui!" : "Jadwal berhasil ditambahkan!")
        setIsModalOpen(false)
        setEditingSchedule(null)
        fetchSchedules()
      } else {
        alert("Error: " + result.message)
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      matakuliah_id: schedule.matakuliah_id.toString(),
      dosen_id: schedule.dosen_id.toString(),
      ruangan_id: schedule.ruangan_id.toString(),
      hari: schedule.hari,
      jam_mulai: schedule.jamMulai,
      jam_selesai: schedule.jamSelesai,
      kelas: schedule.kelas,
      tahun_akademik: "2024/2025",
      semester_tipe: "Ganjil"
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return

    try {
      const response = await fetch(`http://localhost:8000/api/faculty/schedules/${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      if (result.status === 'success') {
        // Segera update data di layar tanpa menunggu klik OK pada alert
        fetchSchedules()
        console.log("Jadwal berhasil dihapus:", id)
      } else {
        alert("Gagal menghapus: " + result.message)
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Kesalahan koneksi")
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
                <p className="text-on-surface-variant">Kelola jadwal perkuliahan semester ini</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button onClick={() => { setEditingSchedule(null); setFormData({
                  matakuliah_id: "",
                  dosen_id: "",
                  ruangan_id: "",
                  hari: "Senin",
                  jam_mulai: "08:00",
                  jam_selesai: "10:00",
                  kelas: "A",
                  tahun_akademik: "2024/2025",
                  semester_tipe: "Ganjil"
                }); setIsModalOpen(true); }}>
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

            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-on-surface-variant animate-pulse">Memuat data jadwal...</p>
              </div>
            ) : (
              <>
                {/* Schedule Grid */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Jadwal Mingguan</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
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
                          <div className="p-3 text-center text-sm font-medium text-on-surface-variant">
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
                                className="flex h-16 items-start justify-center border-b border-border px-2 pt-1 text-xs text-on-surface-variant"
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
                                {schedules
                                  .filter((item) => item.hari === day)
                                  .map((item) => {
                                    const top = getSchedulePosition(item.jamMulai) * 64
                                    const height = getScheduleSpan(item.jamMulai, item.jamSelesai) * 64

                                    return (
                                      <div
                                        key={item.id}
                                        className={cn(
                                          "absolute left-1 right-1 rounded-lg border p-2 cursor-pointer transition-all hover:shadow-md group overflow-hidden hover:z-20",
                                          item.color
                                        )}
                                        style={{ top: `${top}px`, height: `${height - 4}px` }}
                                      >
                                        <div className="flex justify-between items-start">
                                          <p className="text-xs font-semibold truncate flex-1 leading-tight">{item.mataKuliah}</p>
                                          <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-1 transition-opacity shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1 bg-white/50 rounded-md hover:bg-white/80 text-primary shadow-sm">
                                              <Pencil className="h-3 w-3" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1 bg-white/50 rounded-md hover:bg-rose-500 hover:text-white text-rose-600 shadow-sm">
                                              <Trash2 className="h-3 w-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-[10px] opacity-80 truncate">{item.kode} - {item.kelas}</p>
                                        <div className="mt-1 flex items-center gap-1 text-[10px] opacity-70">
                                          <MapPin className="h-3 w-3 shrink-0" />
                                          <span className="truncate">{item.ruang}</span>
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
                    <CardTitle className="text-base">Daftar Semua Jadwal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {schedules.map((item) => (
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
                              <p className="text-sm text-on-surface-variant">
                                {item.kode} - {item.kelas} | {item.dosen}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-medium">{item.jamMulai} - {item.jamSelesai}</p>
                              <p className="text-xs text-on-surface-variant">{item.hari}</p>
                            </div>
                            <Badge variant="outline">
                              <MapPin className="mr-1 h-3 w-3" />
                              {item.ruang}
                            </Badge>
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              {item.peserta}
                            </Badge>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm" className="h-8 text-primary border-primary/20 hover:bg-primary/5 px-2" onClick={() => handleEdit(item)}>
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-rose-500 border-rose-500/20 hover:bg-rose-50 px-2" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Tambah Jadwal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>{editingSchedule ? "Edit Jadwal Perkuliahan" : "Tambah Jadwal Perkuliahan"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setIsModalOpen(false); setEditingSchedule(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mata Kuliah</Label>
                    <Select value={formData.matakuliah_id} onValueChange={(v) => setFormData({...formData, matakuliah_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Mata Kuliah" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[110]">
                        {courses.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.kode_mk} - {c.nama_mk}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosen Pengampu</Label>
                    <Select value={formData.dosen_id} onValueChange={(v) => setFormData({...formData, dosen_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Dosen" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[110]">
                        {lecturers.map(l => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ruangan</Label>
                    <Select value={formData.ruangan_id} onValueChange={(v) => setFormData({...formData, ruangan_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Ruangan" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[110]">
                        {rooms.map(r => (
                          <SelectItem key={r.id} value={r.id.toString()}>{r.nama_ruangan} ({r.kode_ruangan})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hari</Label>
                    <Select value={formData.hari} onValueChange={(v) => setFormData({...formData, hari: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[110]">
                        {days.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Mulai</Label>
                    <Input type="time" value={formData.jam_mulai} onChange={(e) => setFormData({...formData, jam_mulai: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jam Selesai</Label>
                    <Input type="time" value={formData.jam_selesai} onChange={(e) => setFormData({...formData, jam_selesai: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kelas</Label>
                    <Input value={formData.kelas} onChange={(e) => setFormData({...formData, kelas: e.target.value})} placeholder="Contoh: A, B, atau TI-1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tahun Akademik</Label>
                    <Input value={formData.tahun_akademik} onChange={(e) => setFormData({...formData, tahun_akademik: e.target.value})} />
                  </div>
                </div>
              </CardContent>
              <div className="flex items-center justify-end gap-3 p-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Jadwal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
