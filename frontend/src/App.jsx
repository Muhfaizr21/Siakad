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
import Notifikasi from './pages/OrmawaAdmin/Notifikasi'
import Settings from './pages/OrmawaAdmin/Settings'
import StudentDashboard from './pages/Student/StudentDashboard'
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
        
        {/* Halaman Super Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Halaman Faculty Dashboard */}
        <Route path="/faculty" element={<FacultyDashboard />} />

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
        <Route path="/ormawa/rbac" element={<RoleBasedAccess />} />
        <Route path="/ormawa/notifikasi" element={<Notifikasi />} />
        <Route path="/ormawa/pengaturan" element={<Settings />} />

        {/* Halaman Student Dashboard */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Redirect jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


