package main

import (
	"encoding/json"
	"fmt"
	"time"
)

type BaseModel struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
}

type Ormawa struct {
	BaseModel
	Nama string `json:"nama"`
}

func main() {
	o := Ormawa{BaseModel: BaseModel{ID: 123}, Nama: "BEM"}
	var orgs []struct {
		Ormawa
		JumlahAnggota int64 `json:"jumlah_anggota"`
	}
	orgs = append(orgs, struct {
		Ormawa
		JumlahAnggota int64 `json:"jumlah_anggota"`
	}{o, 10})

	b, _ := json.Marshal(orgs)
	fmt.Println(string(b))
}
