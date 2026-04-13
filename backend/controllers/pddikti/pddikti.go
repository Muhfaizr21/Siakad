package pddikti

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"siakad-backend/config"
	"siakad-backend/models"
	"strings"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type PddiktiMhs struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Nim       string `json:"nim"`
	NamaProdi string `json:"nama_prodi"`
	NamaPT    string `json:"nama_pt"`
}

type PddiktiDosen struct {
	ID        string `json:"id"`
	Nama      string `json:"nama"`
	Nidn      string `json:"nidn"`
	NamaProdi string `json:"nama_prodi"`
}

type PddiktiProdi struct {
	ID      string `json:"id"`
	Nama    string `json:"nama"`
	Jenjang string `json:"jenjang"`
}

type PddiktiAllResponse struct {
	Mahasiswa []PddiktiMhs   `json:"mahasiswa"`
	Dosen     []PddiktiDosen `json:"dosen"`
	Prodi     []PddiktiProdi `json:"prodi"`
}

// PddiktiProxy handles proxying requests to the official PDDIKTI API and auto-syncing to DB
func PddiktiProxy(c *fiber.Ctx) error {
	keyword := c.Query("keyword", "Universitas Bhakti Kencana")
	searchType := c.Query("type", "all")
	sync := c.Query("sync", "true")

	role, _ := c.Locals("role").(string)
	fid, _ := c.Locals("fakultas_id").(uint)

	// Bypass the external API's 100-result limit by appending faculty-specific keywords
	// so it returns 100 results strictly for this faculty instead of the whole university.
	if role == "faculty_admin" && fid != 0 {
		var faculty models.Fakultas
		if err := config.DB.First(&faculty, fid).Error; err == nil {
			fName := strings.ToLower(faculty.Nama)
			if strings.Contains(fName, "farmasi") {
				keyword = "Bhakti Kencana Farmasi"
			} else if strings.Contains(fName, "keperawatan") {
				keyword = "Bhakti Kencana Keperawatan"
			} else if strings.Contains(fName, "kesehatan") {
				keyword = "Bhakti Kencana Kesehatan"
			} else if strings.Contains(fName, "sosial") {
				keyword = "Bhakti Kencana Sosial Psikologi Komunikasi"
			}
		}
	}

	baseURL := "https://api-pddikti.kemdiktisaintek.go.id"
	var apiPath string
	switch searchType {
	case "mhs":
		apiPath = "pencarian/mhs"
	case "dosen":
		apiPath = "pencarian/dosen"
	case "prodi":
		apiPath = "pencarian/prodi"
	default:
		apiPath = "pencarian/all"
	}

	fullURL := fmt.Sprintf("%s/%s/%s", baseURL, apiPath, url.PathEscape(keyword))

	req, _ := http.NewRequest("GET", fullURL, nil)
	req.Header.Set("Origin", "https://pddikti.kemdiktisaintek.go.id")
	req.Header.Set("Referer", "https://pddikti.kemdiktisaintek.go.id/")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result PddiktiAllResponse

	// Unmarshal
	if searchType == "all" {
		var all PddiktiAllResponse
		json.Unmarshal(body, &all)
		result.Mahasiswa = all.Mahasiswa
		result.Dosen = all.Dosen
		result.Prodi = all.Prodi
	} else if searchType == "mhs" {
		json.Unmarshal(body, &result.Mahasiswa)
	} else if searchType == "dosen" {
		json.Unmarshal(body, &result.Dosen)
	} else if searchType == "prodi" {
		json.Unmarshal(body, &result.Prodi)
	}

	// 6. Post-process: Filter by Faculty if not Super Admin
	if role == "faculty_admin" && fid != 0 {
		var faculty models.Fakultas
		config.DB.First(&faculty, fid)

		filterKeywords := []string{}
		fName := strings.ToLower(faculty.Nama)
		if strings.Contains(fName, "farmasi") {
			filterKeywords = []string{"farmasi", "apoteker"}
		} else if strings.Contains(fName, "keperawatan") {
			filterKeywords = []string{"keperawatan", "ners"}
		} else if strings.Contains(fName, "kesehatan") {
			filterKeywords = []string{"kebidanan", "bidan", "masyarakat", "anestesi", "gizi"}
		} else if strings.Contains(fName, "sosial") {
			filterKeywords = []string{"komunikasi", "psikologi", "sosial"}
		}

		if len(filterKeywords) > 0 {
			var filteredMhs []PddiktiMhs
			var filteredDosen []PddiktiDosen
			var filteredProdi []PddiktiProdi

			for _, m := range result.Mahasiswa {
				for _, k := range filterKeywords {
					if strings.Contains(strings.ToLower(m.NamaProdi), k) {
						filteredMhs = append(filteredMhs, m)
						break
					}
				}
			}
			for _, d := range result.Dosen {
				for _, k := range filterKeywords {
					if strings.Contains(strings.ToLower(d.NamaProdi), k) {
						filteredDosen = append(filteredDosen, d)
						break
					}
				}
			}
			for _, p := range result.Prodi {
				for _, k := range filterKeywords {
					if strings.Contains(strings.ToLower(p.Nama), k) {
						filteredProdi = append(filteredProdi, p)
						break
					}
				}
			}
			result.Mahasiswa = filteredMhs
			result.Dosen = filteredDosen
			result.Prodi = filteredProdi
		} else {
			// No matching faculty keywords — return empty to be safe
			result.Mahasiswa = []PddiktiMhs{}
			result.Dosen = []PddiktiDosen{}
			result.Prodi = []PddiktiProdi{}
		}
	}

	// 7. Auto-Sync with Filtered Data
	if sync == "true" {
		go performSync(fid, result.Mahasiswa, result.Dosen, result.Prodi)
	}

	// ✅ Return FILTERED result (not raw body!) to frontend
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   result,
	})
}

func performSync(fid uint, mhs []PddiktiMhs, dosen []PddiktiDosen, prodi []PddiktiProdi) {
	fmt.Printf("🔄 [PDDIKTI-SYNC] Processing sync for Faculty ID %d...\n", fid)

	// 1. Sync Prodi First (Avoid duplicates via Name)
	prodiMap := make(map[string]uint)
	for _, p := range prodi {
		var item models.ProgramStudi
		// Try to find existing first
		config.DB.Where("nama = ?", p.Nama).First(&item)

		if item.ID == 0 {
			// Generate a simple code if not exists
			kode := ""
			parts := strings.Split(p.Nama, " ")
			for _, part := range parts {
				if len(part) > 0 {
					kode += string(part[0])
				}
			}
			item = models.ProgramStudi{
				Nama: p.Nama, Jenjang: p.Jenjang, FakultasID: fid, Kode: kode + "-" + p.Jenjang,
			}
			config.DB.Create(&item)
		} else {
			// If exists, ensure it's linked to a faculty (if fid is provided)
			if item.FakultasID == 0 && fid != 0 {
				config.DB.Model(&item).Update("fakultas_id", fid)
			}
		}
		prodiMap[p.Nama] = item.ID
	}

	// 2. Sync Dosen (Global Check via NIDN)
	for _, d := range dosen {
		if d.Nidn == "" {
			continue
		}

		var existing models.Dosen
		config.DB.Where("n_id_n = ?", d.Nidn).First(&existing)

		if existing.ID == 0 {
			// Create Account if not exists
			email := strings.ToLower(fmt.Sprintf("%s@dosen.bku.ac.id", d.Nidn))
			var user models.User
			config.DB.Where("email = ?", email).First(&user)

			if user.ID == 0 {
				hash, _ := bcrypt.GenerateFromPassword([]byte("dosen123"), bcrypt.DefaultCost)
				user = models.User{
					Email: email, Password: string(hash), Role: "dosen", FakultasID: &fid,
				}
				config.DB.Create(&user)
			}

			// Find appropriate Prodi ID
			// Ensure Prodi ID exists or create it
			cleanProdiName := strings.TrimSpace(d.NamaProdi)
			pid := prodiMap[cleanProdiName]
			if pid == 0 {
				var p models.ProgramStudi
				if err := config.DB.Where("LOWER(nama) = LOWER(?)", cleanProdiName).First(&p).Error; err != nil {
					// Auto-create missing prodi
					p = models.ProgramStudi{Nama: cleanProdiName, FakultasID: fid, Kode: "SYNC-" + d.Nidn[:3]}
					config.DB.Create(&p)
				}
				pid = p.ID
			}

			newDosen := models.Dosen{
				Nama: d.Nama, NIDN: d.Nidn, PenggunaID: user.ID, FakultasID: fid, ProgramStudiID: pid,
			}
			config.DB.Create(&newDosen)
		}
	}

	// 3. Sync Mahasiswa (Global Check via NIM)
	for _, m := range mhs {
		if m.Nim == "" {
			continue
		}

		var existing models.Mahasiswa
		config.DB.Where("nim = ?", m.Nim).First(&existing)

		if existing.ID == 0 {
			email := strings.ToLower(fmt.Sprintf("%s@student.bku.ac.id", m.Nim))
			var user models.User
			config.DB.Where("email = ?", email).First(&user)

			if user.ID == 0 {
				hash, _ := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
				user = models.User{
					Email: email, Password: string(hash), Role: "student", FakultasID: &fid,
				}
				config.DB.Create(&user)
			}

			// Ensure Prodi ID exists or create it
			cleanProdiName := strings.TrimSpace(m.NamaProdi)
			pid := prodiMap[cleanProdiName]
			if pid == 0 {
				var p models.ProgramStudi
				if err := config.DB.Where("LOWER(nama) = LOWER(?)", cleanProdiName).First(&p).Error; err != nil {
					p = models.ProgramStudi{Nama: cleanProdiName, FakultasID: fid, Kode: "SYNC-" + m.Nim[:3]}
					config.DB.Create(&p)
				}
				pid = p.ID
			}

			newMhs := models.Mahasiswa{
				Nama: m.Nama, NIM: m.Nim, PenggunaID: user.ID, FakultasID: fid,
				ProgramStudiID: pid, SemesterSekarang: 1, StatusAkun: "Aktif",
			}
			config.DB.Create(&newMhs)
		}
	}

	fmt.Printf("✅ [PDDIKTI-SYNC] Sync finished for Faculty ID %d\n", fid)
}
