import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ChangePassword from './pages/Auth/ChangePassword'
import ForgotPassword from './pages/Auth/ForgotPassword'
import UpdateEmail from './pages/Auth/UpdateEmail'
import AdminDashboard from './pages/SuperAdmin/AdminDashboard'
import SuperAdminOrmawaDashboard from './pages/SuperAdmin/SuperAdminOrmawaDashboard'
import { withSuperAdminOrmawaAccess } from './pages/SuperAdmin/withSuperAdminOrmawaAccess'
import FacultyLayout from './pages/FacultyAdmin/components/FacultyLayout'
import FacultyDashboard from './pages/FacultyAdmin/FacultyDashboard'
import OrmawaDashboard from './pages/OrmawaAdmin/OrmawaDashboard'
import OrmawaLayout from './pages/OrmawaAdmin/components/OrmawaLayout'
import PsychologistDashboard from './pages/Psychologist/PsychologistDashboard'
import BookingManagement from './pages/Psychologist/BookingManagement'
import BookingDetail from './pages/Psychologist/BookingDetail'
import ScheduleManagement from './pages/Psychologist/ScheduleManagement'
import PatientList from './pages/Psychologist/PatientList'
import PatientMedicalRecord from './pages/Psychologist/PatientMedicalRecord'
import AnalyticsTrends from './pages/Psychologist/AnalyticsTrends'
import ReferralManagement from './pages/Psychologist/ReferralManagement'
import PsychologistLayout from './pages/Psychologist/PsychologistLayout'
import NotificationsCenter from './pages/Psychologist/NotificationsCenter'
import PsychologistSettings from './pages/Psychologist/PsychologistSettings'
import MedicalRecordsPage from './pages/Psychologist/MedicalRecords'

import TenagaKesehatanLayout from './pages/TenagaKesehatan/TenagaKesehatanLayout'
import TenagaKesehatanDashboard from './pages/TenagaKesehatan/TenagaKesehatanDashboard'
import TenagaKesehatanBookingManagement from './pages/TenagaKesehatan/BookingManagement'
import TenagaKesehatanScheduleManagement from './pages/TenagaKesehatan/ScheduleManagement'
import TenagaKesehatanPatientList from './pages/TenagaKesehatan/PatientList'
import TenagaKesehatanPatientMedicalRecord from './pages/TenagaKesehatan/PatientMedicalRecord'
import TenagaKesehatanSettings from './pages/TenagaKesehatan/Settings'
import TenagaKesehatanNotificationsCenter from './pages/TenagaKesehatan/NotificationsCenter'

import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import ThemeProvider from './components/ThemeProvider'
import Error404 from './pages/Error/Error404'
import Error403 from './pages/Error/Error403'
import Error500 from './pages/Error/Error500'
import OfflinePage from './pages/Error/OfflinePage'
import { Loader2 } from 'lucide-react'

import AppLayout from './components/layout/AppLayout'
import BkuDashboard from './pages/Student/BkuDashboard'
import KencanaPage from './pages/Student/KencanaPage'
import KencanaKuisPage from './pages/Student/KencanaKuisPage'
import AchievementPage from './pages/Student/AchievementPage'
import ScholarshipPage from './pages/Student/ScholarshipPage'
import ScholarshipDetailPage from './pages/Student/ScholarshipDetailPage'
import CounselingPage from './pages/Student/CounselingPage'
import CounselingHistoryPage from './pages/Student/CounselingHistoryPage'
import HealthScreeningPage from './pages/Student/HealthScreeningPage'
import InsurancePage from './pages/Student/InsurancePage'
import SelfScreeningPage from './pages/Student/SelfScreeningPage'
import StudentVoicePage from './pages/Student/StudentVoicePage'
import StudentVoiceDetailPage from './pages/Student/StudentVoiceDetailPage'
import OrganisasiPage from './pages/Student/OrganisasiPage'
import ProfilePage from './pages/Student/ProfilePage'
import NotificationPage from './pages/Student/NotificationPage'
import PresensiPage from './pages/Student/PresensiPage'

import AnggotaManagement from './pages/OrmawaAdmin/AnggotaManagement'
import ProposalManagement from './pages/OrmawaAdmin/ProposalManagement'
import JadwalKegiatan from './pages/OrmawaAdmin/JadwalKegiatan'
import AbsensiKegiatan from './pages/OrmawaAdmin/AbsensiKegiatan'
import KeuanganKas from './pages/OrmawaAdmin/KeuanganKas'
import LpjManagement from './pages/OrmawaAdmin/LpjManagement'
import Pengumuman from './pages/OrmawaAdmin/Pengumuman'
import StrukturOrganisasi from './pages/OrmawaAdmin/StrukturOrganisasi'

// Wrap ormawa pages untuk Super Admin
const SuperAdminAnggota = withSuperAdminOrmawaAccess(AnggotaManagement, 'Manajemen Anggota')
const SuperAdminProposal = withSuperAdminOrmawaAccess(ProposalManagement, 'Manajemen Proposal')
const SuperAdminJadwal = withSuperAdminOrmawaAccess(JadwalKegiatan, 'Jadwal Kegiatan')
const SuperAdminAbsensi = withSuperAdminOrmawaAccess(AbsensiKegiatan, 'Absensi Kegiatan')
const SuperAdminKeuangan = withSuperAdminOrmawaAccess(KeuanganKas, 'Keuangan Kas')
const SuperAdminLpj = withSuperAdminOrmawaAccess(LpjManagement, 'LPJ Management')
const SuperAdminPengumuman = withSuperAdminOrmawaAccess(Pengumuman, 'Pengumuman')
const SuperAdminStruktur = withSuperAdminOrmawaAccess(StrukturOrganisasi, 'Struktur Organisasi')
import RoleBasedAccess from './pages/OrmawaAdmin/RoleBasedAccess'
import Notifikasi from './pages/OrmawaAdmin/Notifikasi'
import Settings from './pages/OrmawaAdmin/Settings'
import Recruitment from './pages/OrmawaAdmin/Recruitment'
import AspirationManagement from './pages/OrmawaAdmin/AspirationManagement'

const SuperAdminAspirasi = withSuperAdminOrmawaAccess(AspirationManagement, 'Aspirasi Masuk')
const SuperAdminRbac = withSuperAdminOrmawaAccess(RoleBasedAccess, 'Manajemen Hak Akses')
const SuperAdminOrmawaDashboardWrapped = withSuperAdminOrmawaAccess(SuperAdminOrmawaDashboard, 'Dashboard Ormawa')

import FacultyAspirationManagement from './pages/FacultyAdmin/Aspirasi'
import FacultyProdi from './pages/FacultyAdmin/Prodi'
import FacultyDosen from './pages/FacultyAdmin/Psikolog'
const FacultyMahasiswa = React.lazy(() => import('./pages/FacultyAdmin/Mahasiswa'))
const FacultyMahasiswaImport = FacultyMahasiswa
const FacultyMahasiswaStatus = FacultyMahasiswa
const FacultyMahasiswaTambah = FacultyMahasiswa
const FacultyMahasiswaEdit = FacultyMahasiswa
import FacultyDosenTambah from './pages/FacultyAdmin/Psikolog'
import FacultyDosenEdit from './pages/FacultyAdmin/Psikolog'
import FacultyProdiTambah from './pages/FacultyAdmin/Prodi'
import FacultyProdiEdit from './pages/FacultyAdmin/Prodi'
import FacultyProdiKurikulum from './pages/FacultyAdmin/Prodi'
import FacultyProdiMatakuliah from './pages/FacultyAdmin/Prodi'
import FacultyJadwal from './pages/FacultyAdmin/TahunAkademik'
const FacultyKrs = FacultyMahasiswa
const FacultyNilai = FacultyMahasiswa
import FacultyLaporan from './pages/FacultyAdmin/Laporan'
import FacultyPengaturan from './pages/FacultyAdmin/Settings'
import FacultyPrestasi from './pages/FacultyAdmin/Prestasi'
import FacultyBeasiswa from './pages/FacultyAdmin/Beasiswa'
import FacultyProposalApproval from './pages/FacultyAdmin/OrmawaProposals'
import FacultyOrganisasi from './pages/FacultyAdmin/OrganisasiFakultas'
import FacultyPkkmb from './pages/FacultyAdmin/Pkkmb'
import FacultyHealth from './pages/FacultyAdmin/Kesehatan'
import FacultyProdiRBAC from './pages/FacultyAdmin/ProdiRBAC'
import FacultyProdiUsers from './pages/FacultyAdmin/ProdiUsers'

import UserManagement from './pages/SuperAdmin/UserManagement'
import AcademicPortal from './pages/SuperAdmin/AcademicPortal'
import AspirationControl from './pages/SuperAdmin/AspirationControl'
import ProposalPipeline from './pages/SuperAdmin/ProposalPipeline'
import AuditLog from './pages/SuperAdmin/AuditLog'
import ContentManagement from './pages/SuperAdmin/ContentManagement'
import ReportsGenerator from './pages/SuperAdmin/ReportsGenerator'
const StudentDirectory = React.lazy(() => import('./pages/SuperAdmin/StudentDirectory'))
import AdminPerformance from './pages/SuperAdmin/AdminPerformance'
import AdminProfile from './pages/SuperAdmin/Profile'
import SecuritySettings from './pages/SuperAdmin/SecuritySettings'
import { ThemeCustomizer } from './pages/SuperAdmin/theme'
import LandingPageEditor from './pages/SuperAdmin/LandingPageEditor'
import AdminPsychologistDashboard from './pages/SuperAdmin/psychologist/PsychologistDashboard'
import AdminPsychologistList from './pages/SuperAdmin/psychologist/PsychologistList'
import AdminPsychologistBookings from './pages/SuperAdmin/psychologist/PsychologistBookings'
import AdminPsychologistMedicalRecords from './pages/SuperAdmin/psychologist/PsychologistMedicalRecords'
import AdminPsychologistReferrals from './pages/SuperAdmin/psychologist/PsychologistReferrals'
import AdminTenagaKesehatanDashboard from './pages/SuperAdmin/tenagakes/TenagaKesehatanDashboardPage'
import AdminTenagaKesehatanList from './pages/SuperAdmin/tenagakes/TenagaKesehatanList'
import AdminTenagaKesehatanBookings from './pages/SuperAdmin/tenagakes/TenagaKesehatanBookings'
import AdminTenagaKesehatanMedicalRecords from './pages/SuperAdmin/tenagakes/TenagaKesehatanMedicalRecords'
import AdminTenagaKesehatanReferrals from './pages/SuperAdmin/tenagakes/TenagaKesehatanReferrals'
import AdminKlaimAsuransi from './pages/SuperAdmin/tenagakes/KlaimAsuransi'
import KelolaFakultas from './pages/SuperAdmin/KelolaFakultas'
import LecturerDirectory from './pages/SuperAdmin/LecturerDirectory'
import KelolaBeasiswa from './pages/SuperAdmin/KelolaBeasiswa'
import KelolaPrestasi from './pages/SuperAdmin/KelolaPrestasi'
import AspirationDetail from './pages/SuperAdmin/AspirationDetail'
import KelolaOrganisasi from './pages/SuperAdmin/KelolaOrganisasi'
import InsuranceManagement from './pages/SuperAdmin/InsuranceManagement'
import GamifikasiOrmawa from './pages/SuperAdmin/GamifikasiOrmawa'
import KategoriOrmawaPage from './pages/FacultyAdmin/KategoriOrmawa'
import SuperAdminLayout from './pages/SuperAdmin/components/SuperAdminLayout'

// Landing Pages
import { LandingLayout, Beranda, Tentang, ProgramStudi, Berita, Kontak, KebijakanPrivasi, SyaratKetentuan } from './pages/Landing'

import InsuranceReview from './pages/TenagaKesehatan/InsuranceReview'
import BAPManagement from './pages/TenagaKesehatan/BAPManagement'
import ReportsPage from './pages/TenagaKesehatan/ReportsPage'

import KencanaLayout from './pages/Kencana/components/KencanaLayout'
import KencanaAdminDashboard from './pages/Kencana/Admin/Dashboard'
import KencanaAdminPeriods from './pages/Kencana/Admin/Periods'
import KencanaAdminStages from './pages/Kencana/Admin/Stages'
import QuizBuilder from './pages/Kencana/Admin/QuizBuilder'
import KencanaAdminParticipants from './pages/Kencana/Admin/Participants'
import KencanaAdminScores from './pages/Kencana/Admin/Scores'
import KencanaAdminSummary from './pages/Kencana/Admin/ScoreSummary'
import KencanaAdminRemedials from './pages/Kencana/Admin/Remedials'
import KencanaAdminCertificates from './pages/Kencana/Admin/Certificates'
import KencanaAdminUniversitasGroup from './pages/Kencana/Admin/Groups'

import KencanaAdminMentors from './pages/Kencana/Admin/Mentors'
import KencanaFakultasDashboard from './pages/Kencana/Fakultas/Dashboard'
import KencanaFakultDashboard from './pages/Kencana/Fakultas/Dashboard'
import KencanaFakultaskesParticipants from './pages/Kencana/Fakultas/Participants'
import KencanaFakultaskesScores from './pages/Kencana/Fakultas/Scores'
import KencanaFakultaskesStages from './pages/Kencana/Fakultas/Stages'

import KencanaTimelinePage from './pages/Student/Kencana/KencanaTimelinePage'
import KencanaStagePage from './pages/Student/Kencana/KencanaStagePage'
import KencanaSessionPage from './pages/Student/Kencana/KencanaSessionPage'
import KencanaHandbookPage from './pages/Student/Kencana/KencanaHandbookPage'
import KencanaMentorInvitationsPage from './pages/Student/Kencana/KencanaMentorInvitationsPage'
import KencanaAttendancePage from './pages/Student/Kencana/KencanaAttendancePage'
import KencanaAssignmentPage from './pages/Student/Kencana/KencanaAssignmentPage'
import KencanaScorePage from './pages/Student/Kencana/KencanaScorePage'
import KencanaRemedialPage from './pages/Student/Kencana/KencanaRemedialPage'
import KencanaCertificatePage from './pages/Student/Kencana/KencanaCertificatePage'

import KencanaMentorDashboard from './pages/Kencana/Mentor/Dashboard'
import KencanaMentorStudents from './pages/Kencana/Mentor/Students'
import KencanaMentorAvailable from './pages/Kencana/Mentor/AvailableStudents'
import KencanaMentorStudentDetail from './pages/Kencana/Mentor/StudentDetail'
import KencanaMentorSettings from './pages/Kencana/Mentor/Settings'
import KencanaMentorGroups from './pages/Kencana/Mentor/Groups'
import KencanaMentorGroupDetail from './pages/Kencana/Mentor/GroupDetail'
import KencanaMentorInvite from './pages/Kencana/Mentor/Invite'
import NotFound from './pages/NotFound/NotFound'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './store/useAuthStore'

import './index.css'

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const checkHydration = () => {
      useAuthStore.getState();
      setIsHydrated(true);
    };
    checkHydration();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) return <OfflinePage />;
  if (!isHydrated) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary size-10" /></div>;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary size-10" /></div>}>
              <Routes>

                {/* Landing Pages */}
                <Route path="/" element={<LandingLayout />}>
                  <Route index element={<Beranda />} />
                  <Route path="tentang" element={<Tentang />} />
                  <Route path="program-studi" element={<ProgramStudi />} />
                  <Route path="berita" element={<Berita />} />
                  <Route path="kontak" element={<Kontak />} />
                  <Route path="kebijakan-privasi" element={<KebijakanPrivasi />} />
                  <Route path="syarat-ketentuan" element={<SyaratKetentuan />} />
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/404" element={<Error404 />} />
                <Route path="/403" element={<Error403 />} />
                <Route path="/500" element={<Error500 />} />

                {/* Super Admin */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="rbac" element={<UserManagement />} />
                  <Route path="academic" element={<AcademicPortal />} />
                  <Route path="aspirations" element={<AspirationControl />} />
                  <Route path="proposals" element={<ProposalPipeline />} />
                  <Route path="audit" element={<AuditLog />} />
                  <Route path="announcements" element={<ContentManagement />} />
                  <Route path="broadcast" element={<ContentManagement />} />
                  <Route path="reports" element={<ReportsGenerator />} />
                  <Route path="students" element={<StudentDirectory />} />
                  <Route path="student-dashboard" element={<BkuDashboard />} />
                  <Route path="student-profile" element={<ProfilePage />} />
                  <Route path="student-kencana" element={<KencanaPage />} />
                  <Route path="student-counseling" element={<CounselingPage />} />
                  <Route path="student-counseling/history" element={<CounselingHistoryPage />} />
                  <Route path="student-kesehatan" element={<HealthScreeningPage />} />
                  <Route path="student-kesehatan/self-screening" element={<SelfScreeningPage />} />
                  <Route path="student-kesehatan/insurance" element={<InsurancePage />} />
                  <Route path="student-beasiswa" element={<ScholarshipPage />} />
                  <Route path="student-beasiswa/pengajuan/:id" element={<ScholarshipDetailPage />} />
                  <Route path="student-prestasi" element={<AchievementPage />} />
                  <Route path="student-organisasi" element={<OrganisasiPage />} />
                  <Route path="student-aspirasi" element={<StudentVoicePage />} />
                  <Route path="student-aspirasi/detail/:id" element={<StudentVoiceDetailPage />} />
                  <Route path="student-notifikasi" element={<NotificationPage />} />
                  <Route path="student-presensi" element={<PresensiPage />} />
                  <Route path="performance" element={<AdminPerformance />} />
                  <Route path="security" element={<SecuritySettings />} />
                  <Route path="theme" element={<ThemeCustomizer />} />
                  <Route path="landing-settings" element={<LandingPageEditor />} />
                  <Route path="theme/colors" element={<ThemeCustomizer />} />
                  <Route path="theme/typography" element={<ThemeCustomizer />} />
                  <Route path="theme/branding" element={<ThemeCustomizer />} />
                  <Route path="theme/components" element={<ThemeCustomizer />} />
                  <Route path="theme/status" element={<ThemeCustomizer />} />

                   <Route path="psychologists/dashboard" element={<AdminPsychologistDashboard />} />
                  <Route path="psychologists/list" element={<AdminPsychologistList />} />
                  <Route path="psychologists/bookings" element={<AdminPsychologistBookings />} />
                  <Route path="psychologists/medical-records" element={<AdminPsychologistMedicalRecords />} />
                  <Route path="psychologists/referrals" element={<AdminPsychologistReferrals />} />
                  <Route path="tenagakes/dashboard" element={<AdminTenagaKesehatanDashboard />} />
                  <Route path="tenagakes/list" element={<AdminTenagaKesehatanList />} />
                  <Route path="tenagakes/bookings" element={<AdminTenagaKesehatanBookings />} />
                  <Route path="tenagakes/medical-records" element={<AdminTenagaKesehatanMedicalRecords />} />
                  <Route path="tenagakes/referrals" element={<AdminTenagaKesehatanReferrals />} />
                  <Route path="tenagakes/claims" element={<AdminKlaimAsuransi />} />
                  <Route path="insurance" element={<InsuranceManagement />} />
                  <Route path="config" element={<AcademicPortal />} />
                  <Route path="faculties" element={<KelolaFakultas />} />
                  <Route path="prodi" element={<FacultyProdi />} />
                  <Route path="prodi/tambah" element={<FacultyProdiTambah />} />
                  <Route path="prodi/edit/:id" element={<FacultyProdiEdit />} />
                  <Route path="prodi/kurikulum" element={<FacultyProdiKurikulum />} />
                  <Route path="prodi/matakuliah" element={<FacultyProdiMatakuliah />} />
                  <Route path="lecturers" element={<LecturerDirectory />} />
                  <Route path="faculty-mahasiswa" element={<FacultyMahasiswa />} />
                  <Route path="faculty-mahasiswa/import" element={<FacultyMahasiswaImport />} />
                  <Route path="faculty-mahasiswa/status" element={<FacultyMahasiswaStatus />} />
                  <Route path="faculty-mahasiswa/tambah" element={<FacultyMahasiswaTambah />} />
                  <Route path="faculty-mahasiswa/edit/:id" element={<FacultyMahasiswaEdit />} />
                  <Route path="faculty-dosen" element={<Navigate to="../faculty-psikolog" replace />} />
                  <Route path="faculty-psikolog" element={<FacultyDosen />} />
                  <Route path="faculty-jadwal" element={<FacultyJadwal />} />
                  <Route path="faculty-ormawa-proposals" element={<FacultyProposalApproval />} />
                  <Route path="faculty-organisasi" element={<FacultyOrganisasi />} />
                  <Route path="faculty-pkkmb" element={<FacultyPkkmb />} />
                  <Route path="faculty-beasiswa" element={<FacultyBeasiswa />} />
                  <Route path="faculty-prestasi" element={<FacultyPrestasi />} />
                  <Route path="faculty-kesehatan" element={<FacultyHealth />} />
                  <Route path="faculty-aspirasi" element={<FacultyAspirationManagement />} />
                  <Route path="faculty-laporan" element={<FacultyLaporan />} />
                  <Route path="faculty-rbac" element={<FacultyProdiRBAC />} />
                  <Route path="faculty-prodi-users" element={<FacultyProdiUsers />} />
                  <Route path="faculty-settings" element={<FacultyPengaturan />} />
                  <Route path="scholarships" element={<KelolaBeasiswa />} />
                  <Route path="achievements" element={<KelolaPrestasi />} />
                  <Route path="aspirations/:id" element={<AspirationDetail />} />
                  <Route path="organizations" element={<KelolaOrganisasi />} />
                  <Route path="gamifikasi" element={<GamifikasiOrmawa />} />
                  <Route path="ormawa-kategori" element={<KategoriOrmawaPage />} />
                  <Route path="ormawa-dashboard" element={<SuperAdminOrmawaDashboardWrapped />} />
                  <Route path="ormawa-anggota" element={<SuperAdminAnggota />} />
                  <Route path="ormawa-struktur" element={<SuperAdminStruktur />} />
                  <Route path="ormawa-proposal" element={<SuperAdminProposal />} />
                  <Route path="ormawa-jadwal" element={<SuperAdminJadwal />} />
                  <Route path="ormawa-absensi" element={<SuperAdminAbsensi />} />
                  <Route path="ormawa-keuangan" element={<SuperAdminKeuangan />} />
                  <Route path="ormawa-lpj" element={<SuperAdminLpj />} />
                  <Route path="ormawa-pengumuman" element={<SuperAdminPengumuman />} />
                  <Route path="ormawa-aspirasi" element={<SuperAdminAspirasi />} />
                  <Route path="ormawa-rbac" element={<SuperAdminRbac />} />
                  <Route path="ormawa" element={<ProposalPipeline />} />
                  <Route path="treasury" element={<ReportsGenerator />} />
                  <Route path="infrastructure" element={<AcademicPortal />} />
                  
                  {/* Kencana Universitas inside SuperAdmin */}
                  <Route path="kencana-univ" element={<KencanaAdminDashboard />} />
                  <Route path="kencana-univ/periods" element={<KencanaAdminPeriods />} />
                  <Route path="kencana-univ/timeline" element={<KencanaAdminPeriods />} />
                  <Route path="kencana-univ/stages" element={<KencanaAdminStages />} />
                  <Route path="kencana-univ/pre-kencana" element={<KencanaAdminStages phaseType="pra_kencana" />} />
                  <Route path="kencana-univ/university" element={<KencanaAdminStages phaseType="kencana_universitas" />} />
                  <Route path="kencana-univ/faculty-stages" element={<KencanaFakultaskesStages />} />
                  <Route path="kencana-univ/faculty-stages/:facultyId" element={<KencanaFakultaskesStages />} />

                  <Route path="kencana-univ/quiz/:id/builder" element={<QuizBuilder />} />
                  <Route path="kencana-univ/participants" element={<KencanaAdminParticipants />} />
                  <Route path="kencana-univ/scores" element={<KencanaAdminScores />} />
                  <Route path="kencana-univ/score-summary" element={<KencanaAdminSummary />} />
                  <Route path="kencana-univ/remedials" element={<KencanaAdminRemedials />} />
                  <Route path="kencana-univ/certificates" element={<KencanaAdminCertificates />} />
                  <Route path="kencana-univ/mentors" element={<KencanaAdminMentors />} />
                  <Route path="kencana-univ/groups" element={<KencanaAdminUniversitasGroup />} />

                  {/* Kencana Fakultas inside SuperAdmin */}
                  <Route path="kencana-fakultas-admin" element={<KencanaFakultDashboard />} />
                  <Route path="kencana-fakultas-admin/participants" element={<KencanaFakultaskesParticipants />} />
                  <Route path="kencana-fakultas-admin/scores" element={<KencanaFakultaskesScores />} />
                  <Route path="kencana-fakultas-admin/stages" element={<KencanaFakultaskesStages />} />
                  <Route path="kencana-fakultas-admin/stages/:facultyId" element={<KencanaFakultaskesStages />} />

                  <Route path="kencana-fakultas-admin/mentors" element={<KencanaAdminMentors portal="fakult" />} />
                  <Route path="kencana-fakultas-admin/quiz/:id/builder" element={<QuizBuilder />} />
                </Route>

                {/* Kencana Admin */}
                <Route path="/kencana-admin" element={<ProtectedRoute allowedRoles={['kencana_admin', 'super_admin']} requiredPermissions={['kencana.period.create', 'kencana.stage.create']}><KencanaLayout portalType="admin" /></ProtectedRoute>}>
                  <Route index element={<KencanaAdminDashboard />} />
                  <Route path="periods" element={<KencanaAdminPeriods />} />
                  <Route path="timeline" element={<KencanaAdminPeriods />} />
                  <Route path="stages" element={<KencanaAdminStages />} />
                  <Route path="pre-kencana" element={<KencanaAdminStages phaseType="pra_kencana" />} />
                  <Route path="university" element={<KencanaAdminStages phaseType="kencana_universitas" />} />
                  <Route path="faculty-stages" element={<KencanaFakultaskesStages />} />
                  <Route path="faculty-stages/:facultyId" element={<KencanaFakultaskesStages />} />

                  <Route path="quiz/:id/builder" element={<QuizBuilder />} />
                  <Route path="participants" element={<KencanaAdminParticipants />} />
                  <Route path="scores" element={<KencanaAdminScores />} />
                  <Route path="score-summary" element={<KencanaAdminSummary />} />
                  <Route path="remedials" element={<KencanaAdminRemedials />} />
                  <Route path="certificates" element={<KencanaAdminCertificates />} />
                  <Route path="mentors" element={<KencanaAdminMentors />} />
                  <Route path="groups" element={<KencanaAdminUniversitasGroup />} />
                </Route>

                {/* Kencana Fakul */}
                <Route path="/kencana-fakult" element={<ProtectedRoute allowedRoles={['kencana_fakult', 'super_admin']} requiredPermissions={['kencana.faculty.dashboard']}><KencanaLayout portalType="fakult" /></ProtectedRoute>}>
                  <Route index element={<KencanaFakultDashboard />} />
                  <Route path="participants" element={<KencanaFakultaskesParticipants />} />
                  <Route path="scores" element={<KencanaFakultaskesScores />} />
                  <Route path="stages" element={<KencanaFakultaskesStages />} />

                  <Route path="mentors" element={<KencanaAdminMentors portal="fakult" />} />
                  <Route path="quiz/:id/builder" element={<QuizBuilder />} />
                </Route>

                {/* Kencana Fakultas (alias for Super Admin sidebar link) */}
                <Route path="/kencana-fakultas" element={<ProtectedRoute allowedRoles={['kencana_fakult', 'kencana_fakultas', 'super_admin']} requiredPermissions={['kencana.faculty.dashboard']}><KencanaLayout portalType="fakult" /></ProtectedRoute>}>
                  <Route index element={<KencanaFakultDashboard />} />
                  <Route path="participants" element={<KencanaFakultaskesParticipants />} />
                  <Route path="scores" element={<KencanaFakultaskesScores />} />
                  <Route path="stages" element={<KencanaFakultaskesStages />} />
                  <Route path="stages/:facultyId" element={<KencanaFakultaskesStages />} />

                  <Route path="mentors" element={<KencanaAdminMentors portal="fakult" />} />
                  <Route path="quiz/:id/builder" element={<QuizBuilder />} />
                </Route>

                {/* Kencana Mentor */}
                <Route path="/kencana-mentor" element={<ProtectedRoute allowedRoles={['kencana_mentor']} requiredPermissions={['kencana.mentor.dashboard']}><KencanaLayout portalType="mentor" /></ProtectedRoute>}>
                  <Route index element={<KencanaMentorDashboard />} />
                  <Route path="students" element={<KencanaMentorStudents />} />
                  <Route path="students/:studentId" element={<KencanaMentorStudentDetail />} />
                  <Route path="available" element={<KencanaMentorAvailable />} />
                  <Route path="invite" element={<KencanaMentorInvite />} />
                  <Route path="settings" element={<KencanaMentorSettings />} />
                  <Route path="groups" element={<KencanaMentorGroups />} />
                  <Route path="groups/:id" element={<KencanaMentorGroupDetail />} />
                </Route>

                {/* Faculty Admin */}
                <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty_admin', 'prodi_admin']} requiredPermissions={['faculty.view', 'program_studi.view', 'students.view']}><FacultyLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<FacultyDashboard />} />
                  <Route path="aspirasi" element={<FacultyAspirationManagement />} />
                  <Route path="dosen" element={<Navigate to="../psikolog" replace />} />
                  <Route path="psikolog" element={<FacultyDosen />} />
                  <Route path="prodi" element={<FacultyProdi />} />
                  <Route path="prodi/tambah" element={<FacultyProdiTambah />} />
                  <Route path="prodi/edit/:id" element={<FacultyProdiEdit />} />
                  <Route path="prodi/kurikulum" element={<FacultyProdiKurikulum />} />
                  <Route path="prodi/matakuliah" element={<FacultyProdiMatakuliah />} />
                  <Route path="mahasiswa" element={<FacultyMahasiswa />} />
                  <Route path="mahasiswa/import" element={<FacultyMahasiswaImport />} />
                  <Route path="mahasiswa/status" element={<FacultyMahasiswaStatus />} />
                  <Route path="mahasiswa/tambah" element={<FacultyMahasiswaTambah />} />
                  <Route path="mahasiswa/edit/:id" element={<FacultyMahasiswaEdit />} />
                  <Route path="jadwal" element={<FacultyJadwal />} />
                  <Route path="krs" element={<FacultyKrs />} />
                  <Route path="nilai" element={<FacultyNilai />} />
                  <Route path="laporan" element={<FacultyLaporan />} />
                  <Route path="laporan/mahasiswa" element={<FacultyLaporan />} />
                  <Route path="pengaturan" element={<FacultyPengaturan />} />
                  <Route path="prestasi" element={<FacultyPrestasi />} />
                  <Route path="beasiswa" element={<FacultyBeasiswa />} />
                  <Route path="pkkmb" element={<FacultyPkkmb />} />
                  <Route path="kesehatan" element={<FacultyHealth />} />
                  <Route path="ormawa/proposals" element={<FacultyProposalApproval />} />
                  <Route path="organisasi" element={<FacultyOrganisasi />} />
                  <Route path="rbac" element={<FacultyProdiRBAC />} />
                  <Route path="prodi-users" element={<FacultyProdiUsers />} />
                </Route>

                {/* Ormawa Admin */}
                <Route path="/ormawa" element={<ProtectedRoute allowedRoles={['ormawa_admin', 'ormawa']} requiredPermissions={['ormawa.view', 'ormawa.events.view', 'ormawa.members.view']}><OrmawaLayout /></ProtectedRoute>}>
                  <Route index element={<OrmawaDashboard />} />
                  <Route path="anggota" element={<AnggotaManagement />} />
                  <Route path="proposal" element={<ProposalManagement />} />
                  <Route path="jadwal" element={<JadwalKegiatan />} />
                  <Route path="absensi" element={<AbsensiKegiatan />} />
                  <Route path="keuangan" element={<KeuanganKas />} />
                  <Route path="lpj" element={<LpjManagement />} />
                  <Route path="pengumuman" element={<Pengumuman />} />
                  <Route path="struktur" element={<StrukturOrganisasi />} />
                  <Route path="rbac" element={<RoleBasedAccess />} />
                  <Route path="notifikasi" element={<Notifikasi />} />
                  <Route path="pengaturan" element={<Settings />} />
                  <Route path="recruitment" element={<Recruitment />} />
                  <Route path="aspirasi" element={<AspirationManagement />} />
                </Route>

                {/* Psychologist */}
                <Route path="/psychologist" element={<ProtectedRoute allowedRoles={['psikolog']} requiredPermissions={['psychologist.bookings.view', 'psychologist.schedules.view']}><PsychologistLayout /></ProtectedRoute>}>
                  <Route index element={<PsychologistDashboard />} />
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="bookings/:id" element={<BookingDetail />} />
                  <Route path="schedule" element={<ScheduleManagement />} />
                  <Route path="patients" element={<PatientList />} />
                  <Route path="patients/:id/medical-record" element={<PatientMedicalRecord />} />
                  <Route path="referrals" element={<ReferralManagement />} />
                  <Route path="analytics" element={<AnalyticsTrends />} />
                  <Route path="notifications" element={<NotificationsCenter />} />
                  <Route path="settings" element={<PsychologistSettings />} />
                   <Route path="medical-records" element={<MedicalRecordsPage />} />
                </Route>

                {/* Tenaga Kesehatan */}
                <Route path="/tenagakes" element={<ProtectedRoute allowedRoles={['tenaga_kesehatan', 'tenagakes', 'super_admin']} requiredPermissions={['health.view', 'health_claims.view']}><TenagaKesehatanLayout /></ProtectedRoute>}>
                  <Route index element={<TenagaKesehatanDashboard />} />
                  <Route path="bookings" element={<TenagaKesehatanBookingManagement />} />
                  <Route path="schedule" element={<TenagaKesehatanScheduleManagement />} />
                  <Route path="patients" element={<TenagaKesehatanPatientList />} />
                  <Route path="patients/:id/medical-record" element={<TenagaKesehatanPatientMedicalRecord />} />
                  <Route path="claims" element={<InsuranceReview />} />
                  <Route path="bap" element={<BAPManagement />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="notifications" element={<TenagaKesehatanNotificationsCenter />} />
                  <Route path="settings" element={<TenagaKesehatanSettings />} />
                </Route>

                {/* Student */}
                <Route path="/student" element={<ProtectedRoute allowedRoles={['mahasiswa']} requiredPermissions={['student.dashboard.view', 'student.profile.update', 'kencana.student.dashboard']}><AppLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<BkuDashboard />} />
                  <Route path="kencana" element={<KencanaPage />} />
                  <Route path="kencana/kuis/:kuisId" element={<KencanaKuisPage />} />
                  <Route path="kencana/timeline" element={<KencanaTimelinePage />} />
                  <Route path="kencana/stage/:stageId" element={<KencanaStagePage />} />
                  <Route path="kencana/session/:sessionId" element={<KencanaSessionPage />} />
                  <Route path="kencana/handbook" element={<KencanaHandbookPage />} />
                  <Route path="kencana/mentors" element={<KencanaMentorInvitationsPage />} />
                  <Route path="kencana/invitations" element={<KencanaMentorInvitationsPage />} />
                  <Route path="kencana/attendance" element={<KencanaAttendancePage />} />
                  <Route path="kencana/assignment/:assignmentId" element={<KencanaAssignmentPage />} />
                  <Route path="kencana/assignments/:assignmentId" element={<KencanaAssignmentPage />} />
                  <Route path="kencana/score" element={<KencanaScorePage />} />
                  <Route path="kencana/scores" element={<KencanaScorePage />} />
                  <Route path="kencana/remedial" element={<KencanaRemedialPage />} />
                  <Route path="kencana/certificate" element={<KencanaCertificatePage />} />
                  <Route path="achievement" element={<AchievementPage />} />
                  <Route path="scholarship" element={<ScholarshipPage />} />
                  <Route path="scholarship/pengajuan/:id" element={<ScholarshipDetailPage />} />
                  <Route path="counseling" element={<CounselingPage />} />
                  <Route path="counseling/history" element={<CounselingHistoryPage />} />
                  <Route path="health" element={<HealthScreeningPage />} />
                  <Route path="health/self-screening" element={<SelfScreeningPage />} />
                  <Route path="insurance" element={<InsurancePage />} />
                  <Route path="voice" element={<StudentVoicePage />} />
                  <Route path="voice/tiket/:id" element={<StudentVoiceDetailPage />} />
                  <Route path="organisasi" element={<OrganisasiPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="notifikasi" element={<NotificationPage />} />
                  <Route path="presensi" element={<PresensiPage />} />
                </Route>

                <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
