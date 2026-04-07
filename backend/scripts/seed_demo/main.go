package main

import (
	"encoding/json"
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	for _, p := range []string{"../../.env", "../.env", ".env"} {
		if err := godotenv.Load(p); err == nil { break }
	}
	config.ConnectDB()
	db := config.DB

	fmt.Println("🚀 Memulai Seeding Data Demo Ormawa...")

	// 1. CLEAR EXISTING DATA (Optional, but good for clean demo)
	// db.Exec("TRUNCATE TABLE ormawa_notifications, ormawa_announcements, event_attendances, event_schedules, lpjs, cash_mutations, proposal_histories, proposals, ormawa_members, ormawa_roles, ormawas, students RESTART IDENTITY CASCADE")

	// 2. SEED STUDENTS (The Pool)
	students := []models.Student{
		{NIM: "220101001", Name: "Ahmad Fauzi", MajorID: 1, CurrentSemester: 4},
		{NIM: "220101002", Name: "Siti Aminah", MajorID: 1, CurrentSemester: 4},
		{NIM: "220101003", Name: "Budi Santoso", MajorID: 2, CurrentSemester: 6},
		{NIM: "220101004", Name: "Dewi Lestari", MajorID: 2, CurrentSemester: 2},
		{NIM: "220101005", Name: "Eko Prasetyo", MajorID: 1, CurrentSemester: 8},
		{NIM: "220101006", Name: "Fitri Handayani", MajorID: 3, CurrentSemester: 4},
		{NIM: "220101007", Name: "Gilang Ramadhan", MajorID: 3, CurrentSemester: 6},
		{NIM: "220101008", Name: "Hani Safitri", MajorID: 4, CurrentSemester: 2},
	}
	for i := range students {
		db.FirstOrCreate(&students[i], models.Student{NIM: students[i].NIM})
	}

	// 3. SEED ORMAWA
	ormawa := models.Ormawa{
		ID:          1,
		Name:        "Himpunan Mahasiswa Rekayasa Perangkat Lunak (HIMA RPL)",
		Description: "Organisasi wadah aspirasi mahasiswa prodi RPL Polindra.",
		Vision:      "Menjadi ormawa unggulan dalam pengembangan software dan integritas mahasiswa.",
		Mission:     "Meningkatkan skill teknis, mempererat kekeluargaan, dan melayani mahasiswa.",
		LogoUrl:     "/uploads/1775320417_logo-himarpl.png",
		Email:       "himarpl@polindra.ac.id",
	}
	db.Save(&ormawa)

	// 4. SEED ROLES
	permsAdmin := map[string][]string{
		"dashboard": {"view"},
		"anggota":   {"view", "create", "edit", "delete"},
		"proposal":  {"view", "create", "edit", "delete"},
		"jadwal":    {"view", "create", "edit", "delete"},
		"absensi":   {"view", "manage"},
		"keuangan":  {"view", "create", "manage"},
		"lpj":       {"view", "create", "edit"},
		"pengumuman":{"view", "create", "edit", "delete"},
		"rbac":      {"view", "manage"},
		"settings":  {"view", "edit"},
	}
	jsonAdmin, _ := json.Marshal(permsAdmin)

	roles := []models.OrmawaRole{
		{Name: "Ketua Umum", Description: "Pemegang kendali penuh organisasi", IsCustom: false, Permissions: jsonAdmin},
		{Name: "Sekretaris", Description: "Pengelola administrasi dan surat menyurat", IsCustom: false, Permissions: jsonAdmin},
		{Name: "Bendahara", Description: "Pengelola keuangan dan buku kas", IsCustom: false, Permissions: jsonAdmin},
		{Name: "Staf Ahli", Description: "Anggota fungsionaris divisi", IsCustom: true, Permissions: jsonAdmin},
	}
	for i := range roles {
		db.FirstOrCreate(&roles[i], models.OrmawaRole{Name: roles[i].Name})
	}

	// 5. SEED MEMBERS
	members := []models.OrmawaMember{
		{OrmawaID: 1, StudentID: students[0].ID, Role: "Ketua Umum", Division: "Inti", Status: "aktif"},
		{OrmawaID: 1, StudentID: students[1].ID, Role: "Sekretaris", Division: "Inti", Status: "aktif"},
		{OrmawaID: 1, StudentID: students[2].ID, Role: "Bendahara", Division: "Inti", Status: "aktif"},
		{OrmawaID: 1, StudentID: students[3].ID, Role: "Staf", Division: "Humas", Status: "aktif"},
		{OrmawaID: 1, StudentID: students[4].ID, Role: "Staf", Division: "Minat Bakat", Status: "pending"},
		{OrmawaID: 1, StudentID: students[5].ID, Role: "Staf", Division: "Kaderisasi", Status: "pending"},
	}
	for i := range members {
		db.Save(&members[i])
	}

	// 6. SEED PROPOSALS
	proposals := []models.Proposal{
		{OrmawaID: 1, Title: "Seminar Teknologi Web 2024", DateEvent: time.Now().AddDate(0, 1, 0), Budget: 5000000, Status: "disetujui_univ", Notes: "Disetujui penuh oleh wakil direktur."},
		{OrmawaID: 1, Title: "Lomba Coding Internal", DateEvent: time.Now().AddDate(0, 0, 15), Budget: 2500000, Status: "diajukan", Notes: "Menunggu review dosen pembimbing."},
		{OrmawaID: 1, Title: "Kunjungan Industri ke Google Jakarta", DateEvent: time.Now().AddDate(0, 4, 0), Budget: 15000000, Status: "disetujui_fakultas", Notes: "Persetujuan tahap fakultas selesai."},
		{OrmawaID: 1, Title: "Makrab Mahasiswa Baru", DateEvent: time.Now().AddDate(0, -1, 0), Budget: 3000000, Status: "disetujui_univ"},
	}
	for i := range proposals {
		db.Save(&proposals[i])
	}

	// 7. SEED CASH MUTATIONS
	mutations := []models.CashMutation{
		{OrmawaID: 1, Type: "masuk", Nominal: 3000000, Category: "Pencairan Dana", Description: "Pencairan Dana Makrab", Date: time.Now().AddDate(0, -1, -5), ProposalID: &proposals[3].ID},
		{OrmawaID: 1, Type: "keluar", Nominal: 500000, Category: "Konsumsi", Description: "DP Katering Makrab", Date: time.Now().AddDate(0, -1, -2)},
		{OrmawaID: 1, Type: "masuk", Nominal: 12500000, Category: "Saldo Awal", Description: "Kas Sisa Periode Lalu", Date: time.Now().AddDate(0, -2, 0)},
	}
	for i := range mutations {
		db.Save(&mutations[i])
	}

	// 8. SEED CALENDAR EVENTS
	events := []models.EventSchedule{
		{Title: "Rapat Pleno 1", Description: "Pembahasan program kerja satu periode.", StartDate: time.Now().AddDate(0, 0, 2), EndDate: time.Now().AddDate(0, 0, 2), Location: "GSC Polindra", OrmawaID: 1},
		{Title: "Workshop UI/UX", Description: "Pelatihan desain antarmuka bagi mahasiswa.", StartDate: time.Now().AddDate(0, 0, 10), EndDate: time.Now().AddDate(0, 0, 10), Location: "Lab Komputer 3", OrmawaID: 1},
		{Title: "Dies Natalis Ormawa", Description: "Ulang tahun organisasi ke-10.", StartDate: time.Now().AddDate(0, 1, 0), EndDate: time.Now().AddDate(0, 1, 1), Location: "Auditorium Main", OrmawaID: 1},
	}
	for i := range events {
		db.Save(&events[i])
	}

	// 9. SEED ANNOUNCEMENTS
	announcements := []models.OrmawaAnnouncement{
		{Title: "Pengumpulan Berkas LPJ Makrab", Content: "Harap segera mengumpulkan bukti nota katering paling lambat besok sore di sekretariat.", Target: "Seksi Konsumsi", StartDate: time.Now(), EndDate: time.Now().AddDate(0, 0, 3), OrmawaID: 1},
		{Title: "Recruitment Anggota Baru Gelombang 2", Content: "Open recruitment dibuka kembali bagi yang belum sempat daftar di gelombang 1.", Target: "Mahasiswa Umum", StartDate: time.Now().AddDate(0, 0, 7), EndDate: time.Now().AddDate(0, 0, 14), OrmawaID: 1},
	}
	for i := range announcements {
		db.Save(&announcements[i])
	}

	// 10. SEED NOTIFICATIONS
	notifs := []models.OrmawaNotification{
		{Type: "proposal", Title: "Proposal Disetujui", Desc: "Proposal Seminar Teknologi Web telah disetujui oleh Universitas.", OrmawaID: 1, IsRead: false},
		{Type: "approval", Title: "Pendaftar Baru", Desc: "Mahasiswa baru atas nama Fitri Handayani ingin bergabung.", OrmawaID: 1, IsRead: false},
		{Type: "fund", Title: "Dana Masuk", Desc: "Dana hibah universitas sebesar Rp3.000.000 telah masuk ke kas.", OrmawaID: 1, IsRead: true},
	}
	for i := range notifs {
		db.Save(&notifs[i])
	}

	fmt.Println("✅ Seeding Selesai! Data demo siap digunakan.")
}
