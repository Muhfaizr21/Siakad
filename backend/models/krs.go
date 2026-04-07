package models

import (
	"time"
)

// KRSSubmission maps to existing krs_validation table
type KRSSubmission struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	StudentID       uint           `gorm:"column:student_id" json:"studentId"`
	Student         Student        `gorm:"foreignKey:StudentID;constraint:OnDelete:CASCADE" json:"student"`
	AcademicYear    string         `gorm:"column:tahun_akademik" json:"academicYear"`
	Semester        string         `gorm:"column:semester_tipe" json:"semester"` // Using semester_tipe from SQL
	Status          string         `gorm:"column:status" json:"status"`
	TotalSKS        int            `gorm:"column:total_sks" json:"totalSks"`
	ValidatedBy     *uint          `gorm:"column:validated_by" json:"validatedBy"`
	ValidatedByLecturer *Lecturer    `gorm:"foreignKey:ValidatedBy" json:"validator"`
	ValidatedAt     *time.Time     `gorm:"column:validated_at" json:"validatedAt"`
	Remarks         string         `gorm:"column:catatan_dpa;type:text" json:"remarks"` // Using catatan_dpa from SQL
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	Items           []KRSItem      `gorm:"foreignKey:KRSSubmissionID" json:"items"`
}

type KRSItem struct {
	ID                uint          `gorm:"primaryKey" json:"id"`
	KRSSubmissionID   uint          `gorm:"column:krs_submission_id" json:"krsSubmissionId"`
	CourseID          uint          `gorm:"column:course_id" json:"courseId"`
	Course            Matakuliah    `gorm:"foreignKey:CourseID" json:"course"`
	CreatedAt         time.Time     `json:"createdAt"`
}

func (KRSSubmission) TableName() string {
	return "krs_validation"
}

func (KRSItem) TableName() string {
	return "krs_items"
}
