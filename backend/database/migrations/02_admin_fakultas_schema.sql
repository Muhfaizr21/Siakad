-- ============================================================
--  SIAKAD ADMIN FAKULTAS — Skema Lengkap (Faculty Admin)
--  Versi   : 1.5.0 (Updated: Added Extended Tables)
--  Deskripsi: Tabel Dosen, Mahasiswa, Prodi, Aspirasi, KRS, 
--             Nilai, Persuratan, MBKM, dan Yudisium.
-- ============================================================

-- 1. TABEL USERS & ROLES
CREATE TABLE IF NOT EXISTS public.roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role_id         INTEGER REFERENCES public.roles(id),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.status_aspirasi AS ENUM ('proses', 'klarifikasi', 'selesai', 'ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status_krs      AS ENUM ('draft', 'diajukan', 'disetujui', 'perlu_revisi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status_surat    AS ENUM ('diajukan', 'diproses', 'siap_ambil', 'selesai', 'ditolak');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status_mbkm     AS ENUM ('terdaftar', 'berlangsung', 'konversi_nilai', 'selesai');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.status_yudisium AS ENUM ('pendaftaran', 'verifikasi_berkas', 'sidang', 'lulus', 'revisi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL DOSEN
CREATE TABLE IF NOT EXISTS public.lecturers (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    nidn            VARCHAR(20) UNIQUE,
    name            VARCHAR(255) NOT NULL,
    faculty_id      INTEGER,
    is_dpa          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL PROGRAM STUDI (Majors)
CREATE TABLE IF NOT EXISTS public.majors (
    id              SERIAL PRIMARY KEY,
    kode_prodi      VARCHAR(20) UNIQUE NOT NULL,
    nama_prodi      VARCHAR(150) NOT NULL,
    akreditasi      VARCHAR(5) DEFAULT 'B',
    jenjang         VARCHAR(20) DEFAULT 'S1',
    kaprodi_id      INTEGER REFERENCES public.lecturers(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL MAHASISWA
CREATE TABLE IF NOT EXISTS public.students (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    nim             VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    major_id        INTEGER REFERENCES public.majors(id),
    dpa_lecturer_id INTEGER REFERENCES public.lecturers(id),
    current_semester INTEGER DEFAULT 1,
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL MATAKULIAH
CREATE TABLE IF NOT EXISTS public.matakuliah (
    id              SERIAL PRIMARY KEY,
    kode_mk         VARCHAR(20) NOT NULL UNIQUE,
    nama_mk         VARCHAR(255) NOT NULL,
    sks             INTEGER DEFAULT 2,
    semester        INTEGER DEFAULT 1,
    sifat           VARCHAR(20) DEFAULT 'Wajib',
    kurikulum       VARCHAR(10) DEFAULT '2024',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABEL RUANGAN
CREATE TABLE IF NOT EXISTS public.ruangan (
    id              SERIAL PRIMARY KEY,
    nama_ruangan    VARCHAR(100) NOT NULL,
    kode_ruangan    VARCHAR(20) UNIQUE,
    kapasitas       INTEGER DEFAULT 40,
    lokasi_gedung   VARCHAR(255),
    tipe_ruangan    VARCHAR(50) DEFAULT 'Kelas',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL JADWAL KULIAH
CREATE TABLE IF NOT EXISTS public.schedules (
    id              SERIAL PRIMARY KEY,
    course_id       INTEGER REFERENCES public.matakuliah(id),
    lecturer_id     INTEGER REFERENCES public.lecturers(id),
    room_id         INTEGER REFERENCES public.ruangan(id),
    hari            VARCHAR(20) NOT NULL,
    jam_mulai       TIME NOT NULL,
    jam_selesai     TIME NOT NULL,
    kelas           VARCHAR(20) NOT NULL,
    tahun_akademik  VARCHAR(20) NOT NULL,
    semester_tipe   VARCHAR(10) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL ASPIRASI
CREATE TABLE IF NOT EXISTS public.aspirations (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(50), 
    status          public.status_aspirasi DEFAULT 'proses',
    response        TEXT,
    admin_id        INTEGER REFERENCES public.users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABEL KRS & NILAI
CREATE TABLE IF NOT EXISTS public.krs_validation (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tahun_akademik  VARCHAR(20) NOT NULL,
    semester_tipe   VARCHAR(10) NOT NULL,
    status          public.status_krs DEFAULT 'draft',
    total_sks       INTEGER DEFAULT 0,
    catatan_dpa     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.student_grades (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    schedule_id     INTEGER NOT NULL REFERENCES public.schedules(id),
    nilai_angka     DECIMAL(5,2),
    nilai_huruf     VARCHAR(2),
    bobot           DECIMAL(3,2),
    keterangan      TEXT,
    input_by        INTEGER REFERENCES public.users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABEL E-PERSURATAN
CREATE TABLE IF NOT EXISTS public.letter_requests (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    jenis_surat     VARCHAR(100) NOT NULL,
    keperluan       TEXT NOT NULL,
    status          public.status_surat DEFAULT 'diajukan',
    file_url        TEXT,
    catatan_admin   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABEL MBKM
CREATE TABLE IF NOT EXISTS public.mbkm_programs (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    jenis_mbkm      VARCHAR(100) NOT NULL,
    mitra_nama      VARCHAR(255) NOT NULL,
    durasi_bulan    INTEGER,
    status          public.status_mbkm DEFAULT 'terdaftar',
    sks_konversi    INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. TABEL YUDISIUM
CREATE TABLE IF NOT EXISTS public.graduation_submissions (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    judul_skripsi   TEXT,
    ipk_akhir       DECIMAL(3,2),
    status          public.status_yudisium DEFAULT 'pendaftaran',
    tanggal_sidang  DATE,
    keterangan      TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. SEED ROLES
INSERT INTO public.roles (name) 
SELECT 'super_admin' WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name='super_admin');
INSERT INTO public.roles (name) 
SELECT 'fakultas_admin' WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name='fakultas_admin');
INSERT INTO public.roles (name) 
SELECT 'lecturer' WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name='lecturer');
INSERT INTO public.roles (name) 
SELECT 'student' WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE name='student');

-- 15. INDEXING
CREATE INDEX IF NOT EXISTS idx_aspirations_status ON public.aspirations(status);
CREATE INDEX IF NOT EXISTS idx_grades_student_id  ON public.student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_krs_student_period ON public.krs_validation(student_id, tahun_akademik);
CREATE INDEX IF NOT EXISTS idx_students_nim       ON public.students(nim);
CREATE INDEX IF NOT EXISTS idx_lecturers_nidn     ON public.lecturers(nidn);
