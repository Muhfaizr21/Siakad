"use client"

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "./components/button"
import { Badge } from "./components/badge"
import { DataTable } from "./components/data-table"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import { Plus, Users2, Pencil, Trash2, CheckCircle2, ShieldCheck, Loader2, Save } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'
import { Modal, ModalBody, ModalFooter, ModalBtn } from "./components/Modal"

import { Input } from "./components/input"
import { Label } from "./components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select"
import { cn } from "@/lib/utils"
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveCard } from "./components/responsive-layout"

export default function FacultyOrganisasi() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState(null)

  const [formData, setFormData] = useState({
    kode_org: '',
    nama_org: '',
    ketua_nama: '',
    jumlah_anggota: 0,
    status: 'Aktif',
    kategori: 'Himpunan',
    email: '',
    password: '',
    phone: ''
  })

  // 🔥 FIX MAPPING API → UI
  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('http://localhost:8000/api/faculty/organizations')
      const data = await res.json()
      // Go backend returns PascalCase fields
      const mapped = Array.isArray(data.data)
        ? data.data.map((item) => ({
          id: item.ID,
          nama: item.Nama,
          kode: item.Singkatan || item.Kode || '',
          status: item.Status || 'Aktif',
          kategori: item.Kategori || '',
          jumlah_anggota: item.JumlahAnggota || 0,
          deskripsi: item.Deskripsi || '',
          email: item.Email || '',
          phone: item.Phone || ''
        }))
        : []
      setOrganizations(mapped)
    } catch (err) {
      console.error("❌ ERROR:", err)
      toast.error("Gagal mengambil data organisasi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)

    // Fiber BodyParser maps lowercase keys to Go PascalCase struct fields
    const payload = {
      Nama: formData.nama_org,
      Singkatan: formData.kode_org,
      Status: formData.status,
      Kategori: formData.kategori,
      JumlahAnggota: formData.jumlah_anggota,
      Deskripsi: formData.ketua_nama,
      Email: formData.email,
      Password: formData.password,
      Phone: formData.phone
    }

    try {
      if (editingOrg) {
        await axios.put(`http://localhost:8000/api/faculty/organizations/${editingOrg.id}`, payload)
        toast.success("Organisasi diperbarui")
      } else {
        await axios.post('http://localhost:8000/api/faculty/organizations', payload)
        toast.success("Organisasi ditambahkan")
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      toast.error(`Gagal menyimpan: ${error.response?.data?.message || 'Database error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedOrgId) return
    setIsSubmitting(true)
    try {
      const res = await axios.delete(`http://localhost:8000/api/faculty/organizations/${selectedOrgId}`)
      if (res.data.status === 'success') {
        toast.success("Organisasi dihapus")
        setIsDelOpen(false)
        fetchData()
      } else {
        toast.error(`Gagal hapus: ${res.data.message || 'Error response'}`)
      }
    } catch (error) {
      toast.error(`Gagal menghapus: ${error.response?.data?.message || 'Server sibuk'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (org) => {
    setEditingOrg(org)
    setFormData({
      kode_org: org.kode || '',
      nama_org: org.nama || '',
      ketua_nama: org.deskripsi || '',
      jumlah_anggota: org.jumlah_anggota || 0,
      status: org.status || 'Aktif',
      kategori: org.kategori || 'Himpunan',
      email: org.email || '',
      password: '',
      phone: org.phone || ''
    })
    setShowModal(true)
  }

  const columns = [
    {
      key: "kode",
      label: "Kode",
      render: (val) => (
        <Badge variant="outline" className="font-black text-[10px] border-slate-200 bg-slate-50 text-slate-500 rounded-lg px-2 py-0.5 tracking-tighter uppercase font-headline">
          {val || '-'}
        </Badge>
      )
    },
    {
      key: "nama",
      label: "Nama Organisasi",
      render: (val) => (
        <div className="flex flex-col text-left">
          <span className="font-black text-slate-900 font-headline uppercase text-[12px] tracking-tight leading-none">{val}</span>
        </div>
      )
    },
    {
      key: "deskripsi",
      label: "Pic / Ketua",
      render: (val) => <span className="text-[11px] font-bold text-slate-600 uppercase font-headline">{val || '-'}</span>
    },
    {
      key: "jumlah_anggota",
      label: "Anggota",
      render: (val) => (
        <div className="flex items-center gap-1.5 text-slate-600">
            <Users2 className="size-3" />
            <span className="text-[11px] font-black font-headline">{val || 0}</span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge className={cn(
          "text-[9px] font-black px-2 py-0.5 rounded-md border-none uppercase font-headline tracking-widest",
          val === 'Aktif' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
        )}>
          {val || 'Aktif'}
        </Badge>
      )
    }
  ]

  const statsData = [
    { label: 'Total ORMAWA', value: organizations.length, icon: Users2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Organisasi Aktif', value: organizations.filter(o => o.status === 'Aktif').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Reach Anggota', value: organizations.reduce((acc, o) => acc + (o.jumlah_anggota || 0), 0), icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <PageContainer>
      <Toaster position="top-right" />

      <PageHeader
        icon={Users2}
        title="Organisasi Fakultas"
        description="Master Data & Legalitas ORMAWA"
      />

      <ResponsiveGrid cols={3}>
        {statsData.map((stat, i) => (
          <ResponsiveCard key={i} className="flex flex-row items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div className="flex flex-col font-headline leading-tight">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{loading ? '...' : stat.value}</span>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>

      <ResponsiveCard noPadding className="mt-6">
        <DataTable
          columns={columns}
          data={organizations}
          loading={loading}
          searchPlaceholder="Cari Nama atau Kode..."
          onAdd={() => { setEditingOrg(null); setFormData({ kode_org: '', nama_org: '', ketua_nama: '', jumlah_anggota: 0, status: 'Aktif', kategori: 'Himpunan', email: '', password: '', phone: '' }); setShowModal(true); }}
          addLabel="Tambah ORMAWA"
          actions={(row) => (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button onClick={() => openEdit(row)} variant="ghost" size="icon" className="h-9 w-9 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all">
                <Pencil className="size-4" />
              </Button>
              <Button onClick={() => { setSelectedOrgId(row.id); setIsDelOpen(true); }} variant="ghost" size="icon" className="h-9 w-9 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all text-slate-400">
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        />
      </ResponsiveCard>

      {/* Modal Dialog */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingOrg ? 'Update Organisasi' : 'Registrasi Baru'}
        subtitle="Manajemen identitas & legalitas organisasi mahasiswa fakultas."
        icon={<Users2 size={18} />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kode Akronim</Label>
                  <Input
                    value={formData.kode_org}
                    onChange={(e) => setFormData({ ...formData, kode_org: e.target.value.toUpperCase() })}
                    placeholder="E.G. BEM-FT"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-black text-sm font-headline uppercase tracking-widest"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Kategori / Tipe</Label>
                  <Select value={formData.kategori} onValueChange={(val) => setFormData({ ...formData, kategori: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-black font-headline text-[11px] px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="BEM" className="rounded-xl font-bold text-[11px] p-3 focus:bg-primary/5 text-primary uppercase font-headline">BEM (Badan Eksekutif)</SelectItem>
                      <SelectItem value="Himpunan" className="rounded-xl font-bold text-[11px] p-3 focus:bg-blue-50 text-blue-600 uppercase font-headline">Himpunan Mahasiswa</SelectItem>
                      <SelectItem value="UKM" className="rounded-xl font-bold text-[11px] p-3 focus:bg-indigo-50 text-indigo-600 uppercase font-headline">UKM (Unit Kegiatan)</SelectItem>
                      <SelectItem value="Komunitas" className="rounded-xl font-bold text-[11px] p-3 focus:bg-violet-50 text-violet-600 uppercase font-headline">Komunitas</SelectItem>
                      <SelectItem value="Lainnya" className="rounded-xl font-bold text-[11px] p-3 focus:bg-slate-50 text-slate-600 uppercase font-headline">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Status Operasional</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 font-black font-headline text-[11px] px-4">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl p-1 font-headline overflow-hidden">
                      <SelectItem value="Aktif" className="rounded-xl font-bold text-[11px] p-3 focus:bg-emerald-50 text-emerald-600 uppercase font-headline">Aktif (Active)</SelectItem>
                      <SelectItem value="Nonaktif" className="rounded-xl font-bold text-[11px] p-3 focus:bg-amber-50 text-amber-600 uppercase font-headline">Nonaktif (Inactive)</SelectItem>
                      <SelectItem value="Pembekuan" className="rounded-xl font-bold text-[11px] p-3 focus:bg-rose-50 text-rose-600 uppercase font-headline">Pembekuan (Frozen)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Jumlah Anggota</Label>
                  <Input
                    type="number"
                    value={formData.jumlah_anggota}
                    onChange={(e) => setFormData({ ...formData, jumlah_anggota: parseInt(e.target.value) || 0 })}
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-black font-headline text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Panjang Organisasi</Label>
                <Input
                  value={formData.nama_org}
                  onChange={(e) => setFormData({ ...formData, nama_org: e.target.value })}
                  placeholder="Masukkan nama resmi organisasi secara lengkap..."
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase italic"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Nama Ketua Umum</Label>
                  <Input
                    value={formData.ketua_nama}
                    onChange={(e) => setFormData({ ...formData, ketua_nama: e.target.value })}
                    placeholder="Entry Nama Ketua..."
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline uppercase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Email Resmi</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="E.G. info@hmp-it.com"
                    className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm font-headline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">Password Akun Admin</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingOrg ? 'Biarkan kosong jika tidak ingin mengubah password' : 'Password untuk login Admin Ormawa...'}
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all font-bold text-sm"
                  required={!editingOrg}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 font-headline">No HP Kontak</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="E.G. 08123xxx"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white text-sm font-bold font-headline"
                />
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <ModalBtn variant="ghost" type="button" onClick={() => setShowModal(false)}>
              Batalkan
            </ModalBtn>
            <ModalBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <Save size={14} className="stroke-[3px]" />
              )}
              <span className="uppercase tracking-[0.1em]">{editingOrg ? 'Update Data' : 'Submit Data'}</span>
            </ModalBtn>
          </ModalFooter>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDelOpen}
        onClose={() => setIsDelOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Data ORMAWA?"
        description="Eksistensi organisasi ini akan dihapus dari record resmi fakultas. Pastikan seluruh laporan pertanggungjawaban telah diarsipkan."
        loading={isSubmitting}
      />
    </PageContainer>
  )
}
