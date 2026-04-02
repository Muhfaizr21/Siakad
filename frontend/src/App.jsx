import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import AdminDashboard from './pages/SuperAdmin/AdminDashboard'
import FacultyDashboard from './pages/FacultyAdmin/FacultyDashboard'
import OrmawaDashboard from './pages/OrmawaAdmin/OrmawaDashboard'
import StudentDashboard from './pages/Student/StudentDashboard'
import './index.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route ke Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Halaman Super Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Halaman Faculty Dashboard */}
        <Route path="/faculty" element={<FacultyDashboard />} />

        {/* Halaman Ormawa Dashboard */}
        <Route path="/ormawa" element={<OrmawaDashboard />} />

        {/* Halaman Student Dashboard */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Redirect jika route tidak ditemukan */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App


