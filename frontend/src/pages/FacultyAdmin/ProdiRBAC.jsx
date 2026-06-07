"use client"

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PageContent } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'

const API = `${API_BASE_URL}/faculty/prodi-roles`

const PERM_LABELS = {
  view_dashboard: 'Dashboard: Lihat Ringkasan & Grafik',
  view_mahasiswa: 'Mahasiswa: Lihat Daftar',
  edit_mahasiswa: 'Mahasiswa: Edit Data Profil',
  view_psikolog: 'Psikolog: Lihat Profil Konselor',
  view_prodi: 'Program Studi: Lihat Detail Prodi',
  view_pkkmb: 'PKKMB: Lihat Agenda Kegiatan',
  view_organisasi: 'Organisasi: Lihat Struktur & Ormawa',
  view_proposal: 'Proposal: Lihat Pengajuan Proposal',
  view_prestasi: 'Prestasi: Lihat Portofolio Prestasi',
  edit_prestasi: 'Prestasi: Validasi & Edit Prestasi',
  view_beasiswa: 'Beasiswa: Lihat Daftar Penerima',
  edit_beasiswa: 'Beasiswa: Edit Status Beasiswa',
  view_kesehatan: 'Kesehatan: Lihat Catatan Medis',
  view_aspirasi: 'Aspirasi: Lihat Umpan Balik',
  edit_aspirasi: 'Aspirasi: Jawab & Kelola Keluhan',
  view_laporan: 'Laporan: Lihat Laporan Hasil Studi',
  view_pengaturan: 'Pengaturan: Akses Konfigurasi Umum'
}

const PERM_DESCS = {
  view_dashboard: 'Mampu melihat grafik perkembangan nilai, jumlah mahasiswa aktif, prestasi, dan timeline kegiatan prodi.',
  view_mahasiswa: 'Mampu mengakses data identitas, status studi, dan rekam jejak akademik mahasiswa.',
  edit_mahasiswa: 'Mampu merubah biodata, nomor telepon, alamat, dan status akademik mahasiswa.',
  view_psikolog: 'Mampu memantau data profil psikolog dan riwayat janji konseling yang terikat ke prodi.',
  view_prodi: 'Mampu mengakses struktur kurikulum, visi misi prodi, dan data akreditasi.',
  view_pkkmb: 'Mampu memantau progres kehadiran, kelulusan, dan agenda kegiatan orientasi (PKKMB).',
  view_organisasi: 'Mampu memantau organisasi kemahasiswaan (Himpunan Mahasiswa) yang dinaungi prodi.',
  view_proposal: 'Mampu meninjau proposal kegiatan ormawa prodi sebelum diajukan ke tingkat fakultas.',
  view_prestasi: 'Mampu melihat galeri sertifikat, piala, dan rekognisi nasional/internasional mahasiswa.',
  edit_prestasi: 'Mampu memvalidasi keaslian berkas bukti prestasi mahasiswa dan menyetujuinya.',
  view_beasiswa: 'Mampu melihat penerima bantuan dana beasiswa internal maupun eksternal.',
  edit_beasiswa: 'Mampu memverifikasi pengajuan beasiswa baru dari mahasiswa program studi.',
  view_kesehatan: 'Mampu meninjau statistik riwayat pemeriksaan kesehatan fisik/mental mahasiswa.',
  view_aspirasi: 'Mampu membaca saran, aduan sarana prasarana, atau masukan kurikulum dari mahasiswa.',
  edit_aspirasi: 'Mampu menuliskan tanggapan resmi dan memperbarui status penanganan keluhan.',
  view_laporan: 'Mampu mengekspor laporan kelulusan mahasiswa, IPK rata-rata, dan statistik angkatan.',
  view_pengaturan: 'Mampu menyesuaikan jam operasional sekretariat prodi dan detail kontak resmi.'
}

const PERM_GROUPS = [
  {
    title: 'Dashboard & Statistik',
    icon: 'dashboard',
    permissions: ['view_dashboard']
  },
  {
    title: 'Data Master Akademik',
    icon: 'school',
    permissions: ['view_mahasiswa', 'edit_mahasiswa', 'view_psikolog', 'view_prodi']
  },
  {
    title: 'Kemahasiswaan & Kegiatan',
    icon: 'group',
    permissions: ['view_pkkmb', 'view_organisasi', 'view_proposal', 'view_kesehatan']
  },
  {
    title: 'Prestasi & Rekognisi',
    icon: 'emoji_events',
    permissions: ['view_prestasi', 'edit_prestasi']
  },
  {
    title: 'Beasiswa & Finansial',
    icon: 'payments',
    permissions: ['view_beasiswa', 'edit_beasiswa']
  },
  {
    title: 'Aspirasi & Administrasi',
    icon: 'campaign',
    permissions: ['view_aspirasi', 'edit_aspirasi', 'view_laporan', 'view_pengaturan']
  }
]

const TABS = [
  { key: 'roles', label: 'Prodi Roles', icon: 'badge' },
  { key: 'permissions', label: 'Permission Matrix', icon: 'security' }
]

export default function ProdiRBAC() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('roles')
  const [selectedRoleKey, setSelectedRoleKey] = useState('')
  const [permissionDraft, setPermissionDraft] = useState([])
  
  // Matrix specific state
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedModules, setExpandedModules] = useState({})

  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  
  const [form, setForm] = useState({ Nama: '', Deskripsi: '' })

  const parsePermissions = (rawHak) => {
    if (!rawHak) return []
    if (Array.isArray(rawHak)) return rawHak
    if (typeof rawHak === 'string') {
      try {
        const parsed = JSON.parse(rawHak)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    }
    return []
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const json = await fetchWithAuth(API)
      if (json.status === 'success') {
        const normalized = (json.data || []).map(r => {
          const rawPermissions = r.Permissions || r.permissions || r.Hak || r.hak || []
          return {
            ID: r.ID || r.id,
            Nama: r.Nama || r.nama || '',
            Deskripsi: r.Deskripsi || r.deskripsi || '',
            Hak: parsePermissions(rawPermissions)
          }
        })
        setRoles(normalized)
      }
    } catch (e) { 
      toast.error('Gagal memuat data role Prodi')
      setRoles([]) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchData() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sinkronisasi permissionDraft saat selectedRoleKey berubah
  useEffect(() => {
    if (selectedRoleKey && roles.length > 0) {
      const role = roles.find(r => r.ID === selectedRoleKey || r.id === selectedRoleKey || r.Nama === selectedRoleKey)
      if (role) {
        setPermissionDraft(role.Hak || [])
      }
    }
  }, [selectedRoleKey, roles])

  const handleOpenAdd = () => { 
    setIsEditMode(false)
    setForm({ Nama: '', Deskripsi: '' })
    setIsCrudOpen(true) 
  }

  const handleOpenEdit = (row) => { 
    setIsEditMode(true)
    setForm({ 
      ID: row.ID || row.id, 
      Nama: row.Nama || row.nama || '', 
      Deskripsi: row.Deskripsi || row.deskripsi || ''
    })
    setIsCrudOpen(true) 
  }

  const handleSaveRoleInfo = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `${API}/${form.ID || form.id}` : API
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      // Pertahankan Hak lama jika sedang Edit
      let currentHak = []
      if (isEditMode) {
        const existingRole = roles.find(r => r.ID === form.ID || r.id === form.ID)
        if (existingRole) currentHak = existingRole.Hak || []
      }

      const json = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify({ 
          Nama: form.Nama, 
          Deskripsi: form.Deskripsi, 
          Hak: isEditMode ? currentHak : []
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (json.status === 'success') { 
        toast.success(isEditMode ? 'Role Prodi berhasil diperbarui!' : 'Role Prodi baru berhasil dibuat!')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(json.message || 'Gagal menyimpan role')
      }
    } catch { 
      toast.error('Terjadi kesalahan jaringan backend') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedRoleKey) { toast.error('Role belum dipilih'); return }
    const role = roles.find(r => r.ID === selectedRoleKey || r.id === selectedRoleKey || r.Nama === selectedRoleKey)
    if (!role) { toast.error('Role tidak ditemukan'); return }
    
    setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/${role.ID || role.id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ 
          Nama: role.Nama, 
          Deskripsi: role.Deskripsi, 
          Hak: permissionDraft 
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      if (json.status === 'success') { 
        toast.success('Matrix otorisasi berhasil disimpan!')
        fetchData() 
      } else {
        toast.error(json.message || 'Gagal menyimpan matrix')
      }
    } catch { 
      toast.error('Terjadi kesalahan jaringan backend') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/${selected?.id || selected?.ID}`, { method: 'DELETE' })
      if (json.status === 'success') { 
        toast.success('Role Prodi berhasil dihapus')
        if (selectedRoleKey === selected?.ID || selectedRoleKey === selected?.id) setSelectedRoleKey('')
        setIsDelOpen(false)
        fetchData() 
      } else {
        toast.error('Gagal menghapus role')
      }
    } catch { 
      toast.error('Terjadi kesalahan jaringan backend') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const togglePermission = (permKey) => {
    setPermissionDraft(prev => 
      prev.includes(permKey) ? prev.filter(k => k !== permKey) : [...prev, permKey]
    )
  }

  return (
    <PageContent>
      <Toaster position="top-right" />
      
      {/* ── Page Header ─────────────────────────── */}
      <DashboardHero
        title="RBAC"
        highlightedTitle="Program Studi"
        subtitle="Konfigurasi hak akses role administrator level program studi (Prodi) untuk membatasi navigasi portal."
        icon="security"
        badges={[
          { label: 'Otorisasi & Keamanan Prodi', active: true }
        ]}
        actions={
          <>
            <Button 
              onClick={() => setActiveTab('permissions')}
              variant="outline"
              className="h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-primary gap-2.5 transition-all active:scale-95 shadow-none cursor-pointer font-headline hidden md:flex"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>security</span>
              Permission Matrix
            </Button>
            <Button 
              onClick={handleOpenAdd} 
              className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              <span>BUAT ROLE PRODI</span>
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'h-14 rounded-xl border px-5 flex items-center justify-between text-left transition-all',
              activeTab === tab.key ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl shadow-neutral-900/10' : 'bg-white text-neutral-500 border-neutral-200 hover:border-primary/30 hover:text-neutral-900'
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-jakarta">{tab.label}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Roles Grid ───────────────────────────────────────────── */}
      {activeTab === 'roles' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map(role => (
            <Card key={role.ID || role.id} className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden hover:border-primary/20 transition-all flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <Badge className="font-bold text-[9px] px-3 py-1 border border-bku-primary/20 shadow-none uppercase tracking-[0.15em] rounded-lg break-words whitespace-normal leading-relaxed text-left bg-bku-primary/10 text-bku-primary">
                      {role.Nama}
                    </Badge>
                    <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight break-all">Role Prodi</h3>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0 bg-emerald-50 text-emerald-600">Active</span>
                </div>
                
                <p className="text-[12px] font-medium text-neutral-500 leading-relaxed flex-1 min-h-[48px]">
                  {role.Deskripsi || 'Akses spesifik kaprodi atau staff dalam unit Program Studi.'}
                </p>
                
                <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {(role.Hak || []).length} permissions
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenEdit(role)
                      }}
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg text-neutral-300 hover:text-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
                      title="Edit Detail Role"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelected(role)
                        setIsDelOpen(true)
                      }}
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Hapus Role"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                    </Button>
                    <Button 
                      onClick={() => { 
                        setSelectedRoleKey(role.ID || role.id)
                        setActiveTab('permissions') 
                      }} 
                      variant="ghost" 
                      className="h-9 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 cursor-pointer ml-1"
                    >
                      Configure Matrix
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* ── Tab: Permission Matrix ───────────────────────────────────────────── */}
      {activeTab === 'permissions' && (
        <section className="space-y-6 pb-24">
          {/* Top Selector: Role List */}
          <div className="space-y-3 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline pl-1 mb-1">Pilih Role Prodi</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {roles.map(role => {
                const rID = role.ID || role.id || role.Nama
                const isSelected = selectedRoleKey === rID
                const count = (role.Hak || []).length

                return (
                  <button
                    key={rID}
                    type="button"
                    onClick={() => setSelectedRoleKey(rID)}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer text-left min-h-[76px]",
                      isSelected 
                        ? "bg-neutral-900 border-neutral-900 text-white shadow-xl shadow-neutral-900/10" 
                        : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="min-w-0 w-full flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold tracking-tight truncate block">{role.Nama}</span>
                      </div>
                      <Badge className={cn(
                        'font-bold text-[8px] px-1.5 py-0.5 border-none uppercase tracking-widest rounded-md shrink-0',
                        isSelected ? "bg-white/10 text-white" : "bg-bku-primary/10 text-bku-primary"
                      )}>
                        {count} Izin
                      </Badge>
                    </div>
                    <span className="text-[9px] font-mono lowercase tracking-wide block truncate opacity-60 w-full">
                      {role.Deskripsi || 'Role Prodi'}
                    </span>
                  </button>
                )
              })}
              {roles.length === 0 && (
                <div className="col-span-full p-4 text-center text-slate-400 text-xs font-medium border border-dashed rounded-xl">
                  Belum ada role prodi terdaftar.
                </div>
              )}
            </div>
          </div>

          {/* Matrix Workspace */}
          {selectedRoleKey && (
            <div className="space-y-6">
              {/* Target info and Search */}
              <Card className="border-slate-200 shadow-sm rounded-xl bg-white p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <span className="material-symbols-outlined">security</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 font-jakarta leading-none">Konfigurasi Hak Akses</h3>
                      <p className="text-[10px] font-medium text-slate-400 mt-1.5 leading-relaxed">
                        Mengatur izin untuk role <span className="text-slate-800 font-bold">{roles.find(r => (r.ID || r.id || r.Nama) === selectedRoleKey)?.Nama}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={handleSavePermissions}
                      disabled={isSubmitting}
                      className="h-10 px-6 rounded-lg bg-neutral-900 hover:bg-primary text-white shadow-lg shadow-neutral-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '15px' }}>sync</span>
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>save</span>
                      )}
                      <span className="text-[10px] font-black tracking-widest uppercase">
                        Simpan
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>search</span>
                  <Input
                    type="text"
                    placeholder="Cari izin akses..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50/40 focus:bg-white text-xs font-bold text-slate-700 tracking-wide shadow-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    </button>
                  )}
                </div>
              </Card>

              {/* Modules Accordion */}
              <div className="space-y-3">
                {PERM_GROUPS.filter(g => !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.permissions.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))).map(group => {
                  const isExpanded = !!expandedModules[group.title]
                  const moduleItems = group.permissions
                  const activeCount = moduleItems.filter(p => permissionDraft.includes(p)).length
                  const allChecked = activeCount === moduleItems.length && moduleItems.length > 0
                  const someChecked = activeCount > 0 && !allChecked

                  const toggleModuleAccordion = (title) => {
                    setExpandedModules(prev => ({ ...prev, [title]: !prev[title] }))
                  }

                  const toggleModulePermissions = () => {
                    if (allChecked) {
                      setPermissionDraft(prev => prev.filter(p => !moduleItems.includes(p)))
                    } else {
                      setPermissionDraft(prev => {
                        const newDraft = new Set(prev)
                        moduleItems.forEach(p => newDraft.add(p))
                        return Array.from(newDraft)
                      })
                    }
                  }

                  const groupPermissionsByFeature = (permsList) => {
                    const featuresMap = {}
                    permsList.forEach(p => {
                      const parts = p.split('_')
                      const action = parts[0]
                      const featureName = parts.slice(1).join(' ')
                      
                      if (!featuresMap[featureName]) {
                        featuresMap[featureName] = { name: featureName.charAt(0).toUpperCase() + featureName.slice(1), prefix: featureName, permissions: [] }
                      }
                      featuresMap[featureName].permissions.push({ key: p, action })
                    })
                    return Object.values(featuresMap)
                  }

                  return (
                    <Card key={group.title} className="border-slate-200/80 shadow-sm rounded-xl bg-white overflow-visible">
                      {/* Accordion Header */}
                      <div 
                        onClick={() => toggleModuleAccordion(group.title)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "material-symbols-outlined text-slate-400 transition-transform duration-200",
                            isExpanded ? "rotate-90 text-primary" : ""
                          )} style={{ fontSize: '18px' }}>
                            chevron_right
                          </span>
                          <div>
                            <h3 className="font-bold text-xs text-slate-800 font-jakarta tracking-tight">{group.title}</h3>
                            <p className={cn(
                              "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                              activeCount > 0 ? "text-bku-primary" : "text-slate-400"
                            )}>
                              {`${activeCount} dari ${moduleItems.length} Izin Diaktifkan`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={toggleModulePermissions}
                            className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border transition-all active:scale-95 cursor-pointer flex items-center gap-1",
                              allChecked 
                                ? "bg-bku-primary/10 text-bku-primary border-bku-primary/20 hover:bg-bku-primary/20" 
                                : someChecked
                                  ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                  : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600"
                            )}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
                              {allChecked ? 'check_box' : someChecked ? 'indeterminate_check_box' : 'add_box'}
                            </span>
                            {allChecked ? 'Semua Aktif' : someChecked ? 'Sebagian Aktif' : 'Aktifkan Semua'}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <CardContent className="p-0 border-t border-slate-100 bg-white overflow-visible">
                          <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                            <table className="w-full min-w-[800px] text-left border-collapse table-fixed">
                              <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 font-headline select-none">
                                  <th className="py-3 px-5 w-[30%]">Nama Fitur</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Lihat (Read)</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Tambah (Create)</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Ubah (Update)</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Hapus (Delete)</th>
                                  <th className="py-3 px-5 w-[14%] text-left">Aksi Lain</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {(() => {
                                  const renderCell = (permsList) => {
                                    if (permsList.length === 0) return <span className="text-slate-300 font-bold text-xs select-none pl-1.5">-</span>;
                                    return (
                                      <div className="flex flex-col items-start justify-center gap-1.5">
                                        {permsList.map(p => {
                                          const isPermChecked = permissionDraft.includes(p.key);
                                          const showLabel = permsList.length > 1 || !['view', 'create', 'edit', 'delete'].includes(p.action);
                                          return (
                                            <label
                                              key={p.key}
                                              className={cn(
                                                "flex items-center gap-1.5 p-1 px-1.5 -ml-1.5 rounded-lg border border-transparent transition-all select-none w-max max-w-full cursor-pointer hover:bg-slate-100 hover:border-slate-200",
                                                isPermChecked ? "bg-bku-primary/[0.04] border-bku-primary/5" : ""
                                              )}
                                              title={PERM_DESCS[p.key] || p.key}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isPermChecked}
                                                onChange={() => togglePermission(p.key)}
                                                className="rounded text-bku-primary focus:ring-bku-primary/30 border-slate-300 size-4 cursor-pointer shrink-0"
                                              />
                                              {showLabel && (
                                                <span className={cn(
                                                  "text-[8px] font-bold tracking-tight select-none truncate max-w-[120px]",
                                                  isPermChecked ? "text-slate-800" : "text-slate-400"
                                                )}>
                                                  {p.action}
                                                </span>
                                              )}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    );
                                  };

                                  return groupPermissionsByFeature(moduleItems).map(feature => {
                                    const featurePermissions = feature.permissions;
                                    const isSomeChecked = featurePermissions.some(p => permissionDraft.includes(p.key));
                                    
                                    const views = [];
                                    const creates = [];
                                    const updates = [];
                                    const deletes = [];
                                    const others = [];

                                    featurePermissions.forEach(p => {
                                      if (p.action === 'view') views.push(p);
                                      else if (p.action === 'create' || p.action === 'add' || p.action === 'submit') creates.push(p);
                                      else if (p.action === 'edit' || p.action === 'update') updates.push(p);
                                      else if (p.action === 'delete' || p.action === 'remove') deletes.push(p);
                                      else others.push(p);
                                    });

                                    return (
                                      <tr 
                                        key={feature.prefix}
                                        className={cn(
                                          "transition-colors hover:bg-slate-50/60",
                                          isSomeChecked ? "bg-bku-primary/[0.01]" : ""
                                        )}
                                      >
                                        <td className="py-3.5 px-5 align-middle">
                                          <div className="flex flex-col">
                                            <span className="text-xs font-bold font-jakarta text-slate-800 tracking-tight">
                                              {feature.name}
                                            </span>
                                            <span className="text-[9px] font-semibold text-slate-400 font-mono tracking-wide mt-0.5">
                                              {feature.prefix}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-left align-middle">{renderCell(views)}</td>
                                        <td className="py-3.5 px-4 text-left align-middle">{renderCell(creates)}</td>
                                        <td className="py-3.5 px-4 text-left align-middle">{renderCell(updates)}</td>
                                        <td className="py-3.5 px-4 text-left align-middle">{renderCell(deletes)}</td>
                                        <td className="py-3.5 px-5 text-left align-middle">{renderCell(others)}</td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Role Identity Dialog (Simplified) ── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen} maxWidth="max-w-xl w-[95vw] sm:w-full">
        <DialogContent className="flex flex-col h-full max-h-[85vh] rounded-2xl overflow-hidden p-0 bg-white shadow-2xl">
          <DialogHeader className="p-6 pb-4 md:p-8 md:pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative shrink-0 z-10">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-bku-primary">badge</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="size-8 rounded-xl bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>add</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-bku-primary/5 text-bku-primary border-none rounded-md">ROLE IDENTITY</Badge>
              </div>
              <DialogTitle className="text-lg md:text-xl font-black font-headline tracking-tighter text-slate-900">
                {isEditMode ? 'Edit Identitas Role Prodi' : 'Buat Identitas Role Baru'}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Tentukan nama role dan deskripsi. Matriks izin dapat diatur pada tab Permission Matrix.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveRoleInfo} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 custom-scrollbar min-h-0">
              <div className="space-y-5">
                {/* Nama Role */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Nama Otoritas Role</Label>
                  <Input 
                    required 
                    value={form.Nama} 
                    onChange={e => setForm({ ...form, Nama: e.target.value })} 
                    placeholder="Misal: Kaprodi, Sekretaris Prodi, Staff..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-xs" 
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline">Tanggung Jawab Singkat</Label>
                  <Input 
                    value={form.Deskripsi} 
                    onChange={e => setForm({ ...form, Deskripsi: e.target.value })} 
                    placeholder="Deskripsi singkat kewenangan tugas..."
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-primary/20 shadow-none transition-all font-bold text-xs" 
                  />
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <footer className="flex flex-col md:flex-row items-center justify-end gap-3 p-6 pt-4 border-t border-slate-100 bg-slate-50/50 shrink-0 relative z-10">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCrudOpen(false)} 
                className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-500 hover:text-slate-900 px-8 h-11 rounded-xl hover:bg-slate-100 active:scale-95 transition-all shadow-none border-none cursor-pointer font-headline uppercase"
              >
                BATAL
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full md:w-auto h-11 px-8 rounded-xl bg-bku-primary hover:bg-bku-primary/90 text-white shadow-xl shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer font-black text-[10px]"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '15px' }}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>save</span>
                )}
                <span className="text-[10px] font-black tracking-widest uppercase">
                  SIMPAN IDENTITAS
                </span>
              </Button>
            </footer>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Role Otoritas Prodi?" 
        description="Apakah Anda yakin ingin menghapus role otorisasi ini? Seluruh admin prodi dengan role ini akan kehilangan izin akses halaman terkait." 
        loading={isSubmitting} 
      />
    </PageContent>
  )
}
