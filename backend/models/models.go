package models

import "gorm.io/gorm"

// Role represents a user role in the system
type Role struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"unique;not null" json:"name"`
}

// User represents a system user
type User struct {
	gorm.Model
	Email        string `gorm:"unique;not null" json:"email"`
	PasswordHash string `gorm:"not null" json:"-"` // Hide password from JSON
	RoleID       uint   `json:"roleId"`
	Role         Role   `gorm:"foreignKey:RoleID" json:"role"`
	IsActive     bool   `gorm:"default:true" json:"isActive"`
}

// Faculty represents a university faculty
type Faculty struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"not null" json:"name"`
	Code     string `gorm:"unique;not null" json:"code"`
	DeanName string `json:"deanName"`
}

// Major represents a degree program
type Major struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"not null" json:"name"`
	FacultyID   uint   `json:"facultyId"`
	Faculty     Faculty `gorm:"foreignKey:FacultyID" json:"faculty"`
	DegreeLevel string `json:"degreeLevel"`
}

// Lecturer represents a faculty member
type Lecturer struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	UserID    uint   `json:"userId"`
	User      User   `gorm:"foreignKey:UserID" json:"user"`
	NIDN      string `gorm:"unique" json:"nidn"`
	Name      string `gorm:"not null" json:"name"`
	FacultyID uint   `json:"facultyId"`
	Faculty   Faculty `gorm:"foreignKey:FacultyID" json:"faculty"`
	IsDPA     bool    `gorm:"default:false" json:"isDpa"`
}

// Student represents an enrolled person
type Student struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	UserID          uint   `json:"userId"`
	User            User   `gorm:"foreignKey:UserID" json:"user"`
	NIM             string `gorm:"unique;not null" json:"nim"`
	Name            string `gorm:"not null" json:"name"`
	MajorID         uint   `json:"majorId"`
	Major           Major `gorm:"foreignKey:MajorID" json:"major"`
	DPALecturerID   *uint `json:"dpaLecturerId"`
	DPALecturer     *Lecturer `gorm:"foreignKey:DPALecturerID" json:"dpaLecturer"`
	CurrentSemester int       `gorm:"default:1" json:"currentSemester"`
	Status          string    `gorm:"default:'active'" json:"status"`
}
