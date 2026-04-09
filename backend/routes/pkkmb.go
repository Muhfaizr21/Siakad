package routes

import (
	"siakad-backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func InisialisasiRutePkkmb(aplikasi *fiber.App) {
	pkkmb := aplikasi.Group("/api/pkkmb")

	// Monitoring & Ringkasan
	pkkmb.Get("/ringkasan", controllers.AmbilRingkasanPkkmb)
	pkkmb.Get("/peserta", controllers.AmbilDaftarKelulusanMaba)

	// Agenda/Kegiatan
	pkkmb.Get("/kegiatan", controllers.AmbilDaftarKegiatanPkkmb)
	pkkmb.Post("/kegiatan", controllers.TambahKegiatanPkkmb)
	// pkkmb.Put("/kegiatan/:id", controllers.UpdateKegiatanPkkmb)
	// pkkmb.Delete("/kegiatan/:id", controllers.HapusKegiatanPkkmb)

	// Materi
	pkkmb.Get("/materi", controllers.AmbilDaftarMateriPkkmb)

	// Tugas
	pkkmb.Get("/tugas", controllers.AmbilDaftarTugasPkkmb)

	// Kelulusan
	pkkmb.Get("/kelulusan/:id", controllers.AmbilStatusKelulusanMahasiswa)
}
