DROP SCHEMA IF EXISTS fakultas_admin CASCADE;
CREATE SCHEMA IF NOT EXISTS fakultas_admin;
SET search_path TO fakultas_admin, public;
-- ============================================================
--  SIAKAD ADMIN FAKULTAS — PostgreSQL Database Schema
--  Versi   : 2.3.0 (Separate Schema + Localized Indo)
--  Deskripsi: Schema lengkap untuk modul Admin Fakultas
--             mencakup Prestasi, PKKMB, Kesehatan, Aspirasi,
--             Beasiswa, Konseling, Laporan
-- ============================================================

-- ============================================================
--  EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  ENUM TYPES (Bahasa Indonesia)
-- ============================================================

DO $$ BEGIN
    CREATE TYPE status_aspirasi_fak AS ENUM ('proses', 'klarifikasi', 'selesai', 'ditolak');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_approval_indo AS ENUM ('Menunggu', 'Terverifikasi', 'Ditolak', 'Diterima');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
--  CORE TABLES (shared with public if needed)
-- ============================================================

-- 1. TABEL ROLES
CREATE TABLE IF NOT EXISTS fakultas_admin.roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL FAKULTAS (Jangkar Utama)
CREATE TABLE IF NOT EXISTS fakultas_admin.faculties (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    code        VARCHAR(50) UNIQUE NOT NULL,
    dean_name   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL USERS
CREATE TABLE IF NOT EXISTS fakultas_admin.users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role_id         INTEGER REFERENCES fakultas_admin.roles(id),
    faculty_id      INTEGER REFERENCES fakultas_admin.faculties(id) ON DELETE SET NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL PROGRAM STUDI (Majors)
CREATE TABLE IF NOT EXISTS fakultas_admin.majors (
    id              SERIAL PRIMARY KEY,
    faculty_id      INTEGER NOT NULL REFERENCES fakultas_admin.faculties(id) ON DELETE CASCADE,
    code            VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    akreditasi      VARCHAR(5) DEFAULT 'B',
    jenjang         VARCHAR(20) DEFAULT 'S1',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL DOSEN (Lecturers)
CREATE TABLE IF NOT EXISTS fakultas_admin.lecturers (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER UNIQUE REFERENCES fakultas_admin.users(id) ON DELETE SET NULL,
    faculty_id      INTEGER NOT NULL REFERENCES fakultas_admin.faculties(id) ON DELETE CASCADE,
    nidn            VARCHAR(20) UNIQUE,
    name            VARCHAR(255) NOT NULL,
    is_dpa          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE fakultas_admin.majors ADD COLUMN IF NOT EXISTS kaprodi_id INTEGER REFERENCES fakultas_admin.lecturers(id) ON DELETE SET NULL;

-- 6. TABEL MAHASISWA (Students)
CREATE TABLE IF NOT EXISTS fakultas_admin.students (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER UNIQUE REFERENCES fakultas_admin.users(id) ON DELETE SET NULL,
    nim             VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    major_id        INTEGER NOT NULL REFERENCES fakultas_admin.majors(id),
    dpa_lecturer_id INTEGER REFERENCES fakultas_admin.lecturers(id),
    current_semester INTEGER DEFAULT 1,
    join_year       INTEGER,
    gender          CHAR(1),
    gpa             DECIMAL(3,2) DEFAULT 0.00,
    credit_limit    INTEGER DEFAULT 24,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  FEATURE-SPECIFIC TABLES (6 FITUR UTAMA)
-- ============================================================

-- 7. TABEL PRESTASI MAHASISWA (Validasi Prestasi)
CREATE TABLE IF NOT EXISTS fakultas_admin.achievements (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES fakultas_admin.students(id) ON DELETE CASCADE,
    nama_prestasi   VARCHAR(255) NOT NULL,
    bidang          VARCHAR(50) NOT NULL,
    tingkat         VARCHAR(50) NOT NULL,
    peringkat       VARCHAR(50),
    tahun           INTEGER NOT NULL,
    penyelenggara   VARCHAR(255),
    sertifikat_url  TEXT,
    status          status_approval_indo DEFAULT 'Menunggu',
    poin_skpi       INTEGER DEFAULT 0,
    catatan         TEXT,
    verified_at     TIMESTAMP,
    verified_by     INTEGER REFERENCES fakultas_admin.users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL PKKMB (Monitor PKKMB)
CREATE TABLE IF NOT EXISTS fakultas_admin.pkkmb_participations (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES fakultas_admin.students(id) ON DELETE CASCADE,
    tahun_pelaksanaan INTEGER NOT NULL,
    nilai_akademik  DECIMAL(5,2) DEFAULT 0.00,
    kehadiran       INTEGER DEFAULT 0,
    status_kelulusan VARCHAR(50) DEFAULT 'Tidak Lulus',
    sertifikat_url  TEXT,
    catatan         TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL KESEHATAN (Pantau Data Kesehatan)
CREATE TABLE IF NOT EXISTS fakultas_admin.health_screenings (
    id                  SERIAL PRIMARY KEY,
    student_id          INTEGER NOT NULL REFERENCES fakultas_admin.students(id) ON DELETE CASCADE,
    tanggal_screening   DATE NOT NULL,
    golongan_darah      VARCHAR(5),
    tinggi_badan_cm     INTEGER,
    berat_badan_kg      INTEGER,
    tekanan_darah       VARCHAR(20),
    alergi              TEXT,
    buta_warna          VARCHAR(20) DEFAULT 'Tidak',
    riwayat_penyakit    TEXT,
    kategori_kesehatan  VARCHAR(50),
    catatan_medis       TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABEL ASPIRASI FAKULTAS (Kelola Student Voice)
CREATE TABLE IF NOT EXISTS fakultas_admin.faculty_aspirations (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES fakultas_admin.students(id) ON DELETE CASCADE,
    topik           VARCHAR(255) NOT NULL,
    deskripsi       TEXT NOT NULL,
    kategori        VARCHAR(50),
    status          status_aspirasi_fak DEFAULT 'proses',
    response        TEXT,
    response_date   TIMESTAMP,
    handled_by      INTEGER REFERENCES fakultas_admin.users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABEL BEASISWA INTERNAL (Approve Beasiswa)
CREATE TABLE IF NOT EXISTS fakultas_admin.internal_scholarships (
    id              SERIAL PRIMARY KEY,
    nama_beasiswa   VARCHAR(255) NOT NULL,
    penyelenggara   VARCHAR(255) NOT NULL,
    kuota           INTEGER NOT NULL DEFAULT 0,
    persyaratan     TEXT,
    nominal         DECIMAL(15,2) DEFAULT 0,
    min_ipk         DECIMAL(3,2) DEFAULT 0.00,
    tanggal_buka    DATE NOT NULL,
    tanggal_tutup   DATE NOT NULL,
    status_buka     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fakultas_admin.scholarship_applications (
    id                  SERIAL PRIMARY KEY,
    student_id          INTEGER NOT NULL REFERENCES fakultas_admin.students(id) ON DELETE CASCADE,
    scholarship_id      INTEGER NOT NULL REFERENCES fakultas_admin.internal_scholarships(id) ON DELETE CASCADE,
    ipk_saat_mendaftar  DECIMAL(3,2),
    berkas_url          TEXT,
    status              status_approval_indo DEFAULT 'Menunggu',
    catatan_reviewer    TEXT,
    reviewed_by         INTEGER REFERENCES fakultas_admin.users(id),
    reviewed_at         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABEL KONSELING (Laporan Konseling)
CREATE TABLE IF NOT EXISTS fakultas_admin.counselings (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES fakultas_admin.students(id) ON DELETE CASCADE,
    tanggal_konseling DATE NOT NULL,
    topik           VARCHAR(255) NOT NULL,
    catatan         TEXT,
    status          status_approval_indo DEFAULT 'Menunggu',
    counselor_id    INTEGER REFERENCES fakultas_admin.users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  INITIAL DATA SEED (Roles)
-- ============================================================
INSERT INTO fakultas_admin.roles (name, description)
VALUES
    ('super_admin', 'Full access'),
    ('fakultas_admin', 'Faculty management access'),
    ('lecturer', 'Academic guidance access'),
    ('student', 'General student access')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
--  INDEXING (Optimization)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_fak_faculties_code ON fakultas_admin.faculties(code);
CREATE INDEX IF NOT EXISTS idx_fak_users_email ON fakultas_admin.users(email);
CREATE INDEX IF NOT EXISTS idx_fak_students_nim ON fakultas_admin.students(nim);
CREATE INDEX IF NOT EXISTS idx_fak_achievements_status ON fakultas_admin.achievements(status);
CREATE INDEX IF NOT EXISTS idx_fak_aspirations_status ON fakultas_admin.faculty_aspirations(status);
CREATE INDEX IF NOT EXISTS idx_fak_scholarship_apps_status ON fakultas_admin.scholarship_applications(status);