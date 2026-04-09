import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'
import Academic from './pages/Academic/Academic'
import Services from './pages/Services/Services'
import Login from './pages/Auth/Login'
import ChangePassword from './pages/Auth/ChangePassword'
import AdminDashboard from './pages/SuperAdmin/AdminDashboard'
import FacultyLayout from './pages/FacultyAdmin/components/FacultyLayout'
import FacultyDashboard from './pages/FacultyAdmin/FacultyDashboard'
import OrmawaDashboard from './pages/OrmawaAdmin/OrmawaDashboard'

// Error Pages & Components
import ErrorBoundary from './components/ErrorBoundary'
import Error404 from './pages/Error/Error404'
import Error403 from './pages/Error/Error403'
import Error500 from './pages/Error/Error500'
import OfflinePage from './pages/Error/OfflinePage'

// App Layout & Student BKU Modules
import AppLayout from './components/layout/AppLayout'
import BkuDashboard from './pages/Student/BkuDashboard'
import KencanaPage from './pages/Student/KencanaPage'
import KencanaKuisPage from './pages/Student/KencanaKuisPage'
import AchievementPage from './pages/Student/AchievementPage'
import ScholarshipPage from './pages/Student/ScholarshipPage'
import ScholarshipDetailPage from './pages/Student/ScholarshipDetailPage'
import CounselingPage from './pages/Student/CounselingPage'
import HealthScreeningPage from './pages/Student/HealthScreeningPage'
import StudentVoicePage from './pages/Student/StudentVoicePage'
import StudentVoiceDetailPage from './pages/Student/StudentVoiceDetailPage'
import OrganisasiPage from './pages/Student/OrganisasiPage'
import StudentKRS from './pages/Student/KRS/index'
import ProfilePage from './pages/Student/ProfilePage'
import NotificationPage from './pages/Student/NotificationPage'

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
import StaffManagement from './pages/OrmawaAdmin/StaffManagement'
import Notifikasi from './pages/OrmawaAdmin/Notifikasi'
import Settings from './pages/OrmawaAdmin/Settings'
import AspirationManagement from './pages/OrmawaAdmin/AspirationManagement'

// Faculty Admin Modules (from danzz)
import FacultyAspirationManagement from './pages/FacultyAdmin/Aspirasi'
import FacultyPmb from './pages/FacultyAdmin/MahasiswaBaru'
import FacultyProdi from './pages/FacultyAdmin/Prodi'
import FacultyDosen from './pages/FacultyAdmin/Dosen'
import FacultyMahasiswa from './pages/FacultyAdmin/Mahasiswa'
import FacultyMahasiswaImport from './pages/FacultyAdmin/Mahasiswa'
import FacultyMahasiswaStatus from './pages/FacultyAdmin/Mahasiswa'
import FacultyMahasiswaTambah from './pages/FacultyAdmin/Mahasiswa'
import FacultyMahasiswaEdit from './pages/FacultyAdmin/Mahasiswa'
import FacultyDosenTambah from './pages/FacultyAdmin/Dosen'
import FacultyDosenEdit from './pages/FacultyAdmin/Dosen'
import FacultyProdiTambah from './pages/FacultyAdmin/Prodi'
import FacultyProdiEdit from './pages/FacultyAdmin/Prodi'
import FacultyProdiKurikulum from './pages/FacultyAdmin/Prodi'
import FacultyProdiMatakuliah from './pages/FacultyAdmin/Prodi'
import FacultyJadwal from './pages/FacultyAdmin/TahunAkademik'
import FacultyKrs from './pages/FacultyAdmin/Mahasiswa'
import FacultyNilai from './pages/FacultyAdmin/Mahasiswa'
import FacultyLaporan from './pages/FacultyAdmin/Laporan'
import FacultyKonten from './pages/FacultyAdmin/Konten'
import FacultyPengaturan from './pages/FacultyAdmin/TahunAkademik'
import FacultyKonseling from './pages/FacultyAdmin/Konseling'
import FacultyPrestasi from './pages/FacultyAdmin/Prestasi'
import FacultyFakultas from './pages/FacultyAdmin/FakultasProposals'
import FacultyFakultasTambah from './pages/FacultyAdmin/FakultasProposals'
import FacultyFakultasEdit from './pages/FacultyAdmin/FakultasProposals'
import FacultyPersuratan from './pages/FacultyAdmin/Persuratan'
import FacultyBeasiswa from './pages/FacultyAdmin/Beasiswa'
import FacultyMahasiswaBaru from './pages/FacultyAdmin/MahasiswaBaru'
import FacultyProposalApproval from './pages/FacultyAdmin/OrmawaProposals'
import FacultyOrganisasi from './pages/FacultyAdmin/OrganisasiFakultas'
import FacultyPkkmb from './pages/FacultyAdmin/Pkkmb'
import FacultyHealth from './pages/FacultyAdmin/Kesehatan'
// import FacultyRoleManagement from './pages/FacultyAdmin/RoleManagement'

// Super Admin Modules (from danzz)
import StudentDashboard from './pages/Student/StudentDashboard'
import UserManagement from './pages/SuperAdmin/UserManagement'
import AcademicPortal from './pages/SuperAdmin/AcademicPortal'
import AspirationControl from './pages/SuperAdmin/AspirationControl'
import ProposalPipeline from './pages/SuperAdmin/ProposalPipeline'
import AuditLog from './pages/SuperAdmin/AuditLog'
import CounselingAchievement from './pages/SuperAdmin/CounselingAchievement'
import ContentManagement from './pages/SuperAdmin/ContentManagement'
import ReportsGenerator from './pages/SuperAdmin/ReportsGenerator'
import StudentDirectory from './pages/SuperAdmin/StudentDirectory'
import AdminPerformance from './pages/SuperAdmin/AdminPerformance'
import SecuritySettings from './pages/SuperAdmin/SecuritySettings'
import LecturerDirectory from './pages/SuperAdmin/LecturerDirectory'
import KelolaFakultas from './pages/SuperAdmin/KelolaFakultas'
import KelolaProdi from './pages/SuperAdmin/KelolaProdi'
import KelolaBeasiswa from './pages/SuperAdmin/KelolaBeasiswa'
import KelolaOrganisasi from './pages/SuperAdmin/KelolaOrganisasi'
import NotFound from './pages/NotFound/NotFound'
import { AuthProvider } from './context/AuthContext'

import './index.css'

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOffline) {
    return <OfflinePage />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Error Pages */}
            <Route path="/404" element={<Error404 />} />
            <Route path="/403" element={<Error403 />} />
            <Route path="/500" element={<Error500 />} />

            {/* Super Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rbac" element={<UserManagement />} />
            <Route path="/admin/academic" element={<AcademicPortal />} />
            <Route path="/admin/aspirations" element={<AspirationControl />} />
            <Route path="/admin/proposals" element={<ProposalPipeline />} />
            <Route path="/admin/audit" element={<AuditLog />} />
            <Route path="/admin/counseling" element={<CounselingAchievement />} />
            <Route path="/admin/announcements" element={<ContentManagement />} />
            <Route path="/admin/broadcast" element={<ContentManagement />} />
            <Route path="/admin/reports" element={<ReportsGenerator />} />
            <Route path="/admin/students" element={<StudentDirectory />} />
            <Route path="/admin/performance" element={<AdminPerformance />} />
            <Route path="/admin/security" element={<SecuritySettings />} />
            <Route path="/admin/lecturers" element={<LecturerDirectory />} />
            <Route path="/admin/config" element={<AcademicPortal />} />
            <Route path="/admin/faculties" element={<KelolaFakultas />} />
            <Route path="/admin/prodi" element={<KelolaProdi />} />
            <Route path="/admin/scholarships" element={<KelolaBeasiswa />} />
            <Route path="/admin/organizations" element={<KelolaOrganisasi />} />
            <Route path="/admin/ormawa" element={<ProposalPipeline />} />
            <Route path="/admin/treasury" element={<ReportsGenerator />} />
            <Route path="/admin/infrastructure" element={<AcademicPortal />} />

            <Route path="/faculty" element={<FacultyLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="aspirasi" element={<FacultyAspirationManagement />} />
              <Route path="pmb" element={<FacultyPmb />} />
              <Route path="fakultas" element={<FacultyFakultas />} />
              <Route path="fakultas/tambah" element={<FacultyFakultasTambah />} />
              <Route path="fakultas/edit/:id" element={<FacultyFakultasEdit />} />
              <Route path="prodi" element={<FacultyProdi />} />
              <Route path="prodi/tambah" element={<FacultyProdiTambah />} />
              <Route path="prodi/edit/:id" element={<FacultyProdiEdit />} />
              <Route path="prodi/kurikulum" element={<FacultyProdiKurikulum />} />
              <Route path="prodi/matakuliah" element={<FacultyProdiMatakuliah />} />
              <Route path="dosen" element={<FacultyDosen />} />
              <Route path="mahasiswa" element={<FacultyMahasiswa />} />
              <Route path="mahasiswa/import" element={<FacultyMahasiswaImport />} />
              <Route path="mahasiswa/status" element={<FacultyMahasiswaStatus />} />
              <Route path="mahasiswa/tambah" element={<FacultyMahasiswaTambah />} />
              <Route path="mahasiswa/edit/:id" element={<FacultyMahasiswaEdit />} />
              <Route path="dosen/tambah" element={<FacultyDosenTambah />} />
              <Route path="dosen/edit/:id" element={<FacultyDosenEdit />} />
              <Route path="jadwal" element={<FacultyJadwal />} />
              <Route path="krs" element={<FacultyKrs />} />
              <Route path="nilai" element={<FacultyNilai />} />
              <Route path="laporan" element={<FacultyLaporan />} />
              <Route path="laporan/mahasiswa" element={<FacultyLaporan />} />
              <Route path="konten" element={<FacultyKonten />} />
              <Route path="pengaturan" element={<FacultyPengaturan />} />
              <Route path="konseling" element={<FacultyKonseling />} />
              <Route path="prestasi" element={<FacultyPrestasi />} />
              <Route path="persuratan" element={<FacultyPersuratan />} />
              <Route path="beasiswa" element={<FacultyBeasiswa />} />
              <Route path="mahasiswa/baru" element={<FacultyMahasiswaBaru />} />
              <Route path="pkkmb" element={<FacultyPkkmb />} />
              <Route path="kesehatan" element={<FacultyHealth />} />
              <Route path="ormawa/proposals" element={<FacultyProposalApproval />} />
              <Route path="organisasi" element={<FacultyOrganisasi />} />
            </Route>

            {/* Ormawa Admin Routes */}
            <Route path="/ormawa" element={<OrmawaDashboard />} />
            <Route path="/ormawa/anggota" element={<AnggotaManagement />} />
            <Route path="/ormawa/proposal" element={<ProposalManagement />} />
            <Route path="/ormawa/jadwal" element={<JadwalKegiatan />} />
            <Route path="/ormawa/absensi" element={<AbsensiKegiatan />} />
            <Route path="/ormawa/keuangan" element={<KeuanganKas />} />
            <Route path="/ormawa/lpj" element={<LpjManagement />} />
            <Route path="/ormawa/pengumuman" element={<Pengumuman />} />
            <Route path="/ormawa/struktur" element={<StrukturOrganisasi />} />
            <Route path="/ormawa/staff" element={<StaffManagement />} />
            <Route path="/ormawa/rbac" element={<RoleBasedAccess />} />
            <Route path="/ormawa/notifikasi" element={<Notifikasi />} />
            <Route path="/ormawa/pengaturan" element={<Settings />} />
            <Route path="/ormawa/aspirasi" element={<AspirationManagement />} />

            {/* Student Portal (BKU Student Hub) */}
            <Route path="/student" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BkuDashboard />} />
              <Route path="kencana" element={<KencanaPage />} />
              <Route path="kencana/kuis/:kuisId" element={<KencanaKuisPage />} />
              <Route path="achievement" element={<AchievementPage />} />
              <Route path="scholarship" element={<ScholarshipPage />} />
              <Route path="scholarship/pengajuan/:id" element={<ScholarshipDetailPage />} />
              <Route path="counseling" element={<CounselingPage />} />
              <Route path="health" element={<HealthScreeningPage />} />
              <Route path="voice" element={<StudentVoicePage />} />
              <Route path="voice/tiket/:id" element={<StudentVoiceDetailPage />} />
              <Route path="organisasi" element={<OrganisasiPage />} />
              <Route path="krs" element={<StudentKRS />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifikasi" element={<NotificationPage />} />
            </Route>

            <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
