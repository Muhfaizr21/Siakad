package config

import (
	"log"
	"siakad-backend/models"

	"gorm.io/gorm"
)

func SeedThemeSettings(db *gorm.DB) {
	var count int64
	db.Model(&models.ThemeSettings{}).Count(&count)

	if count == 0 {
		log.Println("[Theme Seeder] Menyemai pengaturan tema default...")
		theme := models.ThemeSettings{
			// === PORTAL COLORS (Light theme untuk portal pages) ===
			PortalColorPrimary:    "#0D2B55",
			PortalColorSecondary:  "#C89B3C",
			PortalColorAccent:     "#E8B84B",
			PortalColorBackground: "#F9F6F0",
			PortalColorSurface:    "#FFFFFF",
			PortalColorTextPrimary: "#1B1C1C",
			PortalColorTextMuted:   "#64748B",
			PortalColorH1:          "#0D2B55",
			PortalColorH2:          "#0D2B55",
			PortalColorH3:          "#1E3A5F",
			PortalColorH4:          "#475569",

			// === LANDING COLORS (Dark theme untuk landing pages) ===
			LandingColorPrimary:    "#0D2B55",
			LandingColorSecondary:  "#C89B3C",
			LandingColorAccent:     "#E8B84B",
			LandingColorBackground: "#0D2B55",
			LandingColorSurface:    "#1B3A5C",
			LandingColorTextPrimary: "#FFFFFF",
			LandingColorTextMuted:   "#E2E8F0",
			LandingColorH1:          "#FFFFFF",
			LandingColorH2:          "#FFFFFF",
			LandingColorH3:          "#E2E8F0",
			LandingColorH4:          "#94A3B8",

			// === LEGACY (backward compatibility) ===
			ColorPrimary:   "#0D2B55",
			ColorSecondary: "#C89B3C",
			ColorAccent:    "#E8B84B",
			ColorBackground: "#F9F6F0",
			ColorSurface:   "#FFFFFF",
			ColorTextPrimary: "#1B1C1C",
			ColorTextMuted: "#64748B",
			ColorH1:        "#0D2B55",
			ColorH2:        "#0D2B55",
			ColorH3:        "#1E3A5F",
			ColorH4:        "#475569",

			// === FONTS ===
			FontHeadline: "Plus Jakarta Sans",
			FontBody:     "Inter",

			// === BRANDING ===
			SiteName: "Universitas Bhakti Kencana",

			// === SIDEBAR (Independent) ===
			SidebarBgColor:        "#0D2B55",
			SidebarTextColor:      "#E2E8F0",
			SidebarTextMutedColor: "#94A3B8",

			// === BUTTON ===
			ButtonRadius: "0.75rem",

			// === STATE COLORS ===
			ColorSuccess: "#16a34a",
			ColorWarning: "#d97706",
			ColorError:   "#dc2626",
			ColorInfo:    "#2563eb",

			// === BORDER ===
			ColorBorder:      "#E2E8F0",
			ColorBorderMuted: "#F1F5F9",
		}
		if err := db.Create(&theme).Error; err != nil {
			log.Println("[Theme Seeder] Error:", err)
		} else {
			log.Println("[Theme Seeder] Selesai menyemai tema default.")
		}
	}
}

// AddColumnSidebarMutedColor - Add sidebar_text_muted_color column if not exists
func AddColumnSidebarMutedColor(db *gorm.DB) {
	// Check if column exists
	var count int64
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.columns
		WHERE table_schema = 'public'
		AND table_name = 'theme_settings'
		AND column_name = 'sidebar_text_muted_color'
	`).Scan(&count)

	if count == 0 {
		log.Println("[Theme Migration] Adding sidebar_text_muted_color column...")
		db.Exec(`
			ALTER TABLE public.theme_settings
			ADD COLUMN sidebar_text_muted_color VARCHAR(9) DEFAULT '#94A3B8'
		`)
		log.Println("[Theme Migration] Column added successfully.")
	}
}