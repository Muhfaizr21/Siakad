import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar"
import TopNavBar from "../../components/TopNavBar"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { Button } from "../../components/button"
import { Input } from "../../components/input"
import { Label } from "../../components/label"
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

export default function EditFakultasPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    deanName: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:8000/api/faculty/faculties`) 
        const json = await res.json()
        if (json.status === 'success') {
          const faculty = json.data.find(f => f.id.toString() === id)
          if (faculty) {
            setFormData({
              name: faculty.name,
              code: faculty.code,
              deanName: faculty.deanName || ""
            })
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
      } finally {
        setLoading(false)
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
      const response = await fetch(`http://localhost:8000/api/faculty/faculties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      if (result.status === 'success') {
        alert("Fakultas berhasil diupdate!")
        navigate('/faculty/fakultas')
      } else {
        alert("Error: " + result.message)
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
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
              <Link to="/faculty/fakultas">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-display">Edit Fakultas</h1>
                <p className="text-on-surface-variant">Perbarui informasi data fakultas</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <Card className="border-none shadow-premium bg-white">
                    <CardHeader>
                      <div className="flex items-center gap-2 text-primary">
                        <Building2 className="h-5 w-5" />
                        <CardTitle>Informasi Fakultas</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="code">Kode Fakultas</Label>
                          <Input id="code" value={formData.code} onChange={(e) => handleChange("code", e.target.value.toUpperCase())} placeholder="Contoh: TEKNIK, EKONOMI" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap Fakultas</Label>
                          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Contoh: Fakultas Teknik" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deanName">Nama Dekan</Label>
                        <Input id="deanName" value={formData.deanName} onChange={(e) => handleChange("deanName", e.target.value)} placeholder="Masukkan nama dekan beserta gelar" required />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-none shadow-premium bg-[#00236f] text-white">
                    <CardContent className="pt-6 space-y-4">
                      <Button type="submit" className="w-full bg-white text-[#00236f] hover:bg-white/90" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Update Fakultas
                      </Button>
                      <Link to="/faculty/fakultas" className="block w-full">
                        <Button variant="ghost" className="w-full text-white hover:bg-white/10 border-white/20 border">Batal</Button>
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
