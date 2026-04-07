package seeders

import (
	"fmt"
	"log"
	"os"
	"siakad-backend/models"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func SeedKrs() {
	// Load .env
	err := godotenv.Load("../.env")
	if err != nil {
		// Try without ../ if running from root
		err = godotenv.Load(".env")
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}

	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Running AutoMigration for KRS...")
	db.AutoMigrate(&models.KRSSubmission{}, &models.KRSItem{})

	fmt.Println("Seeding test data for KRS...")

	// 1. Ensure Major exists
	major := models.Major{Name: "Teknik Informatika", Code: "TI"}
	db.FirstOrCreate(&major, models.Major{Code: "TI"})

	// 2. Ensure Student exists
	student := models.Student{
		NIM:             "20230001",
		Name:            "Ahmad Fauzi Rahman",
		MajorID:         major.ID,
		CurrentSemester: 3,
		GPA:             3.75,
		CreditLimit:     24,
		Status:          "Aktif",
	}
	db.FirstOrCreate(&student, models.Student{NIM: "20230001"})

	// 3. Ensure Courses exist
	courses := []models.Matakuliah{
		{KodeMK: "TI301", NamaMK: "Basis Data", SKS: 3, Semester: 3, MajorID: major.ID},
		{KodeMK: "TI302", NamaMK: "Pemrograman Berorientasi Objek", SKS: 4, Semester: 3, MajorID: major.ID},
		{KodeMK: "TI303", NamaMK: "Statistika", SKS: 3, Semester: 3, MajorID: major.ID},
		{KodeMK: "TI304", NamaMK: "Jaringan Komputer", SKS: 3, Semester: 3, MajorID: major.ID},
	}

	for i := range courses {
		db.FirstOrCreate(&courses[i], models.Matakuliah{KodeMK: courses[i].KodeMK})
	}

	// 4. Create KRS Submission
	krs := models.KRSSubmission{
		StudentID:    student.ID,
		AcademicYear: "2024/2025",
		Semester:     "Ganjil",
		Status:       "Menunggu",
		TotalSKS:      13,
	}
	// Delete existing if any to refresh
	db.Where("student_id = ? AND tahun_akademik = ? AND semester = ?", student.ID, "2024/2025", "Ganjil").Delete(&models.KRSSubmission{})
	db.Create(&krs)

	// 5. Create KRS Items
	for _, c := range courses {
		item := models.KRSItem{
			KRSSubmissionID: krs.ID,
			CourseID:        c.ID,
		}
		db.Create(&item)
	}

	fmt.Println("Success! Seeded student Ahmad Fauzi Rahman with 4 courses.")
	
	// Create another student for variety
	student2 := models.Student{
		NIM:             "20230002",
		Name:            "Siti Aminah",
		MajorID:         major.ID,
		CurrentSemester: 3,
		GPA:             3.20,
		CreditLimit:     21,
		Status:          "Aktif",
	}
	db.FirstOrCreate(&student2, models.Student{NIM: "20230002"})

	krs2 := models.KRSSubmission{
		StudentID:    student2.ID,
		AcademicYear: "2024/2025",
		Semester:     "Ganjil",
		Status:       "Menunggu",
		TotalSKS:      10,
	}
	db.Where("student_id = ? AND tahun_akademik = ? AND semester = ?", student2.ID, "2024/2025", "Ganjil").Delete(&models.KRSSubmission{})
	db.Create(&krs2)
	
	for i := 0; i < 3; i++ {
		db.Create(&models.KRSItem{
			KRSSubmissionID: krs2.ID,
			CourseID:        courses[i].ID,
		})
	}
	
	fmt.Println("Success! Seeded student Siti Aminah with 3 courses.")
}
