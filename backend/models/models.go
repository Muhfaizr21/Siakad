package models

import "gorm.io/gorm"

// Role represents a user role in the system
type Role struct {
	ID   uint   `gorm:"primaryKey"`
	Name string `gorm:"unique;not null"`
}

// User represents a system user
type User struct {
	gorm.Model
	Email        string `gorm:"unique;not null"`
	PasswordHash string `gorm:"not null"`
	RoleID       uint
	Role         Role `gorm:"foreignKey:RoleID"`
	IsActive     bool `gorm:"default:true"`
}

// Faculty represents a university faculty
type Faculty struct {
	ID       uint   `gorm:"primaryKey"`
	Name     string `gorm:"not null"`
	Code     string `gorm:"unique;not null"`
	DeanName string
}

// Major represents a degree program
type Major struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"not null"`
	FacultyID   uint
	Faculty     Faculty `gorm:"foreignKey:FacultyID"`
	DegreeLevel string
}

// Lecturer represents a faculty member
type Lecturer struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    uint
	User      User   `gorm:"foreignKey:UserID"`
	NIDN      string `gorm:"unique"`
	Name      string `gorm:"not null"`
	FacultyID uint
	Faculty   Faculty `gorm:"foreignKey:FacultyID"`
	IsDPA     bool    `gorm:"default:false"`
}

// Student represents an enrolled person
type Student struct {
	ID              uint   `gorm:"primaryKey"`
	UserID          uint
	User            User   `gorm:"foreignKey:UserID"`
	NIM             string `gorm:"unique;not null"`
	Name            string `gorm:"not null"`
	MajorID         uint
	Major           Major `gorm:"foreignKey:MajorID"`
	DPALecturerID   *uint
	DPALecturer     *Lecturer `gorm:"foreignKey:DPALecturerID"`
	CurrentSemester int       `gorm:"default:1"`
	Status          string    `gorm:"default:'active'"`
}
