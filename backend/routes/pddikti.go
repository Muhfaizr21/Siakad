package routes

import (
	"siakad-backend/controllers/pddikti"
	"github.com/gofiber/fiber/v2"
)

// SetupPddiktiRoutes mendaftarkan rute untuk proxy PDDIKTI
func SetupPddiktiRoutes(group fiber.Router) {
	group.Get("/proxy", pddikti.PddiktiProxy)
}
