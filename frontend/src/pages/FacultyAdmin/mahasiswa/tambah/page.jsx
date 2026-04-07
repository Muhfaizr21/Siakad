// React Router component

import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { Textarea } from "../../components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import { Separator } from "../../components/separator"
import { ArrowLeft, Save, User, BookOpen, MapPin, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function TambahMahasiswaPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [majors, setMajors] = useState([])
  const [lecturers, setLecturers] = useState([])
  
  const [formData, setFormData] = useState({
    nim: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    majorId: "",
    currentSemester: 1,
    dpaLecturerId: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [majorsRes, lecturersRes] = await Promise.all([
          fetch('http://localhost:8000/api/faculty/courses'),
          fetch('http://localhost:8000/api/faculty/lecturers')
        ])
        
        // Mock majors for now 
        setMajors([
          { id: 1, name: "Teknik Informatika" },
          { id: 2, name: "Sistem Informasi" }
        ])

        const lectJson = await lecturersRes.json()
        if (lectJson.status === 'success') setLecturers(lectJson.data)
      } catch (err) {
        console.error("Failed to fetch dependencies:", err)
      }
    }
    fetchData()
  }, [])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8000/api/faculty/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          majorId: parseInt(formData.majorId),
          dpaLecturerId: parseInt(formData.dpaLecturerId),
          currentSemester: parseInt(formData.currentSemester)
        })
      })

      const result = await response.json()
      if (result.status === 'success') {
        alert("Mahasiswa berhasil ditambahkan!")
        navigate('/faculty/mahasiswa')
      } else {
        alert("Error: " + result.message)
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link to="/faculty/mahasiswa">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Tambah Mahasiswa Baru</h1>
                <p className="text-on-surface-variant">Isi formulir untuk mendaftarkan mahasiswa baru</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Data Pribadi</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="nim">NIM</Label>
                          <Input id="nim" value={formData.nim} onChange={(e) => handleChange("nim", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nama">Nama Lengkap</Label>
                          <Input id="nama" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">No. Telepon</Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <CardTitle>Alamat</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={formData.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Alamat Lengkap" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>Data Akademik</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Program Studi</Label>
                          <Select onValueChange={(value) => handleChange("majorId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih prodi" />
                            </SelectTrigger>
                            <SelectContent>
                              {majors.map(m => (
                                <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Semester</Label>
                          <Input type="number" value={formData.currentSemester} onChange={(e) => handleChange("currentSemester", e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Dosen Wali</Label>
                        <Select onValueChange={(value) => handleChange("dpaLecturerId", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih DPA" />
                          </SelectTrigger>
                          <SelectContent>
                            {lecturers.map(l => (
                              <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Mahasiswa
                      </Button>
                      <Link to="/faculty/mahasiswa" className="block w-full">
                        <Button variant="outline" className="w-full">Batal</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
