package routes

import (
	fakultas "siakad-backend/controllers/fakultas"
	ormawa "siakad-backend/controllers/ormawa"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

// InisialisasiRuteFakultas mendaftarkan rute administrator fakultas (English Path for Frontend Compatibility)
func InisialisasiRuteFakultas(aplikasi *fiber.App) {
	api := aplikasi.Group("/api/faculty", middleware.AuthProtected) // prefix kembali ke English sesuai frontend



	// Mahasiswa
	api.Get("/students", fakultas.AmbilDaftarMahasiswa)
	api.Get("/students/:id", fakultas.AmbilMahasiswaBerdasarID)
	// api.Post("/students", fakultas.TambahMahasiswaBaru)
	// api.Put("/students/:id", fakultas.PerbaruiDataMahasiswa)
	// api.Delete("/students/:id", fakultas.HapusDataMahasiswa)

	// Struktur Organisasi (Fakultas & Prodi/Majors)
	api.Get("/faculties", fakultas.AmbilDaftarFakultas)
	api.Get("/majors", fakultas.AmbilDaftarProdi)
	api.Post("/majors", fakultas.TambahProdiBaru)
	api.Put("/majors/:id", fakultas.PerbaruiProdi)
	api.Delete("/majors/:id", fakultas.HapusProdi)

	// Matakuliah & Jadwal
	api.Get("/courses", fakultas.AmbilDaftarProdi) // ALIAS: Frontend Mahasiswa.jsx calls this for majors
	api.Post("/courses", fakultas.TambahProdiBaru) // ALIAS for adding majors
	api.Put("/courses/:id", fakultas.PerbaruiProdi)
	api.Delete("/courses/:id", fakultas.HapusProdi)

	// Dashboard & Ringkasan
	api.Get("/summary", fakultas.AmbilRingkasanDashboard)
	api.Get("/reports/summary", fakultas.AmbilRingkasanLaporan)
	api.Get("/notifications/stats", fakultas.AmbilNotifikasiAntrean)

	// Pelayanan Mahasiswa (Aspirasi, Prestasi, Surat)
	api.Get("/aspirations", fakultas.AmbilDaftarAspirasi)
	api.Get("/aspirasi", fakultas.AmbilDaftarAspirasi) // ALIAS
	api.Put("/aspirations/:id", fakultas.TanggapiAspirasi)
	api.Put("/aspirasi/:id", fakultas.TanggapiAspirasi) // ALIAS
	api.Delete("/aspirations/:id", fakultas.HapusAspirasi)

	api.Get("/achievements", fakultas.AmbilDaftarPrestasi)
	api.Get("/prestasi", fakultas.AmbilDaftarPrestasi) // ALIAS
	api.Put("/achievements/:id/verify", fakultas.VerifikasiPrestasi)
	api.Put("/prestasi/:id/verify", fakultas.VerifikasiPrestasi) // ALIAS
	api.Put("/prestasi/:id", fakultas.VerifikasiPrestasi)        // ALIAS
	api.Post("/achievements/:id/sync-simkatmawa", fakultas.SyncSimkatmawa)
	api.Put("/achievements/:id/simkatmawa-status", fakultas.UpdateSimkatmawaStatus)
	api.Delete("/achievements/:id", fakultas.HapusPrestasi)
	api.Delete("/prestasi/:id", fakultas.HapusPrestasi) // ALIAS

	// MBKM & Beasiswa
	api.Get("/mbkm", fakultas.AmbilDaftarMBKM)
	api.Put("/mbkm/:id", fakultas.PerbaruiStatusMBKM)
	api.Delete("/mbkm/:id", fakultas.HapusMBKM)

	api.Get("/scholarships", fakultas.AmbilDaftarBeasiswa)
	api.Post("/scholarships", fakultas.TambahBeasiswa)
	api.Put("/scholarships/:id", fakultas.PerbaruiBeasiswa)
	api.Delete("/scholarships/:id", fakultas.HapusBeasiswa)
	api.Get("/scholarships/applications", fakultas.AmbilPendaftarBeasiswa)
	api.Put("/scholarships/applications/:id", fakultas.VerifikasiBeasiswa)
	api.Delete("/scholarships/applications/:id", fakultas.HapusPendaftarBeasiswa)

	// Konten & Berita (DISABLED BY USER REQUEST)
	/*
		api.Get("/articles", fakultas.AmbilDaftarBerita)
		api.Get("/news", fakultas.AmbilDaftarBerita) // ALIAS
		api.Post("/articles", fakultas.TambahBeritaBaru)
		api.Post("/news", fakultas.TambahBeritaBaru) // ALIAS
		api.Put("/articles/:id", fakultas.PerbaruiBerita)
		api.Put("/news/:id", fakultas.PerbaruiBerita) // ALIAS
		api.Delete("/articles/:id", fakultas.HapusBerita)
		api.Delete("/news/:id", fakultas.HapusBerita) // ALIAS
	*/

	// Pendaftaran Mahasiswa Baru (PMB) — DISABLED BY USER REQUEST
	// api.Get("/admissions", fakultas.AmbilDaftarPendaftarMB)
	// api.Put("/admissions/:id/status", fakultas.PerbaruiStatusPendaftarMB)

	// Organisasi & Proposal
	api.Get("/organizations", fakultas.AmbilDaftarOrganisasi)
	api.Get("/organizations-faculty", fakultas.AmbilDaftarOrganisasi) // ALIAS
	api.Post("/organizations", fakultas.TambahOrganisasi)
	api.Put("/organizations/:id", fakultas.PerbaruiOrganisasi)
	api.Delete("/organizations/:id", fakultas.HapusOrganisasi)

	// Kategori Ormawa — read-only untuk Faculty Admin (dipakai form Tambah/Edit Ormawa)
	api.Get("/ormawa-kategori", ormawa.GetAllKategoriOrmawa)

	api.Get("/ormawa/proposals", fakultas.AmbilDaftarProposalOrmawa)
	api.Put("/ormawa/proposals/:id", fakultas.ValidasiProposalOrmawa)

	// api.Get("/internal/proposals", fakultas.AmbilDaftarProposalFakultas)
	// api.Put("/internal/proposals/:id", fakultas.ValidasiProposalFakultas)

	// Jadwal Konseling — Re-enabled for Data Konseling
	api.Get("/counseling", fakultas.AmbilDaftarKonseling)
	api.Post("/counseling", fakultas.TambahSesiKonseling)
	api.Put("/counseling/:id", fakultas.UpdateSesiKonseling)
	api.Delete("/counseling/:id", fakultas.HapusSesiKonseling)
	api.Get("/psychologists", fakultas.AmbilDaftarPsikolog)

	// Layanan Kesehatan (Health Screening)
	api.Get("/health-screening", fakultas.AmbilDaftarKesehatan)
	api.Get("/health-screening/summary", fakultas.AmbilRingkasanKesehatan)
	api.Delete("/health-screening/:id", fakultas.HapusDataKesehatan)

	// Periode Akademik (Pengaturan)
	api.Get("/academic-periods", fakultas.AmbilPengaturanAkademik)
	api.Get("/academic-periods/all", fakultas.AmbilSemuaPeriodeAkademik)
	api.Post("/academic-periods", fakultas.SimpanPengaturanAkademik)
	api.Put("/academic-periods", fakultas.SimpanPengaturanAkademik) // ALIAS

	// Akun & Profil (Baru) - Terpisah dari Mahasiswa
	api.Get("/profile", fakultas.AmbilProfilAdminFakultas)
	api.Put("/profile", fakultas.PerbaruiProfilAdminFakultas)
	api.Post("/profile/upload-avatar", fakultas.UploadAvatarAdminFakultas)
	api.Delete("/profile/avatar", fakultas.HapusAvatarAdminFakultas)
	api.Put("/change-password", fakultas.GantiPasswordAdminFakultas)

	api.Get("/ringkasan", fakultas.AmbilRingkasanPkkmb)
	api.Get("/peserta", fakultas.AmbilDaftarKelulusanMaba)

	// Agenda/Kegiatan
	api.Get("/kegiatan", fakultas.AmbilDaftarKegiatanPkkmb)

	// Materi
	api.Get("/materi", fakultas.AmbilDaftarMateriPkkmb)

	// Tugas
	api.Get("/tugas", fakultas.AmbilDaftarTugasPkkmb)

	// Kelulusan
	api.Get("/kelulusan/:id", fakultas.AmbilStatusKelulusanMahasiswa)

	// RBAC Prodi Roles (Managed by Faculty Admin)
	api.Get("/prodi-roles", fakultas.GetProdiRoles)
	api.Post("/prodi-roles", fakultas.CreateProdiRole)
	api.Put("/prodi-roles/:id", fakultas.UpdateProdiRole)
	api.Delete("/prodi-roles/:id", fakultas.DeleteProdiRole)

	// Prodi Admin Accounts (Managed by Faculty Admin)
	api.Get("/prodi-admins", fakultas.GetProdiAdmins)
	api.Post("/prodi-admins", fakultas.CreateProdiAdmin)
	api.Put("/prodi-admins/:id", fakultas.UpdateProdiAdmin)
	api.Delete("/prodi-admins/:id", fakultas.DeleteProdiAdmin)
}
