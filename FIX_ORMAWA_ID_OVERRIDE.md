# Fix OrmawaId Override untuk Super Admin

## Problem
Error `setUser is not a function` pada halaman ormawa di Super Admin.

## Solution
Gunakan utility `getOrmawaId()` yang check window global override terlebih dahulu sebelum fallback ke auth store.

## Files yang Sudah Fixed
✅ `frontend/src/utils/getOrmawaId.js` - Utility function dibuat
✅ `frontend/src/pages/OrmawaAdmin/AnggotaManagement.jsx` - Updated
✅ `frontend/src/pages/OrmawaAdmin/StrukturOrganisasi.jsx` - Updated

## Files yang Perlu Fixed (TODO)
Ganti pattern berikut di setiap file:

**BEFORE:**
```js
const ormawaId = useAuthStore.getState()?.user?.ormawa_id || useAuthStore.getState()?.user?.OrmawaID || useAuthStore.getState()?.mahasiswa?.ormawaId || 1
```

**AFTER:**
```js
// 1. Import utility
import { getOrmawaId } from '../../utils/getOrmawaId'

// 2. Gunakan utility
const ormawaId = getOrmawaId()
```

### List Files:
1. ✅ `frontend/src/pages/OrmawaAdmin/AnggotaManagement.jsx`
2. ✅ `frontend/src/pages/OrmawaAdmin/StrukturOrganisasi.jsx`
3. ⏳ `frontend/src/pages/OrmawaAdmin/Settings.jsx`
4. ⏳ `frontend/src/pages/OrmawaAdmin/OrmawaDashboard.jsx`
5. ⏳ `frontend/src/pages/OrmawaAdmin/AbsensiKegiatan.jsx`
6. ⏳ `frontend/src/pages/OrmawaAdmin/ProposalManagement.jsx`
7. ⏳ `frontend/src/pages/OrmawaAdmin/JadwalKegiatan.jsx`
8. ⏳ `frontend/src/pages/OrmawaAdmin/KeuanganKas.jsx`
9. ⏳ `frontend/src/pages/OrmawaAdmin/LpjManagement.jsx`
10. ⏳ `frontend/src/pages/OrmawaAdmin/Pengumuman.jsx`
11. ⏳ `frontend/src/pages/OrmawaAdmin/AspirationManagement.jsx`
12. ⏳ `frontend/src/pages/OrmawaAdmin/StaffManagement.jsx`

## Manual Fix Steps
Untuk setiap file di atas:

1. Add import:
```js
import { getOrmawaId } from '../../utils/getOrmawaId'
```

2. Replace ormawaId line:
```js
const ormawaId = getOrmawaId()
```

3. Save file

## Progress: 2/12 files (17%)
