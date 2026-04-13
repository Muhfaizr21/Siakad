package pddikti

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type PDDiktiStudent struct {
	Nama            string `json:"nama"`
	NIM             string `json:"nim"`
	NamaPT          string `json:"nama_pt"`
	NamaProdi       string `json:"nama_prodi"`
	JenisKelamin    string `json:"jenis_kelamin"`
	TanggalLahir    string `json:"tanggal_lahir"`
	TempatLahir     string `json:"tempat_lahir"`
	StatusMahasiswa  string `json:"status_mahasiswa"`
	Semester        int    `json:"semester"`
	TahunMasuk      int    `json:"tahun_masuk"`
}

type SearchResult struct {
	Mahasiswa []struct {
		Text string `json:"text"`
		ID   string `json:"id"`
	} `json:"mahasiswa"`
}

func GetStudentDetailByNIM(nim string) (*PDDiktiStudent, error) {
	// 1. Search for student by NIM
	searchURL := fmt.Sprintf("https://api-frontend.kemdikbud.go.id/hit_mhs/%s", url.PathEscape(nim))
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(searchURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("PDDikti Search API returned status %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var searchRes SearchResult
	if err := json.Unmarshal(body, &searchRes); err != nil {
		return nil, err
	}

	if len(searchRes.Mahasiswa) == 0 {
		return nil, fmt.Errorf("student not found in PDDikti")
	}

	// 2. Get Detail for the first match (usually exact NIM match)
	// Example ID format: "mahasiswa/D1A120001/..." -> we need the second part (id_reg_pd) 
	// The unofficial API uses a specific ID from the search result.
	// But actually, we can parse the "text" to confirm it matches our target if needed.
	
	targetID := searchRes.Mahasiswa[0].ID
	detailURL := fmt.Sprintf("https://api-frontend.kemdikbud.go.id/detail_mhs/%s", targetID)
	
	respDetail, err := client.Get(detailURL)
	if err != nil {
		return nil, err
	}
	defer respDetail.Body.Close()

	if respDetail.StatusCode != 200 {
		return nil, fmt.Errorf("PDDikti Detail API returned status %d", respDetail.StatusCode)
	}

	detailBody, _ := io.ReadAll(respDetail.Body)
	
	// The detail API returns a JSON that we need to map to our struct
	// Note: The actual PDDikti response is quite complex, we map what we need.
	var detail map[string]interface{}
	json.Unmarshal(detailBody, &detail)

	// Extracting fields from PDDikti's nested structure
	// Usually it's in dataumum
	dataUmum, ok := detail["dataumum"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid response structure from PDDikti")
	}

	student := &PDDiktiStudent{
		Nama:    fmt.Sprintf("%v", dataUmum["nm_pd"]),
		NIM:     fmt.Sprintf("%v", dataUmum["nipd"]),
		NamaPT:  fmt.Sprintf("%v", dataUmum["namapt"]),
		NamaProdi: fmt.Sprintf("%v", dataUmum["namaprodi"]),
		JenisKelamin: fmt.Sprintf("%v", dataUmum["jk"]),
	}

	return student, nil
}
