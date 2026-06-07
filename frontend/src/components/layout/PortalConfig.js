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
          { name: 'Dashboard', icon: 'dashboard', path: '/faculty/dashboard', permission: 'view_dashboard' },
        ]
      },
      {
        group: 'KEGIATAN & KEMAHASISWAAN',
        items: [
          { name: 'PKKMB', icon: 'school', path: '/faculty/pkkmb', permission: 'view_pkkmb' },
          { name: 'Ormawa', icon: 'groups', path: '/faculty/organisasi', permission: 'view_organisasi' },
          { name: 'Proposal Ormawa', icon: 'assignment', path: '/faculty/ormawa/proposals', permission: 'view_proposal' },
          { name: 'Prestasi', icon: 'emoji_events', path: '/faculty/prestasi', permission: 'view_prestasi' },
          { name: 'Beasiswa', icon: 'payments', path: '/faculty/beasiswa', permission: 'view_beasiswa' },
          { name: 'Kesehatan', icon: 'favorite', path: '/faculty/kesehatan', permission: 'view_kesehatan' },
        ]
      },
      {
        group: 'DATA MASTER',
        items: [
          { name: 'Mahasiswa', icon: 'school', path: '/faculty/mahasiswa', permission: 'view_mahasiswa' },
          { name: 'Dosen / Psikolog', icon: 'psychology', path: '/faculty/psikolog', permission: 'view_psikolog' },
          { name: 'Program Studi', icon: 'database', path: '/faculty/prodi', permission: 'view_prodi' },
          { name: 'Jadwal', icon: 'calendar_month', path: '/faculty/jadwal' },
        ]
      },
      {
        group: 'ADMINISTRASI',
        items: [
          { name: 'Aspirasi', icon: 'chat', path: '/faculty/aspirasi', permission: 'view_aspirasi' },
          { name: 'Laporan', icon: 'description', path: '/faculty/laporan', permission: 'view_laporan' },
          { name: 'Role & Akses (RBAC)', icon: 'security', path: '/faculty/rbac', permission: 'manage_rbac' },
          { name: 'Akun Prodi', icon: 'manage_accounts', path: '/faculty/prodi-users', permission: 'manage_rbac' },
          { name: 'Pengaturan', icon: 'settings', path: '/faculty/pengaturan', permission: 'view_pengaturan' },
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
          { name: 'Dashboard', icon: 'dashboard', path: '/ormawa', permission: 'view_dashboard' },
          { name: 'Anggota Aktif', icon: 'group', path: '/ormawa/anggota', permission: 'view_members' },
          { name: 'Struktur Pengurus', icon: 'account_tree', path: '/ormawa/struktur', permission: 'view_staff' },
          { name: 'Open Recruitment', icon: 'how_to_reg', path: '/ormawa/recruitment', permission: 'view_recruitment' },
        ]
      },
      {
        group: 'OPERASIONAL & KEGIATAN',
        items: [
          { name: 'Proposal & Kegiatan', icon: 'description', path: '/ormawa/proposal', permission: 'view_proposal' },
          { name: 'Jadwal Kalender', icon: 'calendar_month', path: '/ormawa/jadwal', permission: 'view_calendar' },
          { name: 'Sistem Absensi (QR)', icon: 'qr_code', path: '/ormawa/absensi', permission: 'view_attendance' },
        ]
      },
      {
        group: 'ADMINISTRASI & KEUANGAN',
        items: [
          { name: 'Pagu & Buku Keuangan', icon: 'account_balance_wallet', path: '/ormawa/keuangan', permission: 'view_finance' },
          { name: 'Laporan & LPJ', icon: 'assignment', path: '/ormawa/lpj', permission: 'view_lpj' },
        ]
      },
      {
        group: 'KOMUNIKASI & SISTEM',
        items: [
          { name: 'Aspirasi Masuk', icon: 'campaign', path: '/ormawa/aspirasi', permission: 'view_aspirations' },
          { name: 'Pusat Notifikasi', icon: 'notifications', path: '/ormawa/notifikasi', permission: 'view_notifications' },
          { name: 'Siaran Pengumuman', icon: 'campaign', path: '/ormawa/pengumuman', permission: 'view_announcements' },
          { name: 'Role & Akses', icon: 'security', path: '/ormawa/rbac', permission: 'view_rbac' },
          { name: 'Pengaturan Sistem', icon: 'settings', path: '/ormawa/pengaturan', permission: 'view_settings' },
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
        ]
      },
      {
        group: 'MANAJEMEN DATA',
        items: [
          {
            name: 'Data Fakultas',
            icon: 'apartment',
            path: '/admin/faculties',
            hasSubmenu: true,
            submenu: [
              { name: 'Kelola Fakultas', icon: 'corporate_fare', path: '/admin/faculties' },
              { name: 'PKKMB', icon: 'school', path: '/admin/faculty-pkkmb' },
              { name: 'Ormawa', icon: 'groups', path: '/admin/faculty-organisasi' },
              { name: 'Proposal Ormawa', icon: 'assignment', path: '/admin/faculty-ormawa-proposals' },
              { name: 'Prestasi', icon: 'emoji_events', path: '/admin/faculty-prestasi' },
              { name: 'Beasiswa', icon: 'payments', path: '/admin/faculty-beasiswa' },
              { name: 'Kesehatan', icon: 'favorite', path: '/admin/faculty-kesehatan' },
              { name: 'Dosen / Psikolog', icon: 'psychology', path: '/admin/faculty-psikolog' },
              { name: 'Program Studi', icon: 'database', path: '/admin/faculty-prodi' },
              { name: 'Jadwal', icon: 'calendar_month', path: '/admin/faculty-jadwal' },
              { name: 'Laporan', icon: 'description', path: '/admin/faculty-laporan' },
              { name: 'Role & Akses (RBAC)', icon: 'security', path: '/admin/faculty-rbac' },
              { name: 'Akun Prodi', icon: 'manage_accounts', path: '/admin/faculty-prodi-users' },
            ]
          },
          {
            name: 'Data Mahasiswa',
            icon: 'school',
            path: '/admin/students',
            hasSubmenu: true,
            submenu: [
              { name: 'Direktori Mahasiswa', icon: 'groups', path: '/admin/students' },
              { name: 'Kencana (PKKMB)', icon: 'school', path: '/admin/student-kencana' },
              { name: 'Beasiswa', icon: 'payments', path: '/admin/student-beasiswa' },
            ]
          },
          {
            name: 'Data Psikolog',
            icon: 'psychology',
            path: '/admin/psychologists/dashboard',
            hasSubmenu: true,
            submenu: [
              { name: 'Dashboard Psikolog', icon: 'dashboard', path: '/admin/psychologists/dashboard' },
              { name: 'Direktori Psikolog', icon: 'groups', path: '/admin/psychologists/list' },
              { name: 'Booking Konseling', icon: 'calendar_month', path: '/admin/psychologists/bookings' },
              { name: 'Rekam Medis', icon: 'medical_services', path: '/admin/psychologists/medical-records' },
              { name: 'Tindak Lanjut', icon: 'forward_to_inbox', path: '/admin/psychologists/referrals' },
            ]
          },
          {
            name: 'Data Medis',
            icon: 'medical_services',
            path: '/admin/tenagakes/dashboard',
            hasSubmenu: true,
            submenu: [
              { name: 'Dashboard Medis', icon: 'dashboard', path: '/admin/tenagakes/dashboard' },
              { name: 'Direktori Tenaga Medis', icon: 'groups', path: '/admin/tenagakes/list' },
              { name: 'Booking Janji Temu', icon: 'calendar_month', path: '/admin/tenagakes/bookings' },
              { name: 'Rekam Medis & Screening', icon: 'medical_services', path: '/admin/tenagakes/medical-records' },
            ]
          },
          {
            name: 'Data Ormawa',
            icon: 'groups',
            path: '/admin/organizations',
            hasSubmenu: true,
            submenu: [
              { name: 'Kelola Ormawa', icon: 'corporate_fare', path: '/admin/organizations' },
              { name: 'Dashboard Ormawa', icon: 'dashboard', path: '/admin/ormawa-dashboard' },
              { name: 'Anggota Aktif', icon: 'group', path: '/admin/ormawa-anggota' },
              { name: 'Struktur Pengurus', icon: 'account_tree', path: '/admin/ormawa-struktur' },
              { name: 'Proposal & Kegiatan', icon: 'description', path: '/admin/ormawa-proposal' },
              { name: 'Jadwal Kalender', icon: 'calendar_month', path: '/admin/ormawa-jadwal' },
              { name: 'Absensi (QR)', icon: 'qr_code', path: '/admin/ormawa-absensi' },
              { name: 'Keuangan & Kas', icon: 'account_balance_wallet', path: '/admin/ormawa-keuangan' },
              { name: 'Laporan & LPJ', icon: 'assignment', path: '/admin/ormawa-lpj' },
              { name: 'Aspirasi Masuk', icon: 'campaign', path: '/admin/ormawa-aspirasi' },
              { name: 'Pengumuman', icon: 'campaign', path: '/admin/ormawa-pengumuman' },
              { name: 'Role & Akses (RBAC)', icon: 'security', path: '/admin/ormawa-rbac' },
              { name: 'Setting Gamifikasi', icon: 'emoji_events', path: '/admin/gamifikasi' },
            ]
          },
        ]
      },
      {
        group: 'LAYANAN & BANTUAN',
        items: [
          { name: 'Beasiswa', icon: 'payment', path: '/admin/scholarships' },
          { name: 'Prestasi Mahasiswa', icon: 'emoji_events', path: '/admin/achievements' },
          { name: 'Aspirasi', icon: 'chat', path: '/admin/aspirations' },
          { name: 'Kelola Asuransi', icon: 'health_and_safety', path: '/admin/insurance' },
        ]
      },
      {
        group: 'KENCANA (PKKMB)',
        items: [
          { name: 'Kencana Universitas', icon: 'account_balance', path: '/kencana-admin' },
          { name: 'Kencana Fakultas', icon: 'corporate_fare', path: '/kencana-fakultas' },
        ]
      },
      {
        group: 'KEAMANAN & AKSES',
        items: [
          { name: 'Kelola Akses (RBAC)', icon: 'security', path: '/admin/rbac' },
        ]
      },
      {
        group: 'SISTEM & INFORMASI',
        items: [
          { name: 'Kelola Berita', icon: 'newspaper', path: '/admin/announcements' },
          { name: 'Pengaturan Tampilan', icon: 'palette', path: '/admin/theme' },
          { name: 'Pengaturan Sistem', icon: 'settings', path: '/admin/config' },
          { name: 'Log Aktivitas', icon: 'warning', path: '/admin/audit' },
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
          { name: 'Rekam Medis', icon: 'medical_services', path: '/psychologist/medical-records' },
        ]
      },
      {
        group: 'ANALISIS & REFERRAL',
        items: [
          { name: 'Analytics & Trend', icon: 'analytics', path: '/psychologist/analytics' },
          { name: 'Tindak Lanjut', icon: 'forward', path: '/psychologist/referrals' },
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

  // ─── HEALTH WORKER PORTAL (TENAGA KESEHATAN) ───────────────────────
  tenagakes: {
    title: 'Health Portal',
    logo: '/images/bku logo.png',
    subtitle: 'Tenaga Kesehatan',
    sidebarWidth: 'w-64',
    showRoleBadge: true,
    roleLabel: 'Tenaga Kes',
    roleBadgeColor: 'blue',
    menu: [
      {
        group: 'MENU UTAMA',
        items: [
          { name: 'Dashboard', icon: 'dashboard', path: '/tenagakes' },
        ]
      },
      {
        group: 'PELAYANAN MEDIS',
        items: [
          { name: 'Booking Masuk', icon: 'calendar_month', path: '/tenagakes/bookings' },
          { name: 'Jadwal Praktik', icon: 'schedule', path: '/tenagakes/schedule' },
          { name: 'Daftar Mahasiswa', icon: 'people', path: '/tenagakes/patients' },
          { name: 'Klaim Asuransi', icon: 'health_and_safety', path: '/tenagakes/claims' },
        ]
      },
      {
        group: 'LAPORAN',
        items: [
          { name: 'BAP Kesehatan', icon: 'description', path: '/tenagakes/bap' },
          { name: 'Laporan Klinis', icon: 'analytics', path: '/tenagakes/reports' },
        ]
      },
      {
        group: 'LAINNYA',
        items: [
          { name: 'Pengaturan', icon: 'settings', path: '/tenagakes/settings' },
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
    prodi_admin: 'faculty',
    ormawa_admin: 'ormawa',
    ormawa: 'ormawa',
    super_admin: 'superadmin',
    kencana_admin: 'kencana_admin',
    kencana_fakultas: 'kencana_fakultas',
    kencana_mentor: 'kencana_mentor',
    psikolog: 'psychologist',
    tenaga_kesehatan: 'tenagakes',
    tenagakes: 'tenagakes',
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