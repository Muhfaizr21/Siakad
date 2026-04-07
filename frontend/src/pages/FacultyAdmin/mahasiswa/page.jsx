"use client"

import React, { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { DataTable } from "../components/data-table"
import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Avatar, AvatarFallback } from "../components/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Eye, Pencil, Trash2, Mail, Phone, MapPin, Calendar, BookOpen, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const statusColors = {
  Aktif: "bg-success/20 text-success border-success/30",
  Cuti: "bg-warning/20 text-warning border-warning/30",
  "Non-Aktif": "bg-destructive/20 text-destructive border-destructive/30",
  Lulus: "bg-info/20 text-info border-info/30",
}

export default function MahasiswaPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mahasiswa ini? Semua data user terkait juga akan dihapus.")) return
    
    try {
      const res = await fetch(`http://localhost:8000/api/faculty/students/${id}`, {
        method: 'DELETE'
      })
      const json = await res.json()
      if (json.status === 'success') {
        alert("Mahasiswa berhasil dihapus")
        fetchStudents()
      } else {
        alert("Gagal menghapus: " + json.message)
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem")
    }
  }

  const handleView = (mahasiswa) => {
    setSelectedMahasiswa(mahasiswa)
    setIsDetailOpen(true)
  }

  const getStatusCapitalized = (status) => {
    if (!status) return "Aktif"
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <TopNavBar setIsOpen={setSidebarOpen} />
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold font-headline">Manajemen Mahasiswa</h1>
              <p className="text-on-surface-variant">Kelola data mahasiswa fakultas</p>
            </div>

            <div className="bg-white border border-outline-variant/10 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="p-8 border-b border-outline-variant/5 flex justify-between items-center bg-white">
                <h3 className="font-extrabold text-xl font-headline text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#00236f] text-[28px]">group</span>
                  Data Mahasiswa Terdaftar
                </h3>
                <Link to="/faculty/mahasiswa/tambah">
                  <button className="bg-primary hover:bg-primary-fixed text-white px-6 py-3 rounded-xl font-bold font-headline shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Tambah Mahasiswa
                  </button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-on-surface">
                  <thead className="bg-[#fcfcfd] border-b border-outline-variant/5 text-[11px] uppercase text-on-surface-variant font-extrabold tracking-[0.15em]">
                    <tr>
                      <th className="px-8 py-5">NIM</th>
                      <th className="px-8 py-5">Nama Mahasiswa</th>
                      <th className="px-8 py-5">Program Studi</th>
                      <th className="px-8 py-5 text-center">Semester</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5 font-medium bg-white">
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-6">Memuat data mahasiswa...</td></tr>
                    ) : studentData.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-6">Belum ada mahasiswa terdaftar</td></tr>
                    ) : studentData.map((mhs) => (
                      <tr key={mhs.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-[13px] font-bold text-on-surface-variant">
                          {mhs.nim}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-xs uppercase border border-primary/10">
                              {mhs.name?.split(" ").map(n => n[0]).join("").substring(0, 2) || '?'}
                            </div>
                            <div>
                               <span className="block font-bold text-[14px] text-on-surface leading-tight mb-1">{mhs.name}</span>
                               <span className="text-[11px] font-bold text-on-surface-variant opacity-70">{mhs.user?.email || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-[13px] text-on-surface-variant">
                          {mhs.major?.name || "Belum ada prodi"}
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-[10px] uppercase font-black bg-[#f4f4f5] px-2.5 py-1 rounded text-on-surface-variant tracking-[0.1em] block mb-1.5 lg:mx-auto w-max">SMT {mhs.currentSemester || 1}</span>
                          <span className="text-[12px] text-on-surface-variant font-bold">Angkatan {new Date(mhs.createdAt || Date.now()).getFullYear()}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`text-[10px] uppercase font-black px-3.5 py-1.5 rounded-md tracking-[0.1em] whitespace-nowrap ${getStatusCapitalized(mhs.status) === 'Aktif' ? 'bg-emerald-50 text-emerald-600' : getStatusCapitalized(mhs.status) === 'Lulus' ? 'bg-blue-50 text-blue-600' : getStatusCapitalized(mhs.status) === 'Cuti' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                            {getStatusCapitalized(mhs.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center gap-3">
                             <button onClick={() => handleView(mhs)} className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#00236f]/10 text-[#00236f] transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                             </button>
                             <button 
                                onClick={() => navigate(`/faculty/mahasiswa/edit/${mhs.id}`)}
                                className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#00236f]/10 text-[#00236f] transition-colors flex items-center justify-center"
                             >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                             </button>
                             <button 
                                onClick={() => handleDelete(mhs.id)}
                                className="w-8 h-8 rounded-lg bg-transparent hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center"
                             >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <DialogContent className="max-w-2xl bg-white shadow-2xl rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle>Detail Mahasiswa</DialogTitle>
                  <DialogDescription>Informasi lengkap mahasiswa</DialogDescription>
                </DialogHeader>
                {selectedMahasiswa && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {selectedMahasiswa.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedMahasiswa.name}</h3>
                        <p className="text-on-surface-variant">{selectedMahasiswa.nim}</p>
                        <Badge variant="outline" className={statusColors[getStatusCapitalized(selectedMahasiswa.status)] || "bg-primary/20 text-primary border-primary/30"}>
                          {getStatusCapitalized(selectedMahasiswa.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="border-none bg-slate-50 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-on-surface-variant">
                            Informasi Akademik
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-on-surface-variant" />
                            <span className="text-sm">{selectedMahasiswa.major?.name || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Angkatan</span>
                            <span className="font-medium">{new Date(selectedMahasiswa.createdAt || Date.now()).getFullYear()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Semester</span>
                            <span className="font-medium">{selectedMahasiswa.currentSemester || 1}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">Dosen Wali</span>
                            <span className="font-medium text-sm">{selectedMahasiswa.dpaLecturer?.name || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none bg-slate-50 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-on-surface-variant">
                            Informasi Kontak
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-on-surface-variant" />
                            <span className="text-sm">{selectedMahasiswa.user?.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-on-surface-variant" />
                            <span className="text-sm">{selectedMahasiswa.phone || '-'}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-on-surface-variant shrink-0 mt-0.5" />
                            <span className="text-sm text-xs leading-relaxed">{selectedMahasiswa.address || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                        Tutup
                      </Button>
                      <Button onClick={() => {
                        setIsDetailOpen(false)
                        navigate(`/faculty/mahasiswa/edit/${selectedMahasiswa.id}`)
                      }}>
                        Edit Data
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  )
}
