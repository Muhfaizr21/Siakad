"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from './components/ui/data-table'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog'
import { DeleteConfirmModal } from './components/ui/DeleteConfirmModal'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar'


import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const KeyRound = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>vpn_key</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



const ROLES = ['super_admin', 'faculty_admin', 'ormawa_admin', 'ormawa', 'mahasiswa', 'psikolog', 'kencana_admin', 'kencana_fakultas', 'kencana_mentor']

const TABS = [
  { key: 'identities', label: 'Identities', icon: 'manage_accounts' },
  { key: 'roles', label: 'Roles', icon: 'badge' },
  { key: 'permissions', label: 'Permission Matrix', icon: 'security' }
]

const emptyRoleForm = { key: '', label: '', description: '', permissions: [] }

const ROLE_DETAILS_DEFAULT = {
  super_admin: {
    label: 'Super Admin',
    cls: 'bg-rose-50/70 text-rose-600 border border-rose-200/60 shadow-none font-bold',
    desc: 'Otoritas penuh infrastruktur, audit log, dan tata kelola keamanan sistem.',
    perms: ['Full Root Access', 'System Config', 'RBAC Management', 'Audit Forensics']
  },
  SUPER_ADMIN: { label: 'Super Admin', cls: 'bg-rose-50/70 text-rose-600 border border-rose-200/60 shadow-none font-bold', desc: 'Otoritas penuh', perms: ['Full Access'] },
  faculty_admin: {
    label: 'Admin Fakultas',
    cls: 'bg-indigo-50/70 text-indigo-600 border border-indigo-200/60 shadow-none font-bold',
    desc: 'Yurisdiksi data akademik, dosen, dan mahasiswa di level fakultas.',
    perms: ['Faculty Data', 'Student Mgmt', 'Lecturer Mgmt', 'Academic Mapping']
  },
  ormawa_admin: {
    label: 'Admin Ormawa',
    cls: 'bg-bku-primary/10 text-bku-primary border border-bku-primary/20 shadow-none font-bold',
    desc: 'Manajemen organisasi kemahasiswaan, anggaran, dan alur proposal.',
    perms: ['Ormawa Engine', 'Proposal Review', 'Fiscal Tracking', 'Member Governance']
  },
  ormawa: {
    label: 'Pengurus Ormawa',
    cls: 'bg-sky-50/70 text-sky-600 border border-sky-200/60 shadow-none font-bold',
    desc: 'Anggota aktif pengurus ormawa dengan akses operasional internal organisasi.',
    perms: ['Proposal Access', 'Event Management', 'Attendance Tracking', 'Member View']
  },
  mahasiswa: {
    label: 'Mahasiswa',
    cls: 'bg-emerald-50/70 text-emerald-600 border border-emerald-200/60 shadow-none font-bold',
    desc: 'Akses layanan mandiri, pengajuan proposal, dan portal aspirasi.',
    perms: ['Self Service', 'Aspiration Engine', 'Proposal Cluster', 'Student Analytics']
  },
  psikolog: {
    label: 'Psikolog',
    cls: 'bg-teal-50/70 text-teal-600 border border-teal-200/60 shadow-none font-bold',
    desc: 'Otoritas klinis pengelolaan layanan kesehatan mental mahasiswa.',
    perms: ['Clinical Counseling', 'Psychological Assessment', 'Case Reports', 'Booking System']
  },
  kencana_admin: {
    label: 'Admin Kencana',
    cls: 'bg-amber-600 text-white shadow-amber-200',
    desc: 'Otoritas pusat untuk periode, materi, quiz, remedial, mentor, dan sertifikat Kencana.',
    perms: ['Kencana Config', 'Timeline Builder', 'Mentor Override', 'Certificate Gate']
  },
  kencana_fakultas: {
    label: 'Admin Kencana Fakultas',
    cls: 'bg-cyan-700 text-white shadow-cyan-200',
    desc: 'Mengelola kegiatan Kencana yang dibatasi pada mahasiswa dan sesi fakultas terkait.',
    perms: ['Faculty Kencana', 'Scoped Participants', 'Attendance Review', 'Handbook Review']
  },
  kencana_mentor: {
    label: 'Dewan Pembimbing',
    cls: 'bg-stone-800 text-white shadow-stone-200',
    desc: 'Akun khusus pembimbing Kencana dengan scope universitas atau fakultas.',
    perms: ['Mentor Dashboard', 'Student Invite', 'Progress Notes', 'Affective Score']
  }
}

const THEME_PRESETS = {
  indigo: {
    label: 'Indigo Accent',
    cls: 'bg-indigo-50/70 text-indigo-600 border border-indigo-200/60 shadow-none font-bold'
  },
  amber: {
    label: 'Amber Gold',
    cls: 'bg-amber-50/70 text-amber-600 border border-amber-200/60 shadow-none font-bold'
  },
  rose: {
    label: 'Rose Crimson',
    cls: 'bg-rose-50/70 text-rose-600 border border-rose-200/60 shadow-none font-bold'
  },
  emerald: {
    label: 'Emerald Mint',
    cls: 'bg-emerald-50/70 text-emerald-600 border border-emerald-200/60 shadow-none font-bold'
  },
  teal: {
    label: 'Teal Spruce',
    cls: 'bg-teal-50/70 text-teal-600 border border-teal-200/60 shadow-none font-bold'
  },
  sky: {
    label: 'Sky Cyan',
    cls: 'bg-sky-50/70 text-sky-600 border border-sky-200/60 shadow-none font-bold'
  },
  violet: {
    label: 'Violet Royal',
    cls: 'bg-violet-50/70 text-violet-600 border border-violet-200/60 shadow-none font-bold'
  },
  navy: {
    label: 'BKU Navy',
    cls: 'bg-bku-primary/10 text-bku-primary border border-bku-primary/20 shadow-none font-bold'
  }
}

const getCleanImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const baseUrl = API_BASE_URL.replace('/api', '')
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function StudentAvatar({ src, name, className = "w-9 h-9 rounded-xl" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const hasNoImage = !src || src.trim() === "" || src.endsWith("/profiles/") || src.endsWith("/students/") || src.endsWith("localhost:8000") || src.endsWith("localhost:8000/");

  return (
    <div className={cn("relative bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200/40 shadow-inner overflow-hidden", className)}>
      {(!loaded || error || hasNoImage) && (
        <span className="material-symbols-outlined text-slate-400/80 block select-none leading-none absolute animate-in fade-in" style={{ fontSize: className.includes('w-28') ? '56px' : className.includes('w-14') ? '28px' : '20px' }}>
          person
        </span>
      )}
      {!hasNoImage && !error && (
        <img
          src={src}
          alt={name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

const getAuthorityScore = (roleKey) => {
  if (roleKey === 'super_admin') return 4
  if (roleKey === 'faculty_admin') return 3
  if (roleKey === 'ormawa_admin' || roleKey === 'psikolog' || roleKey.includes('counsel') || roleKey.includes('fasilitat')) return 2
  return 1
}

const PERM_CATEGORIES = [
  {
    title: '🔐 Sistem & Keamanan',
    items: [
      { key: 'system_config',    label: 'Konfigurasi Sistem & SMTP',        desc: 'Pengaturan global sistem: Mail Server, bobot nilai, tahun ajaran, dan parameter infrastruktur.' },
      { key: 'rbac_management',  label: 'Manajemen RBAC & Hak Akses',       desc: 'Membuat, mengubah, dan mencabut peran serta izin untuk setiap akun pengguna sistem.' },
      { key: 'audit_log',        label: 'Audit Trails & Log Keamanan',      desc: 'Memantau dan mengunduh rekaman log aktivitas sistem beserta forensik keamanan server.' },
      { key: 'user_management',  label: 'Manajemen Akun Pengguna',          desc: 'Membuat, mengedit, menangguhkan, atau menghapus akun pengguna di seluruh peran.' },
      { key: 'security_settings',label: 'Pengaturan Keamanan & 2FA',        desc: 'Mengelola kebijakan password, sesi, dan autentikasi dua faktor akun sistem.' },
    ]
  },
  {
    title: '🏛️ Manajemen Data Akademik',
    items: [
      { key: 'faculty_data',     label: 'Data Fakultas & Program Studi',    desc: 'Menambah, mengubah, atau menghapus entitas Fakultas, Program Studi, dan Kurikulum.' },
      { key: 'student_data',     label: 'Data & Direktori Mahasiswa',       desc: 'Mengakses, mengimpor, mengubah status, dan mengelola profil data mahasiswa.' },
      { key: 'lecturer_data',    label: 'Data Dosen & Tenaga Pengajar',     desc: 'Mengelola profil, mata kuliah ampu, dan evaluasi kinerja dosen.' },
      { key: 'krs_management',   label: 'KRS & Penjadwalan Kuliah',         desc: 'Memproses registrasi KRS, jadwal mata kuliah, dan distribusi kelas mahasiswa.' },
      { key: 'nilai_grading',    label: 'Entri & Validasi Nilai',           desc: 'Mengisi, memvalidasi, dan menerbitkan nilai evaluasi mata kuliah per semester.' },
      { key: 'laporan_akademik', label: 'Laporan & Rekap Akademik',         desc: 'Mengakses laporan akademik, transkip, dan rekap kelulusan mahasiswa.' },
    ]
  },
  {
    title: '🎓 Kemahasiswaan & Ormawa',
    items: [
      { key: 'ormawa_registry',  label: 'Registrasi & Kelola Ormawa',       desc: 'Mendaftarkan, mengubah, atau menonaktifkan entitas HIMA, BEM, dan UKM.' },
      { key: 'ormawa_member',    label: 'Manajemen Anggota & Struktur',     desc: 'Mengelola keanggotaan, struktur organisasi, dan divisi internal Ormawa.' },
      { key: 'proposal_kegiatan',label: 'Pengajuan & Persetujuan Proposal', desc: 'Mengunggah, mereview, menyetujui, atau menolak proposal kegiatan Ormawa.' },
      { key: 'lpj_management',   label: 'Laporan Pertanggungjawaban (LPJ)', desc: 'Mengunggah, mengoreksi, dan mengelola dokumen LPJ pasca-kegiatan.' },
      { key: 'fiscal_budget',    label: 'Anggaran & Keuangan Kas',          desc: 'Mengelola kas masuk/keluar, pagu anggaran, dan persetujuan pengeluaran Ormawa.' },
      { key: 'absensi_kegiatan', label: 'Absensi & Jadwal Kegiatan',        desc: 'Mencatat kehadiran peserta dan mengelola kalender jadwal kegiatan Ormawa.' },
    ]
  },
  {
    title: '🩺 Layanan Kemahasiswaan',
    items: [
      { key: 'counseling',       label: 'Konseling & Psikologi',            desc: 'Memesan sesi konsultasi, mengakses rekam medis klien, dan mengelola jadwal psikolog.' },
      { key: 'health_screening', label: 'Skrining Kesehatan Mahasiswa',     desc: 'Mengisi, melihat, dan mengarsipkan hasil skrining kesehatan mandiri mahasiswa.' },
      { key: 'beasiswa',         label: 'Data & Pengajuan Beasiswa',        desc: 'Mendaftarkan, memvalidasi, dan memantau status pengajuan beasiswa mahasiswa.' },
      { key: 'prestasi',         label: 'Pencatatan Prestasi Mahasiswa',    desc: 'Menambah dan memvalidasi capaian prestasi akademik maupun non-akademik mahasiswa.' },
      { key: 'aspirasi',         label: 'Aspirasi & Student Voice',         desc: 'Mengajukan, membalas, dan mengeskalasi tiket aspirasi/pengaduan mahasiswa.' },
      { key: 'pkkmb',            label: 'PKKMB & Orientasi Mahasiswa Baru', desc: 'Mengelola data peserta, jadwal, dan dokumentasi kegiatan PKKMB/orientasi.' },
    ]
  },
  {
    title: '📢 Konten & Komunikasi',
    items: [
      { key: 'announcement',     label: 'Berita & Pengumuman',              desc: 'Membuat, menerbitkan, dan mengarsipkan berita serta pengumuman resmi kampus.' },
      { key: 'notification',     label: 'Broadcast & Notifikasi Push',      desc: 'Mengirim notifikasi massal atau pesan terpusat ke kelompok pengguna tertentu.' },
      { key: 'reports_export',   label: 'Laporan & Ekspor Data',            desc: 'Mengekspor laporan keseluruhan sistem dalam format PDF/Excel untuk kebutuhan analitik.' },
    ]
  },
]

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('identities')
  const [users, setUsers] = useState([])
  const [rbacRoles, setRbacRoles] = useState([])
  const [permissionCatalog, setPermissionCatalog] = useState([])
  const [faculties, setFaculties] = useState([])
  const [allProdi, setAllProdi] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [isCrudOpen, setIsCrudOpen] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isPermsOpen, setIsPermsOpen] = useState(false)
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newOrmawaId, setNewOrmawaId] = useState('')
  const [newOrmawaAssign, setNewOrmawaAssign] = useState('')
  const [newFakultasId, setNewFakultasId] = useState('')
  const [newKencanaScopeType, setNewKencanaScopeType] = useState('faculty')
  const [ormawas, setOrmawas] = useState([])
  const [roleForm, setRoleForm] = useState(emptyRoleForm)
  const [selectedRoleKey, setSelectedRoleKey] = useState('super_admin')
  const [permissionDraft, setPermissionDraft] = useState([])
  const [form, setForm] = useState({ 
    Email: '', 
    Password: '', 
    Role: 'mahasiswa',
    Nama: '',
    FakultasID: '',
    ProgramStudiID: '',
    OrmawaAssign: '',
    OrmawaID: '',
    KencanaScopeType: 'faculty',
    Phone: ''
  })



  const handleEmailChange = (emailVal) => {
    setForm(prev => {
      let updatedPassword = prev.Password;
      if (prev.Role === 'mahasiswa') {
        const parts = emailVal.split('@');
        const nim = parts[0].trim();
        if (nim) {
          updatedPassword = `pass${nim}`;
        }
      }
      return {
        ...prev,
        Email: emailVal,
        Password: updatedPassword
      };
    });
  };

  const handleRoleChange = (roleVal) => {
    setForm(prev => {
      let updatedPassword = prev.Password;
      if (roleVal === 'mahasiswa') {
        const parts = prev.Email.split('@');
        const nim = parts[0].trim();
        if (nim) {
          updatedPassword = `pass${nim}`;
        }
      }
      return {
        ...prev,
        Role: roleVal,
        Password: updatedPassword
      };
    });
  };

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userRes, facRes, prodiRes, ormawaRes, roleRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllFaculties(),
        adminService.getAllProdi(),
        adminService.getAllOrmawa(),
        adminService.getRBACRoles()
      ])

      if (userRes?.status === 'success') setUsers(userRes.data || [])
      if (facRes?.status === 'success') setFaculties(facRes.data || [])
      if (prodiRes?.status === 'success') setAllProdi(prodiRes.data || [])
      if (ormawaRes?.status === 'success') setOrmawas(ormawaRes.data || [])
      if (roleRes?.status === 'success') {
        const rolePayload = roleRes.data || {}
        setRbacRoles(rolePayload.roles || [])
        setPermissionCatalog(rolePayload.catalog || [])
        const firstRole = rolePayload.roles?.[0]?.key
        if (firstRole && !selectedRoleKey) setSelectedRoleKey(firstRole)
      }
    } catch (err) { 
      toast.error('Gagal sinkronisasi data master-node') 
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (!selectedRBACRole) return
    setPermissionDraft(Array.isArray(selectedRBACRole.permissions) ? selectedRBACRole.permissions : [])
  }, [selectedRBACRole?.value])

  const togglePermission = (permission) => {
    setPermissionDraft(prev => prev.includes(permission) ? prev.filter(item => item !== permission) : [...prev, permission])
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        ...roleForm,
        key: String(roleForm.key || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        label: String(roleForm.label || '').trim(),
        description: String(roleForm.description || '').trim(),
        permissions: roleForm.permissions || []
      }
      const res = await adminService.createRBACRole(payload)
      if (res.status === 'success') {
        toast.success('Role RBAC berhasil dibuat')
        setIsCreateRoleOpen(false)
        setRoleForm(emptyRoleForm)
        setSelectedRoleKey(res.data?.key || payload.key)
        fetchData()
      } else {
        toast.error(res.message || 'Gagal membuat role RBAC')
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal membuat role RBAC')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSavePermissions = async () => {
    const role = rbacRoles.find(item => item.key === selectedRoleKey)
    if (!role) { toast.error('Role belum tersinkron dari server'); return }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateRBACRole(role.id || role.ID, {
        label: role.label,
        description: role.description,
        permissions: permissionDraft,
        status: role.status || 'active'
      })
      if (res.status === 'success') {
        toast.success('Permission role berhasil disimpan')
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan permission')
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan permission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault(); setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        Email: String(form.Email || '').trim(),
        Password: String(form.Password || ''),
        Role: String(form.Role || '').trim(),
        Nama: String(form.Nama || '').trim(),
        FakultasID: Number(form.FakultasID) || 0,
        ProgramStudiID: Number(form.ProgramStudiID) || 0,
        OrmawaAssign: String(form.OrmawaAssign || '').trim(),
        OrmawaID: Number(form.OrmawaID) || 0,
        KencanaScopeType: String(form.KencanaScopeType || 'faculty').trim(),
        Phone: String(form.Phone || '').trim(),
      }
      const res = await adminService.createUser(payload)
      if (res.status === 'success') { 
        toast.success('Identitas digital berhasil diregistrasi')
        setIsCrudOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal menginisialisasi akun')
      }
    } catch (err) { toast.error(err?.message || 'Kesalahan operasional internal') } finally { setIsSubmitting(false) }
  }

  const handleUpdateRole = async () => {
    if (!newRole) { toast.error('Seleksi level akses diperlukan'); return }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateUserRole({ 
        userId: selected?.id || selected?.ID, 
        role: newRole,
        ormawaId: Number(newOrmawaId) || 0,
        ormawaAssign: String(newOrmawaAssign || '').trim(),
        fakultasId: Number(newFakultasId) || 0,
        kencanaScopeType: String(newKencanaScopeType || 'faculty').trim()
      })
      if (res.status === 'success') { 
        toast.success('Level otorisasi berhasil diperbarui')
        setIsRoleOpen(false)
        fetchData() 
      } else {
        toast.error(res.message || 'Gagal memperbarui otorisasi')
      }
    } catch (err) { 
      toast.error(err.message || 'Kegagalan sinkronisasi RBAC') 
    } finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await adminService.deleteUser(selected?.id || selected?.ID)
      toast.success('Entitas akun berhasil dicabut')
      setIsDelOpen(false)
      fetchData()
    } catch { 
      toast.error('Gagal mencabut entitas akun') 
    } finally { 
      setIsSubmitting(false) 
    }
  }

  const columns = [
    {
      key: 'email', label: 'Identitas Digital', className: 'min-w-[320px]',
      render: (v, row) => {
        const linkedName = row.identity_name || (row.role === 'super_admin' ? 'System Administrator' : 'Pending Identity')
        return (
          <div className="flex items-center gap-4 py-2 group/avatar">
            <StudentAvatar
              src={getCleanImageUrl(row.foto_url || row.FotoURL || row.Foto || row.Pengguna?.Foto || row.foto || row.pengguna?.foto)}
              name={linkedName}
              className="w-11 h-11 rounded-xl border-2 border-white shadow-md transition-all group-hover/avatar:scale-110"
            />
            <div className="flex flex-col">
              <span className="font-bold text-neutral-900 font-jakarta tracking-tight text-[14px] leading-tight group-hover:text-primary transition-colors">{linkedName}</span>
              <div className="flex items-center gap-1.5 mt-1 text-neutral-400">
                 <span className="material-symbols-outlined text-primary/60" style={{ fontSize: '10px' }} >mail</span>
                 <span className="text-[10px] font-bold tracking-widest lowercase">{v || row.email || '—'}</span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'fakultas_nama', label: 'Cluster Afiliasi', className: 'w-[240px]',
      render: (v, row) => {
        const role = (row.role || '').toLowerCase()
        let context = '-'
        let subContext = ''

        if (role === 'super_admin') {
          context = 'Universitas (Global)'
        } else if (role === 'faculty_admin') {
          context = v || 'Cluster Unassigned'
        } else if (role === 'ormawa_admin') {
          context = row.ormawa_assign || row.ormawa_nama || 'Org Unassigned'
          subContext = v ? `Managed at ${v}` : ''
        } else if (role === 'mahasiswa') {
          context = row.prodi_nama || '-'
          subContext = v || ''
        } else if (role === 'psikolog') {
          context = 'Psychological Wing'
          subContext = 'BKU Clinical Unit'
        } else if (role === 'kencana_admin') {
          context = 'Kencana University'
          subContext = 'Global LMS Operations'
        } else if (role === 'kencana_fakultas') {
          context = v || 'Kencana Fakultas'
          subContext = 'Scoped faculty operations'
        } else if (role === 'kencana_mentor') {
          context = row.kencana_scope_type === 'university' ? 'Mentor Universitas' : (v || 'Mentor Fakultas')
          subContext = row.kencana_scope_type === 'university' ? 'All faculties' : 'Faculty scoped'
        }
        
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-bold text-neutral-800 font-jakarta leading-tight tracking-tight">{context}</span>
            {subContext && <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-1">{subContext}</span>}
          </div>
        )
      }
    },
    {
      key: 'role', label: 'Authorization', className: 'w-[160px]',
      render: (v, row) => {
        const r = v || row.role || ''
        const roleOption = roleOptions.find(role => role.value === r)
        const cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' }
        return (
          <Badge className={cn('font-bold text-[9px] px-3 py-1 border-none shadow-sm uppercase tracking-[0.15em] rounded-lg', cfg.cls)}>
            {cfg.label}
          </Badge>
        )
      }
    },
    {
      key: 'created_at', label: 'Audit Trail', className: 'w-[140px]',
      render: (v, row) => {
        const d = v || row.created_at
        return (
          <div className="flex flex-col text-right">
            <span className="font-bold text-neutral-900 text-[11px] font-jakarta tabular-nums">{d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
            <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-widest mt-0.5">Registration</span>
          </div>
        )
      }
    }
  ]

  return (
    <div className="px-1 py-4 md:px-2 xl:px-4 min-h-screen bg-transparent font-inter">
      <Toaster position="top-right" />
      
      <div className="max-w-[1600px] mx-auto space-y-8 select-none">
        
        {/* ── Page Header (Glassmorphic) ─────────────────────────── */}
        <section className="glass-card rounded-2xl border border-slate-200/60 p-6 md:p-8 relative overflow-hidden shadow-none">
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-bku-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1.5 bg-bku-primary rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-headline leading-none">Security & OIDC Cluster</span>
              </div>
              <h1 className="text-2xl font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h1)' }}>
                Identity <span className="text-bku-primary">Governance</span>
              </h1>
              <p className="text-slate-400 font-medium text-[11px] max-w-2xl leading-relaxed">
                Kendali akses terpusat berbasis RBAC untuk seluruh entitas sistem. Kelola hak istimewa, kaitan identitas, dan otorisasi infrastruktur.
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden lg:flex items-center gap-8 pr-8 border-r border-slate-200/40">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">Total Identity</p>
                  <p className="text-xl font-black text-bku-primary font-headline tabular-nums leading-none">{users.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">Privileged Nodes</p>
                  <p className="text-xl font-black text-rose-600 font-headline tabular-nums leading-none">{users.filter(u => u.role?.includes('admin') || u.Role?.includes('admin')).length}</p>
                </div>
              </div>

              <Button 
                onClick={() => setActiveTab('permissions')}
                variant="outline"
                className="h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-bku-primary gap-2.5 transition-all active:scale-95 shadow-none cursor-pointer font-headline"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >security</span>
                Permission Matrix
              </Button>
              <Button 
                onClick={() => { setRoleForm(emptyRoleForm); setIsCreateRoleOpen(true) }}
                className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span>
                Create Role
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

        {/* ── Table Section ────────────────────────────────────────── */}
        {activeTab === 'identities' && <Card className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
          <CardContent className="p-0">
            <DataTable
              columns={columns} 
              data={users} 
              loading={loading}
              searchPlaceholder="Search by identity handle, email, or authorization level..."
              onAdd={() => { setForm({ Email: '', Password: '', Role: 'mahasiswa', Nama: '', FakultasID: '', ProgramStudiID: '', OrmawaAssign: '', OrmawaID: '', KencanaScopeType: 'faculty', Phone: '' }); setIsCrudOpen(true) }} 
              addLabel="New Identity"
              filters={[{ key: 'role', placeholder: 'FILTER BY LEVEL', options: roleOptions.map(r => ({ label: r.label, value: r.value })) }]}
              searchWidth="max-w-md"
              actions={(row) => (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => { 
                      setSelected(row); 
                      setNewRole(row.role || row.Role || ''); 
                      setNewOrmawaId(row.ormawa_id || row.OrmawaID || '');
                      setNewOrmawaAssign(row.ormawa_assign || row.OrmawaAssign || '');
                      setNewFakultasId(row.fakultas_id || row.FakultasID || '');
                      setNewKencanaScopeType(row.kencana_scope_type || row.KencanaScopeType || 'faculty');
                      setIsRoleOpen(true) 
                    }} 
                    variant="ghost" 
                    className="h-8 px-3 gap-2 text-slate-400 hover:text-bku-primary hover:bg-bku-primary/5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border-none shadow-none cursor-pointer"
                  >
                    <KeyRound size={12} strokeWidth={2.5} className="text-slate-400 group-hover:text-bku-primary" /> Otoritas
                  </Button>
                  <Button onClick={() => { setSelected(row); setIsDelOpen(true) }} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shadow-none cursor-pointer"><span className="material-symbols-outlined leading-none" style={{ fontSize: '15px' }} >delete</span></Button>
                </div>
              )}
            />
          </CardContent>
        </Card>}

        {activeTab === 'roles' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {roleOptions.map(role => {
              const cfg = ROLE_DETAILS[role.value] || { cls: 'bg-neutral-100 text-neutral-600 shadow-none' }
              return (
                <Card key={role.value} className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden hover:border-primary/20 transition-all">
                  <CardContent className="p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <Badge className={cn('font-bold text-[9px] px-3 py-1 border-none shadow-sm uppercase tracking-[0.15em] rounded-lg break-words whitespace-normal leading-relaxed text-left', cfg.cls)}>{role.label}</Badge>
                        <h3 className="text-lg font-bold text-neutral-900 font-jakarta tracking-tight break-all">{role.value}</h3>
                      </div>
                      <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0', role.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400')}>{role.status}</span>
                    </div>
                    <p className="text-[12px] font-medium text-neutral-500 leading-relaxed min-h-[48px]">{role.description || 'Custom access role without special identity linkage.'}</p>
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{role.permissions?.includes('*') ? 'Full access' : `${role.permissions?.length || 0} permissions`}</span>
                      <Button onClick={() => { setSelectedRoleKey(role.value); setActiveTab('permissions') }} variant="ghost" className="h-9 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5">Configure</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>
        )}

        {activeTab === 'permissions' && (
          <section className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
            <Card className="border-neutral-200 shadow-sm rounded-xl bg-white h-fit">
              <CardContent className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-jakarta">Role Target</p>
                  <h2 className="text-2xl font-bold text-neutral-900 font-jakarta tracking-tight mt-1">Permission Matrix</h2>
                </div>
                <Select value={selectedRoleKey} onValueChange={setSelectedRoleKey}>
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[260px] overflow-y-auto">
                    {roleOptions.map(role => <SelectItem key={role.value} value={role.value} className="text-[10px] font-bold uppercase tracking-widest">{role.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-2">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Selected Role</p>
                  <p className="text-sm font-bold text-neutral-900 font-jakarta">{selectedRBACRole?.label || 'No role selected'}</p>
                  <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">{selectedRBACRole?.description || 'Atur permission per modul untuk role ini.'}</p>
                </div>
                <Button onClick={handleSavePermissions} disabled={isSubmitting || selectedRBACRole?.permissions?.includes('*')} className="w-full h-12 rounded-xl bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-primary border-none">
                  {selectedRBACRole?.permissions?.includes('*') ? 'Full Access Locked' : 'Save Permission Matrix'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {permissionCatalog.map(group => (
                <Card key={group.module} className="border-neutral-200 shadow-sm rounded-xl bg-white overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-neutral-900 font-jakarta tracking-tight">{group.module}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1">{group.items?.length || 0} permission nodes</p>
                      </div>
                      <span className="material-symbols-outlined text-primary/40" style={{ fontSize: '24px' }}>hub</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {(group.items || []).map(permission => {
                        const checked = selectedRBACRole?.permissions?.includes('*') || permissionSet.has(permission)
                        return (
                          <button
                            key={permission}
                            type="button"
                            disabled={selectedRBACRole?.permissions?.includes('*')}
                            onClick={() => togglePermission(permission)}
                            className={cn(
                              'p-3 rounded-xl border text-left flex items-center gap-3 transition-all',
                              checked ? 'border-primary/30 bg-primary/5 text-neutral-900' : 'border-neutral-100 bg-neutral-50/50 text-neutral-500 hover:border-neutral-200',
                              selectedRBACRole?.permissions?.includes('*') && 'opacity-70 cursor-not-allowed'
                            )}
                          >
                            <span className={cn('size-6 rounded-lg flex items-center justify-center shrink-0', checked ? 'bg-primary text-white' : 'bg-white text-neutral-300 border border-neutral-100')}>
                              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{checked ? 'check' : 'remove'}</span>
                            </span>
                            <span className="text-xs font-semibold tracking-tight text-neutral-700 break-all">{permission}</span>
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ── Create User Modal ───────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader className="p-10 pb-8 border-b border-slate-100 relative overflow-hidden bg-slate-50/40">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-bku-primary"><span className="material-symbols-outlined" style={{ fontSize: '140px' }} >manage_accounts</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined font-black text-[12px]">add</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bku-primary/70 font-headline">Account Provisioning</span>
              </div>
              <DialogTitle className="text-2xl font-black font-headline tracking-tight text-slate-800">Initialize New Identity</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400">Daftarkan identitas digital baru dan tentukan level otoritas sistem.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="p-10 pt-8 space-y-6">
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Identity Handle (Email)</Label>
                   <Input required type="email" value={form.Email} onChange={e => handleEmailChange(e.target.value)} placeholder="email@bku.ac.id" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Default Authentication</Label>
                   <Input required type="password" value={form.Password} onChange={e => setForm({ ...form, Password: e.target.value })} placeholder="••••••••" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter" />
                   {form.Role === 'mahasiswa' && (
                     <span className="text-[9px] font-extrabold text-emerald-600 block mt-1.5 pl-1 tracking-wide animate-in fade-in duration-200">
                       ⚡ Auto-generate: pass(NIM)
                     </span>
                   )}
                 </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Full Legal Name</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Full name for ID mapping..." className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter" />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Authorization Level</Label>
                <Select value={form.Role} onValueChange={handleRoleChange}>
                  </SelectContent>
                </Select>
              </div>

              {form.Role !== 'super_admin' && form.Role !== 'psikolog' && form.Role !== 'kencana_admin' && !(form.Role === 'kencana_mentor' && form.KencanaScopeType === 'university') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Fakultas</Label>
                    <Select 
                      value={form.FakultasID ? String(form.FakultasID) : undefined} 
                      onValueChange={v => setForm({ ...form, FakultasID: v, ProgramStudiID: '' })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs uppercase tracking-[0.08em] text-slate-700 transition-all">
                        <SelectValue placeholder="PILIH FAKULTAS" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-slate-100/80 bg-white/95 backdrop-blur-md max-h-[200px] overflow-y-auto">
                        {faculties.map(f => (
                          <SelectItem key={f.ID || f.id} value={String(f.ID || f.id)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-slate-50 focus:text-bku-primary">
                            {f.Nama || f.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Program Studi</Label>
                    <Select 
                      disabled={!form.FakultasID}
                      value={form.ProgramStudiID ? String(form.ProgramStudiID) : undefined} 
                      onValueChange={v => setForm({ ...form, ProgramStudiID: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs uppercase tracking-[0.08em] text-slate-700 transition-all disabled:opacity-50">
                        <SelectValue placeholder={form.FakultasID ? "PILIH PRODI" : "PILIH FAKULTAS DULU"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-slate-100/80 bg-white/95 backdrop-blur-md max-h-[200px] overflow-y-auto">
                        {allProdi
                          .filter(p => String(p.FakultasID || p.fakultas_id) === String(form.FakultasID))
                          .map(p => (
                            <SelectItem key={p.ID || p.id} value={String(p.ID || p.id)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-slate-50 focus:text-bku-primary">
                              {p.Nama || p.nama}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {form.Role === 'kencana_mentor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Kencana Scope</Label>
                    <Select value={form.KencanaScopeType} onValueChange={v => setForm({ ...form, KencanaScopeType: v, FakultasID: v === 'university' ? '' : form.FakultasID })}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-xs uppercase tracking-[0.1em]"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                        <SelectItem value="faculty" className="text-[10px] font-bold uppercase tracking-widest">Fakultas</SelectItem>
                        <SelectItem value="university" className="text-[10px] font-bold uppercase tracking-widest">Universitas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Phone</Label>
                    <Input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="Nomor kontak mentor" className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 focus:bg-white font-bold text-sm font-jakarta" />
                  </div>
                </div>
              )}

              {(form.Role === 'ormawa_admin' || form.Role === 'ormawa') && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Assign Ormawa</Label>
                  <Select 
                    value={form.OrmawaID ? String(form.OrmawaID) : undefined} 
                    onValueChange={v => {
                      const selectedOrm = ormawas.find(o => String(o.id || o.ID) === String(v));
                      setForm({ ...form, OrmawaID: v, OrmawaAssign: selectedOrm ? selectedOrm.Nama || selectedOrm.nama : '' });
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs uppercase tracking-[0.08em] text-slate-700 transition-all">
                      <SelectValue placeholder="PILIH ORGANISASI MAHASISWA" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100/80 bg-white/95 backdrop-blur-md max-h-[200px] overflow-y-auto">
                      {ormawas.map(o => (
                        <SelectItem key={o.id || o.ID} value={String(o.id || o.ID)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-slate-50 focus:text-bku-primary">
                          {o.nama || o.Nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <footer className="pt-8 flex flex-col md:flex-row gap-4 border-t border-slate-100">
               <Button type="button" variant="ghost" onClick={() => setIsCrudOpen(false)} className="flex-1 h-14 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all font-headline shadow-none border-none cursor-pointer">Abort</Button>
               <Button type="submit" disabled={isSubmitting} className="flex-[2] h-14 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 shadow-lg shadow-bku-primary/15 transition-all active:scale-95 border-none flex items-center justify-center gap-3 font-headline cursor-pointer">
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '16px' }} >sync</span>
                  ) : (
                    <span className="material-symbols-outlined font-black" style={{ fontSize: '16px' }} >save</span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest">Commit New Account</span>
               </Button>
            </footer>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Update Role Modal ────────────────────────────────────── */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md animate-in zoom-in-95 duration-300">
          <DialogHeader className="p-8 pb-6 border-b border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-bku-primary text-white flex items-center justify-center shadow-xl shadow-bku-primary/20">
                <KeyRound size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h2)' }}>Modify Otoritas</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1.5 font-headline">Override account privilege nodes.</p>
              </div>
            </div>
          </DialogHeader>
          <div className="p-8 space-y-6">
             <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
               <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/50 flex items-center justify-between group">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Target Identity</p>
                     <p className="text-xs font-bold font-inter text-slate-700 truncate max-w-[200px] lowercase">{selected?.Email || selected?.email}</p>
                  </div>
                  <Badge className={cn("font-bold text-[8px] px-2.5 py-1 border-none shadow-sm uppercase rounded-lg group-hover:scale-105 transition-transform", roleDetails[selected?.role || selected?.Role]?.cls || "bg-neutral-100 text-slate-500")}>
                     {roleDetails[selected?.role || selected?.Role]?.label || selected?.role || selected?.Role}
                  </Badge>
               </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Target Authorization Level</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    </SelectContent>
                  </Select>
                </div>

                {(newRole === 'ormawa_admin' || newRole === 'ormawa') && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Assign Ormawa</Label>
                    <Select 
                      value={newOrmawaId ? String(newOrmawaId) : undefined} 
                      onValueChange={v => {
                        const selectedOrm = ormawas.find(o => String(o.id || o.ID) === String(v));
                        setNewOrmawaId(v);
                        setNewOrmawaAssign(selectedOrm ? selectedOrm.Nama || selectedOrm.nama : '');
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs uppercase tracking-[0.08em] text-slate-700 transition-all">
                        <SelectValue placeholder="PILIH ORGANISASI MAHASISWA" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-slate-100/80 bg-white/95 backdrop-blur-md max-h-[200px] overflow-y-auto">
                        {ormawas.map(o => (
                          <SelectItem key={o.id || o.ID} value={String(o.id || o.ID)} className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-slate-50 focus:text-bku-primary">
                            {o.nama || o.Nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(newRole === 'kencana_fakultas' || (newRole === 'kencana_mentor' && newKencanaScopeType === 'faculty')) && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Fakultas Kencana</Label>
                    <Select value={newFakultasId ? String(newFakultasId) : undefined} onValueChange={setNewFakultasId}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-[10px] uppercase tracking-widest text-neutral-600">
                        <SelectValue placeholder="PILIH FAKULTAS" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                        {faculties.map(f => (
                          <SelectItem key={f.ID || f.id} value={String(f.ID || f.id)} className="text-[10px] font-bold uppercase tracking-widest">
                            {f.Nama || f.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newRole === 'kencana_mentor' && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Mentor Scope</Label>
                    <Select value={newKencanaScopeType} onValueChange={v => { setNewKencanaScopeType(v); if (v === 'university') setNewFakultasId('') }}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/30 font-bold text-[10px] uppercase tracking-widest text-neutral-600"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                        <SelectItem value="faculty" className="text-[10px] font-bold uppercase tracking-widest">Fakultas</SelectItem>
                        <SelectItem value="university" className="text-[10px] font-bold uppercase tracking-widest">Universitas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
             </div>

             <footer className="flex gap-4 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setIsRoleOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all font-headline shadow-none border-none cursor-pointer">Abort</Button>
                <Button onClick={handleUpdateRole} disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 shadow-lg shadow-bku-primary/15 transition-all active:scale-95 border-none flex items-center justify-center gap-2 font-headline cursor-pointer font-black text-[10px]">
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span>
                  ) : (
                    <span className="material-symbols-outlined font-black" style={{ fontSize: '14px' }} >security</span>
                  )} 
                  Commit Authority
                </Button>
             </footer>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal 
        isOpen={isDelOpen} 
        onClose={() => setIsDelOpen(false)} 
        onConfirm={handleDelete}
        title="Destroy Identity Entity?" 
        description="Aksi ini akan mencabut seluruh hak akses, identitas digital, dan kaitan entitas pengguna ini secara permanen. Prosedur ini tidak dapat dibatalkan." 
        loading={isSubmitting} 
      />

      {/* ── Create Custom Role Modal ────────────────────────────── */}
      <Dialog open={isNewRoleOpen} onOpenChange={setIsNewRoleOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border border-slate-200/60 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-md animate-in zoom-in-95 duration-300 z-[9999]">
          <DialogHeader className="p-8 pb-6 border-b border-slate-100 bg-slate-50/40">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg shadow-amber-400/20">
                <span className="material-symbols-outlined font-black" style={{ fontSize: '20px' }}>shield_person</span>
              </div>
              <div>
                <h3 className="text-lg font-black font-headline tracking-tight leading-none" style={{ color: 'var(--theme-h3)' }}>Create Custom Role</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1.5 font-headline">Release dynamic privilege identity node</p>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleCreateCustomRole} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Role Identity Name</Label>
                <Input 
                  required 
                  value={newRoleForm.name} 
                  onChange={e => setNewRoleForm({ ...newRoleForm, name: e.target.value })} 
                  placeholder="e.g. Fasilitator, Kaprodi, Dekan..." 
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Privilege Theme Color</Label>
                <Select 
                  value={newRoleForm.theme} 
                  onValueChange={v => setNewRoleForm({ ...newRoleForm, theme: v })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs uppercase tracking-[0.08em] text-slate-700 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-slate-100/80 bg-white/95 backdrop-blur-md">
                    {Object.keys(THEME_PRESETS).map(key => (
                      <SelectItem key={key} value={key} className="text-[10px] font-black uppercase tracking-widest text-slate-600 focus:bg-slate-50 focus:text-bku-primary">
                        {THEME_PRESETS[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Description / Yurisdiksi</Label>
                <textarea 
                  value={newRoleForm.desc} 
                  onChange={e => setNewRoleForm({ ...newRoleForm, desc: e.target.value })} 
                  placeholder="Explain authority level rules..." 
                  className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter resize-none focus:outline-none"
                />
              </div>
            </div>

            <footer className="flex gap-4 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsNewRoleOpen(false)} className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all font-headline shadow-none border-none cursor-pointer">Abort</Button>
              <Button type="submit" className="flex-[2] h-12 rounded-xl bg-bku-primary text-white hover:bg-bku-primary/90 shadow-lg shadow-bku-primary/15 transition-all active:scale-95 border-none flex items-center justify-center gap-2 font-headline cursor-pointer font-black text-[10px]">
                <span className="material-symbols-outlined font-black" style={{ fontSize: '14px' }}>save</span>
                Save Custom Role
              </Button>
            </footer>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
