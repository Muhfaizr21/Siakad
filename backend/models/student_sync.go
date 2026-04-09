package models

import (
	"log"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// AfterSave adalah GORM hook yang dijalankan setelah Student dibuat atau di-update.
// Hook ini bertugas menyinkronkan data ke schema "fakultas_admin".
func (s *Student) AfterSave(tx *gorm.DB) (err error) {
	return SyncStudentToFaculty(tx, s)
}

func (f *Faculty) AfterSave(tx *gorm.DB) (err error) {
	return SyncFacultyToAdmin(tx, f)
}

func (m *Major) AfterSave(tx *gorm.DB) (err error) {
	return SyncMajorToAdmin(tx, m)
}

func SyncFacultyToAdmin(db *gorm.DB, faculty *Faculty) error {
	fakFaculty := FakFaculty{
		ID:       faculty.ID,
		Name:     faculty.Name,
		Code:     faculty.Code,
		DeanName: faculty.DeanName,
	}
	return db.Table("fakultas_admin.fakultas").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"nama_fakultas", "kode_fakultas", "dekan", "updated_at"}),
	}).Create(&fakFaculty).Error
}

func SyncMajorToAdmin(db *gorm.DB, major *Major) error {
	fakMajor := FakMajor{
		ID:         major.ID,
		FacultyID:  major.FacultyID,
		Code:       major.Code,
		Name:       major.Name,
		Akreditasi: major.Akreditasi,
	}
	// Note: Jenjang mapping
	fakMajor.Jenjang = "S1" // Default

	return db.Table("fakultas_admin.program_studi").Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"fakultas_id", "kode_prodi", "nama_prodi", "akreditasi", "updated_at"}),
	}).Create(&fakMajor).Error
}

// SyncStudentToFaculty menyinkronkan record mahasiswa dari public.students ke fakultas_admin.students.
func SyncStudentToFaculty(db *gorm.DB, student *Student) error {
	// Pastikan profil Fakultas & Major sudah ada di schema fakultas_admin (Fisik)
	// Kita ambil datanya dari public schema dulu jika hook AfterSave belum jalan untuk mereka
	var major Major
	if err := db.First(&major, student.MajorID).Error; err == nil {
		SyncMajorToAdmin(db, &major)
	}

	fakStudent := FakStudent{
		ID:               student.ID,
		UserID:           &student.UserID,
		NIM:              student.NIM,
		Name:             student.Name,
		MajorID:          student.MajorID,
		DPALecturerID:    student.DPALecturerID,
		SemesterSekarang: student.CurrentSemester,
		JoinYear:         int(student.EntryYear),
		Gender:           student.Gender,
		GPA:              student.GPA,
		CreditLimit:      student.CreditLimit,
		Status:           student.Status,
	}

	err := db.Table("fakultas_admin.mahasiswa").Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}}, // We use ID as primary sync key if possible, or NIM
		DoUpdates: clause.AssignmentColumns([]string{
			"pengguna_id", "nim", "nama_mahasiswa", "prodi_id", "dosen_pa_id", 
			"current_semester", "tahun_masuk", "gender", "ipk", 
			"credit_limit", "status_akun", "updated_at",
		}),
	}).Create(&fakStudent).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal menyinkronkan mahasiswa %s ke fakultas_admin: %v", student.NIM, err)
		return err
	}

	log.Printf("[Sync Success] Mahasiswa %s berhasil disinkronkan ke fakultas_admin", student.NIM)
	return nil
}
