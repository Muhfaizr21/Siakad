// PortalConfig.js
// Single source of truth untuk semua konfigurasi portal
// Setiap role mendapat menu, branding, dan branding dari sini

export const PORTAL_CONFIG = {
  // ─── STUDENT PORTAL ───────────────────────────────────────────────
  student: {
    title: 'Student Hub',
    logo: '/images/bku logo.png',
    subtitle: 'Portal Mahasiswa',
    sidebarWidth: 'w-64',
    showRoleBadge: true,
    roleLabel: 'Mahasiswa',
    roleBadgeColor: 'emerald',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/student/dashboard' },
          { name: 'Data Diri', icon: 'person', path: '/student/profile' },
        ]
      },
      {
        group: 'AKADEMIK',
        items: [
          { name: 'KRS & Nilai', icon: 'grade', path: '/student/nilai' },
          { name: 'Jadwal Kuliah', icon: 'calendar_month', path: '/student/jadwal' },
          { name: 'Kehadiran', icon: 'event_available', path: '/student/presensi' },
        ]
      },
      {
        group: 'LAYANAN',
        items: [
          { name: 'Kencana (PKKMB)', icon: 'school', path: '/student/kencana' },
          { name: 'Konseling', icon: 'psychology', path: '/student/counseling' },
          { name: 'Kesehatan', icon: 'favorite', path: '/student/health' },
        ]
      },
      {
        group: 'INFO & AKTIVITAS',
        items: [
          { name: 'Beasiswa', icon: 'school', path: '/student/scholarship' },
          { name: 'Prestasi', icon: 'emoji_events', path: '/student/achievement' },
          { name: 'Organisasi', icon: 'groups', path: '/student/organisasi' },
          { name: 'Aspirasi', icon: 'campaign', path: '/student/voice' },
        ]
      },
      {
        group: 'LAINNYA',
        items: [
          { name: 'Notifikasi', icon: 'notifications', path: '/student/notifikasi' },
        ]
      },
    ],
  },

  // ─── FACULTY ADMIN PORTAL ─────────────────────────────────────────
  faculty: {
    title: 'Faculty Portal',
    logo: '/images/bku logo.png',
    subtitle: 'Admin Fakultas',
    sidebarWidth: 'w-64',
    showRoleBadge: true,
    roleLabel: 'Fakultas',
    roleBadgeColor: 'blue',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/faculty/dashboard' },
        ]
      },
      {
        group: 'DATA MASTER',
        items: [
          { name: 'Mahasiswa', icon: 'school', path: '/faculty/mahasiswa' },
          { name: 'Dosen / Psikolog', icon: 'psychology', path: '/faculty/psikolog' },
          { name: 'Program Studi', icon: 'database', path: '/faculty/prodi' },
          { name: 'Jadwal', icon: 'calendar_month', path: '/faculty/jadwal' },
        ]
      },
      {
        group: 'AKADEMIK',
        items: [
          { name: 'KRS', icon: 'assignment', path: '/faculty/krs' },
          { name: 'Nilai', icon: 'grade', path: '/faculty/nilai' },
          { name: 'Kurikulum', icon: 'menu_book', path: '/faculty/prodi/kurikulum' },
        ]
      },
      {
        group: 'KEGIATAN & KEMAHASISWAAN',
        items: [
          { name: 'PKKMB', icon: 'school', path: '/faculty/pkkmb' },
          { name: 'Ormawa', icon: 'groups', path: '/faculty/organisasi' },
          { name: 'Proposal Ormawa', icon: 'assignment', path: '/faculty/ormawa/proposals' },
          { name: 'Prestasi', icon: 'emoji_events', path: '/faculty/prestasi' },
          { name: 'Beasiswa', icon: 'payments', path: '/faculty/beasiswa' },
          { name: 'Kesehatan', icon: 'favorite', path: '/faculty/kesehatan' },
        ]
      },
      {
        group: 'ADMINISTRASI',
        items: [
          { name: 'Aspirasi', icon: 'chat', path: '/faculty/aspirasi' },
          { name: 'Laporan', icon: 'description', path: '/faculty/laporan' },
          { name: 'Pengaturan', icon: 'settings', path: '/faculty/pengaturan' },
        ]
      },
    ],
  },

  // ─── ORMAWA ADMIN PORTAL ──────────────────────────────────────────
  ormawa: {
    title: 'Ormawa Portal',
    logo: '/images/bku logo.png',
    subtitle: 'Portal Ormawa',
    sidebarWidth: 'w-64',
    showRoleBadge: true,
    roleLabel: 'Ormawa',
    roleBadgeColor: 'violet',
    menu: [
      {
        group: 'MANAJEMEN UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/ormawa' },
          { name: 'Anggota Aktif', icon: 'group', path: '/ormawa/anggota' },
          { name: 'Struktur Pengurus', icon: 'account_tree', path: '/ormawa/struktur' },
        ]
      },
      {
        group: 'OPERASIONAL & KEGIATAN',
        items: [
          { name: 'Proposal & Kegiatan', icon: 'description', path: '/ormawa/proposal' },
          { name: 'Jadwal Kalender', icon: 'calendar_month', path: '/ormawa/jadwal' },
          { name: 'Sistem Absensi (QR)', icon: 'qr_code', path: '/ormawa/absensi' },
        ]
      },
      {
        group: 'ADMINISTRASI & KEUANGAN',
        items: [
          { name: 'Pagu & Buku Keuangan', icon: 'account_balance_wallet', path: '/ormawa/keuangan' },
          { name: 'Laporan & LPJ', icon: 'assignment', path: '/ormawa/lpj' },
        ]
      },
      {
        group: 'KOMUNIKASI & SISTEM',
        items: [
          { name: 'Aspirasi Masuk', icon: 'campaign', path: '/ormawa/aspirasi' },
          { name: 'Pusat Notifikasi', icon: 'notifications', path: '/ormawa/notifikasi' },
          { name: 'Siaran Pengumuman', icon: 'campaign', path: '/ormawa/pengumuman' },
          { name: 'Role & Akses', icon: 'security', path: '/ormawa/rbac' },
          { name: 'Pengaturan Sistem', icon: 'settings', path: '/ormawa/pengaturan' },
        ]
      },
    ],
  },

  // ─── SUPER ADMIN PORTAL ────────────────────────────────────────────
  superadmin: {
    title: 'SIAKAD Hub',
    logo: '/images/bku logo.png',
    subtitle: 'Super Admin',
    sidebarWidth: 'w-64',
    showRoleBadge: true,
    roleLabel: 'Super Admin',
    roleBadgeColor: 'amber',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
          { name: 'Log Aktivitas', icon: 'warning', path: '/admin/audit' },
        ]
      },
      {
        group: 'MANAJEMEN DATA',
        items: [
          { name: 'Data Fakultas', icon: 'apartment', path: '/admin/faculties' },
          { name: 'Data Prodi', icon: 'database', path: '/admin/prodi' },
          { name: 'Data Mahasiswa', icon: 'school', path: '/admin/students' },
          { name: 'Data Psikolog', icon: 'psychology', path: '/admin/psychologists' },
        ]
      },
      {
        group: 'KEGIATAN & ORMAWA',
        items: [
          { name: 'Global Proposals', icon: 'assignment', path: '/admin/proposals' },
          { name: 'Kelola Ormawa', icon: 'group', path: '/admin/organizations' },
        ]
      },
      {
        group: 'LAYANAN & BANTUAN',
        items: [
          { name: 'Beasiswa', icon: 'payment', path: '/admin/scholarships' },
          { name: 'Prestasi Mahasiswa', icon: 'emoji_events', path: '/admin/achievements' },
          { name: 'Aspirasi', icon: 'chat', path: '/admin/aspirations' },
        ]
      },
      {
        group: 'KENCANA (PKKMB)',
        items: [
          { name: 'Kelola Ormawa', icon: 'group', path: '/admin/organizations' },
        ]
      },
      {
        group: 'SISTEM & INFORMASI',
        items: [
          { name: 'Kelola Berita', icon: 'newspaper', path: '/admin/announcements' },
          { name: 'Pengaturan Tampilan', icon: 'palette', path: '/admin/theme', hasSubmenu: true, submenu: [
            { name: 'Warna', icon: 'palette', path: '/admin/theme/colors' },
            { name: 'Tipografi', icon: 'text_fields', path: '/admin/theme/typography' },
            { name: 'Branding', icon: 'image', path: '/admin/theme/branding' },
            { name: 'Komponen', icon: 'widgets', path: '/admin/theme/components' },
            { name: 'Warna Status', icon: 'check_circle', path: '/admin/theme/status' },
          ]},
          { name: 'Kelola Akses (RBAC)', icon: 'security', path: '/admin/rbac' },
        ]
      },
    ],
  },

  // ─── KENCANA PORTAL (3 variant: admin, fakultas, mentor) ───────────
  kencana_admin: {
    title: 'KENCANA',
    logo: '/images/bku logo.png',
    subtitle: 'Admin Universitas',
    sidebarWidth: 'w-72',
    showRoleBadge: true,
    roleLabel: 'Admin Kencana',
    roleBadgeColor: 'emerald',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/kencana-admin' },
          { name: 'Kelola Periode', icon: 'date_range', path: '/kencana-admin/periods' },
        ]
      },
      {
        group: 'KONTEN ORIENTASI',
        items: [
          { name: 'Tahap & Sesi', icon: 'account_tree', path: '/kencana-admin/stages' },
        ]
      },
      {
        group: 'DATA PESERTA',
        items: [
          { name: 'Data Peserta', icon: 'groups', path: '/kencana-admin/participants' },
          { name: 'Rekap Nilai', icon: 'grade', path: '/kencana-admin/scores' },
          { name: 'Remedial', icon: 'autorenew', path: '/kencana-admin/remedials' },
          { name: 'Sertifikat', icon: 'workspace_premium', path: '/kencana-admin/certificates' },
        ]
      },
      {
        group: 'PEMBIMBING',
        items: [
          { name: 'Kelola Mentor', icon: 'supervisor_account', path: '/kencana-admin/mentors' },
        ]
      },
    ],
  },

  kencana_fakultas: {
    title: 'KENCANA',
    logo: '/images/bku logo.png',
    subtitle: 'Portal Fakultas',
    sidebarWidth: 'w-72',
    showRoleBadge: true,
    roleLabel: 'Fakultas',
    roleBadgeColor: 'blue',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/kencana-fakultas' },
        ]
      },
      {
        group: 'DATA FAKULTAS',
        items: [
          { name: 'Peserta Fakultas', icon: 'groups', path: '/kencana-fakultas/participants' },
          { name: 'Nilai Fakultas', icon: 'grade', path: '/kencana-fakultas/scores' },
        ]
      },
      {
        group: 'JADWAL',
        items: [
          { name: 'Jadwal & Tahap', icon: 'calendar_month', path: '/kencana-fakultas/stages' },
        ]
      },
      {
        group: 'PEMBIMBING',
        items: [
          { name: 'Dewan Pembimbing', icon: 'supervisor_account', path: '/kencana-fakultas/mentors' },
        ]
      },
    ],
  },

  kencana_mentor: {
    title: 'KENCANA',
    logo: '/images/bku logo.png',
    subtitle: 'Dewan Pembimbing',
    sidebarWidth: 'w-72',
    showRoleBadge: true,
    roleLabel: 'Mentor',
    roleBadgeColor: 'violet',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/kencana-mentor' },
        ]
      },
      {
        group: 'BIMBINGAN',
        items: [
          { name: 'Mahasiswa Saya', icon: 'school', path: '/kencana-mentor/students' },
          { name: 'Cari Mahasiswa', icon: 'person_search', path: '/kencana-mentor/available' },
        ]
      },
      {
        group: 'LAINNYA',
        items: [
          { name: 'Pengaturan', icon: 'settings', path: '/kencana-mentor/settings' },
        ]
      },
    ],
  },

  // ─── PSYCHOLOGIST PORTAL ───────────────────────────────────────────
  psychologist: {
    title: 'Psychologist Portal',
    logo: '/images/bku logo.png',
    subtitle: 'Psikolog',
    sidebarWidth: 'w-64',
    showRoleBadge: true,
    roleLabel: 'Psikolog',
    roleBadgeColor: 'teal',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/psychologist' },
        ]
      },
      {
        group: 'ASESMEN & KONSELING',
        items: [
          { name: 'Booking', icon: 'calendar_month', path: '/psychologist/bookings' },
          { name: 'Jadwal Saya', icon: 'schedule', path: '/psychologist/schedule' },
          { name: 'Daftar Pasien', icon: 'people', path: '/psychologist/patients' },
        ]
      },
      {
        group: 'ANALISIS & REFERRAL',
        items: [
          { name: 'Analytics & Trend', icon: 'analytics', path: '/psychologist/analytics' },
          { name: 'Manajemen Referral', icon: 'forward', path: '/psychologist/referrals' },
        ]
      },
      {
        group: 'LAINNYA',
        items: [
          { name: 'Notifikasi', icon: 'notifications', path: '/psychologist/notifications' },
          { name: 'Pengaturan', icon: 'settings', path: '/psychologist/settings' },
        ]
      },
    ],
  },
};

// Helper: Get config by role
export const getConfigByRole = (role) => {
  const roleMap = {
    mahasiswa: 'student',
    faculty_admin: 'faculty',
    ormawa_admin: 'ormawa',
    ormawa: 'ormawa',
    super_admin: 'superadmin',
    kencana_admin: 'kencana_admin',
    kencana_fakultas: 'kencana_fakultas',
    kencana_mentor: 'kencana_mentor',
    psikolog: 'psychologist',
  };

  const configKey = roleMap[role] || 'student';
  return PORTAL_CONFIG[configKey] || PORTAL_CONFIG.student;
};

// Role badge color mapping
export const ROLE_BADGE_STYLES = {
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-600',
    border: 'border-violet-500/20',
    dot: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  teal: {
    bg: 'bg-teal-500/10',
    text: 'text-teal-600',
    border: 'border-teal-500/20',
    dot: 'bg-teal-500',
  },
};

// Export default
export default PORTAL_CONFIG;