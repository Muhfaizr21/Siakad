import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import About from './pages/About/About'
import Academic from './pages/Academic/Academic'
import Services from './pages/Services/Services'
import Login from './pages/Auth/Login'
import ChangePassword from './pages/Auth/ChangePassword'
import ForgotPassword from './pages/Auth/ForgotPassword'
import AdminDashboard from './pages/SuperAdmin/AdminDashboard'
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
import ClinicalReports from './pages/Psychologist/ClinicalReports'
import NotificationsCenter from './pages/Psychologist/NotificationsCenter'
import PsychologistSettings from './pages/Psychologist/PsychologistSettings'

// Error Pages & Components
import ErrorBoundary from './components/ErrorBoundary'
import Error404 from './pages/Error/Error404'
import Error403 from './pages/Error/Error403'
import Error500 from './pages/Error/Error500'
import OfflinePage from './pages/Error/OfflinePage'
import { Loader2 } from 'lucide-react'

// App Layout & Student BKU Modules
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
import StudentVoicePage from './pages/Student/StudentVoicePage'
import StudentVoiceDetailPage from './pages/Student/StudentVoiceDetailPage'
import OrganisasiPage from './pages/Student/OrganisasiPage'
import ProfilePage from './pages/Student/ProfilePage'
import NotificationPage from './pages/Student/NotificationPage'
import PresensiPage from './pages/Student/PresensiPage'

// Ormawa Admin Modules (from danzz)
import AnggotaManagement from './pages/OrmawaAdmin/AnggotaManagement'
import ProposalManagement from './pages/OrmawaAdmin/ProposalManagement'
import JadwalKegiatan from './pages/OrmawaAdmin/JadwalKegiatan'
import AbsensiKegiatan from './pages/OrmawaAdmin/AbsensiKegiatan'
import KeuanganKas from './pages/OrmawaAdmin/KeuanganKas'
import LpjManagement from './pages/OrmawaAdmin/LpjManagement'
import Pengumuman from './pages/OrmawaAdmin/Pengumuman'
import StrukturOrganisasi from './pages/OrmawaAdmin/StrukturOrganisasi'
import RoleBasedAccess from './pages/OrmawaAdmin/RoleBasedAccess'
import Notifikasi from './pages/OrmawaAdmin/Notifikasi'
import Settings from './pages/OrmawaAdmin/Settings'
import AspirationManagement from './pages/OrmawaAdmin/AspirationManagement'
// Faculty Admin Modules (from danzz)
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
import FacultyKonten from './pages/FacultyAdmin/Konten'
import FacultyPengaturan from './pages/FacultyAdmin/Settings'

import FacultyPrestasi from './pages/FacultyAdmin/Prestasi'

import FacultyBeasiswa from './pages/FacultyAdmin/Beasiswa'

import FacultyProposalApproval from './pages/FacultyAdmin/OrmawaProposals'
import FacultyOrganisasi from './pages/FacultyAdmin/OrganisasiFakultas'
import FacultyPkkmb from './pages/FacultyAdmin/Pkkmb'
import FacultyHealth from './pages/FacultyAdmin/Kesehatan'
import StudentDashboard from './pages/Student/StudentDashboard'
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

import PsychologistDirectory from './pages/SuperAdmin/PsychologistDirectory'
import KelolaFakultas from './pages/SuperAdmin/KelolaFakultas'
import KelolaProdi from './pages/SuperAdmin/KelolaProdi'
import KelolaBeasiswa from './pages/SuperAdmin/KelolaBeasiswa'
import KelolaPrestasi from './pages/SuperAdmin/KelolaPrestasi'
import AspirationDetail from './pages/SuperAdmin/AspirationDetail'
import KelolaOrganisasi from './pages/SuperAdmin/KelolaOrganisasi'
import SuperAdminLayout from './pages/SuperAdmin/components/SuperAdminLayout'

// Kencana Portals
import KencanaLayout from './pages/Kencana/components/KencanaLayout'
import KencanaAdminDashboard from './pages/Kencana/Admin/Dashboard'
import KencanaAdminPeriods from './pages/Kencana/Admin/Periods'
import KencanaAdminStages from './pages/Kencana/Admin/Stages'
import QuizBuilder from './pages/Kencana/Admin/QuizBuilder'
import KencanaAdminParticipants from './pages/Kencana/Admin/Participants'
import KencanaAdminScores from './pages/Kencana/Admin/Scores'
import KencanaAdminRemedials from './pages/Kencana/Admin/Remedials'
import KencanaAdminCertificates from './pages/Kencana/Admin/Certificates'
import KencanaAdminMentors from './pages/Kencana/Admin/Mentors'

import KencanaFakultasDashboard from './pages/Kencana/Fakultas/Dashboard'
import KencanaFakultasParticipants from './pages/Kencana/Fakultas/Participants'
import KencanaFakultasScores from './pages/Kencana/Fakultas/Scores'
import KencanaFakultasStages from './pages/Kencana/Fakultas/Stages'

// Student Kencana Sub-Pages
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

    // Initial hydration check for Zustand store
    const checkHydration = () => {
      const state = useAuthStore.getState();
      // Even if token is null, hydration is 'done' once we've read from storage
      setIsHydrated(true);
    };
    checkHydration();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return <OfflinePage />;
  }

  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary size-10" /></div>;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary size-10" /></div>}>
            <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Error Pages */}
            <Route path="/404" element={<Error404 />} />
            <Route path="/403" element={<Error403 />} />
            <Route path="/500" element={<Error500 />} />

            {/* Super Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminLayout>
                  <Routes>
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
                    <Route path="performance" element={<AdminPerformance />} />
                    <Route path="security" element={<SecuritySettings />} />

                    <Route path="psychologists" element={<PsychologistDirectory />} />
                    <Route path="config" element={<AcademicPortal />} />
                    <Route path="faculties" element={<KelolaFakultas />} />
                    <Route path="prodi" element={<KelolaProdi />} />
                    <Route path="scholarships" element={<KelolaBeasiswa />} />
                    <Route path="achievements" element={<KelolaPrestasi />} />
                    <Route path="aspirations/:id" element={<AspirationDetail />} />
                    <Route path="organizations" element={<KelolaOrganisasi />} />
                    <Route path="ormawa" element={<ProposalPipeline />} />
                    <Route path="treasury" element={<ReportsGenerator />} />
                    <Route path="infrastructure" element={<AcademicPortal />} />
                  </Routes>
                </SuperAdminLayout>
              </ProtectedRoute>
            } />

            {/* Portal Admin Kencana */}
            <Route path="/kencana-admin/*" element={
              <ProtectedRoute allowedRoles={['kencana_admin']}>
                <KencanaLayout portalType="admin">
                  <Routes>
                    <Route index element={<KencanaAdminDashboard />} />
                    <Route path="periods" element={<KencanaAdminPeriods />} />
                    <Route path="stages" element={<KencanaAdminStages />} />
                    <Route path="quiz/:id/builder" element={<QuizBuilder />} />
                    <Route path="participants" element={<KencanaAdminParticipants />} />
                    <Route path="scores" element={<KencanaAdminScores />} />
                    <Route path="remedials" element={<KencanaAdminRemedials />} />
                    <Route path="certificates" element={<KencanaAdminCertificates />} />
                    <Route path="mentors" element={<KencanaAdminMentors />} />
                  </Routes>
                </KencanaLayout>
              </ProtectedRoute>
            } />

            {/* Portal Kencana Fakultas */}
            <Route path="/kencana-fakultas/*" element={
              <ProtectedRoute allowedRoles={['kencana_fakultas']}>
                <KencanaLayout portalType="fakultas">
                  <Routes>
                    <Route index element={<KencanaFakultasDashboard />} />
                    <Route path="participants" element={<KencanaFakultasParticipants />} />
                    <Route path="scores" element={<KencanaFakultasScores />} />
                    <Route path="stages" element={<KencanaFakultasStages />} />
                    <Route path="mentors" element={<KencanaAdminMentors portal="fakultas" />} />
                  </Routes>
                </KencanaLayout>
              </ProtectedRoute>
            } />

            {/* Portal Kencana Mentor */}
            <Route path="/kencana-mentor/*" element={
              <ProtectedRoute allowedRoles={['kencana_mentor']}>
                <KencanaLayout portalType="mentor">
                  <Routes>
                    <Route index element={<KencanaMentorDashboard />} />
                    <Route path="students" element={<KencanaMentorStudents />} />
                    <Route path="students/:id" element={<KencanaMentorStudentDetail />} />
                    <Route path="available" element={<KencanaMentorAvailable />} />
                    <Route path="settings" element={<KencanaMentorSettings />} />
                  </Routes>
                </KencanaLayout>
              </ProtectedRoute>
            } />

            <Route path="/faculty/*" element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <Routes>
                  <Route element={<FacultyLayout />}>
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
                    {/* <Route path="konten" element={<FacultyKonten />} /> */}
                    <Route path="pengaturan" element={<FacultyPengaturan />} />

                    <Route path="prestasi" element={<FacultyPrestasi />} />
                    <Route path="beasiswa" element={<FacultyBeasiswa />} />

                    <Route path="pkkmb" element={<FacultyPkkmb />} />
                    <Route path="kesehatan" element={<FacultyHealth />} />
                    <Route path="ormawa/proposals" element={<FacultyProposalApproval />} />
                    <Route path="organisasi" element={<FacultyOrganisasi />} />
                  </Route>
                </Routes>
              </ProtectedRoute>
            } />

            {/* Ormawa Admin Routes */}
            <Route path="/ormawa/*" element={
              <ProtectedRoute allowedRoles={['ormawa_admin', 'mahasiswa', 'ormawa']}>
                <Routes>
                  <Route element={<OrmawaLayout />}>
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
                    <Route path="aspirasi" element={<AspirationManagement />} />
                  </Route>
                </Routes>
              </ProtectedRoute>
            } />
            {/* Psychologist Portal Routes */}
            <Route path="/psychologist/*" element={
              <ProtectedRoute allowedRoles={['psikolog']}>
                <Routes>
                  <Route index element={<PsychologistDashboard />} />
                  {/* Sub-routes can be added here later */}
                  <Route path="bookings" element={<BookingManagement />} />
                  <Route path="bookings/:id" element={<BookingDetail />} />
                  <Route path="schedule" element={<ScheduleManagement />} />
                  <Route path="patients" element={<PatientList />} />
                  <Route path="patients/:id/medical-record" element={<PatientMedicalRecord />} />
                  <Route path="referrals" element={<ReferralManagement />} />
                  <Route path="analytics" element={<AnalyticsTrends />} />
                  <Route path="reports" element={<ClinicalReports />} />
                  <Route path="notifications" element={<NotificationsCenter />} />
                  <Route path="settings" element={<PsychologistSettings />} />
                </Routes>
              </ProtectedRoute>
            } />

            {/* Student Portal (BKU Student Hub) */}
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['mahasiswa']}>
                <AppLayout />
              </ProtectedRoute>
            }>
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
              <Route path="voice" element={<StudentVoicePage />} />
              <Route path="voice/tiket/:id" element={<StudentVoiceDetailPage />} />
              <Route path="organisasi" element={<OrganisasiPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifikasi" element={<NotificationPage />} />
              <Route path="presensi" element={<PresensiPage />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </React.Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
