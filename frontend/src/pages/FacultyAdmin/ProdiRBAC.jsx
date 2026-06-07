"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

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

const getPermBadgeClass = (h) => {
  if (h.startsWith('delete_') || ['manage_rbac', 'edit_prestasi', 'edit_beasiswa', 'edit_aspirasi'].some(x => h.includes(x))) {
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }
  if (h.startsWith('create_') || h.startsWith('submit_') || h.startsWith('upload_')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
  if (h.startsWith('edit_') || h.startsWith('respond_') || h.startsWith('manage_')) {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  return 'bg-blue-50 text-blue-700 border-blue-200'
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

export default function ProdiRBAC() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  
  const [form, setForm] = useState({ Nama: '', Deskripsi: '', Hak: [] })
  const [expandedGroups, setExpandedGroups] = useState({})

  const toggleGroup = (index) => {
    setExpandedGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

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
  }, [])

  const handleOpenAdd = () => { 
    setIsEditMode(false)
    setForm({ Nama: '', Deskripsi: '', Hak: [] })
    setIsCrudOpen(true) 
  }

  const handleOpenEdit = (row) => { 
    setIsEditMode(true)
    setForm({ 
      ID: row.ID || row.id, 
      Nama: row.Nama || row.nama || '', 
      Deskripsi: row.Deskripsi || row.deskripsi || '', 
      Hak: parsePermissions(row.Hak || row.permissions || row.Permissions || [])
    })
    setIsCrudOpen(true) 
  }

  const toggleHak = (h) => {
    setForm(f => {
      const currentHak = f.Hak || []
      return { 
        ...f, 
        Hak: currentHak.includes(h) ? currentHak.filter(x => x !== h) : [...currentHak, h] 
      }
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const url = isEditMode ? `${API}/${form.ID || form.id}` : API
    const method = isEditMode ? 'PUT' : 'POST'
    try {
      const json = await fetchWithAuth(url, { 
        method, 
        body: JSON.stringify({ 
          Nama: form.Nama, 
          Deskripsi: form.Deskripsi, 
          Hak: form.Hak 
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

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const json = await fetchWithAuth(`${API}/${selected?.id || selected?.ID}`, { method: 'DELETE' })
      if (json.status === 'success') { 
        toast.success('Role Prodi berhasil dihapus')
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

  const columns = [
    {
      key: 'Nama', 
      label: 'Nama Role Prodi', 
      className: 'w-[200px]',
      render: (v, row) => <span className="font-bold text-slate-900 font-headline text-[13px] tracking-tighter">{row.Nama || '—'}</span>
    },
    {
      key: 'Deskripsi', 
      label: 'Deskripsi Tanggung Jawab', 
      className: 'min-w-[240px]',
      render: (v, row) => <span className="font-medium text-slate-500 text-[12px]">{row.Deskripsi || '—'}</span>
    },
    {
      key: 'Hak', 
      label: 'Kewenangan Otorisasi', 
      className: 'min-w-[320px]', 
      disableSort: true,
      render: (v, row) => {
        const hakList = row.Hak || []
        return (
          <div className="flex flex-wrap gap-1.5 py-1">
            {hakList.slice(0, 3).map(h => (
              <Badge key={h} className={cn("font-bold text-[8px] tracking-wider px-2.5 py-0.5 border rounded-full uppercase", getPermBadgeClass(h))}>
                {PERM_LABELS[h]?.replace('Manajemen ', '').replace('Akses ', '') || h}
              </Badge>
            ))}
            {hakList.length > 3 && (
              <Badge className="bg-slate-100 text-slate-500 font-bold text-[8px] border border-slate-200 px-2.5 py-0.5 rounded-full">
                +{hakList.length - 3} HAK LAIN
              </Badge>
            )}
            {hakList.length === 0 && (
              <span className="text-[10px] font-bold text-slate-300 italic">Tanpa Akses Halaman</span>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 font-body">
      <Toaster position="top-right" />
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-white p-8 md:p-10 shadow-sm border border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--theme-primary) 1px, transparent 1px), radial-gradient(circle at 80% 20%, var(--theme-primary) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ backgroundColor: 'var(--theme-secondary)' }} />
        <div className="absolute -bottom-10 right-40 w-60 h-60 rounded-full blur-2xl opacity-10" style={{ backgroundColor: 'var(--theme-surface)' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: 'var(--theme-primary)' }} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600">Otorisasi & Keamanan Prodi</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner" style={{ color: 'var(--theme-primary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>security</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline text-slate-900">RBAC Program Studi</h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Konfigurasi hak akses role administrator level program studi (Prodi) untuk membatasi navigasi portal.</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenAdd} 
            className="h-12 px-6 rounded-2xl text-white font-bold text-xs tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>BUAT ROLE PRODI</span>
          </Button>
        </div>
      </section>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <Card className="border border-slate-200/50 shadow-sm rounded-[2rem] overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-6">
          <DataTable
            columns={columns} 
            data={roles} 
            loading={loading}
            searchPlaceholder="Cari nama role prodi..."
            onAdd={handleOpenAdd} 
            addLabel="Buat Role Prodi"
            actions={(row) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button 
                  onClick={() => handleOpenEdit(row)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl active:scale-95 transition-all"
                  title="Edit Otoritas Role"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                </Button>
                <Button 
                  onClick={() => { 
                    setSelected(row)
                    setIsDelOpen(true) 
                  }} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl active:scale-95 transition-all"
                  title="Hapus Role"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* ── CRUD Dialog ── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-full max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-bku-primary">security</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="size-8 rounded-xl bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>security</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-bku-primary/5 text-bku-primary border-none rounded-md">PRODI SECURITY MATRIX</Badge>
              </div>
              <DialogTitle className="text-lg md:text-xl font-black font-headline tracking-tighter text-slate-900">
                {isEditMode ? 'Konfigurasi Hak Akses Role Prodi' : 'Daftarkan Role Prodi Baru'}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Definisikan kewenangan akses, tugas tanggung jawab, dan otorisasi modul fungsional bagi admin prodi.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 flex flex-col justify-between min-h-0">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Collapsible Feature Accordions for Granular Permissions */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline block">
                  Matriks Izin Otorisasi Halaman (Pilih & Rincikan Berdasarkan Fitur)
                </Label>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {PERM_GROUPS.map((group, gIdx) => {
                    const isExpanded = !!expandedGroups[gIdx]
                    const selectedCount = group.permissions.filter(p => (form.Hak || []).includes(p)).length
                    
                    return (
                      <div key={gIdx} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                        {/* Accordion Trigger Button */}
                        <button
                          type="button"
                          onClick={() => toggleGroup(gIdx)}
                          className={cn(
                            "w-full flex items-center justify-between p-4 text-left font-bold transition-all duration-200",
                            isExpanded ? "bg-slate-50/50 border-b border-slate-100" : "hover:bg-slate-50/30"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#00236F]" style={{ fontSize: '20px' }}>
                              {group.icon}
                            </span>
                            <div>
                              <h4 className="text-[12px] font-black text-slate-800 font-headline leading-none">
                                {group.title}
                              </h4>
                              <p className="text-[9px] text-slate-400 font-semibold mt-1">
                                {group.permissions.length} Halaman Terkait
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {selectedCount > 0 && (
                              <Badge className="bg-[#00236F]/5 border-none text-[#00236F] font-bold text-[8.5px] px-2.5 py-0.5 rounded-full shrink-0">
                                {selectedCount} TERPILIH
                              </Badge>
                            )}
                            <span className={cn(
                              "material-symbols-outlined text-slate-400 transition-transform duration-300",
                              isExpanded ? "rotate-180" : ""
                            )} style={{ fontSize: '18px' }}>
                              expand_more
                            </span>
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50/10 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-1.5 duration-200">
                            {group.permissions.map(p => {
                              const isSelected = (form.Hak || []).includes(p)
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => toggleHak(p)}
                                  className={cn(
                                    'flex items-start gap-3 p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 active:scale-[0.98]',
                                    isSelected
                                      ? 'border-[#00236F] bg-blue-50/40 shadow-sm shadow-blue-900/5'
                                      : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm shadow-slate-100/30'
                                  )}
                                >
                                  <span className={cn(
                                    'material-symbols-outlined shrink-0 transition-all duration-200 mt-0.5',
                                    isSelected ? 'text-[#00236F] font-bold' : 'text-slate-300'
                                  )} style={{ fontSize: '16px' }}>
                                    {isSelected ? 'check_box' : 'check_box_outline_blank'}
                                  </span>
                                  <div className="space-y-1">
                                    <p className={cn(
                                      'text-[11px] font-black leading-tight tracking-tight font-headline',
                                      isSelected ? 'text-[#00236F]' : 'text-slate-700'
                                    )}>
                                      {PERM_LABELS[p] || p}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-medium leading-snug mt-0.5">
                                      {PERM_DESCS[p] || ''}
                                    </p>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="mt-5 pt-4 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-slate-100 -mx-6 px-6 bg-slate-50/30 pb-0 shrink-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsCrudOpen(false)} 
                className="w-full md:w-auto text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-900 px-8 h-11 rounded-2xl active:scale-95 transition-all"
              >
                BATAL
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full md:w-auto h-11 px-8 rounded-2xl bg-bku-primary hover:bg-bku-primary/90 text-white shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin size-4" style={{ fontSize: '15px' }}>sync</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>save</span>
                )}
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {isEditMode ? 'SIMPAN OTORITAS' : 'TERBITKAN ROLE'}
                </span>
              </Button>
            </div>
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
    </div>
  )
}
