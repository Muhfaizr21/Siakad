export const API_BASE_URL = 'http://localhost:8000/api';
import useAuthStore from '../store/useAuthStore';

export const handleResponse = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { message: `Gagal memproses respon server (${res.status}). Pastikan backend berjalan.` };
  }
  
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
};

export const getAuthToken = () => {
  // 1. Try Zustand store state (memory)
  let token = useAuthStore.getState().accessToken;
  if (token) return token;

  // 2. Try Zustand persisted state (localStorage)
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      token = parsed?.state?.accessToken;
      if (token) return token;
    }
  } catch (e) {
    console.warn("Failed to parse auth-storage:", e);
  }
  
  // 3. Last resort fallbacks
  return localStorage.getItem('token') || localStorage.getItem('access_token') || null;
};

export const fetchWithAuth = (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    console.error(`Attempted fetchWithAuth to ${url} but NO TOKEN was found. This will likely result in a 401.`);
  }

  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  return fetch(url, { ...options, headers }).then(handleResponse);
};

export const ormawaService = {
  // Stats & Dashboard
  getStats: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/stats?ormawaId=${id}`),
  getEvents: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/events?ormawaId=${id}`),
  createEvent: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateEvent: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteEvent: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/events/${id}`, {
    method: 'DELETE'
  }),
  
  // Membership & Staff
  getMembers: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/members?ormawaId=${id}`),
  updateMember: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteMember: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/members/${id}`, {
    method: 'DELETE'
  }),
  addMember: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Supporting Data
  getDivisions: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/divisions?ormawaId=${id}`),
  getAllStudents: () => fetchWithAuth(`${API_BASE_URL}/ormawa/students`),

  // Proposals
  getProposals: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/proposals?ormawaId=${id}`),
  getProposalHistory: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/proposals/${id}/history`),
  createProposal: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateProposal: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/proposals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteProposal: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/proposals/${id}`, {
    method: 'DELETE'
  }),

  // Finance
  getFinancials: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/kas?ormawaId=${id}`),
  addTransaction: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/kas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // LPJ
  getLpjs: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/lpjs?ormawaId=${id}`),
  createLpj: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/lpjs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateLpj: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/lpjs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  uploadLpjDocument: (lpjId, formData) => fetchWithAuth(`${API_BASE_URL}/ormawa/lpjs/${lpjId}/documents`, {
    method: 'POST',
    body: formData
  }),
  deleteLpjDocument: (docId) => fetchWithAuth(`${API_BASE_URL}/ormawa/lpjs/documents/${docId}`, {
    method: 'DELETE'
  }),

  // Attendance
  getAttendance: (eventId) => fetchWithAuth(`${API_BASE_URL}/ormawa/attendance/${eventId}`),
  recordAttendance: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/absensi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Aspirations
  getAspirations: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/aspirations?ormawaId=${id}`),
  createAspiration: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/aspirations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Announcements & Notifications
  getAnnouncements: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/announcements?ormawaId=${id}`),
  createAnnouncement: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateAnnouncement: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/announcements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteAnnouncement: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/announcements/${id}`, {
    method: 'DELETE'
  }),
  getNotifications: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/notifications?ormawaId=${id}`),
  markAllNotifsRead: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/notifications/read-all?ormawaId=${id}`, {
    method: 'PUT'
  }),
  markNotifRead: (notifId) => fetchWithAuth(`${API_BASE_URL}/ormawa/notifications/${notifId}/read`, {
    method: 'PUT'
  }),
  deleteNotif: (notifId) => fetchWithAuth(`${API_BASE_URL}/ormawa/notifications/${notifId}`, {
    method: 'DELETE'
  }),

  // Roles & Permissions
  getRoles: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/roles?ormawaId=${id}`),
  createRole: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateRole: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteRole: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/roles/${id}`, {
    method: 'DELETE'
  }),

  // Settings
  getSettings: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/settings/${id}`),
  updateSettings: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/settings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // File Upload
  uploadFile: (formData) => fetchWithAuth(`${API_BASE_URL}/ormawa/upload`, {
    method: 'POST',
    body: formData
  }),

  // KENCANA (PKKMB)
  getKencanaSummary: () => fetchWithAuth(`${API_BASE_URL}/ormawa/kencana/ringkasan`),
  getKencanaStudents: () => fetchWithAuth(`${API_BASE_URL}/ormawa/kencana/peserta`),
  getKencanaEvents: () => fetchWithAuth(`${API_BASE_URL}/ormawa/kencana/kegiatan`),
  createKencanaEvent: (data) => fetchWithAuth(`${API_BASE_URL}/ormawa/kencana/kegiatan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateKencanaEvent: (id, data) => fetchWithAuth(`${API_BASE_URL}/ormawa/kencana/kegiatan/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteKencanaEvent: (id) => fetchWithAuth(`${API_BASE_URL}/ormawa/kencana/kegiatan/${id}`, {
    method: 'DELETE'
  }),
};

export const fakultasService = {
  getAll: () => fetchWithAuth(`${API_BASE_URL}/admin/fakultas`),
  create: (data) => fetchWithAuth(`${API_BASE_URL}/admin/fakultas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/fakultas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchWithAuth(`${API_BASE_URL}/admin/fakultas/${id}`, {
    method: 'DELETE'
  }),
};

export const adminService = {
  getStats: () => fetchWithAuth(`${API_BASE_URL}/admin/stats`),
  getAuditLogs: () => fetchWithAuth(`${API_BASE_URL}/admin/audit-logs`),
  getAllFaculties: () => fetchWithAuth(`${API_BASE_URL}/admin/fakultas`),
  getAllStudents: () => fetchWithAuth(`${API_BASE_URL}/admin/students`),
  createStudent: (data) => fetchWithAuth(`${API_BASE_URL}/admin/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateStudent: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteStudent: (id) => fetchWithAuth(`${API_BASE_URL}/admin/students/${id}`, {
    method: 'DELETE'
  }),
  getAllProdi: () => fetchWithAuth(`${API_BASE_URL}/admin/prodi`),
  createProdi: (data) => fetchWithAuth(`${API_BASE_URL}/admin/prodi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateProdi: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/prodi/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteProdi: (id) => fetchWithAuth(`${API_BASE_URL}/admin/prodi/${id}`, {
    method: 'DELETE'
  }),
  getAllLecturers: () => fetchWithAuth(`${API_BASE_URL}/admin/lecturers`),
  createLecturer: (data) => fetchWithAuth(`${API_BASE_URL}/admin/lecturers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateLecturer: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/lecturers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteLecturer: (id) => fetchWithAuth(`${API_BASE_URL}/admin/lecturers/${id}`, {
    method: 'DELETE'
  }),
  getAllOrmawa: () => fetchWithAuth(`${API_BASE_URL}/admin/ormawa`),
  createOrmawa: (data) => fetchWithAuth(`${API_BASE_URL}/admin/ormawa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateOrmawa: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/ormawa/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteOrmawa: (id) => fetchWithAuth(`${API_BASE_URL}/admin/ormawa/${id}`, {
    method: 'DELETE'
  }),
  getGlobalAspirations: () => fetchWithAuth(`${API_BASE_URL}/admin/aspirations`),
  getGlobalProposals: () => fetchWithAuth(`${API_BASE_URL}/admin/proposals`),
  approveProposal: (id) => fetchWithAuth(`${API_BASE_URL}/admin/proposals/${id}/approve`, {
    method: 'PUT'
  }),
  rejectProposal: (id, nota) => fetchWithAuth(`${API_BASE_URL}/admin/proposals/${id}/reject`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catatan: nota })
  }),
  getAllScholarships: () => fetchWithAuth(`${API_BASE_URL}/admin/scholarships`),
  createScholarship: (data) => fetchWithAuth(`${API_BASE_URL}/admin/scholarships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateScholarship: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/scholarships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteScholarship: (id) => fetchWithAuth(`${API_BASE_URL}/admin/scholarships/${id}`, {
    method: 'DELETE'
  }),
  getAllCounseling: () => fetchWithAuth(`${API_BASE_URL}/admin/counseling-records`),
  createCounseling: (data) => fetchWithAuth(`${API_BASE_URL}/admin/counseling-records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateCounseling: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/counseling-records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteCounseling: (id) => fetchWithAuth(`${API_BASE_URL}/admin/counseling-records/${id}`, {
    method: 'DELETE'
  }),
  getAllUsers: () => fetchWithAuth(`${API_BASE_URL}/admin/users`),
  createUser: (data) => fetchWithAuth(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateUserRole: (data) => fetchWithAuth(`${API_BASE_URL}/admin/users/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteUser: (id) => fetchWithAuth(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE'
  }),
  getAllNews: () => fetchWithAuth(`${API_BASE_URL}/admin/news`),
  createNews: (data) => fetchWithAuth(`${API_BASE_URL}/admin/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateNews: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteNews: (id) => fetchWithAuth(`${API_BASE_URL}/admin/news/${id}`, {
    method: 'DELETE'
  }),

  // Faculty CRUD (missing - added now)
  createFaculty: (data) => fetchWithAuth(`${API_BASE_URL}/admin/fakultas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateFaculty: (id, data) => fetchWithAuth(`${API_BASE_URL}/admin/fakultas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteFaculty: (id) => fetchWithAuth(`${API_BASE_URL}/admin/fakultas/${id}`, {
    method: 'DELETE'
  }),
};


