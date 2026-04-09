package routes

import (
	fakultas "siakad-backend/controllers/fakultas"
	"github.com/gofiber/fiber/v2"
)

func InisialisasiRutePkkmb(aplikasi *fiber.App) {
	pkkmb := aplikasi.Group("/api/pkkmb")

	// Monitoring & Ringkasan
	pkkmb.Get("/ringkasan", fakultas.AmbilRingkasanPkkmb)
	pkkmb.Get("/peserta", fakultas.AmbilDaftarKelulusanMaba)

	// Agenda/Kegiatan
	pkkmb.Get("/kegiatan", fakultas.AmbilDaftarKegiatanPkkmb)
	pkkmb.Post("/kegiatan", fakultas.TambahKegiatanPkkmb)
	// pkkmb.Put("/kegiatan/:id", fakultas.UpdateKegiatanPkkmb)
	// pkkmb.Delete("/kegiatan/:id", fakultas.HapusKegiatanPkkmb)

	// Materi
	pkkmb.Get("/materi", fakultas.AmbilDaftarMateriPkkmb)

	// Tugas
	pkkmb.Get("/tugas", fakultas.AmbilDaftarTugasPkkmb)

	// Kelulusan
	pkkmb.Get("/kelulusan/:id", fakultas.AmbilStatusKelulusanMahasiswa)
}
