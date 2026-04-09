package main

import (
	"fmt"

	"siakad-backend/config"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	fmt.Println("--- PURE SQL SEED START (No-Bulls*** Edition) ---")
	godotenv.Load(".env")
	config.ConnectDB()

	db := config.DB

	// 1. Ambil Role ID murni dari SQL
	var dosenRoleID, mhsRoleID int
	db.Raw("SELECT id FROM public.roles WHERE NamaMahasiswa = 'lecturer'").Scan(&dosenRoleID)
	db.Raw("SELECT id FROM public.roles WHERE NamaMahasiswa = 'student'").Scan(&mhsRoleID)
	fmt.Printf("SQL: Role Dosen=%d, Role Mhs=%d\n", dosenRoleID, mhsRoleID)

	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), 10)
	pass := string(hash)

	// 2. INJECT USER BUDI
	var userBudiID int
	db.Raw("INSERT INTO public.users (email, password_hash, role_id) VALUES (?, ?, ?) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id", "budi@univ.ac.id", pass, dosenRoleID).Scan(&userBudiID)
	fmt.Printf("SQL: User Budi ID=%d\n", userBudiID)

	// 3. INJECT DOSEN BUDI
	var dosenBudiID int
	db.Raw("INSERT INTO public.lecturers (user_id, nidn, NamaMahasiswa, is_dpa) VALUES (?, ?, ?, ?) ON CONFLICT (nidn) DO UPDATE SET NamaMahasiswa=EXCLUDED.NamaMahasiswa RETURNING id", userBudiID, "0011223301", "Drs. Budi Santoso, M.Kom", true).Scan(&dosenBudiID)
	fmt.Printf("SQL: Dosen Budi ID=%d\n", dosenBudiID)

	// 4. INJECT USER FAIZ
	var userFaizID int
	db.Raw("INSERT INTO public.users (email, password_hash, role_id) VALUES (?, ?, ?) ON CONFLICT (email) DO UPDATE SET email=EXCLUDED.email RETURNING id", "faiz@univ.ac.id", pass, mhsRoleID).Scan(&userFaizID)
	fmt.Printf("SQL: User Faiz ID=%d\n", userFaizID)

	// 5. INJECT MAHASISWA FAIZ
	var mhsFaizID int
	db.Raw("INSERT INTO public.students (user_id, nim, NamaMahasiswa, current_semester, dpa_lecturer_id) VALUES (?, ?, ?, ?, ?) ON CONFLICT (nim) DO UPDATE SET NamaMahasiswa=EXCLUDED.NamaMahasiswa RETURNING id", userFaizID, "220510001", "Muhamad Faiz", 4, dosenBudiID).Scan(&mhsFaizID)
	fmt.Printf("SQL: Mhs Faiz ID=%d\n", mhsFaizID)

	fmt.Println("--- PURE SQL SEED FINISHED ---")
}
