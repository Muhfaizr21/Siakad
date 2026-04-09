-- RESET TABLES
TRUNCATE pengguna, fakultas, program_studi, peran, mahasiswa, ormawas, proposals, berita, pengumuman RESTART IDENTITY CASCADE;

-- 1. SEED ROLES
INSERT INTO peran (id, nama_peran, deskripsi) VALUES 
(1, 'SuperAdmin', 'Administrator tingkat universitas'),
(2, 'FacultyAdmin', 'Administrator tingkat fakultas'),
(3, 'Student', 'Pengguna mahasiswa universitas');

-- 2. SEED FAKULTAS
INSERT INTO fakultas (id, nama_fakultas, kode_fakultas, dekan) VALUES 
(1, 'Fakultas Ilmu Komputer', 'FIK', 'Budi Rahardjo, Ph.D'),
(2, 'Fakultas Ekonomi & Bisnis', 'FEB', 'Dr. Siti Aminah');

-- 3. SEED PRODI
INSERT INTO program_studi (id, fakultas_id, nama_prodi, kode_prodi, jenjang, akreditasi) VALUES 
(1, 1, 'Teknik Informatika', 'IF', 'S1', 'Unggul'),
(2, 1, 'Sistem Informasi', 'SI', 'S1', 'A'),
(3, 2, 'Manajemen', 'MN', 'S1', 'A');

-- 4. SEED USERS (Password: admin123 -> $2a$10$iI0T7XLo.fE0e6A2.fE0e.)
-- Note: Using a fixed hash for 'admin123'
INSERT INTO pengguna (id, email, kata_sandi, peran_id, fakultas_id, aktif) VALUES 
(1, 'admin@siakad.com', '$2a$10$lJ3RBvbhtE7p09rUqp6X/.R8nFGVtmUM09k/npA5sa1XpErXSK59m', 1, NULL, true),
(2, 'fik_admin@siakad.com', '$2a$10$lJ3RBvbhtE7p09rUqp6X/.R8nFGVtmUM09k/npA5sa1XpErXSK59m', 2, 1, true),
(3, 'mahasiswa@bku.ac.id', '$2a$10$lJ3RBvbhtE7p09rUqp6X/.R8nFGVtmUM09k/npA5sa1XpErXSK59m', 3, NULL, true);

-- 5. SEED MAHASISWA
INSERT INTO mahasiswa (id, pengguna_id, nim, nama_mahasiswa, prodi_id, status_akun, ipk, tahun_masuk, current_semester) VALUES 
(1, 3, '10123456', 'Tegar Mahasiswa BKU', 1, 'Aktif', 3.85, 2021, 5);

-- 6. SEED ORMAWA
INSERT INTO ormawas (id, name, description, faculty_id, org_code, status) VALUES 
(1, 'BEM FIK', 'Badan Eksekutif Mahasiswa Ilmu Komputer', 1, 'BEM-FIK', 'Aktif'),
(2, 'HIMTI', 'Himpunan Mahasiswa Teknik Informatika', 1, 'HIMTI', 'Aktif'),
(3, 'UKM Seni', 'Unit Kegiatan Mahasiswa Bidang Seni', NULL, 'UKM-SENI', 'Aktif');

-- 7. SEED PROPOSALS
INSERT INTO proposals (id, ormawa_id, title, description, budget, status, fakultas_id, student_id) VALUES 
(1, 2, 'Seminar Web 3.0', 'Seminar mengenai masa depan desentralisasi web.', 5000000, 'diajukan', 1, 1),
(2, 1, 'PKKMB Fakultas 2024', 'Kegiatan penyambutan mahasiswa baru.', 15000000, 'diajukan', 1, 1),
(3, 3, 'Pameran Lukisan', 'Pameran karya seni digital.', 2500000, 'diajukan', NULL, 1);

-- 8. SYNC TO FAKULTAS_ADMIN (Simulate real-time sync)
INSERT INTO fakultas_admin.mahasiswa (id, pengguna_id, nim, nama_mahasiswa, prodi_id, status_akun, ipk, tahun_masuk, current_semester)
SELECT id, pengguna_id, nim, nama_mahasiswa, prodi_id, status_akun, ipk, tahun_masuk, current_semester FROM mahasiswa;

INSERT INTO fakultas_admin.fakultas (id, nama_fakultas, kode_fakultas, dekan)
SELECT id, nama_fakultas, kode_fakultas, dekan FROM fakultas;
