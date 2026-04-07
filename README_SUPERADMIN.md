B Fitur Super Admin (Direktorat Kemahasiswaan) — Rincian Lengkap
Super Admin adalah pemegang otoritas tertinggi dalam sistem BKU Student Hub — diemban oleh staf Direktorat Kemahasiswaan yang ditunjuk secara resmi. Berbeda dari role lain yang bersifat operasional per-unit, Super Admin memiliki visibilitas dan kendali penuh lintas seluruh fakultas, seluruh organisasi, dan seluruh lapisan sistem. Setiap keputusan yang berdampak pada lebih dari satu unit atau menyangkut integritas data akan bermuara di sini. Panel Super Admin dirancang bukan untuk rutinitas harian, melainkan untuk tata kelola strategis, pengawasan sistem, dan akuntabilitas menyeluruh.
1. Dashboard Analitik Eksekutif
Halaman utama Super Admin bukan sekadar daftar notifikasi — melainkan pusat komando visual yang menampilkan kondisi seluruh sistem kemahasiswaan secara real-time. Tersedia stat card untuk: total tiket aspirasi aktif hari ini (dipisah per status: Baru, Diproses, Selesai), jumlah sesi konseling yang sedang berjalan bulan ini, total prestasi mahasiswa yang menunggu verifikasi di seluruh fakultas, jumlah proposal ORMAWA dalam antrian persetujuan, dan total anggota aktif lintas seluruh organisasi. Di bawah stat card, tersedia grafik tren mingguan dan bulanan yang menunjukkan volume permintaan layanan dari waktu ke waktu — berguna untuk mendeteksi lonjakan tidak normal atau penurunan pemanfaatan layanan. Semua data dapat difilter berdasarkan rentang waktu kustom dan per-fakultas untuk analisis yang lebih mendalam.
2. Manajemen Pengguna & Hak Akses (RBAC Engine)
Super Admin memegang kendali penuh atas seluruh struktur hak akses sistem melalui panel RBAC (Role-Based Access Control). Dari sini, Super Admin dapat mencari pengguna berdasarkan nama, NIM, atau email; menetapkan atau mencabut role siapa pun (Mahasiswa, Admin Fakultas, Admin ORMAWA, Super Admin); menentukan ruang lingkup akses Admin Fakultas ke fakultas mana saja; dan menonaktifkan akun yang tidak lagi aktif secara instan tanpa perlu menghapus datanya. Setiap perubahan role dicatat otomatis dalam log audit: siapa yang mengubah, akun siapa yang diubah, dari role apa ke role apa, dan kapan waktunya. Fitur ini menjamin tidak ada eskalasi hak akses yang tidak terotorisasi, dan memudahkan serah terima jabatan tanpa perlu campur tangan tim teknis.
3. Pusat Kendali Tiket Aspirasi Lintas Fakultas
Super Admin melihat semua tiket aspirasi dari seluruh fakultas dalam satu tampilan terpadu — sesuatu yang tidak bisa dilakukan Admin Fakultas mana pun. Tiket dapat difilter berdasarkan kombinasi kriteria: fakultas, status, kategori topik, prioritas, dan rentang waktu pengajuan. Untuk tiket yang eskalatif atau memerlukan tindakan Direktorat, Super Admin dapat mengambil alih penanganan langsung, mendelegasikan ulang ke Admin Fakultas lain, atau menambahkan catatan internal yang tidak terlihat oleh mahasiswa. Super Admin juga dapat menetapkan SLA (batas waktu penanganan) per kategori tiket dan menerima peringatan otomatis jika ada tiket yang melampaui SLA tanpa tindakan.
4. Approval Pipeline Proposal & Kegiatan ORMAWA
Super Admin menjadi titik persetujuan akhir dalam approval pipeline multi-tahap: Admin ORMAWA mengajukan → Admin Fakultas meninjau → Super Admin memutuskan final. Di panel ini, Super Admin melihat seluruh proposal dari semua organisasi dengan detail lengkap: nama kegiatan, tujuan, tanggal, lokasi, rencana anggaran, dan riwayat seluruh komentar dari tahap sebelumnya. Super Admin dapat menyetujui, meminta revisi dengan catatan spesifik, atau menolak dengan alasan resmi yang tersimpan permanen — semua tercatat dalam log audit yang tidak bisa dihapus. Selain itu, Super Admin dapat memantau statistik rasio persetujuan per organisasi dan per periode untuk evaluasi program kemahasiswaan.
5. Manajemen Konseling & Verifikasi Prestasi Lintas Fakultas
Super Admin dapat memantau seluruh aktivitas konseling dari semua fakultas: melihat rekap sesi per bulan, mengidentifikasi fakultas dengan tingkat permintaan konseling tertinggi, dan memastikan tidak ada mahasiswa yang permintaan konselingnya terbengkalai lebih dari batas waktu yang ditentukan. Untuk verifikasi prestasi, Super Admin melihat agregat data prestasi mahasiswa dari seluruh kampus — dapat difilter per jenis prestasi (akademik, olahraga, seni, teknologi), per tingkat (lokal, nasional, internasional), atau per fakultas — dan mengekspor hasilnya sebagai basis data prestasi resmi kampus yang siap digunakan untuk keperluan akreditasi BAN-PT.
6. Manajemen Pengumuman & Konten Portal
Super Admin mengelola seluruh konten informasi yang ditampilkan di portal kemahasiswaan. Pengumuman resmi dari Direktorat Kemahasiswaan — seperti jadwal registrasi, kebijakan baru, informasi beasiswa, atau pemberitahuan penting — dibuat dan diterbitkan dari panel ini. Setiap pengumuman dapat ditargetkan secara presisi: ke semua pengguna, ke mahasiswa saja, ke admin saja, ke satu fakultas tertentu, atau ke kelompok ORMAWA spesifik. Pengumuman dilengkapi pengaturan tanggal tayang dan tanggal kadaluarsa otomatis, prioritas tampilan (urgent / normal / informasi), dan penghitung pembaca real-time. Super Admin juga dapat menarik pengumuman yang sudah terbit kapan saja jika ada kesalahan informasi.
7. Audit Log & Rekam Jejak Aktivitas Sistem (Immutable)
Setiap aksi penting di dalam sistem dicatat secara otomatis dalam tabel audit_log yang bersifat append-only — tidak dapat diubah atau dihapus oleh siapa pun, termasuk Super Admin sendiri. Yang dicatat meliputi: login dan logout semua pengguna (beserta IP address dan perangkat), setiap perubahan status tiket, pergantian role pengguna, persetujuan dan penolakan proposal, akses ke data mahasiswa, perubahan pengaturan sistem, dan setiap ekspor data. Super Admin dapat mencari log berdasarkan pengguna, jenis aksi, rentang waktu, atau IP address. Log dapat diunduh dalam format Excel atau PDF kapan saja — siap sebagai bahan bukti audit internal, pemeriksaan insiden keamanan, maupun dokumen akuntabilitas untuk akreditasi BAN-PT.
8. Generator Laporan & Ekspor Data Akreditasi
Super Admin dapat menghasilkan laporan rekap berkala dalam hitungan detik — tanpa perlu mengumpulkan data dari masing-masing admin secara manual. Tersedia template laporan siap pakai untuk: Laporan Bulanan Layanan Kemahasiswaan (aspirasi, konseling, prestasi), Rekap Kegiatan ORMAWA Per Semester, Data Prestasi Mahasiswa untuk BAN-PT (dipisah per jenis dan tingkat), dan Statistik Penggunaan Portal per Periode. Setiap laporan dapat diekspor ke Excel (untuk diolah lebih lanjut), PDF (untuk presentasi dan pelaporan resmi), atau dicetak langsung. Super Admin juga bisa membuat laporan kustom dengan memilih sendiri kombinasi data dan rentang waktu yang diinginkan.
9. Manajemen Konfigurasi Sistem
Super Admin dapat mengonfigurasi parameter sistem secara mandiri tanpa perlu bantuan tim teknis untuk perubahan operasional. Konfigurasi yang tersedia mencakup: menambah atau menonaktifkan fakultas dalam sistem, mengatur kategori tiket aspirasi yang tersedia untuk mahasiswa, menetapkan SLA default per jenis layanan (misalnya tiket aspirasi harus direspons dalam 3 hari kerja), mengonfigurasi template email notifikasi yang dikirim ke pengguna, dan mengatur batasan ukuran file yang bisa diunggah mahasiswa. Semua perubahan konfigurasi dicatat dalam log audit dan dapat di-rollback jika diperlukan.
10. Pemantauan Kesehatan Sistem (System Health Monitor)
Super Admin memiliki akses ke panel pemantauan kesehatan sistem yang menampilkan status operasional secara langsung: uptime server, waktu respons rata-rata API, status koneksi database, penggunaan kapasitas penyimpanan, dan status layanan notifikasi email. Jika ada komponen yang bermasalah — misalnya layanan email terhenti atau database mencapai batas kapasitas — Super Admin menerima peringatan otomatis via notifikasi in-app dan email. Panel ini memungkinkan Super Admin mendeteksi dan mengeskalasi masalah teknis ke tim vendor sebelum berdampak pada pengguna.
11. Manajemen Data Mahasiswa Terpusat
Super Admin dapat mengakses dan mencari data mahasiswa dari seluruh fakultas dalam satu antarmuka pencarian terpadu — berguna untuk investigasi jika ada insiden atau keluhan yang melibatkan mahasiswa dari beberapa fakultas sekaligus. Fitur ini juga digunakan untuk pemeliharaan data: menonaktifkan akun mahasiswa yang sudah lulus atau cuti panjang, menggabungkan akun duplikat jika ada, dan memverifikasi konsistensi data antar modul. Seluruh akses ke data mahasiswa dari panel ini tercatat di audit log, memenuhi prinsip data minimization dan akuntabilitas yang disyaratkan UU PDP No. 27/2022.
12. Broadcast Notifikasi Massal
Selain pengumuman di portal, Super Admin dapat mengirimkan notifikasi push dan email massal langsung ke kelompok pengguna yang dipilih — misalnya mengirim pengingat batas akhir pengisian KRS ke semua mahasiswa, atau menginformasikan perubahan jadwal ke seluruh Admin Fakultas sekaligus. Notifikasi massal dikirim secara asinkron di latar belakang sehingga tidak membebani sistem, dan Super Admin dapat memantau status pengiriman: berapa persen yang sudah terkirim, dibuka, dan apakah ada kegagalan pengiriman yang perlu ditindaklanjuti.
13. Evaluasi Kinerja Admin
Super Admin dapat melihat metrik kinerja setiap Admin Fakultas dan Admin ORMAWA: rata-rata waktu respons tiket per admin, jumlah tiket yang diselesaikan per periode, rasio persetujuan proposal, dan jumlah sesi konseling yang berhasil dijadwalkan. Data ini bukan untuk surveilans, melainkan untuk mengidentifikasi admin yang mungkin kelebihan beban kerja, atau unit yang perlu bantuan dan pelatihan tambahan. Laporan kinerja admin dapat diekspor dan digunakan sebagai bahan evaluasi dalam rapat koordinasi Direktorat.
14. Pengaturan Akun, Keamanan & Sesi Aktif
Super Admin dapat mengubah data profil pribadi, mengelola preferensi notifikasi, dan meninjau seluruh riwayat sesi loginnya sendiri — dilengkapi informasi IP address, perangkat, dan waktu akses. Jika Super Admin mendeteksi sesi yang mencurigakan (misalnya login dari IP asing), akun dapat dikunci sementara secara mandiri dan sesi aktif dapat diterminasi paksa dari panel ini. Untuk keamanan berlapis, Super Admin didukung pembatasan akses berbasis IP whitelist yang dapat dikonfigurasi — memastikan panel Super Admin hanya bisa diakses dari jaringan kampus yang terdaftar.
Dengan 14 fitur yang saling memperkuat ini, panel Super Admin bukan sekadar “admin biasa yang bisa lebih banyak” — melainkan pusat komando tata kelola kemahasiswaan yang sesungguhnya. Dari satu panel, Direktorat Kemahasiswaan BKU dapat memantau kondisi layanan secara menyeluruh, mengambil keputusan berbasis data, memastikan akuntabilitas setiap tindakan, dan menjaga keamanan seluruh sistem — tanpa perlu bergantung pada laporan manual dari masing-masing unit.
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