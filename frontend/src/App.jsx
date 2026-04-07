import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'
import Academic from './pages/Academic/Academic'
import Services from './pages/Services/Services'
import Login from './pages/Login/Login'
import AdminDashboard from './pages/SuperAdmin/AdminDashboard'
import FacultyDashboard from './pages/FacultyAdmin/FacultyDashboard'
import OrmawaDashboard from './pages/OrmawaAdmin/OrmawaDashboard'
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
import FacultyAspirationManagement from './pages/FacultyAdmin/FacultyAspirationManagement'
import FacultyPmb from './pages/FacultyAdmin/pmb/page'
import FacultyProdi from './pages/FacultyAdmin/prodi/page'
import FacultyDosen from './pages/FacultyAdmin/dosen/page'
import FacultyMahasiswa from './pages/FacultyAdmin/mahasiswa/page'
import FacultyMahasiswaImport from './pages/FacultyAdmin/mahasiswa/import'
import FacultyMahasiswaStatus from './pages/FacultyAdmin/mahasiswa/status/page'
import FacultyMahasiswaTambah from './pages/FacultyAdmin/mahasiswa/tambah/page'
import FacultyMahasiswaEdit from './pages/FacultyAdmin/mahasiswa/edit/page'
import FacultyDosenTambah from './pages/FacultyAdmin/dosen/tambah/page'
import FacultyDosenEdit from './pages/FacultyAdmin/dosen/edit/page'
import FacultyProdiTambah from './pages/FacultyAdmin/prodi/tambah/page'
import FacultyProdiEdit from './pages/FacultyAdmin/prodi/edit/page'
import FacultyProdiKurikulum from './pages/FacultyAdmin/prodi/kurikulum/page'
import FacultyProdiMatakuliah from './pages/FacultyAdmin/prodi/matakuliah/page'
import FacultyJadwal from './pages/FacultyAdmin/jadwal/page'
import FacultyKrs from './pages/FacultyAdmin/krs/page'
import FacultyNilai from './pages/FacultyAdmin/nilai/page'
import FacultyLaporan from './pages/FacultyAdmin/laporan/mahasiswa/page'
import FacultyKonten from './pages/FacultyAdmin/konten/page'
import FacultyPengaturan from './pages/FacultyAdmin/pengaturan/tahun-akademik/page'
import FacultyKonseling from './pages/FacultyAdmin/konseling/page'
import FacultyPrestasi from './pages/FacultyAdmin/mahasiswa/prestasi'
import FacultyFakultas from './pages/FacultyAdmin/fakultas/page'
import FacultyFakultasTambah from './pages/FacultyAdmin/fakultas/tambah/page'
import FacultyFakultasEdit from './pages/FacultyAdmin/fakultas/edit/page'
import FacultyPersuratan from './pages/FacultyAdmin/persuratan/page'
import FacultyYudisium from './pages/FacultyAdmin/yudisium/page'
import FacultyMbkm from './pages/FacultyAdmin/mbkm/page'
import FacultyBeasiswa from './pages/FacultyAdmin/beasiswa/page'
import FacultyMahasiswaBaru from './pages/FacultyAdmin/mahasiswa/Baru'
import FacultyProposalApproval from './pages/FacultyAdmin/ormawa/proposals'
import FacultyOrganisasi from './pages/FacultyAdmin/ormawa/OrganisasiFakultas'
import StudentDashboard from './pages/Student/StudentDashboard'
import UserManagement from './pages/SuperAdmin/UserManagement'
import AcademicPortal from './pages/SuperAdmin/AcademicPortal'
import AspirationControl from './pages/SuperAdmin/AspirationControl'
import ProposalPipeline from './pages/SuperAdmin/ProposalPipeline'
import AuditLog from './pages/SuperAdmin/AuditLog'
import CounselingAchievement from './pages/SuperAdmin/CounselingAchievement'
import ContentManagement from './pages/SuperAdmin/ContentManagement'
import ReportsGenerator from './pages/SuperAdmin/ReportsGenerator'
import SystemHealth from './pages/SuperAdmin/SystemHealth'
import StudentDirectory from './pages/SuperAdmin/StudentDirectory'
import AdminPerformance from './pages/SuperAdmin/AdminPerformance'
import SecuritySettings from './pages/SuperAdmin/SecuritySettings'
import LecturerDirectory from './pages/SuperAdmin/LecturerDirectory'
import NotFound from './pages/NotFound/NotFound'
import { AuthProvider } from './context/AuthContext'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default route ke Landing */}
          <Route path="/" element={<Landing />} />

          {/* Halaman About */}
          <Route path="/about" element={<About />} />

          {/* Halaman Academic */}
          <Route path="/academic" element={<Academic />} />

          {/* Halaman Services */}
          <Route path="/services" element={<Services />} />
          
          {/* Halaman Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Halaman Super Admin Dashboard & Features */}
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
          <Route path="/admin/health" element={<SystemHealth />} />
          <Route path="/admin/students" element={<StudentDirectory />} />
          <Route path="/admin/performance" element={<AdminPerformance />} />
          <Route path="/admin/security" element={<SecuritySettings />} />
          <Route path="/admin/lecturers" element={<LecturerDirectory />} />
          <Route path="/admin/config" element={<AcademicPortal />} />
          <Route path="/admin/ormawa" element={<ProposalPipeline />} />
          <Route path="/admin/treasury" element={<ReportsGenerator />} />
          <Route path="/admin/infrastructure" element={<AcademicPortal />} />

          {/* Halaman Faculty Dashboard */}
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/aspirasi" element={<FacultyAspirationManagement />} />
          <Route path="/faculty/pmb" element={<FacultyPmb />} />
          <Route path="/faculty/fakultas" element={<FacultyFakultas />} />
          <Route path="/faculty/fakultas/tambah" element={<FacultyFakultasTambah />} />
          <Route path="/faculty/fakultas/edit/:id" element={<FacultyFakultasEdit />} />
          <Route path="/faculty/prodi" element={<FacultyProdi />} />
          <Route path="/faculty/prodi/tambah" element={<FacultyProdiTambah />} />
          <Route path="/faculty/prodi/edit/:id" element={<FacultyProdiEdit />} />
          <Route path="/faculty/prodi/kurikulum" element={<FacultyProdiKurikulum />} />
          <Route path="/faculty/prodi/matakuliah" element={<FacultyProdiMatakuliah />} />
          <Route path="/faculty/dosen" element={<FacultyDosen />} />
          <Route path="/faculty/mahasiswa" element={<FacultyMahasiswa />} />
          <Route path="/faculty/mahasiswa/import" element={<FacultyMahasiswaImport />} />
          <Route path="/faculty/mahasiswa/status" element={<FacultyMahasiswaStatus />} />
          <Route path="/faculty/mahasiswa/tambah" element={<FacultyMahasiswaTambah />} />
          <Route path="/faculty/mahasiswa/edit/:id" element={<FacultyMahasiswaEdit />} />
          <Route path="/faculty/dosen/tambah" element={<FacultyDosenTambah />} />
          <Route path="/faculty/dosen/edit/:id" element={<FacultyDosenEdit />} />
          <Route path="/faculty/jadwal" element={<FacultyJadwal />} />
          <Route path="/faculty/krs" element={<FacultyKrs />} />
          <Route path="/faculty/nilai" element={<FacultyNilai />} />
          <Route path="/faculty/laporan" element={<FacultyLaporan />} />
          <Route path="/faculty/laporan/mahasiswa" element={<FacultyLaporan />} />
          <Route path="/faculty/konten" element={<FacultyKonten />} />
          <Route path="/faculty/pengaturan" element={<FacultyPengaturan />} />
          
          {/* New Faculty Sub-routes mapping sidebar */}
          <Route path="/faculty/konseling" element={<FacultyKonseling />} />
          <Route path="/faculty/prestasi" element={<FacultyPrestasi />} />
          <Route path="/faculty/persuratan" element={<FacultyPersuratan />} />
          <Route path="/faculty/yudisium" element={<FacultyYudisium />} />
          <Route path="/faculty/mbkm" element={<FacultyMbkm />} />
          <Route path="/faculty/beasiswa" element={<FacultyBeasiswa />} />
          <Route path="/faculty/mahasiswa/baru" element={<FacultyMahasiswaBaru />} />
          <Route path="/faculty/ormawa/proposals" element={<FacultyProposalApproval />} />
          <Route path="/faculty/organisasi" element={<FacultyOrganisasi />} />

          {/* Halaman Ormawa Dashboard */}
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

          {/* Halaman Student Dashboard */}
          <Route path="/student" element={<StudentDashboard />} />

          {/* Halaman Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
