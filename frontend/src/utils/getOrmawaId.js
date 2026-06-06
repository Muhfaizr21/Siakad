import useAuthStore from '../store/useAuthStore'

/**
 * Get ormawa ID dengan priority:
 * 1. Super Admin override (dari window global)
 * 2. User ormawa_id dari auth store
 * 3. Fallback ke 1
 */
export function getOrmawaId() {
  // Check Super Admin override first
  if (window.__SUPER_ADMIN_ORMAWA_ID_OVERRIDE__) {
    return window.__SUPER_ADMIN_ORMAWA_ID_OVERRIDE__
  }
  
  // Fallback to auth store
  const state = useAuthStore.getState()
  return (
    state?.user?.ormawa_id ||
    state?.user?.OrmawaID ||
    state?.mahasiswa?.ormawaId ||
    state?.mahasiswa?.OrmawaID ||
    state?.mahasiswa?.ID ||
    1
  )
}
