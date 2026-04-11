package routes

import (
	fakultas "siakad-backend/controllers/fakultas"
	"siakad-backend/middleware"

	"github.com/gofiber/fiber/v2"
)

// InisialisasiRuteFakultas mendaftarkan rute administrator fakultas (English Path for Frontend Compatibility)
func InisialisasiRuteFakultas(aplikasi *fiber.App) {
	api := aplikasi.Group("/api/faculty", middleware.AuthProtected) // prefix kembali ke English sesuai frontend

	// Akademik & Dosen
	api.Get("/lecturers", fakultas.AmbilDaftarDosen)
	api.Get("/lecturers/:id", fakultas.AmbilDosenBerdasarID)
	// api.Post("/lecturers", fakultas.TambahDosenBaru)
	// api.Put("/lecturers/:id", fakultas.PerbaruiDataDosen)
	// api.Delete("/lecturers/:id", fakultas.HapusDataDosen)

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
	api.Delete("/achievements/:id", fakultas.HapusPrestasi)
	api.Delete("/prestasi/:id", fakultas.HapusPrestasi) // ALIAS

	api.Get("/letters", fakultas.AmbilDaftarSurat)
	api.Get("/surat", fakultas.AmbilDaftarSurat) // ALIAS
	api.Put("/letters/:id", fakultas.PerbaruiStatusSurat)
	api.Put("/surat/:id", fakultas.PerbaruiStatusSurat) // ALIAS
	api.Delete("/letters/:id", fakultas.HapusSurat)

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

	// Konten & Berita
	api.Get("/articles", fakultas.AmbilDaftarBerita)
	api.Get("/news", fakultas.AmbilDaftarBerita) // ALIAS
	api.Post("/articles", fakultas.TambahBeritaBaru)
	api.Post("/news", fakultas.TambahBeritaBaru) // ALIAS
	api.Put("/articles/:id", fakultas.PerbaruiBerita)
	api.Put("/news/:id", fakultas.PerbaruiBerita) // ALIAS
	api.Delete("/articles/:id", fakultas.HapusBerita)
	api.Delete("/news/:id", fakultas.HapusBerita) // ALIAS

	// Pendaftaran Mahasiswa Baru (PMB)
	api.Get("/admissions", fakultas.AmbilDaftarPendaftarMB)
	api.Put("/admissions/:id/status", fakultas.PerbaruiStatusPendaftarMB)

	// Organisasi & Proposal
	api.Get("/organizations", fakultas.AmbilDaftarOrganisasi)
	api.Get("/organizations-faculty", fakultas.AmbilDaftarOrganisasi) // ALIAS
	api.Post("/organizations", fakultas.TambahOrganisasi)
	api.Put("/organizations/:id", fakultas.PerbaruiOrganisasi)
	api.Delete("/organizations/:id", fakultas.HapusOrganisasi)

	api.Get("/ormawa/proposals", fakultas.AmbilDaftarProposalOrmawa)
	api.Put("/ormawa/proposals/:id", fakultas.ValidasiProposalOrmawa)

	api.Get("/internal/proposals", fakultas.AmbilDaftarProposalFakultas)
	api.Put("/internal/proposals/:id", fakultas.ValidasiProposalFakultas)

	api.Get("/counseling", fakultas.AmbilDaftarKonseling)
	api.Post("/counseling", fakultas.TambahSesiKonseling)
	api.Put("/counseling/:id", fakultas.UpdateSesiKonseling)
	api.Delete("/counseling/:id", fakultas.HapusSesiKonseling)

	// Layanan Kesehatan (Health Screening)
	api.Get("/health-screening", fakultas.AmbilDaftarKesehatan)
	api.Get("/health-screening/summary", fakultas.AmbilRingkasanKesehatan)
	api.Delete("/health-screening/:id", fakultas.HapusDataKesehatan)

	// Periode Akademik (Pengaturan)
	api.Get("/academic-periods", fakultas.AmbilPengaturanAkademik)
	api.Post("/academic-periods", fakultas.SimpanPengaturanAkademik)
	api.Put("/academic-periods", fakultas.SimpanPengaturanAkademik) // ALIAS

    // Akun & Profil (Baru) - Terpisah dari Mahasiswa
    api.Get("/profile", fakultas.AmbilProfilAdminFakultas)
    api.Put("/profile", fakultas.PerbaruiProfilAdminFakultas)
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
}
