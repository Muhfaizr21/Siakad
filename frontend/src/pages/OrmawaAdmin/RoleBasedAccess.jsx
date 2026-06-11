"use client"
import React, { useState, useEffect } from 'react';
import { PageContent } from '@/components/ui/page';
import { DashboardHero } from '@/components/ui/dashboard';
import { DataTable } from '@/components/ui/DataTable'



import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DialogModal, ModalCancelButton, ModalSaveButton } from '@/components/ui/DialogModal'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'

import { fetchWithAuth, API_BASE_URL } from '../../services/api'
import useAuthStore from '../../store/useAuthStore'
import { getOrmawaId } from '../../utils/getOrmawaId'

const API = `${API_BASE_URL}/ormawa`

const PERMISSIONS = [
  // Dashboard & Notif
  'view_dashboard', 'view_notifications',
  // Anggota
  'view_members', 'create_members', 'edit_members', 'delete_members',
  // Staff & Struktur
  'view_staff', 'manage_staff', 'view_structure', 'manage_structure',
  // Proposal & LPJ
  'view_proposal', 'create_proposal', 'edit_proposal', 'delete_proposal',
  'view_lpj', 'create_lpj', 'edit_lpj', 'upload_lpj_doc', 'delete_lpj',
  // Kegiatan & Absensi
  'view_calendar', 'create_calendar', 'edit_calendar', 'delete_calendar',
  'view_attendance', 'submit_attendance', 'edit_attendance',
  // Keuangan
  'view_finance', 'create_finance', 'delete_finance',
  // Aspirasi & Pengumuman
  'view_aspirations', 'respond_aspirations',
  'view_announcements', 'create_announcements', 'edit_announcements', 'delete_announcements',
  // RBAC & Settings
  'view_rbac', 'manage_rbac', 'view_settings', 'manage_settings'
]

const PERM_LABELS = {
  view_dashboard: 'Dashboard: Lihat Statistik',
  view_notifications: 'Notifikasi: Baca Pusat Info',

  view_members: 'Anggota: Lihat Daftar',
  create_members: 'Anggota: Tambah Baru',
  edit_members: 'Anggota: Edit Jabatan & Divisi',
  delete_members: 'Anggota: Keluarkan/Hapus',

  view_staff: 'Struktur: Lihat Pengurus',
  manage_staff: 'Struktur: Kelola Fungsional',
  view_structure: 'Struktur: Lihat Bagan',
  manage_structure: 'Struktur: Edit Hierarki Bagan',

  view_proposal: 'Proposal: Lihat Pengajuan',
  create_proposal: 'Proposal: Buat Baru',
  edit_proposal: 'Proposal: Edit & Revisi Anggaran',
  delete_proposal: 'Proposal: Hapus Pengajuan',

  view_lpj: 'LPJ: Lihat Laporan',
  create_lpj: 'LPJ: Buat & Ajukan Baru',
  edit_lpj: 'LPJ: Edit Realisasi Anggaran',
  upload_lpj_doc: 'LPJ: Unggah File Bukti Fisik',
  delete_lpj: 'LPJ: Hapus Laporan',

  view_calendar: 'Kalender: Lihat Jadwal',
  create_calendar: 'Kalender: Buat Agenda Baru',
  edit_calendar: 'Kalender: Edit Detail Acara',
  delete_calendar: 'Kalender: Hapus Agenda',

  view_attendance: 'Absensi: Lihat Rekapitulasi',
  submit_attendance: 'Absensi: Scan QR & Hadir',
  edit_attendance: 'Absensi: Edit Status Anggota',

  view_finance: 'Buku Kas: Lihat Arus Saldo',
  create_finance: 'Buku Kas: Catat Pemasukan/Pengeluaran',
  delete_finance: 'Buku Kas: Hapus Riwayat Mutasi',

  view_aspirations: 'Aspirasi: Baca Masukan',
  respond_aspirations: 'Aspirasi: Kirim Tanggapan Resmi',

  view_announcements: 'Pengumuman: Lihat Siaran',
  create_announcements: 'Pengumuman: Buat Siaran Baru',
  edit_announcements: 'Pengumuman: Edit Isi Siaran',
  delete_announcements: 'Pengumuman: Hapus Siaran',

  view_rbac: 'RBAC: Lihat Role Akses',
  manage_rbac: 'RBAC: Buat, Edit & Hapus Role',

  view_settings: 'Pengaturan: Lihat Profil Ormawa',
  manage_settings: 'Pengaturan: Edit Profil, Logo & Rekening'
}

const PERM_DESCS = {
  view_dashboard: 'Mampu memantau performa, jumlah anggota, kegiatan aktif, proposal terbaru, dan live saldo kas.',
  view_notifications: 'Mampu melihat notifikasi masuk terkait persetujuan proposal, mutasi kas, atau info anggota.',

  view_members: 'Mampu melihat list lengkap seluruh anggota organisasi yang terdaftar.',
  create_members: 'Mampu mendaftarkan anggota baru ke dalam sistem kepengurusan.',
  edit_members: 'Mampu merubah nama divisi, memperbarui jabatan, serta mengedit profil anggota.',
  delete_members: 'Mampu melakukan pemecatan atau menghapus data anggota secara permanen dari ormawa.',

  view_staff: 'Mampu melihat data fungsional pengurus inti.',
  manage_staff: 'Mampu memetakan susunan pengurus dan menyinkronkan email/nomor kontak.',
  view_structure: 'Mampu melihat data fungsional pengurus inti.',
  manage_structure: 'Mampu merancang, menambah divisi fungsional, dan mendesain bagan organisasi.',

  view_proposal: 'Mampu mengakses dan melihat seluruh berkas proposal kegiatan yang diajukan.',
  create_proposal: 'Mampu mengisi formulir dan mengirimkan proposal kegiatan baru ke fakultas.',
  edit_proposal: 'Mampu mengubah isi deskripsi, menaikkan/menurunkan anggaran dana kegiatan, dan merevisi proposal.',
  delete_proposal: 'Mampu menghapus/membatalkan proposal kegiatan yang sudah dikirim.',

  view_lpj: 'Mampu membuka dan mengunduh berkas Laporan Pertanggungjawaban (LPJ) kegiatan.',
  create_lpj: 'Mampu mengisi form realisasi dana dan mengajukan LPJ setelah kegiatan selesai.',
  edit_lpj: 'Mampu menyesuaikan angka nominal realisasi penggunaan dana jika ada kekeliruan.',
  upload_lpj_doc: 'Mampu mengunggah file bukti fisik/berkas PDF dokumen LPJ ke server.',
  delete_lpj: 'Mampu menghapus draf atau laporan LPJ kegiatan.',

  view_calendar: 'Mampu melihat rincian jadwal rapat, program kerja, atau agenda acara mendatang.',
  create_calendar: 'Mampu menyusun agenda kerja baru dan menambahkannya ke kalender.',
  edit_calendar: 'Mampu menggeser jadwal, mengganti lokasi, dan merinci waktu acara.',
  delete_calendar: 'Mampu membatalkan agenda dan menghapusnya dari kalender ormawa.',

  view_attendance: 'Mampu mengekspor dan melihat data statistik kehadiran anggota pada agenda kerja.',
  submit_attendance: 'Mampu melakukan absensi mandiri menggunakan pemindai QR Code.',
  edit_attendance: 'Mampu merubah status kehadiran anggota (Hadir, Sakit, Izin, Alpa) secara manual.',

  view_finance: 'Mampu memantau mutasi buku kas ormawa, rincian nominal pemasukan, dan nominal pengeluaran.',
  create_finance: 'Mampu menuliskan catatan transaksi keuangan baru (iuran masuk, sewa dana keluar, dll.).',
  delete_finance: 'Mampu menghapus catatan transaksi keuangan jika terjadi salah ketik/input.',

  view_aspirations: 'Mampu melihat keluhan, kritik, atau saran yang dikirimkan oleh mahasiswa umum.',
  respond_aspirations: 'Mampu merumuskan tanggapan resmi dari pihak pengurus ormawa untuk membalas mahasiswa.',

  view_announcements: 'Mampu melihat daftar pengumuman penting internal organisasi.',
  create_announcements: 'Mampu memublikasikan pengumuman penting ke seluruh mahasiswa.',
  edit_announcements: 'Mampu mengedit teks, lampiran, atau periode terbit pengumuman.',
  delete_announcements: 'Mampu menarik kembali/menghapus pengumuman yang sudah kedaluwarsa.',

  view_rbac: 'Mampu melihat jenis-jenis role kepengurusan beserta hak otoritasnya.',
  manage_rbac: 'Mampu mengonfigurasi pembagian hak istimewa (Create/Read/Update/Delete) pengurus, membuat role baru, serta menghapus role.',

  view_settings: 'Mampu melihat data profil resmi, website, dan rekening bank ormawa.',
  manage_settings: 'Mampu mengunggah logo baru, visi/misi, link sosial media, dan rekening bank penerimaan dana kegiatan.'
}

// Visual color categories mapping to permissions for gorgeous badges
const getPermBadgeClass = (h) => {
  if (h.startsWith('delete_') || ['manage_rbac', 'manage_settings'].some(x => h.includes(x))) {
    return 'bg-[var(--theme-error-light)] text-[var(--theme-error)] border-[var(--theme-error-light)]'
  }
  if (h.startsWith('create_') || h.startsWith('submit_') || h.startsWith('upload_')) {
    return 'bg-[var(--theme-success-light)] text-[var(--theme-success)] border-[var(--theme-success-light)]'
  }
  if (h.startsWith('edit_') || h.startsWith('respond_') || h.startsWith('manage_')) {
    return 'bg-[var(--theme-warning-light)] text-[var(--theme-warning)] border-[var(--theme-warning-light)]'
  }
  return 'bg-[var(--theme-info-light)] text-[var(--theme-info)] border-[var(--theme-info-light)]'
}

const PERM_GROUPS = [
  {
    title: 'Dashboard & Notifikasi',
    icon: 'dashboard',
    permissions: ['view_dashboard', 'view_notifications']
  },
  {
    title: 'Manajemen Anggota & Pengurus',
    icon: 'group',
    permissions: ['view_members', 'create_members', 'edit_members', 'delete_members']
  },
  {
    title: 'Struktur Organisasi',
    icon: 'account_tree',
    permissions: ['view_staff', 'manage_staff', 'view_structure', 'manage_structure']
  },
  {
    title: 'Proposal Kegiatan',
    icon: 'description',
    permissions: ['view_proposal', 'create_proposal', 'edit_proposal', 'delete_proposal']
  },
  {
    title: 'Laporan Pertanggungjawaban (LPJ)',
    icon: 'assignment',
    permissions: ['view_lpj', 'create_lpj', 'edit_lpj', 'upload_lpj_doc', 'delete_lpj']
  },
  {
    title: 'Kalender & Jadwal Kerja',
    icon: 'calendar_month',
    permissions: ['view_calendar', 'create_calendar', 'edit_calendar', 'delete_calendar']
  },
  {
    title: 'Sistem Absensi (QR)',
    icon: 'qr_code',
    permissions: ['view_attendance', 'submit_attendance', 'edit_attendance']
  },
  {
    title: 'Buku Kas & Keuangan',
    icon: 'account_balance_wallet',
    permissions: ['view_finance', 'create_finance', 'delete_finance']
  },
  {
    title: 'Aspirasi Mahasiswa',
    icon: 'campaign',
    permissions: ['view_aspirations', 'respond_aspirations']
  },
  {
    title: 'Siaran Pengumuman',
    icon: 'campaign',
    permissions: ['view_announcements', 'create_announcements', 'edit_announcements', 'delete_announcements']
  },
  {
    title: 'Role & Keamanan (RBAC)',
    icon: 'security',
    permissions: ['view_rbac', 'manage_rbac']
  },
  {
    title: 'Pengaturan Sistem',
    icon: 'settings',
    permissions: ['view_settings', 'manage_settings']
  }
]

export default function RoleBasedAccess() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selected, setSelected] = useState(null)

  const ormawaId = getOrmawaId()

  const [form, setForm] = useState({ Nama: '', Deskripsi: '', Hak: [], OrmawaID: ormawaId })
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
          OrmawaID: Number(ormawaId),
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
      render: (v, row) => <span className="font-bold text-[var(--theme-text)] font-headline text-[13px] tracking-tighter">{row.Nama || '—'}</span>
    },
    {
      key: 'Deskripsi', 
      label: 'Deskripsi Tanggung Jawab', 
      className: 'min-w-[240px]',
      render: (v, row) => <span className="font-medium text-[var(--theme-text-muted)] text-[12px]">{row.Deskripsi || '—'}</span>
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
              <Badge key={h} className={cn("font-semibold text-[8px] tracking-wider px-2.5 py-0.5 border rounded-full uppercase", getPermBadgeClass(h))}>
                {PERM_LABELS[h]?.replace('Manajemen ', '').replace('Akses ', '') || h}
              </Badge>
            ))}
            {hakList.length > 3 && (
              <Badge className="bg-[var(--theme-bg)] text-[var(--theme-text-muted)] font-semibold text-[8px] border border-border px-2.5 py-0.5 rounded-full">
                +{hakList.length - 3} HAK LAIN
              </Badge>
            )}
            {hakList.length === 0 && (
              <span className="text-[10px] font-bold text-[var(--theme-text-subtle)] italic">Tanpa Akses Modul</span>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <PageContent className="font-body">
      <Toaster position="top-right" />

            {/* ── Welcome Banner ─────────────────────────────────────────── */}
      <DashboardHero
        title="Otoritas &"
        highlightedTitle="Hak Akses"
        subtitle="Konfigurasi tata kelola otorisasi modul, hak istimewa role, dan kendali keamanan sistem."
        icon="security"
        badges={[
          { label: 'RBAC Portal', active: true }
        ]}
      />

      {/* ── Content Area ───────────────────────────────────────────── */}
      <div className="glass-card mb-8 animate-in slide-in-from-bottom-4 duration-500 fade-in border border-white/20 overflow-hidden">
        <div className="p-0">
          <DataTable
            containerClassName="border-0 shadow-none rounded-none"
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
                  className="h-8 w-8 text-[var(--theme-text-muted)] hover:text-[var(--theme-warning)] hover:bg-[var(--theme-warning-light)] rounded-lg active:scale-95 transition-all"
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
                  className="h-8 w-8 text-[var(--theme-text-muted)] hover:text-[var(--theme-error)] hover:bg-[var(--theme-error-light)] rounded-lg active:scale-95 transition-all"
                  title="Hapus Role"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </Button>
              </div>
            )}
          />
        </div>
      </div>

      {/* ── CRUD Dialog (Premium Glassmorphism Style) ── */}
      <DialogModal
        open={isCrudOpen}
        onOpenChange={setIsCrudOpen}
        title={isEditMode ? 'Konfigurasi Hak Akses Role' : 'Daftarkan Role Baru'}
        subtitle="Konfigurasi izin akses dan otorisasi modul."
        icon="security"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <ModalCancelButton onClick={() => setIsCrudOpen(false)} />
            <ModalSaveButton loading={isSubmitting} form="rbac-form">
              {isEditMode ? 'SIMPAN OTORITAS' : 'TERBITKAN ROLE'}
            </ModalSaveButton>
          </div>
        }
      >
        <form id="rbac-form" onSubmit={handleSave} className="flex flex-col">
          <div className="p-6 md:p-8 space-y-5 max-h-[60vh] overflow-y-auto no-scrollbar font-inter">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Role */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--theme-text)]">Nama Otoritas Role</Label>
                  <Input 
                    required 
                    value={form.Nama} 
                    onChange={e => setForm({ ...form, Nama: e.target.value })} 
                    placeholder="Misal: Ketua, Bendahara, Staff Divisi..."
                    className="w-full" 
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--theme-text)]">Tanggung Jawab Singkat</Label>
                  <Input 
                    value={form.Deskripsi} 
                    onChange={e => setForm({ ...form, Deskripsi: e.target.value })} 
                    placeholder="Deskripsi singkat kewenangan tugas..."
                    className="w-full" 
                  />
                </div>
              </div>

              {/* CRUD Permission Matrix */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-[var(--theme-text)] block">
                  Matriks Izin Otorisasi (Centang per CRUD)
                </Label>
                <div className="max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-bold text-[var(--theme-text-muted)] uppercase tracking-widest border-b border-[var(--theme-border-muted)]">
                        <th className="py-2 pr-2 w-1/3">Fitur</th>
                        <th className="py-2 px-1 text-center w-[60px]"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>visibility</span></th>
                        <th className="py-2 px-1 text-center w-[60px]"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>add</span></th>
                        <th className="py-2 px-1 text-center w-[60px]"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>edit</span></th>
                        <th className="py-2 px-1 text-center w-[60px]"><span className="material-symbols-outlined" style={{fontSize:'14px'}}>delete</span></th>
                        <th className="py-2 pl-1 text-center w-[60px]">Lain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--theme-border-muted)]">
                      {PERM_GROUPS.map((group, gIdx) => {
                        const viewP = group.permissions.find(p => p.startsWith('view_'))
                        const createP = group.permissions.find(p => p.startsWith('create_') || p.startsWith('submit_'))
                        const editP = group.permissions.find(p => p.startsWith('edit_') || p.startsWith('respond_'))
                        const deleteP = group.permissions.find(p => p.startsWith('delete_'))
                        const extraP = group.permissions.filter(p => p !== viewP && p !== createP && p !== editP && p !== deleteP && !p.startsWith('manage_'))
                        return (
                          <tr key={gIdx} className="hover:bg-[var(--theme-primary-light)]/40 transition-colors">
                            <td className="py-2.5 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[var(--theme-text-muted)] shrink-0" style={{fontSize:'15px'}}>{group.icon}</span>
                                <span className="text-[11px] font-semibold text-[var(--theme-text)] font-headline leading-tight">{group.title}</span>
                              </div>
                            </td>
                            {[viewP, createP, editP, deleteP].map((p, i) => (
                              <td key={i} className="py-2.5 px-1 text-center">
                                {p && (
                                  <label className="flex items-center justify-center cursor-pointer">
                                    <input type="checkbox"
                                      checked={(form.Hak || []).includes(p)}
                                      onChange={() => toggleHak(p)}
                                      className="size-4 rounded border-border text-[var(--theme-primary)] focus:ring-[var(--theme-primary-light)] cursor-pointer" />
                                  </label>
                                )}
                              </td>
                            ))}
                            <td className="py-2.5 pl-1 text-center">
                              {extraP.length > 0 && (
                                <div className="flex items-center justify-center gap-0.5">
                                  {extraP.map(p => (
                                    <label key={p} className="flex items-center justify-center cursor-pointer" title={PERM_LABELS[p]?.split(': ')[1] || p}>
                                      <input type="checkbox"
                                        checked={(form.Hak || []).includes(p)}
                                        onChange={() => toggleHak(p)}
                                        className="size-4 rounded border-border text-[var(--theme-warning)] focus:ring-[var(--theme-warning-light)] cursor-pointer" />
                                    </label>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <p className="text-[9px] text-[var(--theme-text-muted)] font-medium mt-3 italic px-1">
                    Total: <span className="font-bold text-[var(--theme-text)]">{(form.Hak || []).length}</span> dari {PERMISSIONS.length} Izin Terpilih
                  </p>
                </div>
              </div>
            </div>

        </form>
      </DialogModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Role Otoritas?" 
        description="Apakah Anda yakin ingin menghapus role otorisasi ini? Seluruh anggota dengan role ini akan kehilangan izin akses modul terkait." 
        loading={isSubmitting} 
      />
    </PageContent>
  )
}
