const API_BASE_URL = 'http://localhost:8000/api';

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({ message: 'Gagal memproses respon server.' }));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

export const ormawaService = {
  // Stats & Dashboard
  getStats: (id) => fetch(`${API_BASE_URL}/ormawa/stats?ormawaId=${id}`).then(handleResponse),
  getEvents: (id) => fetch(`${API_BASE_URL}/ormawa/events?ormawaId=${id}`).then(handleResponse),
  createEvent: (data) => fetch(`${API_BASE_URL}/ormawa/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateEvent: (id, data) => fetch(`${API_BASE_URL}/ormawa/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteEvent: (id) => fetch(`${API_BASE_URL}/ormawa/events/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  
  // Membership & Staff
  getMembers: (id) => fetch(`${API_BASE_URL}/ormawa/members?ormawaId=${id}`).then(handleResponse),
  updateMember: (id, data) => fetch(`${API_BASE_URL}/ormawa/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteMember: (id) => fetch(`${API_BASE_URL}/ormawa/members/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  addMember: (data) => fetch(`${API_BASE_URL}/ormawa/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Supporting Data
  getDivisions: (id) => fetch(`${API_BASE_URL}/ormawa/divisions?ormawaId=${id}`).then(handleResponse),
  getAllStudents: () => fetch(`${API_BASE_URL}/ormawa/students`).then(handleResponse),

  // Proposals
  getProposals: (id) => fetch(`${API_BASE_URL}/ormawa/proposals?ormawaId=${id}`).then(handleResponse),
  getProposalHistory: (id) => fetch(`${API_BASE_URL}/ormawa/proposals/${id}/history`).then(handleResponse),
  createProposal: (data) => fetch(`${API_BASE_URL}/ormawa/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateProposal: (id, data) => fetch(`${API_BASE_URL}/ormawa/proposals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteProposal: (id) => fetch(`${API_BASE_URL}/ormawa/proposals/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Finance
  getFinancials: (id) => fetch(`${API_BASE_URL}/ormawa/kas?ormawaId=${id}`).then(handleResponse),
  addTransaction: (data) => fetch(`${API_BASE_URL}/ormawa/kas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // LPJ
  getLpjs: (id) => fetch(`${API_BASE_URL}/ormawa/lpjs?ormawaId=${id}`).then(handleResponse),
  createLpj: (data) => fetch(`${API_BASE_URL}/ormawa/lpjs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateLpj: (id, data) => fetch(`${API_BASE_URL}/ormawa/lpjs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  uploadLpjDocument: (lpjId, formData) => fetch(`${API_BASE_URL}/ormawa/lpjs/${lpjId}/documents`, {
    method: 'POST',
    body: formData
  }).then(handleResponse),
  deleteLpjDocument: (docId) => fetch(`${API_BASE_URL}/ormawa/lpjs/documents/${docId}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Attendance
  getAttendance: (eventId) => fetch(`${API_BASE_URL}/ormawa/attendance/${eventId}`).then(handleResponse),
  recordAttendance: (data) => fetch(`${API_BASE_URL}/ormawa/absensi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Aspirations
  getAspirations: (id) => fetch(`${API_BASE_URL}/ormawa/aspirations?ormawaId=${id}`).then(handleResponse),
  createAspiration: (data) => fetch(`${API_BASE_URL}/ormawa/aspirations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Announcements & Notifications
  getAnnouncements: (id) => fetch(`${API_BASE_URL}/ormawa/announcements?ormawaId=${id}`).then(handleResponse),
  createAnnouncement: (data) => fetch(`${API_BASE_URL}/ormawa/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateAnnouncement: (id, data) => fetch(`${API_BASE_URL}/ormawa/announcements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteAnnouncement: (id) => fetch(`${API_BASE_URL}/ormawa/announcements/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),
  getNotifications: (id) => fetch(`${API_BASE_URL}/ormawa/notifications?ormawaId=${id}`).then(handleResponse),
  markAllNotifsRead: (id) => fetch(`${API_BASE_URL}/ormawa/notifications/read-all?ormawaId=${id}`, {
    method: 'PUT'
  }).then(handleResponse),
  markNotifRead: (notifId) => fetch(`${API_BASE_URL}/ormawa/notifications/${notifId}/read`, {
    method: 'PUT'
  }).then(handleResponse),
  deleteNotif: (notifId) => fetch(`${API_BASE_URL}/ormawa/notifications/${notifId}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Roles & Permissions
  getRoles: (id) => fetch(`${API_BASE_URL}/ormawa/roles?ormawaId=${id}`).then(handleResponse),
  createRole: (data) => fetch(`${API_BASE_URL}/ormawa/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateRole: (id, data) => fetch(`${API_BASE_URL}/ormawa/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteRole: (id) => fetch(`${API_BASE_URL}/ormawa/roles/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Settings
  getSettings: (id) => fetch(`${API_BASE_URL}/ormawa/settings/${id}`).then(handleResponse),
  updateSettings: (id, data) => fetch(`${API_BASE_URL}/ormawa/settings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // File Upload
  uploadFile: (formData) => fetch(`${API_BASE_URL}/ormawa/upload`, {
    method: 'POST',
    body: formData
  }).then(handleResponse),
};

export const fakultasService = {
  getAll: () => fetch(`${API_BASE_URL}/admin/fakultas`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  create: (data) => fetch(`${API_BASE_URL}/admin/fakultas`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  update: (id, data) => fetch(`${API_BASE_URL}/admin/fakultas/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  delete: (id) => fetch(`${API_BASE_URL}/admin/fakultas/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
};

export const adminService = {
  getStats: () => fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAuditLogs: () => fetch(`${API_BASE_URL}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllFaculties: () => fetch(`${API_BASE_URL}/admin/fakultas`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllStudents: () => fetch(`${API_BASE_URL}/admin/students`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  createStudent: (data) => fetch(`${API_BASE_URL}/admin/students`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateStudent: (id, data) => fetch(`${API_BASE_URL}/admin/students/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteStudent: (id) => fetch(`${API_BASE_URL}/admin/students/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllProdi: () => fetch(`${API_BASE_URL}/admin/prodi`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  createProdi: (data) => fetch(`${API_BASE_URL}/admin/prodi`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateProdi: (id, data) => fetch(`${API_BASE_URL}/admin/prodi/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteProdi: (id) => fetch(`${API_BASE_URL}/admin/prodi/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllLecturers: () => fetch(`${API_BASE_URL}/admin/lecturers`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  createLecturer: (data) => fetch(`${API_BASE_URL}/admin/lecturers`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateLecturer: (id, data) => fetch(`${API_BASE_URL}/admin/lecturers/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteLecturer: (id) => fetch(`${API_BASE_URL}/admin/lecturers/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllOrmawa: () => fetch(`${API_BASE_URL}/admin/ormawa`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  createOrmawa: (data) => fetch(`${API_BASE_URL}/admin/ormawa`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateOrmawa: (id, data) => fetch(`${API_BASE_URL}/admin/ormawa/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteOrmawa: (id) => fetch(`${API_BASE_URL}/admin/ormawa/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getGlobalAspirations: () => fetch(`${API_BASE_URL}/admin/aspirations`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getGlobalProposals: () => fetch(`${API_BASE_URL}/admin/proposals`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  approveProposal: (id) => fetch(`${API_BASE_URL}/admin/proposals/${id}/approve`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  rejectProposal: (id, nota) => fetch(`${API_BASE_URL}/admin/proposals/${id}/reject`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ catatan: nota })
  }).then(handleResponse),
  getAllScholarships: () => fetch(`${API_BASE_URL}/admin/scholarships`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  createScholarship: (data) => fetch(`${API_BASE_URL}/admin/scholarships`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateScholarship: (id, data) => fetch(`${API_BASE_URL}/admin/scholarships/${id}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteScholarship: (id) => fetch(`${API_BASE_URL}/admin/scholarships/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllCounseling: () => fetch(`${API_BASE_URL}/admin/counseling`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAllUsers: () => fetch(`${API_BASE_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  createUser: (data) => fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateUserRole: (data) => fetch(`${API_BASE_URL}/admin/users/role`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteUser: (id) => fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
  getAuditLogs: () => fetch(`${API_BASE_URL}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(handleResponse),
};
