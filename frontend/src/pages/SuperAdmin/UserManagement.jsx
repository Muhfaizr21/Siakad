"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'


import { toast, Toaster } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { adminService, API_BASE_URL } from '../../services/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { PageContent, PageCard, PageCardHeader } from '@/components/ui/page'
import { DashboardHero } from '@/components/ui/dashboard'

// Auto-injected Material Symbol fallbacks for removed Lucide icons
const KeyRound = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''} ${props.animate ? 'animate-spin' : ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>vpn_key</span>;
const RefreshCw = ({ size, className, ...props }) => <span className={`material-symbols-outlined ${className || ''}`} style={{ fontSize: size || 24, ...props.style }} {...props}>sync</span>;



const ROLES = ['super_admin', 'faculty_admin', 'prodi_admin', 'ormawa_admin', 'ormawa', 'mahasiswa', 'psikolog', 'kencana_admin', 'kencana_fakultas', 'kencana_mentor']

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
      { key: 'system_config', label: 'Konfigurasi Sistem & SMTP', desc: 'Pengaturan global sistem: Mail Server, bobot nilai, tahun ajaran, dan parameter infrastruktur.' },
      { key: 'rbac_management', label: 'Manajemen RBAC & Hak Akses', desc: 'Membuat, mengubah, dan mencabut peran serta izin untuk setiap akun pengguna sistem.' },
      { key: 'audit_log', label: 'Audit Trails & Log Keamanan', desc: 'Memantau dan mengunduh rekaman log aktivitas sistem beserta forensik keamanan server.' },
      { key: 'user_management', label: 'Manajemen Akun Pengguna', desc: 'Membuat, mengedit, menangguhkan, atau menghapus akun pengguna di seluruh peran.' },
      { key: 'security_settings', label: 'Pengaturan Keamanan & 2FA', desc: 'Mengelola kebijakan password, sesi, dan autentikasi dua faktor akun sistem.' },
    ]
  },
  {
    title: '🏛️ Manajemen Data Akademik',
    items: [
      { key: 'faculty_data', label: 'Data Fakultas & Program Studi', desc: 'Menambah, mengubah, atau menghapus entitas Fakultas, Program Studi, dan Kurikulum.' },
      { key: 'student_data', label: 'Data & Direktori Mahasiswa', desc: 'Mengakses, mengimpor, mengubah status, dan mengelola profil data mahasiswa.' },
      { key: 'lecturer_data', label: 'Data Dosen & Tenaga Pengajar', desc: 'Mengelola profil, mata kuliah ampu, dan evaluasi kinerja dosen.' },
      { key: 'krs_management', label: 'KRS & Penjadwalan Kuliah', desc: 'Memproses registrasi KRS, jadwal mata kuliah, dan distribusi kelas mahasiswa.' },
      { key: 'nilai_grading', label: 'Entri & Validasi Nilai', desc: 'Mengisi, memvalidasi, dan menerbitkan nilai evaluasi mata kuliah per semester.' },
      { key: 'laporan_akademik', label: 'Laporan & Rekap Akademik', desc: 'Mengakses laporan akademik, transkip, dan rekap kelulusan mahasiswa.' },
    ]
  },
  {
    title: '🎓 Kemahasiswaan & Ormawa',
    items: [
      { key: 'ormawa_registry', label: 'Registrasi & Kelola Ormawa', desc: 'Mendaftarkan, mengubah, atau menonaktifkan entitas HIMA, BEM, dan UKM.' },
      { key: 'ormawa_member', label: 'Manajemen Anggota & Struktur', desc: 'Mengelola keanggotaan, struktur organisasi, dan divisi internal Ormawa.' },
      { key: 'proposal_kegiatan', label: 'Pengajuan & Persetujuan Proposal', desc: 'Mengunggah, mereview, menyetujui, atau menolak proposal kegiatan Ormawa.' },
      { key: 'lpj_management', label: 'Laporan Pertanggungjawaban (LPJ)', desc: 'Mengunggah, mengoreksi, dan mengelola dokumen LPJ pasca-kegiatan.' },
      { key: 'fiscal_budget', label: 'Anggaran & Keuangan Kas', desc: 'Mengelola kas masuk/keluar, pagu anggaran, dan persetujuan pengeluaran Ormawa.' },
      { key: 'absensi_kegiatan', label: 'Absensi & Jadwal Kegiatan', desc: 'Mencatat kehadiran peserta dan mengelola kalender jadwal kegiatan Ormawa.' },
    ]
  },
  {
    title: '🩺 Layanan Kemahasiswaan',
    items: [
      { key: 'counseling', label: 'Konseling & Psikologi', desc: 'Memesan sesi konsultasi, mengakses rekam medis klien, dan mengelola jadwal psikolog.' },
      { key: 'health_screening', label: 'Skrining Kesehatan Mahasiswa', desc: 'Mengisi, melihat, dan mengarsipkan hasil skrining kesehatan mandiri mahasiswa.' },
      { key: 'beasiswa', label: 'Data & Pengajuan Beasiswa', desc: 'Mendaftarkan, memvalidasi, dan memantau status pengajuan beasiswa mahasiswa.' },
      { key: 'prestasi', label: 'Pencatatan Prestasi Mahasiswa', desc: 'Menambah dan memvalidasi capaian prestasi akademik maupun non-akademik mahasiswa.' },
      { key: 'aspirasi', label: 'Aspirasi & Student Voice', desc: 'Mengajukan, membalas, dan mengeskalasi tiket aspirasi/pengaduan mahasiswa.' },
      { key: 'pkkmb', label: 'PKKMB & Orientasi Mahasiswa Baru', desc: 'Mengelola data peserta, jadwal, dan dokumentasi kegiatan PKKMB/orientasi.' },
    ]
  },
  {
    title: '📢 Konten & Komunikasi',
    items: [
      { key: 'announcement', label: 'Berita & Pengumuman', desc: 'Membuat, menerbitkan, dan mengarsipkan berita serta pengumuman resmi kampus.' },
      { key: 'notification', label: 'Broadcast & Notifikasi Push', desc: 'Mengirim notifikasi massal atau pesan terpusat ke kelompok pengguna tertentu.' },
      { key: 'reports_export', label: 'Laporan & Ekspor Data', desc: 'Mengekspor laporan keseluruhan sistem dalam format PDF/Excel untuk kebutuhan analitik.' },
    ]
  },
]

const getFeatureLabel = (prefix) => {
  const featureLabels = {
    // Core Security
    "admin": "Dashboard & Profil Admin",
    "rbac.users": "Manajemen Akun Pengguna",
    "rbac.roles": "Manajemen Role & Jabatan",
    "rbac.permissions": "Pengaturan Hak Akses",

    // Master Data
    "faculty": "Master Data Fakultas",
    "program_studi": "Master Data Program Studi",
    "students": "Master Data Mahasiswa",

    // Ormawa
    "ormawa": "Ormawa (Profil Utama)",
    "ormawa.members": "Keanggotaan Ormawa",
    "ormawa.events": "Kegiatan & Kalender Ormawa",
    "ormawa.finance": "Keuangan Kas Ormawa",
    "ormawa.proposals": "Pengajuan Proposal Ormawa",
    "ormawa.lpj": "Laporan LPJ Ormawa",
    "ormawa.announcements": "Siaran Pengumuman Ormawa",
    "ormawa.aspirations": "Aspirasi & Pengaduan Ormawa",
    "ormawa.recruitment": "Open Recruitment Ormawa",

    // Layanan Mahasiswa
    "student": "Dashboard & Profil Mahasiswa",
    "achievement": "Prestasi Mahasiswa",
    "scholarship": "Informasi & Pengajuan Beasiswa",
    "aspiration": "Pengaduan Aspirasi Kampus",
    "letters": "Surat Keterangan Mahasiswa",
    "health": "Rekam Medis & Kesehatan",

    // Konseling Psikolog
    "psychologist": "Profil & Pengaturan Psikolog",
    "psychologist.bookings": "Reservasi & Sesi Konseling",
    "psychologist.medical_records": "Rekam Medis Psikologis",
    "psychologist.referrals": "Surat Rujukan Psikologi",
    "psychologist.schedules": "Jam Operasional Konseling",
    "psychologist.reports": "Laporan Bulanan Konseling",

    // Kencana Mahasiswa
    "kencana.student": "Portal Kencana (Mahasiswa Baru)",

    // Kencana Admin Universitas
    "kencana.period": "Kencana: Periode Orientasi",
    "kencana.stage": "Kencana: Tahapan Orientasi",
    "kencana.session": "Kencana: Sesi Kegiatan",
    "kencana.material": "Kencana: Materi Pembelajaran",
    "kencana.quiz": "Kencana: Kuis & Ujian",
    "kencana.question": "Kencana: Bank Soal Kuis",
    "kencana.assignment": "Kencana: Penugasan Peserta",
    "kencana.mentor.university": "Kencana: Pembimbing Universitas",
    "kencana.other": "Kencana: Operasional Tambahan",

    // Kencana Admin Fakultas
    "kencana.faculty": "Kencana: Pengawasan Fakultas",

    // Dewan Pembimbing Kencana
    "kencana.mentor": "Kencana: Dashboard Dewan Pembimbing",
    "kencana.mentor.students": "Kencana: Bimbingan Aktif",
    "kencana.mentor.notes": "Kencana: Catatan Konsultasi",
    "kencana.mentor.score_items": "Kencana: Penilaian Kriteria",
  };

  if (featureLabels[prefix]) return featureLabels[prefix];

  return prefix.split('.').map(part => {
    let s = part.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

const getActionLabel = (suffix) => {
  const actionLabels = {
    "view": "Lihat (Read)",
    "create": "Tambah (Create)",
    "update": "Ubah (Update)",
    "delete": "Hapus (Delete)",
    "manage": "Kelola (Manage)",
    "verify": "Verifikasi (Verify)",
    "assign": "Tugaskan (Assign)",
    "update_role": "Ubah Role",
    "update_status": "Ubah Status",
    "invite": "Undang (Invite)"
  };

  if (actionLabels[suffix]) return actionLabels[suffix];

  let s = suffix.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const groupPermissionsByFeature = (items) => {
  const groups = {};

  items.forEach(permission => {
    let parts = permission.split('.');
    let suffix = parts[parts.length - 1];
    let prefix = parts.slice(0, -1).join('.');

    if (parts.length === 1) {
      prefix = 'other';
      suffix = permission;
    }

    // Custom mapping overrides for grouping to keep things related
    if (prefix === "kencana.mentor" && suffix !== "dashboard" && suffix !== "profile.update" && suffix !== "available_students" && suffix !== "invite") {
      if (suffix.startsWith("student_")) {
        prefix = "kencana.mentor.students";
      }
    }

    if (!groups[prefix]) {
      groups[prefix] = {
        prefix: prefix,
        name: getFeatureLabel(prefix),
        permissions: []
      };
    }

    groups[prefix].permissions.push({
      key: permission,
      suffix: suffix,
      label: getActionLabel(suffix)
    });
  });

  return Object.values(groups);
};

const classifyPermission = (p) => {
  const s = p.suffix.toLowerCase();

  // View/Read
  if (
    s === 'view' ||
    s.includes('view') ||
    s === 'dashboard' ||
    s === 'timeline' ||
    s === 'session' ||
    s === 'handbook' ||
    s === 'attendance' ||
    s === 'score' ||
    s === 'remedial' ||
    s === 'certificate' ||
    s === 'mentor_invitations' ||
    s.includes('available_students')
  ) {
    return 'view';
  }

  // Create/Write
  if (
    s === 'create' ||
    s.includes('create') ||
    s === 'generate'
  ) {
    return 'create';
  }

  // Update/Edit/Manage
  if (
    s === 'update' ||
    s === 'edit' ||
    s.includes('update') ||
    s.includes('edit') ||
    s === 'assign' ||
    s === 'verify' ||
    s === 'manage' ||
    s === 'invite' ||
    s === 'override'
  ) {
    return 'update';
  }

  // Delete/Hapus
  if (
    s === 'delete' ||
    s.includes('delete')
  ) {
    return 'delete';
  }

  return 'other';
};

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
  const [newProdiId, setNewProdiId] = useState('')
  const [newKencanaScopeType, setNewKencanaScopeType] = useState('faculty')
  const [showPassword, setShowPassword] = useState(false)
  const [ormawas, setOrmawas] = useState([])
  const [roleForm, setRoleForm] = useState(emptyRoleForm)
  const [selectedRoleKey, setSelectedRoleKey] = useState('super_admin')
  const [permissionDraft, setPermissionDraft] = useState([])
  const [form, setForm] = useState({
    Email: '',
    Password: '',
    Role: '',
    Nama: '',
    FakultasID: '',
    ProgramStudiID: '',
    OrmawaAssign: '',
    OrmawaID: '',
    KencanaScopeType: 'faculty',
    Phone: ''
  })

  const [newRoleForm, setNewRoleForm] = useState({ id: '', name: '', theme: 'indigo', desc: '', isEdit: false, key: '' })

  const roleDetails = useMemo(() => {
    const details = { ...ROLE_DETAILS_DEFAULT }
    rbacRoles.forEach(role => {
      if (!details[role.key]) {
        details[role.key] = {
          label: role.label || role.key,
          desc: role.description || '',
          cls: THEME_PRESETS[role.theme]?.cls || 'bg-slate-50/70 text-slate-600 border border-slate-200/60 shadow-none font-bold'
        }
      }
    })
    return details
  }, [rbacRoles])

  const ROLE_DETAILS = roleDetails

  // Safely parse permissions: handles both array and JSON-encoded string from GORM datatypes.JSON
  const parsePermissions = (raw) => {
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string') {
      try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] }
    }
    return []
  }

  const roleOptions = useMemo(() => {
    const fromApi = rbacRoles.map(role => ({
      value: role.key,
      label: role.label || ROLE_DETAILS[role.key]?.label || role.key,
      description: role.description || ROLE_DETAILS[role.key]?.desc || '',
      permissions: parsePermissions(role.permissions),
      status: role.status || 'active',
      isSystem: Boolean(role.is_system)
    }))
    const seen = new Set(fromApi.map(role => role.value))
    const fallback = ROLES.filter(role => !seen.has(role)).map(role => ({
      value: role,
      label: ROLE_DETAILS[role]?.label || role,
      description: ROLE_DETAILS[role]?.desc || '',
      permissions: [],
      status: 'active',
      isSystem: true
    }))
    return [...fromApi, ...fallback]
  }, [rbacRoles, ROLE_DETAILS])

  const selectedRBACRole = useMemo(
    () => roleOptions.find(role => role.value === selectedRoleKey) || roleOptions[0] || null,
    [roleOptions, selectedRoleKey]
  )
  const permissionSet = useMemo(() => new Set(permissionDraft), [permissionDraft])

  const [matrixDraft, setMatrixDraft] = useState({})
  const [expandedModules, setExpandedModules] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdownKey, setOpenDropdownKey] = useState(null)

  useEffect(() => {
    if (roleOptions.length > 0) {
      const draft = {}
      roleOptions.forEach(role => {
        draft[role.value] = role.permissions || []
      })
      setMatrixDraft(draft)
    }
  }, [roleOptions])

  useEffect(() => {
    if (selectedRoleKey && permissionCatalog.length > 0) {
      const currentRole = roleOptions.find(r => r.value === selectedRoleKey);
      const activePermissions = currentRole ? (currentRole.permissions || []) : [];
      const isSuperAdmin = currentRole?.permissions?.includes('*');
      const initial = {};
      let anyActive = false;

      permissionCatalog.forEach(group => {
        const hasActive = (group.items || []).some(p => activePermissions.includes(p));
        if (hasActive) anyActive = true;
        initial[group.module] = hasActive || isSuperAdmin;
      });

      if (!anyActive && !isSuperAdmin && permissionCatalog[0]) {
        initial[permissionCatalog[0].module] = true;
      }
      setExpandedModules(initial);
    }
  }, [selectedRoleKey, roleOptions, permissionCatalog])

  const toggleMatrixPermission = (roleKey, permission) => {
    const roleObj = roleOptions.find(r => r.value === roleKey)
    if (roleObj?.permissions?.includes('*')) return

    setMatrixDraft(prev => {
      const current = prev[roleKey] || []
      const updated = current.includes(permission)
        ? current.filter(p => p !== permission)
        : [...current, permission]
      return { ...prev, [roleKey]: updated }
    })
  }

  const toggleModulePermissions = (roleKey, moduleItems) => {
    const roleObj = roleOptions.find(r => r.value === roleKey)
    if (roleObj?.permissions?.includes('*')) return

    setMatrixDraft(prev => {
      const current = prev[roleKey] || []
      const allEnabled = moduleItems.every(p => current.includes(p))
      let updated
      if (allEnabled) {
        updated = current.filter(p => !moduleItems.includes(p))
      } else {
        const union = new Set([...current, ...moduleItems])
        updated = Array.from(union)
      }
      return { ...prev, [roleKey]: updated }
    })
  }

  const getPermissionLabel = (key) => {
    const labels = {
      // Core Security
      "admin.dashboard.view": "Lihat Dashboard Admin",
      "admin.audit.view": "Lihat Audit Log Keamanan",
      "admin.profile.update": "Ubah Profil Admin",
      "rbac.users.view": "Lihat Pengguna & Role",
      "rbac.users.create": "Tambah Pengguna Baru",
      "rbac.users.update_role": "Ubah Role Pengguna",
      "rbac.users.delete": "Hapus Akun Pengguna",
      "rbac.roles.view": "Lihat Daftar Role",
      "rbac.roles.create": "Buat Role Baru",
      "rbac.roles.update": "Ubah Data/Nama Role",
      "rbac.permissions.assign": "Modifikasi Matriks Izin",

      // Master Data Akademik
      "faculty.view": "Lihat Data Fakultas",
      "faculty.create": "Tambah Fakultas Baru",
      "faculty.update": "Ubah Data Fakultas",
      "faculty.delete": "Hapus Fakultas",
      "program_studi.view": "Lihat Program Studi",
      "program_studi.create": "Tambah Program Studi",
      "program_studi.update": "Ubah Program Studi",
      "program_studi.delete": "Hapus Program Studi",
      "students.view": "Lihat Data Mahasiswa",
      "students.create": "Tambah Mahasiswa Baru",
      "students.update": "Ubah Data Mahasiswa",
      "students.delete": "Hapus Data Mahasiswa",

      // Ormawa
      "ormawa.view": "Lihat Daftar Ormawa",
      "ormawa.create": "Tambah Ormawa Baru",
      "ormawa.update": "Ubah Informasi Ormawa",
      "ormawa.delete": "Hapus Ormawa",
      "ormawa.members.manage": "Kelola Anggota Ormawa",
      "ormawa.events.manage": "Kelola Kegiatan & Acara",
      "ormawa.finance.manage": "Kelola Anggaran/Keuangan",
      "ormawa.proposals.manage": "Kelola & Review Proposal",
      "ormawa.lpj.manage": "Kelola Laporan LPJ",
      "ormawa.announcements.manage": "Kelola Pengumuman",
      "ormawa.aspirations.manage": "Kelola Aspirasi & Keluhan",

      // Layanan Mahasiswa
      "student.dashboard.view": "Lihat Dashboard Mahasiswa",
      "student.profile.update": "Ubah Profil Mandiri",
      "achievement.view": "Lihat Prestasi Mahasiswa",
      "achievement.verify": "Verifikasi Bukti Prestasi",
      "scholarship.view": "Lihat Informasi Beasiswa",
      "scholarship.manage": "Kelola Pendaftaran Beasiswa",
      "aspiration.view": "Lihat Pengaduan Aspirasi",
      "aspiration.update_status": "Ubah Status Laporan/Aspirasi",
      "letters.manage": "Kelola Surat Keterangan",
      "health.view": "Lihat Rekam Kesehatan Mahasiswa",

      // Konseling Psikolog
      "psychologist.view": "Lihat Profil Psikolog",
      "psychologist.manage": "Kelola Data Jadwal Psikolog",
      "psychologist.bookings.view": "Lihat Reservasi Konseling",
      "psychologist.bookings.update": "Konfirmasi Jadwal Konseling",
      "psychologist.medical_records.view": "Lihat Rekam Medis Klinis",
      "psychologist.referrals.manage": "Kelola Surat Rujukan",
      "psychologist.schedules.manage": "Kelola Jam Operasional",
      "psychologist.reports.manage": "Kelola Laporan Bulanan",

      // Kencana Mahasiswa
      "kencana.student.dashboard": "Lihat Dashboard Kencana",
      "kencana.student.timeline": "Lihat Timeline Kencana",
      "kencana.student.session": "Akses Sesi Kencana",
      "kencana.student.quiz": "Kerjakan Kuis Kencana",
      "kencana.student.assignment": "Kerjakan Tugas Kencana",
      "kencana.student.handbook": "Akses Buku Panduan",
      "kencana.student.attendance": "Isi Kehadiran Kencana",
      "kencana.student.score": "Lihat Nilai Kencana",
      "kencana.student.remedial": "Ikuti Remedial Kencana",
      "kencana.student.certificate": "Unduh Sertifikat Kencana",
      "kencana.student.mentor_invitations": "Lihat Undangan Mentor",

      // Kencana Admin Universitas
      "kencana.period.view": "Lihat Periode Kencana",
      "kencana.period.create": "Buat Periode Baru",
      "kencana.period.update": "Ubah Periode Kencana",
      "kencana.stage.view": "Lihat Tahapan Kencana",
      "kencana.stage.create": "Buat Tahapan Baru",
      "kencana.stage.update": "Ubah Tahapan Kencana",
      "kencana.session.view": "Lihat Sesi Kencana",
      "kencana.session.create": "Buat Sesi Baru",
      "kencana.session.update": "Ubah Sesi Kencana",
      "kencana.material.create": "Upload Materi Sesi",
      "kencana.quiz.create": "Buat Kuis Kencana",
      "kencana.quiz.update": "Ubah Kuis Kencana",
      "kencana.question.create": "Buat Soal Kuis",
      "kencana.question.update": "Ubah Soal Kuis",
      "kencana.assignment.create": "Buat Tugas Sesi",
      "kencana.participants.view": "Lihat Peserta Kencana",
      "kencana.scores.view": "Lihat Rekap Nilai Kencana",
      "kencana.remedial.create": "Buat Remedial Kencana",
      "kencana.certificate.generate": "Rilis Sertifikat Kelulusan",
      "kencana.mentor.university.manage": "Kelola Mentor Universitas",
      "kencana.mentor.assignment.override": "Override Pembagian Mentor",

      // Kencana Admin Fakultas
      "kencana.faculty.dashboard": "Lihat Dashboard Kencana Fakultas",
      "kencana.faculty.participants.view": "Lihat Peserta Fakultas",
      "kencana.faculty.scores.view": "Lihat Nilai Peserta Fakultas",
      "kencana.faculty.stages.view": "Lihat Tahapan Kencana Fakultas",
      "kencana.faculty.mentor.manage": "Kelola Mentor Fakultas",
      "kencana.faculty.attendance.review": "Review Presensi Fakultas",
      "kencana.faculty.handbook.review": "Review Jurnal Bimbingan",

      // Dewan Pembimbing Kencana
      "kencana.mentor.dashboard": "Lihat Dashboard Mentor",
      "kencana.mentor.available_students": "Lihat Mahasiswa Bimbingan Tersedia",
      "kencana.mentor.invite": "Kirim Undangan Bimbingan",
      "kencana.mentor.students.view": "Lihat Daftar Bimbingan Aktif",
      "kencana.mentor.student_progress": "Pantau Progress Bimbingan",
      "kencana.mentor.student_score": "Input Nilai Karakter/Afektif",
      "kencana.mentor.student_attendance": "Input Presensi Bimbingan",
      "kencana.mentor.student_handbook": "Review Jurnal Bimbingan Mahasiswa",
      "kencana.mentor.notes.create": "Buat Catatan Konsultasi",
      "kencana.mentor.score_items.create": "Buat Item Penilaian",
      "kencana.mentor.profile.update": "Ubah Profil Mentor"
    };

    if (labels[key]) return labels[key];
    return key.split('.').map(part => {
      let s = part.replace(/_/g, ' ');
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).reverse().join(' ');
  };

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return permissionCatalog;
    const query = searchQuery.toLowerCase();
    return permissionCatalog.map(group => {
      const matchingItems = (group.items || []).filter(permission => {
        const rawKey = permission.toLowerCase();
        const humanLabel = getPermissionLabel(permission).toLowerCase();
        return rawKey.includes(query) || humanLabel.includes(query);
      });
      return {
        ...group,
        items: matchingItems
      };
    }).filter(group => group.items.length > 0);
  }, [permissionCatalog, searchQuery]);

  const toggleModuleAccordion = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  const currentRoleOrig = useMemo(() => {
    return roleOptions.find(r => r.value === selectedRoleKey);
  }, [roleOptions, selectedRoleKey]);

  const currentRoleDraft = useMemo(() => {
    return matrixDraft[selectedRoleKey] || [];
  }, [matrixDraft, selectedRoleKey]);

  const hasChangesForRole = useMemo(() => {
    if (!currentRoleOrig) return false;
    const origVal = currentRoleOrig.permissions || [];
    return JSON.stringify([...currentRoleDraft].sort()) !== JSON.stringify([...origVal].sort());
  }, [currentRoleDraft, currentRoleOrig]);

  const handleSaveSelectedRolePermissions = async () => {
    const role = rbacRoles.find(item => item.key === selectedRoleKey)
    if (!role) { toast.error('Role belum tersinkron dari server'); return }
    setIsSubmitting(true)
    try {
      const res = await adminService.updateRBACRole(role.id || role.ID, {
        label: role.label,
        description: role.description,
        permissions: currentRoleDraft,
        status: role.status || 'active'
      })
      if (res.status === 'success') {
        toast.success(`Permission role ${role.label} berhasil disimpan`)
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

  const formRoles = useMemo(() => {
    return form.Role ? form.Role.split(',').map(r => r.trim()).filter(Boolean) : [];
  }, [form.Role]);

  const showFakultasSelect = useMemo(() => {
    return formRoles.some(r =>
      ['faculty_admin', 'prodi_admin', 'mahasiswa', 'ormawa_admin', 'ormawa', 'kencana_fakultas'].includes(r) ||
      (r === 'kencana_mentor' && form.KencanaScopeType === 'faculty')
    );
  }, [formRoles, form.KencanaScopeType]);

  const showProdiSelect = useMemo(() => {
    return formRoles.some(r => ['mahasiswa', 'ormawa_admin', 'ormawa', 'prodi_admin'].includes(r));
  }, [formRoles]);

  const showOrmawaSelect = useMemo(() => {
    return formRoles.some(r => ['ormawa_admin', 'ormawa'].includes(r));
  }, [formRoles]);

  const showKencanaScopeSelect = useMemo(() => {
    return formRoles.includes('kencana_mentor');
  }, [formRoles]);

  const newRoles = useMemo(() => {
    return newRole ? newRole.split(',').map(r => r.trim()).filter(Boolean) : [];
  }, [newRole]);

  const showNewFakultasSelect = useMemo(() => {
    return newRoles.some(r =>
      ['faculty_admin', 'prodi_admin', 'mahasiswa', 'ormawa_admin', 'ormawa', 'kencana_fakultas'].includes(r) ||
      (r === 'kencana_mentor' && newKencanaScopeType === 'faculty')
    );
  }, [newRoles, newKencanaScopeType]);

  const showNewProdiSelect = useMemo(() => {
    return newRoles.some(r => ['mahasiswa', 'ormawa_admin', 'ormawa', 'prodi_admin'].includes(r));
  }, [newRoles]);

  const showNewOrmawaSelect = useMemo(() => {
    return newRoles.some(r => ['ormawa_admin', 'ormawa'].includes(r));
  }, [newRoles]);

  const showNewKencanaScopeSelect = useMemo(() => {
    return newRoles.includes('kencana_mentor');
  }, [newRoles]);

  const handleEmailChange = (emailVal) => {
    setForm(prev => {
      let updatedPassword = prev.Password;
      const currentRoles = prev.Role ? prev.Role.split(',').map(r => r.trim()).filter(Boolean) : [];
      if (currentRoles.includes('mahasiswa') && (!prev.Password || prev.Password.startsWith('pass'))) {
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

  const isRoleConflicting = (currentRoles, roleToCheck) => {
    if (currentRoles.includes(roleToCheck)) return false; // Allowed to deselect itself

    const invalidCombinations = [
      ["super_admin", "mahasiswa"],
      ["super_admin", "dosen"],
      ["super_admin", "psikolog"],
      ["super_admin", "tenaga_kesehatan"],
      ["mahasiswa", "dosen"],
      ["mahasiswa", "psikolog"],
      ["mahasiswa", "tenaga_kesehatan"],
      ["mahasiswa", "faculty_admin"],
      ["mahasiswa", "prodi_admin"],
      ["mahasiswa", "kencana_admin"],
      ["mahasiswa", "kencana_fakultas"],
      ["dosen", "psikolog"],
      ["dosen", "tenaga_kesehatan"],
      ["faculty_admin", "ormawa_admin"],
      ["faculty_admin", "ormawa"],
    ];

    for (const combo of invalidCombinations) {
      const [roleA, roleB] = combo;
      if (
        (currentRoles.includes(roleA) && roleToCheck === roleB) ||
        (currentRoles.includes(roleB) && roleToCheck === roleA)
      ) {
        return true;
      }
    }
    return false;
  };

  const handleToggleRole = (roleToToggle) => {
    setForm(prev => {
      const currentRoles = prev.Role ? prev.Role.split(',').map(r => r.trim()).filter(Boolean) : [];

      if (!currentRoles.includes(roleToToggle) && isRoleConflicting(currentRoles, roleToToggle)) {
        toast.error('Kombinasi role tidak valid (hirarki dilanggar)');
        return prev;
      }
      let nextRoles;
      if (currentRoles.includes(roleToToggle)) {
        nextRoles = currentRoles.filter(r => r !== roleToToggle);
      } else {
        nextRoles = [...currentRoles, roleToToggle];
      }
      const roleVal = nextRoles.join(',');

      let updatedPassword = prev.Password;
      if (nextRoles.includes('mahasiswa') && (!prev.Password || prev.Password.startsWith('pass'))) {
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

  const handleToggleNewRole = (roleToToggle) => {
    const currentRoles = newRole ? newRole.split(',').map(r => r.trim()).filter(Boolean) : [];

    if (!currentRoles.includes(roleToToggle) && isRoleConflicting(currentRoles, roleToToggle)) {
      toast.error('Kombinasi role tidak valid (hirarki dilanggar)');
      return;
    }

    let nextRoles;
    if (currentRoles.includes(roleToToggle)) {
      nextRoles = currentRoles.filter(r => r !== roleToToggle);
    } else {
      nextRoles = [...currentRoles, roleToToggle];
    }
    setNewRole(nextRoles.join(','));
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
        const roles = rolePayload.roles || []
        setRbacRoles(roles)
        setPermissionCatalog(rolePayload.catalog || [])
        // Prefer first non-super_admin editable role so Permission Matrix is immediately usable
        const editableRole = roles.find(r => r.key !== 'super_admin')
        const firstEditableKey = editableRole?.key || roles[0]?.key
        if (firstEditableKey) setSelectedRoleKey(firstEditableKey)
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

  const handleCreateCustomRole = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = {
        label: String(newRoleForm.name || '').trim(),
        description: String(newRoleForm.desc || '').trim(),
        theme: newRoleForm.theme,
      }

      let res;
      if (newRoleForm.isEdit) {
        payload.key = newRoleForm.key;
        res = await adminService.updateRBACRole(newRoleForm.id, payload);
      } else {
        payload.key = String(newRoleForm.name || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        payload.permissions = [];
        res = await adminService.createRBACRole(payload);
      }

      if (res.status === 'success') {
        toast.success(newRoleForm.isEdit ? 'Custom role berhasil diperbarui' : 'Custom role berhasil dibuat')
        setIsNewRoleOpen(false)
        setNewRoleForm({ id: '', name: '', theme: 'indigo', desc: '', isEdit: false, key: '' })
        fetchData()
      } else {
        toast.error(res.message || 'Gagal menyimpan custom role')
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal menyimpan custom role')
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

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Hapus role "${role.label}"? Pastikan tidak ada user yang menggunakan role ini.`)) return
    try {
      const res = await adminService.deleteRBACRole(role.id || role.ID)
      if (res?.status === 'success') {
        toast.success('Role berhasil dihapus')
        if (selectedRoleKey === role.value) setSelectedRoleKey('faculty_admin')
        fetchData()
      } else {
        toast.error(res?.message || 'Gagal menghapus role')
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal menghapus role')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!String(form.Role || '').trim()) {
      toast.error('Level otorisasi wajib dipilih setidaknya satu')
      return
    }
    setIsSubmitting(true)
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
        action: 'add',
        ormawaId: Number(newOrmawaId) || 0,
        ormawaAssign: String(newOrmawaAssign || '').trim(),
        fakultasId: Number(newFakultasId) || 0,
        prodiId: Number(newProdiId) || 0,
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
        const roleLower = (row.role || row.Role || '').toLowerCase()
        const roles = roleLower.split(',').map(r => r.trim()).filter(Boolean)

        let contexts = []
        let subContexts = []

        if (roles.includes('super_admin')) {
          contexts.push('Universitas (Global)')
        }
        if (roles.includes('faculty_admin')) {
          contexts.push(v || 'Cluster Unassigned')
        }
        if (roles.includes('ormawa_admin')) {
          contexts.push(row.ormawa_assign || row.ormawa_nama || 'Org Unassigned')
          if (v) subContexts.push(`Managed at ${v}`)
        }
        if (roles.includes('mahasiswa')) {
          contexts.push(row.prodi_nama || '-')
          if (v) subContexts.push(v)
        }
        if (roles.includes('psikolog')) {
          contexts.push('Psychological Wing')
          subContexts.push('BKU Clinical Unit')
        }
        if (roles.includes('kencana_admin')) {
          contexts.push('Kencana University')
          subContexts.push('Global LMS Operations')
        }
        if (roles.includes('kencana_fakultas')) {
          contexts.push(v || 'Kencana Fakultas')
          subContexts.push('Scoped faculty operations')
        }
        if (roles.includes('kencana_mentor')) {
          contexts.push(row.kencana_scope_type === 'university' ? 'Mentor Universitas' : (v || 'Mentor Fakultas'))
          subContexts.push(row.kencana_scope_type === 'university' ? 'All faculties' : 'Faculty scoped')
        }

        const uniqueContexts = [...new Set(contexts)]
        const contextText = uniqueContexts.length > 0 ? uniqueContexts.join(', ') : '-'
        const uniqueSubContexts = [...new Set(subContexts)]
        const subContextText = uniqueSubContexts.length > 0 ? uniqueSubContexts.join(' | ') : ''

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-bold text-neutral-800 font-jakarta leading-tight tracking-tight">{contextText}</span>
            {subContextText && <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mt-1">{subContextText}</span>}
          </div>
        )
      }
    },
    {
      key: 'role', label: 'Authorization', className: 'w-[160px]',
      render: (v, row) => {
        const rStr = v || row.role || row.Role || ''
        const roles = rStr.split(',').map(r => r.trim()).filter(Boolean)
        return (
          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
            {roles.map(r => {
              const roleOption = roleOptions.find(role => role.value === r)
              const cfg = ROLE_DETAILS[r] || { label: roleOption?.label || r, cls: 'bg-neutral-100 text-neutral-500 shadow-none' }
              return (
                <Badge key={r} className={cn('font-bold text-[8px] px-2 py-0.5 border-none shadow-sm uppercase tracking-[0.05em] rounded-lg', cfg.cls)}>
                  {cfg.label}
                </Badge>
              )
            })}
          </div>
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
    <PageContent>
      <Toaster position="top-right" />

      {/* ── Page Header ─────────────────────────── */}
      <DashboardHero
        title="Identity"
        highlightedTitle="Governance"
        subtitle="Kendali akses terpusat berbasis RBAC untuk seluruh entitas sistem. Kelola hak istimewa, kaitan identitas, dan otorisasi infrastruktur."
        icon="shield_person"
        badges={[
          { label: 'Security & OIDC Cluster', active: true }
        ]}
        actions={
          <>
            <div className="hidden lg:flex items-center gap-8 pr-8 border-r border-slate-200/40">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">Total Identity</p>
                <p className="text-xl font-black text-primary font-headline tabular-nums leading-none">{users.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 font-headline">Privileged Nodes</p>
                <p className="text-xl font-black text-rose-600 font-headline tabular-nums leading-none">{users.filter(u => u.role?.includes('admin') || u.Role?.includes('admin')).length}</p>
              </div>
            </div>

            <Button
              onClick={() => setActiveTab('permissions')}
              variant="outline"
              className="h-11 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 hover:text-primary gap-2.5 transition-all active:scale-95 shadow-none cursor-pointer font-headline"
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }} >security</span>
              Permission Matrix
            </Button>
            <Button
              onClick={() => { setNewRoleForm({ id: '', name: '', theme: 'indigo', desc: '', isEdit: false, key: '' }); setIsNewRoleOpen(true) }}
              className="h-11 px-6 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-primary gap-2 transition-all active:scale-95 shadow-sm border-none cursor-pointer"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >add</span>
              Create Role
            </Button>
          </>
        }
      />

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
      {activeTab === 'identities' && <PageCard>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            searchPlaceholder="Search by identity handle, email, or authorization level..."
            onAdd={() => { setForm({ Email: '', Password: '', Role: '', Nama: '', FakultasID: '', ProgramStudiID: '', OrmawaAssign: '', OrmawaID: '', KencanaScopeType: 'faculty', Phone: '' }); setIsCrudOpen(true) }}
            addLabel="New Identity"
            filters={[{ key: 'role', placeholder: 'Pilih Level', options: roleOptions.map(r => ({ label: r.label, value: r.value })) }]}
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
                    setNewProdiId(row.program_studi_id || row.ProgramStudiID || '');
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
      </PageCard>}

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
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rbacRole = rbacRoles.find(r => r.key === role.value);
                          if (rbacRole) {
                            setNewRoleForm({ id: rbacRole.id || rbacRole.ID, name: role.label, desc: role.description || '', theme: role.theme || 'indigo', isEdit: true, key: role.value });
                            setIsNewRoleOpen(true);
                          }
                        }}
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-lg text-neutral-300 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                        title="Edit role ini"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                      </Button>
                      {!role.isSystem && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rbacRole = rbacRoles.find(r => r.key === role.value)
                            if (rbacRole) handleDeleteRole({ ...role, id: rbacRole.id || rbacRole.ID })
                          }}
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg text-neutral-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Hapus role ini"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>delete</span>
                        </Button>
                      )}
                      {role.isSystem && (
                        <span className="material-symbols-outlined text-neutral-300 mr-1" style={{ fontSize: '15px' }} title="Role sistem tidak dapat dihapus">lock</span>
                      )}
                      <Button onClick={() => { setSelectedRoleKey(role.value); setActiveTab('permissions') }} variant="ghost" className="h-9 px-4 rounded-lg text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 cursor-pointer">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}

      {activeTab === 'permissions' && (
        <section className="space-y-6 pb-24">
          {/* Top Selector: Role List */}
          <div className="space-y-3 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline pl-1 mb-1">Pilih Role</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {roleOptions.map(role => {
                const isSelected = selectedRoleKey === role.value;
                const isLocked = role.permissions?.includes('*');
                const count = (matrixDraft[role.value] || []).length;
                const cfg = ROLE_DETAILS[role.value] || { cls: 'bg-neutral-100 text-neutral-600' };

                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRoleKey(role.value)}
                    className={cn(
                      "p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all duration-150 active:scale-[0.98] cursor-pointer text-left min-h-[76px]",
                      isSelected
                        ? "bg-neutral-900 border-neutral-900 text-white shadow-xl shadow-neutral-900/10"
                        : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="min-w-0 w-full flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold tracking-tight truncate block">{role.label}</span>
                        {isLocked && <span className="material-symbols-outlined text-[10px] shrink-0" style={{ fontSize: '11px' }}>lock</span>}
                      </div>
                      <Badge className={cn(
                        'font-bold text-[8px] px-1.5 py-0.5 border-none uppercase tracking-widest rounded-md shrink-0',
                        isSelected ? "bg-white/10 text-white" : cfg.cls
                      )}>
                        {isLocked ? "Full" : `${count} Izin`}
                      </Badge>
                    </div>
                    <span className="text-[9px] font-mono lowercase tracking-wide block truncate opacity-60 w-full">
                      {role.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Permissions accordion */}
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
                      Mengatur izin untuk role <span className="text-slate-800 font-bold">{selectedRBACRole?.label}</span>: {selectedRBACRole?.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>search</span>
                <Input
                  type="text"
                  placeholder="Cari izin akses (contoh: 'materi', 'create', 'dosen')..."
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
              {filteredCatalog.map(group => {
                const isExpanded = !!expandedModules[group.module];
                const moduleItems = group.items || [];
                const rolePermissions = matrixDraft[selectedRoleKey] || [];
                const allChecked = moduleItems.every(p => rolePermissions.includes(p));
                const someChecked = moduleItems.some(p => rolePermissions.includes(p)) && !allChecked;
                const activeCount = moduleItems.filter(p => rolePermissions.includes(p)).length;
                const isLocked = selectedRBACRole?.permissions?.includes('*');

                return (
                  <Card key={group.module} className="border-slate-200/80 shadow-sm rounded-xl bg-white overflow-visible">
                    {/* Accordion Header */}
                    <div
                      onClick={() => toggleModuleAccordion(group.module)}
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
                          <h3 className="font-bold text-xs text-slate-800 font-jakarta tracking-tight">{group.module}</h3>
                          <p className={cn(
                            "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                            activeCount > 0 ? "text-bku-primary" : "text-slate-400"
                          )}>
                            {isLocked ? "Semua Akses Aktif" : `${activeCount} dari ${moduleItems.length} Izin Diaktifkan`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => toggleModulePermissions(selectedRoleKey, moduleItems)}
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
                        )}
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <CardContent className="p-0 border-t border-slate-100 bg-white overflow-visible">
                        {moduleItems.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 py-6">Tidak ada izin akses yang cocok dengan pencarian.</p>
                        ) : (
                          <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
                            <table className="w-full min-w-[800px] text-left border-collapse table-fixed">
                              <thead>
                                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500 font-headline select-none">
                                  <th className="py-3 px-5 w-[30%]">Nama Fitur</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Lihat (Read)</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Tambah (Create)</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Ubah (Update)</th>
                                  <th className="py-3 px-4 w-[14%] text-left">Hapus (Delete)</th>
                                  <th className="py-3 px-5 w-[14%] text-center">Aksi Baris</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {(() => {
                                  const renderCell = (permsList) => {
                                    if (permsList.length === 0) return <span className="text-slate-300 font-bold text-xs select-none pl-1.5">-</span>;
                                    return (
                                      <div className="flex flex-col items-start justify-center gap-1.5">
                                        {permsList.map(p => {
                                          const isPermChecked = isLocked || rolePermissions.includes(p.key);
                                          const showLabel = permsList.length > 1 || !['view', 'create', 'update', 'delete'].includes(p.suffix.toLowerCase());
                                          let displayLabel = p.suffix.replace(/_/g, ' ');
                                          displayLabel = displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1);
                                          return (
                                            <label
                                              key={p.key}
                                              className={cn(
                                                "flex items-center gap-1.5 p-1 px-1.5 -ml-1.5 rounded-lg border border-transparent transition-all select-none w-max max-w-full",
                                                isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-slate-100 hover:border-slate-200",
                                                isPermChecked && !isLocked ? "bg-bku-primary/[0.04] border-bku-primary/5" : ""
                                              )}
                                              title={p.key}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isPermChecked}
                                                disabled={isLocked}
                                                onChange={() => toggleMatrixPermission(selectedRoleKey, p.key)}
                                                className="rounded text-bku-primary focus:ring-bku-primary/30 border-slate-300 size-4 cursor-pointer disabled:cursor-not-allowed shrink-0"
                                              />
                                              {showLabel && (
                                                <span className={cn(
                                                  "text-[8px] font-bold tracking-tight select-none truncate",
                                                  isPermChecked ? "text-slate-800" : "text-slate-400"
                                                )}>
                                                  {displayLabel}
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
                                    const activeFeaturePerms = featurePermissions.filter(p => isLocked || rolePermissions.includes(p.key));
                                    const isAllChecked = featurePermissions.every(p => isLocked || rolePermissions.includes(p.key));
                                    const isSomeChecked = featurePermissions.some(p => isLocked || rolePermissions.includes(p.key));

                                    const views = [];
                                    const creates = [];
                                    const updates = [];
                                    const deletes = [];
                                    const others = [];

                                    featurePermissions.forEach(p => {
                                      const cat = classifyPermission(p);
                                      if (cat === 'view') views.push(p);
                                      else if (cat === 'create') creates.push(p);
                                      else if (cat === 'update') updates.push(p);
                                      else if (cat === 'delete') deletes.push(p);
                                      else others.push(p);
                                    });

                                    return (
                                      <tr
                                        key={feature.prefix}
                                        className={cn(
                                          "transition-colors hover:bg-white",
                                          isSomeChecked ? "bg-bku-primary/[0.01]" : ""
                                        )}
                                      >
                                        {/* Feature Name */}
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

                                        {/* View column */}
                                        <td className="py-3.5 px-4 text-left align-middle">
                                          {renderCell(views)}
                                        </td>

                                        {/* Create column */}
                                        <td className="py-3.5 px-4 text-left align-middle">
                                          {renderCell(creates)}
                                        </td>

                                        {/* Update column */}
                                        <td className="py-3.5 px-4 text-left align-middle">
                                          {renderCell(updates)}
                                        </td>

                                        {/* Delete column */}
                                        <td className="py-3.5 px-4 text-left align-middle">
                                          {renderCell(deletes)}
                                        </td>

                                        {/* Row Action */}
                                        <td className="py-3.5 px-5 align-middle text-center">
                                          {!isLocked ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const keys = featurePermissions.map(p => p.key);
                                                const allEnabled = keys.every(k => rolePermissions.includes(k));
                                                setMatrixDraft(prev => {
                                                  const current = prev[selectedRoleKey] || [];
                                                  let updated;
                                                  if (allEnabled) {
                                                    updated = current.filter(k => !keys.includes(k));
                                                  } else {
                                                    updated = Array.from(new Set([...current, ...keys]));
                                                  }
                                                  return { ...prev, [selectedRoleKey]: updated };
                                                });
                                              }}
                                              className={cn(
                                                "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border transition-all active:scale-95 cursor-pointer hover:bg-slate-100",
                                                isAllChecked
                                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                  : isSomeChecked
                                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                                    : "bg-slate-50 text-slate-400 border-slate-200"
                                              )}
                                              title={isAllChecked ? "Klik untuk hapus semua izin" : "Klik untuk aktifkan semua izin"}
                                            >
                                              {isAllChecked ? "Semua Aktif" : isSomeChecked ? `${activeFeaturePerms.length} Aktif` : "Nonaktif"}
                                            </button>
                                          ) : (
                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest inline-block select-none">
                                              Akses Penuh
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sticky Float Save Bar */}
          {hasChangesForRole && (
            <div className="fixed bottom-6 w-[90vw] md:w-auto left-1/2 transform -translate-x-1/2 z-50 bg-white border border-slate-200/80 shadow-2xl rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md bg-white/95">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Perubahan Terdeteksi</span>
                <span className="text-xs font-bold text-slate-800">
                  Konfigurasi role <span className="text-bku-primary font-black">{selectedRBACRole?.label}</span> berubah.
                </span>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  onClick={() => {
                    setMatrixDraft(prev => ({
                      ...prev,
                      [selectedRoleKey]: currentRoleOrig ? (currentRoleOrig.permissions || []) : []
                    }));
                    toast.success('Perubahan dibatalkan');
                  }}
                  variant="outline"
                  className="h-10 px-4 rounded-xl border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer shadow-none"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveSelectedRolePermissions}
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-primary border-none shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : (newRoleForm.isEdit ? 'Update Role' : 'Create Role')}
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>
                </Button>
              </div>
            </div>
          )}
        </section>
      )}
      {/* ── Create User Modal ───────────────────────────────────── */}
      <Dialog open={isCrudOpen} onOpenChange={setIsCrudOpen} maxWidth="max-w-xl">
        <DialogContent>
          <DialogHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-bku-primary pointer-events-none"><span className="material-symbols-outlined" style={{ fontSize: '100px' }} >manage_accounts</span></div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined font-black text-[12px]">add</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bku-primary/70 font-headline">Account Provisioning</span>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-black font-headline tracking-tight text-slate-800">Provision User Account</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400">Registrasi identitas digital dan konfigurasi level otorisasi pengguna baru.</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate}>
            <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar font-inter">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Identity Handle (Email)</Label>
                  <Input required type="email" value={form.Email} onChange={e => handleEmailChange(e.target.value)} placeholder="email@bku.ac.id" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter" />
                  {form.Email && form.Email.includes('@') && (
                    <span className="text-[9px] font-extrabold text-blue-500 block mt-1.5 pl-1 tracking-wide animate-in fade-in duration-200">
                      ⚡ Auto-detect ID Pokok: {form.Email.split('@')[0]}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Default Authentication</Label>
                  <div className="relative">
                    <Input required type={showPassword ? "text" : "password"} value={form.Password} onChange={e => setForm({ ...form, Password: e.target.value })} placeholder="••••••••" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Full Legal Name</Label>
                <Input required value={form.Nama} onChange={e => setForm({ ...form, Nama: e.target.value })} placeholder="Full name for ID mapping..." className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs text-slate-800 transition-all font-inter" />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Authorization Level (Pilih satu atau lebih)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                  {roleOptions.map(r => {
                    const isSelected = form.Role ? form.Role.split(',').map(x => x.trim()).includes(r.value) : false;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleToggleRole(r.value)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer",
                          isSelected
                            ? "border-bku-primary bg-bku-primary/5 shadow-sm text-bku-primary"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600"
                        )}
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider">{r.label}</p>
                          {r.description && <p className="text-[9px] text-slate-400 line-clamp-1">{r.description}</p>}
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0",
                          isSelected ? "bg-bku-primary border-bku-primary" : "border-slate-300"
                        )}>
                          {isSelected && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(showFakultasSelect || showProdiSelect) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  {showFakultasSelect && (
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
                  )}

                  {showProdiSelect && (
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
                  )}
                </div>
              )}

              {formRoles.includes('prodi_admin') && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Custom Prodi Role Name</Label>
                  <Select
                    value={form.OrmawaAssign ? form.OrmawaAssign : undefined}
                    onValueChange={v => setForm({ ...form, OrmawaAssign: v })}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white focus:border-bku-primary focus:ring-2 focus:ring-bku-primary/20 font-bold text-xs uppercase tracking-[0.08em] text-slate-700 transition-all">
                      <SelectValue placeholder="PILIH ROLE PRODI (e.g. Kaprodi)" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-slate-100/80 bg-white/95 backdrop-blur-md">
                      <SelectItem value="Kaprodi" className="text-[10px] font-black uppercase tracking-widest">Kaprodi</SelectItem>
                      <SelectItem value="Sekretaris Prodi" className="text-[10px] font-black uppercase tracking-widest">Sekretaris Prodi</SelectItem>
                      <SelectItem value="Staff Prodi" className="text-[10px] font-black uppercase tracking-widest">Staff Prodi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showKencanaScopeSelect && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Kencana Scope</Label>
                    <Select value={form.KencanaScopeType} onValueChange={v => setForm({ ...form, KencanaScopeType: v, FakultasID: v === 'university' ? '' : form.FakultasID })}>
                      <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white font-bold text-xs uppercase tracking-[0.1em]"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                        <SelectItem value="faculty" className="text-[10px] font-bold uppercase tracking-widest">Fakultas</SelectItem>
                        <SelectItem value="university" className="text-[10px] font-bold uppercase tracking-widest">Universitas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Phone</Label>
                    <Input value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} placeholder="Nomor kontak mentor" className="h-12 rounded-xl border-neutral-200 bg-white focus:bg-white font-bold text-sm font-jakarta" />
                  </div>
                </div>
              )}

              {showOrmawaSelect && (
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

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsCrudOpen(false)}
                className="flex-1 h-12 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-headline cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 bg-neutral-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 font-headline disabled:opacity-50 cursor-pointer border-none"
              >
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }} >save</span>}
                <span>Commit New Account</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Update Role Modal ────────────────────────────────────── */}
      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen} maxWidth="max-w-md">
        <DialogContent>
          <DialogHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-bku-primary pointer-events-none">
              <span className="material-symbols-outlined font-black" style={{ fontSize: '100px' }}>key</span>
            </div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  <span className="material-symbols-outlined font-black text-[12px]">security</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bku-primary/70 font-headline">Privilege Node</span>
              </div>
              <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-slate-800 uppercase leading-none">Modify Otoritas</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400 mt-1.5">Override account privilege nodes.</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar font-inter">
            <div className="space-y-6 px-1">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/50 flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] font-headline">Target Identity</p>
                  <p className="text-xs font-bold font-inter text-slate-700 truncate max-w-[200px] lowercase">{selected?.Email || selected?.email}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end max-w-[180px]">
                  {(selected?.role || selected?.Role || '').split(',').map(r => r.trim()).filter(Boolean).map(r => {
                    const roleOption = roleOptions.find(role => role.value === r)
                    const cfg = roleDetails[r] || { label: roleOption?.label || r, cls: 'bg-neutral-100 text-slate-500 border border-slate-200/60' }
                    return (
                      <Badge key={r} className={cn("font-bold text-[8px] px-2.5 py-1 border-none shadow-sm uppercase rounded-lg group-hover:scale-105 transition-transform", cfg.cls)}>
                        {cfg.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-headline">Target Authorization Level (Pilih satu atau lebih)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                  {roleOptions.map(r => {
                    const isSelected = newRole ? newRole.split(',').map(x => x.trim()).includes(r.value) : false;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => handleToggleNewRole(r.value)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer",
                          isSelected
                            ? "border-bku-primary bg-bku-primary/5 shadow-sm text-bku-primary"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-600"
                        )}
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-wider">{r.label}</p>
                          {r.description && <p className="text-[9px] text-slate-400 line-clamp-1">{r.description}</p>}
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0",
                          isSelected ? "bg-bku-primary border-bku-primary" : "border-slate-300"
                        )}>
                          {isSelected && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showNewOrmawaSelect && (
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

              {showNewFakultasSelect && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Fakultas Kencana</Label>
                  <Select value={newFakultasId ? String(newFakultasId) : undefined} onValueChange={setNewFakultasId}>
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white font-bold text-[10px] uppercase tracking-widest text-neutral-600">
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

              {showNewProdiSelect && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Program Studi</Label>
                  <Select
                    disabled={!newFakultasId}
                    value={newProdiId ? String(newProdiId) : undefined}
                    onValueChange={setNewProdiId}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white font-bold text-[10px] uppercase tracking-widest text-neutral-600 disabled:opacity-50">
                      <SelectValue placeholder={newFakultasId ? "PILIH PRODI" : "PILIH FAKULTAS DULU"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100 max-h-[200px] overflow-y-auto">
                      {allProdi
                        .filter(p => String(p.FakultasID || p.fakultas_id) === String(newFakultasId))
                        .map(p => (
                          <SelectItem key={p.ID || p.id} value={String(p.ID || p.id)} className="text-[10px] font-bold uppercase tracking-widest">
                            {p.Nama || p.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newRoles.includes('prodi_admin') && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Custom Prodi Role Name</Label>
                  <Select
                    value={newOrmawaAssign ? newOrmawaAssign : undefined}
                    onValueChange={setNewOrmawaAssign}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white font-bold text-[10px] uppercase tracking-widest text-neutral-600">
                      <SelectValue placeholder="PILIH ROLE PRODI" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                      <SelectItem value="Kaprodi" className="text-[10px] font-bold uppercase tracking-widest">Kaprodi</SelectItem>
                      <SelectItem value="Sekretaris Prodi" className="text-[10px] font-bold uppercase tracking-widest">Sekretaris Prodi</SelectItem>
                      <SelectItem value="Staff Prodi" className="text-[10px] font-bold uppercase tracking-widest">Staff Prodi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showNewKencanaScopeSelect && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 font-jakarta">Mentor Scope</Label>
                  <Select value={newKencanaScopeType} onValueChange={v => { setNewKencanaScopeType(v); if (v === 'university') setNewFakultasId('') }}>
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-white font-bold text-[10px] uppercase tracking-widest text-neutral-600"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-neutral-100">
                      <SelectItem value="faculty" className="text-[10px] font-bold uppercase tracking-widest">Fakultas</SelectItem>
                      <SelectItem value="university" className="text-[10px] font-bold uppercase tracking-widest">Universitas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsRoleOpen(false)}
              className="flex-1 h-12 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-headline cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleUpdateRole}
              disabled={isSubmitting}
              className="flex-[2] h-12 bg-neutral-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 font-headline disabled:opacity-50 cursor-pointer border-none"
            >
              {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>security</span>}
              <span>Commit Authority</span>
            </button>
          </DialogFooter>
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
      <Dialog open={isNewRoleOpen} onOpenChange={setIsNewRoleOpen} maxWidth="max-w-md">
        <DialogContent>
          <DialogHeader className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-bku-primary pointer-events-none">
              <span className="material-symbols-outlined font-black" style={{ fontSize: '100px' }}>shield_person</span>
            </div>
            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-6 rounded bg-bku-primary/10 flex items-center justify-center text-bku-primary">
                  {newRoleForm.isEdit ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }} >edit</span> : <span className="material-symbols-outlined" style={{ fontSize: '12px' }} strokeWidth={3}>add</span>}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-bku-primary/70 font-headline">Dynamic Privilege Node</span>
              </div>
              <DialogTitle className="text-xl font-bold font-jakarta tracking-tight text-slate-800 uppercase leading-none">{newRoleForm.isEdit ? 'Update Custom Role' : 'Create Custom Role'}</DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-400 mt-1.5">{newRoleForm.isEdit ? 'Perbarui informasi peran khusus ini' : 'Release dynamic privilege identity node'}</DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateCustomRole}>
            <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto no-scrollbar font-inter">
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
                  {!newRoleForm.isEdit && <span className="text-[9px] font-bold text-slate-400 ml-1">Key unik akan digenerate otomatis.</span>}
                  {newRoleForm.isEdit && <span className="text-[9px] font-bold text-slate-400 ml-1">Key unik peran ({newRoleForm.key}) tidak akan diubah.</span>}
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
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsNewRoleOpen(false)}
                className="flex-1 h-12 bg-white hover:bg-slate-55 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 font-headline cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] h-12 bg-neutral-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2 font-headline disabled:opacity-50 cursor-pointer border-none"
              >
                {isSubmitting ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }} >sync</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>save</span>}
                <span>{newRoleForm.isEdit ? 'Update Role' : 'Save Custom Role'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </PageContent>
  )
}
