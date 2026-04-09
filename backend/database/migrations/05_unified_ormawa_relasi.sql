-- ============================================================
-- SIAKAD CROSS-DOMAIN RELATIONSHIP MIGRATION
-- Versi: 1.0.0
-- Target: Menyelaraskan relasi antara Ormawa, Fakultas, dan Mahasiswa
-- ============================================================

-- 1. Tambah relasi Fakultas ke tabel Ormawa
-- Catatan: Mengasumsikan tabel ormawas berada di public (GORM default)
ALTER TABLE IF EXISTS ormawas 
  ADD COLUMN IF NOT EXISTS faculty_id BIGINT REFERENCES faculties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS org_code VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Aktif';

-- 2. Tambah relasi Mahasiswa (Ketua/Pengaju) dan Fakultas ke tabel Proposal
-- Memastikan proposal terhubung ke entitas mahasiswa yang sah, bukan hanya nama string.
ALTER TABLE IF EXISTS proposals
  ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES students(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fakultas_id BIGINT REFERENCES faculties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS target_level VARCHAR(20) DEFAULT 'fakultas'; -- 'fakultas' | 'universitas'

-- 3. Sinkronisasi tabel Aspirasi
-- Menambahkan tujuan eskalasi agar aspirasi ormawa bisa diteruskan ke fakultas
ALTER TABLE IF EXISTS ormawa_aspirations
  ADD COLUMN IF NOT EXISTS escalate_to_faculty_id BIGINT REFERENCES faculties(id) ON DELETE SET NULL;

-- 4. Unified Audit Log Schema Source 
-- (Hanya jalankan jika tabel ada)
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS schema_source VARCHAR(30) DEFAULT 'public';
  END IF;
END $$;

-- 5. Tambah relasi User Utama ke User Ormawa/Fakultas jika masih terpisah
-- (Opsional, tergantung apakah implementasi Auth sudah unified ke public.users)
-- ALTER TABLE IF EXISTS ormawa.users ADD COLUMN IF NOT EXISTS public_user_id BIGINT REFERENCES public.users(id);

-- 6. Cleanup duplikasi (Hanya jika data sudah dimigrasi)
-- DROP TABLE IF EXISTS faculty_organizations;
-- DROP TABLE IF EXISTS ormawa_proposals;
