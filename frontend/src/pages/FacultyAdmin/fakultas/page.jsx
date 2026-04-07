import React, { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import TopNavBar from "../components/TopNavBar"
import { DataTable } from "../components/data-table"
import { Button } from "../components/button"
import { Building2, Pencil, Trash2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

const columns = [
  {
    key: "code",
    label: "Kode Fakultas",
    render: (value) => <span className="font-mono font-bold text-primary">{value}</span>,
  },
  {
    key: "name",
    label: "Nama Fakultas",
    render: (value) => <span className="font-medium">{value}</span>,
  },
  {
    key: "deanName",
    label: "Dekan",
    render: (value) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{value || "-"}</span>
      </div>
    ),
  },
]

export default function FakultasPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFaculties = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/faculty/faculties')
      const json = await res.json()
      if (json.status === 'success') {
        setFaculties(json.data)
      }
    } catch (err) {
      console.error("Failed to fetch faculties:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculties()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus fakultas ini?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/faculty/faculties/${id}`, {
          method: 'DELETE'
        })
        const json = await res.json()
        if (json.status === 'success') {
          alert("Fakultas berhasil dihapus")
          fetchFaculties()
        } else {
          alert("Gagal menghapus: " + json.message)
        }
      } catch (err) {
        alert("Terjadi kesalahan sistem")
      }
    }
  }

  return (
    <div className="text-on-surface bg-surface min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <TopNavBar setIsOpen={setSidebarOpen} />
      <main className="lg:ml-64 ml-0 min-h-screen transition-all duration-300">
        <div className="pt-24 pb-12 px-4 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display">Master Data Fakultas</h1>
                <p className="text-on-surface-variant">Kelola data fakultas di lingkungan universitas</p>
              </div>
            </div>

            <DataTable
              title="Daftar Fakultas"
              description="Manajemen data seluruh fakultas"
              columns={columns}
              data={loading ? [] : faculties}
              searchPlaceholder="Cari kode atau nama fakultas..."
              onAdd={() => navigate('/faculty/fakultas/tambah')}
              addLabel="Tambah Fakultas"
              actions={(row) => (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => navigate(`/faculty/fakultas/edit/${row.id}`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
