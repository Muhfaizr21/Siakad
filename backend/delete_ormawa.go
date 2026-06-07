package main

import (
	"fmt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "host=127.0.0.1 user=postgres password=postgres dbname=siakad port=5432 sslmode=disable TimeZone=Asia/Jakarta"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Delete all Ormawa EXCEPT id 1 (which is BEM KBM Bhakti Kencana)
	res := db.Exec("DELETE FROM ormawa.ormawa WHERE id > 1")
	if res.Error != nil {
		fmt.Println("Error deleting:", res.Error)
	} else {
		fmt.Printf("Deleted %d rows from ormawa.ormawa\n", res.RowsAffected)
	}
}
