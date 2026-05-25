# 🧪 TESTING GUIDE - TINDAK LANJUT (REFERRAL) FEATURE

## Quick Start Testing

### 1. WEB PLATFORM - Form Submission Test

#### Test Case 1: Valid Referral Creation
```
Steps:
1. Go to Psychologist Dashboard → Tindak Lanjut
2. Click "Buat Rujukan Baru" button
3. Fill form:
   - Pilih Pasien: Select any student
   - Tipe Rujukan: Select "Medis" or "Akademik"
   - Alasan Rujukan: Type "Pasien memerlukan konsultasi medis"
   - Pihak Tujuan: Type "Klinik Kesehatan Universitas"
   - Email Tujuan: Type "klinik@univ.ac.id"
4. Click "Buat Rujukan" button

Expected Result:
✅ Success message: "Surat rujukan berhasil dibuat"
✅ Modal closes
✅ Referral appears in list with "Menunggu Pengiriman" status
✅ Status badge shows INDIGO color (not blue)
```

#### Test Case 2: Form Validation - Missing Pasien
```
Steps:
1. Go to Tindak Lanjut → Click "Buat Rujukan Baru"
2. Leave "Pilih Pasien" empty
3. Fill other fields
4. Click "Buat Rujukan"

Expected Result:
❌ Error message: "Pilih pasien terlebih dahulu"
❌ Form stays open
❌ No referral created
```

#### Test Case 3: Form Validation - Invalid Email
```
Steps:
1. Go to Tindak Lanjut → Click "Buat Rujukan Baru"
2. Fill all fields
3. Email Tujuan: Type "invalid-email" (without @)
4. Click "Buat Rujukan"

Expected Result:
❌ Error message: "Format email tidak valid"
❌ Form stays open
❌ No referral created
```

#### Test Case 4: Form Validation - Empty Alasan
```
Steps:
1. Go to Tindak Lanjut → Click "Buat Rujukan Baru"
2. Leave "Alasan Rujukan" empty
3. Fill other fields
4. Click "Buat Rujukan"

Expected Result:
❌ Error message: "Alasan rujukan tidak boleh kosong"
❌ Form stays open
❌ No referral created
```

#### Test Case 5: Color Scheme Verification
```
Steps:
1. Create a referral (Test Case 1)
2. Look at the referral in the list
3. Check the status badge color

Expected Result:
✅ "Menunggu Pengiriman" (Pending) = AMBER color
✅ "Sudah Dikirim" (Sent) = INDIGO color (#4F46E5)
✅ "Sudah Diterima" (Received) = GREEN color
```

---

### 2. WEB PLATFORM - Referral Management Test

#### Test Case 6: Send Referral
```
Steps:
1. Create a referral (Test Case 1)
2. In the referral list, click the SEND button (paper plane icon)
3. Confirm action

Expected Result:
✅ Status changes from "Menunggu Pengiriman" to "Sudah Dikirim"
✅ Status badge color changes to INDIGO
✅ Success message: "Surat rujukan berhasil dikirim"
✅ SEND button disappears
✅ CONFIRM RECEIVED button appears
```

#### Test Case 7: Confirm Received
```
Steps:
1. Send a referral (Test Case 6)
2. Click the CONFIRM RECEIVED button (check circle icon)
3. Confirm action

Expected Result:
✅ Status changes from "Sudah Dikirim" to "Sudah Diterima"
✅ Status badge color changes to GREEN
✅ Success message: "Penerimaan surat rujukan dikonfirmasi"
✅ CONFIRM RECEIVED button disappears
```

#### Test Case 8: Filter by Status
```
Steps:
1. Create multiple referrals with different statuses
2. Click status filter buttons: "Semua", "Pending", "Sent", "Received"

Expected Result:
✅ List filters correctly by status
✅ Count updates accordingly
✅ Active filter button shows indigo background
```

---

### 3. MOBILE PLATFORM - Color Consistency Test

#### Test Case 9: Mobile Color Scheme
```
Steps:
1. Open Mobile app → Counseling → Tindak Lanjut
2. Create a referral
3. Check the status badge color

Expected Result:
✅ "Menunggu Pengiriman" (Pending) = AMBER color
✅ "Sudah Dikirim" (Sent) = INDIGO color (AppColors.primary)
✅ "Sudah Diterima" (Received) = GREEN color
✅ Colors match web platform exactly
```

#### Test Case 10: Mobile Form Submission
```
Steps:
1. Open Mobile app → Counseling → Tindak Lanjut
2. Click "Buat Surat Rujukan Baru"
3. Fill form with valid data
4. Click "Kirim"

Expected Result:
✅ Referral created successfully
✅ Status shows "Menunggu Pengiriman"
✅ Referral appears in list
```

---

### 4. BACKEND API TEST

#### Test Case 11: API - Valid Request
```
Endpoint: POST /api/psychologist/referrals
Headers: Authorization: Bearer <token>
Body:
{
  "mahasiswa_id": 1,
  "tipe": "Medis",
  "alasan": "Pasien memerlukan konsultasi medis",
  "pihak_tujuan": "Klinik Kesehatan",
  "email_tujuan": "klinik@univ.ac.id"
}

Expected Result:
✅ Status: 200 OK
✅ Response:
{
  "id": "uuid",
  "status": "Pending",
  "surat_rujukan_url": "/uploads/referrals/...",
  "tanggal_dibuat": "2026-05-26T14:30:00Z"
}
```

#### Test Case 12: API - Missing mahasiswa_id
```
Endpoint: POST /api/psychologist/referrals
Body:
{
  "mahasiswa_id": 0,
  "tipe": "Medis",
  "alasan": "...",
  "pihak_tujuan": "...",
  "email_tujuan": "..."
}

Expected Result:
❌ Status: 400 Bad Request
❌ Response: "mahasiswa_id harus diisi dan valid"
```

#### Test Case 13: API - Invalid Tipe
```
Endpoint: POST /api/psychologist/referrals
Body:
{
  "mahasiswa_id": 1,
  "tipe": "Invalid",
  "alasan": "...",
  "pihak_tujuan": "...",
  "email_tujuan": "..."
}

Expected Result:
❌ Status: 400 Bad Request
❌ Response: "Tipe harus 'Medis' atau 'Akademik'"
```

#### Test Case 14: API - Non-existent Mahasiswa
```
Endpoint: POST /api/psychologist/referrals
Body:
{
  "mahasiswa_id": 99999,
  "tipe": "Medis",
  "alasan": "...",
  "pihak_tujuan": "...",
  "email_tujuan": "..."
}

Expected Result:
❌ Status: 404 Not Found
❌ Response: "Mahasiswa tidak ditemukan"
```

#### Test Case 15: API - Send Referral
```
Endpoint: POST /api/psychologist/referrals/{id}/send
Headers: Authorization: Bearer <token>

Expected Result:
✅ Status: 200 OK
✅ Response:
{
  "id": "uuid",
  "status": "Sent",
  "tanggal_dikirim": "2026-05-26T14:35:00Z"
}
```

---

### 5. NOTIFICATION TEST

#### Test Case 16: Notification on Referral Creation
```
Steps:
1. Create a referral via web
2. Check student's notification center in mobile app

Expected Result:
✅ Student receives notification:
   - Title: "Surat Rujukan Dibuat"
   - Content: "Psikolog [nama] telah membuat surat rujukan [tipe] untuk Anda"
```

#### Test Case 17: Notification on Referral Sent
```
Steps:
1. Create a referral
2. Send the referral
3. Check student's notification center

Expected Result:
✅ Student receives notification about referral being sent
```

---

## 🐛 DEBUGGING TIPS

### If Form Submission Fails (400 Error)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to create referral
4. Click on the failed request
5. Check Response tab for error message
6. Common issues:
   - mahasiswa_id not selected
   - mahasiswa_id is 0 or invalid
   - Email format invalid
   - Required fields empty

### If Colors Don't Match
1. Check if you're using the latest build
2. Clear browser cache (Ctrl+Shift+Delete)
3. Rebuild web: `npm run build`
4. Rebuild mobile: `flutter clean && flutter build apk`

### If Referral Doesn't Appear in List
1. Check if referral was actually created (check API response)
2. Refresh the page (F5)
3. Check browser console for errors
4. Verify you're logged in as the correct psychologist

---

## ✅ SIGN-OFF CHECKLIST

After testing, verify:
- [ ] Web form validation works for all cases
- [ ] Mobile and web colors are consistent (indigo for "Sent")
- [ ] Referral creation succeeds with valid data
- [ ] Referral status transitions work correctly
- [ ] API returns proper error messages
- [ ] Notifications are sent to students
- [ ] All builds compile without errors
- [ ] No console errors in browser DevTools

---

## 📞 SUPPORT

If you encounter issues:
1. Check the error message carefully
2. Review the FIXES_APPLIED_26_MEI_2026.md document
3. Check browser console (F12) for detailed errors
4. Verify backend is running: `go run main.go`
5. Verify frontend is running: `npm run dev`

---

**Last Updated**: 26 Mei 2026

