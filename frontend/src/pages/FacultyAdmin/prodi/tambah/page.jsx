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
import { ArrowLeft, Building2, Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export default function TambahProdiPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faculties, setFaculties] = useState([])
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    facultyId: "",
    degreeLevel: "S1",
    akreditasi: "B",
    kapasitas: 0
  })

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/faculty/faculties')
        const json = await res.json()
        if (json.status === 'success') {
          setFaculties(json.data)
          if (json.data.length > 0) {
            setFormData(prev => ({ ...prev, facultyId: json.data[0].id.toString() }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch faculties:", err)
      }
    }
    fetchFaculties()
  }, [])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:8000/api/faculty/majors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyId: parseInt(formData.facultyId),
          kapasitas: parseInt(formData.kapasitas)
        })
      })

      const result = await response.json()
      if (result.status === 'success') {
        alert("Program Studi berhasil ditambahkan!")
        navigate('/faculty/prodi')
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
              <Link to="/faculty/prodi">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Tambah Program Studi Baru</h1>
                <p className="text-on-surface-variant">Daftarkan prodi baru di lingkungan fakultas</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <Card className="border-none shadow-sm">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        <CardTitle>Informasi Program Studi</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="code">Kode Program Studi</Label>
                          <Input id="code" value={formData.code} onChange={(e) => handleChange("code", e.target.value)} placeholder="Contoh: TI, SI, atau INF" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Program Studi</Label>
                          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Contoh: Teknik Informatika" required />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Jenjang Pendidikan</Label>
                          <Select value={formData.degreeLevel} onValueChange={(value) => handleChange("degreeLevel", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="S1">S1 - Sarjana</SelectItem>
                              <SelectItem value="D3">D3 - Diploma</SelectItem>
                              <SelectItem value="S2">S2 - Magister</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Fakultas</Label>
                          <Select value={formData.facultyId} onValueChange={(value) => handleChange("facultyId", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Fakultas" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {faculties.map(f => (
                                <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Akreditasi</Label>
                          <Select value={formData.akreditasi} onValueChange={(value) => handleChange("akreditasi", value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Akreditasi A</SelectItem>
                              <SelectItem value="B">Akreditasi B</SelectItem>
                              <SelectItem value="C">Akreditasi C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kapasitas">Kapasitas Mahasiswa</Label>
                          <Input id="kapasitas" type="number" value={formData.kapasitas} onChange={(e) => handleChange("kapasitas", e.target.value)} placeholder="Contoh: 500" required />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-none shadow-sm">
                    <CardContent className="pt-6 space-y-4">
                      <Button type="submit" className="w-full bg-[#00236f] hover:bg-[#001a54]" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Simpan Prodi
                      </Button>
                      <Link to="/faculty/prodi" className="block w-full">
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
