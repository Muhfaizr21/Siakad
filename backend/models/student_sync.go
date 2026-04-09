package models

import (
	"log"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// AfterSave adalah GORM hook yang dijalankan setelah Mahasiswa dibuat atau di-update.
// Hook ini bertugas menyinkronkan data ke schema "fakultas_admin".
func (s *Mahasiswa) AfterSave(tx *gorm.DB) (err error) {
	return SyncMahasiswaKeFakultas(tx, s)
}

func (f *Fakultas) AfterSave(tx *gorm.DB) (err error) {
	return SyncFakultasKeAdmin(tx, f)
}

func (m *ProgramStudi) AfterSave(tx *gorm.DB) (err error) {
	return SyncProdiKeAdmin(tx, m)
}

func SyncFakultasKeAdmin(db *gorm.DB, fakultas *Fakultas) error {
	fakFaculty := FakFaculty{
		ID:           fakultas.ID,
		Name:         fakultas.NamaFakultas,
		KodeFakultas: fakultas.KodeFakultas,
		Dekan:        fakultas.Dekan,
	}
	return db.Table("fakultas_admin.fakultas").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"nama_fakultas", "kode_fakultas", "dekan"}),
	}).Create(&fakFaculty).Error
}

func SyncProdiKeAdmin(db *gorm.DB, prodi *ProgramStudi) error {
	fakMajor := FakMajor{
		ID:         prodi.ID,
		FakultasID: prodi.FakultasID,
		KodeProdi:  prodi.KodeProdi,
		Name:       prodi.NamaProdi,
		Akreditasi: prodi.Akreditasi,
		Jenjang:    prodi.Jenjang,
	}

	return db.Table("fakultas_admin.program_studi").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"fakultas_id", "kode_prodi", "nama_prodi", "akreditasi", "jenjang"}),
	}).Create(&fakMajor).Error
}

// SyncMahasiswaKeFakultas menyinkronkan record mahasiswa dari public.mahasiswa ke fakultas_admin.mahasiswa.
func SyncMahasiswaKeFakultas(db *gorm.DB, mahasiswa *Mahasiswa) error {
	// Pastikan profil Fakultas & Prodi sudah ada di schema fakultas_admin
	var prodi ProgramStudi
	if err := db.First(&prodi, mahasiswa.ProgramStudiID).Error; err == nil {
		SyncProdiKeAdmin(db, &prodi)
	}

	fakStudent := FakStudent{
		ID:               mahasiswa.ID,
		PenggunaID:       &mahasiswa.PenggunaID,
		NIM:              mahasiswa.NIM,
		Name:             mahasiswa.NamaMahasiswa,
		MajorID:          mahasiswa.ProgramStudiID,
		DPALecturerID:    mahasiswa.DosenPAID,
		SemesterSekarang: mahasiswa.SemesterSekarang,
		JoinYear:         int(mahasiswa.TahunMasuk),
		Gender:           mahasiswa.JenisKelamin,
		IPK:              mahasiswa.IPK,
		CreditLimit:      mahasiswa.BatasSKS,
		Status:           mahasiswa.StatusAkun,
	}

	err := db.Table("fakultas_admin.mahasiswa").Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"pengguna_id", "nim", "nama_mahasiswa", "prodi_id", "dosen_pa_id", 
			"current_semester", "tahun_masuk", "jenis_kelamin", "ipk", 
			"credit_limit", "status_akun", "diperbarui_pada",
		}),
	}).Create(&fakStudent).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal menyinkronkan mahasiswa %s ke fakultas_admin: %v", mahasiswa.NIM, err)
		return err
	}

	log.Printf("[Sync Success] Mahasiswa %s berhasil disinkronkan ke fakultas_admin", mahasiswa.NIM)
	return nil
}
