const AUTH_STORAGE_KEY = 'siakad_auth';

export const apiBaseUrl = 'http://localhost:8000';

export function saveSession(payload) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function getSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    // TEMPORARY BYPASS FOR SUPER ADMIN ACCESS
    return {
      token: 'bypass_token',
      user: {
        id: 1,
        email: 'admin@siakad.com',
        role: 'SuperAdmin'
      }
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
  return true; // TEMPORARY BYPASS
}

export function hasRole(allowedRoles = []) {
  const session = getSession();
  const userRole = session?.user?.role;
  if (!userRole) return false;
  
  // Handle case insensitive match for roles
  return allowedRoles.some(r => r.toLowerCase() === userRole.toLowerCase());
}

export function getDefaultRouteByRole(role) {
  const r = role?.toLowerCase() || '';
  if (r.includes('student')) return '/student';
  if (r.includes('super')) return '/admin';
  if (r.includes('faculty')) return '/faculty';
  if (r.includes('ormawa')) return '/ormawa';
  return '/login';
}
