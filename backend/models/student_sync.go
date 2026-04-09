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

func (l *Lecturer) AfterSave(tx *gorm.DB) (err error) {
	return SyncLecturerToAdmin(tx, l)
}

func SyncFacultyToAdmin(db *gorm.DB, faculty *Faculty) error {
	fakFaculty := FakFaculty{
		ID:       faculty.ID,
		Name:     faculty.Name,
		Code:     faculty.Code,
		DeanName: faculty.DeanName,
	}
	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"nama_fakultas", "kode_fakultas", "dekan", "diperbarui_pada"}),
	}).Create(&fakFaculty).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal menyinkronkan fakultas: %v", err)
		return err
	}
	return nil
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

	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{"fakultas_id", "kode_prodi", "nama_prodi", "akreditasi", "diperbarui_pada"}),
	}).Create(&fakMajor).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal menyinkronkan prodi: %v", err)
		return err
	}
	return nil
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

	err := db.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}}, // We use ID as primary sync key if possible, or NIM
		DoUpdates: clause.AssignmentColumns([]string{
			"pengguna_id", "nim", "nama_mahasiswa", "prodi_id", "dosen_pa_id", 
			"semester_sekarang", "tahun_masuk", "jenis_kelamin", "ipk", 
			"credit_limit", "status_akun", "diperbarui_pada",
		}),
	}).Create(&fakStudent).Error

	if err != nil {
		log.Printf("[Sync Error] Gagal menyinkronkan mahasiswa %s ke fakultas_admin: %v", student.NIM, err)
		return err
	}
	return nil
}

// SyncLecturerToAdmin menyinkronkan data dosen ke schema fakultas_admin.
func SyncLecturerToAdmin(db *gorm.DB, lecturer *Lecturer) error {
	fakLecturer := FakLecturer{
		ID:        lecturer.ID,
		UserID:    &lecturer.UserID,
		FacultyID: lecturer.FacultyID,
		NIDN:      lecturer.NIDN,
		Name:      lecturer.Name,
		IsDPA:     lecturer.IsDPA,
	}

	err := db.Table("fakultas_admin.dosen").Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"pengguna_id", "fakultas_id", "nidn", "nama_dosen", "apakah_dpa", "diperbarui_pada",
		}),
	}).Create(&fakLecturer).Error

	if err != nil {
		log.Printf("[Sync Warning] Gagal menyinkronkan dosen %s: %v", lecturer.Name, err)
	}
	return nil
}
