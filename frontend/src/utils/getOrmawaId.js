import useAuthStore from '../store/useAuthStore'

export function getOrmawaId() {
  if (window.__SUPER_ADMIN_ORMAWA_ID_OVERRIDE__) {
    return window.__SUPER_ADMIN_ORMAWA_ID_OVERRIDE__
  }

  const state = useAuthStore.getState()
  const ormawaId = (
    state?.user?.ormawa_id ||
    state?.user?.OrmawaID ||
    null
  )
  if (!ormawaId) {
    console.warn('[getOrmawaId] No ormawa ID found in auth store')
  }
  return ormawaId
}
