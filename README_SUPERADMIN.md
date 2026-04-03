# 👑 MASTER DIAGRAM SUPER ADMIN: 1000% SUPER GRANULAR & INTERKONEKSI
_Edisi Definitif: Menitikberatkan Hukum Sebab-Akibat (Domino Effect) Super Admin terhadap Seluruh Universitas._

Di dalam arsitektur BKU Student Hub, Super Admin bukanlah modul yang berdiri sendiri. Setiap *klik* yang dilakukan oleh Super Admin memicu **Efek Domino Absolut** yang seketika merubah nasib dan hak jalan bagi **Admin Fakultas, Admin Ormawa, dan Jutaan Mahasiswa**. 

Berikut adalah penjabaran taktis dan rantai interkoneksi fitur (Hukum Sebab-Akibat).

---

## 🏛️ 1. MODUL THE TIME-GATE (KENDALI PORTAL WAKTU)
Super Admin mendikte flow kalender akademik yang menghidupkan dan mematikan sistem secara massal lintas _role_.

* **Aksi: Set "Tahun Akademik" Baru Menjadi ACTIVE**
  * 🗂️ **Dampak pada Admin Fakultas:** Tiba-tiba halaman Dashboard mereka bersih (Tahun ajaran baru). Mereka baru diizinkan untuk mulai memplot Dosen dan Jadwal Kelas untuk semester yang aktif tersebut. Jika SA belum mengaktifkan, Admin Fakultas akan menemui layar "Menunggu Inisiasi Pusat".
  * 🎓 **Dampak pada Mahasiswa:** Riwayat KRS lama dibekukan, SKS kumulatif dievaluasi, dan mereka di-reset menghadapi IP (Indeks Prestasi) teranyar.
* **Aksi: Toggle "Masa KRS War" (Buka/Tutup Input Kelas)**
  * 🎓 **Dampak pada Mahasiswa:** Saat `Toggle = ON`, tombol "Pilih Kelas" muncul di semua dashboard *Student*. Mereka bisa menambah/drop kelas dengan sisa saldo SKS. Saat `Toggle = OFF` oleh SA, tombol tersebut hilang permanen di seluruh *device* mahasiswa seketika. KRS mereka *Locked*.
  * 🏢 **Dampak pada Fakultas & Dosen:** Ketika KRS *Locked*, ini adalah "Lampu Hijau" bagi DPA (Dosen) untuk memvalidasi/mengesahkan daftar mahasiswa fiks, dan kelas resmi dimulai perkuliahannya.

---

## 💸 2. MODUL THE TREASURY (EKSEKUSI API INVOICE KEUANGAN)
Urat nadi operasional. Kontrol 1 pintu sebelum birokrasi apapun berjalan.

* **Aksi: Eksekusi "Generate Bank Invoices (UKT)" secara Batch**
  * 🎓 **Dampak pada Mahasiswa:** Sekali SA menekan, seluruh dashboard Mahasiswa muncul *Banner Merah (UNPAID)* berisi Virtual Account Tagihan Semester berjalan!
  * 🔒 **Logika Kunci Keterhubungan (Financial Blocker):** Karena status mahasiswa "UNPAID", sistem akan memblokir otomatis tombol pengambilan KRS dan request cetak Transkrip! Mahasiswa tidak bisa ikut kuliah tahun ini sebelum melunasi atau meminta keringanan.
* **Aksi: Eksekusi "Input Beasiswa / Tagihan Eksepsi (Dispensasi)"**
  * 🎓 **Dampak pada Mahasiswa yang dituju:** Status merah (UNPAID) mereka langsung di-Bypass oleh Pusat menjadi `Exempted/Lunas (Subsidi)`. *Financial blocker* terlepas, KRS bisa diakses kembali.

---

## 🏭 3. MODUL INFRASTRUKTUR MASTER (PENCIPTAAN ALAM SEMESTA)
Sebelum fakultas atau UKM memiliki identitas, SA harus mendeklarasikan cangkangnya (_Blueprint Declaration_).

* **Aksi: Create "Gedung Pusat & Ruangan" (Kapasitas Absolut)**
  * 🗂️ **Dampak pada Admin Fakultas:** Admin Fakultas **HANYA BISA** meraba jadwal kelas berdasarkan daftar Ruangan yang diizinkan Super Admin. 
  * 🛡️ **Pencegahan Fraud:** SA menset "*Ruangan Lab A berkapsitas 40 Orang*". Ketika Mahasiswa rebutan kelas (*KRS War*), pendaftar ke-41 dan seterusnya otomatis di-*Reject* API, dan Admin Fakultas **mustahil** memaksakan anak titipan (menjadi 45 pendaftar), karena API *Level Ruangan Pusat* menolaknya.
* **Aksi: Create "Kode Fakultas & Dekan"**
  * 🗂️ **Dampak pada Fakultas:** Akun Dosen yang di-assign oleh SA sebagai `FACULTY ADMIN_ID` otomatis berubah halaman *landing*-nya menjadi *Dashboard Fakultas*. Tanpa ini, fakultas tidak pernah ada (Data Jurusan Void).

---

## ⛺ 4. MODUL REGULASI MAHASISWA & ORMAWA (EXTRACURRICULAR HUB)
Super Admin menentukan legitimasi organisasi kampus. Tanpanya, Ormawa berstatus ilegal/tidak bisa mendanai kegiatan.

* **Aksi: Mengesahkan Entitas "Nama Ormawa" & Assign "Ketua BEM/UKM"**
  * ⛺ **Dampak pada Ormawa Admin:** Jika UKM sudah di-Approve SA, maka Ketua terkait mendapatkan otoritas untuk login sebagai `Ormawa Admin`. Ketua UKM baru mendapatkan akses melihat Form Pengajuan E-Proposal Acara (Dana Kemahasiswaan).
  * 🎓 **Dampak pada Mahasiswa Eksternal:** Munculnya logo UKM tersebut di *Student Life Catalog* mereka, dan tombol "Klik Daftar Menjadi Anggota" (*Open-Recruitment*) baru bisa diklik.
* **Aksi: Menyetujui "E-Proposal Akhir" & Distribusi Plafon Anggaran**
  * ⛺ **Dampak Interkoneksi Berantai:** Ormawa Submit Draft Proposal ➔ Pembina (*Dosen*) ACC Tahap 1 ➔ Admin Fakultas kemahasiswaan cek/ACC Tahap 2 ➔ Akhirnya proposal tiba di Tangan `SUPER ADMIN` untuk pelepasan plafon kas rekening Universitas. Keputusan akhir mutlak ada di tombol ini. Ulangi siklus ini jika ditolak *(Revise)*.

---

## 👁️ 5. MODUL THE PANOPTICON (IMMUTABLE LOG & BYPASS OVERRIDE)
Pengamanan tertinggi yang melindungi seluruh kampus dari rekayasa birokrasi dan rekayasa nilai kelulusan.

* **Aksi: Super Monitoring "Before vs After Log Analyzer"**
  * 🗂️ **Dampak Pelacakan Admin Fakultas/Dosen:** Sistem menyimpan riwayat saat Admin Fakultas atau Dosen mencoba mengubah KHS Mahasiswa X dari `C` menjadi `A`. 
  * ⚡ **Dampak Hukum Sebab-Akibat:** Jika SA menemukan anomali "Modifikasi SKS Ghaib" jam 3 pagi, SA bisa langsung meng-klik opsi "Revert to Previous Data" dari Log, nilai Mahasiswa akan turun lagi jadi `C`, dan SA menjatuhkan "Kill Switch" ke akun Admin Fakultas yang curang tersebut tanpa peringatan.
* **Aksi: Tombol "Force Re-Enroll" & "Bypass Recovery" Mahasiswa**
  * 🎓 **Penghancur Birokrasi Demi Penyelamatan:** Dosen mungkin lupa memberikan acc KRS sampai batas akhir, membuat status Mahasiswa A *Gagal KRS (Void)*. Super Admin dapat *"Bypass"* menginjeksikan data KRS Mahasiswa ke sistem, menerobos portal masa KRS yang sudah tutup, menyelamatkan karir studi Mahasiswa tersebut dari Drop-Out administratif.
* **Aksi: Global Push Notification Bar**
  * 📣 **Dampak Multiverse:** SA mengetikkan teks `Beserta edaran rektorat, KRS diperpanjang 2 Hari`. Begitu SA menekan Enter, **[BAR MERAH GLOBLAL]** langsung terlintang di bagian atas Layar Dosen yang sedang input nilai riil-time, di layar Ormawa yang sedang baca proposal, dan ratusan layar Mahasiswa yang cemas menatap HP mereka.

***
**AUDIT SELESAI**: Inilah interkoneksi 1000% sebenarnya. Modul Super Admin **BUKANLAH TEMPAT BEKERJA STANDAR**. Ia diciptakan sebagai *Core Engine Room* (Ruang Mesin Kendali) di mana setiap jentikan tombol berdampak mutlak, merubah flow, mengunci layar, mencairkan dana, dan menghidupkan periode akademis di hadapan ribuan pengguna pada 3 tingkat _role_ di bawahnya (Fakultas, Ormawa, dan Student)!
