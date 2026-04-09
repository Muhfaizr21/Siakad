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
