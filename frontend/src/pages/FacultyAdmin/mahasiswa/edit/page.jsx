import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
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
import { ArrowLeft, Save, User, BookOpen, MapPin, Loader2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

export default function EditMahasiswaPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [majors, setMajors] = useState([])
  const [lecturers, setLecturers] = useState([])
  
  const [formData, setFormData] = useState({
    nim: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    majorId: "",
    semester: 1,
    dpaLecturerId: "",
    status: "active"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [majorsRes, lecturersRes, studentRes] = await Promise.all([
          fetch('http://localhost:8000/api/faculty/courses'),
          fetch('http://localhost:8000/api/faculty/lecturers'),
          fetch(`http://localhost:8000/api/faculty/students`) // Just fetch all and find, or we can add GET /students/:id
        ])
        
        setMajors([
          { id: 1, name: "Teknik Informatika" },
          { id: 2, name: "Sistem Informasi" }
        ])

        const lectJson = await lecturersRes.json()
        if (lectJson.status === 'success') setLecturers(lectJson.data)

        const studentDataRes = await fetch(`http://localhost:8000/api/faculty/students`)
        const studentJson = await studentDataRes.json()
        if (studentJson.status === 'success') {
          const student = studentJson.data.find(s => s.id.toString() === id)
          if (student) {
            setFormData({
              nim: student.nim,
              name: student.name,
              email: student.user?.email || "",
              phone: student.phone || "",
              address: student.address || "",
              majorId: student.majorId.toString(),
              semester: student.currentSemester,
              dpaLecturerId: student.dpaLecturerId?.toString() || "",
              status: student.status
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:8000/api/faculty/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          majorId: parseInt(formData.majorId),
          dpaLecturerId: formData.dpaLecturerId ? parseInt(formData.dpaLecturerId) : 0,
          currentSemester: parseInt(formData.semester)
        })
      })

      const result = await response.json()
      if (result.status === 'success') {
        alert("Data mahasiswa berhasil diperbarui!")
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
                <h1 className="text-2xl font-bold">Edit Data Mahasiswa</h1>
                <p className="text-on-surface-variant">Perbarui informasi mahasiswa {formData.name}</p>
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
                          <Select value={formData.majorId} onValueChange={(value) => handleChange("majorId", value)}>
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
                          <Input type="number" value={formData.semester} onChange={(e) => handleChange("semester", e.target.value)} />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Dosen Wali</Label>
                          <Select value={formData.dpaLecturerId} onValueChange={(value) => handleChange("dpaLecturerId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih DPA" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Tidak Ada</SelectItem>
                              {lecturers.map(l => (
                                <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Aktif</SelectItem>
                              <SelectItem value="cuti">Cuti</SelectItem>
                              <SelectItem value="non-active">Non-Aktif</SelectItem>
                              <SelectItem value="graduated">Lulus</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
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
