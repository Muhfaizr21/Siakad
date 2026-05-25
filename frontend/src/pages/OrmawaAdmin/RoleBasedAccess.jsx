"use client"

import React, { useState, useEffect } from 'react'
import { DataTable } from '../FacultyAdmin/components/data-table'
import { Badge } from '../FacultyAdmin/components/badge'
import { Button } from '../FacultyAdmin/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../FacultyAdmin/components/dialog'
import { DeleteConfirmModal } from '../FacultyAdmin/components/DeleteConfirmModal'
import { Card, CardContent } from '../FacultyAdmin/components/card'
import { Input } from '../FacultyAdmin/components/input'
import { Label } from '../FacultyAdmin/components/label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'

const API = `${API_BASE_URL}/ormawa`

const PERMISSIONS = [
  'view_dashboard', 'manage_kencana', 'manage_members', 'manage_staff', 
  'manage_proposals', 'manage_calendar', 'manage_attendance', 'manage_finance', 
  'manage_lpj', 'manage_aspirations', 'manage_announcements', 'manage_structure', 
  'manage_rbac', 'view_notifications', 'manage_settings'
]

const PERM_LABELS = {
  view_dashboard: 'Akses Dashboard & Statistik',
  manage_kencana: 'KENCANA (PKKMB)',
  manage_members: 'Manajemen Anggota',
  manage_staff: 'Manajemen Staff',
  manage_proposals: 'Proposal & Kegiatan',
  manage_calendar: 'Jadwal Kalender',
  manage_attendance: 'Sistem Absensi (QR)',
  manage_finance: 'Buku Kas & Keuangan',
  manage_lpj: 'Laporan & LPJ',
  manage_aspirations: 'Aspirasi Organisasi',
  manage_announcements: 'Siaran & Pengumuman',
  manage_structure: 'Struktur Pengurus',
  manage_rbac: 'Role & Hak Akses',
  view_notifications: 'Pusat Notifikasi',
  manage_settings: 'Pengaturan Sistem'
}

// Visual color categories mapping to permissions for gorgeous badges
const getPermBadgeClass = (h) => {
  if (['manage_rbac', 'manage_settings'].includes(h)) {
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }
  if (['manage_finance', 'manage_lpj', 'manage_proposals'].includes(h)) {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }
  if (['manage_members', 'manage_staff', 'manage_structure'].includes(h)) {
    return 'bg-violet-50 text-violet-700 border-violet-200'
  }
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

export default function RoleBasedAccess() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)
  
  const authState = useAuthStore((s) => s)
  const ormawaId = authState?.mahasiswa?.ormawaId || authState?.mahasiswa?.ID || authState?.user?.ormawaId || 1
  
  const [form, setForm] = useState({ Nama: '', Deskripsi: '', Hak: [], OrmawaID: ormawaId })

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
      const json = await fetchWithAuth(`${API}/roles?ormawaId=${ormawaId}`)
      if (json.status === 'success') {
        const normalized = (json.data || []).map(r => {
          const rawPermissions = r.Permissions || r.permissions || r.Hak || r.hak || []
          return {
            ID: r.ID || r.id,
            Nama: r.Nama || r.nama || '',
            Deskripsi: r.Deskripsi || r.deskripsi || '',
            Hak: parsePermissions(rawPermissions),
            OrmawaID: ormawaId
          }
        })
        setRoles(normalized)
      } else {
        // Fallback static roles for display if API not ready
        setRoles([
          { ID: 1, Nama: 'Ketua', Deskripsi: 'Akses penuh ke semua fitur', Hak: PERMISSIONS },
          { ID: 2, Nama: 'Sekretaris', Deskripsi: 'Manajemen anggota dan dokumen', Hak: ['manage_members', 'manage_proposals', 'manage_lpj'] },
          { ID: 3, Nama: 'Bendahara', Deskripsi: 'Manajemen keuangan dan laporan', Hak: ['manage_finance', 'manage_lpj'] },
        ])
      }
    } catch { 
      setRoles([]) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [ormawaId])

  const handleOpenAdd = () => { 
    setIsEditMode(false)
    setForm({ Nama: '', Deskripsi: '', Hak: [], OrmawaID: ormawaId })
    setIsCrudOpen(true) 
  }

  const handleOpenEdit = (row) => { 
    setIsEditMode(true)
    setForm({ 
      ID: row.ID || row.id, 
      Nama: row.Nama || row.nama || '', 
      Deskripsi: row.Deskripsi || row.deskripsi || '', 
      Hak: parsePermissions(row.Hak || row.permissions || row.Permissions || []), 
      OrmawaID: ormawaId 
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
    const url = isEditMode ? `${API}/roles/${form.ID || form.id}` : `${API}/roles`
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
        toast.success(isEditMode ? 'Role berhasil diperbarui!' : 'Role baru berhasil dibuat!')
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
      const json = await fetchWithAuth(`${API}/roles/${selected?.id || selected?.ID}`, { method: 'DELETE' })
      if (json.status === 'success') { 
        toast.success('Role berhasil dihapus')
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
      label: 'Nama Role', 
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
              <span className="text-[10px] font-bold text-slate-300 italic">Tanpa Akses Modul</span>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-8 xl:px-12 space-y-8 font-body">
      <Toaster position="top-right" />
      
      {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#00236F] to-[#1e3a8a] text-white p-8 md:p-10 shadow-xl shadow-blue-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-blue-300/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              <span className="h-1.5 w-1.5 bg-rose-400 rounded-full animate-ping" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase">Otorisasi & Keamanan</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>security</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight font-headline">Otoritas & Hak Akses</h1>
                <p className="text-blue-100/80 text-sm font-medium mt-1">Konfigurasi tata kelola otorisasi modul, hak istimewa role, dan kendali keamanan sistem.</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleOpenAdd} 
            className="h-12 px-6 rounded-2xl bg-white hover:bg-white/95 text-[#00236F] hover:text-[#00236F] border-none font-bold text-xs tracking-wider shadow-lg shadow-blue-900/10 transition-all active:scale-95 shrink-0 w-full md:w-auto flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>BUAT ROLE BARU</span>
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
            searchPlaceholder="Cari nama role..."
            onAdd={handleOpenAdd} 
            addLabel="Buat Role Baru"
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

      {/* ── CRUD Dialog (Gorgeously Redesigned and Fitted for Screen Viewport) ── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined size-24 rotate-12 text-[#00236F]">security</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="size-8 rounded-xl bg-[#00236F]/10 flex items-center justify-center text-[#00236F]">
                  <span className="material-symbols-outlined stroke-[3px]" style={{ fontSize: '16px' }}>security</span>
                </div>
                <Badge className="text-[9px] font-black tracking-widest px-2.5 py-0.5 bg-[#00236F]/5 text-[#00236F] border-none rounded-md">RBAC SECURITY MATRIX</Badge>
              </div>
              <DialogTitle className="text-lg md:text-xl font-black font-headline tracking-tighter text-slate-900">
                {isEditMode ? 'Konfigurasi Hak Akses Role' : 'Daftarkan Role Baru'}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Definisikan kewenangan akses, tugas tanggung jawab, dan otorisasi modul fungsional ormawa.
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
                    placeholder="Misal: Ketua, Bendahara, Staff Divisi..."
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

              {/* Custom Interactive Toggle Cards Grid for Permissions */}
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1 uppercase font-headline block">Otorisasi Modul (Pilih Semua yang Diizinkan)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-none">
                  {PERMISSIONS.map(p => {
                    const isSelected = (form.Hak || []).includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleHak(p)}
                        className={cn(
                          'flex items-start gap-2.5 p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 active:scale-95',
                          isSelected 
                            ? 'border-[#00236F] bg-blue-50/40 shadow-sm shadow-blue-900/5' 
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50'
                        )}
                      >
                        <span className={cn(
                          'material-symbols-outlined shrink-0 transition-all duration-200',
                          isSelected ? 'text-[#00236F] font-bold' : 'text-slate-300'
                        )} style={{ fontSize: '16px' }}>
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        <div className="space-y-0.5">
                          <p className={cn(
                            'text-[10px] font-bold leading-none tracking-tight font-headline',
                            isSelected ? 'text-[#00236F]' : 'text-slate-700'
                          )}>
                            {PERM_LABELS[p]}
                          </p>
                          <p className="text-[8px] text-slate-400 font-medium leading-none mt-0.5">
                            Akses {PERM_LABELS[p].toLowerCase()}
                          </p>
                        </div>
                      </button>
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
                className="w-full md:w-auto h-11 px-8 rounded-2xl bg-[#00236F] hover:bg-[#00236F]/90 text-white shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 border-none"
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
        title="Hapus Role Otoritas?" 
        description="Apakah Anda yakin ingin menghapus role otorisasi ini? Seluruh anggota dengan role ini akan kehilangan izin akses modul terkait." 
        loading={isSubmitting} 
      />
    </div>
  )
}
