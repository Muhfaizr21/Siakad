package main

import (
	"encoding/json"
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
)

func main() {
	config.ConnectDB()
	var baseOrgs []models.Ormawa
	config.DB.Order("nama asc").Limit(1).Find(&baseOrgs)

	var orgs []struct {
		models.Ormawa
		JumlahAnggota int64 `json:"jumlah_anggota"`
	}

	for _, o := range baseOrgs {
		orgs = append(orgs, struct {
			models.Ormawa
			JumlahAnggota int64 `json:"jumlah_anggota"`
		}{o, 0})
	}

	b, _ := json.MarshalIndent(orgs, "", "  ")
	fmt.Println(string(b))
}
