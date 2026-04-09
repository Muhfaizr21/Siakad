package routes

import (
	"siakad-backend/controllers"

	"github.com/gofiber/fiber/v2"
)

// InisialisasiRuteFakultas mendaftarkan rute administrator fakultas (English Path for Frontend Compatibility)
func InisialisasiRuteFakultas(aplikasi *fiber.App) {
	api := aplikasi.Group("/api/faculty") // prefix kembali ke English sesuai frontend

	// Akademik & Dosen
	api.Get("/lecturers", controllers.AmbilDaftarDosen)
	api.Get("/lecturers/:id", controllers.AmbilDosenBerdasarID)
	api.Post("/lecturers", controllers.TambahDosenBaru)
	api.Put("/lecturers/:id", controllers.PerbaruiDataDosen)
	api.Delete("/lecturers/:id", controllers.HapusDataDosen)

	// Mahasiswa
	api.Get("/students", controllers.AmbilDaftarMahasiswa)
	api.Get("/students/:id", controllers.AmbilMahasiswaBerdasarID)
	api.Post("/students", controllers.TambahMahasiswaBaru)
	api.Put("/students/:id", controllers.PerbaruiDataMahasiswa)
	api.Delete("/students/:id", controllers.HapusDataMahasiswa)

	// Struktur Organisasi (Fakultas & Prodi/Majors)
	api.Get("/faculties", controllers.AmbilDaftarFakultas)
	api.Get("/majors", controllers.AmbilDaftarProdi)
	api.Post("/majors", controllers.TambahProdiBaru)
	api.Put("/majors/:id", controllers.PerbaruiProdi)
	api.Delete("/majors/:id", controllers.HapusProdi)

	// Matakuliah & Jadwal
	api.Get("/courses", controllers.AmbilDaftarProdi) // ALIAS: Frontend Mahasiswa.jsx calls this for majors

	// Dashboard & Ringkasan
	api.Get("/summary", controllers.AmbilRingkasanDashboard)
	api.Get("/reports/summary", controllers.AmbilRingkasanLaporan)

	// Pelayanan Mahasiswa (Aspirasi, Prestasi, Surat)
	api.Get("/aspirations", controllers.AmbilDaftarAspirasi)
	api.Get("/aspirasi", controllers.AmbilDaftarAspirasi) // ALIAS
	api.Put("/aspirations/:id", controllers.TanggapiAspirasi)
	api.Put("/aspirasi/:id", controllers.TanggapiAspirasi) // ALIAS
	api.Delete("/aspirations/:id", controllers.HapusAspirasi)

	api.Get("/achievements", controllers.AmbilDaftarPrestasi)
	api.Get("/prestasi", controllers.AmbilDaftarPrestasi) // ALIAS
	api.Put("/achievements/:id/verify", controllers.VerifikasiPrestasi)
	api.Put("/prestasi/:id/verify", controllers.VerifikasiPrestasi) // ALIAS
	api.Put("/prestasi/:id", controllers.VerifikasiPrestasi)        // ALIAS
	api.Delete("/achievements/:id", controllers.HapusPrestasi)
	api.Delete("/prestasi/:id", controllers.HapusPrestasi) // ALIAS

	api.Get("/letters", controllers.AmbilDaftarSurat)
	api.Get("/surat", controllers.AmbilDaftarSurat) // ALIAS
	api.Put("/letters/:id", controllers.PerbaruiStatusSurat)
	api.Put("/surat/:id", controllers.PerbaruiStatusSurat) // ALIAS
	api.Delete("/letters/:id", controllers.HapusSurat)

	// MBKM & Beasiswa
	api.Get("/mbkm", controllers.AmbilDaftarMBKM)
	api.Put("/mbkm/:id", controllers.PerbaruiStatusMBKM)
	api.Delete("/mbkm/:id", controllers.HapusMBKM)

	api.Get("/scholarships", controllers.AmbilDaftarBeasiswa)
	api.Post("/scholarships", controllers.TambahBeasiswa)
	api.Put("/scholarships/:id", controllers.PerbaruiBeasiswa)
	api.Delete("/scholarships/:id", controllers.HapusBeasiswa)
	api.Get("/scholarships/applications", controllers.AmbilPendaftarBeasiswa)
	api.Put("/scholarships/applications/:id", controllers.VerifikasiBeasiswa)
	api.Delete("/scholarships/applications/:id", controllers.HapusPendaftarBeasiswa)

	// Konten & Berita
	api.Get("/articles", controllers.AmbilDaftarBerita)
	api.Get("/news", controllers.AmbilDaftarBerita) // ALIAS
	api.Post("/articles", controllers.TambahBeritaBaru)
	api.Post("/news", controllers.TambahBeritaBaru) // ALIAS
	api.Put("/articles/:id", controllers.PerbaruiBerita)
	api.Put("/news/:id", controllers.PerbaruiBerita) // ALIAS
	api.Delete("/articles/:id", controllers.HapusBerita)
	api.Delete("/news/:id", controllers.HapusBerita) // ALIAS

	// Pendaftaran Mahasiswa Baru (PMB)
	api.Get("/admissions", controllers.AmbilDaftarPendaftarMB)
	api.Put("/admissions/:id/status", controllers.PerbaruiStatusPendaftarMB)

	// Organisasi & Proposal
	api.Get("/organizations", controllers.AmbilDaftarOrganisasi)
	api.Get("/organizations-faculty", controllers.AmbilDaftarOrganisasi) // ALIAS
	api.Post("/organizations", controllers.TambahOrganisasi)
	api.Put("/organizations/:id", controllers.PerbaruiOrganisasi)
	api.Delete("/organizations/:id", controllers.HapusOrganisasi)

	api.Get("/ormawa/proposals", controllers.AmbilDaftarProposalOrmawa)
	api.Put("/ormawa/proposals/:id", controllers.ValidasiProposalOrmawa)

	api.Get("/internal/proposals", controllers.AmbilDaftarProposalFakultas)
	api.Put("/internal/proposals/:id", controllers.ValidasiProposalFakultas)

	api.Get("/counseling", controllers.AmbilDaftarKonseling)
	api.Post("/counseling", controllers.TambahSesiKonseling)
	api.Put("/counseling/:id", controllers.UpdateSesiKonseling)
	api.Delete("/counseling/:id", controllers.HapusSesiKonseling)

	// Layanan Kesehatan (Health Screening)
	api.Get("/health-screening", controllers.AmbilDaftarKesehatan)
	api.Get("/health-screening/summary", controllers.AmbilRingkasanKesehatan)
	api.Delete("/health-screening/:id", controllers.HapusDataKesehatan)

	// Periode Akademik (Pengaturan)
	api.Get("/academic-periods", controllers.AmbilPengaturanAkademik)
	api.Post("/academic-periods", controllers.SimpanPengaturanAkademik)
	api.Put("/academic-periods", controllers.SimpanPengaturanAkademik) // ALIAS
}
