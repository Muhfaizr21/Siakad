import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'
import Academic from './pages/Academic/Academic'
import Services from './pages/Services/Services'
import Login from './pages/Auth/Login'
import ChangePassword from './pages/Auth/ChangePassword'
import AdminDashboard from './pages/SuperAdmin/AdminDashboard'
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
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/academic" element={<Academic />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/ormawa" element={<OrmawaDashboard />} />

          {/* Error Pages */}
          <Route path="/404" element={<Error404 />} />
          <Route path="/403" element={<Error403 />} />
          <Route path="/500" element={<Error500 />} />

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

          {/* Fallback to 404 */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
