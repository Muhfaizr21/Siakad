import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select"
import { Checkbox } from "../../components/checkbox"
import { ArrowLeft, User, GraduationCap, Loader2 } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

export default function EditDosenPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [faculties, setFaculties] = useState([])
  
  const [formData, setFormData] = useState({
    nidn: "",
    name: "",
    email: "",
    facultyId: "1",
    isDpa: false
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFaculties([
          { id: 1, name: "Fakultas Teknik" },
          { id: 2, name: "Fakultas Ekonomi" }
        ])

        const res = await fetch(`http://localhost:8000/api/faculty/lecturers`)
        const json = await res.json()
        if (json.status === 'success') {
          const lecturer = json.data.find(l => l.id.toString() === id)
          if (lecturer) {
            setFormData({
              nidn: lecturer.nidn,
              name: lecturer.name,
              email: lecturer.user?.email || "",
              facultyId: lecturer.facultyId.toString(),
              isDpa: lecturer.isDpa
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch lecturer:", err)
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
      const response = await fetch(`http://localhost:8000/api/faculty/lecturers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: parseInt(formData.facultyId)
        })
      })

      const result = await response.json()
      if (result.status === 'success') {
        alert("Data dosen berhasil diperbarui!")
        navigate('/faculty/dosen')
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
              <Link to="/faculty/dosen">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Edit Data Dosen</h1>
                <p className="text-on-surface-variant">Perbarui informasi profil pengajar {formData.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <CardTitle>Informasi Profil</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="nidn">NIDN</Label>
                          <Input id="nidn" value={formData.nidn} onChange={(e) => handleChange("nidn", e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nama">Nama Lengkap</Label>
                          <Input id="nama" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Kampus</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <CardTitle>Afiliasi & Akademik</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Unit Kerja / Fakultas</Label>
                        <Select value={formData.facultyId} onValueChange={(value) => handleChange("facultyId", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {faculties.map(f => (
                              <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Checkbox 
                          id="isDpa" 
                          checked={formData.isDpa} 
                          onCheckedChange={(checked) => handleChange("isDpa", checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label htmlFor="isDpa" className="text-sm font-bold leading-none">
                            Dosen Pembimbing Akademik (DPA)
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Button type="submit" className="w-full bg-[#00236f]" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Perubahan
                      </Button>
                      <Link to="/faculty/dosen" className="block w-full">
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
